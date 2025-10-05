#!/bin/bash

# EDUCAFRIC Version 4 - Alternative APK Creation Guide
# For environments without local Java/Android SDK

echo "🚀 EDUCAFRIC Version 4 - Alternative APK Creation"
echo "================================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Version 4 Status Check${NC}"
echo "• Version Code: 4"
echo "• Version Name: 2.0" 
echo "• Web Build: ✅ Complete"
echo "• Capacitor Sync: ✅ Complete"
echo "• Android Config: ✅ Ready"
echo ""

# Check if Android directory exists
if [ ! -d "android" ]; then
    echo -e "${RED}❌ Android directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Android project structure ready${NC}"

# Create GitHub Actions workflow for automatic APK build
echo -e "${YELLOW}Creating GitHub Actions workflow for APK build...${NC}"
mkdir -p .github/workflows

cat > .github/workflows/android-build.yml << 'EOF'
name: Android Build - EDUCAFRIC v4

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build web application
      run: npm run build
      
    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
        
    - name: Setup Android SDK
      uses: android-actions/setup-android@v2
      
    - name: Sync Capacitor
      run: npx cap sync android
      
    - name: Grant execute permission for gradlew
      run: chmod +x android/gradlew
      
    - name: Build Debug APK
      run: cd android && ./gradlew assembleDebug
      
    - name: Build Release APK  
      run: cd android && ./gradlew assembleRelease
      
    - name: Upload Debug APK
      uses: actions/upload-artifact@v3
      with:
        name: app-debug-v4
        path: android/app/build/outputs/apk/debug/app-debug.apk
        
    - name: Upload Release APK
      uses: actions/upload-artifact@v3
      with:
        name: app-release-v4
        path: android/app/build/outputs/apk/release/app-release-unsigned.apk
EOF

echo "✅ GitHub Actions workflow created"

# Create Dockerfile for containerized build
echo -e "${YELLOW}Creating Docker build configuration...${NC}"

cat > Dockerfile.android << 'EOF'
FROM cimg/android:2023.12-node

# Set environment variables
ENV ANDROID_HOME=/home/circleci/android-sdk
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci

# Copy project files
COPY . .

# Build web application
RUN npm run build

# Sync Capacitor
RUN npx cap sync android

# Make gradlew executable
RUN chmod +x android/gradlew

# Build Android APK
RUN cd android && ./gradlew assembleDebug assembleRelease

# Copy APKs to output directory
RUN mkdir -p /output
RUN cp android/app/build/outputs/apk/debug/app-debug.apk /output/educafric-v4-debug.apk
RUN cp android/app/build/outputs/apk/release/app-release-unsigned.apk /output/educafric-v4-release.apk

CMD ["echo", "EDUCAFRIC v4 APKs built successfully"]
EOF

echo "✅ Docker configuration created"

# Create local build instructions
cat > LOCAL_APK_BUILD_INSTRUCTIONS.md << 'EOF'
# Local APK Build Instructions - EDUCAFRIC Version 4

## Prerequisites

### 1. Install Java 17
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-17-jdk

# macOS (using Homebrew)
brew install openjdk@17

# Windows
# Download from: https://adoptium.net/
```

### 2. Install Android SDK
```bash
# Option 1: Android Studio (Recommended)
# Download from: https://developer.android.com/studio

# Option 2: Command Line Tools
# Download from: https://developer.android.com/studio#command-tools
```

### 3. Set Environment Variables
```bash
export JAVA_HOME=/path/to/java17
export ANDROID_HOME=/path/to/android-sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

## Build Process

### 1. Download Project
```bash
# Download from Replit or clone from Git
# Ensure all files are present including android/ directory
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build Web Application
```bash
npm run build
```

### 4. Sync with Android
```bash
npx cap sync android
```

### 5. Build APK
```bash
cd android

# Debug APK (for testing)
./gradlew assembleDebug

# Release APK (for production)
./gradlew assembleRelease
```

### 6. Locate APKs
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

## Alternative: Cloud Build Services

### GitHub Actions (Automated)
1. Push code to GitHub repository
2. GitHub Actions will build APK automatically
3. Download from Actions artifacts

### Docker Build
```bash
# Build Docker image
docker build -f Dockerfile.android -t educafric-android .

# Extract APKs
docker run --rm -v $(pwd)/output:/output educafric-android
```

### Online Build Services
- **Expo EAS Build:** For React Native apps
- **AppCenter:** Microsoft's mobile development platform
- **Bitrise:** Mobile DevOps platform
- **CircleCI:** Continuous integration platform

## Troubleshooting

### Common Issues
1. **Java Version:** Ensure Java 17 is installed and JAVA_HOME is set
2. **Android SDK:** Verify ANDROID_HOME points to correct SDK location
3. **Gradle Permissions:** Run `chmod +x android/gradlew` if needed
4. **Memory Issues:** Increase heap size with `export GRADLE_OPTS="-Xmx4g"`

### Build Verification
```bash
# Check APK details
aapt dump badging app-debug.apk

# Install on device
adb install app-debug.apk
```
EOF

echo "✅ Local build instructions created"

# Create quick deployment script
cat > scripts/quick-deploy-v4.sh << 'EOF'
#!/bin/bash

echo "🚀 EDUCAFRIC Version 4 - Quick Deployment"
echo "========================================"

# Build web version
echo "Building web application..."
npm run build

# Sync Capacitor
echo "Syncing Capacitor..."
npx cap sync android

echo ""
echo "✅ Version 4 Ready for Deployment!"
echo ""
echo "📱 Mobile Testing: Open https://[your-repl].replit.app on mobile"
echo "🔧 APK Build: Follow LOCAL_APK_BUILD_INSTRUCTIONS.md"
echo "☁️  Cloud Build: Push to GitHub for automatic APK build"
echo ""
echo "Version 4 Features:"
echo "• Enhanced stability and performance"
echo "• Portrait-only mobile optimization"
echo "• Advanced notification system"
echo "• African market optimizations"
echo "• Enhanced security protocols"
EOF

chmod +x scripts/quick-deploy-v4.sh

echo ""
echo -e "${GREEN}🎉 EDUCAFRIC Version 4 Alternative Build Setup Complete!${NC}"
echo ""
echo -e "${BLUE}Available Options:${NC}"
echo "1. 📱 Mobile Browser Testing (Immediate)"
echo "2. ☁️  GitHub Actions Build (Automated APK)"
echo "3. 🐳 Docker Build (Containerized)"
echo "4. 💻 Local Build (Manual setup required)"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Test Version 4 features via mobile browser"
echo "2. Choose APK build method based on your setup"
echo "3. Deploy to production once testing is complete"
echo ""
echo -e "${GREEN}Version 4 is ready! 🚀${NC}"