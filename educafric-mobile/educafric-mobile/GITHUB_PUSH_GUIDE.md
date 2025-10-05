# EDUCAFRIC - GitHub Push Guide for APK Generation

## 🎯 Critical Files for Android APK Generation

This guide helps you push only the essential files needed for GitHub Actions to build your Android APK.

### ✅ Files Included in Push

#### **Core Configuration**
- `package.json` & `package-lock.json` - Dependencies
- `capacitor.config.ts` - Capacitor configuration  
- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Styling configuration
- `tsconfig.json` - TypeScript configuration
- `drizzle.config.ts` - Database configuration

#### **GitHub Actions**
- `.github/workflows/android-build.yml` - APK build workflow

#### **Project Folders**
- `android/` - Complete Android project structure
- `client/` - React frontend application
- `server/` - Backend APIs and services
- `shared/` - Shared schemas and types
- `public/` - Static assets
- `scripts/` - Build and utility scripts

#### **Documentation**
- `README.md` - Project documentation
- `CONNEXION_PARENTS_ENFANTS_EDUCAFRIC.md` - Parent-child system docs
- `test-parent-child-connections.cjs` - Test suite
- `replit.md` - Project context and preferences

### 🚀 Quick Push Commands

```bash
# 1. Run the selective push script
./scripts/selective-github-push.sh

# 2. Set your GitHub remote (replace with your repo)
git remote add origin https://github.com/YOUR_USERNAME/educafric.git

# 3. Push to GitHub
git push -u origin main
```

### 📱 What Happens After Push

1. **GitHub Actions triggers automatically**
2. **Android APK/AAB files are built**
3. **Signed artifacts available for download**
4. **Ready for Google Play Store submission**

### 🔧 Manual Git Commands (Alternative)

If you prefer manual control:

```bash
# Initialize git (if needed)
git init

# Add critical files
git add package.json package-lock.json
git add capacitor.config.ts vite.config.ts tailwind.config.ts tsconfig.json
git add .github/ android/ client/ server/ shared/ public/ scripts/
git add README.md CONNEXION_PARENTS_ENFANTS_EDUCAFRIC.md
git add test-parent-child-connections.cjs

# Commit
git commit -m "feat: Complete EDUCAFRIC platform ready for APK generation"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### ❌ Files Excluded (Too Large)

These folders are excluded to avoid GitHub's file limits:
- `attached_assets/` - Large asset files
- `backups/` - Backup files
- `node_modules/` - Dependencies (rebuilt by GitHub Actions)
- Most `.md` documentation files (except essential ones)

### ✅ GitHub Actions Workflow

The `.github/workflows/android-build.yml` file will:
1. Setup Node.js and Java environment
2. Install dependencies with `npm install`
3. Build React frontend with `npm run build`
4. Sync Capacitor with `npx cap sync`
5. Build Android APK/AAB with Gradle
6. Sign and optimize APK files
7. Upload artifacts for download

### 🎉 Result

After successful push and GitHub Actions completion:
- **APK file ready for testing**
- **AAB file ready for Google Play Store**
- **All parent-child connection features included**
- **Subscription equity system implemented**
- **Complete African educational platform**

### 📞 Support

If you encounter issues:
1. Check GitHub Actions logs for build errors
2. Verify all critical files are present in repository
3. Ensure Android SDK requirements are met
4. Contact support if APK generation fails

**🚀 Your EDUCAFRIC platform is ready for deployment!**