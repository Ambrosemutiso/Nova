import { NextResponse } from "next/server";
import {dbConnect} from "@/lib/dbConnect";
import User from "@/app/models/user";
import Seller from "@/app/models/seller";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { phoneNumber, otp, role } = await req.json();

    if (!phoneNumber || !otp || !role) {
      return NextResponse.json({ message: "Phone number, OTP, and role are required" }, { status: 400 });
    }

    const Model = role === "seller" ? Seller : User;
    const account = await Model.findOne({ phoneNumber });

    if (!account || account.otp !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    account.otp = undefined;
    account.isPhoneVerified = true;
    await account.save();

    return NextResponse.json({ message: "Phone verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ message: "Failed to verify OTP" }, { status: 500 });
  }
}
