# 🔧 Fixing "Failed to save goal" Error

## ❌ The Problem

You're getting "Failed to save goal. Please try again." because **Firebase Firestore is not configured yet**.

## ✅ The Solution

You need to set up Firebase Firestore (takes ~10 minutes). I've created a `.env.local` file for you - you just need to fill in your Firebase credentials.

## 🚀 Quick Fix (10 Minutes)

### Step 1: Create Firebase Project (3 min)

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it "HolidayZ" (or any name)
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Firestore (2 min)

1. In Firebase Console, click "Firestore Database" in left menu
2. Click "Create database"
3. Choose **"Start in production mode"**
4. Select location (e.g., "us-central")
5. Click "Enable"

### Step 3: Set Security Rules (1 min)

1. In Firestore, click "Rules" tab
2. Replace with this code:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /savings-goals/{document=**} {
      allow read, write: true;
    }
    match /savings-entries/{document=**} {
      allow read, write: true;
    }
  }
}
```

3. Click "Publish"

### Step 4: Get Firebase Config (2 min)

1. Click gear icon (Project Settings)
2. Scroll to "Your apps"
3. Click **</>** (web icon)
4. App nickname: "HolidayZ Web"
5. Don't enable hosting
6. Click "Register app"
7. **Copy the config values** (you'll need these next)

You'll see something like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXX",
  authDomain: "holidayz-12345.firebaseapp.com",
  projectId: "holidayz-12345",
  storageBucket: "holidayz-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

### Step 5: Update .env.local (2 min)

I've already created `.env.local` for you. Open it and replace the placeholder values with your Firebase config:

**File:** `/Users/Kenith.DeBeer/HolidayZ/.env.local`

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=holidayz-12345.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=holidayz-12345
VITE_FIREBASE_STORAGE_BUCKET=holidayz-12345.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456
```

### Step 6: Restart Dev Server

```bash
# Stop the current dev server (Ctrl+C)
# Then restart it:
npm run dev
```

### Step 7: Test It!

1. Open the app in your browser
2. Try creating a goal
3. It should work now! ✅

## 🎉 What You Get After Setup

- ✅ Goals save successfully
- ✅ Data syncs across all devices
- ✅ Real-time updates
- ✅ Cloud backup (never lose data)
- ✅ Free forever!

## 🆘 Still Having Issues?

### Error: "Cannot connect to Firebase"
- Check your internet connection
- Verify the values in `.env.local` are correct
- Make sure there are no extra spaces or quotes

### Error: "Permission denied"
- Go back to Step 3 and update Firestore security rules
- Make sure you clicked "Publish" after pasting the rules

### Error: "Missing or insufficient permissions"
- Your security rules might be wrong
- Copy the rules from Step 3 exactly as shown

### App Still Shows Setup Wizard
- Make sure you updated `.env.local` with real values (not placeholders)
- Restart the dev server
- Clear browser cache and reload

## 📖 More Help

- **Quick Start:** See `FIREBASE_QUICKSTART.md`
- **Detailed Guide:** See `FIREBASE_SETUP.md`
- **Technical Details:** See `FIREBASE_INTEGRATION_COMPLETE.md`

## ✨ New Feature: Setup Wizard

I've added an in-app setup wizard that will automatically appear if Firebase isn't configured. It will guide you through the setup process with step-by-step instructions.

## 💡 Why This Happened

The app was upgraded to use Firebase Firestore for cloud storage instead of localStorage. This enables cross-device sync, but requires a one-time setup.

**Before:** Data stored locally on your device (device-specific)
**After:** Data stored in Firebase cloud (shared across all devices)

---

**Ready to set up Firebase?** Follow the steps above, it takes about 10 minutes and then you'll have cross-device sync working! 🚀
