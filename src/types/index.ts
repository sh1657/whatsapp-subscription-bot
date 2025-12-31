export interface IUser {
  _id?: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  subscriptionStatus: 'none' | 'trial' | 'active' | 'expired' | 'cancelled';
  subscriptionPlan?: 'basic' | 'premium';
  subscriptionStart?: Date;
  subscriptionEnd?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  trialUsed: boolean;
  messageCount: number;
  lastMessageDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubscriptionPlan {
  _id?: string;
  name: string;
  type: 'basic' | 'premium';
  price: number;
  currency: string;
  duration: number; // in days
  features: string[];
  messageLimit?: number;
  stripePriceId: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayment {
  _id?: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripePaymentId: string;
  subscriptionPlan: 'basic' | 'premium';
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransaction {
  _id?: string;
  userId: string;
  salesAgentId?: string;
  type: 'payment' | 'debt' | 'credit' | 'refund';
  amount: number;
  description: string;
  referenceNumber?: string;
  paymentMethod?: 'cash' | 'credit_card' | 'bank_transfer' | 'check' | 'other';
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISalesAgent {
  _id?: string;
  name: string;
  phoneNumber: string;
  email?: string;
  commissionRate: number;
  totalSales: number;
  totalCommission: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBalance {
  _id?: string;
  userId: string;
  totalDebt: number;
  totalCredit: number;
  balance: number;
  lastTransactionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage {
  _id?: string;
  userId: string;
  phoneNumber: string;
  content: string;
  direction: 'incoming' | 'outgoing';
  messageId: string;
  timestamp: Date;
  createdAt: Date;
}

export interface BotCommand {
  command: string;
  description: string;
  handler: (msg: any, args: string[]) => Promise<void>;
  requiresSubscription?: boolean;
}
