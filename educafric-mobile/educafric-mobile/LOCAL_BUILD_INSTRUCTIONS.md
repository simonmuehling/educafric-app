# Local Android Build Instructions - EDUCAFRIC

## Prerequisites Setup

### 1. Install Java Development Kit (JDK)
```bash
# Download JDK 11 or newer from:
# https://www.oracle.com/java/technologies/javase-downloads.html

# Verify installation:
java -version
javac -version

# Set JAVA_HOME (add to ~/.bashrc or ~/.zshrc):
export JAVA_HOME=/path/to/your/jdk
export PATH=$JAVA_HOME/bin:$PATH
```

### 2. Install Android Studio
```bash
# Download from: https://developer.android.com/studio
# Install Android SDK, Build Tools, and Platform Tools
# Accept all licenses: ./gradlew --stop && ./gradlew clean
```

### 3. Set Android Environment Variables
```bash
# Add to ~/.bashrc or ~/.zshrc:
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## Build Process

### 1. Download Project Locally
```bash
# Option 1: Download from Replit (Recommended)
# 1. In your Replit project, click the three dots menu
# 2. Select "Download as ZIP"
# 3. Extract the ZIP file on your local machine
# 4. Rename folder to "educafric" if needed

cd educafric-project

# IMPORTANT: Remove broken node_modules from ZIP
rm -rf node_modules
rm -rf package-lock.json

# Install fresh dependencies
npm install

# Fix permissions (macOS/Linux)
chmod -R 755 .
```

### 2. Fix Capacitor Configuration Issues
```bash
# If you get "Capacitor CLI needs to run at the root of an npm package" error:
ls capacitor.config.*

# Remove problematic .ts config file
rm capacitor.config.ts

# Reinitialize Capacitor
npx cap init
# App name: Educafric
# App ID: com.muehlingsolutions.educafric

# Add Android platform
npx cap add android

# Verify Android package structure:
ls android/app/src/main/java/com/muehlingsolutions/educafric/MainActivity.java
```

### 3. Build Web Application
```bash
npm run build
# Creates optimized dist/ folder with production assets
```

### 4. Sync with Capacitor
```bash
npx cap sync android
# Output should show:
# ✔ Copying web assets from dist to android/app/src/main/assets/public
# ✔ Creating capacitor.config.json in android/app/src/main/assets
# ✔ copy android in X ms
# ✔ Updating Android plugins
# ✔ update android in X ms
```

### 5. Generate Production AAB
```bash
cd android
./gradlew clean
./gradlew bundleRelease

# Success output location:
# android/app/build/outputs/bundle/release/app-release.aab
```

## Alternative: Use Build Script
```bash
# Make executable
chmod +x scripts/build-android.sh

# Run production build
./scripts/build-android.sh prod

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

## Troubleshooting

### Common Issues:

1. **"JAVA_HOME not set"**
   ```bash
   export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
   ```

2. **"Android SDK not found"**
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   ```

3. **"Gradle wrapper not found"**
   ```bash
   cd android
   ./gradlew wrapper --gradle-version 8.0
   ```

4. **"Build tools missing"**
   - Open Android Studio
   - Go to Tools → SDK Manager
   - Install latest Build Tools and Platform Tools

## Verification Steps

### Test the AAB File:
```bash
# Install bundletool
wget https://github.com/google/bundletool/releases/download/1.15.4/bundletool-all-1.15.4.jar

# Generate APKs from AAB for testing
java -jar bundletool-all-1.15.4.jar build-apks \
  --bundle=android/app/build/outputs/bundle/release/app-release.aab \
  --output=educafric.apks

# Install on connected device
java -jar bundletool-all-1.15.4.jar install-apks --apks=educafric.apks
```

## Google Play Store Upload

1. **Upload AAB**: `android/app/build/outputs/bundle/release/app-release.aab`
2. **Package Name**: `com.muehlingsolutions.educafric`
3. **App Name**: `EDUCAFRIC`
4. **Descriptions**: Use content from `ANDROID_SUBMISSION_GUIDE.md`

Your Educafric Android app is now ready for production deployment! 🚀