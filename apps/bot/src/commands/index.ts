
import { WASocket } from '@whiskeysockets/baileys';

export interface Command {
  name: string;
  aliases?: string[];
  category: string;
  description: string;
  usage?: string;
  execute: (sock: WASocket, msg: any, args: string[], prefix: string) => Promise<void>;
}

export const commands: Command[] = [];

export function registerCommand(command: Command) {
  commands.push(command);
}

export function getCommandsByCategory(): Map<string, Command[]> {
  const categories = new Map<string, Command[]>();
  
  commands.forEach(cmd => {
    if (!categories.has(cmd.category)) {
      categories.set(cmd.category, []);
    }
    categories.get(cmd.category)!.push(cmd);
  });
  
  return categories;
}

export function findCommand(text: string, prefix: string): { command: Command; args: string[] } | null {
  if (!text.startsWith(prefix)) return null;
  
  const [cmdName, ...args] = text.slice(prefix.length).trim().split(' ');
  const command = commands.find(cmd => 
    cmd.name.toLowerCase() === cmdName.toLowerCase() || 
    cmd.aliases?.some(alias => alias.toLowerCase() === cmdName.toLowerCase())
  );
  
  return command ? { command, args } : null;
}
