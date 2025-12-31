import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-bot',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpire: process.env.JWT_EXPIRE || '7d',

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  stripePriceIdBasic: process.env.STRIPE_PRICE_ID_BASIC || '',
  stripePriceIdPremium: process.env.STRIPE_PRICE_ID_PREMIUM || '',

  // WhatsApp
  whatsappSessionPath: process.env.WHATSAPP_SESSION_PATH || './.wwebjs_auth',

  // Admin
  adminPhoneNumbers: process.env.ADMIN_PHONE_NUMBERS?.split(',') || [],

  // Subscription Plans
  basicPlanPrice: parseFloat(process.env.BASIC_PLAN_PRICE || '9.99'),
  premiumPlanPrice: parseFloat(process.env.PREMIUM_PLAN_PRICE || '19.99'),
  trialDays: parseInt(process.env.TRIAL_DAYS || '7'),
};
