# Setup Instructions

This guide will help you set up and run the WhatsApp automation dashboard locally with webhook functionality.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- Redis server (optional for development)

## Quick Setup (Demo Mode)

The fastest way to test the project is using the demo server:

### 1. Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 2. Start Demo Server

```bash
cd backend
npm run dev
```

This starts a demo server on `http://localhost:3001` with:
- Mock data and endpoints
- WebSocket support
- Webhook endpoint at `/api/webhook/whatsapp`

**Demo credentials:**
- Admin: `demo@whatsapp-webhook.com` / `demo123`
- Agent: `agent1@whatsapp-webhook.com` / `demo123`

### 3. Test Webhook Endpoint

The webhook is available at: `http://localhost:3001/api/webhook/whatsapp`

**Webhook verification (GET):**
```bash
curl "http://localhost:3001/api/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=whatsapp_webhook_verify_123&hub.challenge=test123"
```

**Send test message (POST):**
```bash
curl -X POST http://localhost:3001/api/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "entry_id",
      "changes": [{
        "value": {
          "messages": [{
            "id": "msg_123",
            "from": "1234567890",
            "timestamp": "1672531200",
            "text": {
              "body": "Hello, I need help with my order!"
            },
            "type": "text"
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

## Full Production Setup

For production setup with database and AI classification:

### 1. Database Setup

```bash
# Install and start PostgreSQL
createdb whatsapp_webhook

# Run migrations
cd backend
npm run migration:generate
npm run migration:run
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` with your actual values:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/whatsapp_webhook"
WHATSAPP_TOKEN="your_actual_whatsapp_token"
WHATSAPP_PHONE_NUMBER_ID="your_phone_number_id"
WEBHOOK_VERIFY_TOKEN="your_secure_verify_token"
OPENAI_API_KEY="your_openai_api_key"
```

### 3. Start Production Server

```bash
cd backend
npm run dev:full
```

## Frontend Setup

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:3000`

## Webhook Configuration

### WhatsApp Business API Setup

1. Go to Facebook Developers Console
2. Create a WhatsApp Business App
3. Configure webhook URL: `https://yourdomain.com/api/webhook/whatsapp`
4. Set verify token: `whatsapp_webhook_verify_123` (or your custom token)
5. Subscribe to messages and message_delivery_updates

### Local Development with ngrok

For local webhook testing:

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3001

# Use the https URL for webhook configuration
# Example: https://abc123.ngrok.io/api/webhook/whatsapp
```

## Testing

### Health Check
```bash
curl http://localhost:3001/health
```

### API Endpoints

- **Auth**: `POST /api/auth/login`
- **Messages**: `GET /api/messages`
- **Analytics**: `GET /api/analytics/dashboard`
- **Webhook**: `GET|POST /api/webhook/whatsapp`

### WebSocket Events

Connect to `http://localhost:3001` and listen for:
- `new-message`: When new message received
- `message-classified`: When AI classification complete

## Project Structure

```
├── backend/          # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── services/        # Business logic
│   │   ├── db/             # Database schema & migrations
│   │   └── utils/          # Utilities
│   └── package.json
├── frontend/         # Next.js dashboard
├── shared/           # Shared TypeScript types
└── docker-compose.yml # Docker setup
```

## Troubleshooting

### Common Issues

1. **Database connection failed**: Ensure PostgreSQL is running and credentials are correct
2. **Webhook verification failed**: Check WEBHOOK_VERIFY_TOKEN matches your configuration
3. **AI classification not working**: Verify OPENAI_API_KEY is set and valid
4. **CORS errors**: Ensure FRONTEND_URL matches your frontend URL

### Logs

Logs are written to console and can be found in:
- Backend: Console output with timestamp
- Database queries: Set DEBUG=drizzle:* for query logging

### Reset Demo Data

```bash
curl -X POST http://localhost:3001/api/seed/seed
```