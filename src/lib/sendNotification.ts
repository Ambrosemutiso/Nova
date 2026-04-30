import admin from "@/lib/firebaseAdmin";
import { dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

type SendOptions = {
  title: string;
  body: string;
  data?: Record<string, string>;
  userIds?: string[];
  role?: "seller" | "buyer";
  county?: string;
};

// ✅ Add types
type User = {
  _id: ObjectId;
  role?: string;
  county?: string;
  notificationsEnabled?: boolean;
};

type FcmToken = {
  token: string;
  userId: ObjectId;
};

export async function sendNotification(options: SendOptions) {
  await dbConnect();
  const db = (global as any)._mongoClient.db();

  const {
    title,
    body,
    data = {},
    userIds,
    role,
    county,
  } = options;

  const userQuery: any = {
    notificationsEnabled: { $ne: false },
  };

  if (userIds?.length) {
    userQuery._id = { $in: userIds.map(id => new ObjectId(id)) };
  }

  if (role) userQuery.role = role;
  if (county) userQuery.county = county;

  // ✅ Type the result
  const users: User[] = await db
    .collection("users")
    .find(userQuery)
    .toArray();

  const userIdsList = users.map((u: User) => u._id);

  if (!userIdsList.length) {
    return { success: false, message: "No users found" };
  }

  // ✅ Type tokens
  const tokens: FcmToken[] = await db
    .collection("fcm_tokens")
    .find({ userId: { $in: userIdsList } })
    .toArray();

  const tokenList = tokens.map((t: FcmToken) => t.token);

  if (!tokenList.length) {
    return { success: false, message: "No tokens found" };
  }

  const response = await admin.messaging().sendEachForMulticast({
    tokens: tokenList,
    notification: {
      title,
      body,
    },
    data,
  });

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