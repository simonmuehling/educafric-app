import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, signInWithRedirect, signInWithPopup, GoogleAuthProvider, getRedirectResult, type Auth } from "firebase/auth";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "smartwatch-tracker-e061f.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

try {
  console.log('Initializing Firebase with environment variables...');
  console.log('Firebase config:', {
    apiKey: firebaseConfig.apiKey ? '***provided***' : 'MISSING',
    projectId: firebaseConfig.projectId || 'MISSING',
    appId: firebaseConfig.appId ? '***provided***' : 'MISSING'
  });
  
  // Check if Firebase app already exists to prevent duplicate initialization
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully');
  } else {
    app = getApps()[0];
    console.log('Using existing Firebase app');
  }
  auth = getAuth(app);
  console.log('Firebase auth initialized successfully');
} catch (error) {
  console.error('Firebase initialization failed:', error);
}

export { auth };

const provider = auth ? new GoogleAuthProvider() : null;

export async function loginWithGoogle() {
  if (!auth || !provider) {
    console.error('Firebase auth or provider not initialized');
    alert('Authentication service not available. Please refresh the page.');
    return;
  }

  try {
    console.log('Starting Google authentication...');
    
    // Configure provider for additional security
    provider.addScope('email');
    provider.addScope('profile');
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    // Use redirect method for better compatibility with Replit environment
    console.log('Using redirect authentication for better compatibility...');
    await signInWithRedirect(auth, provider);
    
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    
    if (error.code === 'auth/unauthorized-domain') {
      const currentDomain = window?.location?.hostname;
      const currentUrl = window?.location?.origin;
      const message = `Firebase Error: Domain not authorized.\n\nCurrent domain: ${currentDomain}\nCurrent URL: ${currentUrl}\n\nPlease contact support to authorize this domain.`;
      alert(message);
      console.error('[Firebase] Unauthorized domain:', { currentDomain, currentUrl });
    } else if (error.code === 'auth/operation-not-allowed') {
      alert('Google sign-in is not enabled. Please contact support.');
      console.error('[Firebase] Google sign-in not enabled in Firebase Console');
    } else {
      alert('Google sign-in failed. Please try again or contact support.');
    }
  }
}

export async function handleRedirect() {
  if (!auth) {
    console.error('Firebase auth not initialized for redirect handling');
    return;
  }

  try {
    console.log('Checking for redirect result...');
    const result = await getRedirectResult(auth);
    
    if (result) {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const user = result.user;
      
      console.log('Firebase redirect auth successful', { 
        uid: user?.uid, 
        email: user?.email,
        displayName: user?.displayName 
      });

      // Sync with backend
      if (user) {
        try {
          const response = await fetch('/api/auth/firebase-sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              firebaseUid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL
            }),
          });

          if (response.ok) {
            console.log('Firebase user synced with backend successfully');
            // Redirect to dashboard
            if (window?.location) {
              window.location.href = '/dashboard';
            }
          } else {
            console.error('Backend sync failed:', await response.text());
            alert('Account sync failed. Please try logging in again.');
          }
        } catch (syncError) {
          console.error('Backend sync error:', syncError);
          alert('Account sync failed. Please check your connection and try again.');
        }
      }
    } else {
      console.log('No redirect result found');
    }
  } catch (error: any) {
    console.error('Redirect result error:', error);
    
    if (error.code === 'auth/unauthorized-domain') {
      alert('Domain authorization error. Please contact support.');
    } else {
      alert('Authentication failed. Please try again.');
    }
  }
}