
import { registerCommand } from './index';
import { getSettings, updateSettings } from '../utils/settings';

registerCommand({
  name: 'setprefix',
  aliases: ['prefix'],
  category: '⚙️ Settings',
  description: 'Change bot prefix',
  usage: 'setprefix <new prefix>',
  async execute(sock, msg, args) {
    if (!args.length) {
      const settings = await getSettings(msg.key.remoteJid!);
      return await sock.sendMessage(msg.key.remoteJid!, {
        text: `📌 Current prefix: *${settings.prefix}*\n\nUsage: .setprefix <new prefix>`
      }, { quoted: msg });
    }
    
    const newPrefix = args[0];
    
    if (newPrefix.length > 3) {
      return await sock.sendMessage(msg.key.remoteJid!, {
        text: '❌ Prefix should be 1-3 characters long!'
      }, { quoted: msg });
    }
    
    await updateSettings(msg.key.remoteJid!, { prefix: newPrefix });
    
    await sock.sendMessage(msg.key.remoteJid!, {
      text: `✅ Prefix changed to: *${newPrefix}*`
    }, { quoted: msg });
  }
});

registerCommand({
  name: 'settings',
  aliases: ['setting', 'config'],
  category: '⚙️ Settings',
  description: 'View current settings',
  async execute(sock, msg) {
    const settings = await getSettings(msg.key.remoteJid!);
    
    let text = `⚙️ *Current Settings:*\n\n`;
    text += `📌 Prefix: ${settings.prefix}\n`;
    text += `🔔 Auto-follow: ${settings.autoFollow ? 'Enabled' : 'Disabled'}\n`;
    text += `📢 Newsletter: ${settings.newsletterJid || 'Not set'}\n`;
    
    await sock.sendMessage(msg.key.remoteJid!, {
      text
    }, { quoted: msg });
  }
});
