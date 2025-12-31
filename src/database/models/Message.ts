import mongoose, { Schema, Document } from 'mongoose';

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

export interface IMessageDocument extends Omit<IMessage, '_id'>, Document {}

const messageSchema = new Schema<IMessageDocument>(
  {
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    direction: {
      type: String,
      enum: ['incoming', 'outgoing'],
      required: true,
    },
    messageId: {
      type: String,
      required: true,
      unique: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
messageSchema.index({ userId: 1, timestamp: -1 });
messageSchema.index({ phoneNumber: 1, timestamp: -1 });
messageSchema.index({ messageId: 1 });

export const Message = mongoose.model<IMessageDocument>('Message', messageSchema);
