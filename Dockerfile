# Multi-stage build for production efficiency

# Stage 1: Backend Build
FROM node:20-alpine AS backend-build
WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./
COPY backend/tsconfig.json ./

# Install backend dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy backend source code
COPY backend/src ./src

# Build backend
RUN npm run build

# Stage 2: Frontend Build
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./
COPY frontend/next.config.js ./
COPY frontend/tailwind.config.js ./
COPY frontend/postcss.config.js ./
COPY frontend/tsconfig.json ./

# Install frontend dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy frontend source code
COPY frontend/src ./src

# Build frontend
RUN npm run build

# Stage 3: Production Runtime
FROM node:20-alpine AS runtime

# Install system dependencies for production
RUN apk add --no-cache \
    dumb-init \
    curl \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy shared types
COPY shared ./shared

# Copy backend production files
COPY --from=backend-build /app/backend/dist ./backend/dist
COPY --from=backend-build /app/backend/node_modules ./backend/node_modules
COPY --from=backend-build /app/backend/package*.json ./backend/

# Copy frontend production files
COPY --from=frontend-build /app/frontend/.next ./frontend/.next
COPY --from=frontend-build /app/frontend/public ./frontend/public
COPY --from=frontend-build /app/frontend/node_modules ./frontend/node_modules
COPY --from=frontend-build /app/frontend/package*.json ./frontend/

# Create startup script
COPY docker/startup.sh ./startup.sh
RUN chmod +x ./startup.sh

# Create logs directory
RUN mkdir -p /app/logs && chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose ports
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start both services
CMD ["./startup.sh"]