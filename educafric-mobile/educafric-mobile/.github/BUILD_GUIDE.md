# 🚀 EDUCAFRIC Android Build Guide

## Quick Start - Building APK/AAB

### Method 1: Using GitHub Actions (Recommended)
1. Go to your GitHub repository
2. Click on **"Actions"** tab
3. Select **"🚀 EDUCAFRIC Android Production Build"** 
4. Click **"Run workflow"**
5. Fill in the parameters:
   - **Version name**: e.g., `4.2.4`
   - **Version code**: e.g., `424` (must be higher than previous)
   - **Build type**: Choose `both` for APK + AAB, `apk` for testing, or `aab` for Play Store
   - **Release notes**: Brief description of changes

### Method 2: Local Development Build
```bash
# Install dependencies
npm ci
npm install -g @capacitor/cli

# Build web app
npm run build

# Sync with Android
npx cap sync android

# Build APK (for testing)
cd android && ./gradlew assembleDebug

# Build AAB (for Play Store)
cd android && ./gradlew bundleRelease
```

## 📱 Build Outputs

### APK Files (Direct Installation)
- **Location**: `android/app/build/outputs/apk/debug/`
- **Usage**: Direct installation on Android devices
- **File**: `app-debug.apk`
- **Size**: ~15-25 MB

### AAB Files (Google Play Store)
- **Location**: `android/app/build/outputs/bundle/release/`
- **Usage**: Upload to Google Play Console
- **File**: `app-release.aab`
- **Size**: ~12-18 MB (smaller, optimized by Play Store)

## 🎨 Logo Assets Included

The EDUCAFRIC app includes properly configured branding:

### App Icons
- **Main icon**: African classroom scene with students
- **Formats**: All Android density buckets (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
- **Location**: `android/app/src/main/res/mipmap-*/`

### Splash Screen
- **Branding**: EDUCAFRIC blue theme (#0079F2)
- **Logo**: Integrated classroom imagery
- **Location**: `android/app/src/main/res/drawable*/splash.png`

### Web Assets
- **Logo files**: `educafric-logo-512.png`, `educafric-logo-128.png`
- **Locations**: `public/`, `client/public/`, `android/app/src/main/assets/public/`

## 🔧 Version Management

### Version Numbers
- **Version Name**: Human-readable (e.g., "4.2.4")
- **Version Code**: Integer that must increase with each release (e.g., 424)

### Current Version
- **App Version**: 4.2.1 (code: 421)
- **Package**: com.muehlingsolutions.educafric
- **App Name**: EDUCAFRIC

## 📋 Pre-Build Checklist

Before running a build:
- [ ] Web app builds successfully (`npm run build`)
- [ ] Version numbers are incremented properly
- [ ] All logo assets are present
- [ ] Environment variables are configured
- [ ] Release notes are prepared

## 🚀 Deployment Options

### For Testing
1. **APK Build**: Use debug APK for internal testing
2. **Direct Install**: Share APK file for manual installation
3. **Firebase App Distribution**: Upload APK for team testing

### For Production
1. **AAB Build**: Generate release AAB
2. **Google Play Console**: Upload AAB to Play Console
3. **Internal Testing**: Use Play Console internal testing
4. **Production Release**: Push to production after testing

## 🔍 Troubleshooting

### Common Issues
1. **Build Fails**: Check Android SDK setup and Java version
2. **Version Conflicts**: Ensure version code is higher than previous
3. **Logo Missing**: Verify logo files in correct directories
4. **Capacitor Sync**: Run `npx cap sync android` if assets missing

### Build Logs
- Check GitHub Actions logs for detailed error information
- Local builds: Check `android/build/` directory for logs
- Gradle issues: Run with `--stacktrace --info` flags

## 📞 Support

For build issues:
1. Check this guide first
2. Review GitHub Actions logs
3. Verify local environment setup
4. Contact development team if needed

---

**🎯 Ready to Build?** Go to the Actions tab and run the **"🚀 EDUCAFRIC Android Production Build"** workflow!