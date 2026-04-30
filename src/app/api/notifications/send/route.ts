import { NextRequest, NextResponse } from "next/server";
import { sendNotification } from "@/lib/sendNotification";
import {dbConnect} from "@/lib/dbConnect";

export async function POST(req: NextRequest) {
  try {
    const { userId, ...payload } = await req.json();

    await dbConnect();
    const db = (global as any)._mongoClient.db();

    // 🔒 Check if admin
    const user = await db.collection("users").findOne({ _id: userId });

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const result = await sendNotification(payload);

    return NextResponse.json(result);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}