
import fs from 'fs';
import path from 'path';

interface UserSettings {
  prefix: string;
  autoFollow: boolean;
  newsletterJid?: string;
  autoRead: boolean;
  autoTyping: boolean;
  autoRecording: boolean;
}

const defaultSettings: UserSettings = {
  prefix: '.',
  autoFollow: false,
  newsletterJid: '120363304325601080@newsletter',
  autoRead: true,
  autoTyping: false,
  autoRecording: false
};

const settingsDir = path.join(process.cwd(), 'user-settings');

if (!fs.existsSync(settingsDir)) {
  fs.mkdirSync(settingsDir, { recursive: true });
}

export async function getSettings(userId: string): Promise<UserSettings> {
  const filePath = path.join(settingsDir, `${userId.replace(/[^a-zA-Z0-9]/g, '_')}.json`);
  
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('Error reading settings:', error);
  }
  
  return defaultSettings;
}

export async function updateSettings(userId: string, updates: Partial<UserSettings>): Promise<void> {
  const filePath = path.join(settingsDir, `${userId.replace(/[^a-zA-Z0-9]/g, '_')}.json`);
  const currentSettings = await getSettings(userId);
  const newSettings = { ...currentSettings, ...updates };
  
  fs.writeFileSync(filePath, JSON.stringify(newSettings, null, 2));
}
