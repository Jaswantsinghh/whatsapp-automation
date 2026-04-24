import { Request, Response } from 'express';
import { db, messages } from '../db';
import { logger } from '../utils/logger';
import { io } from '../server';
import { classifyMessage } from '../services/aiClassificationService';
import { WebhookPayload, WhatsAppWebhookMessage } from '../../../shared/types';
import { eq } from 'drizzle-orm';

class WhatsAppController {
  /**
   * Verify webhook subscription (GET request)
   * https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components
   */
  async verifyWebhook(req: Request, res: Response) {
    try {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      // Check if a token and mode were sent
      if (mode && token) {
        // Check the mode and token sent are correct
        if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
          // Respond with 200 OK and challenge token from the request
          logger.info('Webhook verified successfully!');
          res.status(200).send(challenge);
        } else {
          // Responds with '403 Forbidden' if verify tokens do not match
          logger.error('Webhook verification failed - token mismatch');
          res.sendStatus(403);
        }
      } else {
        logger.error('Webhook verification failed - missing parameters');
        res.sendStatus(403);
      }
    } catch (error) {
      logger.error('Webhook verification error:', error);
      res.sendStatus(500);
    }
  }

  /**
   * Receive webhook events (POST request)
   */
  async receiveWebhook(req: Request, res: Response) {
    try {
      const payload: WebhookPayload = req.body;

      logger.info('Received webhook payload:', {
        object: payload.object,
        entryCount: payload.entry?.length,
      });

      // Verify this is a WhatsApp message
      if (payload.object !== 'whatsapp_business_account') {
        logger.warn('Received non-WhatsApp webhook:', payload.object);
        return res.sendStatus(200); // Still return 200 to prevent retries
      }

      // Process each entry
      for (const entry of payload.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages' && change.value.messages) {
            await this.processMessages(change.value.messages);
          }

          if (change.field === 'messages' && change.value.statuses) {
            await this.processStatuses(change.value.statuses);
          }
        }
      }

      // Always respond with 200 OK to prevent retries
      res.sendStatus(200);
    } catch (error) {
      logger.error('Webhook processing error:', error);
      // Still return 200 to prevent endless retries from WhatsApp
      res.sendStatus(200);
    }
  }

  /**
   * Process incoming messages
   */
  private async processMessages(webhookMessages: WhatsAppWebhookMessage[]) {
    for (const msg of webhookMessages) {
      try {
        // Check if message already exists
        const existingMessage = await db
          .select()
          .from(messages)
          .where(eq(messages.whatsappId, msg.id))
          .limit(1);

        if (existingMessage.length > 0) {
          logger.debug(`Message ${msg.id} already processed, skipping`);
          continue;
        }

        // Extract message body based on type
        let messageBody = '';
        switch (msg.type) {
          case 'text':
            messageBody = msg.text?.body || '';
            break;
          case 'image':
          case 'audio':
          case 'video':
          case 'document':
            messageBody = `[${msg.type.toUpperCase()}] Media message received`;
            break;
          default:
            messageBody = `[${msg.type?.toUpperCase() || 'UNKNOWN'}] Unsupported message type`;
        }

        // Save message to database (initial save without classification)
        const [savedMessage] = await db
          .insert(messages)
          .values({
            whatsappId: msg.id,
            from: msg.from,
            to: process.env.WHATSAPP_PHONE_NUMBER_ID || 'unknown',
            body: messageBody,
            messageType: msg.type || 'text',
            status: 'processing',
            metadata: {
              timestamp: msg.timestamp,
              rawMessage: msg,
            },
            receivedAt: new Date(parseInt(msg.timestamp) * 1000),
          })
          .returning();

        logger.info(`Message ${msg.id} saved to database:`, {
          id: savedMessage.id,
          from: msg.from,
          type: msg.type,
          body: messageBody.substring(0, 100) + (messageBody.length > 100 ? '...' : ''),
        });

        // Emit real-time update to dashboard
        io.to('dashboard').emit('new-message', {
          id: savedMessage.id,
          whatsappId: msg.id,
          from: msg.from,
          body: messageBody,
          type: msg.type,
          status: 'processing',
          receivedAt: savedMessage.receivedAt,
          priority: 'medium',
          category: 'general',
        });

        // Start AI classification in the background
        this.classifyMessageAsync(savedMessage.id, messageBody);

      } catch (error) {
        logger.error(`Error processing message ${msg.id}:`, error);
      }
    }
  }

  /**
   * Process message status updates
   */
  private async processStatuses(statuses: any[]) {
    for (const status of statuses) {
      try {
        logger.debug('Processing status update:', {
          id: status.id,
          status: status.status,
          timestamp: status.timestamp,
        });

        // Update message reply status if applicable
        // This is handled in the message replies service
      } catch (error) {
        logger.error('Error processing status:', error);
      }
    }
  }

  /**
   * Classify message using AI in the background
   */
  private async classifyMessageAsync(messageId: string, messageBody: string) {
    try {
      const classification = await classifyMessage(messageBody);

      // Update message with classification results
      await db
        .update(messages)
        .set({
          priority: classification.priority.level,
          category: classification.category.type,
          status: 'pending',
          updatedAt: new Date(),
        })
        .where(eq(messages.id, messageId));

      // Get updated message for real-time update
      const [updatedMessage] = await db
        .select()
        .from(messages)
        .where(eq(messages.id, messageId))
        .limit(1);

      if (updatedMessage) {
        // Emit classification update to dashboard
        io.to('dashboard').emit('message-classified', {
          id: updatedMessage.id,
          priority: updatedMessage.priority,
          category: updatedMessage.category,
          status: updatedMessage.status,
          classification,
        });

        logger.info(`Message ${messageId} classified:`, {
          priority: classification.priority.level,
          category: classification.category.type,
          sentiment: classification.sentiment.label,
          urgency: classification.urgency,
        });
      }

    } catch (error) {
      logger.error(`Error classifying message ${messageId}:`, error);

      // Update status to indicate classification failed
      await db
        .update(messages)
        .set({
          status: 'pending', // Still set to pending so agent can handle it
          updatedAt: new Date(),
        })
        .where(eq(messages.id, messageId));
    }
  }
}

export const whatsappController = new WhatsAppController();