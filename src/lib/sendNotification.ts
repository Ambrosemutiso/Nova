// lib/sendNotification.ts

import admin from "@/lib/firebaseAdmin";
import { dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

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
  await dbConnect();
  const db = (global as any)._mongoClient.db();

  const { title, body, data = {}, target } = options;

  let userQuery: any = {
    notificationsEnabled: { $ne: false },
  };

  // 🎯 TARGET LOGIC
  if (target.type === "users" && Array.isArray(target.value)) {
    userQuery._id = {
      $in: target.value.map((id) => new ObjectId(id)),
    };
  }

  if (target.type === "role" && typeof target.value === "string") {
    userQuery.role = target.value;
  }

  // "all" → no extra filter

  // 👥 GET USERS
  const users = await db.collection("users").find(userQuery).toArray();
  const userIds = users.map((u: any) => u._id);

  if (!userIds.length) {
    return { success: false, message: "No users found" };
  }

  // 🔑 GET TOKENS
  const tokens = await db
    .collection("fcm_tokens")
    .find({ userId: { $in: userIds } })
    .toArray();

  const tokenList = tokens.map((t: any) => t.token);

  if (!tokenList.length) {
    return { success: false, message: "No tokens found" };
  }

  // 🚀 SEND
  const response = await admin.messaging().sendEachForMulticast({
    tokens: tokenList,
    notification: { title, body },
    data,
  });

  // 🧹 CLEAN INVALID TOKENS
  const invalidTokens: string[] = [];

  response.responses.forEach((res, idx) => {
    if (!res.success) {
      invalidTokens.push(tokenList[idx]);
    }
  });

  if (invalidTokens.length) {
    await db.collection("fcm_tokens").deleteMany({
      token: { $in: invalidTokens },
    });
  }

  return {
    success: true,
    sent: response.successCount,
    failed: response.failureCount,
  };
}