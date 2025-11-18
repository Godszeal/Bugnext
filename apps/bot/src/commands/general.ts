
import { registerCommand } from './index';
import { getSettings } from '../utils/settings';

registerCommand({
  name: 'menu',
  aliases: ['help', 'commands'],
  category: '📋 General',
  description: 'Display bot menu with all commands',
  async execute(sock, msg, args, prefix) {
    const settings = await getSettings(msg.key.remoteJid!);
    const categories = require('./index').getCommandsByCategory();
    
    let menuText = `╭━━━『 *GODSZEAL BOT* 』━━━╮\n\n`;
    menuText += `┃ 👤 *User:* @${msg.key.remoteJid!.split('@')[0]}\n`;
    menuText += `┃ 🤖 *Bot:* GodsZeal Multi-Session\n`;
    menuText += `┃ ⚙️ *Prefix:* ${settings.prefix}\n`;
    menuText += `┃ 📅 *Date:* ${new Date().toLocaleDateString()}\n`;
    menuText += `╰━━━━━━━━━━━━━━━━━━━╯\n\n`;
    
    for (const [category, cmds] of categories) {
      menuText += `╭─『 *${category}* 』\n`;
      cmds.forEach(cmd => {
        menuText += `┃ ◦ ${prefix}${cmd.name}\n`;
        if (cmd.description) {
          menuText += `┃   ${cmd.description}\n`;
        }
      });
      menuText += `╰─────────────\n\n`;
    }
    
    menuText += `\n📱 *GodsZeal Bot* - Your WhatsApp Assistant\n`;
    menuText += `💡 Type ${prefix}help <command> for more info`;
    
    const menuImage = 'https://i.ibb.co/2s8CytY/godszeal-bot.jpg';
    
    try {
      await sock.sendMessage(msg.key.remoteJid!, {
        image: { url: menuImage },
        caption: menuText,
        mentions: [msg.key.remoteJid!]
      }, {
        quoted: msg
      });
    } catch (error) {
      await sock.sendMessage(msg.key.remoteJid!, {
        text: menuText,
        mentions: [msg.key.remoteJid!]
      }, {
        quoted: msg
      });
    }
  }
});

registerCommand({
  name: 'ping',
  aliases: ['speed', 'test'],
  category: '📋 General',
  description: 'Check bot response time',
  async execute(sock, msg) {
    const start = Date.now();
    const sent = await sock.sendMessage(msg.key.remoteJid!, {
      text: '🏓 Pinging...'
    }, {
      quoted: msg
    });
    const latency = Date.now() - start;
    
    await sock.sendMessage(msg.key.remoteJid!, {
      text: `🏓 *Pong!*\n\n⚡ *Speed:* ${latency}ms`,
      edit: sent.key
    });
  }
});

registerCommand({
  name: 'alive',
  aliases: ['runtime', 'uptime'],
  category: '📋 General',
  description: 'Check if bot is alive and show uptime',
  async execute(sock, msg) {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    await sock.sendMessage(msg.key.remoteJid!, {
      text: `✅ *Bot is Alive!*\n\n⏰ *Uptime:* ${hours}h ${minutes}m ${seconds}s\n🤖 *Status:* Active\n💚 *Running smoothly*`
    }, {
      quoted: msg
    });
  }
});

registerCommand({
  name: 'owner',
  aliases: ['creator', 'dev'],
  category: '📋 General',
  description: 'Get owner contact',
  async execute(sock, msg) {
    const ownerNumber = '2348089336992';
    
    await sock.sendMessage(msg.key.remoteJid!, {
      contacts: {
        displayName: 'GodsZeal Owner',
        contacts: [{
          vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:GodsZeal\nTEL;type=CELL;type=VOICE;waid=${ownerNumber}:+${ownerNumber}\nEND:VCARD`
        }]
      }
    }, {
      quoted: msg
    });
  }
});
