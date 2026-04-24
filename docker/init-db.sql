-- Initialize production database with optimizations

-- Create database if not exists
SELECT 'CREATE DATABASE whatsapp_webhook'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'whatsapp_webhook')\gexec

-- Connect to the database
\c whatsapp_webhook;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Optimize PostgreSQL for production workload
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET max_connections = '200';
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = '0.9';
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = '100';
ALTER SYSTEM SET random_page_cost = '1.1';

-- Create application user with limited privileges
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_user') THEN
      CREATE ROLE app_user LOGIN PASSWORD 'app_password';
   END IF;
END
$$;

-- Grant necessary privileges
GRANT CONNECT ON DATABASE whatsapp_webhook TO app_user;
GRANT CREATE ON SCHEMA public TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;

-- Create monitoring views for production
CREATE OR REPLACE VIEW message_stats AS
SELECT
    DATE_TRUNC('day', received_at) as date,
    COUNT(*) as total_messages,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_messages,
    COUNT(*) FILTER (WHERE priority = 'critical') as critical_messages,
    COUNT(*) FILTER (WHERE priority = 'high') as high_priority_messages,
    COUNT(*) FILTER (WHERE category = 'complaint') as complaints,
    COUNT(*) FILTER (WHERE category = 'lead') as leads
FROM messages
WHERE received_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', received_at)
ORDER BY date DESC;

-- Create index suggestions for production
-- These will be created by Drizzle migrations, but documented here for reference
-- CREATE INDEX CONCURRENTLY idx_messages_received_at_desc ON messages (received_at DESC);
-- CREATE INDEX CONCURRENTLY idx_messages_status_priority ON messages (status, priority);
-- CREATE INDEX CONCURRENTLY idx_messages_category_received_at ON messages (category, received_at);
-- CREATE INDEX CONCURRENTLY idx_ai_classifications_urgent ON ai_classifications (urgency) WHERE urgency = true;

COMMENT ON DATABASE whatsapp_webhook IS 'WhatsApp Webhook Production Database';
COMMENT ON VIEW message_stats IS 'Daily message statistics for monitoring dashboard';