// FCM Notifications Service for EDUCAFRIC - Native Push Notifications
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "smartwatch-tracker-e061f.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Firebase app and messaging instances
let app: any = null;
let messaging: any = null;

// VAPID key for FCM (public key from Firebase Console)
const VAPID_KEY = "BF8B8F8B8F8B8F8B8F8B8F8B8F8B8F8B8F8B8F8B8F8B8F8B8F8B8F8B8F8B8F8B8F8B8F8B8F8B8F8B8F8B";

// Initialize Firebase and Messaging
function initializeFirebase() {
  try {
    if (!app) {
      app = initializeApp(firebaseConfig);
      console.log('[FCM] 🚀 Firebase app initialized successfully');
    }
    
    if (!messaging && 'serviceWorker' in navigator) {
      messaging = getMessaging(app);
      console.log('[FCM] 📱 Firebase messaging initialized successfully');
    }
    
    return { app, messaging };
  } catch (error) {
    console.error('[FCM] ❌ Firebase initialization failed:', error);
    return { app: null, messaging: null };
  }
}

// Main function to enable FCM notifications
export async function enableFCMNotifications(userId: number): Promise<{ success: boolean; token?: string; error?: string }> {
  console.log('[FCM] 🔔 Enabling FCM notifications for user:', userId);

  try {
    // Step 1: Check if browser supports notifications
    if (!('Notification' in window)) {
      throw new Error('Browser does not support notifications');
    }

    if (!('serviceWorker' in navigator)) {
      throw new Error('Browser does not support service workers');
    }

    // Step 2: Initialize Firebase
    const { messaging: msgInstance } = initializeFirebase();
    if (!msgInstance) {
      throw new Error('Failed to initialize Firebase messaging');
    }

    // Step 3: Request notification permission
    console.log('[FCM] 📋 Requesting notification permission...');
    let permission = Notification.permission;
    
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    console.log('[FCM] ✅ Notification permission granted');

    // Step 4: Register service worker if needed
    let registration = await navigator.serviceWorker.getRegistration('/sw.js');
    
    if (!registration) {
      console.log('[FCM] 📋 Registering service worker...');
      registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      console.log('[FCM] ✅ Service worker registered successfully');
    }

    // Step 5: Get FCM token
    console.log('[FCM] 🔑 Getting FCM token...');
    const token = await getToken(msgInstance, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (!token) {
      throw new Error('Failed to get FCM token');
    }

    console.log('[FCM] ✅ FCM token obtained:', token.substring(0, 20) + '...');

    // Step 6: Register token with backend
    console.log('[FCM] 📤 Registering token with backend...');
    const response = await fetch('/api/fcm/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        userId,
        token,
        deviceType: 'web',
        userAgent: navigator.userAgent
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Backend registration failed: ${response.status} ${errorData}`);
    }

    const result = await response.json();
    console.log('[FCM] ✅ Token registered with backend successfully:', result);

    // Step 7: Set up foreground message listener
    setupForegroundMessageListener(msgInstance);

    return {
      success: true,
      token: token
    };

  } catch (error: any) {
    console.error('[FCM] ❌ Failed to enable FCM notifications:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Set up listener for foreground messages
function setupForegroundMessageListener(messaging: any) {
  console.log('[FCM] 📱 Setting up foreground message listener...');
  
  onMessage(messaging, (payload) => {
    console.log('[FCM] 📬 Received foreground message:', payload);

    // Show notification manually for foreground messages
    if (Notification.permission === 'granted') {
      const title = payload.notification?.title || 'EDUCAFRIC';
      const options = {
        body: payload.notification?.body || 'Nouvelle notification',
        icon: '/educafric-logo-128.png',
        tag: payload.data?.tag || 'educafric-notification',
        data: {
          ...payload.data,
          actionUrl: payload.data?.actionUrl || '/',
          timestamp: Date.now(),
          fcm: true
        },
        requireInteraction: payload.data?.priority === 'high'
      };

      const notification = new Notification(title, options);
      
      // Handle click on foreground notification
      notification.onclick = () => {
        console.log('[FCM] 🔗 Foreground notification clicked');
        const actionUrl = payload.data?.actionUrl || '/';
        window.open(actionUrl, '_blank');
        notification.close();
      };

      // Auto-close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

      console.log('[FCM] ✅ Foreground notification shown successfully');
    }
  });
}

// Test FCM by sending a test notification
export async function testFCMNotification(userId: number, title: string = "🧪 Test FCM", message: string = "Cette notification est envoyée via FCM natif !") {
  console.log('[FCM] 🧪 Testing FCM notification for user:', userId);

  try {
    const response = await fetch('/api/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        userId,
        title,
        message,
        priority: 'high',
        actionUrl: '/dashboard',
        actionText: 'Ouvrir Dashboard'
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Test notification failed: ${response.status} ${errorData}`);
    }

    const result = await response.json();
    console.log('[FCM] ✅ Test notification sent successfully:', result);
    return result;

  } catch (error: any) {
    console.error('[FCM] ❌ Failed to send test notification:', error);
    throw error;
  }
}

// Get current FCM status for user
export async function getFCMStatus(userId: number): Promise<{ enabled: boolean; hasToken: boolean }> {
  try {
    const response = await fetch(`/api/fcm/status/${userId}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      return { enabled: false, hasToken: false };
    }

    return await response.json();
  } catch (error) {
    console.error('[FCM] ❌ Failed to get FCM status:', error);
    return { enabled: false, hasToken: false };
  }
}

// Disable FCM notifications for user
export async function disableFCMNotifications(userId: number): Promise<boolean> {
  try {
    console.log('[FCM] ⏹️ Disabling FCM notifications for user:', userId);

    const response = await fetch('/api/fcm/unregister', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      throw new Error(`Failed to unregister: ${response.status}`);
    }

    console.log('[FCM] ✅ FCM notifications disabled successfully');
    return true;
  } catch (error: any) {
    console.error('[FCM] ❌ Failed to disable FCM notifications:', error);
    return false;
  }
}

export default {
  enableFCMNotifications,
  testFCMNotification,
  getFCMStatus,
  disableFCMNotifications
};