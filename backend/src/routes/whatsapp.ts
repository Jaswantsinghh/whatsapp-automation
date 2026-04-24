import express from 'express';
import { whatsappController } from '../controllers/whatsappController';
import { validateWebhookSignature } from '../middleware/validateWebhook';

const router = express.Router();

// GET route for webhook verification
router.get('/whatsapp', whatsappController.verifyWebhook);

// POST route for receiving webhook events
router.post('/whatsapp', validateWebhookSignature, whatsappController.receiveWebhook);

export { router as whatsappRoutes };