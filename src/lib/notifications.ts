//lib/notifications.ts
import { messaging } from "@/lib/firebaseConfig";
import { getToken, onMessage } from "firebase/messaging";
import { toast } from "react-toastify";

export const requestPermissionAndToken = async (): Promise<string | null> => {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.warn("Notifications not supported in this browser");
      return null;
    }

    if (!("serviceWorker" in navigator)) {
      console.warn("Service workers not supported");
      return null;
    }

    const messagingInstance = await messaging();
    if (!messagingInstance) {
      console.warn("Firebase messaging not supported");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return null;
    }

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      { scope: "/" }
    );

    await navigator.serviceWorker.ready;

    const token = await getToken(messagingInstance, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      console.error("FCM token was empty — check your VAPID key and service worker");
      return null;
    }

    console.log("✅ FCM Token obtained:", token);
    return token;
  } catch (error) {
    console.error("FCM token error:", error);
    return null;
  }
};

export const listenToMessages = async (): Promise<void> => {
  try {
    const messagingInstance = await messaging();
    if (!messagingInstance) return;

    onMessage(messagingInstance, (payload) => {
      console.log("📬 Foreground notification received:", payload);

      const title = payload.notification?.title || "New Notification";
      const body  = payload.notification?.body  || "";

      // ✅ Plain string — no JSX, no type errors
      // \n combined with whiteSpace: "pre-line" renders title and body on separate lines
      const message = body ? `${title}\n${body}` : title;

      toast.success(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        style: { whiteSpace: "pre-line" },
      });
    });
  } catch (error) {
    console.error("Error setting up foreground message listener:", error);
  }
};