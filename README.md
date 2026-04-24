# WhatsApp Webhook Dashboard

Production-grade WhatsApp Business API webhook application with AI-powered message classification and real-time dashboard.

## Features

- 📱 **WhatsApp Integration**: Receive and send messages via WhatsApp Business API
- 🤖 **AI Classification**: Automatic message categorization using OpenAI
- ⚡ **Real-time Dashboard**: Live updates with WebSocket connections
- 📊 **Analytics**: Comprehensive reporting and metrics
- 🔒 **Production Ready**: Security, rate limiting, and error handling
- 🎯 **Priority Management**: Critical, high, medium, low priority classification
- 📈 **Scalable Architecture**: Microservices with Redis caching

## Tech Stack

### Backend
- Node.js + TypeScript
- Express.js with Helmet & CORS
- PostgreSQL with Drizzle ORM
- Redis for caching
- Socket.io for real-time updates
- OpenAI GPT-4 for classification

### Frontend
- Next.js 15 + TypeScript
- Tailwind CSS + Shadcn/ui
- React Query for state management
- Recharts for analytics
- Socket.io client

## Quick Start

1. **Setup Environment**
   ```bash
   cp .env.example .env
   # Fill in your API keys and database credentials
   ```

2. **Install Dependencies**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Start Development**
   ```bash
   # Backend
   cd backend && npm run dev

   # Frontend
   cd frontend && npm run dev
   ```

## Project Structure

```
├── backend/          # Express.js API server
├── frontend/         # Next.js dashboard
├── shared/           # Shared TypeScript types
└── README.md
```

## Environment Variables

See `.env.example` for required environment variables.

## License

ISC