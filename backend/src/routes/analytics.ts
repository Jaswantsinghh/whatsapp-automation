import express from 'express';
import { analyticsController } from '../controllers/analyticsController';
import { authenticateToken, requireManager } from '../middleware/auth';

const router = express.Router();

// Protected routes - require authentication
router.get('/dashboard', authenticateToken, analyticsController.getDashboardMetrics);
router.get('/weekly-summary', authenticateToken, analyticsController.getWeeklySummary);
router.get('/realtime-stats', authenticateToken, analyticsController.getRealtimeStats);
router.get('/message-trends', authenticateToken, analyticsController.getMessageTrends);

// Manager/Admin only routes
router.post('/export', authenticateToken, requireManager, analyticsController.exportData);
router.post('/generate-daily/:date', authenticateToken, requireManager, analyticsController.generateDailyMetrics);

export { router as analyticsRoutes };