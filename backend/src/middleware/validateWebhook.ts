import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger';

export const validateWebhookSignature = (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['x-hub-signature-256'];

    if (!signature) {
      logger.warn('Missing webhook signature');
      return res.status(401).json({ error: 'Missing signature' });
    }

    // WhatsApp sends signature as 'sha256=<hash>'
    const signatureHash = Array.isArray(signature) ? signature[0] : signature;
    const expectedHash = signatureHash.split('=')[1];

    if (!expectedHash) {
      logger.warn('Invalid signature format');
      return res.status(401).json({ error: 'Invalid signature format' });
    }

    // Calculate expected signature
    const appSecret = process.env.WHATSAPP_APP_SECRET;

    if (!appSecret) {
      logger.error('WHATSAPP_APP_SECRET not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const rawBody = JSON.stringify(req.body);
    const computedHash = crypto
      .createHmac('sha256', appSecret)
      .update(rawBody)
      .digest('hex');

    // Use timingSafeEqual to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedHash, 'hex'),
      Buffer.from(computedHash, 'hex')
    );

    if (!isValid) {
      logger.warn('Invalid webhook signature', {
        expected: expectedHash,
        computed: computedHash,
      });
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Signature is valid, proceed to next middleware
    next();
  } catch (error) {
    logger.error('Webhook signature validation error:', error);
    return res.status(500).json({ error: 'Signature validation failed' });
  }
};