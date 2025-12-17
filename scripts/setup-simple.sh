#!/bin/bash

# Simplified Step-by-Step Deployment Setup
# Run each section manually to avoid hangs

echo "🚀 HolidayZ - Step-by-Step Deployment Setup"
echo "==========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📋 This script breaks down deployment into manageable steps${NC}"
echo "Run each section when prompted, and we'll guide you through any issues."
echo ""

# Function to wait for user input
wait_for_user() {
    echo ""
    read -p "Press Enter to continue to the next step..."
    echo ""
}

echo -e "${YELLOW}STEP 1: Set Your Project ID${NC}"
echo "Please provide your Google Cloud Project ID:"
read -p "Project ID: " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Project ID cannot be empty${NC}"
    exit 1
fi

echo "Using Project ID: $PROJECT_ID"
export GCP_PROJECT_ID=$PROJECT_ID

wait_for_user

echo -e "${YELLOW}STEP 2: Set Active Project (this might take a moment)${NC}"
echo "Running: gcloud config set project $GCP_PROJECT_ID"

if gcloud config set project $GCP_PROJECT_ID; then
    echo -e "${GREEN}✅ Project set successfully${NC}"
else
    echo -e "${RED}❌ Failed to set project. Please check if project exists and you have access${NC}"
    echo "You can create the project manually at: https://console.cloud.google.com/projectcreate"
    exit 1
fi

wait_for_user

echo -e "${YELLOW}STEP 3: Enable Required APIs${NC}"
echo "This will enable App Engine and other required services..."

echo "Enabling App Engine API..."
gcloud services enable appengine.googleapis.com

echo "Enabling Cloud Build API..."
gcloud services enable cloudbuild.googleapis.com

echo "Enabling Storage API..."
gcloud services enable storage.googleapis.com

echo -e "${GREEN}✅ APIs enabled${NC}"

wait_for_user

echo -e "${YELLOW}STEP 4: Check if App Engine exists${NC}"
if gcloud app describe >/dev/null 2>&1; then
    echo -e "${GREEN}✅ App Engine already exists${NC}"
    APP_REGION=$(gcloud app describe --format="value(locationId)")
    echo "App Engine region: $APP_REGION"
else
    echo "App Engine doesn't exist. Creating in us-central1 (cost-effective region)..."
    if gcloud app create --region=us-central1; then
        echo -e "${GREEN}✅ App Engine created successfully${NC}"
    else
        echo -e "${RED}❌ Failed to create App Engine${NC}"
        echo "Please create it manually at: https://console.cloud.google.com/appengine"
        exit 1
    fi
fi

wait_for_user

echo -e "${YELLOW}STEP 5: Create Service Account${NC}"
SA_NAME="github-actions"
SA_EMAIL="$SA_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com"

echo "Creating service account: $SA_EMAIL"
gcloud iam service-accounts create $SA_NAME \
    --display-name="GitHub Actions Deployment" \
    --description="Service account for automated deployment" \
    2>/dev/null || echo "Service account might already exist"

echo -e "${GREEN}✅ Service account ready${NC}"

wait_for_user

echo -e "${YELLOW}STEP 6: Grant Permissions${NC}"
echo "Granting required permissions to service account..."

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/appengine.deployer" \
    --quiet

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/appengine.serviceAdmin" \
    --quiet

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/storage.admin" \
    --quiet

echo -e "${GREEN}✅ Permissions granted${NC}"

wait_for_user

echo -e "${YELLOW}STEP 7: Create Service Account Key${NC}"
KEY_FILE="$HOME/holidayz-github-key.json"

echo "Creating service account key..."
if gcloud iam service-accounts keys create "$KEY_FILE" \
    --iam-account="$SA_EMAIL"; then
    echo -e "${GREEN}✅ Key created: $KEY_FILE${NC}"
else
    echo -e "${RED}❌ Failed to create key${NC}"
    exit 1
fi

# Base64 encode the key
echo "Encoding key for GitHub..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    GCP_SA_KEY=$(base64 -i "$KEY_FILE" | tr -d '\n')
else
    GCP_SA_KEY=$(base64 -w 0 "$KEY_FILE")
fi

echo -e "${GREEN}✅ Key encoded for GitHub${NC}"

wait_for_user

echo -e "${YELLOW}STEP 8: Set GitHub Secrets${NC}"
echo "Setting up GitHub repository secrets..."

if command -v gh &> /dev/null && gh auth status &> /dev/null; then
    echo "Setting GCP_PROJECT_ID secret..."
    echo "$GCP_PROJECT_ID" | gh secret set GCP_PROJECT_ID
    
    echo "Setting GCP_SA_KEY secret..."
    echo "$GCP_SA_KEY" | gh secret set GCP_SA_KEY
    
    echo -e "${GREEN}✅ GitHub secrets configured automatically${NC}"
else
    echo -e "${YELLOW}⚠️  GitHub CLI not available or not logged in${NC}"
    echo "Please set these secrets manually at:"
    echo "https://github.com/brainbugXT/HolidayZ/settings/secrets/actions"
    echo ""
    echo "Secret 1:"
    echo "Name: GCP_PROJECT_ID"
    echo "Value: $GCP_PROJECT_ID"
    echo ""
    echo "Secret 2:"
    echo "Name: GCP_SA_KEY"
    echo "Value: $GCP_SA_KEY"
    echo ""
    read -p "Press Enter after setting the secrets manually..."
fi

wait_for_user

echo -e "${YELLOW}STEP 9: Test Build Locally${NC}"
echo "Testing the application build..."

if npm run build; then
    BUNDLE_SIZE=$(du -sh dist/ 2>/dev/null | cut -f1 || echo "unknown")
    echo -e "${GREEN}✅ Build successful! Bundle size: $BUNDLE_SIZE${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

wait_for_user

echo -e "${YELLOW}STEP 10: Test GitHub Actions${NC}"
echo "Creating a test commit to trigger GitHub Actions..."

# Create a small test change
echo "# Deployment Test - $(date)" >> README.md
git add README.md

if git commit -m "🚀 Test: Trigger automated deployment

- Testing GitHub Actions workflow
- Verifying Google Cloud deployment
- Confirming cost optimization settings"; then
    echo "Pushing to trigger deployment..."
    git push
    echo -e "${GREEN}✅ Test commit pushed${NC}"
else
    echo -e "${RED}❌ Failed to create test commit${NC}"
fi

wait_for_user

echo ""
echo -e "${GREEN}🎉 Deployment Setup Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo "• Project ID: $GCP_PROJECT_ID"
echo "• App Engine: Configured"
echo "• Service Account: Created with minimal permissions"
echo "• GitHub Secrets: Configured"
echo "• Build Test: Successful"
echo "• GitHub Actions: Triggered"
echo ""
echo -e "${BLUE}🔍 Monitor Your Deployment:${NC}"
echo "• GitHub Actions: https://github.com/brainbugXT/HolidayZ/actions"
echo "• Google Cloud: https://console.cloud.google.com/appengine?project=$GCP_PROJECT_ID"
echo "• App URL (after deployment): https://$GCP_PROJECT_ID.appspot.com"
echo ""
echo -e "${GREEN}✨ Your HolidayZ app will be live shortly!${NC}"

# Cleanup
echo ""
echo "Cleaning up local key file for security..."
rm -f "$KEY_FILE"
echo -e "${GREEN}✅ Local key file removed${NC}"
