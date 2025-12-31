# WhatsApp Bot with Payment Management 🤖💰

בוט וואטסאפ מתקדם עם מערכת ניהול תשלומים, חובות וזכויות ללקוחות וסוכני מכירות.

## ✨ תכונות

- 🤖 בוט וואטסאפ מלא עם מערכת פקודות
- 💰 ניהול חובות וזכויות ללקוחות
- 👥 ניהול סוכני מכירות ועמלות
- 📊 מעקב אחר תנועות ויתרות
- 📈 דוחות מכירות לסוכנים
- 🎁 תקופת ניסיון חינם למשתמשים חדשים
- 🔐 אימות והרשאות משתמשים
- 📱 REST API מלא
- 🗄️ MongoDB Atlas
- ⏰ מערכת Cron Jobs
- 🚀 מוכן לפריסה ב-Railway.app

## 📋 דרישות מקדימות

- Node.js >= 18.0.0
- MongoDB Atlas (חשבון חינם)
- Railway.app (אופציונלי - לפריסה בענן)
- מספר טלפון לוואטסאפ

## 🚀 התקנה

### שלב 1: שכפל והתקן

```bash
git clone <repository-url>
cd whatsapp-bot
npm install
```

### שלב 2: MongoDB Atlas

1. היכנס ל-https://cloud.mongodb.com
2. צור Cluster חינם
3. לחץ על "Connect" > "Connect your application"
4. העתק את ה-Connection String
5. החלף `<username>` ו-`<password>` בפרטים שלך

### שלב 3: הגדר משתני סביבה

ערוך את קובץ `.env`:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsapp-bot

# JWT Secret - שנה למפתח סודי חזק
JWT_SECRET=whatsapp-bot-secret-key-2025

# מספר הטלפון שלך (ללא +, רק ספרות)
ADMIN_PHONE_NUMBERS=972501234567

# מחירים (אופציונלי)
BASIC_PLAN_PRICE=49.99
PREMIUM_PLAN_PRICE=99.99
```

### שלב 4: בנה והרץ

```bash
# בניית הפרויקט
npm run build

# הרצה במצב פיתוח
npm run dev

# או במצב ייצור
npm start
```

### שלב 5: סרוק QR Code

אחרי ההרצה, QR Code יופיע בטרמינל - סרוק אותו עם WhatsApp.

---

## 🚂 פריסה ל-Railway.app

### דרך ממשק הווב:

1. **העלה ל-GitHub** (ללא קובץ `.env`)
2. **היכנס ל-Railway**: https://railway.app
3. **New Project** > **Deploy from GitHub**
4. **בחר את ה-Repository שלך**
5. **הוסף משתני סביבה** (Variables):
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your-secret-key
   ADMIN_PHONE_NUMBERS=972501234567
   NODE_ENV=production
   ```
6. **Deploy!** 🚀

### דרך Railway CLI:

```bash
# התקן CLI
npm i -g @railway/cli

# התחבר
railway login

# אתחל פרויקט
railway init

# הוסף משתני סביבה
railway variables set MONGODB_URI="your-mongodb-uri"
railway variables set JWT_SECRET="your-secret"
railway variables set ADMIN_PHONE_NUMBERS="972501234567"
railway variables set NODE_ENV="production"

# פרוס
railway up

# צפה בלוגים
railway logs
```

**⚠️ חשוב**: אחרי הפריסה ל-Railway, תצטרך לגשת ללוגים (`railway logs`) כדי לראות את ה-QR Code ולסרוק אותו בפעם הראשונה.

## 📱 פקודות בוט וואטסאפ

המשתמשים יכולים לשלוח את הפקודות הבאות לבוט:

- `/help` - הצג רשימת פקודות זמינות
- `/balance` - הצג יתרה, חובות וזכויות
- `/transactions` - הצג היסטוריית 5 תנועות אחרונות
- `/status` - בדוק סטטוס מנוי
- `/trial` - התחל תקופת ניסיון חינם (7 ימים)
- `/subscribe` - מידע על תוכניות מנוי
- `/cancel` - בטל מנוי

## 🔌 API Endpoints

### Authentication
כל ה-endpoints (חוץ מ-login) דורשים JWT Token ב-header:
```
Authorization: Bearer <token>
```

### Users
- `POST /api/users/login` - התחבר או צור משתמש חדש
  ```json
  { "phoneNumber": "972501234567", "name": "שם", "email": "email@example.com" }
  ```
- `GET /api/users/profile` - קבל פרופיל משתמש
- `PUT /api/users/profile` - עדכן פרופיל
- `GET /api/users/subscription` - פרטי מנוי

### Payments & Transactions
- `POST /api/payments/debt` - הוסף חוב ללקוח
  ```json
  {
    "amount": 100,
    "description": "רכישת מוצר X",
    "salesAgentId": "optional",
    "referenceNumber": "INV-001"
  }
  ```
- `POST /api/payments/payment` - רשום תשלום מלקוח
  ```json
  {
    "amount": 100,
    "description": "תשלום עבור חוב",
    "paymentMethod": "cash",
    "referenceNumber": "REC-001"
  }
  ```
- `POST /api/payments/credit` - הוסף זכות ללקוח
  ```json
  {
    "amount": 50,
    "description": "החזר כספי",
    "referenceNumber": "REF-001"
  }
  ```
- `GET /api/payments/balance` - קבל יתרת לקוח
- `GET /api/payments/transactions?limit=10` - היסטוריית תנועות
- `GET /api/payments/statistics` - סטטיסטיקות כלליות (מנהלים)

### Sales Agents
- `POST /api/agents` - צור סוכן מכירות חדש
  ```json
  {
    "name": "ישראל ישראלי",
    "phoneNumber": "972501234567",
    "commissionRate": 10,
    "email": "israel@example.com"
  }
  ```
- `GET /api/agents/:agentId/report` - קבל דוח מכירות לסוכן

### Subscriptions
- `POST /api/subscriptions/trial` - התחל תקופת ניסיון
- `POST /api/subscriptions/cancel` - בטל מנוי
- `GET /api/subscriptions/statistics` - סטטיסטיקות מנויים

## 🗂️ מבנה הפרויקט

```
├── src/
│   ├── api/                 # REST API
│   │   ├── middleware/      # Middleware (auth, errors)
│   │   ├── routes/          # Route handlers
│   │   └── index.ts         # API server
│   ├── bot/                 # WhatsApp bot
│   │   └── WhatsAppBot.ts   # Bot logic
│   ├── config/              # Configuration
│   │   ├── index.ts         # Main config
│   │   ├── logger.ts        # Winston logger
│   │   └── cron.ts          # Cron jobs
│   ├── database/            # Database
│   │   ├── models/          # Mongoose models
│   │   └── index.ts         # DB connection
│   ├── services/            # Business logic
│   │   ├── SubscriptionService.ts
│   │   └── PaymentService.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   └── index.ts             # Entry point
├── .env.example             # Example environment variables
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 אבטחה

- JWT לאימות משתמשים
- Helmet.js לאבטחת HTTP headers
- Environment variables לסודות
- Stripe webhook signature verification
- Rate limiting (מומלץ להוסיף)

## 🎨 תוכניות מנוי

### תוכנית בסיסית ($9.99/חודש)
- גישה לכל הפקודות הבסיסיות
- תמיכה סטנדרטית
- מגבלת הודעות (אופציונלי)

### תוכנית פרימיום ($19.99/חודש)
- כל התכונות הבסיסיות
- תכונות מתקדמות
- תמיכה מועדפת
- ללא מגבלת הודעות

## 📊 Monitoring

הלוגים נשמרים בתיקיית `logs/`:
- `error.log` - שגיאות בלבד
- `combined.log` - כל הלוגים

## 🔄 Stripe Webhooks

להגדרת Webhooks ב-Stripe:

1. עבור ל-Stripe Dashboard > Developers > Webhooks
2. הוסף endpoint: `https://your-domain.com/api/payments/webhook`
3. בחר events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. העתק את ה-signing secret ל-`.env`

## 🧪 בדיקות

```bash
npm test
```

## 📝 Logging

הפרויקט משתמש ב-Winston לניהול לוגים:
- Console logs במצב development
- File logs בכל המצבים
- Structured logging עם timestamps

## 🛠️ פיתוח

### הוספת פקודה חדשה לבוט:

ב-`src/bot/WhatsAppBot.ts`, הוסף ל-`registerCommands()`:

```typescript
this.commands.set('mycommand', {
  command: 'mycommand',
  description: 'תיאור הפקודה',
  handler: this.handleMyCommand.bind(this),
  requiresSubscription: true, // אופציונלי
});
```

### הוספת route חדש:

צור קובץ חדש ב-`src/api/routes/` ויבא אותו ב-`src/api/index.ts`.

## 🐛 Troubleshooting

### הבוט לא מתחבר לוואטסאפ:
- וודא שסרקת את ה-QR code
- בדוק שהתיקייה `.wwebjs_auth` קיימת
- אתחל את ה-session: מחק `.wwebjs_auth` והתחל מחדש

### שגיאות Stripe:
- וודא שה-API keys נכונים
- בדוק שה-webhook secret מוגדר
- ודא שהמוצרים והמחירים קיימים ב-Stripe

### שגיאות MongoDB:
- וודא ש-MongoDB רץ
- בדוק את ה-connection string ב-`.env`

## 📄 License

MIT

## 👤 יוצר

שם שלך

## 🤝 תרומה

Pull requests מתקבלים בברכה!

1. Fork את הפרויקט
2. צור branch לתכונה שלך (`git checkout -b feature/AmazingFeature`)
3. Commit את השינויים (`git commit -m 'Add some AmazingFeature'`)
4. Push ל-branch (`git push origin feature/AmazingFeature`)
5. פתח Pull Request

## 📞 תמיכה

לשאלות ותמיכה, פנה אלינו ב:
- Email: support@example.com
- WhatsApp: +972-XX-XXXXXXX
