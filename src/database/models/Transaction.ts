import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction {
  _id?: string;
  userId: string; // לקוח
  salesAgentId?: string; // סוכן מכירות (אופציונלי)
  type: 'payment' | 'debt' | 'credit' | 'refund'; // סוג התנועה
  amount: number; // סכום
  description: string; // תיאור
  referenceNumber?: string; // מספר אסמכתא
  paymentMethod?: 'cash' | 'credit_card' | 'bank_transfer' | 'check' | 'other';
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string; // הערות
  createdBy?: string; // מי יצר את התנועה
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransactionDocument extends Omit<ITransaction, '_id'>, Document {}

const transactionSchema = new Schema<ITransactionDocument>(
  {
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    salesAgentId: {
      type: String,
      ref: 'SalesAgent',
    },
    type: {
      type: String,
      enum: ['payment', 'debt', 'credit', 'refund'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    referenceNumber: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'credit_card', 'bank_transfer', 'check', 'other'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'completed',
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ salesAgentId: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ referenceNumber: 1 });

export const Transaction = mongoose.model<ITransactionDocument>('Transaction', transactionSchema);
