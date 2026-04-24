import { db, messages, messageReplies } from '../db';
import { eq, desc, and, or, like, count } from 'drizzle-orm';
import { logger } from '../utils/logger';
import { whatsappApiService } from './whatsappApiService';
import { io } from '../server';
import { MessageReply } from '../../../shared/types';

export class MessageService {
  /**
   * Reply to a WhatsApp message
   */
  async replyToMessage(
    messageId: string,
    replyBody: string,
    sentByUserId: string
  ): Promise<{ success: boolean; replyId?: string; error?: string }> {
    try {
      // Get the original message
      const [originalMessage] = await db
        .select()
        .from(messages)
        .where(eq(messages.id, messageId))
        .limit(1);

      if (!originalMessage) {
        return { success: false, error: 'Original message not found' };
      }

      // Validate phone number
      if (!whatsappApiService.validatePhoneNumber(originalMessage.from)) {
        return { success: false, error: 'Invalid phone number format' };
      }

      // Create reply object
      const reply: MessageReply = {
        messageId,
        to: originalMessage.from,
        body: replyBody,
        type: 'text',
      };

      // Send via WhatsApp API
      const whatsappMessageId = await whatsappApiService.sendMessage(reply);

      if (!whatsappMessageId) {
        return { success: false, error: 'Failed to send message via WhatsApp API' };
      }

      // Save reply to database
      const [savedReply] = await db
        .insert(messageReplies)
        .values({
          messageId,
          sentBy: sentByUserId,
          body: replyBody,
          whatsappMessageId,
          status: 'sent',
        })
        .returning();

      // Update original message status
      await db
        .update(messages)
        .set({
          status: 'replied',
          updatedAt: new Date(),
        })
        .where(eq(messages.id, messageId));

      // Emit real-time update
      io.to('dashboard').emit('message-replied', {
        messageId,
        replyId: savedReply.id,
        status: 'replied',
        sentBy: sentByUserId,
        sentAt: savedReply.sentAt,
      });

      logger.info('Message reply sent successfully', {
        messageId,
        replyId: savedReply.id,
        to: originalMessage.from,
        sentBy: sentByUserId,
      });

      return { success: true, replyId: savedReply.id };

    } catch (error) {
      logger.error('Failed to reply to message:', {
        messageId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get messages with pagination and filtering
   */
  async getMessages(options: {
    page?: number;
    limit?: number;
    priority?: string;
    category?: string;
    status?: string;
    search?: string;
  } = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        priority,
        category,
        status,
        search,
      } = options;

      const offset = (page - 1) * limit;

      // Build where conditions
      const conditions = [];

      if (priority) {
        conditions.push(eq(messages.priority, priority));
      }

      if (category) {
        conditions.push(eq(messages.category, category));
      }

      if (status) {
        conditions.push(eq(messages.status, status));
      }

      if (search) {
        conditions.push(
          or(
            like(messages.body, `%${search}%`),
            like(messages.from, `%${search}%`)
          )
        );
      }

      const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

      // Get messages with count
      const [messagesResult, totalCountResult] = await Promise.all([
        db
          .select()
          .from(messages)
          .where(whereCondition)
          .orderBy(desc(messages.receivedAt))
          .limit(limit)
          .offset(offset),

        db
          .select({ count: count() })
          .from(messages)
          .where(whereCondition),
      ]);

      const totalCount = totalCountResult[0]?.count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      return {
        messages: messagesResult,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };

    } catch (error) {
      logger.error('Failed to get messages:', error);
      throw error;
    }
  }

  /**
   * Get message with replies
   */
  async getMessageWithReplies(messageId: string) {
    try {
      const [message] = await db
        .select()
        .from(messages)
        .where(eq(messages.id, messageId))
        .limit(1);

      if (!message) {
        return null;
      }

      const replies = await db
        .select()
        .from(messageReplies)
        .where(eq(messageReplies.messageId, messageId))
        .orderBy(desc(messageReplies.sentAt));

      return {
        ...message,
        replies,
      };

    } catch (error) {
      logger.error('Failed to get message with replies:', error);
      throw error;
    }
  }

  /**
   * Update message status
   */
  async updateMessageStatus(
    messageId: string,
    status: 'pending' | 'processing' | 'replied' | 'resolved',
    assignedToId?: string
  ) {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      if (assignedToId !== undefined) {
        updateData.assignedToId = assignedToId;
      }

      await db
        .update(messages)
        .set(updateData)
        .where(eq(messages.id, messageId));

      // Emit real-time update
      io.to('dashboard').emit('message-status-updated', {
        messageId,
        status,
        assignedToId,
        updatedAt: updateData.updatedAt,
      });

      logger.info('Message status updated', {
        messageId,
        status,
        assignedToId,
      });

      return true;

    } catch (error) {
      logger.error('Failed to update message status:', error);
      throw error;
    }
  }

  /**
   * Assign message to user
   */
  async assignMessage(messageId: string, assignedToId: string) {
    return this.updateMessageStatus(messageId, 'processing', assignedToId);
  }

  /**
   * Get messages assigned to user
   */
  async getUserAssignedMessages(userId: string, limit: number = 10) {
    try {
      const assignedMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.assignedToId, userId))
        .orderBy(desc(messages.receivedAt))
        .limit(limit);

      return assignedMessages;

    } catch (error) {
      logger.error('Failed to get user assigned messages:', error);
      throw error;
    }
  }

  /**
   * Get priority message counts for dashboard
   */
  async getPriorityMessageCounts() {
    try {
      const priorityCounts = await db
        .select({
          priority: messages.priority,
          count: count(),
        })
        .from(messages)
        .where(
          or(
            eq(messages.status, 'pending'),
            eq(messages.status, 'processing')
          )
        )
        .groupBy(messages.priority);

      return priorityCounts.reduce((acc, item) => {
        acc[item.priority] = item.count;
        return acc;
      }, {} as Record<string, number>);

    } catch (error) {
      logger.error('Failed to get priority message counts:', error);
      throw error;
    }
  }

  /**
   * Mark message as read (for WhatsApp API)
   */
  async markAsRead(messageId: string) {
    try {
      const [message] = await db
        .select()
        .from(messages)
        .where(eq(messages.id, messageId))
        .limit(1);

      if (!message) {
        return false;
      }

      // Mark as read in WhatsApp
      await whatsappApiService.markMessageAsRead(message.whatsappId);

      return true;

    } catch (error) {
      logger.error('Failed to mark message as read:', error);
      return false;
    }
  }
}

// Export singleton instance
export const messageService = new MessageService();