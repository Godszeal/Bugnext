import express from 'express';
import cors from 'cors';
import './commands/loader'; // Load all commands
import { SessionManager } from './session-manager';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const sessionManager = new SessionManager();

app.post('/api/sessions/create', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const result = await sessionManager.createSession(phoneNumber);
    res.json(result);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to create session' 
    });
  }
});

app.get('/api/sessions/list', async (req, res) => {
  try {
    const sessions = await sessionManager.getSessions();
    res.json({ sessions });
  } catch (error) {
    console.error('Error listing sessions:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to list sessions',
      sessions: []
    });
  }
});

app.delete('/api/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    await sessionManager.deleteSession(sessionId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to delete session' 
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Bot API server running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Multi-session WhatsApp bot initialized`);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await sessionManager.cleanup();
  process.exit(0);
});
