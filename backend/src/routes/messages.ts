import express from 'express';
import { messageController } from '../controllers/messageController';
// import { authenticateToken } from '../middleware/auth'; // TODO: Uncomment when auth is implemented

const router = express.Router();

// Get messages with filtering and pagination
router.get('/', messageController.getMessages);

// Get specific message with replies
router.get('/:id', messageController.getMessageById);

// Reply to a message
router.post('/:id/reply', messageController.replyToMessage);

// Update message status
router.patch('/:id/status', messageController.updateMessageStatus);

// Assign message to user
router.patch('/:id/assign', messageController.assignMessage);

// Mark message as read
router.post('/:id/mark-read', messageController.markAsRead);

// Get priority counts for dashboard
router.get('/stats/priority-counts', messageController.getPriorityCounts);

export { router as messagesRoutes };