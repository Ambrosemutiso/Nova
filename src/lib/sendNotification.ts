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
  const { title, body, data = {}, target } = options;

  let userQuery: any = {};

  // 🎯 TARGETING
  if (target.type === "users") {
    if (!Array.isArray(target.value)) {
      return { success: false, sent: 0, failed: 0, message: "Invalid user IDs" };
    }

    const validIds = target.value.filter(id =>
      mongoose.Types.ObjectId.isValid(id)
    );

    userQuery._id = {
      $in: validIds.map(id => new mongoose.Types.ObjectId(id)),
    };
  }

  if (target.type === "role") {
    if (!target.value) {
      return { success: false, sent: 0, failed: 0, message: "Role not provided" };
    }

    userQuery.role = target.value;
  }

  // 👥 USERS
  const users = await User.find(userQuery).select("_id");
  const userIds = users.map(u => u._id.toString());

  if (!userIds.length) {
    return { success: false, sent: 0, failed: 0, message: "No users found" };
  }

  // 🔑 TOKENS (FIXED)
  const tokens = await FcmToken.find({
    userId: { $in: userIds },
  });

  const tokenList = tokens.map(t => t.token);

  if (!tokenList.length) {
    return { success: false, sent: 0, failed: 0, message: "No tokens found" };
  }

  // 🚀 SEND
  const response = await admin.messaging().sendEachForMulticast({
    tokens: tokenList,
    notification: { title, body },
    data,
  });

  // DEBUG (VERY IMPORTANT)
  response.responses.forEach((res, i) => {
    if (!res.success) {
      console.log("❌ FCM ERROR:", res.error);
    }
  });

  return {
    success: true,
    sent: response.successCount,
    failed: response.failureCount,
  };
}