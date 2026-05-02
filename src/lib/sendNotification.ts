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
  if (target.type === "users") {
    if (!Array.isArray(target.value)) {
      return {
        success: false,
        sent: 0,
        failed: 0,
        message: "Invalid user IDs",
      };
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
      return {
        success: false,
        sent: 0,
        failed: 0,
        message: "Role not provided",
      };
    }

    userQuery.role = target.value;
  }

  // 👥 GET USERS
  const users = await User.find(userQuery).select("_id");
  const userIds = users.map(u => u._id);

  if (!userIds.length) {
    return {
      success: false,
      sent: 0,
      failed: 0,
      message: "No users found",
    };
  }

  // 🔑 GET TOKENS
  const tokens = await FcmToken.find({
    userId: { $in: userIds },
  });

  const tokenList = tokens.map(t => t.token);

  if (!tokenList.length) {
    return {
      success: false,
      sent: 0,
      failed: 0,
      message: "No tokens found",
    };
  }

  // 🚀 SEND (handle 500 limit)
  const chunkSize = 500;
  let totalSent = 0;
  let totalFailed = 0;
  const invalidTokens: string[] = [];

  for (let i = 0; i < tokenList.length; i += chunkSize) {
    const chunk = tokenList.slice(i, i + chunkSize);

    const response = await admin.messaging().sendEachForMulticast({
      tokens: chunk,
      notification: { title, body },
      data,
    });

    totalSent += response.successCount;
    totalFailed += response.failureCount;

    response.responses.forEach((res, idx) => {
      if (
        !res.success &&
        (
          res.error?.code === "messaging/registration-token-not-registered" ||
          res.error?.code === "messaging/invalid-registration-token"
        )
      ) {
        invalidTokens.push(chunk[idx]);
      }
    });
  }

  // 🧹 CLEAN INVALID TOKENS
  if (invalidTokens.length) {
    await FcmToken.deleteMany({
      token: { $in: invalidTokens },
    });
  }

  return {
    success: true,
    sent: totalSent,
    failed: totalFailed,
  };
}