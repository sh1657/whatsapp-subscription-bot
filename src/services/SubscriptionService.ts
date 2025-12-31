import { User } from '../database';
import { config } from '../config';
import logger from '../config/logger';

export class SubscriptionService {
  /**
   * Start a free trial for a user
   */
  async startTrial(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.trialUsed) {
        throw new Error('Trial already used');
      }

      if (user.hasActiveSubscription()) {
        throw new Error('User already has an active subscription');
      }

      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + config.trialDays);

      user.subscriptionStatus = 'trial';
      user.subscriptionStart = new Date();
      user.subscriptionEnd = trialEnd;
      user.trialUsed = true;

      await user.save();
      logger.info(`Trial started for user ${userId}`);
    } catch (error) {
      logger.error('Error starting trial:', error);
      throw error;
    }
  }

  /**
   * Activate a subscription for a user
   */
  async activateSubscription(
    userId: string,
    plan: 'basic' | 'premium',
    stripeSubscriptionId: string,
    stripeCustomerId: string
  ): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const subscriptionEnd = new Date();
      subscriptionEnd.setDate(subscriptionEnd.getDate() + 30); // 30 days

      user.subscriptionStatus = 'active';
      user.subscriptionPlan = plan;
      user.subscriptionStart = new Date();
      user.subscriptionEnd = subscriptionEnd;
      user.stripeSubscriptionId = stripeSubscriptionId;
      user.stripeCustomerId = stripeCustomerId;

      await user.save();
      logger.info(`Subscription activated for user ${userId}, plan: ${plan}`);
    } catch (error) {
      logger.error('Error activating subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.subscriptionStatus = 'cancelled';
      await user.save();
      
      logger.info(`Subscription cancelled for user ${userId}`);
    } catch (error) {
      logger.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  /**
   * Renew a subscription
   */
  async renewSubscription(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const subscriptionEnd = new Date();
      subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);

      user.subscriptionStatus = 'active';
      user.subscriptionEnd = subscriptionEnd;

      await user.save();
      logger.info(`Subscription renewed for user ${userId}`);
    } catch (error) {
      logger.error('Error renewing subscription:', error);
      throw error;
    }
  }

  /**
   * Check and update expired subscriptions
   */
  async checkExpiredSubscriptions(): Promise<void> {
    try {
      const now = new Date();
      const expiredUsers = await User.find({
        subscriptionStatus: { $in: ['active', 'trial'] },
        subscriptionEnd: { $lte: now },
      });

      for (const user of expiredUsers) {
        user.subscriptionStatus = 'expired';
        await user.save();
        logger.info(`Subscription expired for user ${user._id}`);
      }

      logger.info(`Checked ${expiredUsers.length} expired subscriptions`);
    } catch (error) {
      logger.error('Error checking expired subscriptions:', error);
      throw error;
    }
  }

  /**
   * Get subscription statistics
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    trial: number;
    expired: number;
    cancelled: number;
    none: number;
  }> {
    try {
      const [total, active, trial, expired, cancelled, none] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ subscriptionStatus: 'active' }),
        User.countDocuments({ subscriptionStatus: 'trial' }),
        User.countDocuments({ subscriptionStatus: 'expired' }),
        User.countDocuments({ subscriptionStatus: 'cancelled' }),
        User.countDocuments({ subscriptionStatus: 'none' }),
      ]);

      return { total, active, trial, expired, cancelled, none };
    } catch (error) {
      logger.error('Error getting statistics:', error);
      throw error;
    }
  }

  /**
   * Get user subscription details
   */
  async getUserSubscription(userId: string) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return {
        status: user.subscriptionStatus,
        plan: user.subscriptionPlan,
        start: user.subscriptionStart,
        end: user.subscriptionEnd,
        trialUsed: user.trialUsed,
        hasActiveSubscription: user.hasActiveSubscription(),
      };
    } catch (error) {
      logger.error('Error getting user subscription:', error);
      throw error;
    }
  }
}
