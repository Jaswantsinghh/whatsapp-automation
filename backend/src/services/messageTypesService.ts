import { db, messageTypes, userMessageTypePermissions } from '../db';
import { eq, and } from 'drizzle-orm';
import { logger } from '../utils/logger';

interface CreateMessageTypeData {
  name: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

interface UpdateMessageTypeData {
  name?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

export class MessageTypesService {
  /**
   * Get all message types
   */
  async getAllMessageTypes() {
    try {
      const allMessageTypes = await db
        .select({
          id: messageTypes.id,
          name: messageTypes.name,
          description: messageTypes.description,
          color: messageTypes.color,
          isActive: messageTypes.isActive,
          createdAt: messageTypes.createdAt,
          updatedAt: messageTypes.updatedAt,
        })
        .from(messageTypes);

      return allMessageTypes;

    } catch (error) {
      logger.error('Get all message types failed:', error);
      throw error;
    }
  }

  /**
   * Create new message type
   */
  async createMessageType(messageTypeData: CreateMessageTypeData) {
    try {
      // Check if message type with same name already exists
      const [existingType] = await db
        .select()
        .from(messageTypes)
        .where(eq(messageTypes.name, messageTypeData.name))
        .limit(1);

      if (existingType) {
        throw new Error('Message type with this name already exists');
      }

      // Create message type
      const [newMessageType] = await db
        .insert(messageTypes)
        .values({
          name: messageTypeData.name,
          description: messageTypeData.description,
          color: messageTypeData.color || '#3B82F6',
          isActive: messageTypeData.isActive ?? true,
        })
        .returning({
          id: messageTypes.id,
          name: messageTypes.name,
          description: messageTypes.description,
          color: messageTypes.color,
          isActive: messageTypes.isActive,
          createdAt: messageTypes.createdAt,
        });

      logger.info('Message type created successfully', {
        messageTypeId: newMessageType.id,
        name: newMessageType.name,
      });

      return newMessageType;

    } catch (error) {
      logger.error('Create message type failed:', error);
      throw error;
    }
  }

  /**
   * Update message type
   */
  async updateMessageType(messageTypeId: string, updateData: UpdateMessageTypeData) {
    try {
      // Check if message type exists
      const [existingType] = await db
        .select()
        .from(messageTypes)
        .where(eq(messageTypes.id, messageTypeId))
        .limit(1);

      if (!existingType) {
        throw new Error('Message type not found');
      }

      // If name is being updated, check for duplicates
      if (updateData.name && updateData.name !== existingType.name) {
        const [nameExists] = await db
          .select()
          .from(messageTypes)
          .where(eq(messageTypes.name, updateData.name))
          .limit(1);

        if (nameExists) {
          throw new Error('Message type with this name already exists');
        }
      }

      // Update message type
      const [updatedMessageType] = await db
        .update(messageTypes)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(messageTypes.id, messageTypeId))
        .returning({
          id: messageTypes.id,
          name: messageTypes.name,
          description: messageTypes.description,
          color: messageTypes.color,
          isActive: messageTypes.isActive,
          updatedAt: messageTypes.updatedAt,
        });

      logger.info('Message type updated successfully', { messageTypeId, updateData });

      return updatedMessageType;

    } catch (error) {
      logger.error('Update message type failed:', error);
      throw error;
    }
  }

  /**
   * Delete message type
   */
  async deleteMessageType(messageTypeId: string) {
    try {
      // Check if message type exists
      const [existingType] = await db
        .select()
        .from(messageTypes)
        .where(eq(messageTypes.id, messageTypeId))
        .limit(1);

      if (!existingType) {
        throw new Error('Message type not found');
      }

      // Delete all permissions for this message type
      await db
        .delete(userMessageTypePermissions)
        .where(eq(userMessageTypePermissions.messageTypeId, messageTypeId));

      // Delete message type
      await db
        .delete(messageTypes)
        .where(eq(messageTypes.id, messageTypeId));

      logger.info('Message type deleted successfully', { messageTypeId });

      return { message: 'Message type deleted successfully' };

    } catch (error) {
      logger.error('Delete message type failed:', error);
      throw error;
    }
  }

  /**
   * Get message types accessible to a specific user
   */
  async getUserMessageTypes(userId: string) {
    try {
      const userTypes = await db
        .select({
          id: messageTypes.id,
          name: messageTypes.name,
          description: messageTypes.description,
          color: messageTypes.color,
          isActive: messageTypes.isActive,
          canView: userMessageTypePermissions.canView,
          canReply: userMessageTypePermissions.canReply,
          canAssign: userMessageTypePermissions.canAssign,
        })
        .from(messageTypes)
        .innerJoin(
          userMessageTypePermissions,
          eq(messageTypes.id, userMessageTypePermissions.messageTypeId)
        )
        .where(
          and(
            eq(userMessageTypePermissions.userId, userId),
            eq(messageTypes.isActive, true),
            eq(userMessageTypePermissions.canView, true)
          )
        );

      return userTypes;

    } catch (error) {
      logger.error('Get user message types failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const messageTypesService = new MessageTypesService();