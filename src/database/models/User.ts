import mongoose, { Schema, Document } from 'mongoose';

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

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  hasActiveSubscription(): boolean;
  canUseTrial(): boolean;
}

const userSchema = new Schema<IUserDocument>(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    subscriptionStatus: {
      type: String,
      enum: ['none', 'trial', 'active', 'expired', 'cancelled'],
      default: 'none',
    },
    subscriptionPlan: {
      type: String,
      enum: ['basic', 'premium'],
    },
    subscriptionStart: {
      type: Date,
    },
    subscriptionEnd: {
      type: Date,
    },
    stripeCustomerId: {
      type: String,
    },
    stripeSubscriptionId: {
      type: String,
    },
    trialUsed: {
      type: Boolean,
      default: false,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    lastMessageDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes (phoneNumber has unique index automatically)
userSchema.index({ stripeCustomerId: 1 });
userSchema.index({ subscriptionStatus: 1 });

// Methods
userSchema.methods.hasActiveSubscription = function (): boolean {
  return (
    this.subscriptionStatus === 'active' ||
    this.subscriptionStatus === 'trial'
  );
};

userSchema.methods.canUseTrial = function (): boolean {
  return !this.trialUsed && this.subscriptionStatus === 'none';
};

export const User = mongoose.model<IUserDocument>('User', userSchema);
