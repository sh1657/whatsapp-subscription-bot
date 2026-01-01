import { Client, LocalAuth, Message as WAMessage } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { config } from '../config';
import logger from '../config/logger';
import { User, Message, GroupMessage, isDatabaseConnected } from '../database';
import { BotCommand } from '../types';
import { SubscriptionService } from '../services/SubscriptionService';
import { PaymentService } from '../services/PaymentService';

export class WhatsAppBot {
  private client: Client;
  private commands: Map<string, BotCommand> = new Map();
  private subscriptionService: SubscriptionService;
  private paymentService: PaymentService;
  public latestQR: string = ''; // Store latest QR code

  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: config.whatsappSessionPath,
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    this.subscriptionService = new SubscriptionService();
    this.paymentService = new PaymentService();
    this.registerCommands();
    this.initializeEventHandlers();
  }

  private registerCommands(): void {
    // Help command
    this.commands.set('help', {
      command: 'help',
      description: 'הצג רשימת פקודות זמינות',
      handler: this.handleHelpCommand.bind(this),
    });

    // Subscribe command
    this.commands.set('subscribe', {
      command: 'subscribe',
      description: 'התחל מנוי חדש',
      handler: this.handleSubscribeCommand.bind(this),
    });

    // Status command
    this.commands.set('status', {
      command: 'status',
      description: 'בדוק את סטטוס המנוי שלך',
      handler: this.handleStatusCommand.bind(this),
    });

    // Trial command
    this.commands.set('trial', {
      command: 'trial',
      description: 'התחל תקופת ניסיון חינם',
      handler: this.handleTrialCommand.bind(this),
    });

    // Cancel command
    this.commands.set('cancel', {
      command: 'cancel',
      description: 'בטל מנוי',
      handler: this.handleCancelCommand.bind(this),
      requiresSubscription: true,
    });

    // Balance command
    this.commands.set('balance', {
      command: 'balance',
      description: 'הצג יתרה וחובות',
      handler: this.handleBalanceCommand.bind(this),
    });

    // Transactions command
    this.commands.set('transactions', {
      command: 'transactions',
      description: 'הצג היסטוריית תנועות',
      handler: this.handleTransactionsCommand.bind(this),
    });

    // Search command (פ)
    this.commands.set('פ', {
      command: 'פ',
      description: 'חפש הודעות בקבוצות - דוגמה: פ ים',
      handler: this.handleSearchCommand.bind(this),
    });
  }

  private initializeEventHandlers(): void {
    this.client.on('qr', (qr) => {
      this.latestQR = qr; // Store the latest QR code
      logger.info('🚨🚨🚨 VERSION 2026-01-01-FINAL 🚨🚨🚨');
      logger.info('📱 QR Code received, scan it with WhatsApp');
      logger.info('='.repeat(80));
      logger.info('🔗 SCAN THIS QR CODE URL:');
      logger.info('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(qr));
      logger.info('='.repeat(80));
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', () => {
      logger.info('✅ WhatsApp Bot is ready!');
    });

    this.client.on('authenticated', () => {
      logger.info('✅ WhatsApp authenticated');
    });

    this.client.on('auth_failure', (error) => {
      logger.error('❌ Authentication failed:', error);
    });

    this.client.on('disconnected', (reason) => {
      logger.warn('⚠️ WhatsApp disconnected:', reason);
    });

    this.client.on('message', this.handleMessage.bind(this));
  }

  private async handleMessage(message: WAMessage): Promise<void> {
    try {
      // Handle group messages separately
      if (message.from.includes('@g.us')) {
        await this.handleGroupMessage(message);
        return;
      }

      const phoneNumber = message.from.replace('@c.us', '');
      const content = message.body.trim();

      // Check if database is available
      if (!isDatabaseConnected()) {
        logger.warn('Database not connected, working in limited mode');
        // Work without DB - handle basic commands ONLY
        if (content.startsWith('/') || content.startsWith('!') || content.startsWith('פ ')) {
          const commandText = content.substring(1).toLowerCase();
          if (commandText.startsWith('help') || commandText.startsWith('start')) {
            await this.handleHelpCommandNoDb(message);
          } else if (commandText.startsWith('status')) {
            await message.reply('📊 *סטטוס מערכת*\n\n⚠️ מסד הנתונים לא מחובר כרגע.\nהמערכת פועלת במצב מוגבל.\n\nתכונות זמינות:\n✅ פקודות עזרה\n✅ תגובות בסיסיות\n\n❌ מנויים ותשלומים לא זמינים');
          } else if (content.startsWith('פ ')) {
            await message.reply('⚠️ פקודת החיפוש דורשת חיבור למסד נתונים.');
          } else {
            await message.reply('⚠️ מסד הנתונים לא מחובר. שלח !help או !start לקבלת מידע.');
          }
        }
        // Don't respond to regular messages when DB is not connected
        return;
      }

      // Save message to database
      await this.saveMessage(phoneNumber, content, 'incoming', message.id._serialized);

      // Get or create user
      let user = await User.findOne({ phoneNumber });
      if (!user) {
        user = await User.create({
          phoneNumber,
          subscriptionStatus: 'none',
          messageCount: 0,
          trialUsed: false,
        });
      }

      // Update message count
      user.messageCount += 1;
      user.lastMessageDate = new Date();
      await user.save();

      // Handle commands (support both / and ! and Hebrew פ)
      if (content.startsWith('/') || content.startsWith('!') || content.startsWith('פ ')) {
        await this.handleCommand(message, user);
      } else {
        // Handle regular messages
        await this.handleRegularMessage(message, user);
      }
    } catch (error) {
      logger.error('Error handling message:', error);
      await message.reply('אירעה שגיאה בעיבוד ההודעה. אנא נסה שוב מאוחר יותר.');
    }
  }

  private async handleCommand(message: WAMessage, user: any): Promise<void> {
    const content = message.body.trim();
    
    // Special handling for Hebrew "פ" command
    if (content.startsWith('פ ')) {
      const args = content.substring(2).trim().split(' ');
      const command = this.commands.get('פ');
      if (command) {
        await command.handler(message, args);
      }
      return;
    }

    // Handle regular commands with / or !
    const prefix = content.startsWith('/') || content.startsWith('!') ? 1 : 0;
    const [commandName, ...args] = content.slice(prefix).split(' ');
    const command = this.commands.get(commandName.toLowerCase());

    if (!command) {
      await message.reply(
        `פקודה לא מוכרת. שלח !help לרשימת הפקודות הזמינות.`
      );
      return;
    }

    // Check subscription requirement
    if (command.requiresSubscription && !user.hasActiveSubscription()) {
      await message.reply(
        `פקודה זו דורשת מנוי פעיל. שלח !subscribe להתחלת מנוי.`
      );
      return;
    }

    await command.handler(message, args);
  }

  private async handleHelpCommand(message: WAMessage): Promise<void> {
    const helpText = `
🤖 *פקודות זמינות:*

${Array.from(this.commands.values())
  .map((cmd) => `/${cmd.command} - ${cmd.description}`)
  .join('\n')}

לתמיכה, צור קשר עם הצוות שלנו.
    `.trim();

    await message.reply(helpText);
  }

  private async handleHelpCommandNoDb(message: WAMessage): Promise<void> {
    const helpText = `
🤖 *ברוכים הבאים לבוט WhatsApp!*

📱 *הבוט פועל ומחובר!* ✅

⚠️ *מצב נוכחי:* מוגבל
מסד הנתונים לא מחובר כרגע.

📋 *פקודות זמינות:*
• !help או !start - הצג תפריט זה
• !status - בדוק סטטוס המערכת
• פ <מילה> - חפש הודעות בקבוצות (דורש DB)

💡 *לתכונות מלאות:*
יש לחבר מסד נתונים MongoDB
(מנויים, תשלומים, ניהול משתמשים)

🔧 הבוט מוכן ומאזין להודעות!
    `.trim();

    await message.reply(helpText);
  }

  private async handleSubscribeCommand(message: WAMessage): Promise<void> {
    const phoneNumber = message.from.replace('@c.us', '');
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      await message.reply('אירעה שגיאה. אנא נסה שוב.');
      return;
    }

    if (user.hasActiveSubscription()) {
      await message.reply('יש לך כבר מנוי פעיל!');
      return;
    }

    const subscribeText = `
💎 *תוכניות מנוי:*

*תוכנית בסיסית* - $${config.basicPlanPrice}/חודש
✓ תכונה 1
✓ תכונה 2
✓ תכונה 3

*תוכנית פרימיום* - $${config.premiumPlanPrice}/חודש
✓ כל התכונות הבסיסיות
✓ תכונה 4
✓ תכונה 5
✓ תמיכה מועדפת

לרכישת מנוי, בקר באתר שלנו או צור איתנו קשר.
    `.trim();

    await message.reply(subscribeText);
  }

  private async handleStatusCommand(message: WAMessage): Promise<void> {
    const phoneNumber = message.from.replace('@c.us', '');
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      await message.reply('משתמש לא נמצא.');
      return;
    }

    let statusText = `
📊 *סטטוס המנוי שלך:*

סטטוס: ${this.getStatusText(user.subscriptionStatus)}
    `.trim();

    if (user.subscriptionPlan) {
      statusText += `\nתוכנית: ${user.subscriptionPlan === 'basic' ? 'בסיסית' : 'פרימיום'}`;
    }

    if (user.subscriptionEnd) {
      statusText += `\nתוקף עד: ${user.subscriptionEnd.toLocaleDateString('he-IL')}`;
    }

    statusText += `\nמספר הודעות: ${user.messageCount}`;

    await message.reply(statusText);
  }

  private async handleTrialCommand(message: WAMessage): Promise<void> {
    const phoneNumber = message.from.replace('@c.us', '');
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      await message.reply('אירעה שגיאה. אנא נסה שוב.');
      return;
    }

    if (!user.canUseTrial()) {
      await message.reply('כבר השתמשת בתקופת הניסיון שלך או שיש לך מנוי פעיל.');
      return;
    }

    await this.subscriptionService.startTrial(user._id.toString());

    await message.reply(
      `🎉 תקופת הניסיון החינמית שלך התחילה!\n\nתוכל ליהנות מכל התכונות במשך ${config.trialDays} ימים.`
    );
  }

  private async handleCancelCommand(message: WAMessage): Promise<void> {
    const phoneNumber = message.from.replace('@c.us', '');
    const user = await User.findOne({ phoneNumber });

    if (!user || !user.hasActiveSubscription()) {
      await message.reply('אין לך מנוי פעיל לביטול.');
      return;
    }

    // This would typically cancel via Stripe API
    await message.reply(
      'לביטול המנוי, אנא צור קשר עם התמיכה או בטל דרך האתר שלנו.'
    );
  }

  private async handleBalanceCommand(message: WAMessage): Promise<void> {
    try {
      const phoneNumber = message.from.replace('@c.us', '');
      const user = await User.findOne({ phoneNumber });

      if (!user) {
        await message.reply('משתמש לא נמצא במערכת.');
        return;
      }

      const balance = await this.paymentService.getUserBalance(user._id.toString());

      let balanceText = `💰 *יתרת החשבון שלך:*\n\n`;
      balanceText += `סך חובות: ₪${balance.totalDebt.toFixed(2)}\n`;
      balanceText += `סך זכויות: ₪${balance.totalCredit.toFixed(2)}\n`;
      balanceText += `יתרה נוכחית: ₪${Math.abs(balance.balance).toFixed(2)} (${balance.status})\n`;

      if (balance.lastTransaction) {
        balanceText += `\nתנועה אחרונה: ${balance.lastTransaction.toLocaleDateString('he-IL')}`;
      }

      await message.reply(balanceText);
    } catch (error) {
      logger.error('Error in balance command:', error);
      await message.reply('אירעה שגיאה בקבלת היתרה.');
    }
  }

  private async handleTransactionsCommand(message: WAMessage): Promise<void> {
    try {
      const phoneNumber = message.from.replace('@c.us', '');
      const user = await User.findOne({ phoneNumber });

      if (!user) {
        await message.reply('משתמש לא נמצא במערכת.');
        return;
      }

      const transactions = await this.paymentService.getTransactionHistory(user._id.toString(), 5);

      if (transactions.length === 0) {
        await message.reply('אין תנועות להצגה.');
        return;
      }

      let transText = `📋 *5 התנועות האחרונות:*\n\n`;

      for (const trans of transactions) {
        const typeMap: Record<string, string> = {
          payment: '💰 תשלום',
          debt: '📉 חוב',
          credit: '✅ זכות',
          refund: '↩️ החזר',
        };

        transText += `${typeMap[trans.type]} - ₪${trans.amount.toFixed(2)}\n`;
        transText += `${trans.description}\n`;
        transText += `${trans.createdAt.toLocaleDateString('he-IL')}\n`;
        if (trans.referenceNumber) {
          transText += `אסמכתא: ${trans.referenceNumber}\n`;
        }
        transText += `\n`;
      }

      await message.reply(transText);
    } catch (error) {
      logger.error('Error in transactions command:', error);
      await message.reply('אירעה שגיאה בקבלת ההיסטוריה.');
    }
  }

  private async handleRegularMessage(message: WAMessage, user: any): Promise<void> {
    if (!user.hasActiveSubscription()) {
      await message.reply(
        'שלום! כדי להשתמש בבוט, אנא התחל מנוי או תקופת ניסיון חינמית.\n\nשלח /trial לתקופת ניסיון חינמית\nשלח /subscribe למידע על מנויים'
      );
      return;
    }

    // Here you would implement your bot's main functionality
    await message.reply('הודעתך התקבלה! הבוט עובד על התשובה...');
  }

  private async saveMessage(
    phoneNumber: string,
    content: string,
    direction: 'incoming' | 'outgoing',
    messageId: string
  ): Promise<void> {
    try {
      const user = await User.findOne({ phoneNumber });
      if (!user) return;

      await Message.create({
        userId: user._id,
        phoneNumber,
        content,
        direction,
        messageId,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error saving message:', error);
    }
  }

  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      none: 'אין מנוי',
      trial: 'תקופת ניסיון',
      active: 'פעיל',
      expired: 'פג תוקף',
      cancelled: 'מבוטל',
    };
    return statusMap[status] || status;
  }

  // Handle group messages - save to database
  private async handleGroupMessage(message: WAMessage): Promise<void> {
    try {
      if (!isDatabaseConnected()) {
        return; // Don't save if DB not connected
      }

      const chat = await message.getChat();
      const contact = await message.getContact();
      
      await GroupMessage.create({
        groupId: message.from,
        groupName: chat.name || 'Unknown Group',
        senderNumber: contact.number || message.author || 'Unknown',
        senderName: contact.pushname || contact.name,
        content: message.body,
        messageId: message.id._serialized,
        timestamp: new Date(message.timestamp * 1000),
      });

      logger.info(`📥 Saved group message from ${chat.name}`);
    } catch (error) {
      logger.error('Error handling group message:', error);
    }
  }

  // Search command - פ <keyword>
  private async handleSearchCommand(message: WAMessage, args: string[]): Promise<void> {
    try {
      if (!isDatabaseConnected()) {
        await message.reply('⚠️ מסד הנתונים לא מחובר. לא ניתן לחפש.');
        return;
      }

      const searchTerm = args.join(' ').trim();
      if (!searchTerm) {
        await message.reply('❌ נא לציין מילה לחיפוש.\n\nדוגמה: פ ים');
        return;
      }

      logger.info(`🔍 Searching for messages starting with: ${searchTerm}`);

      // Search for messages that start with the search term
      const results = await GroupMessage.find({
        content: { $regex: `^${searchTerm}`, $options: 'i' }
      })
      .sort({ timestamp: -1 })
      .limit(20);

      if (results.length === 0) {
        await message.reply(`🔍 לא נמצאו הודעות שמתחילות ב-"${searchTerm}"`);
        return;
      }

      // Format results
      let response = `🔍 *נמצאו ${results.length} תוצאות עבור "${searchTerm}":*\n\n`;
      
      results.forEach((msg, index) => {
        const date = msg.timestamp.toLocaleDateString('he-IL');
        const time = msg.timestamp.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
        const preview = msg.content.length > 100 ? msg.content.substring(0, 100) + '...' : msg.content;
        
        response += `${index + 1}. 📱 *${msg.groupName}*\n`;
        response += `   👤 ${msg.senderName || msg.senderNumber}\n`;
        response += `   📅 ${date} ${time}\n`;
        response += `   💬 ${preview}\n\n`;
      });

      await message.reply(response);
      logger.info(`✅ Sent ${results.length} search results`);
    } catch (error) {
      logger.error('Error in search command:', error);
      await message.reply('❌ אירעה שגיאה בחיפוש. נסה שוב מאוחר יותר.');
    }
  }

  public async start(): Promise<void> {
    try {
      await this.client.initialize();
      logger.info('🚀 WhatsApp Bot starting...');
    } catch (error) {
      logger.error('Failed to start WhatsApp Bot:', error);
      throw error;
    }
  }

  public async sendMessage(phoneNumber: string, message: string): Promise<void> {
    try {
      const chatId = `${phoneNumber}@c.us`;
      await this.client.sendMessage(chatId, message);
      await this.saveMessage(phoneNumber, message, 'outgoing', Date.now().toString());
    } catch (error) {
      logger.error('Error sending message:', error);
      throw error;
    }
  }

  public getClient(): Client {
    return this.client;
  }
}
