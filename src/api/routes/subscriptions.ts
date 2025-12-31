import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { SubscriptionService } from '../../services/SubscriptionService';

const router = Router();
const subscriptionService = new SubscriptionService();

/**
 * @route   POST /api/subscriptions/trial
 * @desc    Start free trial
 * @access  Private
 */
router.post('/trial', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await subscriptionService.startTrial(req.userId);

    res.json({
      message: 'Trial started successfully',
      status: 'trial',
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route   POST /api/subscriptions/cancel
 * @desc    Cancel subscription
 * @access  Private
 */
router.post('/cancel', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await subscriptionService.cancelSubscription(req.userId);

    res.json({
      message: 'Subscription cancelled successfully',
      status: 'cancelled',
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route   GET /api/subscriptions/statistics
 * @desc    Get subscription statistics (Admin only)
 * @access  Private
 */
router.get('/statistics', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const stats = await subscriptionService.getStatistics();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
