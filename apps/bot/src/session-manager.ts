import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  WASocket
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

    // If session exists and is already connected, return it
    const existingSession = this.sessions.get(sessionId);
    if (existingSession && existingSession.status === 'connected') {
      console.log(`Session ${sessionId} is already connected`);
      return {
        sessionId,
        phoneNumber: cleanNumber,
        status: 'connected'
      };
    }

    // Delete old session files if they exist but are logged out
    if (fs.existsSync(sessionAuthPath)) {
      const credsPath = path.join(sessionAuthPath, 'creds.json');
      if (fs.existsSync(credsPath)) {
        console.log(`Removing old session files for ${cleanNumber}`);
        fs.rmSync(sessionAuthPath, { recursive: true, force: true });
      }
    }

    if (!fs.existsSync(sessionAuthPath)) {
      fs.mkdirSync(sessionAuthPath, { recursive: true });
    }

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
      browser: ['Multi-Session Bot', 'Chrome', '120.0.0'],
      markOnlineOnConnect: true,
      syncFullHistory: false,
      shouldIgnoreJid: () => false
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
      // Wait for connection.update event to ensure socket is ready
      const connectionPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Socket initialization timeout'));
        }, 15000);

        const handler = (update: any) => {
          if (update.isNewLogin === false || update.connection === 'connecting') {
            clearTimeout(timeout);
            sock.ev.off('connection.update', handler);
            resolve();
          }
        };

        sock.ev.on('connection.update', handler);
      });

      console.log(`Waiting for socket to initialize for ${cleanNumber}...`);
      await connectionPromise;
      
      // Additional safety wait
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`Socket ready. Requesting pairing code for number: ${cleanNumber}`);
      console.log(`Number format: ${cleanNumber} (length: ${cleanNumber.length})`);
      
      // Request pairing code - Baileys expects just the number without '+'
      const code = await sock.requestPairingCode(cleanNumber);
      
      if (!code) {
        throw new Error('Pairing code generation returned empty');
      }
      
      // Format code as XXXX-XXXX for better readability
      pairingCode = code.match(/.{1,4}/g)?.join('-') || code;
      
      const session = this.sessions.get(sessionId);
      if (session) {
        session.pairingCode = pairingCode;
        session.status = 'pending';
      }
      
      console.log(`✅ Generated pairing code for ${cleanNumber}: ${pairingCode}`);
      console.log(`📱 Enter this code in WhatsApp: Settings → Linked Devices → Link a Device → "Link with phone number instead"`);
    } catch (error) {
      console.error('Error requesting pairing code:', error);
      console.error('Phone number used:', cleanNumber);
      console.error('Error details:', error instanceof Error ? error.stack : error);
      
      // Clean up failed session
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
        browser: ['Multi-Session Bot', 'Chrome', '120.0.0'],
        markOnlineOnConnect: true
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
    const { connection, lastDisconnect, qr, isNewLogin } = update;
    const session = this.sessions.get(sessionId);

    if (!session) return;

    console.log(`[${sessionId}] Connection update:`, { 
      connection, 
      isNewLogin, 
      status: session.status,
      hasError: !!lastDisconnect?.error 
    });

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      const errorMessage = lastDisconnect?.error?.message || 'Unknown error';

      console.log(`Session ${sessionId} disconnected. Status: ${statusCode}, Error: ${errorMessage}, Reconnect: ${shouldReconnect}`);

      // Don't reconnect if it's a fresh session waiting for pairing
      if (session.status === 'pending') {
        console.log(`Session ${sessionId} is pending pairing code entry, keeping connection alive`);
        return;
      }

      if (shouldReconnect && statusCode !== DisconnectReason.connectionClosed && statusCode !== 401) {
        session.status = 'connecting';
        console.log(`Attempting to reconnect session ${sessionId} in 5 seconds...`);
        setTimeout(async () => {
          try {
            await this.reconnectSession(sessionId, session.phoneNumber);
          } catch (error) {
            console.error(`Failed to reconnect session ${sessionId}:`, error);
            session.status = 'disconnected';
          }
        }, 5000);
      } else {
        console.log(`Session ${sessionId} logged out or permanently closed (code: ${statusCode}), marking as disconnected`);
        session.status = 'disconnected';
        session.socket = null;
      }
    } else if (connection === 'open') {
      console.log(`✅ Session ${sessionId} connected successfully! Phone: +${session.phoneNumber}`);
      session.status = 'connected';
      session.lastActive = new Date();
    } else if (connection === 'connecting') {
      console.log(`[${sessionId}] Connecting to WhatsApp...`);
      if (session.status !== 'pending') {
        session.status = 'connecting';
      }
    }
  }

  private async handleMessages(sessionId: string, messages: any[]) {
    const session = this.sessions.get(sessionId);
    if (!session || !session.socket) return;

    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    
    console.log(`[${sessionId}] Message from ${msg.key.remoteJid}: ${text}`);

    try {
      if (text === '!ping') {
        await session.socket.sendMessage(msg.key.remoteJid!, { 
          text: '🏓 Pong! Your session is active and working!' 
        });
      } else if (text === '!help') {
        await session.socket.sendMessage(msg.key.remoteJid!, { 
          text: `📱 *WhatsApp Multi-Session Bot*\n\nAvailable Commands:\n• !ping - Test connection\n• !help - Show this message\n• !info - Session information\n• !status - Check bot status\n• !commands - List all commands\n\nYour session ID: ${sessionId}` 
        });
      } else if (text === '!info') {
        await session.socket.sendMessage(msg.key.remoteJid!, { 
          text: `📊 *Session Info*\n\nID: ${sessionId}\nPhone: +${session.phoneNumber}\nStatus: ${session.status}\nCreated: ${session.createdAt.toLocaleString()}\nLast Active: ${session.lastActive.toLocaleString()}` 
        });
      } else if (text === '!status') {
        const uptime = Date.now() - session.createdAt.getTime();
        const hours = Math.floor(uptime / (1000 * 60 * 60));
        const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
        
        await session.socket.sendMessage(msg.key.remoteJid!, { 
          text: `✅ *Bot Status*\n\nStatus: ${session.status}\nUptime: ${hours}h ${minutes}m\nSession: Active\nConnection: Stable` 
        });
      } else if (text === '!commands') {
        await session.socket.sendMessage(msg.key.remoteJid!, { 
          text: `🤖 *Available Commands*\n\n*General:*\n• !ping - Test bot\n• !help - Show help\n• !info - Session info\n• !status - Bot status\n• !commands - This list\n\n*Coming Soon:*\n• Auto-reply\n• Scheduled messages\n• Group management\n• Media handling` 
        });
      } else if (text.startsWith('!echo ')) {
        const echoText = text.substring(6);
        await session.socket.sendMessage(msg.key.remoteJid!, { 
          text: echoText 
        });
      }
    } catch (error) {
      console.error(`Error handling message for ${sessionId}:`, error);
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
