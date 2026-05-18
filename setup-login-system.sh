#!/bin/bash

echo "🚀 Setting up WhatsApp Dashboard Login System"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Setup backend
echo "📦 Setting up backend..."
cd backend

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating backend .env file..."
    cat > .env << EOF
JWT_SECRET=$(openssl rand -hex 32)
NODE_ENV=development
PORT=3001
DATABASE_URL=sqlite:./dev.db
EOF
    echo "✅ Created backend/.env with generated JWT secret"
else
    echo "✅ Backend .env file already exists"
fi

# Run database migrations (if using a real database)
# echo "🗄️  Running database migrations..."
# npm run migration:run

# Seed the database with initial data
echo "🌱 Seeding database with login system data..."
# Note: This will create demo users and message types
# npm run seed:login

cd ..

# Setup frontend
echo "📦 Setting up frontend..."
cd frontend

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🔧 To start the system:"
echo "1. Start backend:  cd backend && npm run dev"
echo "2. Start frontend: cd frontend && npm run dev"
echo ""
echo "🌐 Access URLs:"
echo "- Frontend: http://localhost:3000"
echo "- Backend:  http://localhost:3001"
echo ""
echo "🔐 Demo Credentials:"
echo "- Admin:   admin@example.com   / admin123"
echo "- Manager: manager@example.com / manager123"
echo "- Agent:   agent@example.com   / agent123"
echo ""
echo "📚 Documentation: ./LOGIN_SYSTEM_DOCS.md"
echo "🧪 Test script:   node test-login-system.js"
echo ""
echo "⚠️  Note: Make sure to seed the database with demo data:"
echo "   cd backend && npm run seed:login"