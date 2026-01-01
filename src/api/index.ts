import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from '../config';
import logger from '../config/logger';
import usersRouter from './routes/users';
import subscriptionsRouter from './routes/subscriptions';
import paymentsRouter from './routes/payments';
import agentsRouter from './routes/agents';
import { errorHandler, notFound } from './middleware/errorHandler';

export class ApiServer {
  private app: Express;

  constructor() {
    this.app = express();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security
    this.app.use(helmet());
    this.app.use(cors());

    // Body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Logging
    this.app.use((req, _res, next) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get('/health', (_req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // API routes
    this.app.use('/api/users', usersRouter);
    this.app.use('/api/subscriptions', subscriptionsRouter);
    this.app.use('/api/payments', paymentsRouter);
    this.app.use('/api/agents', agentsRouter);

    // Welcome route
    this.app.get('/', (_req, res) => {
      res.json({
        message: 'WhatsApp Bot API',
        version: '1.0.0',
        endpoints: {
          users: '/api/users',
          subscriptions: '/api/subscriptions',
          payments: '/api/payments',
          agents: '/api/agents',
        },
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(notFound);
    this.app.use(errorHandler);
  }

  public start(): Promise<void> {
    return new Promise((resolve) => {
      const port = config.port;
      this.app.listen(port, () => {
        logger.info(`🚀 API Server running on port ${port}`);
        logger.info(`📍 http://localhost:${port}`);
        resolve();
      });
    });
  }

  public getApp(): Express {
    return this.app;
  }
}
