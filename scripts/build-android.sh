#!/bin/bash

# Script de build Android pour EDUCAFRIC
# Usage: ./scripts/build-android.sh [dev|prod]

set -e

BUILD_TYPE=${1:-dev}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "🚀 Starting EDUCAFRIC Android build - Type: $BUILD_TYPE"

# 1. Build web application
echo "📦 Building web application..."
npm run build

# 2. Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync android

# 3. Build Android based on type
if [ "$BUILD_TYPE" = "prod" ]; then
    echo "🏭 Building production AAB for Google Play..."
    cd android
    ./gradlew bundleRelease
    cd ..
    
    echo "✅ Production build complete!"
    echo "📁 Output: android/app/build/outputs/bundle/release/app-release.aab"
    
elif [ "$BUILD_TYPE" = "dev" ]; then
    echo "🛠️  Building development APK..."
    cd android
    ./gradlew assembleDebug
    cd ..
    
    echo "✅ Development build complete!"
    echo "📁 Output: android/app/build/outputs/apk/debug/app-debug.apk"
    
else
    echo "❌ Invalid build type. Use 'dev' or 'prod'"
    exit 1
fi

# 4. Show build info
echo ""
echo "📊 Build Information:"
echo "   App ID: com.muehlingsolutions.educafric"
echo "   App Name: EDUCAFRIC"
echo "   Build Type: $BUILD_TYPE"
echo "   Timestamp: $TIMESTAMP"
echo ""

if [ "$BUILD_TYPE" = "prod" ]; then
    echo "🎯 Next steps for Google Play submission:"
    echo "   1. Test the AAB file thoroughly"
    echo "   2. Upload to Google Play Console"
    echo "   3. Fill in store listing information"
    echo "   4. Submit for review"
fi

echo "🎉 EDUCAFRIC Android build completed successfully!"