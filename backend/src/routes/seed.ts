import express from 'express';
import { seedController } from '../controllers/seedController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Development/Demo routes - Remove in production
if (process.env.NODE_ENV !== 'production') {
  router.post('/seed', seedController.seedDatabase);
  router.delete('/clear', seedController.clearData);
} else {
  // In production, only allow admin access
  router.post('/seed', authenticateToken, requireAdmin, seedController.seedDatabase);
  router.delete('/clear', authenticateToken, requireAdmin, seedController.clearData);
}

export { router as seedRoutes };