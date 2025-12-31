import cron from 'node-cron';
import { SubscriptionService } from '../services/SubscriptionService';
import logger from '../config/logger';

export class CronJobs {
  private subscriptionService: SubscriptionService;

  constructor() {
    this.subscriptionService = new SubscriptionService();
  }

  /**
   * Initialize all cron jobs
   */
  public start(): void {
    this.scheduleSubscriptionChecker();
    logger.info('⏰ Cron jobs started');
  }

  /**
   * Check expired subscriptions every hour
   */
  private scheduleSubscriptionChecker(): void {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
      try {
        logger.info('Running subscription checker...');
        await this.subscriptionService.checkExpiredSubscriptions();
        logger.info('Subscription checker completed');
      } catch (error) {
        logger.error('Error in subscription checker:', error);
      }
    });
  }
}
