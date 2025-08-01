# Firebase Configuration Instructions for EDUCAFRIC

## Current Issue: `auth/unauthorized-domain`

The Google Authentication is failing because the current Replit domain is not authorized in your Firebase project.

## Step-by-Step Solution

### 1. Get Your Current Domain
Your current Replit domain is: **Check browser URL** (e.g., `abc123.replit.dev`)

### 2. Configure Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `smartwatch-tracker-e061f`  
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain** and add these domains:

#### Required Domains to Add:
- `localhost` (for development)
- Your current Replit domain (e.g., `abc123.replit.dev`)
- `educafric.com` (for production)
- Any custom domains you plan to use

### 3. Port-Specific Domains (if needed)
If you're still having issues, also add:
- `abc123.replit.dev:5000` (with port number)
- `localhost:5000`

### 4. Test Authentication
After adding the domains:
1. Refresh your EDUCAFRIC application
2. Click the "Continuer avec Google" button
3. The popup/redirect should now work properly

## Alternative: Use Popup Instead of Redirect
The current configuration tries popup first, then falls back to redirect. This usually works better with Replit.

## Verification Steps
1. Domain added to Firebase Console ✓
2. Firebase app configuration updated ✓  
3. Authentication endpoint working ✓
4. Google OAuth popup opens ✓
5. User redirected back successfully ✓
6. User account created in EDUCAFRIC database ✓

## Common Issues
- **Popup blocked**: Browser popup blocker enabled → Allow popups for your domain
- **Still unauthorized**: Wait 2-3 minutes after adding domain to Firebase
- **Different domain**: Check if Replit changed your domain URL

## Success Test
When working correctly, you should see:
1. Google login popup opens
2. User selects Google account  
3. Popup closes automatically
4. User is logged into EDUCAFRIC with their Google account
5. New user account created in database with Firebase UID

**Current Status**: Firebase configuration updated, waiting for domain authorization in Firebase Console.