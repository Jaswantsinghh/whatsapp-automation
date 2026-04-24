import { Request, Response } from 'express';
import { seedService } from '../services/seedService';
import { logger } from '../utils/logger';

class SeedController {
  /**
   * Seed database with dummy data
   */
  async seedDatabase(req: Request, res: Response) {
    try {
      const result = await seedService.seedDatabase();

      res.json({
        success: true,
        message: 'Database seeded successfully with dummy WhatsApp messages',
        data: result.data,
      });

    } catch (error) {
      logger.error('Seed database error:', error);

      res.status(500).json({
        success: false,
        error: 'Failed to seed database',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Clear all dummy data
   */
  async clearData(req: Request, res: Response) {
    try {
      const result = await seedService.clearDummyData();

      res.json({
        success: true,
        message: 'Dummy data cleared successfully',
      });

    } catch (error) {
      logger.error('Clear data error:', error);

      res.status(500).json({
        success: false,
        error: 'Failed to clear dummy data',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const seedController = new SeedController();