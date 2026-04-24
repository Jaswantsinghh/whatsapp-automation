import { Request, Response } from 'express';
import { analyticsService } from '../services/analyticsService';
import { logger } from '../utils/logger';
import { z } from 'zod';

// Validation schemas
const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD').optional(),
});

const exportSchema = z.object({
  format: z.enum(['csv', 'json']).default('json'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
});

class AnalyticsController {
  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(req: Request, res: Response) {
    try {
      const validatedQuery = dateRangeSchema.parse(req.query);

      const metrics = await analyticsService.getDashboardMetrics(
        validatedQuery.startDate && validatedQuery.endDate
          ? { startDate: validatedQuery.startDate, endDate: validatedQuery.endDate }
          : undefined
      );

      res.json({
        success: true,
        data: metrics,
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: error.errors,
        });
      }

      logger.error('Get dashboard metrics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve dashboard metrics',
      });
    }
  }

  /**
   * Export data in CSV or JSON format
   */
  async exportData(req: Request, res: Response) {
    try {
      const validatedBody = exportSchema.parse(req.body);

      const data = await analyticsService.exportData(validatedBody.format, {
        startDate: validatedBody.startDate,
        endDate: validatedBody.endDate,
      });

      const filename = `whatsapp-messages-${validatedBody.startDate}-to-${validatedBody.endDate}`;

      if (validatedBody.format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      }

      res.send(data);

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request body',
          details: error.errors,
        });
      }

      logger.error('Export data error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export data',
      });
    }
  }

  /**
   * Generate daily metrics for a specific date
   */
  async generateDailyMetrics(req: Request, res: Response) {
    try {
      const { date } = req.params;

      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD',
        });
      }

      await analyticsService.generateDailyMetrics(date);

      res.json({
        success: true,
        message: `Daily metrics generated for ${date}`,
      });

    } catch (error) {
      logger.error('Generate daily metrics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate daily metrics',
      });
    }
  }

  /**
   * Get weekly summary
   */
  async getWeeklySummary(req: Request, res: Response) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const metrics = await analyticsService.getDashboardMetrics({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });

      // Calculate week-over-week comparison
      const previousWeekStart = new Date(startDate);
      previousWeekStart.setDate(previousWeekStart.getDate() - 7);
      const previousWeekEnd = new Date(startDate);

      const previousWeekMetrics = await analyticsService.getDashboardMetrics({
        startDate: previousWeekStart.toISOString().split('T')[0],
        endDate: previousWeekEnd.toISOString().split('T')[0],
      });

      const comparison = {
        messagesGrowth: ((metrics.totalMessages - previousWeekMetrics.totalMessages) / previousWeekMetrics.totalMessages * 100),
        responseTimeChange: ((metrics.averageResponseTimeHours - previousWeekMetrics.averageResponseTimeHours) / previousWeekMetrics.averageResponseTimeHours * 100),
        pendingChange: ((metrics.pendingMessages - previousWeekMetrics.pendingMessages) / previousWeekMetrics.pendingMessages * 100),
      };

      res.json({
        success: true,
        data: {
          thisWeek: metrics,
          previousWeek: previousWeekMetrics,
          comparison,
        },
      });

    } catch (error) {
      logger.error('Get weekly summary error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve weekly summary',
      });
    }
  }

  /**
   * Get real-time statistics
   */
  async getRealtimeStats(req: Request, res: Response) {
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      const todayMetrics = await analyticsService.getDashboardMetrics({
        startDate: todayStr,
        endDate: todayStr,
      });

      const realtimeStats = {
        todayMessages: todayMetrics.totalMessages,
        pendingMessages: todayMetrics.pendingMessages,
        criticalMessages: todayMetrics.prioritiesCount.critical || 0,
        averageResponseTime: todayMetrics.averageResponseTimeHours,
        lastUpdated: new Date().toISOString(),
      };

      res.json({
        success: true,
        data: realtimeStats,
      });

    } catch (error) {
      logger.error('Get realtime stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve realtime statistics',
      });
    }
  }

  /**
   * Get message volume trends
   */
  async getMessageTrends(req: Request, res: Response) {
    try {
      const validatedQuery = dateRangeSchema.parse(req.query);

      const endDate = validatedQuery.endDate ? new Date(validatedQuery.endDate) : new Date();
      const startDate = validatedQuery.startDate ? new Date(validatedQuery.startDate) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

      const metrics = await analyticsService.getDashboardMetrics({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });

      const trends = {
        dailyVolume: metrics.dailyVolume,
        categoriesBreakdown: metrics.categoriesCount,
        prioritiesBreakdown: metrics.prioritiesCount,
        sentimentTrend: metrics.sentimentBreakdown,
        topKeywords: metrics.topKeywords,
      };

      res.json({
        success: true,
        data: trends,
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: error.errors,
        });
      }

      logger.error('Get message trends error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve message trends',
      });
    }
  }
}

export const analyticsController = new AnalyticsController();