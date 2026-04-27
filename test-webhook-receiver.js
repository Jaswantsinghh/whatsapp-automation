const express = require('express');
const crypto = require('crypto');

const app = express();
const PORT = 3002;

app.use(express.json());

// Test webhook receiver endpoint
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const event = req.headers['x-webhook-event'];
  const delivery = req.headers['x-webhook-delivery'];

  console.log('\n🎯 Webhook Received!');
  console.log('Event:', event);
  console.log('Delivery ID:', delivery);
  console.log('Signature:', signature);
  console.log('Payload:', JSON.stringify(req.body, null, 2));

  // Verify signature (optional - for demo purposes)
  if (signature) {
    const expectedSignature = crypto
      .createHmac('sha256', 'your-webhook-secret-key')
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature === `sha256=${expectedSignature}`) {
      console.log('✅ Signature verified');
    } else {
      console.log('❌ Signature verification failed');
    }
  }

  // Send success response
  res.status(200).json({
    received: true,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🎯 Test webhook receiver running on port ${PORT}`);
  console.log(`📥 Webhook endpoint: http://localhost:${PORT}/webhook`);
});