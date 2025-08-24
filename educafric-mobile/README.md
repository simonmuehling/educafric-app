# EDUCAFRIC Mobile App

A React Native mobile application for the EDUCAFRIC platform, providing native mobile access to the African Educational Technology Platform.

## Overview

This is a **separate React Native project** that connects to the existing EDUCAFRIC backend APIs. It provides:

- Native mobile performance
- Custom mobile UI/UX design
- Full access to existing EDUCAFRIC functionality
- Independent development from the web application

## Architecture

```
educafric-mobile/              (React Native App)
├── src/
│   ├── services/             (API service layer)
│   ├── screens/             (Mobile screens)
│   ├── contexts/            (Auth & state management)
│   └── navigation/          (App navigation)
├── android/                 (Android native code)
└── ios/                     (iOS native code - future)

educafric-platform/          (Original Web App - Untouched)
├── client/                  (Web frontend)
├── server/                  (Express.js backend - Shared)
└── ...
```

## API Integration

The mobile app connects to your existing Express.js backend:

- **Authentication**: Uses existing `/api/auth/*` endpoints
- **User Data**: Connects to `/api/users/*` endpoints  
- **School Data**: Uses existing database and APIs
- **Session Management**: Cookie-based sessions with the same backend

## Features

### Login Screen
- Professional mobile login interface
- Demo account quick access
- Error handling and validation
- Connects to existing authentication API

### Dashboard Screen  
- Role-based dashboards (Student, Teacher, Parent, etc.)
- Quick stats and overview
- Action buttons for key features
- User account information
- Pull-to-refresh functionality

### API Service Layer
- Centralized API communication
- Automatic session management
- Error handling and retry logic
- Local storage for user data

## Development Setup

1. **Install Dependencies**:
   ```bash
   cd educafric-mobile
   npm install
   ```

2. **Configure API URL**:
   Update `src/services/api.ts` with your backend URL:
   ```typescript
   const API_BASE_URL = 'http://YOUR_IP:5000'; // Replace with your server IP
   ```

3. **Run Android**:
   ```bash
   npm run android
   ```

## API Configuration

The mobile app is configured to connect to your existing backend:

- **Default URL**: `http://10.0.2.2:5000` (Android emulator)
- **Physical Device**: Update to your computer's IP address
- **Authentication**: Uses existing session-based auth
- **Endpoints**: All existing API routes work unchanged

## Benefits

✅ **Zero Risk**: Original web app remains completely untouched  
✅ **Shared Backend**: Uses existing APIs, database, and authentication  
✅ **Custom Design**: Complete freedom for mobile UI/UX  
✅ **Native Performance**: True mobile app, not web wrapper  
✅ **Independent Development**: Mobile and web development can proceed separately  

## Current Status

- ✅ Project structure created
- ✅ API service layer configured
- ✅ Authentication system integrated
- ✅ Login screen implemented
- ✅ Dashboard screen created
- ✅ Navigation system configured
- ✅ Android build configuration ready

## Next Steps

1. Test the login functionality with your existing backend
2. Build and install the APK on Android devices
3. Add additional screens (grades, attendance, messages, etc.)
4. Implement push notifications
5. Add iOS support

## Building APK

```bash
cd android
./gradlew assembleDebug
```

The APK will be generated at: `android/app/build/outputs/apk/debug/app-debug.apk`

---

**Note**: This mobile app is completely separate from your web application. Your web app continues to work exactly as before, while this provides a native mobile experience using the same backend infrastructure.