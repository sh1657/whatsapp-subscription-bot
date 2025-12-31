import mongoose, { Schema, Document } from 'mongoose';

export interface IBalance {
  _id?: string;
  userId: string;
  totalDebt: number; // סך החוב
  totalCredit: number; // סך הזכות
  balance: number; // יתרה נוכחית (חיובי = זכות, שלילי = חוב)
  lastTransactionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBalanceDocument extends Omit<IBalance, '_id'>, Document {
  updateBalance(amount: number, type: 'payment' | 'debt' | 'credit' | 'refund'): void;
}

const balanceSchema = new Schema<IBalanceDocument>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      ref: 'User',
    },
    totalDebt: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCredit: {
      type: Number,
      default: 0,
      min: 0,
    },
    balance: {
      type: Number,
      default: 0,
    },
    lastTransactionDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes (userId has unique index automatically)
balanceSchema.index({ balance: 1 });

// Methods
balanceSchema.methods.updateBalance = function (amount: number, type: 'payment' | 'debt' | 'credit' | 'refund'): void {
  switch (type) {
    case 'payment':
      // תשלום מקטין את החוב
      this.balance += amount;
      break;
    case 'debt':
      // חוב חדש
      this.totalDebt += amount;
      this.balance -= amount;
      break;
    case 'credit':
      // זכות
      this.totalCredit += amount;
      this.balance += amount;
      break;
    case 'refund':
      // החזר כספי
      this.balance -= amount;
      break;
  }
  this.lastTransactionDate = new Date();
};

export const Balance = mongoose.model<IBalanceDocument>('Balance', balanceSchema);
