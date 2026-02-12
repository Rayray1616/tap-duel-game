import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    headers: req.headers,
    body: req.body,
    query: req.query,
  });
  next();
});

// Telegram Webhook Route
app.post('/webhook', (req, res) => {
  console.log('🤖 Telegram Webhook Received:', {
    update_id: req.body.update_id,
    message: req.body.message ? {
      from: req.body.message.from,
      chat: req.body.message.chat,
      text: req.body.message.text,
    } : null,
    callback_query: req.body.callback_query ? {
      from: req.body.callback_query.from,
      data: req.body.callback_query.data,
    } : null,
  });

  // Immediately send 200 OK to Telegram
  res.status(200).send('OK');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    webhook: '/webhook' 
  });
});

// Serve static files (React app)
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Telegram webhook: POST /webhook`);
  console.log(`🏥 Health check: GET /health`);
});

export default app;
