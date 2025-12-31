import mongoose, { Schema, Document } from 'mongoose';

export interface ISalesAgent {
  _id?: string;
  name: string;
  phoneNumber: string;
  email?: string;
  commissionRate: number; // אחוז עמלה
  totalSales: number; // סך המכירות
  totalCommission: number; // סך העמלות
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISalesAgentDocument extends Omit<ISalesAgent, '_id'>, Document {}

const salesAgentSchema = new Schema<ISalesAgentDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    commissionRate: {
      type: Number,
      required: true,
      default: 10, // 10% ברירת מחדל
      min: 0,
      max: 100,
    },
    totalSales: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCommission: {
      type: Number,
      default: 0,
      min: 0,
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

// Indexes (phoneNumber has unique index automatically)
salesAgentSchema.index({ active: 1 });

export const SalesAgent = mongoose.model<ISalesAgentDocument>('SalesAgent', salesAgentSchema);
