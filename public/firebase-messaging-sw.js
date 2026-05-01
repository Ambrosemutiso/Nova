importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

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

messaging.onBackgroundMessage(function (payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/Logo.png",
  });
});