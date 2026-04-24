import { Request, Response } from 'express';
import { messageService } from '../services/messageService';
import { logger } from '../utils/logger';
import { z } from 'zod';

// Validation schemas
const replyMessageSchema = z.object({
  body: z.string().min(1).max(4096), // WhatsApp message limit
  sentBy: z.string().uuid(), // TODO: Get from auth middleware when implemented
});

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'replied', 'resolved']),
  assignedToId: z.string().uuid().optional(),
});

const assignMessageSchema = z.object({
  assignedToId: z.string().uuid(),
});

const getMessagesSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? Math.min(parseInt(val, 10), 100) : 20),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  category: z.enum(['complaint', 'lead', 'support', 'general', 'sales']).optional(),
  status: z.enum(['pending', 'processing', 'replied', 'resolved']).optional(),
  search: z.string().optional(),
});

class MessageController {
  /**
   * Get messages with filtering and pagination
   */
  async getMessages(req: Request, res: Response) {
    try {
      const validatedQuery = getMessagesSchema.parse(req.query);

      const result = await messageService.getMessages(validatedQuery);

      res.json({
        success: true,
        data: result.messages,
        pagination: result.pagination,
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: error.errors,
        });
      }

      logger.error('Get messages error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve messages',
      });
    }
  }

  /**
   * Get specific message by ID with replies
   */
  async getMessageById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Message ID is required',
        });
      }

      const message = await messageService.getMessageWithReplies(id);

      if (!message) {
        return res.status(404).json({
          success: false,
          error: 'Message not found',
        });
      }

      res.json({
        success: true,
        data: message,
      });

    } catch (error) {
      logger.error('Get message by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve message',
      });
    }
  }

  /**
   * Reply to a WhatsApp message
   */
  async replyToMessage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedBody = replyMessageSchema.parse(req.body);

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Message ID is required',
        });
      }

      const result = await messageService.replyToMessage(
        id,
        validatedBody.body,
        validatedBody.sentBy
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        message: 'Reply sent successfully',
        data: {
          replyId: result.replyId,
        },
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request body',
          details: error.errors,
        });
      }

      logger.error('Reply to message error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send reply',
      });
    }
  }

  /**
   * Update message status
   */
  async updateMessageStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedBody = updateStatusSchema.parse(req.body);

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Message ID is required',
        });
      }

      await messageService.updateMessageStatus(
        id,
        validatedBody.status,
        validatedBody.assignedToId
      );

      res.json({
        success: true,
        message: 'Message status updated successfully',
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request body',
          details: error.errors,
        });
      }

      logger.error('Update message status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update message status',
      });
    }
  }

  /**
   * Assign message to a user
   */
  async assignMessage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedBody = assignMessageSchema.parse(req.body);

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Message ID is required',
        });
      }

      await messageService.assignMessage(id, validatedBody.assignedToId);

      res.json({
        success: true,
        message: 'Message assigned successfully',
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request body',
          details: error.errors,
        });
      }

      logger.error('Assign message error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to assign message',
      });
    }
  }

  /**
   * Mark message as read in WhatsApp
   */
  async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Message ID is required',
        });
      }

      const success = await messageService.markAsRead(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Message not found or could not be marked as read',
        });
      }

      res.json({
        success: true,
        message: 'Message marked as read',
      });

    } catch (error) {
      logger.error('Mark message as read error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark message as read',
      });
    }
  }

  /**
   * Get priority message counts for dashboard stats
   */
  async getPriorityCounts(req: Request, res: Response) {
    try {
      const priorityCounts = await messageService.getPriorityMessageCounts();

      res.json({
        success: true,
        data: priorityCounts,
      });

    } catch (error) {
      logger.error('Get priority counts error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve priority counts',
      });
    }
  }
}

export const messageController = new MessageController();