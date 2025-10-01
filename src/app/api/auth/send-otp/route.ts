import { NextResponse } from "next/server";
import twilio from "twilio";
import {dbConnect} from "@/lib/dbConnect";
import User from "@/app/models/user";
import Seller from "@/app/models/seller";

const client = twilio(process.env.TWILIO_SID!, process.env.TWILIO_AUTH_TOKEN!);

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { phoneNumber, role } = await req.json();

    if (!phoneNumber || !role) {
      return NextResponse.json({ message: "Phone number and role are required" }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Pick model
    const Model = role === "seller" ? Seller : User;
    let account = await Model.findOne({ phoneNumber });

    if (!account) {
      account = new Model({ phoneNumber, otp });
    } else {
      account.otp = otp;
    }

    await account.save();

    // Send OTP via Twilio
    await client.messages.create({
      body: `Your verification code is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: phoneNumber,
    });

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ message: "Failed to send OTP" }, { status: 500 });
  }
}
