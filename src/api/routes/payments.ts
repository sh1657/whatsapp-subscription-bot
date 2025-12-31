import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { PaymentService } from '../../services/PaymentService';

const router = Router();
const paymentService = new PaymentService();

/**
 * @route   POST /api/payments/debt
 * @desc    Add debt to customer
 * @access  Private
 */
router.post('/debt', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { amount, description, salesAgentId, referenceNumber } = req.body;

    if (!amount || !description) {
      res.status(400).json({ error: 'Amount and description are required' });
      return;
    }

    await paymentService.addDebt(
      req.userId,
      amount,
      description,
      salesAgentId,
      referenceNumber,
      req.userId
    );

    res.json({ message: 'Debt added successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/payments/payment
 * @desc    Record payment from customer
 * @access  Private
 */
router.post('/payment', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { amount, description, paymentMethod, referenceNumber } = req.body;

    if (!amount || !description || !paymentMethod) {
      res.status(400).json({ error: 'Amount, description and payment method are required' });
      return;
    }

    await paymentService.recordPayment(
      req.userId,
      amount,
      description,
      paymentMethod,
      referenceNumber,
      req.userId
    );

    res.json({ message: 'Payment recorded successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/payments/credit
 * @desc    Add credit to customer
 * @access  Private
 */
router.post('/credit', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { amount, description, referenceNumber } = req.body;

    if (!amount || !description) {
      res.status(400).json({ error: 'Amount and description are required' });
      return;
    }

    await paymentService.addCredit(
      req.userId,
      amount,
      description,
      referenceNumber,
      req.userId
    );

    res.json({ message: 'Credit added successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/payments/balance
 * @desc    Get user balance
 * @access  Private
 */
router.get('/balance', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const balance = await paymentService.getUserBalance(req.userId);
    res.json(balance);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/payments/transactions
 * @desc    Get transaction history
 * @access  Private
 */
router.get('/transactions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const transactions = await paymentService.getTransactionHistory(req.userId, limit);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/payments/statistics
 * @desc    Get payment statistics (Admin only)
 * @access  Private
 */
router.get('/statistics', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const stats = await paymentService.getStatistics();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
