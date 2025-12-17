#!/bin/bash

# Ultra-Simple Manual Setup Guide for HolidayZ Deployment
# This provides manual commands you can run one at a time

echo "🚀 HolidayZ - Manual Deployment Setup Commands"
echo "=============================================="
echo ""
echo "Copy and paste these commands one at a time in your terminal."
echo "This avoids getting stuck on slow Google Cloud operations."
echo ""

# Get project ID first
read -p "Enter your Google Cloud Project ID: " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Project ID required"
    exit 1
fi

echo ""
echo "📋 MANUAL SETUP COMMANDS FOR PROJECT: $PROJECT_ID"
echo "=================================================="
echo ""

echo "🔧 1. SET PROJECT (copy and paste this command):"
echo "gcloud config set project $PROJECT_ID"
echo ""

echo "🔧 2. ENABLE APIS (run these one by one, they might be slow):"
echo "gcloud services enable appengine.googleapis.com"
echo "gcloud services enable cloudbuild.googleapis.com"
echo ""
echo "OR enable via web console (faster):"
echo "https://console.cloud.google.com/apis/library/appengine.googleapis.com?project=$PROJECT_ID"
echo "https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com?project=$PROJECT_ID"
echo ""

echo "🔧 3. CREATE APP ENGINE:"
echo "gcloud app create --region=us-central1"
echo ""
echo "OR create via web console:"
echo "https://console.cloud.google.com/appengine?project=$PROJECT_ID"
echo ""

echo "🔧 4. CREATE SERVICE ACCOUNT:"
echo "gcloud iam service-accounts create github-actions --display-name=\"GitHub Actions\""
echo ""

echo "🔧 5. GRANT PERMISSIONS (run all three):"
echo "gcloud projects add-iam-policy-binding $PROJECT_ID --member=\"serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com\" --role=\"roles/appengine.deployer\""
echo "gcloud projects add-iam-policy-binding $PROJECT_ID --member=\"serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com\" --role=\"roles/appengine.serviceAdmin\""
echo "gcloud projects add-iam-policy-binding $PROJECT_ID --member=\"serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com\" --role=\"roles/storage.admin\""
echo ""

echo "🔧 6. CREATE SERVICE ACCOUNT KEY:"
echo "gcloud iam service-accounts keys create ~/holidayz-key.json --iam-account=github-actions@$PROJECT_ID.iam.gserviceaccount.com"
echo ""

echo "🔧 7. ENCODE KEY FOR GITHUB:"
echo "base64 ~/holidayz-key.json | tr -d '\\n'"
echo ""

echo "🔧 8. SET GITHUB SECRETS:"
echo "Go to: https://github.com/brainbugXT/HolidayZ/settings/secrets/actions"
echo ""
echo "Add these secrets:"
echo "Name: GCP_PROJECT_ID"
echo "Value: $PROJECT_ID"
echo ""
echo "Name: GCP_SA_KEY"
echo "Value: [output from step 7]"
echo ""

echo "🔧 9. TEST BUILD:"
echo "npm run build"
echo ""

echo "🔧 10. TRIGGER DEPLOYMENT:"
echo "git commit --allow-empty -m \"Test deployment\" && git push"
echo ""

echo "🔍 MONITOR DEPLOYMENT:"
echo "GitHub Actions: https://github.com/brainbugXT/HolidayZ/actions"
echo "Google Cloud: https://console.cloud.google.com/appengine?project=$PROJECT_ID"
echo ""

echo "💡 TIP: If any command hangs, use the web console links provided!"
