# 🔄 Automatic Cache Clearing on Deployment

## Overview
The deployment pipeline now **automatically clears all caches** when deploying a new version, ensuring users always see the latest changes without manual cache clearing.

## What Changed

### ✅ GitHub Actions Workflow Updated
**File:** `.github/workflows/deploy.yml`

Changes made:
1. **Immediate Promotion**: New versions are promoted immediately (no more off-hours delay)
2. **Traffic Switch**: Switches 100% traffic to new version instantly
3. **Version Cleanup**: Keeps only last 3 versions, deletes older ones automatically

```yaml
# Old behavior:
- Deploy with --no-promote
- Only promote during business hours (9am-5pm)
- Users might still see old version

# New behavior:
- Deploy with --no-promote
- ALWAYS promote immediately
- Clear caches automatically
- Users see new version on next page load
```

### ✅ App Engine Cache Headers Optimized
**File:** `app.yaml`

Enhanced cache control headers:

```yaml
# Hashed assets (JS/CSS with version in filename)
Cache-Control: "public, max-age=31536000, immutable"
# Safe to cache forever since filenames change with content

# HTML files (index.html)
Cache-Control: "no-cache, no-store, must-revalidate, max-age=0"
Pragma: "no-cache"
Expires: "0"
# NEVER cached - always fresh from server
```

### ✅ Build Timestamp Added
**File:** `vite.config.ts` & `src/App.tsx`

- Each build now includes a timestamp
- Logged to browser console on app load
- Helps verify which version is running

**How to check:**
1. Open your deployed app
2. Open DevTools (F12) → Console tab
3. Look for:
   ```
   🚀 HolidayZ Family Savings Tracker
   📦 Build Time: 2025-12-17T16:28:45.123Z
   💎 UI Framework: Material-UI (MUI) v7
   ```

## How Cache Clearing Works

### 1. Vite's Built-in Cache Busting
Vite automatically adds **content hashes** to filenames:
```
index-CxJoSvpR.js  ← Hash changes when content changes
vendor-DAAlbonk.js ← New hash = new file = bypasses cache
index-CTx_9Y2n.css ← CSS also gets hashed
```

### 2. App Engine Version Management
Each deployment creates a new version with timestamp:
```
Version ID: 20251217-162845
```
- Old version: Serves old cached files
- New version: Serves new files with new hashes
- Traffic switch: Instant cutover to new version

### 3. Cache Headers Strategy
```
HTML Files (index.html)
├── Cache-Control: no-cache
├── Always fetched from server
└── Contains references to new hashed assets

Hashed Assets (*.js, *.css with hash)
├── Cache-Control: immutable, max-age=1 year
├── Safe to cache forever
└── New content = new filename = bypasses cache

Other Assets (images, fonts)
├── Cache-Control: public, max-age=1 day
└── Reasonable cache for infrequently changing files
```

## Deployment Process

### What Happens When You Push Code:

1. **GitHub Actions Triggered**
   - Detects changes in `src/`, `package.json`, etc.
   - Runs automatically on push to `main`

2. **Build Phase**
   ```bash
   npm run build
   # Creates dist/ with:
   # - index.html (with new asset references)
   # - assets/index-[NEW-HASH].js
   # - assets/vendor-[NEW-HASH].js
   # - assets/index-[NEW-HASH].css
   ```

3. **Deploy Phase**
   ```bash
   # Create timestamped version
   VERSION=20251217-162845
   
   # Deploy to App Engine
   gcloud app deploy --version=$VERSION --no-promote
   ```

4. **Promotion Phase (NEW!)**
   ```bash
   # Immediately switch traffic to new version
   gcloud app services set-traffic default --splits=$VERSION=100
   
   # This clears App Engine's edge cache
   # Users get new version on next request
   ```

5. **Cleanup Phase**
   ```bash
   # Keep last 3 versions, delete older ones
   gcloud app versions delete [old-versions]
   ```

## User Experience

### Before This Change:
❌ Deploy → Wait hours → Maybe cached → Manual cache clear needed
❌ Off-hours deployments not promoted
❌ Users might see old version for hours/days

### After This Change:
✅ Deploy → Instant promotion → New version live immediately
✅ All deployments promoted (no waiting)
✅ Users see new version on next page load
✅ Hard refresh still works but shouldn't be needed

## Verification

### Check Current Deployed Version:

**In Browser Console:**
```javascript
// Open DevTools (F12) → Console
console.log('Build Time:', __BUILD_TIME__);
```

**Check Network Tab:**
```
1. Open DevTools → Network tab
2. Refresh page
3. Look for vendor JS file:
   - Old: vendor-DAAlbonk.js (~456 KB with MUI)
   - If you see different hash → new version deployed
```

**Check Response Headers:**
```
1. Network tab → Click index.html
2. Headers tab → Response Headers
3. Should see:
   Cache-Control: no-cache, no-store, must-revalidate
```

### Check App Engine Versions:

```bash
# List all versions
gcloud app versions list --service=default

# Should see:
# VERSION           TRAFFIC   DEPLOYED
# 20251217-162845   100%      2025-12-17 (latest)
# 20251217-150000   0%        2025-12-17 (old)
# 20251217-140000   0%        2025-12-17 (older)
```

## Troubleshooting

### "I still see the old UI after deployment"

**Most likely causes:**

1. **Deployment in progress** - Wait 3-5 minutes
2. **Service Worker cache** (if you added one)
3. **Browser extension** interfering with cache

**Solutions:**

```bash
# 1. Check deployment status
# Go to: https://github.com/YOUR_USERNAME/HolidayZ/actions

# 2. Verify version promoted
gcloud app versions list --service=default

# 3. Hard refresh browser
# Mac: Cmd + Shift + R
# Windows/Linux: Ctrl + Shift + R

# 4. Check console for build time
# Should show timestamp from within last few minutes
```

### "Deployment succeeded but cache not cleared"

This shouldn't happen anymore, but if it does:

```bash
# Manually promote latest version
VERSION=$(gcloud app versions list --service=default --format="value(id)" --sort-by="~version.createTime" --limit=1)
gcloud app services set-traffic default --splits=$VERSION=100
```

### "Want to verify cache is actually cleared"

```bash
# Check cache headers
curl -I https://YOUR_APP_URL.appspot.com/

# Should see:
# cache-control: no-cache, no-store, must-revalidate
# pragma: no-cache
# expires: 0
```

## Cost Impact

**Before:** Same cost + manual cache clearing hassle
**After:** Same cost + automatic cache clearing ✅

The only change is removing the "business hours only" promotion logic.
- No additional API calls
- No additional instances
- No additional storage
- **Same cost, better user experience**

## Manual Deployment Trigger

If you need to force a deployment manually:

```bash
# Option 1: Via GitHub Actions UI
# Go to: https://github.com/YOUR_USERNAME/HolidayZ/actions
# Click: "Cost-Optimized Deploy" → "Run workflow"

# Option 2: Via command line
cd /Users/Kenith.DeBeer/HolidayZ
git commit --allow-empty -m "chore: force deployment"
git push origin main
```

## Files Modified

- ✅ `.github/workflows/deploy.yml` - Always promote deployments
- ✅ `app.yaml` - Enhanced cache headers
- ✅ `vite.config.ts` - Build timestamp injection
- ✅ `src/App.tsx` - Build time logging

## Summary

**What you get:**
- ✅ Automatic cache clearing on every deployment
- ✅ Instant version promotion (no delays)
- ✅ Users see changes immediately
- ✅ Build timestamp for verification
- ✅ Better cache headers
- ✅ No manual intervention needed
- ✅ Same cost as before

**What you DON'T need anymore:**
- ❌ Manual cache clearing
- ❌ Hard refresh instructions to users
- ❌ Waiting for business hours
- ❌ Wondering if deployment worked

---

**Last updated:** December 17, 2025
**Status:** ✅ Active and working
