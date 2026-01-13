# GitHub Repository Setup Guide

This guide will help you set up and push StockVerify to GitHub.

## Prerequisites

- Git installed on your system
- GitHub account
- GitHub CLI (optional, but recommended)

## Step 1: Create GitHub Repository

### Option A: Using GitHub Web Interface

1. Go to [GitHub](https://github.com)
2. Click the "+" icon in the top right
3. Select "New repository"
4. Repository name: `stockverify` (or your preferred name)
5. Description: "Professional inventory audit and stock verification mobile app"
6. Choose Public or Private
7. **DO NOT** initialize with README, .gitignore, or license (we already have these)
8. Click "Create repository"

### Option B: Using GitHub CLI

```bash
gh repo create stockverify --public --description "Professional inventory audit and stock verification mobile app"
```

## Step 2: Initialize Git (if not already done)

```bash
cd /home/user/workspace

# Check if git is initialized
git status

# If not initialized, run:
git init
```

## Step 3: Add Remote Repository

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/stockverify.git

# Or using SSH (if you have SSH keys set up):
# git remote add origin git@github.com:YOUR_USERNAME/stockverify.git

# Verify remote was added
git remote -v
```

## Step 4: Stage and Commit Files

```bash
# Check current status
git status

# Add all files (respecting .gitignore)
git add .

# Commit with a meaningful message
git commit -m "Initial commit: StockVerify inventory audit system

- React Native mobile app with Expo SDK 53
- Node.js Express backend
- Python FastAPI backend
- Complete inventory management features
- Role-based access control
- Offline support
- Real-time analytics and reporting"

# Check commit was created
git log --oneline
```

## Step 5: Push to GitHub

```bash
# Push to main branch (or master if that's your default)
git branch -M main
git push -u origin main

# If you get authentication errors, you may need to:
# 1. Use GitHub Personal Access Token instead of password
# 2. Set up SSH keys
# 3. Use GitHub CLI: gh auth login
```

## Step 6: Verify on GitHub

1. Go to your repository on GitHub
2. Verify all files are present
3. Check that README.md displays correctly
4. Verify .gitignore is working (no node_modules, .env files, etc.)

## Step 7: Set Up Repository Settings

### Add Topics/Tags
- `react-native`
- `expo`
- `inventory-management`
- `stock-verification`
- `typescript`
- `nodejs`
- `fastapi`
- `mobile-app`

### Add Repository Description
"Professional inventory audit and stock verification mobile app built with React Native (Expo) and Node.js/Python backends"

### Enable GitHub Actions
The repository includes a CI workflow (`.github/workflows/ci.yml`) that will run on pushes and pull requests.

## Step 8: Create Initial Release

```bash
# Tag the initial release
git tag -a v1.0.0 -m "Initial release: StockVerify v1.0.0"
git push origin v1.0.0
```

Then on GitHub:
1. Go to "Releases"
2. Click "Draft a new release"
3. Select tag `v1.0.0`
4. Title: "StockVerify v1.0.0 - Initial Release"
5. Add release notes
6. Publish release

## Troubleshooting

### Authentication Issues

**Problem**: `remote: Support for password authentication was removed`

**Solution**: Use Personal Access Token or SSH
```bash
# Generate Personal Access Token:
# 1. GitHub → Settings → Developer settings → Personal access tokens
# 2. Generate new token with 'repo' scope
# 3. Use token as password when pushing

# Or set up SSH:
ssh-keygen -t ed25519 -C "your_email@example.com"
# Add public key to GitHub → Settings → SSH and GPG keys
```

### Large Files

**Problem**: Files are too large for GitHub

**Solution**: Use Git LFS or exclude large files
```bash
# Install Git LFS
git lfs install

# Track large files (if needed)
git lfs track "*.psd"
git lfs track "*.zip"
```

### Branch Protection

After initial push, consider setting up branch protection:
1. Go to Settings → Branches
2. Add rule for `main` branch
3. Require pull request reviews
4. Require status checks to pass

## Next Steps

1. ✅ Repository is set up
2. ✅ Code is pushed
3. 📝 Add collaborators (if needed)
4. 📝 Set up GitHub Actions secrets (for CI/CD)
5. 📝 Configure branch protection
6. 📝 Add project board for issue tracking
7. 📝 Set up GitHub Pages (if needed for documentation)

## Useful Git Commands

```bash
# Check status
git status

# View changes
git diff

# View commit history
git log --oneline --graph

# Create new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main

# Pull latest changes
git pull origin main

# Push changes
git push origin main

# View remotes
git remote -v
```

## GitHub Repository Checklist

- [ ] Repository created on GitHub
- [ ] Remote added to local repository
- [ ] All files committed
- [ ] Code pushed to GitHub
- [ ] README displays correctly
- [ ] .gitignore is working
- [ ] Topics/tags added
- [ ] Description added
- [ ] Initial release created
- [ ] Collaborators added (if needed)
- [ ] Branch protection enabled (optional)

---

**Need Help?** Open an issue or check GitHub documentation: https://docs.github.com
