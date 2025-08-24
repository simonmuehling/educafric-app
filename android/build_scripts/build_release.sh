#!/bin/bash

# EDUCAFRIC Android Build Script - Version 4.2.1
# Automated build script for Android APK/AAB generation

set -e  # Exit on error

echo "🚀 EDUCAFRIC Android Build Script v4.2.1"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "capacitor.config.ts" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Step 1: Clean previous builds
print_status "Cleaning previous builds..."
rm -rf dist/
rm -rf android/app/build/
npx cap clean android

# Step 2: Build the web app
print_status "Building web application..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Web build failed!"
    exit 1
fi

print_success "Web build completed successfully"

# Step 3: Sync Capacitor
print_status "Syncing Capacitor..."
npx cap sync android

if [ $? -ne 0 ]; then
    print_error "Capacitor sync failed!"
    exit 1
fi

print_success "Capacitor sync completed"

# Step 4: Copy resources
print_status "Copying Android resources..."
npx cap copy android

# Step 5: Update Android project
print_status "Updating Android project..."
cd android

# Check if Gradle wrapper exists
if [ ! -f "gradlew" ]; then
    print_error "Gradle wrapper not found!"
    exit 1
fi

# Make gradlew executable
chmod +x gradlew

# Step 6: Clean and build
print_status "Cleaning Android project..."
./gradlew clean

print_status "Building Android APK..."
./gradlew assembleRelease

if [ $? -ne 0 ]; then
    print_error "Android build failed!"
    exit 1
fi

print_success "Android APK build completed!"

# Step 7: Build AAB (Android App Bundle) for Play Store
print_status "Building Android App Bundle (AAB)..."
./gradlew bundleRelease

if [ $? -ne 0 ]; then
    print_warning "AAB build failed, but APK is available"
else
    print_success "Android App Bundle (AAB) build completed!"
fi

# Step 8: Show build results
cd ..
print_status "Build completed! Files location:"
echo "📱 APK: android/app/build/outputs/apk/release/app-release.apk"
echo "📦 AAB: android/app/build/outputs/bundle/release/app-release.aab"

# Step 9: Copy files to easy access location
mkdir -p builds/
cp android/app/build/outputs/apk/release/app-release.apk builds/EDUCAFRIC-v4.2.1.apk 2>/dev/null || print_warning "APK copy failed"
cp android/app/build/outputs/bundle/release/app-release.aab builds/EDUCAFRIC-v4.2.1.aab 2>/dev/null || print_warning "AAB copy failed"

print_success "Build script completed successfully!"
print_status "Ready for deployment to Google Play Store or direct installation"

# Step 10: Generate build info
cat > builds/build-info-$(date +%Y%m%d-%H%M%S).txt << EOF
EDUCAFRIC Android Build Information
===================================
Build Date: $(date)
Version: 4.2.1
Version Code: 421
Target SDK: 35
Min SDK: 24

Files Generated:
- EDUCAFRIC-v4.2.1.apk (Direct installation)
- EDUCAFRIC-v4.2.1.aab (Google Play Store)

Build Environment:
- Node.js: $(node --version)
- npm: $(npm --version)
- Capacitor: $(npx cap --version)

Build Status: SUCCESS ✅
EOF

echo
print_success "Build information saved in builds/ directory"
echo "🎉 EDUCAFRIC Android build process completed successfully!"