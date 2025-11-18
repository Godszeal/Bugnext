
import { registerCommand } from './index';

registerCommand({
  name: 'quote',
  aliases: ['quotes'],
  category: '🎉 Fun',
  description: 'Get random motivational quote',
  async execute(sock, msg) {
    const quotes = [
      "The only way to do great work is to love what you do. - Steve Jobs",
      "Innovation distinguishes between a leader and a follower. - Steve Jobs",
      "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
      "Stay hungry, stay foolish. - Steve Jobs",
      "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt"
    ];
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    
    await sock.sendMessage(msg.key.remoteJid!, {
      text: `💭 *Quote of the Day:*\n\n"${randomQuote}"`
    }, { quoted: msg });
  }
});

registerCommand({
  name: 'joke',
  aliases: ['jokes'],
  category: '🎉 Fun',
  description: 'Get a random joke',
  async execute(sock, msg) {
    const jokes = [
      "Why don't scientists trust atoms? Because they make up everything!",
      "Why did the scarecrow win an award? He was outstanding in his field!",
      "Why don't eggs tell jokes? They'd crack each other up!",
      "What do you call a fake noodle? An impasta!",
      "Why did the bicycle fall over? It was two tired!"
    ];
    
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    
    await sock.sendMessage(msg.key.remoteJid!, {
      text: `😂 *Joke:*\n\n${randomJoke}`
    }, { quoted: msg });
  }
});
