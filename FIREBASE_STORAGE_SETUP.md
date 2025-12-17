# Firebase Storage Setup Guide

## ⚠️ Issue: Image Uploads Getting Stuck

If image uploads are getting stuck, it's likely because Firebase Storage security rules are not configured.

---

## Quick Fix (2 minutes)

### 1. Open Firebase Console

Go to: https://console.firebase.google.com/

### 2. Navigate to Storage

1. Select your project: **HolidayZ** (or your project name)
2. Click **Storage** in the left sidebar
3. Click **Get Started** (if first time)
4. Choose a location (e.g., `us-central1`)
5. Click **Done**

### 3. Set Up Security Rules

1. Click the **Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Allow anyone to read proof images (family members can see each other's proof)
    match /proof-images/{allPaths=**} {
      allow read: if true;
      allow write: if request.resource.size < 5 * 1024 * 1024  // Max 5MB
                   && request.resource.contentType.matches('image/.*');  // Only images
    }
  }
}
```

3. Click **Publish**

---

## What These Rules Do

### Read Access:
```javascript
allow read: if true;
```
- Anyone can view uploaded images
- Family members can see each other's proof of deposit photos
- Images are accessible via direct URL

### Write Access:
```javascript
allow write: if request.resource.size < 5 * 1024 * 1024
             && request.resource.contentType.matches('image/.*');
```
- Anyone can upload images
- Max file size: 5 MB
- Only image files allowed (JPEG, PNG, GIF, etc.)
- Prevents abuse by blocking large files or non-images

---

## Alternative: More Secure Rules (Optional)

If you want to add authentication (requires Firebase Auth):

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /proof-images/{allPaths=**} {
      // Only authenticated users can upload
      allow read: if true;
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## Testing the Setup

### 1. Check Console Logs

Open browser DevTools (F12) and look for:

**Success:**
```
📤 Starting upload: { fileName: "temp_...", fileSize: "234.56 KB", ... }
📤 Uploading to Firebase Storage...
✅ Upload complete, getting download URL...
✅ Proof image uploaded successfully: https://...
```

**Failure (Permission Denied):**
```
❌ Error uploading proof image: FirebaseError: Firebase Storage permission denied
```

**Failure (Timeout):**
```
❌ Error uploading proof image: Upload timeout - check Firebase Storage rules
```

### 2. Try Uploading

1. Go to **My Savings** page
2. Click **Add Savings**
3. Fill in details
4. Click **Choose Image**
5. Select a small image (< 1 MB)
6. Click **Add Savings**
7. Should see "Uploading..." then success

---

## Common Issues

### Issue 1: "Permission Denied"
**Cause:** Storage rules not configured or too restrictive
**Fix:** Follow steps above to set up rules

### Issue 2: Upload Hangs Forever
**Cause:** No Storage bucket created
**Fix:** Click "Get Started" in Storage tab to create bucket

### Issue 3: "Timeout" Error
**Cause:** Slow internet or Firebase not initialized
**Fix:** 
- Check internet connection
- Verify Firebase config in `.env.local`
- Make sure `VITE_FIREBASE_STORAGE_BUCKET` is set

### Issue 4: Image Too Large
**Cause:** File > 5 MB
**Fix:** Choose smaller image or compress it first

---

## Verification Checklist

- [ ] Firebase Storage bucket created
- [ ] Security rules published
- [ ] `.env.local` has `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] Browser console shows upload progress logs
- [ ] Test image upload succeeds
- [ ] Image appears in savings entry after upload
- [ ] Can view full image by clicking thumbnail

---

## Storage Bucket URL

Your storage bucket should be:
```
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

Check in Firebase Console → Project Settings → General → Storage bucket

---

## Need Help?

1. Check browser console (F12) for error messages
2. Verify all Firebase environment variables are set
3. Make sure Storage bucket exists in Firebase Console
4. Confirm security rules are published (not just saved)

---

**After setting up Storage rules, refresh your app and try uploading again!**
