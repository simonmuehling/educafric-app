# EDUCAFRIC Mobile App v2.0

**Fresh, modern React Native 0.74.5 mobile application** for the EDUCAFRIC platform.

## ✨ What's New in V2.0

- ✅ Modern React Native 0.74.5 with proper configuration
- ✅ JDK 17 + AGP 8.x for stable Android builds
- ✅ Role-based dashboards (Director, Teacher, Student, Parent, Freelancer, Commercial)
- ✅ Bilingual support (French/English)
- ✅ African-themed UI with modern design
- ✅ WhatsApp integration (NO SMS)
- ✅ Zustand for state management
- ✅ TanStack Query for API calls
- ✅ i18next for translations

## 📱 Features

### Authentication
- Email/password login
- Role detection
- Secure session management

### Dashboards (Role-based)
- Director dashboard
- Teacher dashboard
- Student dashboard
- Parent dashboard
- Freelancer dashboard
- Commercial dashboard

### Core Features (In Development)
- Attendance tracking
- Grades & Bulletins (African-style report cards)
- Homework management
- Timetable viewing
- Library access
- Document management
- WhatsApp notifications

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd educafric-mobile
npm install
```

### 2. Configure API URL
Edit `src/services/api.ts` and update the API_BASE_URL:

```typescript
// For Android Emulator
const API_BASE_URL = 'http://10.0.2.2:5000';

// For Physical Device (replace with your IP)
const API_BASE_URL = 'http://192.168.1.XXX:5000';

// For Replit Development
const API_BASE_URL = 'https://your-repl-url.replit.dev';

// For Production
const API_BASE_URL = 'https://educafric.com';
```

### 3. Run on Android

**Start Metro Bundler:**
```bash
npm start
```

**Run on Android (in another terminal):**
```bash
npm run android
```

### 4. Build APK

```bash
cd android
./gradlew assembleDebug
```

APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

## 📋 Requirements

- **Node.js**: >= 18
- **Java JDK**: 17
- **Android Studio**: Latest version
- **Android SDK**: API Level 34

## 🎨 Project Structure

```
educafric-mobile/
├── android/              # Android native code
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/com/educafric/
│   │   │   ├── res/
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle
│   ├── build.gradle
│   └── gradle.properties
├── src/
│   ├── screens/          # App screens
│   │   ├── LoginScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   └── LoadingScreen.tsx
│   ├── navigation/       # Navigation setup
│   ├── services/         # API services
│   ├── store/            # State management
│   ├── theme/            # Colors & styling
│   ├── locales/          # Translations (FR/EN)
│   └── components/       # Reusable components
├── App.tsx               # Root component
├── index.js              # Entry point
└── package.json
```

## 🔐 Security

- Uses existing backend authentication
- Session-based auth with cookies
- Secure storage for user data
- No hardcoded credentials

## 🌍 Bilingual Support

The app fully supports:
- 🇫🇷 French (default)
- 🇬🇧 English

Language can be switched dynamically in the app.

## 📞 Support

For issues or questions, contact the EDUCAFRIC development team.

---

**EDUCAFRIC** - African Educational Technology Platform
