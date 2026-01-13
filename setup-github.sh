#!/bin/bash

# Setup GitHub Repository for StockVerify
# This script helps you push your code to a new GitHub repository

set -e

REPO_NAME="stockverify"
GITHUB_USERNAME=""

echo "🚀 StockVerify - GitHub Repository Setup"
echo "========================================"
echo ""

# Get GitHub username if not provided
if [ -z "$GITHUB_USERNAME" ]; then
    read -p "Enter your GitHub username: " GITHUB_USERNAME
fi

echo ""
echo "📋 Steps to create and push to GitHub:"
echo ""
echo "1️⃣  Create the repository on GitHub:"
echo "   Go to: https://github.com/new"
echo "   Repository name: $REPO_NAME"
echo "   Description: Professional inventory audit and stock verification mobile app"
echo "   Choose: Public or Private"
echo "   ⚠️  DO NOT check 'Initialize with README'"
echo "   Click: 'Create repository'"
echo ""
read -p "Press Enter after you've created the repository on GitHub..."

echo ""
echo "2️⃣  Adding GitHub remote and pushing code..."
echo ""

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# Check if github remote already exists
if git remote | grep -q "^github$"; then
    echo "⚠️  GitHub remote already exists. Removing it..."
    git remote remove github
fi

# Add GitHub remote
echo "➕ Adding GitHub remote..."
git remote add github "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# Check if main branch exists
if git show-ref --verify --quiet refs/heads/main; then
    echo "✅ Main branch exists"
    MAIN_BRANCH="main"
else
    echo "📝 Creating main branch from current branch..."
    git checkout -b main 2>/dev/null || git branch main
    MAIN_BRANCH="main"
fi

# Push to GitHub
echo ""
echo "📤 Pushing code to GitHub..."
echo ""

# Try pushing current branch first
if [ "$CURRENT_BRANCH" != "$MAIN_BRANCH" ]; then
    echo "Pushing $CURRENT_BRANCH branch..."
    git push github "$CURRENT_BRANCH:$MAIN_BRANCH" || {
        echo "⚠️  Push failed. You may need to authenticate."
        echo ""
        echo "If you get authentication errors:"
        echo "1. Use a Personal Access Token instead of password"
        echo "2. Or set up SSH keys"
        echo ""
        echo "To push manually:"
        echo "  git push github $CURRENT_BRANCH:$MAIN_BRANCH"
        exit 1
    }
else
    git checkout "$MAIN_BRANCH"
    git push -u github "$MAIN_BRANCH" || {
        echo "⚠️  Push failed. You may need to authenticate."
        echo ""
        echo "If you get authentication errors:"
        echo "1. Use a Personal Access Token instead of password"
        echo "2. Or set up SSH keys"
        echo ""
        echo "To push manually:"
        echo "  git push -u github $MAIN_BRANCH"
        exit 1
    }
fi

echo ""
echo "✅ Success! Your code has been pushed to GitHub!"
echo ""
echo "🌐 Repository URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
echo "📝 Next steps:"
echo "   1. Visit your repository on GitHub"
echo "   2. Add repository description and topics"
echo "   3. Consider creating an initial release"
echo ""
