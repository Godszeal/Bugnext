
import { registerCommand } from './index';
import axios from 'axios';

registerCommand({
  name: 'ai',
  aliases: ['gpt', 'chatgpt', 'ask'],
  category: '🤖 AI',
  description: 'Ask AI anything',
  usage: 'ai <question>',
  async execute(sock, msg, args) {
    if (!args.length) {
      return await sock.sendMessage(msg.key.remoteJid!, {
        text: '❌ Please provide a question!\n\nExample: .ai What is JavaScript?'
      }, { quoted: msg });
    }
    
    const question = args.join(' ');
    
    try {
      await sock.sendMessage(msg.key.remoteJid!, {
        text: '🤖 Thinking...'
      }, { quoted: msg });
      
      // Using a free AI API
      const response = await axios.get(`https://api.popcat.xyz/chatbot?msg=${encodeURIComponent(question)}&owner=GodsZeal&botname=GodsZealBot`);
      
      await sock.sendMessage(msg.key.remoteJid!, {
        text: `🤖 *AI Response:*\n\n${response.data.response}`
      }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(msg.key.remoteJid!, {
        text: '❌ Failed to get AI response. Please try again later.'
      }, { quoted: msg });
    }
  }
});

registerCommand({
  name: 'image',
  aliases: ['img', 'picture', 'gimg'],
  category: '🤖 AI',
  description: 'Search for images',
  usage: 'image <query>',
  async execute(sock, msg, args) {
    if (!args.length) {
      return await sock.sendMessage(msg.key.remoteJid!, {
        text: '❌ Please provide search query!\n\nExample: .image sunset'
      }, { quoted: msg });
    }
    
    const query = args.join(' ');
    
    try {
      const response = await axios.get(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=your_access_key`);
      
      if (response.data.results.length > 0) {
        const imageUrl = response.data.results[0].urls.regular;
        
        await sock.sendMessage(msg.key.remoteJid!, {
          image: { url: imageUrl },
          caption: `🖼️ *Image Result for:* ${query}`
        }, { quoted: msg });
      } else {
        await sock.sendMessage(msg.key.remoteJid!, {
          text: '❌ No images found for your query.'
        }, { quoted: msg });
      }
    } catch (error) {
      await sock.sendMessage(msg.key.remoteJid!, {
        text: '❌ Failed to search images. Please try again later.'
      }, { quoted: msg });
    }
  }
});
