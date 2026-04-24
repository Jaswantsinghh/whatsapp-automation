const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

// Mock data for demo
const mockMessages = [
  {
    id: '1',
    from: '1234567890',
    to: '0987654321',
    body: 'This is urgent! My order was supposed to be delivered yesterday and I haven\'t received it yet!',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'text',
    priority: 'critical',
    category: 'complaint',
    status: 'pending',
  },
  {
    id: '2',
    from: '2345678901',
    to: '0987654321',
    body: 'Hi, I\'m interested in your enterprise package for my company. We have about 200 employees.',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    type: 'text',
    priority: 'high',
    category: 'lead',
    status: 'pending',
  }
];

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Webhook verification (GET)
app.get('/api/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('Webhook verification request:', { mode, token, challenge });

  if (mode && token) {
    if (mode === 'subscribe' && token === 'whatsapp_webhook_verify_123') {
      console.log('Webhook verified successfully!');
      res.status(200).send(challenge);
    } else {
      console.log('Webhook verification failed - token mismatch');
      res.sendStatus(403);
    }
  } else {
    console.log('Webhook verification failed - missing parameters');
    res.sendStatus(403);
  }
});

// Webhook message receiver (POST)
app.post('/api/webhook/whatsapp', (req, res) => {
  const payload = req.body;

  console.log('Received webhook payload:', JSON.stringify(payload, null, 2));

  // Verify this is a WhatsApp message
  if (payload.object !== 'whatsapp_business_account') {
    console.log('Received non-WhatsApp webhook:', payload.object);
    return res.sendStatus(200);
  }

  // Process each entry
  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field === 'messages' && change.value.messages) {
        console.log('Processing messages:', change.value.messages);

        // Emit to dashboard
        io.to('dashboard').emit('new-message', {
          id: Date.now().toString(),
          message: change.value.messages[0],
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  res.sendStatus(200);
});

// Mock auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (password === 'demo123') {
    if (email === 'demo@whatsapp-webhook.com' || email === 'agent1@whatsapp-webhook.com') {
      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: { id: '1', email, name: 'Demo User', role: 'admin' },
          accessToken: 'demo_token_' + Date.now(),
          expiresIn: '7d',
        },
      });
    }
  }

  res.status(401).json({
    success: false,
    error: 'Invalid credentials'
  });
});

// Mock messages API
app.get('/api/messages', (req, res) => {
  res.json({
    success: true,
    data: mockMessages,
    pagination: {
      page: 1,
      limit: 20,
      totalCount: mockMessages.length,
      totalPages: 1,
    },
  });
});

// Mock analytics
app.get('/api/analytics/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      totalMessages: mockMessages.length,
      pendingMessages: mockMessages.filter(m => m.status === 'pending').length,
      averageResponseTimeHours: 1.5,
      categoriesCount: {
        complaint: 1,
        lead: 1,
        support: 0,
        general: 0,
        sales: 0
      },
      prioritiesCount: {
        critical: 1,
        high: 1,
        medium: 0,
        low: 0
      }
    }
  });
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('join-dashboard', (userId) => {
    socket.join('dashboard');
    console.log(`User ${userId} joined dashboard room`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Demo server running on port ${PORT}`);
  console.log(`📊 Dashboard URL: http://localhost:3000`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Webhook URL: http://localhost:${PORT}/api/webhook/whatsapp`);
  console.log(`\n✨ Demo credentials:`);
  console.log(`• Admin: demo@whatsapp-webhook.com / demo123`);
  console.log(`• Agent: agent1@whatsapp-webhook.com / demo123\n`);
});