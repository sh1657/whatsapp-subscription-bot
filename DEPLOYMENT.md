# בוט וואטסאפ - מדריך הפעלה

## הרצה מקומית

### דרישות
- Node.js 18+
- MongoDB Atlas חשבון (חינם)

### שלבים:

1. **התקן תלויות:**
```bash
npm install
```

2. **ערוך את `.env`:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsapp-bot
ADMIN_PHONE_NUMBERS=972XXXXXXXXX
JWT_SECRET=your-secret-key
```

3. **בנה את הפרויקט:**
```bash
npm run build
```

4. **הרץ את הבוט:**
```bash
npm run dev
```

5. **סרוק QR Code** - יופיע בטרמינל

## פקודות הבוט

### למשתמשים:
- `/help` - עזרה
- `/balance` - יתרה וחובות
- `/transactions` - היסטוריית תנועות
- `/status` - סטטוס מנוי
- `/trial` - תקופת ניסיון חינם

### למנהלים (דרך API):

#### הוספת חוב ללקוח:
```bash
POST /api/payments/debt
{
  "amount": 100,
  "description": "רכישת מוצר X",
  "salesAgentId": "optional",
  "referenceNumber": "INV-001"
}
```

#### רישום תשלום:
```bash
POST /api/payments/payment
{
  "amount": 100,
  "description": "תשלום עבור חוב",
  "paymentMethod": "cash",
  "referenceNumber": "REC-001"
}
```

#### הוספת זכות:
```bash
POST /api/payments/credit
{
  "amount": 50,
  "description": "החזר כספי",
  "referenceNumber": "REF-001"
}
```

#### צפייה ביתרה:
```bash
GET /api/payments/balance
```

#### יצירת סוכן מכירות:
```bash
POST /api/agents
{
  "name": "ישראל ישראלי",
  "phoneNumber": "972501234567",
  "commissionRate": 10,
  "email": "israel@example.com"
}
```

## פריסה ל-Railway

### אופציה 1: דרך GitHub

1. העלה את הקוד ל-GitHub (ללא `.env`)
2. היכנס ל-Railway.app
3. לחץ "New Project" > "Deploy from GitHub"
4. בחר את ה-Repository
5. הוסף משתני סביבה:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `ADMIN_PHONE_NUMBERS`
   - `NODE_ENV=production`

### אופציה 2: דרך Railway CLI

```bash
# התקן Railway CLI
npm i -g @railway/cli

# התחבר
railway login

# צור פרויקט חדש
railway init

# הוסף משתני סביבה
railway variables set MONGODB_URI="your-connection-string"
railway variables set JWT_SECRET="your-secret"
railway variables set ADMIN_PHONE_NUMBERS="972XXXXXXXXX"
railway variables set NODE_ENV="production"

# פרוס
railway up
```

## הערות חשובות

### WhatsApp Session
- בהרצה ראשונה תצטרך לסרוק QR Code
- ה-Session נשמר בתיקייה `.wwebjs_auth`
- ב-Railway צריך להשתמש ב-Volume כדי לשמור את ה-Session

### MongoDB Atlas
- וודא שכתובת ה-IP של Railway מורשית
- או הוסף `0.0.0.0/0` (כל כתובות IP) בהגדרות ה-Network Access

### אבטחה
- שמור על ה-JWT_SECRET בסוד
- אל תעלה קובץ `.env` ל-Git
- השתמש במשתני סביבה ב-Railway

## תמיכה

לבעיות ושאלות, בדוק את הלוגים:
```bash
railway logs
```

או הרץ מקומית עם:
```bash
npm run dev
```
