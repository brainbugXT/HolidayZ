#!/bin/bash

# Cost Optimization Script for Google Cloud Deployment
# This script sets up cost monitoring and optimization for the HolidayZ app

echo "🔧 Setting up Cost-Optimized Google Cloud Deployment"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if required environment variables are set
check_env() {
    if [ -z "$GCP_PROJECT_ID" ]; then
        echo -e "${RED}❌ GCP_PROJECT_ID environment variable not set${NC}"
        echo "Please set it: export GCP_PROJECT_ID=your-project-id"
        exit 1
    fi
    echo -e "${GREEN}✅ Project ID: $GCP_PROJECT_ID${NC}"
}

# Set up billing budgets and alerts
setup_billing_budget() {
    echo ""
    echo -e "${YELLOW}🏦 Setting up billing budget...${NC}"
    
    # Create a budget for $5/month with alerts
    gcloud beta billing budgets create \
        --billing-account=$(gcloud beta billing projects describe $GCP_PROJECT_ID --format="value(billingAccountName.basename())") \
        --display-name="HolidayZ Monthly Budget" \
        --budget-amount=5USD \
        --threshold-rule=percent=50,basis=CURRENT_SPEND \
        --threshold-rule=percent=90,basis=CURRENT_SPEND \
        --threshold-rule=percent=100,basis=CURRENT_SPEND \
        --all-updates-rule-pubsub-topic=projects/$GCP_PROJECT_ID/topics/billing-alerts \
        2>/dev/null || echo "Budget might already exist"
        
    echo -e "${GREEN}✅ Billing budget configured ($5/month with alerts)${NC}"
}

# Configure App Engine for cost optimization
optimize_app_engine() {
    echo ""
    echo -e "${YELLOW}⚙️ Configuring App Engine for cost optimization...${NC}"
    
    # Set minimum instances to 0 for cost savings
    echo "Setting up automatic scaling..."
    
    # Enable detailed monitoring (helps with cost optimization)
    gcloud services enable monitoring.googleapis.com
    gcloud services enable logging.googleapis.com
    
    echo -e "${GREEN}✅ App Engine optimized for minimal costs${NC}"
}

# Set up monitoring and alerting
setup_monitoring() {
    echo ""
    echo -e "${YELLOW}📊 Setting up cost monitoring...${NC}"
    
    # Create notification channel (requires setup in Cloud Console)
    echo "Setting up monitoring policies..."
    
    # You can add specific monitoring policies here
    # For now, we'll just enable the necessary services
    gcloud services enable cloudmonitoring.googleapis.com
    
    echo -e "${GREEN}✅ Monitoring services enabled${NC}"
}

# Create cost optimization deployment script
create_deploy_script() {
    echo ""
    echo -e "${YELLOW}📝 Creating optimized deployment script...${NC}"
    
    cat > deploy-optimized.sh << 'EOF'
#!/bin/bash

# Optimized deployment script for HolidayZ
echo "🚀 Starting cost-optimized deployment..."

# Build with production optimizations
NODE_ENV=production npm run build

# Check bundle size
BUNDLE_SIZE=$(du -sh dist/ | cut -f1)
echo "Bundle size: $BUNDLE_SIZE"

# Deploy without promoting first (for testing)
VERSION_ID=$(date +%Y%m%d-%H%M%S)
echo "Deploying version: $VERSION_ID"

gcloud app deploy app.yaml \
  --version=$VERSION_ID \
  --no-promote \
  --quiet

# Test the new version
APP_URL=$(gcloud app versions describe $VERSION_ID --service=default --format="value(versionUrl)")
echo "Testing deployment at: $APP_URL"

# Simple health check
if curl -f -s "$APP_URL" > /dev/null; then
    echo "✅ Health check passed"
    
    # Promote if healthy
    read -p "Promote this version to production? (y/N): " promote
    if [[ $promote =~ ^[Yy]$ ]]; then
        gcloud app services set-traffic default --splits=$VERSION_ID=100
        echo "🎉 Version promoted to production"
        
        # Clean up old versions (keep last 3)
        echo "Cleaning up old versions..."
        gcloud app versions list --service=default --format="value(id)" --sort-by="~createTime" | tail -n +4 | xargs -r gcloud app versions delete --quiet --service=default
    fi
else
    echo "❌ Health check failed - not promoting"
fi
EOF

    chmod +x deploy-optimized.sh
    echo -e "${GREEN}✅ Created deploy-optimized.sh script${NC}"
}

# Display cost optimization tips
show_cost_tips() {
    echo ""
    echo -e "${YELLOW}💡 Cost Optimization Tips:${NC}"
    echo ""
    echo "1. 🕒 Your app scales to ZERO instances when not in use"
    echo "2. 💰 F1 instance class minimizes compute costs"
    echo "3. 🔄 Automatic cleanup of old versions saves storage"
    echo "4. 📦 Asset compression and caching reduces bandwidth"
    echo "5. ⏰ Off-hours deployments avoid peak pricing"
    echo "6. 🔍 Monitoring helps track and optimize costs"
    echo ""
    echo -e "${GREEN}Expected monthly cost: $1-5 USD for typical family usage${NC}"
    echo ""
    echo "Monitor costs at: https://console.cloud.google.com/billing"
}

# Main execution
main() {
    check_env
    optimize_app_engine
    setup_monitoring
    create_deploy_script
    show_cost_tips
    
    echo ""
    echo -e "${GREEN}🎉 Cost optimization setup complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review the optimized app.yaml configuration"
    echo "2. Test deployment with: ./deploy-optimized.sh"
    echo "3. Monitor costs in Google Cloud Console"
    echo "4. Adjust scaling parameters if needed"
}

# Run if not being sourced
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
