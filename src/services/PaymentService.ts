import { User, Transaction, Balance, SalesAgent } from '../database';
import logger from '../config/logger';

export class PaymentService {
  constructor() {}

  /**
   * הוסף חוב ללקוח
   */
  async addDebt(
    userId: string,
    amount: number,
    description: string,
    salesAgentId?: string,
    referenceNumber?: string,
    createdBy?: string
  ): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // צור תנועה
      await Transaction.create({
        userId,
        salesAgentId,
        type: 'debt',
        amount,
        description,
        referenceNumber,
        status: 'completed',
        createdBy,
      });

      // עדכן יתרה
      let balance = await Balance.findOne({ userId });
      if (!balance) {
        balance = await Balance.create({
          userId,
          totalDebt: 0,
          totalCredit: 0,
          balance: 0,
        });
      }

      balance.updateBalance(amount, 'debt');
      await balance.save();

      // עדכן סוכן מכירות אם יש
      if (salesAgentId) {
        const agent = await SalesAgent.findById(salesAgentId);
        if (agent) {
          agent.totalSales += amount;
          agent.totalCommission += (amount * agent.commissionRate) / 100;
          await agent.save();
        }
      }

      logger.info(`Debt added for user ${userId}: ${amount}`);
    } catch (error) {
      logger.error('Error adding debt:', error);
      throw error;
    }
  }

  /**
   * רשום תשלום מלקוח
   */
  async recordPayment(
    userId: string,
    amount: number,
    description: string,
    paymentMethod: 'cash' | 'credit_card' | 'bank_transfer' | 'check' | 'other',
    referenceNumber?: string,
    createdBy?: string
  ): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // צור תנועה
      await Transaction.create({
        userId,
        type: 'payment',
        amount,
        description,
        paymentMethod,
        referenceNumber,
        status: 'completed',
        createdBy,
      });

      // עדכן יתרה
      let balance = await Balance.findOne({ userId });
      if (!balance) {
        balance = await Balance.create({
          userId,
          totalDebt: 0,
          totalCredit: 0,
          balance: 0,
        });
      }

      balance.updateBalance(amount, 'payment');
      await balance.save();

      logger.info(`Payment recorded for user ${userId}: ${amount}`);
    } catch (error) {
      logger.error('Error recording payment:', error);
      throw error;
    }
  }

  /**
   * הוסף זכות ללקוח
   */
  async addCredit(
    userId: string,
    amount: number,
    description: string,
    referenceNumber?: string,
    createdBy?: string
  ): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // צור תנועה
      await Transaction.create({
        userId,
        type: 'credit',
        amount,
        description,
        referenceNumber,
        status: 'completed',
        createdBy,
      });

      // עדכן יתרה
      let balance = await Balance.findOne({ userId });
      if (!balance) {
        balance = await Balance.create({
          userId,
          totalDebt: 0,
          totalCredit: 0,
          balance: 0,
        });
      }

      balance.updateBalance(amount, 'credit');
      await balance.save();

      logger.info(`Credit added for user ${userId}: ${amount}`);
    } catch (error) {
      logger.error('Error adding credit:', error);
      throw error;
    }
  }

  /**
   * קבל יתרת לקוח
   */
  async getUserBalance(userId: string) {
    try {
      let balance = await Balance.findOne({ userId });
      if (!balance) {
        balance = await Balance.create({
          userId,
          totalDebt: 0,
          totalCredit: 0,
          balance: 0,
        });
      }

      return {
        totalDebt: balance.totalDebt,
        totalCredit: balance.totalCredit,
        balance: balance.balance,
        status: balance.balance >= 0 ? 'זכות' : 'חוב',
        lastTransaction: balance.lastTransactionDate,
      };
    } catch (error) {
      logger.error('Error getting user balance:', error);
      throw error;
    }
  }

  /**
   * קבל היסטוריית תנועות
   */
  async getTransactionHistory(userId: string, limit: number = 10) {
    try {
      const transactions = await Transaction.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('salesAgentId', 'name');

      return transactions;
    } catch (error) {
      logger.error('Error getting transaction history:', error);
      throw error;
    }
  }

  /**
   * קבל דוח למכירות של סוכן
   */
  async getAgentSalesReport(agentId: string) {
    try {
      const agent = await SalesAgent.findById(agentId);
      if (!agent) {
        throw new Error('Sales agent not found');
      }

      const transactions = await Transaction.find({
        salesAgentId: agentId,
        type: 'debt',
        status: 'completed',
      }).sort({ createdAt: -1 });

      return {
        agent: {
          name: agent.name,
          phoneNumber: agent.phoneNumber,
          commissionRate: agent.commissionRate,
        },
        totalSales: agent.totalSales,
        totalCommission: agent.totalCommission,
        transactions,
      };
    } catch (error) {
      logger.error('Error getting agent sales report:', error);
      throw error;
    }
  }

  /**
   * יצירת סוכן מכירות חדש
   */
  async createSalesAgent(
    name: string,
    phoneNumber: string,
    commissionRate: number,
    email?: string
  ) {
    try {
      const existingAgent = await SalesAgent.findOne({ phoneNumber });
      if (existingAgent) {
        throw new Error('Sales agent with this phone number already exists');
      }

      const agent = await SalesAgent.create({
        name,
        phoneNumber,
        email,
        commissionRate,
        totalSales: 0,
        totalCommission: 0,
        active: true,
      });

      logger.info(`Sales agent created: ${agent.name}`);
      return agent;
    } catch (error) {
      logger.error('Error creating sales agent:', error);
      throw error;
    }
  }

  /**
   * קבל סטטיסטיקות כלליות
   */
  async getStatistics() {
    try {
      const [totalDebts, totalCredits, totalAgents, activeAgents] = await Promise.all([
        Balance.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: '$totalDebt' },
            },
          },
        ]),
        Balance.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: '$totalCredit' },
            },
          },
        ]),
        SalesAgent.countDocuments(),
        SalesAgent.countDocuments({ active: true }),
      ]);

      const totalDebt = totalDebts[0]?.total || 0;
      const totalCredit = totalCredits[0]?.total || 0;

      return {
        totalDebt,
        totalCredit,
        netBalance: totalCredit - totalDebt,
        totalAgents,
        activeAgents,
      };
    } catch (error) {
      logger.error('Error getting statistics:', error);
      throw error;
    }
  }
}
