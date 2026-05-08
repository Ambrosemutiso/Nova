// lib/sendNotification.ts
import admin from "@/lib/firebaseAdmin";
import mongoose from "mongoose";
import User from "@/app/models/user";
import FcmToken from "@/app/models/FcmToken";

type TargetType = "all" | "role" | "users";

type SendOptions = {
  title: string;
  body: string;
  data?: Record<string, string>;
  target: {
    type: TargetType;
    value?: string | string[];
  };
};

export async function sendNotification(options: SendOptions) {
  const { title, body, data = {}, target } = options;

  let userQuery: Record<string, any> = {};

  // ── TARGETING ──────────────────────────────────────────────────────────────

  if (target.type === "users") {
    if (!Array.isArray(target.value) || target.value.length === 0) {
      return { success: false, sent: 0, failed: 0, message: "Invalid or empty user IDs" };
    }
    const validIds = target.value.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (!validIds.length) {
      return { success: false, sent: 0, failed: 0, message: "No valid ObjectIds provided" };
    }
    userQuery._id = {
      $in: validIds.map((id) => new mongoose.Types.ObjectId(id)),
    };
  }

  if (target.type === "role") {
    if (!target.value || typeof target.value !== "string") {
      return { success: false, sent: 0, failed: 0, message: "Role not provided" };
    }
    userQuery.role = target.value;
  }

  // ── USERS ──────────────────────────────────────────────────────────────────

  const users = await User.find(userQuery).select("_id");
  const userObjectIds = users.map((u) => u._id);

  console.log(`👥 Users found: ${userObjectIds.length}`);

  if (!userObjectIds.length) {
    return { success: false, sent: 0, failed: 0, message: "No users found" };
  }

  // ── TOKENS ─────────────────────────────────────────────────────────────────

  const fcmDocs = await FcmToken.find({
    userId: { $in: userObjectIds },
  }).lean();

  const tokenList: string[] = fcmDocs
    .map((t: any) => t.token)
    .filter((t) => t && t.length > 20);

  console.log(`🔑 Tokens found: ${tokenList.length}`);

  if (!tokenList.length) {
    return { success: false, sent: 0, failed: 0, message: "No FCM tokens found for these users" };
  }

  // ── SEND ───────────────────────────────────────────────────────────────────

  const response = await admin.messaging().sendEachForMulticast({
    tokens: tokenList,

    notification: { title, body },

    // ✅ Duplicate into data so SW can access even if notification is stripped
    data: {
      ...data,
      title,
      body,
      url: data?.url || "/",
    },

    // ✅ Android — high priority wakes device from doze mode immediately
    android: {
      priority: "high",
      ttl: 60 * 1000, // 60 seconds — if not delivered in 60s, drop it (for flash sales etc)
      notification: {
        title,
        body,
        color: "#EA580C",
        sound: "default",
        channelId: "default",
        priority: "max",        // ✅ heads-up notification (pops on screen)
        defaultSound: true,
        defaultVibrateTimings: true,
        notificationCount: 1,
      },
    },

    // ✅ Web/PWA — Urgency high bypasses browser push throttling
    webpush: {
      headers: {
        Urgency: "high",        // ✅ critical — delivers immediately
        TTL: "60",              // 60 seconds TTL
      },
      notification: {
        title,
        body,
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        tag: "Novaxmax",
        renotify: true,
        requireInteraction: false,
        vibrate: [200, 100, 200],
      },
      fcmOptions: {
        link: data?.url || "/",
      },
    },
  });

  // ── DETAILED ERROR LOGGING ─────────────────────────────────────────────────

  const staleTokens: string[] = [];

  response.responses.forEach((res, i) => {
    if (!res.success) {
      const errCode = res.error?.code ?? "unknown";
      const errMsg  = res.error?.message ?? "no message";
      console.error(`❌ FCM failure for token[${i}]`);
      console.error(`   Code   : ${errCode}`);
      console.error(`   Message: ${errMsg}`);

      if (
        errCode === "messaging/registration-token-not-registered" ||
        errCode === "messaging/invalid-registration-token"
      ) {
        staleTokens.push(tokenList[i]);
      }
    } else {
      console.log(`✅ FCM success for token[${i}]`);
    }
  });

  // ── CLEANUP STALE TOKENS ───────────────────────────────────────────────────

  if (staleTokens.length > 0) {
    console.log(`🗑️  Removing ${staleTokens.length} stale token(s) from DB`);
    await FcmToken.deleteMany({ token: { $in: staleTokens } });
  }

  return {
    success: true,
    sent: response.successCount,
    failed: response.failureCount,
  };
}