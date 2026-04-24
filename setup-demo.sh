#!/bin/bash

# WhatsApp Webhook Dashboard - Demo Setup Script
# This script sets up the project with dummy data for testing without actual WhatsApp API

set -e

echo "🚀 Setting up WhatsApp Webhook Dashboard Demo"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

error() {
    echo -e "${RED}❌${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    log "Checking prerequisites..."

    command -v node >/dev/null 2>&1 || { error "Node.js is required but not installed. Please install Node.js 18+"; exit 1; }
    command -v npm >/dev/null 2>&1 || { error "npm is required but not installed."; exit 1; }

    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi

    success "Prerequisites check passed"
}

# Setup environment file
setup_environment() {
    log "Setting up environment configuration..."

    if [ ! -f .env ]; then
        cat > .env << EOL
# Demo Environment - No real WhatsApp API required
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database (using SQLite for demo - no setup required)
DATABASE_URL=postgresql://postgres:password@localhost:5432/whatsapp_demo

# Dummy WhatsApp API credentials (not functional, for demo only)
WHATSAPP_TOKEN=demo_token_not_real
WHATSAPP_PHONE_NUMBER_ID=demo_phone_number
WEBHOOK_VERIFY_TOKEN=demo_verify_token
WHATSAPP_APP_SECRET=demo_app_secret

# OpenAI API - Add your real key here for AI classification
# OPENAI_API_KEY=your_openai_api_key_here

# Security
JWT_SECRET=demo_jwt_secret_change_in_production_min_32_chars

# Redis (optional for demo)
REDIS_URL=redis://localhost:6379
EOL
        success "Created .env file with demo configuration"
    else
        warning ".env file already exists, skipping creation"
    fi
}

# Install dependencies
install_dependencies() {
    log "Installing backend dependencies..."
    cd backend
    npm install
    success "Backend dependencies installed"

    log "Installing frontend dependencies..."
    cd ../frontend
    npm install
    success "Frontend dependencies installed"

    cd ..
}

# Build the application
build_application() {
    log "Building backend..."
    cd backend
    npm run build
    success "Backend built successfully"

    log "Building frontend..."
    cd ../frontend
    npm run build
    success "Frontend built successfully"

    cd ..
}

# Start the application
start_application() {
    log "Starting the application..."

    echo ""
    echo "🔧 Demo Setup Instructions:"
    echo "=========================="
    echo ""
    echo "1. 📦 Backend API will start on: http://localhost:3001"
    echo "2. 🌐 Frontend Dashboard will start on: http://localhost:3000"
    echo "3. 🤖 OpenAI classification is disabled (add OPENAI_API_KEY to .env to enable)"
    echo "4. 📊 Demo data will be created automatically"
    echo ""
    echo "Demo Login Credentials:"
    echo "• Admin: demo@whatsapp-webhook.com / demo123"
    echo "• Agent 1: agent1@whatsapp-webhook.com / demo123"
    echo "• Agent 2: agent2@whatsapp-webhook.com / demo123"
    echo ""
    echo "🚀 Starting services..."
    echo ""

    # Start backend in background
    cd backend
    npm run dev &
    BACKEND_PID=$!

    # Give backend time to start
    sleep 5

    # Start frontend in background
    cd ../frontend
    npm run dev &
    FRONTEND_PID=$!

    # Function to cleanup processes on exit
    cleanup() {
        echo ""
        log "Shutting down services..."
        kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
        exit
    }

    # Setup signal handlers
    trap cleanup SIGTERM SIGINT

    # Wait a moment then seed the database
    sleep 10

    log "Setting up demo data..."
    curl -X POST http://localhost:3001/api/seed/seed -H "Content-Type: application/json" 2>/dev/null || {
        warning "Could not seed database automatically. You can do it manually later."
    }

    success "Demo setup complete!"
    echo ""
    echo "📊 Dashboard: http://localhost:3000"
    echo "🔌 API: http://localhost:3001"
    echo "📋 Health Check: http://localhost:3001/health"
    echo ""
    echo "Press Ctrl+C to stop all services"

    # Wait for any process to exit
    wait $BACKEND_PID $FRONTEND_PID
}

# Main execution
main() {
    check_prerequisites
    setup_environment
    install_dependencies

    # Ask user if they want to build
    echo ""
    read -p "Do you want to build the application? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        build_application
    fi

    echo ""
    echo "🎉 Ready to start the demo!"
    echo ""
    read -p "Press Enter to start the application..."

    start_application
}

# Run main function
main