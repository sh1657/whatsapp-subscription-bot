# 🚀 מדריך התחלה מהירה - פריסה ל-Railway

מדריך זה ילווה אותך שלב אחר שלב לפריסת הבוט ב-Railway.app

---

## ✅ שלב 1: בחר MongoDB - יש לך 2 אפשרויות!

### 🎯 אפשרות 1: MongoDB ב-Railway (מומלץ! פשוט יותר)

**יתרונות:**
- ✅ הכל באותו מקום (Railway)
- ✅ התקנה אוטומטית
- ✅ Connection String נוצר אוטומטית
- ✅ אין צורך ברישום נפרד

**איך עושים:**
1. היכנס ל-[Railway.app](https://railway.app) → **Login with GitHub**
2. לחץ **New Project**
3. **בחר "Provision MongoDB"** (או "Add Database" → MongoDB)
4. Railway יתקין MongoDB אוטומטית!
5. לחץ על MongoDB service
6. לחץ **Variables** → תראה `MONGO_URL` - זה ה-Connection String שלך!
7. **העתק את ה-`MONGO_URL`** - תצטרך אותו בשלב 2

**זהו! MongoDB מוכן תוך דקה אחת** 🚀

---

### 🌍 אפשרות 2: MongoDB Atlas (חינמי, נפרד)

**יתרונות:**
- ✅ 512MB חינם לתמיד
- ✅ ניהול מתקדם יותר
- ✅ Backups אוטומטיים

**איך עושים:**

#### 1.1 יצירת חשבון
1. היכנס ל-[MongoDB Atlas](https://cloud.mongodb.com)
2. **Sign In** או **Register**
3. לחץ **Create** → **Free Shared Cluster (M0)**
4. בחר Region קרוב (Frankfurt/Paris)
5. **Create Cluster** (המתן 2-3 דקות)

#### 1.2 הגדרת גישה
1. צד שמאל: **Database Access** → **Add New Database User**
   - Username: `whatsappbot`
   - Password: סיסמה חזקה (**שמור אותה!**)
   - Privileges: **Read and write to any database**
   - **Add User**

2. צד שמאל: **Network Access** → **Add IP Address**
   - **Allow Access From Anywhere** (0.0.0.0/0)
   - **Confirm**

#### 1.3 קבלת Connection String
1. **Database** → **Connect** → **Connect your application**
2. העתק את ה-Connection String:
   ```
   mongodb+srv://whatsappbot:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
3. **החלף** `<password>` בסיסמה האמיתית
4. **הוסף** `/whatsappbot` לפני ה-`?`:
   ```
   mongodb+srv://whatsappbot:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/whatsappbot?retryWrites=true&w=majority
   ```

**✅ שמור את ה-Connection String!**

---

**💡 המלצה שלי:** אם אתה רק מתחיל, תשתמש ב-**Railway MongoDB** (אפשרות 1) - זה הרבה יותר פשוט!

---

## ✅ שלב 2: הגדרת קובץ .env (2 דקות)

**⚠️ שים לב:** אם בחרת ב-Railway MongoDB, תעדכן את ה-`MONGODB_URI` **אחרי** שתפרוס ל-Railway (שלב 4).
אם בחרת ב-MongoDB Atlas, תעדכן עכשיו.

1. פתח את הקובץ `.env` בפרויקט (אם לא קיים, העתק מ-`.env.example`)

2. עדכן את הערכים:
```env
# MongoDB - הדבק את ה-Connection String שקיבלת
# אם Railway: תעדכן בשלב 4
# אם Atlas: הדבק עכשיו
MONGODB_URI=mongodb+srv://whatsappbot:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/whatsappbot?retryWrites=true&w=majority

# JWT Secret - צור מחרוזת אקראית חזקה (לחץ על מקלדת אקראי)
JWT_SECRET=kJ8nM2pQ5vX9wZ3bC7fG1hL4jN6rT8yU0eW2aS5dF9gH3kM7pR1tV4xZ8bN0cQ6

# מספר הטלפון שלך (ללא + או מקפים)
# דוגמה: אם המספר שלך +972-50-123-4567 רשום: 972501234567
ADMIN_PHONE_NUMBERS=972501234567

# שאר ההגדרות (אופציונלי)
PORT=3000
NODE_ENV=production
TRIAL_DAYS=7
```

3. **שמור את הקובץ**

**💡 טיפ:** אם אתה משתמש ב-Railway MongoDB, אל תדאג - ה-Connection String יתעדכן אוטומטית ב-Railway!

---

## ✅ שלב 3: העלאה ל-GitHub (5 דקות)

### 3.1 אתחול Git
פתח Terminal בתיקיית הפרויקט והרץ:

```bash
git init
git add .
git commit -m "Initial commit - WhatsApp Bot"
```

### 3.2 יצירת Repository ב-GitHub
1. היכנס ל-[GitHub](https://github.com)
2. לחץ **New Repository** (סימן + למעלה)
3. שם Repository: `whatsapp-subscription-bot`
4. **אל תסמן** "Initialize with README" (יש לנו כבר)
5. לחץ **Create Repository**

### 3.3 העלאת הקוד
GitHub יציג הוראות, העתק והרץ:

```bash
git remote add origin https://github.com/YOUR_USERNAME/whatsapp-subscription-bot.git
git branch -M main
git push -u origin main
```

**✅ הקוד עלה ל-GitHub (קובץ .env לא עולה - הוא ב-gitignore)**

---

## ✅ שלב 4: פריסה ל-Railway (10 דקות)

### 4.1 התחברות ל-Railway
1. היכנס ל-[Railway.app](https://railway.app)
2. **Login with GitHub** → אשר גישה

### 4.2 הוספת MongoDB (אם בחרת באפשרות Railway)
אם עוד לא עשית זאת בשלב 1:
1. **New Project** → **Provision MongoDB**
2. Railway מתקין MongoDB אוטומטית
3. לחץ על MongoDB service → **Variables** → העתק `MONGO_URL`

### 4.3 פריסת הבוט
1. באותו Project, לחץ **New Service** (או **+**)
2. בחר **Deploy from GitHub repo**
3. בחר את ה-Repository: `whatsapp-subscription-bot`
4. Railway מתחיל לבנות את הפרויקט

### 4.4 קישור MongoDB לבוט (אם Railway MongoDB)
אם השתמשת ב-Railway MongoDB:
1. לחץ על ה-**bot service** (לא MongoDB)
2. לחץ **Variables**
3. לחץ **+ Reference** → **MongoDB** → **MONGO_URL**
4. שנה את שם המשתנה ל-`MONGODB_URI` (במקום MONGO_URL)
5. Railway מקשר אוטומטית! ✅

### 4.5 הוספת שאר משתני הסביבה
1. באותו מקום (**Variables** של הבוט)
2. לחץ **New Variable** והוסף:

```
JWT_SECRET = kJ8nM2pQ5vX9wZ3bC7fG1hL4jN6rT8yU0eW2aS5dF9gH3kM7pR1tV4xZ8bN0cQ6
ADMIN_PHONE_NUMBERS = 972501234567
NODE_ENV = production
PORT = 3000
TRIAL_DAYS = 7
```

**אם השתמשת ב-MongoDB Atlas** (לא Railway):
```
MONGODB_URI = mongodb+srv://whatsappbot:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/whatsappbot?retryWrites=true&w=majority
JWT_SECRET = kJ8nM2pQ5vX9wZ3bC7fG1hL4jN6rT8yU0eW2aS5dF9gH3kM7pR1tV4xZ8bN0cQ6
ADMIN_PHONE_NUMBERS = 972501234567
NODE_ENV = production
PORT = 3000
TRIAL_DAYS = 7
```

### 4.6 המתן לפריסה
- Railway בונה את הפרויקט
- תראה logs בזמן אמת
- כשמוצג **Deployment successful** - הכל עבד! 🎉

---

## ✅ שלב 5: אימות WhatsApp (5 דקות)

### 5.1 צפייה ב-QR Code
1. בפרויקט Railway לחץ על **View Logs**
2. חפש QR Code בלוגים (תראה ריבוע מסמלים)
3. אם לא רואה, המתן קצת - הבוט מתחבר

### 5.2 סריקת QR Code
1. פתח את **WhatsApp** בטלפון שלך
2. לחץ **⋮** (שלוש נקודות) → **מכשירים מקושרים**
3. לחץ **קשר מכשיר**
4. סרוק את ה-QR Code מהלוגים של Railway

### 5.3 אימות חיבור
- כשהסריקה הצליחה, תראה בלוגים: `WhatsApp bot is ready!`
- שלח לעצמך הודעה: `/help`
- אם הבוט עונה - הכל עובד! 🎉

---

## ✅ שלב 6: בדיקות (5 דקות)

### בדיקת פקודות WhatsApp
שלח לבוט:
```
/help
/status
/trial
/balance
```

### בדיקת API
השתמש ב-Postman או curl:

```bash
# קבל את ה-URL מ-Railway (Settings → Public Domain)
# דוגמה: https://whatsapp-bot-production.up.railway.app

# Login
curl -X POST https://YOUR-APP.up.railway.app/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"972501234567","name":"שם שלי"}'

# תקבל token - שמור אותו

# בדיקת Balance
curl https://YOUR-APP.up.railway.app/api/payments/balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎊 סיימת!

הבוט פועל ב-production! 

### מה הלאה?
- 📱 שלח לחברים את מספר הבוט
- 💰 הוסף חובות/תשלומות דרך ה-API
- 👥 צור סוכני מכירות: `POST /api/agents`
- 📊 צפה בסטטיסטיקות: `GET /api/payments/statistics`

### טיפים
- Railway נותן 500 שעות חינם בחודש (מספיק לבוט קטן)
- לוגים זמינים תמיד ב-**View Logs**
- עדכוני קוד: פשוט `git push` ו-Railway יפרוס מחדש
- משתני סביבה: עדכן ב-**Variables** וה-app יתחיל מחדש

---

## ❓ בעיות נפוצות

### QR Code לא מופיע
- בדוק ש-`whatsapp-web.js` מותקן
- הרץ מחדש את ה-Deployment: **⋯** → **Restart**

### MongoDB Connection Failed
- וודא שה-Connection String נכון
- בדוק שהסיסמה לא מכילה תווים מיוחדים (או encode אותם)
- וודא ש-IP 0.0.0.0/0 מורשה ב-Network Access

### Bot לא עונה
- וודא שסרקת QR Code
- בדוק logs: `GET /api/users/profile` עובד?
- וודא ש-ADMIN_PHONE_NUMBERS תואם למספר שלך

### Need help?
ראה [DEPLOYMENT.md](./DEPLOYMENT.md) למדריך מפורט יותר.
