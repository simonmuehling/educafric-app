# Fix Android Development Setup on Mac - EDUCAFRIC Mobile App

## Current Error Analysis:
```
error Failed to install the app. Command failed with ENOENT: ./gradlew app:installDebug
spawn ./gradlew ENOENT
```

This means your Mac doesn't have the Android development environment properly configured.

## ✅ Complete Fix - Run These Commands:

### Step 1: Install Required Tools
```bash
# Install Homebrew (if you don't have it)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js, Java, and Android tools
brew install node
brew install --cask android-studio
brew install --cask zulu17  # Java 17 JDK
```

### Step 2: Set Up Environment Variables
Add these to your `~/.zshrc` or `~/.bash_profile`:

```bash
# Edit your shell profile
nano ~/.zshrc

# Add these lines:
export JAVA_HOME="/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/emulator"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
export PATH="$PATH:$ANDROID_HOME/tools"
export PATH="$PATH:$ANDROID_HOME/tools/bin"

# Save and reload
source ~/.zshrc
```

### Step 3: Install Android SDK Components
```bash
# Open Android Studio and install:
# - Android SDK
# - Android SDK Platform-Tools
# - Android SDK Build-Tools
# - Android Emulator

# Or use command line:
cd ~/Library/Android/sdk/tools/bin
./sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

### Step 4: Create/Connect Android Device

**Option A: Use Android Emulator**
```bash
# Create a virtual device in Android Studio
# AVD Manager > Create Virtual Device > Pixel 4 > Android 14 > Finish
```

**Option B: Use Physical Android Phone**
```bash
# Enable Developer Options on your phone:
# Settings > About Phone > Tap "Build Number" 7 times
# Settings > Developer Options > Enable "USB Debugging"
# Connect phone via USB
```

### Step 5: Fix Gradle Permissions (CRITICAL)
```bash
# Navigate to your mobile app directory
cd educafric-platform/educafric-mobile

# Make gradlew executable
chmod +x android/gradlew

# OR if that doesn't work:
cd android
chmod +x gradlew
```

### Step 6: Update API Configuration
```bash
# Edit the API URL to point to your Replit server
# File: src/services/api.ts

# Change from:
const API_BASE_URL = 'http://10.0.2.2:5000';

# To (replace with your actual Replit URL):
const API_BASE_URL = 'https://your-replit-name.replit.app';
```

### Step 7: Test the Build
```bash
# Clean install
npm install --legacy-peer-deps

# Start Metro bundler in separate terminal
npm start

# In another terminal, run Android
npm run android
```

## Quick Fix Commands (Try This First):

If you want to try a quick fix before the full setup:

```bash
cd educafric-platform/educafric-mobile
chmod +x android/gradlew
cd android
./gradlew clean
cd ..
npm run android
```

## Alternative: Use Expo Development Build

If Android Studio setup is too complex, you can use Expo:

```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Install Expo Go app on your phone from App Store

# In your project directory:
npx expo start

# Scan QR code with Expo Go app
```

## Troubleshooting Common Issues:

**Error: "Android SDK not found"**
```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
```

**Error: "Java not found"**
```bash
export JAVA_HOME="/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home"
```

**Error: "No connected devices"**
```bash
# Check devices
adb devices

# Start emulator
emulator -avd Pixel_4_API_34
```

## Your Replit Server URL:

You'll need to find your Replit app URL. It should look like:
`https://[your-repl-name].replit.app`

Update this in `src/services/api.ts` so the mobile app can connect to your backend.

---

**Next Step**: Run the Quick Fix commands above, or do the full Android Studio setup if you want a complete development environment.