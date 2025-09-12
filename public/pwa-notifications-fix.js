// 🚀 ENABLE PWA NOTIFICATIONS - Force Service Worker Registration
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
    .then(registration => {
      console.log("✅ [PWA] Service Worker registered successfully:", registration.scope);
      return registration;
    })
    .catch(error => {
      console.log("❌ [PWA] Service Worker registration failed:", error);
    });
}

// 🔔 IMMEDIATE NOTIFICATION HELPER - Works without SW
window.showPWANotification = async (title, message, options = {}) => {
  console.log("[PWA_NOTIFICATION] Showing:", title, message);
  
  // Request permission if needed
  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("❌ Notification permission denied");
      return false;
    }
  }
  
  if (Notification.permission === "granted") {
    // Try Service Worker first
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      const registration = await navigator.serviceWorker.ready;
      registration.active?.postMessage({
        type: "SHOW_NOTIFICATION",
        title: title,
        options: {
          body: message,
          icon: "/educafric-logo-128.png",
          badge: "/educafric-logo-128.png",
          tag: options.tag || "educafric-pwa",
          requireInteraction: true,
          vibrate: [200, 100, 200],
          ...options
        }
      });
    } else {
      // Fallback to direct Notification API
      new Notification(title, {
        body: message,
        icon: "/educafric-logo-128.png",
        badge: "/educafric-logo-128.png",
        tag: options.tag || "educafric-direct",
        requireInteraction: true,
        vibrate: [200, 100, 200],
        ...options
      });
    }
    return true;
  }
  return false;
};
