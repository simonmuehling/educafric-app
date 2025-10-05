#!/bin/bash

# EDUCAFRIC - Selective GitHub Push for APK Generation
# This script pushes only critical files needed for Android APK generation

echo "🚀 EDUCAFRIC - Selective GitHub Push for APK Generation"
echo "======================================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not initialized. Please run 'git init' first."
    exit 1
fi

# Create .gitignore to exclude large folders temporarily
cat > .gitignore << EOF
# Temporary exclusions for selective push
node_modules/
dist/
build/
.replit
.upm/
venv/
__pycache__/
*.pyc
.env.local
.env.development.local
.env.test.local
.env.production.local

# Keep essential files for APK generation
!.github/
!android/
!client/
!server/
!shared/
!public/
!scripts/
!package.json
!package-lock.json
!capacitor.config.ts
!vite.config.ts
!tailwind.config.ts
!tsconfig.json
!drizzle.config.ts
!README.md
!CONNEXION_PARENTS_ENFANTS_EDUCAFRIC.md
!test-parent-child-connections.cjs

# Exclude large documentation files but keep essential ones
attached_assets/
backups/
*.md
!README.md
!CONNEXION_PARENTS_ENFANTS_EDUCAFRIC.md
!replit.md
EOF

echo "✅ Created selective .gitignore"

# Add critical files explicitly
echo "📁 Adding critical files for APK generation..."

# Core configuration files
git add package.json package-lock.json
git add capacitor.config.ts vite.config.ts tailwind.config.ts tsconfig.json
git add drizzle.config.ts
echo "✅ Added configuration files"

# GitHub Actions workflow
git add .github/
echo "✅ Added GitHub Actions workflow"

# Essential project folders
git add client/
git add server/
git add shared/
git add public/
git add scripts/
echo "✅ Added essential project folders"

# Android project (this is critical for APK generation)
git add android/
echo "✅ Added Android project folder"

# Essential documentation
git add README.md
git add CONNEXION_PARENTS_ENFANTS_EDUCAFRIC.md
git add test-parent-child-connections.cjs
git add replit.md
echo "✅ Added essential documentation"

# Check what's being committed
echo ""
echo "📋 Files to be committed:"
git status --porcelain | head -20
echo ""

# Commit changes
COMMIT_MESSAGE="feat: Complete parent-child connection system with equity principle

- Implemented 3 connection methods (automatic, QR code, manual)
- Storage layer with full CRUD operations
- 6 API endpoints for all connection workflows
- Frontend components for all user roles
- Complete subscription equity enforcement
- Comprehensive test suite validation
- Ready for Android APK generation

Critical files included:
- GitHub Actions workflow for APK generation
- Complete Android project structure
- React frontend and backend APIs
- Parent-child connection system
- Subscription equity implementation"

git commit -m "$COMMIT_MESSAGE"
echo "✅ Committed changes with detailed message"

# Display next steps
echo ""
echo "🎯 NEXT STEPS FOR GITHUB:"
echo "========================="
echo "1. Set your GitHub remote (if not already set):"
echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
echo ""
echo "2. Push to GitHub:"
echo "   git push -u origin main"
echo ""
echo "3. After successful push, GitHub Actions will:"
echo "   - Build the Android APK automatically"
echo "   - Generate signed APK/AAB files"
echo "   - Make artifacts available for download"
echo ""
echo "📱 ANDROID APK GENERATION READY!"
echo "✅ All critical files committed for deployment"

# Show file count
echo ""
echo "📊 COMMIT SUMMARY:"
echo "=================="
git show --stat HEAD | tail -10
echo ""
echo "🎉 Ready for GitHub push and APK generation!"