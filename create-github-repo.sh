#!/bin/bash

# Script to create GitHub repository and push code
# Usage: ./create-github-repo.sh [repository-name] [username]

set -e

REPO_NAME="${1:-stockverify}"
USERNAME="${2}"

echo "🚀 Creating GitHub Repository: $REPO_NAME"
echo ""

# Check if GitHub CLI is available
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found"
    
    # Check if authenticated
    if gh auth status &> /dev/null; then
        echo "✅ GitHub CLI authenticated"
        
        # Create repository
        echo "📦 Creating repository on GitHub..."
        gh repo create "$REPO_NAME" \
            --public \
            --description "Professional inventory audit and stock verification mobile app built with React Native (Expo) and Node.js/Python backends" \
            --source=. \
            --remote=github \
            --push
        
        echo ""
        echo "✅ Repository created and code pushed!"
        echo "🌐 View at: https://github.com/$(gh api user --jq .login)/$REPO_NAME"
    else
        echo "❌ GitHub CLI not authenticated"
        echo "Please run: gh auth login"
        exit 1
    fi
else
    echo "⚠️  GitHub CLI not found"
    echo ""
    echo "Please create the repository manually:"
    echo ""
    echo "1. Go to: https://github.com/new"
    echo "2. Repository name: $REPO_NAME"
    echo "3. Description: Professional inventory audit and stock verification mobile app"
    echo "4. Choose Public or Private"
    echo "5. DO NOT initialize with README"
    echo "6. Click 'Create repository'"
    echo ""
    echo "Then run these commands:"
    echo ""
    echo "  git remote add github https://github.com/YOUR_USERNAME/$REPO_NAME.git"
    echo "  git branch -M main"
    echo "  git push -u github main"
    echo ""
    
    if [ -n "$USERNAME" ]; then
        echo "Or if you want to add the remote now (replace YOUR_USERNAME):"
        echo "  git remote add github https://github.com/$USERNAME/$REPO_NAME.git"
    fi
fi
