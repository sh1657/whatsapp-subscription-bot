import { connectDatabase } from './database';
import { WhatsAppBot } from './bot/WhatsAppBot';
import { ApiServer } from './api';
import { CronJobs } from './config/cron';
import logger from './config/logger';

async function main() {
  try {
    logger.info('🚀 Starting WhatsApp Bot Application...');

    // Connect to database
    await connectDatabase();

    // Start API server
    const apiServer = new ApiServer();
    apiServer.start();

    // Start WhatsApp bot
    const bot = new WhatsAppBot();
    await bot.start();

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
