import { Router, Request, Response } from 'express';
import { User } from '../../database';
import { authenticate, AuthRequest, generateToken } from '../middleware/auth';
import { SubscriptionService } from '../../services/SubscriptionService';

const router = Router();
const subscriptionService = new SubscriptionService();

/**
 * @route   POST /api/users/login
 * @desc    Login or create user
 * @access  Public
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, name, email } = req.body;

    if (!phoneNumber) {
      res.status(400).json({ error: 'Phone number is required' });
      return;
    }

    let user = await User.findOne({ phoneNumber });

    if (!user) {
      user = await User.create({
        phoneNumber,
        name,
        email,
        subscriptionStatus: 'none',
        messageCount: 0,
        trialUsed: false,
      });
    }

    const token = generateToken(user._id.toString());

    res.json({
      token,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        email: user.email,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user._id,
      phoneNumber: user.phoneNumber,
      name: user.name,
      email: user.email,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStart: user.subscriptionStart,
      subscriptionEnd: user.subscriptionEnd,
      messageCount: user.messageCount,
      trialUsed: user.trialUsed,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/users/subscription
 * @desc    Get user subscription details
 * @access  Private
 */
router.get('/subscription', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const subscription = await subscriptionService.getUserSubscription(req.userId);
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
