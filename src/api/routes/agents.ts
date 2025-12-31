import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { PaymentService } from '../../services/PaymentService';

const router = Router();
const paymentService = new PaymentService();

/**
 * @route   POST /api/agents
 * @desc    Create sales agent
 * @access  Private (Admin)
 */
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phoneNumber, commissionRate, email } = req.body;

    if (!name || !phoneNumber || commissionRate === undefined) {
      res.status(400).json({ error: 'Name, phone number and commission rate are required' });
      return;
    }

    const agent = await paymentService.createSalesAgent(
      name,
      phoneNumber,
      commissionRate,
      email
    );

    res.status(201).json({
      message: 'Sales agent created successfully',
      agent,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/agents/:agentId/report
 * @desc    Get sales report for agent
 * @access  Private
 */
router.get('/:agentId/report', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { agentId } = req.params;
    const report = await paymentService.getAgentSalesReport(agentId);
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
