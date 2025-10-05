# Firebase Domain Authorization Fix

## Issue
Google sign-in is failing due to unauthorized domain error. The current Replit domain needs to be authorized in Firebase Console.

## Current Configuration
- Firebase Project: smartwatch-tracker-e061f
- Site Key: 6LcI9IwrAAAAALTCMs6z4tj-lEHQntAFI5XuA2F-
- Auth Domain: educafric.com (production)

## Required Firebase Console Settings

### 1. Authorized Domains
Add these domains to Firebase Console → Authentication → Settings → Authorized domains:

**Development Domains:**
- localhost (usually already included)
- 127.0.0.1 (usually already included)
- YOUR_REPLIT_DOMAIN.replit.dev
- YOUR_REPLIT_DOMAIN-5000.preview.app.github.dev (if using port 5000)

**Production Domains:**
- educafric.com
- www.educafric.com (redirect)
- Any custom domains you plan to use

### 2. Google Provider Configuration
Ensure Google sign-in provider is enabled:
- Go to Firebase Console → Authentication → Sign-in method
- Enable Google provider
- Add authorized domains listed above
- Set support email if required

### 3. Current Error Messages
The application now provides detailed error messages including:
- Current domain and URL information
- Specific error codes
- Instructions for users to contact support

### 4. Authentication Flow
The updated authentication system:
- Uses redirect method for better Replit compatibility
- Includes comprehensive error handling
- Automatically syncs with backend after successful authentication
- Redirects to dashboard upon completion

## Testing
1. Update Firebase Console with current domain
2. Test Google sign-in
3. Verify redirect flow works properly
4. Check backend sync functionality

## Notes
- The authDomain is set to "educafric.com" for production consistency
- reCAPTCHA integration is maintained throughout the authentication flow
- Error messages are user-friendly while providing technical details in console