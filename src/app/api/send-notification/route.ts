import { NextRequest, NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  const { token, title, body } = await req.json();

  try {
    await admin.messaging().send({
      token,
      notification: {
        title,
        body,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}