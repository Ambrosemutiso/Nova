//lib/notifications.ts
import { messaging } from "@/lib/firebaseConfig";
import { getToken, onMessage, Messaging } from "firebase/messaging";
import { toast } from "react-toastify";

export const requestPermissionAndToken = async () => {
  const messagingInstance = await messaging(); // ✅ FIX

  if (!messagingInstance) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  try {
    const token = await getToken(messagingInstance, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    return token;
  } catch (error) {
    console.error("FCM token error:", error);
    return null;
  }
};

export const listenToMessages = async () => {
  const messagingInstance = await messaging(); // ✅ FIX

  if (!messagingInstance) return;

  onMessage(messagingInstance, (payload) => {
    console.log("Foreground notification:", payload);

    toast.success(
      payload.notification?.title || "New Notification"
    );
  });
};