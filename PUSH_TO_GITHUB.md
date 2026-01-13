# 🚀 Push to GitHub - Quick Guide

## Option 1: Automated Script (Recommended)

Run the setup script:

```bash
./setup-github.sh
```

The script will guide you through:
1. Creating the repository on GitHub
2. Adding the remote
3. Pushing your code

## Option 2: Manual Steps

### Step 1: Create Repository on GitHub

1. Go to: **https://github.com/new**
2. **Repository name:** `stockverify`
3. **Description:** `Professional inventory audit and stock verification mobile app built with React Native (Expo) and Node.js/Python backends`
4. Choose **Public** or **Private**
5. ⚠️ **DO NOT** check "Initialize with README"
6. Click **"Create repository"**

### Step 2: Add GitHub Remote

Replace `YOUR_USERNAME` with your GitHub username:

```bash
# Add GitHub remote
git remote add github https://github.com/YOUR_USERNAME/stockverify.git

# Verify remote was added
git remote -v
```

### Step 3: Push Code

```bash
# Option A: Push current branch to main
git push github changes:main

# Option B: Create and switch to main branch, then push
git checkout -b main
git push -u github main
```

### Step 4: Verify on GitHub

1. Visit: `https://github.com/YOUR_USERNAME/stockverify`
2. Verify all files are present
3. Check README displays correctly

## Authentication

If you get authentication errors:

### Option A: Personal Access Token (Recommended)

1. Go to: **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Click **"Generate new token"**
3. Select scopes: `repo` (full control)
4. Copy the token
5. When pushing, use the token as your password

### Option B: SSH Keys

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub: Settings → SSH and GPG keys → New SSH key

# Use SSH URL instead
git remote set-url github git@github.com:YOUR_USERNAME/stockverify.git
```

## Current Repository Status

- **Current Branch:** `changes`
- **Main Branch:** `main` (exists)
- **Files:** All committed and ready
- **Remote:** vibecodeapp.com (existing)

## Quick Commands

```bash
# Check status
git status

# View remotes
git remote -v

# View branches
git branch -a

# Push to GitHub (replace YOUR_USERNAME)
git remote add github https://github.com/YOUR_USERNAME/stockverify.git
git push github changes:main
```

## After Pushing

1. ✅ Add repository topics: `react-native`, `expo`, `inventory-management`, `stock-verification`
2. ✅ Update README if needed (use `README_GITHUB.md` as reference)
3. ✅ Create initial release (tag v1.0.0)
4. ✅ Enable GitHub Actions (already configured)
5. ✅ Set up branch protection (optional)

## Troubleshooting

### "Remote already exists"
```bash
git remote remove github
git remote add github https://github.com/YOUR_USERNAME/stockverify.git
```

### "Authentication failed"
- Use Personal Access Token instead of password
- Or set up SSH keys

### "Branch not found"
```bash
# Create main branch from current
git checkout -b main
git push -u github main
```

---

**Need help?** Check `GITHUB_SETUP.md` for detailed instructions.
