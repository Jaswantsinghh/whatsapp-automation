import { Request, Response } from 'express';
import { messageTypesService } from '../services/messageTypesService';
import { logger } from '../utils/logger';
import { z } from 'zod';

// Validation schemas
const createMessageTypeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex code').optional(),
  isActive: z.boolean().optional(),
});

const updateMessageTypeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex code').optional(),
  isActive: z.boolean().optional(),
});

class MessageTypesController {
  /**
   * Get all message types (admin only)
   */
  async getAllMessageTypes(req: Request, res: Response) {
    try {
      const messageTypes = await messageTypesService.getAllMessageTypes();

      res.json({
        success: true,
        data: {
          messageTypes,
        },
      });

    } catch (error) {
      logger.error('Get all message types error:', error);

      res.status(500).json({
        success: false,
        error: 'Failed to get message types',
      });
    }
  }

  /**
   * Create new message type (admin only)
   */
  async createMessageType(req: Request, res: Response) {
    try {
      const validatedBody = createMessageTypeSchema.parse(req.body);

      const messageType = await messageTypesService.createMessageType(validatedBody);

      res.status(201).json({
        success: true,
        message: 'Message type created successfully',
        data: {
          messageType,
        },
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: error.errors,
        });
      }

      logger.error('Create message type error:', error);

      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create message type',
      });
    }
  }

  /**
   * Update message type (admin only)
   */
  async updateMessageType(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedBody = updateMessageTypeSchema.parse(req.body);

      const updatedMessageType = await messageTypesService.updateMessageType(id, validatedBody);

      res.json({
        success: true,
        message: 'Message type updated successfully',
        data: {
          messageType: updatedMessageType,
        },
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: error.errors,
        });
      }

      logger.error('Update message type error:', error);

      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update message type',
      });
    }
  }

  /**
   * Delete message type (admin only)
   */
  async deleteMessageType(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await messageTypesService.deleteMessageType(id);

      res.json({
        success: true,
        message: 'Message type deleted successfully',
      });

    } catch (error) {
      logger.error('Delete message type error:', error);

      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete message type',
      });
    }
  }

  /**
   * Get user's accessible message types
   */
  async getUserMessageTypes(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const messageTypes = await messageTypesService.getUserMessageTypes(req.user.id);

      res.json({
        success: true,
        data: {
          messageTypes,
        },
      });

    } catch (error) {
      logger.error('Get user message types error:', error);

      res.status(500).json({
        success: false,
        error: 'Failed to get user message types',
      });
    }
  }
}

export const messageTypesController = new MessageTypesController();