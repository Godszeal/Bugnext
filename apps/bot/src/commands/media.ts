
import { registerCommand } from './index';

registerCommand({
  name: 'sticker',
  aliases: ['s', 'stiker'],
  category: '🎨 Media',
  description: 'Convert image/video to sticker',
  usage: 'Reply to image/video with .sticker',
  async execute(sock, msg) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    
    if (!quoted) {
      return await sock.sendMessage(msg.key.remoteJid!, {
        text: '❌ Please reply to an image or video!'
      }, { quoted: msg });
    }
    
    try {
      await sock.sendMessage(msg.key.remoteJid!, {
        text: '🎨 Creating sticker...'
      }, { quoted: msg });
      
      // Download media and convert to sticker
      // This is a simplified version - full implementation would require ffmpeg
      const mediaType = quoted.imageMessage ? 'image' : quoted.videoMessage ? 'video' : null;
      
      if (!mediaType) {
        return await sock.sendMessage(msg.key.remoteJid!, {
          text: '❌ Please reply to an image or short video!'
        }, { quoted: msg });
      }
      
      // Note: Full sticker conversion requires additional libraries
      await sock.sendMessage(msg.key.remoteJid!, {
        text: '⚠️ Sticker feature requires additional setup. Coming soon!'
      }, { quoted: msg });
      
    } catch (error) {
      await sock.sendMessage(msg.key.remoteJid!, {
        text: '❌ Failed to create sticker.'
      }, { quoted: msg });
    }
  }
});

registerCommand({
  name: 'toimage',
  aliases: ['toimg'],
  category: '🎨 Media',
  description: 'Convert sticker to image',
  usage: 'Reply to sticker with .toimage',
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid!, {
      text: '⚠️ This feature is under development.'
    }, { quoted: msg });
  }
});
