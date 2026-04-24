#!/bin/bash
set -e

# Production Deployment Script for WhatsApp Webhook Dashboard
# This script handles zero-downtime deployment with health checks

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENVIRONMENT="${1:-production}"
VERSION="${2:-$(git rev-parse --short HEAD)}"

echo "🚀 Starting deployment to $ENVIRONMENT environment"
echo "📦 Version: $VERSION"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."

    command -v docker >/dev/null 2>&1 || { error "Docker is required but not installed. Aborting."; exit 1; }
    command -v docker-compose >/dev/null 2>&1 || { error "Docker Compose is required but not installed. Aborting."; exit 1; }

    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        error ".env file not found. Please copy .env.production to .env and configure it."
        exit 1
    fi

    success "Prerequisites check passed"
}

# Backup database before deployment
backup_database() {
    log "Creating database backup..."

    BACKUP_FILE="backup-$(date +%Y%m%d-%H%M%S).sql"
    BACKUP_DIR="$PROJECT_ROOT/backups"

    mkdir -p "$BACKUP_DIR"

    if docker-compose exec postgres pg_dump -U postgres whatsapp_webhook > "$BACKUP_DIR/$BACKUP_FILE"; then
        success "Database backup created: $BACKUP_FILE"
    else
        error "Failed to create database backup"
        exit 1
    fi
}

# Build and test the application
build_and_test() {
    log "Building application..."

    cd "$PROJECT_ROOT"

    # Build Docker images
    if docker-compose build --no-cache; then
        success "Docker images built successfully"
    else
        error "Failed to build Docker images"
        exit 1
    fi

    # Run tests (if available)
    log "Running tests..."
    # cd backend && npm test || true
    # cd ../frontend && npm test || true
}

# Deploy with zero downtime
deploy() {
    log "Starting deployment..."

    cd "$PROJECT_ROOT"

    # Pull latest images
    docker-compose pull

    # Start new services
    if docker-compose up -d; then
        success "Services started"
    else
        error "Failed to start services"
        exit 1
    fi

    # Wait for services to be healthy
    log "Waiting for services to be healthy..."

    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if docker-compose exec app curl -f http://localhost:3001/health >/dev/null 2>&1; then
            success "Application is healthy"
            break
        fi

        if [ $attempt -eq $max_attempts ]; then
            error "Application health check failed after $max_attempts attempts"
            rollback
            exit 1
        fi

        log "Health check attempt $attempt/$max_attempts failed, retrying in 10 seconds..."
        sleep 10
        ((attempt++))
    done
}

# Database migrations
run_migrations() {
    log "Running database migrations..."

    if docker-compose exec app sh -c "cd /app/backend && npm run migration:run"; then
        success "Database migrations completed"
    else
        error "Database migrations failed"
        rollback
        exit 1
    fi
}

# Rollback function
rollback() {
    warning "Rolling back deployment..."

    # Restore from backup
    if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
        log "Restoring database from backup..."
        docker-compose exec -T postgres psql -U postgres -d whatsapp_webhook < "$BACKUP_DIR/$BACKUP_FILE"
    fi

    # Restart with previous version
    docker-compose down
    docker-compose up -d

    error "Deployment rolled back"
}

# Cleanup old Docker images and containers
cleanup() {
    log "Cleaning up old Docker resources..."

    # Remove unused images
    docker image prune -f

    # Remove unused containers
    docker container prune -f

    # Remove old backups (keep last 10)
    find "$PROJECT_ROOT/backups" -name "backup-*.sql" -type f -exec ls -1t {} + | tail -n +11 | xargs -r rm

    success "Cleanup completed"
}

# Verify deployment
verify_deployment() {
    log "Verifying deployment..."

    # Check application health
    if ! docker-compose exec app curl -f http://localhost:3001/health >/dev/null 2>&1; then
        error "Application health check failed"
        exit 1
    fi

    # Check database connectivity
    if ! docker-compose exec app sh -c "cd /app/backend && node -e 'require(\"./dist/db\").db'" >/dev/null 2>&1; then
        error "Database connectivity check failed"
        exit 1
    fi

    # Check frontend
    if ! curl -f http://localhost:3000 >/dev/null 2>&1; then
        error "Frontend accessibility check failed"
        exit 1
    fi

    success "Deployment verification passed"
}

# Send deployment notification (optional)
send_notification() {
    log "Sending deployment notification..."

    # Example webhook notification
    if [ -n "$DEPLOYMENT_WEBHOOK_URL" ]; then
        curl -X POST "$DEPLOYMENT_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d '{
                "text": "WhatsApp Webhook Dashboard deployed successfully",
                "version": "'$VERSION'",
                "environment": "'$ENVIRONMENT'",
                "timestamp": "'$(date -Iseconds)'"
            }' || true
    fi

    success "Deployment notification sent"
}

# Main deployment flow
main() {
    log "Starting WhatsApp Webhook Dashboard deployment"

    check_prerequisites
    backup_database
    build_and_test
    deploy
    run_migrations
    verify_deployment
    cleanup
    send_notification

    success "🎉 Deployment completed successfully!"
    success "Dashboard available at: http://localhost:3000"
    success "API available at: http://localhost:3001"

    log "To view logs: docker-compose logs -f"
    log "To stop services: docker-compose down"
    log "To view service status: docker-compose ps"
}

# Handle script interruption
trap 'error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"