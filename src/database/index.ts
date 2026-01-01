import mongoose from 'mongoose';
import { config } from '../config';
import logger from '../config/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    if (!config.mongodbUri) {
      logger.warn('⚠️  MongoDB URI not configured, running without database');
      return;
    }
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      connectTimeoutMS: 10000
    });
    logger.info('✅ Connected to MongoDB');
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error);
    logger.warn('⚠️  Continuing without database...');
    // Don't exit - continue without MongoDB
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  logger.error('❌ MongoDB error:', error);
});

// Helper function to check if database is connected
export const isDatabaseConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

export * from './models/User';
export * from './models/SubscriptionPlan';
export * from './models/Payment';
export * from './models/Message';
export * from './models/GroupMessage';
export * from './models/SalesAgent';
export * from './models/Transaction';
export * from './models/Balance';
