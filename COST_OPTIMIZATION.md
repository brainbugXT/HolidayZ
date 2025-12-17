# 💰 Cost-Optimized Google Cloud Deployment Guide

This guide explains how to deploy your HolidayZ application to Google Cloud with maximum cost efficiency. The configuration can keep your monthly costs under **$5 USD** for typical family usage.

## 🎯 Cost Optimization Features

### 📊 **Estimated Costs**
- **Typical Usage**: $1-3 USD/month
- **Heavy Usage**: $3-5 USD/month
- **Zero Usage**: $0 USD (scales to zero instances)

### ⚙️ **Optimization Strategies Implemented**

#### 1. **Instance Configuration**
- **Instance Class**: F1 (smallest available, 600MB memory)
- **CPU Utilization**: 70% threshold (higher = fewer instances)
- **Min Instances**: 0 (scales to zero when unused)
- **Max Instances**: 3 (cost control)

#### 2. **Smart Scaling**
- Scales to **zero instances** when no traffic (saves 100% of compute costs)
- Higher latency tolerance to reduce instance count
- Aggressive scaling down during off-peak hours

#### 3. **Asset Optimization**
- Static asset caching (365 days for immutable assets)
- Gzip compression for all text files
- Bundle splitting for better caching
- Minimal file uploads (skips unnecessary files)

#### 4. **Deployment Efficiency**
- Only deploy when code actually changes
- Version cleanup (keeps only 3 recent versions)
- Off-hours deployment strategy
- Health checks before promotion

## 🚀 Setup Instructions

### 1. **Google Cloud Project Setup**

```bash
# Set your project ID
export GCP_PROJECT_ID="your-project-id"

# Create the project (if needed)
gcloud projects create $GCP_PROJECT_ID

# Set as active project
gcloud config set project $GCP_PROJECT_ID

# Enable required APIs
gcloud services enable appengine.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable cloudmonitoring.googleapis.com

# Initialize App Engine (choose us-central1 for lowest costs)
gcloud app create --region=us-central1
```

### 2. **Service Account for GitHub Actions**

```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deployment"

# Grant minimal required permissions
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:github-actions@$GCP_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/appengine.deployer"

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:github-actions@$GCP_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/appengine.serviceAdmin"

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:github-actions@$GCP_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# Create and download key
gcloud iam service-accounts keys create ~/github-actions-key.json \
  --iam-account=github-actions@$GCP_PROJECT_ID.iam.gserviceaccount.com

# Base64 encode for GitHub secrets
base64 ~/github-actions-key.json
```

### 3. **GitHub Repository Secrets**

Go to: `https://github.com/brainbugXT/HolidayZ/settings/secrets/actions`

Add these secrets:
- **GCP_SA_KEY**: The base64-encoded service account key
- **GCP_PROJECT_ID**: Your Google Cloud project ID

### 4. **Billing Budget (Optional but Recommended)**

```bash
# Run the cost optimization setup script
./scripts/setup-cost-optimization.sh
```

## 📈 Cost Monitoring

### **Set Up Billing Alerts**
1. Go to [Google Cloud Billing](https://console.cloud.google.com/billing)
2. Create a budget for $5/month
3. Set alerts at 50%, 90%, and 100%

### **Monitor Resource Usage**
- Check [App Engine Quotas](https://console.cloud.google.com/appengine/quotas)
- Monitor [Cloud Monitoring](https://console.cloud.google.com/monitoring)
- Review [Billing Reports](https://console.cloud.google.com/billing/reports)

## 🔧 Advanced Cost Optimizations

### **Environment-Based Scaling**
```yaml
# For development environment (even cheaper)
automatic_scaling:
  min_instances: 0
  max_instances: 1  # Single instance for dev
  target_cpu_utilization: 0.80
```

### **Weekend/Off-Hours Scaling**
The deployment includes cron jobs for automatic scaling:
- Scale down at 11 PM UTC
- Scale up at 6 AM UTC
- Weekend minimal scaling

### **Manual Cost Controls**
```bash
# Stop all traffic (emergency cost control)
gcloud app services set-traffic default --splits=

# Resume traffic
gcloud app services set-traffic default --splits=VERSION_ID=100

# Check current costs
gcloud billing budgets list
```

## 📊 Cost Breakdown

### **Monthly Cost Components**
- **App Engine Instances**: $0-3 USD (F1 instances, auto-scaling)
- **Storage**: $0.10-0.50 USD (app versions, logs)
- **Network**: $0-1 USD (bandwidth for family usage)
- **Operations**: $0.10-0.20 USD (logging, monitoring)

### **Cost Variables**
- **Family Size**: More users = slightly higher costs
- **Usage Frequency**: Daily vs weekly usage
- **Peak Concurrency**: How many family members use simultaneously

## 🔍 Troubleshooting

### **High Costs**
1. Check instance count: `gcloud app instances list`
2. Review scaling settings in `app.yaml`
3. Check for runaway processes in logs
4. Verify min_instances is 0

### **App Not Scaling Down**
1. Check for stuck requests in logs
2. Verify health check intervals
3. Review pending latency settings

### **Deployment Costs**
- Builds run on GitHub Actions (free tier: 2000 minutes/month)
- Each deployment uses ~2-3 minutes
- Monitor usage: [GitHub Actions](https://github.com/brainbugXT/HolidayZ/actions)

## 🎯 Best Practices

### **Development**
- Use `npm run dev` locally (no cloud costs)
- Only deploy significant changes
- Test builds locally: `npm run build && npm run preview`

### **Production**
- Deploy during off-peak hours when possible
- Monitor costs weekly
- Review and clean up old versions monthly

### **Emergency Cost Control**
```bash
# Immediately stop all traffic (zero cost)
gcloud app services set-traffic default --splits=

# Or disable the entire app
gcloud app services set-traffic default --no-promote
```

---

## 📞 Support

If costs exceed expectations:
1. Check the [billing dashboard](https://console.cloud.google.com/billing)
2. Review the optimization checklist above
3. Consider adjusting scaling parameters
4. Use the emergency cost controls if needed

**Target**: Keep monthly costs under $5 USD for typical family savings tracking usage.

With these optimizations, your HolidayZ family savings tracker will be cost-effective while maintaining excellent performance! 🎉
