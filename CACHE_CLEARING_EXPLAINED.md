# Cache Clearing System - How It Works

## Overview
The HolidayZ app is configured to **always clear caches** when a new version is deployed. This ensures users see the latest UI immediately without needing to manually clear their browser cache.

## Multi-Layer Cache Clearing Strategy

### 1. **Deployment-Level Cache Clearing**
**Location:** `.github/workflows/deploy.yml`

Every deployment:
1. Creates a unique version ID with timestamp (e.g., `20240115-143020`)
2. Deploys the new version to Google App Engine
3. **Immediately promotes** the new version to receive 100% of traffic
4. This switches all users to the new version instantly

```yaml
# Deploy new version with unique timestamp
VERSION_ID=$(date +%Y%m%d-%H%M%S)
gcloud app deploy app.yaml --version=$VERSION_ID --no-promote

# ALWAYS promote immediately to clear caches
gcloud app services set-traffic default --splits=$VERSION_ID=100
```

**Why this works:** When App Engine switches traffic to a new version, it:
- Updates all CDN edge locations
- Invalidates cached responses
- Forces browsers to fetch fresh content

### 2. **HTTP Cache Headers**
**Location:** `app.yaml`

#### HTML Files (NEVER Cached)
```yaml
- url: /.*
  static_files: dist/index.html
  http_headers:
    Cache-Control: "no-cache, no-store, must-revalidate, max-age=0"
    Pragma: "no-cache"
    Expires: "0"
```

This tells browsers and CDNs:
- **no-cache**: Must revalidate with server before using cached version
- **no-store**: Don't store this in cache at all
- **must-revalidate**: Can't use stale cache
- **max-age=0**: Expires immediately

#### Hashed Assets (Cached Forever)
```yaml
- url: /assets/(.*\.(js|css|png|...))
  http_headers:
    Cache-Control: "public, max-age=31536000, immutable"
```

Vite automatically adds content hashes to filenames:
- `main.js` → `main-abc123def.js`
- When code changes, hash changes → new filename → cache miss → fresh download
- Old files won't be requested (new HTML references new hashes)

### 3. **Build Timestamp Verification**
**Location:** `vite.config.ts` and `src/App.tsx`

Every build:
1. Vite injects current timestamp into bundle:
   ```typescript
   define: {
     __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
   }
   ```

2. App logs timestamp to browser console:
   ```typescript
   console.log('📦 Build Time:', __BUILD_TIME__);
   ```

**How to verify deployment:**
1. Open browser console (F12)
2. Look for green "📦 Build Time:" message
3. Timestamp should match your deployment time

### 4. **Automatic Old Version Cleanup**
**Location:** `.github/workflows/deploy.yml`

After promoting new version:
```bash
# Keep last 3 versions, delete older ones
gcloud app versions list | tail -n +4 | xargs gcloud app versions delete
```

Benefits:
- Reduces storage costs
- Prevents confusion from old versions
- Only keeps recent versions for rollback if needed

## How to Verify Cache Clearing Works

### Method 1: Check Build Timestamp
1. Open the app in your browser
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for: `📦 Build Time: 2024-01-15T14:30:20.123Z`
5. This should match the time of your latest deployment

### Method 2: Check Network Tab
1. Open Developer Tools (F12)
2. Go to Network tab
3. Reload the page
4. Look at the `index.html` request headers:
   - Should see `Cache-Control: no-cache, no-store...`
   - Status should be `200` (not `304 Not Modified` or from cache)

### Method 3: Check Deployment Logs
1. Go to GitHub Actions: https://github.com/YOUR_REPO/actions
2. Click on latest deployment
3. Look for:
   ```
   ✓ Version 20240115-143020 promoted successfully
   Cache cleared - users will see the new version on next page load
   ```

## Common Cache Issues and Solutions

### Issue: "I still see the old UI"

**Solution 1: Hard Refresh**
- Windows/Linux: `Ctrl + F5` or `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

**Solution 2: Clear Browser Cache**
- Chrome: Settings → Privacy → Clear browsing data → Cached images and files
- Firefox: Settings → Privacy → Clear Data → Cached Web Content
- Safari: Develop → Empty Caches

**Solution 3: Verify Deployment Completed**
```bash
gcloud app versions list --service=default
# Should show your latest version with 100% traffic
```

### Issue: "Different users see different versions"

**Check:**
1. Is the deployment still in progress? (Check GitHub Actions)
2. Did the promotion step complete? (Check deployment logs)
3. Are users behind a corporate proxy/CDN? (May have additional caching)

**Solution:**
```bash
# Manually promote latest version
VERSION=$(gcloud app versions list --service=default --sort-by=~version.createTime --limit=1 --format="value(id)")
gcloud app services set-traffic default --splits=$VERSION=100
```

## Testing Cache Clearing Locally

### Simulate Production Caching

1. Build the app:
   ```bash
   npm run build
   ```

2. Serve with HTTP caching:
   ```bash
   npx serve dist -p 8080 --no-request-logging
   ```

3. Make a change and rebuild:
   ```bash
   # Edit a component
   npm run build
   ```

4. Reload the browser - should see new build timestamp

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ GitHub Actions Deployment                                   │
│                                                              │
│  1. npm run build → Creates dist/ with:                     │
│     • index.html (no cache headers)                         │
│     • assets/main-abc123.js (with hash)                     │
│     • __BUILD_TIME__ injected                               │
│                                                              │
│  2. gcloud app deploy --version=20240115-143020             │
│     → Uploads new version                                   │
│                                                              │
│  3. gcloud app services set-traffic default                 │
│     → Promotes to 100% traffic (CACHE CLEARED)              │
│                                                              │
│  4. Cleanup old versions (keep 3)                           │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Google App Engine                                           │
│                                                              │
│  • Serves index.html with no-cache headers                  │
│  • Serves assets with immutable caching                     │
│  • CDN edge locations updated                               │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ User's Browser                                              │
│                                                              │
│  1. Requests index.html                                     │
│     → Always fetches fresh (no-cache)                       │
│                                                              │
│  2. index.html references main-abc123.js                    │
│     → Downloads new JS (hash changed)                       │
│                                                              │
│  3. App runs, logs build timestamp                          │
│     → Console shows: "📦 Build Time: 2024-01-15..."         │
└─────────────────────────────────────────────────────────────┘
```

## Maintenance

### Regular Tasks
- **None required** - automatic cache clearing on every deployment

### Monitoring
Check deployment success:
```bash
# View recent deployments
gcloud app versions list --service=default

# View active version
gcloud app versions list --service=default --format="table(id,traffic_split)"

# View deployment logs
gcloud app logs tail -s default
```

### Cost Optimization
The system keeps only 3 recent versions:
- Latest version (active)
- Previous version (for quick rollback)
- 2nd previous version (backup)

This minimizes storage costs while maintaining safety.

## Security Considerations

- All traffic uses HTTPS (`secure: always`)
- No sensitive data cached in browser
- Build timestamp reveals deployment time (not sensitive)
- Cache headers prevent unauthorized content caching

## Summary

**The cache clearing system works automatically because:**

1. ✅ Every deployment creates a unique version with timestamp
2. ✅ New version is always promoted to 100% traffic immediately
3. ✅ HTML files have no-cache headers (always fresh)
4. ✅ Asset files have content hashes (automatic cache busting)
5. ✅ Build timestamp logged to console (easy verification)
6. ✅ Old versions automatically cleaned up (cost savings)

**You never need to manually clear caches** - the system handles it automatically on every deployment! 🎉
