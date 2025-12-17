#!/bin/bash

# Script to add Firebase environment variables to GitHub Secrets
# This reads from .env.local and uploads to GitHub

set -e

echo "🔐 Adding Firebase Secrets to GitHub Repository"
echo "================================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found"
    echo "Please create .env.local with your Firebase credentials first"
    exit 1
fi

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) is not installed"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Error: Not authenticated with GitHub CLI"
    echo "Run: gh auth login"
    exit 1
fi

echo "📋 Reading Firebase credentials from .env.local..."
echo ""

# Read each Firebase variable and add to GitHub Secrets
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ "$key" =~ ^#.*$ ]] && continue
    [[ -z "$key" ]] && continue
    
    # Only process VITE_FIREBASE variables
    if [[ "$key" == VITE_FIREBASE_* ]]; then
        # Remove VITE_ prefix for secret name (GitHub Actions will add it back)
        secret_name="${key#VITE_}"
        
        echo "➕ Adding secret: $secret_name"
        echo "$value" | gh secret set "$secret_name"
        
        if [ $? -eq 0 ]; then
            echo "   ✅ Successfully added $secret_name"
        else
            echo "   ❌ Failed to add $secret_name"
        fi
        echo ""
    fi
done < .env.local

echo ""
echo "✅ All Firebase secrets have been added to GitHub!"
echo ""
echo "🔍 Verify secrets were added:"
gh secret list | grep FIREBASE || echo "   (No FIREBASE secrets found)"
echo ""
echo "🚀 Next: Push your code to trigger a new deployment with Firebase credentials"
