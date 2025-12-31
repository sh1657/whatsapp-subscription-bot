import mongoose from 'mongoose';
import { config } from '../config';
import logger from '../config/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongodbUri);
    logger.info('✅ Connected to MongoDB');
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  logger.error('❌ MongoDB error:', error);
});

export * from './models/User';
export * from './models/SubscriptionPlan';
export * from './models/Payment';
export * from './models/Message';
export * from './models/SalesAgent';
export * from './models/Transaction';
export * from './models/Balance';
