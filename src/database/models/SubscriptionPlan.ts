import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscriptionPlan {
  _id?: string;
  name: string;
  type: 'basic' | 'premium';
  price: number;
  currency: string;
  duration: number;
  features: string[];
  messageLimit?: number;
  stripePriceId: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubscriptionPlanDocument extends Omit<ISubscriptionPlan, '_id'>, Document {}

const subscriptionPlanSchema = new Schema<ISubscriptionPlanDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['basic', 'premium'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    duration: {
      type: Number,
      required: true,
      default: 30, // 30 days
    },
    features: {
      type: [String],
      default: [],
    },
    messageLimit: {
      type: Number,
    },
    stripePriceId: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
subscriptionPlanSchema.index({ type: 1, active: 1 });

export const SubscriptionPlan = mongoose.model<ISubscriptionPlanDocument>(
  'SubscriptionPlan',
  subscriptionPlanSchema
);
