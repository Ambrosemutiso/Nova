// lib/sendNotification.ts

import admin from "@/lib/firebaseAdmin";
import { dbConnect } from "@/lib/dbConnect";
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
  await dbConnect();

  const { title, body, data = {}, target } = options;

  let userQuery: any = {
    notificationsEnabled: { $ne: false },
  };

  // 🎯 TARGETING
  if (target.type === "users" && Array.isArray(target.value)) {
    userQuery._id = {
      $in: target.value.map(id => new mongoose.Types.ObjectId(id)),
    };
  }

  if (target.type === "role") {
    userQuery.role = target.value;
  }

  // 👥 GET USERS
  const users = await User.find(userQuery).select("_id");
  const userIds = users.map(u => u._id);

  if (!userIds.length) {
    return { success: false, message: "No users found" };
  }

  // 🔑 GET TOKENS
  const tokens = await FcmToken.find({
    userId: { $in: userIds },
  });

  const tokenList = tokens.map(t => t.token);

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
    await FcmToken.deleteMany({
      token: { $in: invalidTokens },
    });
  }

  return {
    success: true,
    sent: response.successCount,
    failed: response.failureCount,
  };
}