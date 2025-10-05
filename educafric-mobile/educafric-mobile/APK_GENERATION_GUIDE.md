# 📱 EDUCAFRIC Android APK Generation Guide

## 🚀 GitHub Actions APK Generation

### Method 1: Manual Workflow Trigger
1. **Go to GitHub Actions**: https://github.com/simonmuehling/educafric-platform/actions
2. **Select workflow**: "Build Android APK - EDUCAFRIC v4"
3. **Click "Run workflow"**
4. **Configure build parameters**:
   - Build type: `release`
   - Version name: `4.2.1`
   - Version code: `4`
5. **Click "Run workflow" button**

### Method 2: Release Creation
1. **Go to Releases**: https://github.com/simonmuehling/educafric-platform/releases
2. **Click "Create a new release"**
3. **Set tag**: `v4.2.1`
4. **Release title**: `EDUCAFRIC v4.2.1 - Complete Educational Platform`
5. **Description**:
```
🎓 EDUCAFRIC v4.2.1 Release

✅ Complete African educational platform
✅ Multi-role system (8 user types)
✅ Firebase integration for mobile services
✅ Geolocation tracking for student safety
✅ Payment integration (Stripe + African methods)
✅ Communication system (SMS, WhatsApp, Email)
✅ Report card generation system
✅ Comprehensive dashboard for all roles

📱 Android APK included in release assets
```
6. **Publish release** - This triggers automatic APK generation

## 🔧 Local Build Alternative

If GitHub Actions builds fail, use local build:

```bash
cd ~/workspace

# Install dependencies
npm ci
npm install -g @capacitor/cli

# Build web application
npm run build

# Sync with Android
npx cap sync android

# Open Android Studio (if available)
npx cap open android

# OR build via command line
cd android
./gradlew assembleRelease
```

## 📦 Expected Output

### APK Location
- **GitHub Release**: Download from release assets
- **Local build**: `android/app/build/outputs/apk/release/app-release.apk`

### APK Information
- **Package**: `com.educafric.app`
- **Version**: 4.2.1 (code: 4)
- **Size**: ~15-25MB
- **Target SDK**: Android 14 (API 34)
- **Min SDK**: Android 7.0 (API 24)

## 🎯 Next Steps After APK Generation

1. **Test APK**: Install on Android device for testing
2. **Google Play Store**: Upload AAB for distribution
3. **Distribution**: Share APK for beta testing
4. **Updates**: Use GitHub releases for version management

Choose Method 1 for immediate APK generation or Method 2 for creating a proper release with APK attached.