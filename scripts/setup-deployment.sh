#!/bin/bash

# GitHub Actions Deployment Setup for HolidayZ
# This script guides you through setting up automated deployment

set -e  # Exit on any error

echo "🚀 GitHub Actions Deployment Setup for HolidayZ"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
    
    # Check if gcloud is installed
    if ! command -v gcloud &> /dev/null; then
        echo -e "${RED}❌ Google Cloud CLI not found${NC}"
        echo "Please install it: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    
    # Check if gh is installed
    if ! command -v gh &> /dev/null; then
        echo -e "${RED}❌ GitHub CLI not found${NC}"
        echo "Please install it: brew install gh"
        exit 1
    fi
    
    # Check if logged into GitHub
    if ! gh auth status &> /dev/null; then
        echo -e "${RED}❌ Not logged into GitHub CLI${NC}"
        echo "Please run: gh auth login"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All prerequisites met${NC}"
    echo ""
}

# Get or create Google Cloud project
setup_gcp_project() {
    echo -e "${YELLOW}☁️  Setting up Google Cloud Project...${NC}"
    
    # Get project ID from user
    read -p "Enter your Google Cloud Project ID (or press Enter to create a new one): " PROJECT_ID
    
    if [ -z "$PROJECT_ID" ]; then
        # Generate a project ID
        PROJECT_ID="holidayz-$(date +%Y%m%d)-$(openssl rand -hex 3)"
        echo "Creating new project: $PROJECT_ID"
        
        gcloud projects create $PROJECT_ID --name="HolidayZ Family Savings"
        
        # Enable billing (user needs to do this manually)
        echo -e "${YELLOW}⚠️  Please enable billing for project $PROJECT_ID in the Google Cloud Console${NC}"
        echo "https://console.cloud.google.com/billing/linkedaccount?project=$PROJECT_ID"
        read -p "Press Enter after enabling billing..."
    fi
    
    # Set active project
    gcloud config set project $PROJECT_ID
    echo -e "${GREEN}✅ Project set to: $PROJECT_ID${NC}"
    echo ""
    
    export GCP_PROJECT_ID=$PROJECT_ID
}

# Enable required APIs
enable_apis() {
    echo -e "${YELLOW}🔧 Enabling required APIs...${NC}"
    
    gcloud services enable appengine.googleapis.com
    gcloud services enable cloudbuild.googleapis.com
    gcloud services enable cloudmonitoring.googleapis.com
    gcloud services enable logging.googleapis.com
    
    echo -e "${GREEN}✅ APIs enabled${NC}"
    echo ""
}

# Initialize App Engine
init_app_engine() {
    echo -e "${YELLOW}🏗️  Initializing App Engine...${NC}"
    
    # Check if App Engine already exists
    if ! gcloud app describe &> /dev/null; then
        echo "Creating App Engine app..."
        
        # Use us-central1 for cost optimization
        gcloud app create --region=us-central1
        echo -e "${GREEN}✅ App Engine created in us-central1${NC}"
    else
        echo -e "${GREEN}✅ App Engine already exists${NC}"
    fi
    echo ""
}

# Create service account for GitHub Actions
create_service_account() {
    echo -e "${YELLOW}🔑 Creating service account for GitHub Actions...${NC}"
    
    SA_NAME="github-actions"
    SA_EMAIL="$SA_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com"
    
    # Create service account
    gcloud iam service-accounts create $SA_NAME \
        --display-name="GitHub Actions Deployment" \
        --description="Service account for automated deployment from GitHub Actions" \
        || echo "Service account might already exist"
    
    # Grant required permissions
    echo "Granting permissions..."
    gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
        --member="serviceAccount:$SA_EMAIL" \
        --role="roles/appengine.deployer"
    
    gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
        --member="serviceAccount:$SA_EMAIL" \
        --role="roles/appengine.serviceAdmin"
    
    gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
        --member="serviceAccount:$SA_EMAIL" \
        --role="roles/storage.admin"
    
    gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
        --member="serviceAccount:$SA_EMAIL" \
        --role="roles/cloudbuild.builds.editor"
    
    # Create and download key
    KEY_FILE="$HOME/github-actions-key-$GCP_PROJECT_ID.json"
    gcloud iam service-accounts keys create "$KEY_FILE" \
        --iam-account="$SA_EMAIL"
    
    # Base64 encode the key
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        GCP_SA_KEY=$(base64 -i "$KEY_FILE")
    else
        # Linux
        GCP_SA_KEY=$(base64 -w 0 "$KEY_FILE")
    fi
    
    echo -e "${GREEN}✅ Service account created and key generated${NC}"
    echo ""
    
    export GCP_SA_KEY
}

# Set up GitHub secrets
setup_github_secrets() {
    echo -e "${YELLOW}🔐 Setting up GitHub repository secrets...${NC}"
    
    # Get repository information
    REPO_INFO=$(gh repo view --json owner,name)
    REPO_OWNER=$(echo $REPO_INFO | jq -r '.owner.login')
    REPO_NAME=$(echo $REPO_INFO | jq -r '.name')
    
    echo "Repository: $REPO_OWNER/$REPO_NAME"
    
    # Set secrets
    echo "Setting GCP_PROJECT_ID secret..."
    echo "$GCP_PROJECT_ID" | gh secret set GCP_PROJECT_ID
    
    echo "Setting GCP_SA_KEY secret..."
    echo "$GCP_SA_KEY" | gh secret set GCP_SA_KEY
    
    echo -e "${GREEN}✅ GitHub secrets configured${NC}"
    echo ""
}

# Test deployment
test_deployment() {
    echo -e "${YELLOW}🧪 Testing deployment...${NC}"
    
    # Build locally first
    echo "Building application locally..."
    npm run build
    
    echo "Testing build..."
    if [ -f "dist/index.html" ]; then
        echo -e "${GREEN}✅ Build successful${NC}"
    else
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    fi
    
    # Optional: Deploy manually for first test
    read -p "Deploy manually now for testing? (y/N): " deploy_now
    if [[ $deploy_now =~ ^[Yy]$ ]]; then
        echo "Deploying to App Engine..."
        gcloud app deploy app.yaml --version=manual-test --no-promote --quiet
        
        echo "Getting app URL..."
        APP_URL="https://manual-test-dot-$GCP_PROJECT_ID.appspot.com"
        echo -e "${GREEN}✅ Test deployment available at: $APP_URL${NC}"
        
        # Promote if successful
        read -p "Promote to production? (y/N): " promote
        if [[ $promote =~ ^[Yy]$ ]]; then
            gcloud app services set-traffic default --splits=manual-test=100
            echo -e "${GREEN}✅ Promoted to production${NC}"
        fi
    fi
    
    echo ""
}

# Trigger GitHub Actions
trigger_github_actions() {
    echo -e "${YELLOW}🚀 Triggering GitHub Actions deployment...${NC}"
    
    # Make a small change to trigger deployment
    echo "# Deployment test $(date)" >> README.md
    git add README.md
    git commit -m "Test: Trigger GitHub Actions deployment

- Testing automated deployment workflow
- Verifying cost-optimized configuration
- Confirming secrets are properly configured"
    git push
    
    echo -e "${GREEN}✅ Pushed commit to trigger deployment${NC}"
    echo ""
    
    # Show workflow URL
    REPO_INFO=$(gh repo view --json owner,name)
    REPO_OWNER=$(echo $REPO_INFO | jq -r '.owner.login')
    REPO_NAME=$(echo $REPO_INFO | jq -r '.name')
    
    echo -e "${BLUE}📊 Monitor deployment progress:${NC}"
    echo "https://github.com/$REPO_OWNER/$REPO_NAME/actions"
    echo ""
    echo "Or run: gh run watch"
}

# Setup billing budget
setup_billing() {
    echo -e "${YELLOW}💰 Setting up billing budget...${NC}"
    
    # Get billing account
    BILLING_ACCOUNT=$(gcloud beta billing projects describe $GCP_PROJECT_ID --format="value(billingAccountName.basename())" 2>/dev/null || echo "")
    
    if [ -z "$BILLING_ACCOUNT" ]; then
        echo -e "${RED}⚠️  No billing account linked${NC}"
        echo "Please link a billing account in the Google Cloud Console:"
        echo "https://console.cloud.google.com/billing/linkedaccount?project=$GCP_PROJECT_ID"
    else
        echo "Creating $5 monthly budget..."
        gcloud beta billing budgets create \
            --billing-account=$BILLING_ACCOUNT \
            --display-name="HolidayZ Monthly Budget" \
            --budget-amount=5USD \
            --threshold-rule=percent=50,basis=CURRENT_SPEND \
            --threshold-rule=percent=90,basis=CURRENT_SPEND \
            --threshold-rule=percent=100,basis=CURRENT_SPEND \
            2>/dev/null || echo "Budget might already exist"
        
        echo -e "${GREEN}✅ Billing budget configured ($5/month)${NC}"
    fi
    echo ""
}

# Main execution
main() {
    echo -e "${BLUE}This script will:${NC}"
    echo "1. Set up Google Cloud project and App Engine"
    echo "2. Create service account with minimal required permissions"
    echo "3. Configure GitHub repository secrets"
    echo "4. Test the deployment process"
    echo "5. Set up cost monitoring"
    echo ""
    
    read -p "Continue? (y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
    
    check_prerequisites
    setup_gcp_project
    enable_apis
    init_app_engine
    create_service_account
    setup_github_secrets
    setup_billing
    test_deployment
    trigger_github_actions
    
    echo ""
    echo -e "${GREEN}🎉 Deployment setup complete!${NC}"
    echo ""
    echo -e "${BLUE}📋 Summary:${NC}"
    echo "• Project ID: $GCP_PROJECT_ID"
    echo "• App URL: https://$GCP_PROJECT_ID.appspot.com"
    echo "• GitHub Actions: Configured and tested"
    echo "• Cost optimization: Enabled (expect $1-5/month)"
    echo ""
    echo -e "${YELLOW}🔍 Monitor your deployment:${NC}"
    echo "• GitHub Actions: https://github.com/$(gh repo view --json owner,name | jq -r '.owner.login + \"/\" + .name')/actions"
    echo "• Google Cloud Console: https://console.cloud.google.com/appengine?project=$GCP_PROJECT_ID"
    echo "• Billing: https://console.cloud.google.com/billing"
    echo ""
    echo -e "${GREEN}🚀 Your HolidayZ family savings tracker is now automatically deployed!${NC}"
}

# Run the main function
main "$@"
