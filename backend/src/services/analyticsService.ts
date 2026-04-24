import { db, messages, aiClassifications, messageReplies, dailyMetrics } from '../db';
import { eq, gte, lte, desc, count, avg, sum, and, or } from 'drizzle-orm';
import { logger } from '../utils/logger';

interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

interface DashboardMetrics {
  totalMessages: number;
  pendingMessages: number;
  averageResponseTimeHours: number;
  categoriesCount: Record<string, number>;
  prioritiesCount: Record<string, number>;
  dailyVolume: Array<{ date: string; count: number; }>;
  responseTimeByPriority: Record<string, number>;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topKeywords: Array<{ keyword: string; count: number; }>;
  agentPerformance: Array<{
    agentId: string;
    agentName: string;
    messagesHandled: number;
    averageResponseTime: number;
  }>;
}

export class AnalyticsService {
  /**
   * Get comprehensive dashboard metrics
   */
  async getDashboardMetrics(dateRange?: DateRange): Promise<DashboardMetrics> {
    try {
      const startDate = dateRange?.startDate ? new Date(dateRange.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = dateRange?.endDate ? new Date(dateRange.endDate) : new Date();

      // Run all queries in parallel for better performance
      const [
        totalMessages,
        pendingMessages,
        categoriesCount,
        prioritiesCount,
        dailyVolume,
        responseTimeData,
        sentimentData,
        keywordData,
        agentData,
      ] = await Promise.all([
        this.getTotalMessages(startDate, endDate),
        this.getPendingMessages(),
        this.getCategoriesCount(startDate, endDate),
        this.getPrioritiesCount(startDate, endDate),
        this.getDailyMessageVolume(startDate, endDate),
        this.getResponseTimeByPriority(startDate, endDate),
        this.getSentimentBreakdown(startDate, endDate),
        this.getTopKeywords(startDate, endDate),
        this.getAgentPerformance(startDate, endDate),
      ]);

      const averageResponseTime = await this.getAverageResponseTime(startDate, endDate);

      return {
        totalMessages,
        pendingMessages,
        averageResponseTimeHours: averageResponseTime,
        categoriesCount,
        prioritiesCount,
        dailyVolume,
        responseTimeByPriority: responseTimeData,
        sentimentBreakdown: sentimentData,
        topKeywords: keywordData,
        agentPerformance: agentData,
      };

    } catch (error) {
      logger.error('Failed to get dashboard metrics:', error);
      throw error;
    }
  }

  /**
   * Get total messages in date range
   */
  private async getTotalMessages(startDate: Date, endDate: Date): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(messages)
      .where(and(
        gte(messages.receivedAt, startDate),
        lte(messages.receivedAt, endDate)
      ));

    return result[0]?.count || 0;
  }

  /**
   * Get pending messages count
   */
  private async getPendingMessages(): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(messages)
      .where(or(
        eq(messages.status, 'pending'),
        eq(messages.status, 'processing')
      ));

    return result[0]?.count || 0;
  }

  /**
   * Get message count by category
   */
  private async getCategoriesCount(startDate: Date, endDate: Date): Promise<Record<string, number>> {
    const result = await db
      .select({
        category: messages.category,
        count: count(),
      })
      .from(messages)
      .where(and(
        gte(messages.receivedAt, startDate),
        lte(messages.receivedAt, endDate)
      ))
      .groupBy(messages.category);

    return result.reduce((acc, item) => {
      acc[item.category] = item.count;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Get message count by priority
   */
  private async getPrioritiesCount(startDate: Date, endDate: Date): Promise<Record<string, number>> {
    const result = await db
      .select({
        priority: messages.priority,
        count: count(),
      })
      .from(messages)
      .where(and(
        gte(messages.receivedAt, startDate),
        lte(messages.receivedAt, endDate)
      ))
      .groupBy(messages.priority);

    return result.reduce((acc, item) => {
      acc[item.priority] = item.count;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Get daily message volume
   */
  private async getDailyMessageVolume(startDate: Date, endDate: Date): Promise<Array<{ date: string; count: number }>> {
    // This query might need adjustment based on your database's date functions
    const result = await db
      .select({
        date: messages.receivedAt, // We'll format this in the service
        count: count(),
      })
      .from(messages)
      .where(and(
        gte(messages.receivedAt, startDate),
        lte(messages.receivedAt, endDate)
      ))
      .groupBy(messages.receivedAt)
      .orderBy(desc(messages.receivedAt));

    // Group by day (you might want to use SQL DATE functions for better performance)
    const dailyGroups = result.reduce((acc, item) => {
      const dateStr = item.date.toISOString().split('T')[0];
      acc[dateStr] = (acc[dateStr] || 0) + item.count;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dailyGroups).map(([date, count]) => ({ date, count }));
  }

  /**
   * Get average response time in hours
   */
  private async getAverageResponseTime(startDate: Date, endDate: Date): Promise<number> {
    const result = await db
      .select({
        avgTime: avg(messages.receivedAt),
      })
      .from(messages)
      .innerJoin(messageReplies, eq(messages.id, messageReplies.messageId))
      .where(and(
        gte(messages.receivedAt, startDate),
        lte(messages.receivedAt, endDate),
        eq(messageReplies.status, 'sent')
      ));

    // Calculate time difference in hours (simplified - you'd want more precise calculation)
    return parseFloat(result[0]?.avgTime as string) / (1000 * 60 * 60) || 0;
  }

  /**
   * Get response time by priority
   */
  private async getResponseTimeByPriority(startDate: Date, endDate: Date): Promise<Record<string, number>> {
    const result = await db
      .select({
        priority: messages.priority,
        avgTime: avg(messages.receivedAt),
      })
      .from(messages)
      .innerJoin(messageReplies, eq(messages.id, messageReplies.messageId))
      .where(and(
        gte(messages.receivedAt, startDate),
        lte(messages.receivedAt, endDate),
        eq(messageReplies.status, 'sent')
      ))
      .groupBy(messages.priority);

    return result.reduce((acc, item) => {
      acc[item.priority] = parseFloat(item.avgTime as string) / (1000 * 60 * 60) || 0;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Get sentiment breakdown
   */
  private async getSentimentBreakdown(startDate: Date, endDate: Date): Promise<{ positive: number; neutral: number; negative: number }> {
    const result = await db
      .select({
        sentiment: aiClassifications.sentimentLabel,
        count: count(),
      })
      .from(aiClassifications)
      .innerJoin(messages, eq(aiClassifications.messageId, messages.id))
      .where(and(
        gte(messages.receivedAt, startDate),
        lte(messages.receivedAt, endDate)
      ))
      .groupBy(aiClassifications.sentimentLabel);

    const breakdown = { positive: 0, neutral: 0, negative: 0 };

    result.forEach(item => {
      if (item.sentiment in breakdown) {
        breakdown[item.sentiment as keyof typeof breakdown] = item.count;
      }
    });

    return breakdown;
  }

  /**
   * Get top keywords
   */
  private async getTopKeywords(startDate: Date, endDate: Date): Promise<Array<{ keyword: string; count: number }>> {
    const result = await db
      .select({
        keywords: aiClassifications.keywords,
      })
      .from(aiClassifications)
      .innerJoin(messages, eq(aiClassifications.messageId, messages.id))
      .where(and(
        gte(messages.receivedAt, startDate),
        lte(messages.receivedAt, endDate)
      ));

    // Aggregate keywords (this is simplified - you might want to do this in SQL)
    const keywordCounts = new Map<string, number>();

    result.forEach(item => {
      if (Array.isArray(item.keywords)) {
        item.keywords.forEach((keyword: string) => {
          keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
        });
      }
    });

    return Array.from(keywordCounts.entries())
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 keywords
  }

  /**
   * Get agent performance metrics
   */
  private async getAgentPerformance(startDate: Date, endDate: Date): Promise<Array<{
    agentId: string;
    agentName: string;
    messagesHandled: number;
    averageResponseTime: number;
  }>> {
    // This is a simplified version - you'd need to join with users table for names
    const result = await db
      .select({
        agentId: messages.assignedToId,
        count: count(),
        avgTime: avg(messages.receivedAt),
      })
      .from(messages)
      .leftJoin(messageReplies, eq(messages.id, messageReplies.messageId))
      .where(and(
        gte(messages.receivedAt, startDate),
        lte(messages.receivedAt, endDate),
        eq(messages.status, 'replied')
      ))
      .groupBy(messages.assignedToId);

    return result
      .filter(item => item.agentId)
      .map(item => ({
        agentId: item.agentId!,
        agentName: 'Agent Name', // TODO: Join with users table
        messagesHandled: item.count,
        averageResponseTime: parseFloat(item.avgTime as string) / (1000 * 60 * 60) || 0,
      }));
  }

  /**
   * Generate and cache daily metrics
   */
  async generateDailyMetrics(date: string): Promise<void> {
    try {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const [totalMessages, priorityBreakdown, categoryBreakdown, avgResponseTime, totalReplies] = await Promise.all([
        this.getTotalMessages(targetDate, nextDay),
        this.getPrioritiesCount(targetDate, nextDay),
        this.getCategoriesCount(targetDate, nextDay),
        this.getAverageResponseTime(targetDate, nextDay),
        this.getTotalReplies(targetDate, nextDay),
      ]);

      // Upsert daily metrics
      await db
        .insert(dailyMetrics)
        .values({
          date,
          totalMessages: totalMessages.toString(),
          priorityBreakdown,
          categoryBreakdown,
          averageResponseTimeMs: (avgResponseTime * 60 * 60 * 1000).toString(),
          totalReplies: totalReplies.toString(),
        })
        .onConflictDoUpdate({
          target: [dailyMetrics.date],
          set: {
            totalMessages: totalMessages.toString(),
            priorityBreakdown,
            categoryBreakdown,
            averageResponseTimeMs: (avgResponseTime * 60 * 60 * 1000).toString(),
            totalReplies: totalReplies.toString(),
            updatedAt: new Date(),
          },
        });

      logger.info('Daily metrics generated successfully', { date, totalMessages });

    } catch (error) {
      logger.error('Failed to generate daily metrics:', error);
      throw error;
    }
  }

  /**
   * Get total replies for a date range
   */
  private async getTotalReplies(startDate: Date, endDate: Date): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(messageReplies)
      .where(and(
        gte(messageReplies.sentAt, startDate),
        lte(messageReplies.sentAt, endDate)
      ));

    return result[0]?.count || 0;
  }

  /**
   * Export data for reporting
   */
  async exportData(format: 'csv' | 'json', dateRange: DateRange) {
    try {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);

      const messagesData = await db
        .select()
        .from(messages)
        .leftJoin(aiClassifications, eq(messages.id, aiClassifications.messageId))
        .where(and(
          gte(messages.receivedAt, startDate),
          lte(messages.receivedAt, endDate)
        ))
        .orderBy(desc(messages.receivedAt));

      if (format === 'json') {
        return JSON.stringify(messagesData, null, 2);
      } else {
        // CSV format (simplified)
        const headers = ['Date', 'From', 'Message', 'Priority', 'Category', 'Status', 'Sentiment'];
        const rows = messagesData.map(row => [
          row.messages.receivedAt.toISOString().split('T')[0],
          row.messages.from,
          row.messages.body.replace(/"/g, '""'), // Escape quotes
          row.messages.priority,
          row.messages.category,
          row.messages.status,
          row.ai_classifications?.sentimentLabel || 'N/A',
        ]);

        return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      }

    } catch (error) {
      logger.error('Failed to export data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();