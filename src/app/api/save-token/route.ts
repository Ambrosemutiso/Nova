//app/api/save-token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import FcmToken from "@/app/models/FcmToken";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { token, userId } = await req.json();

    if (!token || !userId) {
      return NextResponse.json(
        { error: "Missing token or userId" },
        { status: 400 }
      );
    }

    // 🔍 Check if token already exists
    const existing = await FcmToken.findOne({ token });

    if (existing) {
      existing.lastUsed = new Date();
      existing.userId = new mongoose.Types.ObjectId(userId);
      await existing.save();

      return NextResponse.json({ success: true, updated: true });
    }

    // ✅ Create new token
    await FcmToken.create({
      userId: new mongoose.Types.ObjectId(userId),
      token,
      device: "web",
      createdAt: new Date(),
      lastUsed: new Date(),
    });

    return NextResponse.json({ success: true, created: true });

  } catch (error) {
    console.error("Save token error:", error);

    return NextResponse.json(
      { error: "Failed to save token" },
      { status: 500 }
    );
  }
}