
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  WASocket,
  Browsers,
  WAMessage
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import command system
import './commands/general';
import './commands/ai';
import './commands/media';
import './commands/fun';
import './commands/settings';
import { findCommand } from './commands';
import { getSettings } from './utils/settings';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SessionData {
  socket: WASocket | null;
  status: 'pending' | 'connecting' | 'connected' | 'disconnected';
  phoneNumber: string;
  pairingCode?: string;
  createdAt: Date;
  lastActive: Date;
}

interface SessionMetadata {
  sessionId: string;
  phoneNumber: string;
  createdAt: string;
}

export class SessionManager {
  private sessions: Map<string, SessionData> = new Map();
  private authDir: string;

  constructor() {
    this.authDir = path.join(process.cwd(), 'auth');
    if (!fs.existsSync(this.authDir)) {
      fs.mkdirSync(this.authDir, { recursive: true });
    }
    
    this.hydrateExistingSessions();
  }

  private saveSessionMetadata(sessionId: string, phoneNumber: string) {
    const metadataPath = path.join(this.authDir, sessionId, 'metadata.json');
    const metadata: SessionMetadata = {
      sessionId,
      phoneNumber,
      createdAt: new Date().toISOString()
    };
    
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  }

  private loadSessionMetadata(sessionId: string): SessionMetadata | null {
    const metadataPath = path.join(this.authDir, sessionId, 'metadata.json');
    
    if (fs.existsSync(metadataPath)) {
      try {
        const data = fs.readFileSync(metadataPath, 'utf-8');
        return JSON.parse(data);
      } catch (error) {
        console.error(`Error loading metadata for ${sessionId}:`, error);
      }
    }
    
    const sessionIdMatch = sessionId.match(/^session-(\d+)/);
    if (sessionIdMatch) {
      return {
        sessionId,
        phoneNumber: sessionIdMatch[1],
        createdAt: new Date().toISOString()
      };
    }
    
    return null;
  }

  private async hydrateExistingSessions() {
    console.log('🔄 Hydrating existing sessions from auth directory...');
    
    try {
      const sessionDirs = fs.readdirSync(this.authDir);
      let hydratedCount = 0;
      
      for (const sessionDir of sessionDirs) {
        if (!sessionDir.startsWith('session-')) continue;
        
        const sessionAuthPath = path.join(this.authDir, sessionDir);
        const credsPath = path.join(sessionAuthPath, 'creds.json');
        
        if (fs.existsSync(credsPath)) {
          const metadata = this.loadSessionMetadata(sessionDir);
          
          if (metadata) {
            console.log(`📱 Found existing session: ${sessionDir} for +${metadata.phoneNumber}`);
            
            try {
              await this.reconnectSession(sessionDir, metadata.phoneNumber);
              hydratedCount++;
            } catch (error) {
              console.error(`Failed to hydrate session ${sessionDir}:`, error);
            }
          }
        }
      }
      
      console.log(`✅ Hydrated ${hydratedCount} existing session(s)`);
    } catch (error) {
      console.error('Error hydrating sessions:', error);
    }
  }

  async createSession(phoneNumber: string) {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const sessionId = `session-${cleanNumber}`;
    const sessionAuthPath = path.join(this.authDir, sessionId);

    const existingSession = this.sessions.get(sessionId);
    if (existingSession && existingSession.status === 'connected') {
      console.log(`Session ${sessionId} is already connected`);
      return {
        sessionId,
        phoneNumber: cleanNumber,
        status: 'connected'
      };
    }

    if (fs.existsSync(sessionAuthPath)) {
      console.log(`Removing old session files for ${cleanNumber}`);
      fs.rmSync(sessionAuthPath, { recursive: true, force: true });
    }

    fs.mkdirSync(sessionAuthPath, { recursive: true });
    this.saveSessionMetadata(sessionId, cleanNumber);

    const { state, saveCreds } = await useMultiFileAuthState(sessionAuthPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
      },
      browser: Browsers.ubuntu('Chrome'),
      generateHighQualityLinkPreview: true,
      syncFullHistory: false,
      markOnlineOnConnect: false,
      getMessage: async () => undefined
    });

    this.sessions.set(sessionId, {
      socket: sock,
      status: 'pending',
      phoneNumber: cleanNumber,
      createdAt: new Date(),
      lastActive: new Date()
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      await this.handleConnectionUpdate(sessionId, update);
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
      await this.handleMessages(sessionId, messages);
    });

    let pairingCode: string | undefined;

    try {
      // Wait for socket to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (!sock.authState.creds.registered) {
        console.log(`🔐 Requesting pairing code for: +${cleanNumber}`);
        
        const code = await sock.requestPairingCode(cleanNumber);
        
        if (!code) {
          throw new Error('Failed to generate pairing code');
        }
        
        pairingCode = code.match(/.{1,4}/g)?.join('-') || code;
        
        const session = this.sessions.get(sessionId);
        if (session) {
          session.pairingCode = pairingCode;
          session.status = 'pending';
        }
        
        console.log(`✅ Pairing code generated: ${pairingCode}`);
        console.log(`📱 Enter this code in WhatsApp to link device`);
        console.log(`⏳ Waiting for authentication (session will stay alive for 2 minutes)...`);
        
        // Keep session alive for 2 minutes to allow pairing
        setTimeout(() => {
          const currentSession = this.sessions.get(sessionId);
          if (currentSession && currentSession.status === 'pending') {
            console.log(`⚠️ Pairing timeout for ${sessionId} - code not entered in time`);
          }
        }, 120000);
        
      } else {
        console.log(`Device already registered for ${cleanNumber}`);
        pairingCode = 'ALREADY-REGISTERED';
      }
    } catch (error) {
      console.error('❌ Pairing code generation failed:', error);
      
      this.sessions.delete(sessionId);
      if (fs.existsSync(sessionAuthPath)) {
        fs.rmSync(sessionAuthPath, { recursive: true, force: true });
      }
      
      throw new Error(`Failed to generate pairing code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      sessionId,
      phoneNumber: cleanNumber,
      pairingCode,
      status: 'pending'
    };
  }

  private async reconnectSession(sessionId: string, phoneNumber: string) {
    console.log(`🔄 Reconnecting session: ${sessionId}`);
    
    const sessionAuthPath = path.join(this.authDir, sessionId);

    if (!fs.existsSync(sessionAuthPath)) {
      throw new Error(`Session directory not found: ${sessionId}`);
    }

    try {
      const { state, saveCreds } = await useMultiFileAuthState(sessionAuthPath);
      const { version } = await fetchLatestBaileysVersion();

      const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        },
        browser: Browsers.ubuntu('Chrome'),
        generateHighQualityLinkPreview: true,
        markOnlineOnConnect: false,
        getMessage: async () => undefined
      });

      const existingSession = this.sessions.get(sessionId);
      
      this.sessions.set(sessionId, {
        socket: sock,
        status: 'connecting',
        phoneNumber,
        createdAt: existingSession?.createdAt || new Date(),
        lastActive: new Date()
      });

      sock.ev.on('creds.update', saveCreds);

      sock.ev.on('connection.update', async (update) => {
        await this.handleConnectionUpdate(sessionId, update);
      });

      sock.ev.on('messages.upsert', async ({ messages }) => {
        await this.handleMessages(sessionId, messages);
      });

      return {
        sessionId,
        phoneNumber,
        status: 'connecting'
      };
    } catch (error) {
      console.error(`Error reconnecting session ${sessionId}:`, error);
      throw error;
    }
  }

  private async handleConnectionUpdate(sessionId: string, update: any) {
    const { connection, lastDisconnect } = update;
    const session = this.sessions.get(sessionId);

    if (!session) return;

    console.log(`[${sessionId}] Status: ${connection || 'updating'}`);

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      // Handle pairing state - don't close immediately
      if (session.status === 'pending' && session.pairingCode) {
        console.log(`[${sessionId}] Socket closed during pairing - this is normal, waiting for reconnection...`);
        
        // Reconnect automatically after 3 seconds to check for pairing completion
        setTimeout(async () => {
          const currentSession = this.sessions.get(sessionId);
          if (currentSession && currentSession.status === 'pending') {
            console.log(`[${sessionId}] Attempting reconnection to check pairing status...`);
            try {
              await this.reconnectSession(sessionId, session.phoneNumber);
            } catch (error) {
              console.error(`Failed to reconnect ${sessionId}:`, error);
            }
          }
        }, 3000);
        return;
      }

      if (statusCode === DisconnectReason.loggedOut) {
        console.log(`[${sessionId}] ❌ Logged out, cleaning up session`);
        session.status = 'disconnected';
        session.socket = null;
        
        const sessionAuthPath = path.join(this.authDir, sessionId);
        if (fs.existsSync(sessionAuthPath)) {
          fs.rmSync(sessionAuthPath, { recursive: true, force: true });
        }
      } else if (shouldReconnect) {
        console.log(`[${sessionId}] Reconnecting in 5 seconds...`);
        session.status = 'connecting';
        
        setTimeout(async () => {
          try {
            await this.reconnectSession(sessionId, session.phoneNumber);
          } catch (error) {
            console.error(`Failed to reconnect ${sessionId}:`, error);
            session.status = 'disconnected';
          }
        }, 5000);
      } else {
        session.status = 'disconnected';
        session.socket = null;
      }
    } else if (connection === 'open') {
      console.log(`✅ [${sessionId}] Connected successfully! Phone: +${session.phoneNumber}`);
      session.status = 'connected';
      session.lastActive = new Date();
      
      if (session.pairingCode) {
        console.log(`🎉 Pairing successful for +${session.phoneNumber}!`);
        delete session.pairingCode;
      }
      
      // Send welcome message and auto-follow newsletter
      setTimeout(async () => {
        try {
          const userJid = `${session.phoneNumber}@s.whatsapp.net`;
          const settings = await getSettings(userJid);
          
          // Auto-follow newsletter if enabled
          if (settings.autoFollow && settings.newsletterJid) {
            try {
              await session.socket?.newsletterFollow(settings.newsletterJid);
              console.log(`📢 Auto-followed newsletter for ${session.phoneNumber}`);
            } catch (error) {
              console.error(`Failed to follow newsletter:`, error);
            }
          }
          
          await session.socket?.sendMessage(userJid, {
            text: `🎉 *Connection Successful!*\n\n✅ Your WhatsApp bot is now connected and active!\n\n📱 Phone: +${session.phoneNumber}\n🆔 Session: ${sessionId}\n\n💡 Type *${settings.prefix}menu* to see all available commands.\n📢 Newsletter: Auto-followed GodsZeal Updates\n\n🤖 Your bot is ready to use!`
          });
          console.log(`📨 Sent welcome message to +${session.phoneNumber}`);
        } catch (error) {
          console.error(`Failed to send welcome message:`, error);
        }
      }, 2000);
      
    } else if (connection === 'connecting') {
      if (session.status !== 'pending') {
        session.status = 'connecting';
      }
    }
  }

  private async handleMessages(sessionId: string, messages: WAMessage[]) {
    const session = this.sessions.get(sessionId);
    if (!session || !session.socket) return;

    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text = msg.message.conversation || 
                 msg.message.extendedTextMessage?.text || 
                 msg.message.imageMessage?.caption ||
                 msg.message.videoMessage?.caption || '';
    
    console.log(`[${sessionId}] Message from ${msg.key.remoteJid}: ${text}`);

    try {
      // Get user settings for prefix
      const settings = await getSettings(msg.key.remoteJid!);
      
      // Find and execute command
      const commandData = findCommand(text, settings.prefix);
      
      if (commandData) {
        console.log(`[${sessionId}] Executing command: ${commandData.command.name}`);
        await commandData.command.execute(session.socket, msg, commandData.args, settings.prefix);
      }
    } catch (error) {
      console.error(`Error handling message for ${sessionId}:`, error);
      
      try {
        await session.socket.sendMessage(msg.key.remoteJid!, {
          text: '❌ An error occurred while processing your command.'
        }, {
          quoted: msg
        });
      } catch (sendError) {
        console.error(`Failed to send error message:`, sendError);
      }
    }

    session.lastActive = new Date();
  }

  async getSessions() {
    const sessions: any[] = [];

    this.sessions.forEach((session, sessionId) => {
      sessions.push({
        id: sessionId,
        sessionId,
        phoneNumber: session.phoneNumber,
        status: session.status,
        createdAt: session.createdAt.toISOString(),
        lastActive: session.lastActive.toISOString()
      });
    });

    return sessions;
  }

  async deleteSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    
    if (session?.socket) {
      session.socket.end(undefined);
    }

    const sessionAuthPath = path.join(this.authDir, sessionId);
    if (fs.existsSync(sessionAuthPath)) {
      fs.rmSync(sessionAuthPath, { recursive: true, force: true });
    }

    this.sessions.delete(sessionId);
    console.log(`Session ${sessionId} deleted`);
  }

  async cleanup() {
    console.log('Cleaning up all sessions...');
    
    for (const [sessionId, session] of this.sessions) {
      if (session.socket) {
        session.socket.end(undefined);
      }
    }

    this.sessions.clear();
    console.log('All sessions cleaned up');
  }
}
