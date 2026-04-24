#!/bin/sh
set -e

echo "🚀 Starting WhatsApp Webhook Dashboard..."

# Wait for database to be ready
echo "Waiting for database connection..."
timeout=60
while [ $timeout -gt 0 ]; do
    if node -e "require('pg').Client({connectionString: process.env.DATABASE_URL}).connect().then(() => process.exit(0)).catch(() => process.exit(1))" 2>/dev/null; then
        echo "✅ Database connection established"
        break
    fi
    echo "⏳ Waiting for database... ($timeout seconds remaining)"
    sleep 2
    timeout=$((timeout - 2))
done

if [ $timeout -eq 0 ]; then
    echo "❌ Database connection timeout"
    exit 1
fi

# Run database migrations
echo "🔄 Running database migrations..."
cd /app/backend && npm run migration:run

# Start backend in background
echo "🚀 Starting backend server..."
cd /app/backend && node dist/server.js &
BACKEND_PID=$!

# Start frontend in background
echo "🚀 Starting frontend server..."
cd /app/frontend && npm start &
FRONTEND_PID=$!

# Function to cleanup processes
cleanup() {
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit
}

# Setup signal handlers
trap cleanup SIGTERM SIGINT

# Wait for any process to exit
wait $BACKEND_PID $FRONTEND_PID