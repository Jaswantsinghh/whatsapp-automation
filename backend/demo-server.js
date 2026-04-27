const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');
const axios = require('axios');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

// Webhook configuration storage
const webhookConfigs = [
  {
    id: 'webhook1',
    name: 'Test Webhook Receiver',
    url: 'http://localhost:3002/webhook',
    secret: 'your-webhook-secret-key',
    enabled: true,
    events: ['message.processed', 'message.classified'],
    retryAttempts: 3,
    timeout: 5000
  }
];

// Webhook delivery queue (in-memory for demo)
const webhookQueue = [];

// AI Message Classification Mock
function classifyMessage(message) {
  const text = message.body?.toLowerCase() || '';

  // Mock AI classification logic
  let priority = 'low';
  let category = 'general';
  let sentiment = 'neutral';
  let confidence = 0.85;

  // Priority classification
  if (text.includes('urgent') || text.includes('emergency') || text.includes('asap')) {
    priority = 'critical';
  } else if (text.includes('important') || text.includes('please') || text.includes('need')) {
    priority = 'high';
  } else if (text.includes('when') || text.includes('how') || text.includes('question')) {
    priority = 'medium';
  }

  // Category classification
  if (text.includes('complaint') || text.includes('problem') || text.includes('issue') || text.includes('wrong')) {
    category = 'complaint';
  } else if (text.includes('buy') || text.includes('purchase') || text.includes('interested') || text.includes('price')) {
    category = 'lead';
  } else if (text.includes('help') || text.includes('support') || text.includes('how to')) {
    category = 'support';
  } else if (text.includes('order') || text.includes('delivery') || text.includes('shipping')) {
    category = 'sales';
  }

  // Sentiment analysis
  if (text.includes('angry') || text.includes('frustrated') || text.includes('terrible')) {
    sentiment = 'negative';
  } else if (text.includes('happy') || text.includes('great') || text.includes('excellent')) {
    sentiment = 'positive';
  }

  return {
    priority,
    category,
    sentiment,
    confidence,
    keywords: extractKeywords(text),
    processedAt: new Date().toISOString()
  };
}

// Extract keywords from message
function extractKeywords(text) {
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were'];
  return text.split(' ')
    .filter(word => word.length > 3 && !stopWords.includes(word))
    .slice(0, 5);
}

// Generate webhook signature
function generateSignature(payload, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
}

// Send webhook with retry logic
async function sendWebhook(config, payload, attempt = 1) {
  try {
    const signature = generateSignature(payload, config.secret);

    const response = await axios.post(config.url, payload, {
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': `sha256=${signature}`,
        'X-Webhook-Event': payload.event,
        'X-Webhook-Delivery': crypto.randomUUID(),
        'User-Agent': 'WhatsApp-Webhook-Service/1.0'
      }
    });

    console.log(`✅ Webhook delivered to ${config.name}: ${response.status}`);
    return { success: true, status: response.status };

  } catch (error) {
    console.error(`❌ Webhook delivery failed to ${config.name} (attempt ${attempt}):`, error.message);

    if (attempt < config.retryAttempts) {
      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      console.log(`🔄 Retrying in ${delay}ms...`);

      setTimeout(() => {
        sendWebhook(config, payload, attempt + 1);
      }, delay);
    } else {
      console.error(`💥 Webhook delivery permanently failed to ${config.name} after ${config.retryAttempts} attempts`);
    }

    return { success: false, error: error.message };
  }
}

// Deliver webhooks for processed messages
function deliverWebhooks(eventType, messageData) {
  const enabledWebhooks = webhookConfigs.filter(config =>
    config.enabled && config.events.includes(eventType)
  );

  if (enabledWebhooks.length === 0) {
    console.log(`No webhooks configured for event: ${eventType}`);
    return;
  }

  const webhookPayload = {
    event: eventType,
    timestamp: new Date().toISOString(),
    data: messageData
  };

  enabledWebhooks.forEach(config => {
    console.log(`📤 Sending webhook to ${config.name} for event: ${eventType}`);
    sendWebhook(config, webhookPayload);
  });
}

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

        for (const message of change.value.messages) {
          // AI Classification
          const aiAnalysis = classifyMessage(message);
          console.log('AI Analysis result:', aiAnalysis);

          const processedMessage = {
            id: Date.now().toString(),
            originalMessage: message,
            from: message.from,
            to: change.value.metadata?.phone_number_id,
            body: message.text?.body || message.caption || '[Media message]',
            type: message.type,
            timestamp: new Date(message.timestamp * 1000).toISOString(),
            ...aiAnalysis,
            status: 'processed'
          };

          // Store in mock messages
          mockMessages.unshift(processedMessage);
          if (mockMessages.length > 100) mockMessages.pop();

          // Emit to dashboard
          io.to('dashboard').emit('new-message', {
            id: processedMessage.id,
            message: processedMessage,
            timestamp: processedMessage.timestamp
          });

          // Trigger webhooks
          deliverWebhooks('message.processed', processedMessage);
          deliverWebhooks('message.classified', {
            messageId: processedMessage.id,
            classification: {
              priority: aiAnalysis.priority,
              category: aiAnalysis.category,
              sentiment: aiAnalysis.sentiment,
              confidence: aiAnalysis.confidence
            },
            message: {
              from: processedMessage.from,
              body: processedMessage.body,
              timestamp: processedMessage.timestamp
            }
          });
        }
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

// Webhook management API
app.get('/api/webhooks', (req, res) => {
  res.json({
    success: true,
    data: webhookConfigs
  });
});

app.post('/api/webhooks', (req, res) => {
  const { name, url, secret, events } = req.body;

  if (!name || !url || !secret) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: name, url, secret'
    });
  }

  const newWebhook = {
    id: `webhook_${Date.now()}`,
    name,
    url,
    secret,
    enabled: true,
    events: events || ['message.processed'],
    retryAttempts: 3,
    timeout: 5000
  };

  webhookConfigs.push(newWebhook);

  res.json({
    success: true,
    data: newWebhook
  });
});

app.put('/api/webhooks/:id', (req, res) => {
  const { id } = req.params;
  const webhook = webhookConfigs.find(w => w.id === id);

  if (!webhook) {
    return res.status(404).json({
      success: false,
      error: 'Webhook not found'
    });
  }

  Object.assign(webhook, req.body);

  res.json({
    success: true,
    data: webhook
  });
});

app.delete('/api/webhooks/:id', (req, res) => {
  const { id } = req.params;
  const index = webhookConfigs.findIndex(w => w.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Webhook not found'
    });
  }

  webhookConfigs.splice(index, 1);

  res.json({
    success: true,
    message: 'Webhook deleted'
  });
});

// Test webhook endpoint
app.post('/api/webhooks/:id/test', (req, res) => {
  const { id } = req.params;
  const webhook = webhookConfigs.find(w => w.id === id);

  if (!webhook) {
    return res.status(404).json({
      success: false,
      error: 'Webhook not found'
    });
  }

  const testPayload = {
    event: 'webhook.test',
    timestamp: new Date().toISOString(),
    data: {
      message: 'This is a test webhook delivery',
      test: true
    }
  };

  sendWebhook(webhook, testPayload)
    .then(result => {
      res.json({
        success: true,
        result
      });
    })
    .catch(error => {
      res.status(500).json({
        success: false,
        error: error.message
      });
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
  console.log(`🎯 Webhook Management: http://localhost:${PORT}/api/webhooks`);
  console.log(`\n📡 Configured Webhooks: ${webhookConfigs.length}`);
  webhookConfigs.forEach(webhook => {
    console.log(`  • ${webhook.name}: ${webhook.enabled ? '✅ Enabled' : '❌ Disabled'}`);
  });
  console.log(`\n✨ Demo credentials:`);
  console.log(`• Admin: demo@whatsapp-webhook.com / demo123`);
  console.log(`• Agent: agent1@whatsapp-webhook.com / demo123\n`);
});