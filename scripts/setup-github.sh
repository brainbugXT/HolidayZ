#!/bin/bash

# HolidayZ GitHub Repository Setup Script
# This script helps set up the GitHub repository for the HolidayZ project

echo "🎉 HolidayZ GitHub Repository Setup"
echo "===================================="
echo ""

# Check if we're in the correct directory
if [ ! -f "package.json" ] || [ ! -d ".git" ]; then
    echo "❌ Error: Please run this script from the HolidayZ project root directory"
    exit 1
fi

echo "✅ Project directory confirmed"

# Check if GitHub CLI is installed
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI detected"
    echo ""
    
    # Check if user is logged in to GitHub CLI
    if gh auth status &> /dev/null; then
        echo "✅ GitHub CLI authenticated"
        echo ""
        
        read -p "Do you want to create a GitHub repository automatically? (y/N): " auto_create
        if [[ $auto_create =~ ^[Yy]$ ]]; then
            echo ""
            echo "🚀 Creating GitHub repository..."
            
            # Create the repository
            gh repo create HolidayZ --public --description "Family savings tracker application for the De Beer family" --source . --remote origin --push
            
            if [ $? -eq 0 ]; then
                echo "🎊 Repository created successfully!"
                echo "📱 Repository URL: https://github.com/$(gh api user --jq '.login')/HolidayZ"
            else
                echo "❌ Failed to create repository"
            fi
        fi
    else
        echo "❌ GitHub CLI not authenticated"
        echo "📝 Please run: gh auth login"
    fi
else
    echo "ℹ️  GitHub CLI not installed"
    echo ""
    echo "📝 Manual Setup Instructions:"
    echo "1. Go to https://github.com/new"
    echo "2. Repository name: HolidayZ"
    echo "3. Description: Family savings tracker application for the De Beer family"
    echo "4. Set visibility to Public or Private (your choice)"
    echo "5. Do NOT initialize with README, .gitignore, or license (we already have these)"
    echo "6. Click 'Create repository'"
    echo ""
    echo "Then run these commands:"
    echo "git remote add origin https://github.com/YOUR_USERNAME/HolidayZ.git"
    echo "git branch -M main"
    echo "git push -u origin main"
fi

echo ""
echo "📋 Repository Information:"
echo "• Project: HolidayZ Family Savings Tracker"
echo "• Owner: Kenith De Beer (kenith.debeer@gmail.com)"
echo "• Technology: React + TypeScript + Vite + Tailwind CSS"
echo "• Deployment: Google Cloud App Engine ready"
echo "• CI/CD: GitHub Actions configured"
echo ""
echo "🔧 Next Steps:"
echo "1. ✅ Repository created"
echo "2. 🔐 Set up Google Cloud deployment secrets"
echo "3. 🚀 Push code to trigger first deployment"
echo ""
echo "Google Cloud Secrets needed in GitHub repository settings:"
echo "• GCP_SA_KEY: Service account key (base64 encoded)"
echo "• GCP_PROJECT_ID: Your Google Cloud project ID"
