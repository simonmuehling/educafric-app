# EDUCAFRIC Mobile App - API Setup Guide

## Quick Fix for Mac Login Issues

Your mobile app is configured to connect to `localhost:5000` but this might not work depending on how you're running the app. Here are the solutions:

### Step 1: Find Your Computer's IP Address

**On Mac (Terminal):**
```bash
ifconfig en0 | grep inet
```
Look for the line that shows: `inet 192.168.x.x` (your local IP)

**Alternative method:**
```bash
ipconfig getifaddr en0
```

### Step 2: Update API Configuration

Edit `src/services/api.ts` and choose the right option:

**Option A: If using iOS Simulator or Expo Go on Mac**
```typescript
const API_BASE_URL = 'http://localhost:5000';
```

**Option B: If using physical device or having connection issues**
```typescript
const API_BASE_URL = 'http://YOUR_COMPUTER_IP:5000';
```
Replace `YOUR_COMPUTER_IP` with the IP address from Step 1.

### Step 3: Test Login

Use these demo accounts to test:

1. **Main Demo Account:**
   - Email: `demo@educafric.com`
   - Password: `demo123`

2. **Parent Account:**
   - Email: `parent.demo@test.educafric.com`
   - Password: `demo123`

3. **Teacher Account:**
   - Email: `teacher.demo@test.educafric.com`
   - Password: `demo123`

### Step 4: Common Issues & Solutions

**Issue: "Network error" or "Connection refused"**
- Solution: Make sure Replit server is running on port 5000
- Check your computer's IP address is correct
- Try `http://localhost:5000` first

**Issue: "Invalid credentials"**
- Solution: Use exact demo credentials above
- Check if caps lock is on
- Try copy-pasting the credentials

**Issue: "Authentication required" after login**
- Solution: This is a session/cookie issue
- Clear app data and try again
- Make sure `withCredentials: true` is set in api.ts

### Step 5: Verify Server Connection

Test in your browser first:
1. Go to `http://localhost:5000` - should show EDUCAFRIC web app
2. Go to `http://YOUR_COMPUTER_IP:5000` - should also work

If the web app doesn't load, the mobile app won't work either.

## Need Help?

If you're still having issues:
1. Check what IP address you're using
2. Confirm the Replit development server is running
3. Try both demo accounts provided
4. Check for any error messages in the mobile app