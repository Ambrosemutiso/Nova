import { NextRequest, NextResponse } from "next/server";
import {dbConnect} from "@/lib/dbConnect";
import B2CLog from "@/app/models/B2CLog";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();

    await B2CLog.create({ type: "timeout", data });

    console.log("⏳ B2C TIMEOUT CALLBACK:", data);

    return NextResponse.json({ message: "Timeout received" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Callback error" }, { status: 500 });
  }
}
