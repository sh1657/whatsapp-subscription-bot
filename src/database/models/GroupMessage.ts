import mongoose, { Schema, Document } from 'mongoose';

export interface IGroupMessage {
  _id?: string;
  groupId: string;
  groupName: string;
  senderNumber: string;
  senderName?: string;
  content: string;
  messageId: string;
  timestamp: Date;
  createdAt: Date;
}

export interface IGroupMessageDocument extends Omit<IGroupMessage, '_id'>, Document {}

const groupMessageSchema = new Schema<IGroupMessageDocument>(
  {
    groupId: {
      type: String,
      required: true,
      index: true,
    },
    groupName: {
      type: String,
      required: true,
    },
    senderNumber: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
    },
    content: {
      type: String,
      required: true,
      index: true, // For text search
    },
    messageId: {
      type: String,
      required: true,
      unique: true,
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient search
groupMessageSchema.index({ content: 'text' }); // Text search
groupMessageSchema.index({ groupId: 1, timestamp: -1 });
groupMessageSchema.index({ timestamp: -1 });

export const GroupMessage = mongoose.model<IGroupMessageDocument>('GroupMessage', groupMessageSchema);
