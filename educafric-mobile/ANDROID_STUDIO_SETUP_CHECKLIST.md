# Android Studio Setup Checklist

Follow these steps to set up the Educafric mobile app in Android Studio and prepare it for building.

## ✅ Pre-Build Checklist

### Step 1: Download Project from Replit

1. In Replit, right-click the `educafric-mobile` folder
2. Select "Download" 
3. Extract the ZIP file to your computer

### Step 2: Download Educafric Logo

1. In Replit, navigate to `public/educafric-logo-512.png`
2. Right-click the file → Download
3. Save it to your Desktop for easy access

### Step 3: Install Android Studio

1. Download from: https://developer.android.com/studio
2. Install with default settings
3. During setup, ensure these are installed:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device

## 🎨 Step-by-Step: Add App Icons

### Open Project in Android Studio

1. Launch Android Studio
2. Click "Open" (not "New Project")
3. Navigate to `educafric-mobile/android/` folder
4. Click "OK"
5. Wait for Gradle sync to complete (may take 5-10 minutes first time)

### Generate App Icons (CRITICAL - REQUIRED)

1. **In Android Studio**, locate the Project panel on the left
2. Switch to "Android" view (dropdown at top of panel)
3. Navigate to: `app > res`
4. **Right-click** on `res` folder
5. Select: **New → Image Asset**

6. In the Asset Studio window:
   - **Icon Type**: Launcher Icons (Adaptive and Legacy) ✓
   - **Name**: `ic_launcher` (default - don't change)
   - **Source Asset**:
     - **Asset Type**: Image
     - Click the folder icon 📁
     - Select your downloaded `educafric-logo-512.png`
   - **Trim**: Yes (recommended)
   - **Resize**: 100% (adjust if logo looks too small/large in preview)
   
7. Review the preview on the right side
   - You'll see how the icon looks on different devices
   - Check both round and square versions

8. Click **Next**

9. Click **Finish**
   - Android Studio will create all required icon sizes automatically
   - Folders created: mipmap-mdpi, mipmap-hdpi, mipmap-xhdpi, mipmap-xxhdpi, mipmap-xxxhdpi

### Verify Icons Were Created

1. In Project panel, expand: `app > res`
2. You should now see folders:
   - `mipmap-mdpi/` (contains ic_launcher.png)
   - `mipmap-hdpi/` (contains ic_launcher.png)
   - `mipmap-xhdpi/` (contains ic_launcher.png)
   - `mipmap-xxhdpi/` (contains ic_launcher.png)
   - `mipmap-xxxhdpi/` (contains ic_launcher.png)

✅ **Icons are now installed!**

## 🔧 Optional: Update App Name

1. Navigate to: `app > res > values > strings.xml`
2. Change the app name if desired:
   ```xml
   <string name="app_name">Educafric</string>
   ```

## 🏗️ Build the APK

### Option A: Debug Build (For Testing)

1. In Android Studio menu: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Wait for build to complete (1-5 minutes)
3. Click "locate" in the notification popup
4. Your APK is at: `app/build/outputs/apk/debug/app-debug.apk`

### Option B: Release Build (For Production/Play Store)

**First time only - Create Keystore:**

1. In Android Studio menu: **Build → Generate Signed Bundle / APK**
2. Select: **APK** → Click **Next**
3. Click **Create new...** (under Key store path)
4. Fill in the form:
   - **Key store path**: Choose location (e.g., Desktop/educafric-release.keystore)
   - **Password**: Create strong password (SAVE THIS!)
   - **Confirm**: Re-enter password
   - **Alias**: `educafric`
   - **Password**: Create strong password (SAVE THIS!)
   - **Validity**: 25 years (default)
   - **Certificate**: Fill in your info
5. Click **OK**

⚠️ **CRITICAL**: Store the keystore file and passwords securely! You need them for ALL future updates!

**Build Release APK:**

1. In Android Studio menu: **Build → Generate Signed Bundle / APK**
2. Select: **APK** → Click **Next**
3. Select your keystore file and enter passwords
4. Check: **release** build type
5. Click **Finish**
6. Your APK is at: `app/build/outputs/apk/release/app-release.apk`

## 📱 Test on Device

### Install on Physical Device

1. Enable Developer Options on your Android phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
2. Enable USB Debugging:
   - Settings → Developer Options → USB Debugging (ON)
3. Connect phone to computer via USB
4. In Android Studio:
   - Click the green "Run" ▶️ button
   - Select your device from the list
   - App will install and launch automatically

### Install APK Directly

1. Copy the APK file to your phone (via USB, email, or cloud storage)
2. On your phone, open the APK file
3. Allow "Install from Unknown Sources" if prompted
4. Tap "Install"

## 🐛 Troubleshooting

### "SDK not found"
- Go to: Tools → SDK Manager
- Install latest Android SDK Platform and Build Tools

### "Gradle sync failed"
- Click "Sync Project with Gradle Files" (elephant icon in toolbar)
- If still failing, try: File → Invalidate Caches → Invalidate and Restart

### "Execution failed for task ':app:processDebugManifest'"
- Make sure you completed the icon generation step above
- Icons MUST exist or the build will fail

### App installs but crashes immediately
- Check the API URL is correct in `src/services/api.ts`
- Ensure your backend is running and accessible
- Check Logcat in Android Studio for error messages

## 📋 Final Checklist Before Submitting to Play Store

- [ ] App icons generated and look good
- [ ] App name is correct in strings.xml
- [ ] API URL points to production: `https://educafric.com`
- [ ] Release APK/AAB built successfully
- [ ] Tested on at least one physical device
- [ ] App doesn't crash on startup
- [ ] Login works with production backend
- [ ] Keystore file backed up securely
- [ ] versionCode incremented in build.gradle (for updates)

## 📞 Need Help?

If you encounter issues:
1. Check Android Studio's "Build" tab for error messages
2. Check Logcat for runtime errors
3. Google the specific error message
4. Android Studio has built-in help: Help → Find Action → type your issue

---

**Next Steps**: Once the APK is built and tested, follow `ANDROID_PRODUCTION_SETUP.md` for Play Store submission instructions.
