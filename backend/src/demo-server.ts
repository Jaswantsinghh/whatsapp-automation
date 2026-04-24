import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from 'dotenv';

// Load environment variables
config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
    type: 'text' as const,
    priority: 'critical' as const,
    category: 'complaint' as const,
    status: 'pending' as const,
    classification: {
      priority: { level: 'critical' as const, confidence: 0.95, reasoning: 'Urgent delivery complaint' },
      category: { type: 'complaint' as const, confidence: 0.90, reasoning: 'Customer expressing dissatisfaction' },
      sentiment: { score: -0.8, label: 'negative' as const },
      urgency: true,
      keywords: ['urgent', 'order', 'delivery', 'yesterday']
    }
  },
  {
    id: '2',
    from: '2345678901',
    to: '0987654321',
    body: 'Hi, I\'m interested in your enterprise package for my company. We have about 200 employees.',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    type: 'text' as const,
    priority: 'high' as const,
    category: 'lead' as const,
    status: 'pending' as const,
    classification: {
      priority: { level: 'high' as const, confidence: 0.85, reasoning: 'Large enterprise lead' },
      category: { type: 'lead' as const, confidence: 0.88, reasoning: 'Sales inquiry for enterprise package' },
      sentiment: { score: 0.2, label: 'positive' as const },
      urgency: false,
      keywords: ['enterprise', 'package', 'company', '200 employees']
    }
  },
  {
    id: '3',
    from: '3456789012',
    to: '0987654321',
    body: 'How do I reset my password? I\'ve tried the forgot password link but not receiving emails.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    type: 'text' as const,
    priority: 'medium' as const,
    category: 'support' as const,
    status: 'processing' as const,
    classification: {
      priority: { level: 'medium' as const, confidence: 0.80, reasoning: 'Standard support request' },
      category: { type: 'support' as const, confidence: 0.92, reasoning: 'Technical help request' },
      sentiment: { score: -0.1, label: 'neutral' as const },
      urgency: false,
      keywords: ['reset', 'password', 'forgot', 'emails']
    }
  },
  {
    id: '4',
    from: '4567890123',
    to: '0987654321',
    body: 'Thank you for the excellent service! Just wanted to let you know how happy I am.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    type: 'text' as const,
    priority: 'low' as const,
    category: 'general' as const,
    status: 'replied' as const,
    classification: {
      priority: { level: 'low' as const, confidence: 0.75, reasoning: 'Positive feedback message' },
      category: { type: 'general' as const, confidence: 0.85, reasoning: 'Customer appreciation' },
      sentiment: { score: 0.9, label: 'positive' as const },
      urgency: false,
      keywords: ['thank', 'excellent', 'service', 'happy']
    }
  }
];

const mockUsers = [
  {
    id: '1',
    email: 'demo@whatsapp-webhook.com',
    name: 'Demo Admin',
    role: 'admin' as const,
  },
  {
    id: '2',
    email: 'agent1@whatsapp-webhook.com',
    name: 'Alice Agent',
    role: 'agent' as const,
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

// Mock auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (password === 'demo123') {
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user,
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
      hasNext: false,
      hasPrev: false,
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
        support: 1,
        general: 1,
        sales: 0
      },
      prioritiesCount: {
        critical: 1,
        high: 1,
        medium: 1,
        low: 1
      },
      dailyVolume: [
        { date: '2024-12-15', count: 2 },
        { date: '2024-12-16', count: 2 }
      ],
      sentimentBreakdown: {
        positive: 2,
        neutral: 1,
        negative: 1
      },
      topKeywords: [
        { keyword: 'urgent', count: 1 },
        { keyword: 'enterprise', count: 1 },
        { keyword: 'password', count: 1 }
      ]
    }
  });
});

// Mock seed endpoint
app.post('/api/seed/seed', (req, res) => {
  res.json({
    success: true,
    message: 'Demo data loaded successfully',
    data: {
      messagesCreated: mockMessages.length,
      demoCredentials: {
        admin: { email: 'demo@whatsapp-webhook.com', password: 'demo123' },
        agent1: { email: 'agent1@whatsapp-webhook.com', password: 'demo123' },
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
  console.log(`📊 Dashboard URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`\n✨ Demo credentials:`);
  console.log(`• Admin: demo@whatsapp-webhook.com / demo123`);
  console.log(`• Agent: agent1@whatsapp-webhook.com / demo123\n`);
});