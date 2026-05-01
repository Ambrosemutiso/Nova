// app/api/notifications/send/route.ts

import { NextRequest, NextResponse } from "next/server";
import { sendNotification } from "@/lib/sendNotification";
import { dbConnect } from "@/lib/dbConnect";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    await dbConnect();

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