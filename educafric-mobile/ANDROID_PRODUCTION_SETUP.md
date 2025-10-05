# Android Production Build Guide

## Overview
This guide explains how to build and deploy the Educafric mobile app for Android production.

## Prerequisites

1. **Android Studio** installed
2. **Java Development Kit (JDK) 21** installed
3. **Android SDK** installed
4. **Node.js** and **npm** installed

## Step 1: Configure Production API URL

Update `src/services/api.ts` to point to your production server:

```typescript
// For production - use your Replit deployment URL
const API_BASE_URL = 'https://YOUR-REPL-NAME.replit.app';

// Alternative: Use your custom domain
// const API_BASE_URL = 'https://api.educafric.com';
```

**Important Notes:**
- Replace `YOUR-REPL-NAME` with your actual Replit project name
- Ensure your backend is published/deployed on Replit
- Test the API URL in a browser first to ensure it's accessible
- Make sure CORS is properly configured on the backend

## Step 2: Generate Production Keystore

Android apps must be signed for Play Store distribution. Generate a keystore:

```bash
cd educafric-mobile/android/app

# Generate production keystore
keytool -genkeypair -v -storetype PKCS12 \
  -keystore educafric-release.keystore \
  -alias educafric \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# You'll be prompted for:
# - Keystore password (SAVE THIS!)
# - Key password (SAVE THIS!)
# - Your name, organization, etc.
```

**CRITICAL**: Store these passwords securely! You'll need them for all future updates.

## Step 3: Configure Signing in Gradle

Create `educafric-mobile/android/gradle.properties` (if it doesn't exist):

```properties
EDUCAFRIC_RELEASE_STORE_FILE=educafric-release.keystore
EDUCAFRIC_RELEASE_KEY_ALIAS=educafric
EDUCAFRIC_RELEASE_STORE_PASSWORD=YOUR_STORE_PASSWORD
EDUCAFRIC_RELEASE_KEY_PASSWORD=YOUR_KEY_PASSWORD
```

**Security Note**: Never commit this file to Git! Add to `.gitignore`.

Update `educafric-mobile/android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (project.hasProperty('EDUCAFRIC_RELEASE_STORE_FILE')) {
                storeFile file(EDUCAFRIC_RELEASE_STORE_FILE)
                storePassword EDUCAFRIC_RELEASE_STORE_PASSWORD
                keyAlias EDUCAFRIC_RELEASE_KEY_ALIAS
                keyPassword EDUCAFRIC_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"
        }
    }
}
```

## Step 4: Update App Metadata

Edit `educafric-mobile/android/app/build.gradle`:

```gradle
defaultConfig {
    applicationId "com.educafric.mobile"  // Must match Google Play Console
    minSdkVersion 23                       // Android 6.0+ (covers 95%+ devices)
    targetSdkVersion 34                    // Latest Android 14
    versionCode 1                          // Increment for each release
    versionName "1.0.0"                    // User-visible version
}
```

**Version Guidelines:**
- `versionCode`: Integer that must increase with each update (1, 2, 3...)
- `versionName`: User-facing version string ("1.0.0", "1.0.1", "1.1.0")

## Step 5: Optimize for Production

Update `educafric-mobile/android/app/build.gradle`:

```gradle
def enableProguardInReleaseBuilds = true  // Enable code optimization

android {
    ...
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"
        }
    }
}
```

Add to `educafric-mobile/android/app/proguard-rules.pro`:

```proguard
# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Axios
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
```

## Step 6: Build Production APK

```bash
cd educafric-mobile

# Clean previous builds
cd android
./gradlew clean

# Build release APK
./gradlew assembleRelease

# Or build Android App Bundle (AAB) for Play Store
./gradlew bundleRelease
```

**Output Locations:**
- **APK**: `android/app/build/outputs/apk/release/app-release.apk`
- **AAB**: `android/app/build/outputs/bundle/release/app-release.aab`

**Which format?**
- **AAB** (preferred): Required for Google Play Store, smaller downloads
- **APK**: For direct distribution, testing, or third-party stores

## Step 7: Test the Production Build

Before submitting to Play Store, test thoroughly:

```bash
# Install release APK on a device
adb install android/app/build/outputs/apk/release/app-release.apk

# Or use Android Studio:
# 1. Open Android Studio
# 2. Select "Build" → "Generate Signed Bundle/APK"
# 3. Choose your keystore and build
# 4. Install on device for testing
```

**Testing Checklist:**
- [ ] Login works with production API
- [ ] All screens load correctly
- [ ] API calls succeed (check network in logs)
- [ ] No crashes or errors
- [ ] App icon and name display correctly
- [ ] Permissions work (internet access)

## Step 8: Prepare for Google Play Store

### Required Assets

Create in `educafric-mobile/android/app/src/main/res/`:

1. **App Icon** (multiple sizes):
   - `mipmap-mdpi/ic_launcher.png` (48×48)
   - `mipmap-hdpi/ic_launcher.png` (72×72)
   - `mipmap-xhdpi/ic_launcher.png` (96×96)
   - `mipmap-xxhdpi/ic_launcher.png` (144×144)
   - `mipmap-xxxhdpi/ic_launcher.png` (192×192)

2. **Feature Graphic** (1024×500): Required for Play Store listing

3. **Screenshots**: At least 2 screenshots (phone + tablet if applicable)

4. **Privacy Policy URL**: Required by Google Play

### Play Store Listing Information

Prepare these details:

```yaml
App Name: Educafric
Short Description: African Educational Technology Platform
Full Description: |
  Educafric is a comprehensive educational technology platform designed
  for the African market. Features include:
  - Student grade management
  - Attendance tracking
  - Parent-teacher communication
  - WhatsApp notifications
  - Bilingual support (French/English)
  
Category: Education
Content Rating: Everyone
Contact Email: support@educafric.com
Privacy Policy: https://educafric.com/privacy
```

## Step 9: Create Google Play Console Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Pay one-time $25 registration fee
3. Create new application
4. Fill in store listing details
5. Upload AAB file
6. Complete content rating questionnaire
7. Set pricing (Free or Paid)
8. Submit for review

**Review Process**: Usually takes 1-3 days for first submission

## Android App Store Compliance

### Payment Restrictions

**CRITICAL**: Per Google Play policies, school subscriptions are removed:

✅ **Allowed**: Parent subscriptions (1,000-1,500 CFA/month)
✅ **Allowed**: Teacher subscriptions (12,500-25,000 CFA)
✅ **Allowed**: Freelancer subscriptions
❌ **Removed**: School payment functionality (Android/Apple compliance)

**Implementation Status**:
- ✅ School payment UI removed
- ✅ School subscription API routes deleted
- ✅ Schools use Educafric for free (freemium model)
- ✅ Only parents, teachers, freelancers can subscribe

### Required Changes Made

1. **Removed Components**:
   - `SchoolSubscription.tsx` component
   - `/api/school/subscription` routes
   - School payment documents

2. **Simplified Logic**:
   - All schools = freemium (free basic access)
   - Subscription service only handles parent/teacher/freelancer payments
   - Gateway logic updated for freemium schools

This ensures compliance with Google Play and Apple App Store policies.

## Troubleshooting

### Build Fails

```bash
# Clear all caches
cd educafric-mobile/android
./gradlew clean
./gradlew cleanBuildCache
rm -rf .gradle

# Try again
./gradlew assembleRelease
```

### Keystore Issues

```bash
# List keystore contents to verify
keytool -list -v -keystore educafric-release.keystore

# Check alias
keytool -list -keystore educafric-release.keystore
```

### API Connection Issues

1. Ensure backend is published on Replit
2. Test API URL in browser: `https://YOUR-REPL.replit.app/api/health`
3. Check CORS configuration in backend
4. Verify HTTPS (required for production)

## Continuous Updates

### For Each New Version:

1. Update `versionCode` (increment by 1)
2. Update `versionName` (semantic versioning)
3. Build new AAB: `./gradlew bundleRelease`
4. Upload to Play Console
5. Fill in "What's new" release notes
6. Submit for review

Example version progression:
```
1.0.0 (versionCode 1) - Initial release
1.0.1 (versionCode 2) - Bug fixes
1.1.0 (versionCode 3) - New features
2.0.0 (versionCode 4) - Major update
```

## Security Best Practices

1. **Never commit keystore files to Git**
2. **Never commit gradle.properties with passwords**
3. **Store keystore in secure location** (encrypted backup)
4. **Use HTTPS for production API**
5. **Enable code obfuscation** (ProGuard/R8)

## Support Resources

- [Android Studio Download](https://developer.android.com/studio)
- [React Native Documentation](https://reactnative.dev/)
- [Google Play Console](https://play.google.com/console)
- [Android Developer Guides](https://developer.android.com/guide)

## Quick Reference Commands

```bash
# Development build (debug)
cd educafric-mobile/android
./gradlew assembleDebug

# Production build (release APK)
./gradlew assembleRelease

# Production bundle (release AAB for Play Store)
./gradlew bundleRelease

# Install on device
adb install app/build/outputs/apk/release/app-release.apk

# Check build outputs
ls -la app/build/outputs/apk/release/
ls -la app/build/outputs/bundle/release/
```

---

**Next Steps**: After completing this setup, follow the Google Play Console submission process to publish your app to the Android Play Store.
