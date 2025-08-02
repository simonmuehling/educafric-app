# EDUCAFRIC Mobile App Setup Guide

## Understanding the IP Address Configuration

When you run the React Native mobile app, it needs to connect to your EDUCAFRIC backend server. The IP address depends on **where** you're testing the app:

### Scenario 1: Testing in Android Emulator (Virtual Device)
If you're using Android Studio's emulator on your computer:
```typescript
const API_BASE_URL = 'http://10.0.2.2:5000';
```
- `10.0.2.2` is a special IP that emulators use to reach your computer
- This is already configured in the code

### Scenario 2: Testing on Real Android Phone
If you're installing the APK on a physical Android device:
```typescript
const API_BASE_URL = 'http://YOUR_COMPUTER_IP:5000';
```

## How to Find Your Computer's IP Address

### Windows:
1. Press `Windows + R`
2. Type `cmd` and press Enter
3. Type `ipconfig` and press Enter
4. Look for "IPv4 Address" under your network adapter
5. Example: `192.168.1.45`

### Mac:
1. Open Terminal (Applications → Utilities → Terminal)
2. Type `ifconfig` and press Enter
3. Look for "inet" under "en0" section
4. Example: `192.168.1.45`

### Linux:
1. Open Terminal
2. Type `hostname -I` and press Enter
3. The first IP shown is your computer's IP
4. Example: `192.168.1.45`

## Step-by-Step Setup

### 1. Configure API URL
Edit `educafric-mobile/src/services/api.ts`:

```typescript
// If testing on real phone, replace with your computer's IP:
const API_BASE_URL = 'http://192.168.1.45:5000';  // Example IP
```

### 2. Make Sure Backend is Running
Your EDUCAFRIC backend must be running on port 5000:
```bash
npm run dev  # In your main project directory
```

### 3. Install Mobile App Dependencies
```bash
cd educafric-mobile
npm install --legacy-peer-deps
```

### 4. Test the Connection

#### Option A: Android Emulator
```bash
npm run android
```

#### Option B: Real Android Device
1. Enable Developer Options on your phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings → Developer Options
   - Enable "USB Debugging"

2. Connect phone to computer via USB

3. Run the app:
```bash
npm run android
```

### 5. Build APK for Distribution
```bash
cd android
./gradlew assembleDebug
```
APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

## Testing Checklist

1. ✅ Backend server running on port 5000
2. ✅ Correct IP address configured in api.ts
3. ✅ Phone and computer on same WiFi network (for real device testing)
4. ✅ Mobile app installed and running
5. ✅ Login screen appears
6. ✅ Can log in with demo credentials

## Troubleshooting

### "Network Error" or "Connection Failed"
- Check if backend server is running
- Verify IP address is correct
- Ensure phone and computer are on same WiFi network
- Try accessing `http://YOUR_IP:5000` in phone's browser

### "Build Failed"
- Run `npm install --legacy-peer-deps` again
- Clear cache: `npm start -- --reset-cache`
- Check Java version: should be Java 21

### "App Won't Install"
- Enable "Install from Unknown Sources" in phone settings
- Check if APK file was generated successfully

## Demo Credentials
Use these credentials to test login:
- Email: `demo@educafric.com`
- Password: `demo123`

---

**Need Help?** The mobile app is completely separate from your web app, so you can test and experiment without any risk to your existing system.