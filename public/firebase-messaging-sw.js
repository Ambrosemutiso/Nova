// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

// ✅ These must be hardcoded — service workers cannot access process.env
firebase.initializeApp({
  apiKey: "AIzaSyD3kH_yW6xnLCHzsYDQVSl_BHE_w5vkrBE",
  authDomain: "novamart-8742a.firebaseapp.com",
  projectId: "novamart-8742a",
  storageBucket: "novamart-8742a.firebasestorage.app",
  messagingSenderId: "7530844007",
  appId: "1:7530844007:web:4bf3b39c0d167ac047a9c2",
  measurementId: "G-7R42QB0RSH"
});

const messaging = firebase.messaging();

// ── BACKGROUND MESSAGES ────────────────────────────────────────────────────
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message received:", payload);

  const title = payload.notification?.title || "New Notification";
  const body  = payload.notification?.body  || "";
  const icon  = payload.notification?.icon  || "/Logo.png";

  self.registration.showNotification(title, {
    body,
    icon,
    badge: "/Logo.png",        // small monochrome icon shown in status bar
    data: payload.data || {},   // pass-through custom data (orderId, url, etc.)
    tag: "fcm-notification",    // collapses duplicate notifications
  });
});

// ── NOTIFICATION CLICK ─────────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If a tab with the target URL is already open, focus it
        for (const client of clientList) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise open a new tab
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});