const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3005;

// Enable CORS for frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3003', 'http://localhost:3004'],
  credentials: true
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
    classification: {
      priority: { level: 'critical', confidence: 0.95, reasoning: 'Urgent delivery complaint' },
      category: { type: 'complaint', confidence: 0.90, reasoning: 'Customer expressing dissatisfaction' },
      sentiment: { score: -0.8, label: 'negative' },
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
    type: 'text',
    priority: 'high',
    category: 'lead',
    status: 'pending',
    classification: {
      priority: { level: 'high', confidence: 0.85, reasoning: 'Large enterprise lead' },
      category: { type: 'lead', confidence: 0.88, reasoning: 'Sales inquiry for enterprise package' },
      sentiment: { score: 0.2, label: 'positive' },
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
    type: 'text',
    priority: 'medium',
    category: 'support',
    status: 'processing',
    classification: {
      priority: { level: 'medium', confidence: 0.80, reasoning: 'Standard support request' },
      category: { type: 'support', confidence: 0.92, reasoning: 'Technical help request' },
      sentiment: { score: -0.1, label: 'neutral' },
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
    type: 'text',
    priority: 'low',
    category: 'general',
    status: 'replied',
    classification: {
      priority: { level: 'low', confidence: 0.75, reasoning: 'Positive feedback message' },
      category: { type: 'general', confidence: 0.85, reasoning: 'Customer appreciation' },
      sentiment: { score: 0.9, label: 'positive' },
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
    role: 'admin',
  },
  {
    id: '2',
    email: 'agent1@whatsapp-webhook.com',
    name: 'Alice Agent',
    role: 'agent',
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

// WhatsApp Webhook Verification (GET)
app.get('/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('📞 WhatsApp Webhook Verification Request:');
  console.log('Mode:', mode);
  console.log('Token:', token);
  console.log('Challenge:', challenge);

  // Verify token (you can customize this token)
  const VERIFY_TOKEN = 'your_whatsapp_verify_token_2024';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ WhatsApp Webhook Verified Successfully');
    res.status(200).send(challenge);
  } else {
    console.log('❌ WhatsApp Webhook Verification Failed');
    res.status(403).send('Verification failed');
  }
});

// WhatsApp Webhook for receiving messages (POST)
app.post('/webhook/whatsapp', (req, res) => {
  console.log('📨 Incoming WhatsApp Webhook:');
  console.log(JSON.stringify(req.body, null, 2));

  const webhookData = req.body;

  // Process WhatsApp webhook data
  if (webhookData.entry && webhookData.entry.length > 0) {
    webhookData.entry.forEach(entry => {
      if (entry.changes && entry.changes.length > 0) {
        entry.changes.forEach(change => {
          if (change.value && change.value.messages) {
            change.value.messages.forEach(message => {
              console.log('🔔 New WhatsApp Message Received:');
              console.log('From:', message.from);
              console.log('Message ID:', message.id);
              console.log('Timestamp:', message.timestamp);

              if (message.text) {
                console.log('Text:', message.text.body);

                // Create a new message object in our mock format
                const newMessage = {
                  id: message.id,
                  from: message.from,
                  to: change.value.metadata.phone_number_id || 'system',
                  body: message.text.body,
                  timestamp: new Date(parseInt(message.timestamp) * 1000),
                  type: 'text',
                  priority: 'medium', // Will be classified by AI
                  category: 'general', // Will be classified by AI
                  status: 'pending',
                  classification: {
                    priority: { level: 'medium', confidence: 0.0, reasoning: 'Pending AI analysis' },
                    category: { type: 'general', confidence: 0.0, reasoning: 'Pending AI analysis' },
                    sentiment: { score: 0.0, label: 'neutral' },
                    urgency: false,
                    keywords: []
                  }
                };

                // Add to mock messages (in production, save to database)
                mockMessages.unshift(newMessage);
                console.log('💾 Message saved to mock database');

                // TODO: Here you would:
                // 1. Save to database
                // 2. Trigger AI classification
                // 3. Send real-time update to dashboard via Socket.IO
                // 4. Handle auto-replies if configured
              }
            });
          }
        });
      }
    });
  }

  // Always respond with 200 OK to WhatsApp
  res.status(200).send('EVENT_RECEIVED');
});

// WhatsApp Send Message API (for testing outbound messages)
app.post('/webhook/whatsapp/send', (req, res) => {
  const { to, message } = req.body;

  console.log('📤 Sending WhatsApp Message:');
  console.log('To:', to);
  console.log('Message:', message);

  // In production, this would call WhatsApp Business API
  // For demo, we'll just log it
  res.json({
    success: true,
    message: 'Message sent successfully (demo mode)',
    data: {
      messageId: 'demo_msg_' + Date.now(),
      to,
      message,
      status: 'delivered'
    }
  });
});

// Webhook status endpoint
app.get('/webhook/status', (req, res) => {
  res.json({
    status: 'active',
    webhook_url: req.get('host') + '/webhook/whatsapp',
    verify_token: 'your_whatsapp_verify_token_2024',
    messages_received: mockMessages.length,
    last_activity: mockMessages.length > 0 ? mockMessages[0].timestamp : null
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Demo server running on port', PORT);
  console.log('📊 Dashboard URL: http://localhost:3000');
  console.log('🔗 API URL: http://localhost:' + PORT);
  console.log('📋 Health check: http://localhost:' + PORT + '/health');
  console.log('\n✨ Demo credentials:');
  console.log('• Admin: demo@whatsapp-webhook.com / demo123');
  console.log('• Agent: agent1@whatsapp-webhook.com / demo123\n');
});