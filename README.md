# WhatsApp Multi-Session Bot

A modern, scalable WhatsApp bot built with Next.js 15 and Baileys library that supports multiple simultaneous sessions with a beautiful web interface.

![Status](https://img.shields.io/badge/status-active-success)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Baileys](https://img.shields.io/badge/Baileys-6.7.21-green)

## ✨ Features

- 🚀 **Multi-Session Support**: Connect multiple WhatsApp numbers simultaneously
- 🔐 **Pairing Code Authentication**: No QR scanning required, use simple pairing codes
- 📊 **Real-Time Dashboard**: Monitor all sessions and their status
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- ⚡ **Modern Tech Stack**: Built with Next.js 15, TypeScript, and Tailwind CSS
- 🤖 **Automated Message Handling**: Process incoming messages with custom logic
- 💾 **Session Persistence**: Sessions are maintained across restarts

## 🏗️ Architecture

This project uses a monorepo structure:

```
├── apps/
│   ├── web/          # Next.js 15 frontend (port 5000)
│   └── bot/          # WhatsApp bot service (port 3001)
└── packages/
    └── db/           # Shared database package
```

### Components

1. **Web App**: Next.js application with responsive UI
2. **Bot Service**: Node.js service handling WhatsApp connections
3. **Database**: Shared Prisma schema (optional)

## 🚀 Quick Start

### Prerequisites

- Node.js 20 or higher
- npm

### Installation

```bash
# Install dependencies
npm install

# Run both services
npm run dev
```

The web interface will be available at `http://localhost:5000`

### Usage

1. Open the web interface
2. Click "Connect WhatsApp"
3. Enter your phone number with country code
4. Get your pairing code
5. In WhatsApp: Settings → Linked Devices → Link a Device → "Link with phone number instead"
6. Enter the pairing code
7. Done! Your session is now active

## 🤖 Bot Commands

Send these commands to your bot:

- `!ping` - Test connection
- `!help` - Show available commands
- `!info` - Display session information

## 🌐 Deployment

### Replit (Recommended for Development)

The project is pre-configured for Replit with two workflows:
- Frontend on port 5000 (exposed)
- Bot service on port 3001 (internal)

### Vercel + External Bot Server

1. Deploy Next.js to Vercel:
   ```bash
   cd apps/web
   vercel deploy
   ```

2. Deploy bot service to Railway/Render/VPS:
   ```bash
   cd apps/bot
   npm run build
   npm start
   ```

3. Set `BOT_API_URL` environment variable on Vercel

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **WhatsApp**: Baileys v6.7.21
- **Icons**: Lucide React
- **Storage**: File-based (upgradeable to PostgreSQL)

## 📂 Project Structure

```
apps/web/
├── app/
│   ├── page.tsx              # Home page
│   ├── connect/page.tsx      # Connection page
│   ├── dashboard/page.tsx    # Dashboard
│   └── api/sessions/         # API routes
└── ...

apps/bot/
├── src/
│   ├── index.ts              # Express server
│   └── session-manager.ts    # Session management
└── ...
```

## ⚙️ Environment Variables

### Web App (`apps/web/.env.local`)
```env
BOT_API_URL=http://localhost:3001
```

## ⚠️ Important Notes

- This bot uses the unofficial Baileys library
- May violate WhatsApp's Terms of Service
- Use responsibly and avoid spam
- Each session is independent
- Pairing codes expire quickly

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using Next.js 15 & Baileys**

*Converted from legacy bot to modern multi-session architecture - November 2025*
