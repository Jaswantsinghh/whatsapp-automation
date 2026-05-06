import express from 'express';
import { messageTypesController } from '../controllers/messageTypesController';
import { authenticateToken, requireAdmin, auditLog } from '../middleware/auth';

const router = express.Router();

// Admin only routes - managing message types
router.get('/', authenticateToken, requireAdmin, messageTypesController.getAllMessageTypes);
router.post('/', authenticateToken, requireAdmin, auditLog('create_message_type'), messageTypesController.createMessageType);
router.put('/:id', authenticateToken, requireAdmin, auditLog('update_message_type'), messageTypesController.updateMessageType);
router.delete('/:id', authenticateToken, requireAdmin, auditLog('delete_message_type'), messageTypesController.deleteMessageType);

// User accessible routes
router.get('/my-types', authenticateToken, messageTypesController.getUserMessageTypes);

export { router as messageTypesRoutes };