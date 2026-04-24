#!/bin/bash

# WhatsApp Webhook Tunnel Startup Script
echo "🚀 Starting WhatsApp Webhook Tunnel..."

# Ensure the demo server is running
if ! pgrep -f "simple-demo.js" > /dev/null; then
    echo "📱 Starting demo server..."
    node simple-demo.js &
    sleep 3
fi

# Start the cloudflare tunnel (using quick tunnel for now)
echo "🌐 Starting Cloudflare tunnel..."
cloudflared tunnel --url http://localhost:3005

echo "✅ Tunnel started successfully!"
echo "📋 Available endpoints:"
echo "• Webhook URL: [Your tunnel URL]/webhook/whatsapp"
echo "• Verification: [Your tunnel URL]/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=your_whatsapp_verify_token_2024&hub.challenge=test123"
echo "• Health Check: [Your tunnel URL]/health"
echo "• Status: [Your tunnel URL]/webhook/status"