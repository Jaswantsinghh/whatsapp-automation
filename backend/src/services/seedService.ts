import { db, messages, users, aiClassifications, messageReplies } from '../db';
import { logger } from '../utils/logger';
import { classifyMessage } from './aiClassificationService';

const dummyMessages = [
  // Critical complaints
  {
    body: "This is urgent! My order was supposed to be delivered yesterday and I haven't received it yet. I need this for an important meeting tomorrow. This is unacceptable!",
    from: "1234567890",
    priority: "critical" as const,
    category: "complaint" as const,
  },
  {
    body: "HELP! The payment went through but I got charged twice! $500 has been deducted from my account. I need this resolved immediately!",
    from: "2345678901",
    priority: "critical" as const,
    category: "complaint" as const,
  },
  {
    body: "Emergency! The website is down and I can't access my account. I have a presentation in 2 hours and need the files urgently!",
    from: "3456789012",
    priority: "critical" as const,
    category: "support" as const,
  },

  // High priority leads
  {
    body: "Hi, I'm interested in your enterprise package for my company. We have about 200 employees and need immediate deployment. Can someone call me today?",
    from: "4567890123",
    priority: "high" as const,
    category: "lead" as const,
  },
  {
    body: "I want to purchase your premium plan right now. What's the pricing for annual subscription? I need to close this deal by end of week.",
    from: "5678901234",
    priority: "high" as const,
    category: "sales" as const,
  },
  {
    body: "We're a Fortune 500 company looking to partner with you. Can we schedule a meeting this week to discuss bulk pricing?",
    from: "6789012345",
    priority: "high" as const,
    category: "lead" as const,
  },

  // Medium priority support
  {
    body: "How do I reset my password? I've tried the forgot password link but I'm not receiving any emails.",
    from: "7890123456",
    priority: "medium" as const,
    category: "support" as const,
  },
  {
    body: "Can you help me understand how to use the analytics dashboard? I'm having trouble interpreting the data.",
    from: "8901234567",
    priority: "medium" as const,
    category: "support" as const,
  },
  {
    body: "I noticed a small bug in your mobile app. When I try to upload images, sometimes they don't save properly.",
    from: "9012345678",
    priority: "medium" as const,
    category: "support" as const,
  },

  // Low priority general
  {
    body: "Thank you for the excellent service! Just wanted to let you know how happy I am with your product.",
    from: "1122334455",
    priority: "low" as const,
    category: "general" as const,
  },
  {
    body: "Hello, do you have any new features planned for this year? Just curious about your roadmap.",
    from: "2233445566",
    priority: "low" as const,
    category: "general" as const,
  },
  {
    body: "Hi there! What are your business hours? I'd like to know when I can reach customer support.",
    from: "3344556677",
    priority: "low" as const,
    category: "general" as const,
  },

  // Mixed priority complaints
  {
    body: "I'm not happy with the recent update. It made the interface confusing and I can't find my favorite features.",
    from: "4455667788",
    priority: "medium" as const,
    category: "complaint" as const,
  },
  {
    body: "Your competitor offers the same service for 30% less. Why should I continue with your service?",
    from: "5566778899",
    priority: "high" as const,
    category: "complaint" as const,
  },
  {
    body: "I've been a loyal customer for 3 years but lately the quality has declined. Can we discuss this?",
    from: "6677889900",
    priority: "medium" as const,
    category: "complaint" as const,
  },

  // Sales inquiries
  {
    body: "What's included in your basic plan? I'm a small business owner and need to understand the features.",
    from: "7788990011",
    priority: "medium" as const,
    category: "sales" as const,
  },
  {
    body: "Do you offer educational discounts? I'm a teacher and would like to use this for my classroom.",
    from: "8899001122",
    priority: "low" as const,
    category: "sales" as const,
  },
  {
    body: "I need a custom solution for my business. Can your development team create something specific for our needs?",
    from: "9900112233",
    priority: "high" as const,
    category: "sales" as const,
  },

  // Support requests
  {
    body: "The tutorial videos are outdated. Do you have newer documentation? The interface has changed significantly.",
    from: "1023456789",
    priority: "low" as const,
    category: "support" as const,
  },
  {
    body: "I can't integrate with my existing CRM. Do you have an API documentation or integration guide?",
    from: "2034567890",
    priority: "medium" as const,
    category: "support" as const,
  },
  {
    body: "Is there a way to export all my data? I need to create a backup before the new update.",
    from: "3045678901",
    priority: "medium" as const,
    category: "support" as const,
  },
];

const dummyReplies = [
  "Thank you for contacting us! We're looking into this issue immediately.",
  "I understand your concern and I'll escalate this to our senior team right away.",
  "Let me connect you with our billing department to resolve this payment issue.",
  "I'd be happy to help you with that! Let me walk you through the process step by step.",
  "Thank you for your patience. We've identified the issue and are working on a fix.",
  "I appreciate your feedback! I'll make sure our product team sees this suggestion.",
  "Let me schedule a call with you to discuss this in detail. When would be a good time?",
  "I've created a ticket for this issue and our technical team will contact you within 24 hours.",
  "Thank you for being a loyal customer! Let's see how we can make this right for you.",
  "I'll send you detailed information about our pricing plans right away.",
];

export class SeedService {
  /**
   * Seed the database with dummy data for testing
   */
  async seedDatabase() {
    try {
      logger.info('Starting database seeding...');

      // Create a demo admin user
      const [demoUser] = await db
        .insert(users)
        .values({
          email: 'demo@whatsapp-webhook.com',
          name: 'Demo Admin',
          passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6cHBhqZhO6', // password: 'demo123'
          role: 'admin',
          isActive: true,
        })
        .onConflictDoNothing()
        .returning();

      logger.info('Demo user created:', { email: 'demo@whatsapp-webhook.com' });

      // Create demo agent users
      const [demoAgent1] = await db
        .insert(users)
        .values({
          email: 'agent1@whatsapp-webhook.com',
          name: 'Alice Agent',
          passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6cHBhqZhO6', // password: 'demo123'
          role: 'agent',
          isActive: true,
        })
        .onConflictDoNothing()
        .returning();

      const [demoAgent2] = await db
        .insert(users)
        .values({
          email: 'agent2@whatsapp-webhook.com',
          name: 'Bob Agent',
          passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6cHBhqZhO6', // password: 'demo123'
          role: 'agent',
          isActive: true,
        })
        .onConflictDoNothing()
        .returning();

      logger.info('Demo agents created');

      // Generate messages over the last 30 days
      const messagesCreated = [];

      for (let i = 0; i < dummyMessages.length; i++) {
        const msgData = dummyMessages[i];

        // Create random timestamps over the last 30 days
        const randomDaysAgo = Math.floor(Math.random() * 30);
        const randomHoursAgo = Math.floor(Math.random() * 24);
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - randomDaysAgo);
        timestamp.setHours(timestamp.getHours() - randomHoursAgo);

        // Assign some messages to agents
        let assignedToId = null;
        let status = 'pending' as const;

        if (Math.random() > 0.4) { // 60% chance of being assigned
          assignedToId = Math.random() > 0.5 ? demoAgent1?.id : demoAgent2?.id;
          status = Math.random() > 0.3 ? 'replied' : 'processing';
        }

        const [message] = await db
          .insert(messages)
          .values({
            whatsappId: `wa_${Date.now()}_${i}`,
            from: msgData.from,
            to: '1234567890',
            body: msgData.body,
            messageType: 'text',
            priority: msgData.priority,
            category: msgData.category,
            status,
            assignedToId,
            receivedAt: timestamp,
            metadata: {
              isDummy: true,
              timestamp: msgData.body,
            },
          })
          .returning();

        messagesCreated.push(message);

        // Add AI classification (simplified without actual OpenAI call)
        await db.insert(aiClassifications).values({
          messageId: message.id,
          priorityLevel: msgData.priority,
          priorityConfidence: '0.85',
          priorityReasoning: `Classified as ${msgData.priority} based on content analysis`,
          categoryType: msgData.category,
          categoryConfidence: '0.80',
          categoryReasoning: `Classified as ${msgData.category} based on intent detection`,
          sentimentScore: this.getSentimentScore(msgData.body).toString(),
          sentimentLabel: this.getSentimentLabel(msgData.body),
          urgency: msgData.priority === 'critical',
          keywords: this.extractKeywords(msgData.body),
          rawResponse: {
            model: 'gpt-4o',
            usage: { total_tokens: 150 },
          },
          modelUsed: 'gpt-4o',
          processingTimeMs: '1200',
        });

        // Add replies for some messages
        if (status === 'replied' && assignedToId) {
          const replyDelay = Math.floor(Math.random() * 4) + 1; // 1-4 hours delay
          const replyTimestamp = new Date(timestamp);
          replyTimestamp.setHours(replyTimestamp.getHours() + replyDelay);

          const randomReply = dummyReplies[Math.floor(Math.random() * dummyReplies.length)];

          await db.insert(messageReplies).values({
            messageId: message.id,
            sentBy: assignedToId,
            body: randomReply,
            whatsappMessageId: `reply_${Date.now()}_${i}`,
            status: 'delivered',
            sentAt: replyTimestamp,
            deliveredAt: new Date(replyTimestamp.getTime() + 30000), // 30 seconds later
          });
        }

        // Add some processing delay to avoid overwhelming the logs
        if (i % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      logger.info('Database seeding completed successfully', {
        messagesCreated: messagesCreated.length,
        usersCreated: 3,
      });

      return {
        success: true,
        message: 'Database seeded successfully',
        data: {
          messagesCreated: messagesCreated.length,
          demoCredentials: {
            admin: { email: 'demo@whatsapp-webhook.com', password: 'demo123' },
            agent1: { email: 'agent1@whatsapp-webhook.com', password: 'demo123' },
            agent2: { email: 'agent2@whatsapp-webhook.com', password: 'demo123' },
          },
        },
      };

    } catch (error) {
      logger.error('Database seeding failed:', error);
      throw error;
    }
  }

  /**
   * Clear all dummy data
   */
  async clearDummyData() {
    try {
      logger.info('Clearing dummy data...');

      // Delete in correct order due to foreign key constraints
      await db.delete(messageReplies);
      await db.delete(aiClassifications);
      await db.delete(messages);
      await db.delete(users);

      logger.info('Dummy data cleared successfully');

      return {
        success: true,
        message: 'Dummy data cleared successfully',
      };

    } catch (error) {
      logger.error('Failed to clear dummy data:', error);
      throw error;
    }
  }

  /**
   * Generate sentiment score for message content
   */
  private getSentimentScore(messageBody: string): number {
    const negativeWords = ['angry', 'upset', 'terrible', 'awful', 'hate', 'worst', 'unacceptable', 'disappointed', 'frustrated'];
    const positiveWords = ['great', 'awesome', 'excellent', 'amazing', 'love', 'perfect', 'thank', 'wonderful', 'happy'];

    let score = 0;
    const words = messageBody.toLowerCase().split(' ');

    words.forEach(word => {
      if (negativeWords.some(neg => word.includes(neg))) {
        score -= 0.3;
      }
      if (positiveWords.some(pos => word.includes(pos))) {
        score += 0.3;
      }
    });

    // Clamp between -1 and 1
    return Math.max(-1, Math.min(1, score));
  }

  /**
   * Generate sentiment label
   */
  private getSentimentLabel(messageBody: string): 'positive' | 'neutral' | 'negative' {
    const score = this.getSentimentScore(messageBody);
    if (score > 0.2) return 'positive';
    if (score < -0.2) return 'negative';
    return 'neutral';
  }

  /**
   * Extract keywords from message
   */
  private extractKeywords(messageBody: string): string[] {
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'a', 'an', 'i', 'you', 'we', 'they'];

    const words = messageBody.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 5); // Top 5 keywords

    return [...new Set(words)]; // Remove duplicates
  }
}

// Export singleton instance
export const seedService = new SeedService();