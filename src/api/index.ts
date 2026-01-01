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
import { WhatsAppBot } from '../bot/WhatsAppBot';

export class ApiServer {
  private app: Express;
  private bot?: WhatsAppBot;

  constructor(bot?: WhatsAppBot) {
    this.app = express();
    this.bot = bot;
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

    // QR Code Page - Auto-refreshing
    this.app.get('/qr', (_req, res) => {
      if (!this.bot || !this.bot.latestQR) {
        res.send(`
          <!DOCTYPE html>
          <html dir="rtl">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>WhatsApp QR Code</title>
            <meta http-equiv="refresh" content="3">
            <style>
              body { font-family: Arial; text-align: center; padding: 50px; background: #f0f0f0; }
              .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
              h1 { color: #25D366; }
              .loading { font-size: 18px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>⏳ ממתין ל-QR Code...</h1>
              <p class="loading">הבוט מתחיל, אנא המתן...</p>
              <p style="color: #999; font-size: 14px;">הדף יתרענן אוטומטית</p>
            </div>
          </body>
          </html>
        `);
        return;
      }

      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(this.bot.latestQR)}`;
      res.send(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>WhatsApp QR Code</title>
          <meta http-equiv="refresh" content="15">
          <style>
            body { 
              font-family: Arial; 
              text-align: center; 
              padding: 20px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              margin: 0;
            }
            .container { 
              background: white; 
              padding: 30px; 
              border-radius: 15px; 
              box-shadow: 0 10px 40px rgba(0,0,0,0.2); 
              max-width: 500px; 
              margin: 0 auto;
            }
            h1 { color: #25D366; margin-bottom: 10px; }
            .subtitle { color: #666; margin-bottom: 20px; }
            img { 
              width: 100%; 
              max-width: 400px; 
              border: 3px solid #25D366; 
              border-radius: 10px;
              margin: 20px 0;
            }
            .instructions { 
              text-align: right; 
              margin: 20px 0; 
              padding: 15px; 
              background: #f8f9fa; 
              border-radius: 8px;
              line-height: 1.8;
            }
            .timer { 
              color: #ff6b6b; 
              font-weight: bold; 
              font-size: 18px; 
              margin: 15px 0;
            }
            .refresh-note {
              color: #999;
              font-size: 14px;
              margin-top: 20px;
            }
            .step { 
              margin: 10px 0; 
              padding: 10px;
              background: white;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📱 WhatsApp Bot QR Code</h1>
            <p class="subtitle">סרוק את הקוד כדי לחבר את הבוט</p>
            
            <img src="${qrUrl}" alt="QR Code">
            
            <div class="timer">⏱️ הקוד תקף ל-20 שניות</div>
            
            <div class="instructions">
              <div class="step">1️⃣ פתח WhatsApp בטלפון</div>
              <div class="step">2️⃣ לחץ על ⚙️ <strong>הגדרות</strong></div>
              <div class="step">3️⃣ בחר <strong>מכשירים מקושרים</strong></div>
              <div class="step">4️⃣ לחץ על <strong>➕ קשר מכשיר</strong></div>
              <div class="step">5️⃣ <strong>סרוק את הקוד למעלה</strong></div>
            </div>
            
            <p class="refresh-note">
              🔄 הדף מתרענן אוטומטית כל 15 שניות<br>
              אם הקוד לא עובד, המתן לרענון
            </p>
          </div>
        </body>
        </html>
      `);
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
        qrPage: '/qr',
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
