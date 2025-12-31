import mongoose, { Schema, Document } from 'mongoose';

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

export interface IPaymentDocument extends Omit<IPayment, '_id'>, Document {}

const paymentSchema = new Schema<IPaymentDocument>(
  {
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    stripePaymentId: {
      type: String,
      required: true,
    },
    subscriptionPlan: {
      type: String,
      enum: ['basic', 'premium'],
      required: true,
    },
    paymentMethod: {
      type: String,
      default: 'card',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ stripePaymentId: 1 });
paymentSchema.index({ status: 1 });

export const Payment = mongoose.model<IPaymentDocument>('Payment', paymentSchema);
