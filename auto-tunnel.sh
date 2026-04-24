#!/bin/bash

# Auto-Restart Tunnel Script
# This will restart the tunnel and show you the new URL to update in WhatsApp

echo "🔄 Restarting WhatsApp Webhook Tunnel..."

# Kill existing tunnel
pkill -f "cloudflared tunnel"
sleep 2

# Kill existing demo server
pkill -f "simple-demo.js"
sleep 2

# Start demo server
echo "📱 Starting demo server..."
node simple-demo.js &
sleep 3

# Start new tunnel and capture the URL
echo "🌐 Starting new tunnel..."
echo "⚠️  IMPORTANT: Copy the new URL below and update it in WhatsApp Business settings!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Start tunnel (this will show the URL in output)
cloudflared tunnel --url http://localhost:3005

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ When you see the URL above, update these WhatsApp webhook settings:"
echo "• Webhook URL: [Your new URL]/webhook/whatsapp"
echo "• Verify Token: your_whatsapp_verify_token_2024"