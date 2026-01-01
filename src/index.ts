import { connectDatabase } from './database';
import { WhatsAppBot } from './bot/WhatsAppBot';
import { ApiServer } from './api';
import { CronJobs } from './config/cron';
import logger from './config/logger';

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

async function main() {
  try {
    // Railway force redeploy - connecting to MongoDB
    logger.info('🚀 Starting WhatsApp Bot Application...');

    // Start WhatsApp bot first to initialize QR
    logger.info('📱 Initializing WhatsApp client...');
    const bot = new WhatsAppBot();
    bot.start().catch(error => {
      logger.error('❌ WhatsApp bot failed:', error);
    });

    // Start API server with bot instance - Render needs to see port open immediately!
    logger.info('📡 Starting API server...');
    const apiServer = new ApiServer(bot);
    await apiServer.start();
    logger.info('✅ API Server is ready on port!');

    // Connect to database in background (don't block)
    connectDatabase().catch(error => {
      logger.error('❌ Database connection failed:', error);
    });

    // Start cron jobs
    const cronJobs = new CronJobs();
    cronJobs.start();

    logger.info('✅ All services started successfully!');
  } catch (error) {
    logger.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

main();
