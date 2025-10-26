import express from 'express';
import geminiRouter from './geminiProxy';
import openaiRouter from './openaiProxy';
import groqRouter from './groqProxy';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Routes
app.use('/api/gemini', geminiRouter);
app.use('/api/openai', openaiRouter);
app.use('/api/groq', groqRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'JanAI Backend Proxy',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      gemini: {
        generate: 'POST /api/gemini/generate',
        models: 'GET /api/gemini/models',
      },
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   ✅ JanAI Backend Proxy Started       ║
╠════════════════════════════════════════╣
║ 🌐 Server: http://localhost:${PORT}      ║
║ 📍 Gemini API: /api/gemini/generate    ║
║ 📊 Models: /api/gemini/models          ║
║ 💚 Health: /health                     ║
╚════════════════════════════════════════╝
  `);
});
