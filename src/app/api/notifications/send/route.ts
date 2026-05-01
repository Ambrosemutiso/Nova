// app/api/notifications/send/route.ts

import { NextRequest, NextResponse } from "next/server";
import { sendNotification } from "@/lib/sendNotification";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/app/models/user"; // 👈 use your model

export async function POST(req: NextRequest) {
  try {
    const { userId, ...payload } = await req.json();

    await dbConnect();

    // 🔒 ADMIN CHECK (MONGOOSE WAY)
    const user = await User.findById(userId);

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