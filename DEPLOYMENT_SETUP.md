# 🚀 GitHub Actions Deployment Setup Guide

This guide will help you set up automated deployment for your HolidayZ application using GitHub Actions and Google Cloud App Engine.

## 🎯 Quick Setup (Automated)

Run the automated setup script:

```bash
./scripts/setup-deployment.sh
```

This script will:
1. ✅ Set up Google Cloud project and App Engine
2. ✅ Create service account with required permissions  
3. ✅ Configure GitHub repository secrets
4. ✅ Test the deployment process
5. ✅ Set up cost monitoring ($5/month budget)
6. ✅ Trigger first automated deployment

## 📋 Manual Setup (Alternative)

If you prefer to set up manually:

### 1. Google Cloud Setup

```bash
# Set your project ID
export GCP_PROJECT_ID="your-project-id"

# Create project (if needed)
gcloud projects create $GCP_PROJECT_ID

# Set active project
gcloud config set project $GCP_PROJECT_ID

# Enable required APIs
gcloud services enable appengine.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Initialize App Engine
gcloud app create --region=us-central1
```

### 2. Service Account Setup

```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deployment"

# Grant required permissions
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:github-actions@$GCP_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/appengine.deployer"

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:github-actions@$GCP_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/appengine.serviceAdmin"

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:github-actions@$GCP_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# Create service account key
gcloud iam service-accounts keys create ~/github-actions-key.json \
  --iam-account=github-actions@$GCP_PROJECT_ID.iam.gserviceaccount.com

# Base64 encode for GitHub secrets
base64 ~/github-actions-key.json
```

### 3. GitHub Secrets Setup

Go to: `https://github.com/brainbugXT/HolidayZ/settings/secrets/actions`

Add these secrets:
- **GCP_SA_KEY**: Base64-encoded service account key (from step 2)
- **GCP_PROJECT_ID**: Your Google Cloud project ID

### 4. Test Deployment

```bash
# Test local build
npm run build

# Manual deployment test
gcloud app deploy app.yaml --version=test --no-promote

# Trigger GitHub Actions (push any change)
git commit -m "Test deployment" --allow-empty && git push
```

## 🔍 Monitoring Your Deployment

### GitHub Actions
- **Workflow runs**: https://github.com/brainbugXT/HolidayZ/actions
- **View logs**: Click on any workflow run
- **Manual trigger**: Go to Actions → Deploy → Run workflow

### Google Cloud Console
- **App Engine**: https://console.cloud.google.com/appengine
- **Logs**: https://console.cloud.google.com/logs
- **Billing**: https://console.cloud.google.com/billing

## 💰 Cost Monitoring

### Expected Costs
- **Typical usage**: $1-3 USD/month
- **Heavy usage**: $3-5 USD/month
- **No usage**: $0 USD (auto-scales to zero)

### Cost Alerts
The setup script creates a $5/month budget with alerts at:
- 50% ($2.50)
- 90% ($4.50) 
- 100% ($5.00)

## 🔧 Deployment Features

### Cost Optimizations
- ✅ F1 instance class (smallest available)
- ✅ Auto-scale to 0 instances when unused
- ✅ Asset caching and compression
- ✅ Bundle optimization (244KB total)
- ✅ Smart deployment strategies

### Deployment Workflow
1. **Trigger**: Push to `main` branch (only if code changes)
2. **Build**: Install dependencies, compile TypeScript, build with Vite
3. **Test**: Run health checks on new version
4. **Deploy**: Deploy to App Engine without promoting
5. **Promote**: Promote to production (during business hours)
6. **Cleanup**: Remove old versions to save storage

## 🚨 Troubleshooting

### Common Issues

#### "No billing account linked"
```bash
# Link billing account in Google Cloud Console
open "https://console.cloud.google.com/billing/linkedaccount?project=$GCP_PROJECT_ID"
```

#### "App Engine already exists"
```bash
# Check existing region
gcloud app describe
```

#### "GitHub secrets not working"
```bash
# Verify secrets are set
gh secret list

# Re-encode service account key
base64 ~/github-actions-key.json | gh secret set GCP_SA_KEY
```

#### "Build failing"
```bash
# Test locally
npm run build

# Check Node.js version (needs 18+)
node --version
```

## 📱 Application URLs

After successful deployment:

- **Production**: `https://your-project-id.appspot.com`
- **Staging versions**: `https://version-id-dot-your-project-id.appspot.com`

## 🔄 Development Workflow

1. **Develop locally**: `npm run dev`
2. **Test build**: `npm run build`
3. **Commit changes**: `git add . && git commit -m "Your message"`
4. **Push to deploy**: `git push` (triggers automatic deployment)
5. **Monitor**: Watch GitHub Actions and Google Cloud Console

## 🎉 Success!

Once setup is complete, every push to the `main` branch will automatically:
- Build your application
- Deploy to Google Cloud App Engine
- Scale efficiently to minimize costs
- Provide a production-ready family savings tracker!

Your HolidayZ application is now fully automated and cost-optimized! 🎊
