# WhatsApp Multi-Session Bot - Replit Project

## Overview

This is a modern WhatsApp multi-session bot built with Next.js 15 and Baileys. It allows multiple users to connect their WhatsApp accounts simultaneously through a web interface using pairing codes.

**Status**: Fully functional and ready to use  
**Last Updated**: November 18, 2025  
**Tech Stack**: Next.js 15, TypeScript, Baileys v6.7.21, Tailwind CSS

## Project Structure

```
├── apps/
│   ├── web/          # Next.js 15 frontend (port 5000)
│   │   ├── app/      # App router pages & API routes
│   │   └── ...       # Next.js config files
│   └── bot/          # WhatsApp bot service (port 3001)
│       └── src/      # Bot service source code
├── packages/
│   └── db/           # Shared database package (not currently used)
└── old-bot/          # Original bot code (for reference)
```

## Architecture

This project uses a **monorepo architecture** with two main services:

1. **Next.js Web App** (port 5000):
   - User-facing web interface
   - Responsive design for all devices
   - API routes that proxy to bot service
   - Pages: Home, Connect, Dashboard

2. **Bot Service** (port 3001):
   - Persistent WhatsApp connection handler
   - Multi-session manager
   - Express API for session management
   - File-based authentication storage

## How It Works

1. User enters phone number on web UI
2. Web app calls bot service API
3. Bot service creates WhatsApp session and requests pairing code
4. User enters pairing code in WhatsApp app
5. Session is established and stored
6. User can manage all sessions from dashboard

## Features Implemented

- ✅ Multi-session WhatsApp connections
- ✅ Pairing code authentication (no QR scanning)
- ✅ Responsive web interface
- ✅ Real-time session dashboard
- ✅ Session management (create, delete, monitor)
- ✅ Automated message handling (basic commands)
- ✅ Session persistence across restarts
- ✅ Modern UI with Tailwind CSS

## Workflows

Two workflows are configured:

1. **Next.js Frontend** - Port 5000 (webview)
   - Command: `npm run dev:web`
   - User-facing web application
   - Automatically exposed for preview

2. **WhatsApp Bot Service** - Port 3001 (console)
   - Command: `npm run dev:bot`
   - Backend service handling WhatsApp connections
   - Internal service, not exposed

## Available Commands

Bot supports these WhatsApp commands:

- `!ping` - Test connection
- `!help` - Show available commands
- `!info` - Display session information

## Recent Changes

**November 18, 2025**:
- Complete rewrite from old bot to modern Next.js architecture
- Implemented multi-session support
- Added web interface for pairing
- Migrated to latest Baileys v6.7.21
- Created monorepo structure with workspaces
- Added responsive dashboard
- Configured for Vercel deployment

## Environment Variables

### Web App
- `BOT_API_URL` - URL of bot service (default: http://localhost:3001)

### Bot Service
- `PORT` - Port for bot API (default: 3001)

## User Preferences

None specified yet.

## Deployment Options

### 1. Replit (Current Setup)
Both services run as workflows. Web app is exposed on port 5000.

### 2. Vercel + External Bot Server
- Deploy web app to Vercel
- Deploy bot service to Railway/Render/VPS
- Set `BOT_API_URL` environment variable

## Security Considerations

⚠️ **Important Notes**:
- Baileys is an unofficial WhatsApp API
- May violate WhatsApp Terms of Service
- Use responsibly, avoid spam
- Pairing codes expire quickly
- Each session is independent

## Known Limitations

- File-based session storage (can upgrade to PostgreSQL)
- No rate limiting implemented yet
- Basic message handling (can be extended)
- Pairing code method only (QR removed)

## Future Improvements

- [ ] Add PostgreSQL for session storage
- [ ] Implement rate limiting
- [ ] Add webhook support
- [ ] Enhanced message handlers
- [ ] Session analytics
- [ ] Bulk message queue
- [ ] Admin authentication

## Dependencies

Major dependencies:
- Next.js 15.5.6
- React 19
- @whiskeysockets/baileys 6.7.21
- Express 4.21.2
- TypeScript 5.6.3
- Tailwind CSS 3.4.15

## Development

```bash
# Install dependencies
npm install

# Run both services
npm run dev

# Run individually
npm run dev:web   # Frontend
npm run dev:bot   # Bot service
```

## Notes for Future Sessions

- The old bot code is preserved in `old-bot/` directory
- Session files are stored in `apps/bot/auth/`
- Add these to .gitignore (already configured)
- Database package exists but not currently used (file-based auth is simpler)
- All workflows restart automatically when code changes
