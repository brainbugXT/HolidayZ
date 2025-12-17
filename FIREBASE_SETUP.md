# Firebase Firestore Setup Guide

## 🎯 Overview

Your HolidayZ app has been upgraded to use **Firebase Firestore** for cross-device data synchronization. Now all family members can see the same savings goals and entries from any device!

## ✅ What Changed

### Before (localStorage)
- ❌ Data only on one device
- ❌ Each device has separate data
- ❌ No real-time sync

### After (Firestore)
- ✅ Data synced across all devices
- ✅ Real-time updates
- ✅ All family members see the same data
- ✅ Automatic backups

## 📋 Setup Steps

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `holidayz` (or any name you prefer)
4. Disable Google Analytics (optional, saves setup time)
5. Click "Create project"

### Step 2: Enable Firestore Database

1. In your Firebase project, click "Firestore Database" in the left menu
2. Click "Create database"
3. Choose **"Start in production mode"** (we'll set up rules next)
4. Select a location close to you (e.g., `us-central`)
5. Click "Enable"

### Step 3: Set Up Security Rules

1. In Firestore Database, click the "Rules" tab
2. Replace the default rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read/write all goals and entries
    // (Since this is a private family app)
    match /savings-goals/{goalId} {
      allow read, write: if true;
    }
    
    match /savings-entries/{entryId} {
      allow read, write: if true;
    }
  }
}
```

3. Click "Publish"

**Note:** These rules allow anyone with your Firebase config to read/write data. This is fine for a private family app. If you want more security, you can add Firebase Authentication later.

### Step 4: Get Firebase Configuration

1. Go to Project Settings (gear icon in left menu)
2. Scroll down to "Your apps"
3. Click the **</>** (web) icon to add a web app
4. Give it a nickname: "HolidayZ Web App"
5. Don't enable Firebase Hosting (we use App Engine)
6. Click "Register app"
7. Copy the `firebaseConfig` object - you'll need these values:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

### Step 5: Configure Environment Variables

#### For Local Development:

1. Create a `.env.local` file in your project root:
```bash
cd /Users/Kenith.DeBeer/HolidayZ
cp .env.example .env.local
```

2. Edit `.env.local` and add your Firebase config:
```env
VITE_FIREBASE_API_KEY=AIza...your-api-key
VITE_FIREBASE_AUTH_DOMAIN=holidayz-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=holidayz-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=holidayz-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

3. **Important:** Add `.env.local` to `.gitignore` (already done)

#### For Production (Google App Engine):

1. In your App Engine `app.yaml`, add the environment variables:

```yaml
env_variables:
  NODE_ENV: production
  VITE_FIREBASE_API_KEY: "AIza...your-api-key"
  VITE_FIREBASE_AUTH_DOMAIN: "holidayz-xxxxx.firebaseapp.com"
  VITE_FIREBASE_PROJECT_ID: "holidayz-xxxxx"
  VITE_FIREBASE_STORAGE_BUCKET: "holidayz-xxxxx.appspot.com"
  VITE_FIREBASE_MESSAGING_SENDER_ID: "123456789"
  VITE_FIREBASE_APP_ID: "1:123456789:web:abcdef"
```

**OR** add them to GitHub Secrets and update your deployment workflow:

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add new secrets:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`

4. Update `.github/workflows/deploy.yml` build step:
```yaml
- name: Build application
  run: npm run build
  env:
    NODE_ENV: production
    CI: true
    VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
    VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
    VITE_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
    VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
    VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
    VITE_FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}
```

### Step 6: Test the Setup

1. **Start the dev server:**
```bash
npm run dev
```

2. **Check the console:**
   - You should see: `📡 Subscribing to goals from Firestore...`
   - You should see: `📡 Subscribing to entries from Firestore...`
   - No Firebase errors

3. **Test CRUD operations:**
   - Create a new goal → Check Firestore console (should appear)
   - Add a savings entry → Check Firestore console
   - Edit/delete items → Should update in Firestore

4. **Test cross-device sync:**
   - Open the app in two different browsers
   - Create a goal in one browser
   - It should appear in the other browser immediately!

## 🚀 Deployment

After setup, deploy as usual:

```bash
git add .
git commit -m "Configure Firebase Firestore"
git push
```

The GitHub Actions workflow will build and deploy automatically.

## 📊 Monitor Your Database

**Firestore Console:** https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore

You can:
- View all goals and entries
- Manually edit data
- See real-time usage statistics
- Export/backup data

## 💰 Firebase Free Tier Limits

Your app easily fits within Firebase's free tier:

- ✅ **50,000 reads/day** (way more than needed)
- ✅ **20,000 writes/day** (plenty for a family app)
- ✅ **1 GB stored data** (your app uses <1 MB)
- ✅ **10 GB/month bandwidth**

**Estimated usage for 4 family members:**
- ~100 reads/day
- ~10 writes/day
- <1 MB total data

You'll never hit the limits! 🎉

## 🔒 Security Considerations

### Current Setup (Open Access)
- Anyone with your Firebase config can access the data
- Fine for a private family app
- Config is embedded in the app (visible in browser)

### Enhanced Security (Optional)
If you want to add authentication:

1. Enable Firebase Authentication
2. Update Firestore rules to require auth
3. Add login/signup to the app

For now, the simple approach is fine since:
- It's a private family app
- No sensitive financial data (just savings goals)
- Only family members will have the URL

## 🐛 Troubleshooting

### Error: "Firebase: Error (auth/api-key-not-valid)"
**Solution:** Check that your `VITE_FIREBASE_API_KEY` is correct in `.env.local`

### Error: "Missing or insufficient permissions"
**Solution:** Update Firestore security rules (see Step 3)

### Data not syncing
**Solution:** 
1. Check browser console for errors
2. Verify Firebase config is correct
3. Check Firestore rules allow read/write

### Still seeing localStorage data
**Solution:** 
1. Clear localStorage: `localStorage.clear()`
2. Refresh the page
3. Data should now come from Firestore

## 🎉 Success!

Once setup is complete:
- ✅ All devices see the same data
- ✅ Real-time sync across devices
- ✅ Data persists forever (no more localStorage limitations)
- ✅ Automatic backups
- ✅ Free forever (within generous limits)

---

## Quick Command Reference

```bash
# Install Firebase
npm install firebase

# Copy environment template
cp .env.example .env.local

# Test locally
npm run dev

# Deploy
git push
```

## Next Steps

1. Complete Firebase setup (Steps 1-5)
2. Configure environment variables
3. Test locally
4. Deploy to production
5. Open app on multiple devices
6. Watch the real-time sync magic! ✨

Need help? Check the Firebase documentation:
- [Get Started with Firestore](https://firebase.google.com/docs/firestore/quickstart)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
