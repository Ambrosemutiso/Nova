import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Seller from "@/app/models/seller";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { provider, mode, name, email, image, phoneNumber, country, currency, password } =
      await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    let seller = await Seller.findOne({ email });

    if (!seller) {
      // Hash password only if it’s provided (email/password registration)
      let hashedPassword = undefined;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
      }

      const newSellerData: any = {
        name,
        email,
        image,
        phoneNumber: phoneNumber || null,
        country: country || null,
        currency: currency || null,
        role: "seller",
        isPhoneVerified: false,
        provider: provider || "google",
        ...(hashedPassword && { password: hashedPassword }),
      };

      seller = await Seller.create(newSellerData);
    } else if (mode === "register") {
      // Prevent duplicate registration
      return NextResponse.json(
        { success: false, error: "Seller already exists" },
        { status: 400 }
      );
    }

    // ✅ If phone missing or not verified → ask frontend to open OTP modal
    if (!seller.phoneNumber || !seller.isPhoneVerified) {
      return NextResponse.json({
        success: true,
        user: seller,
        needsPhoneNumber: true,
      });
    }

    return NextResponse.json({
      success: true,
      user: seller,
      needsPhoneNumber: false,
    });
  } catch (error) {
    console.error("Seller Google-login error:", error);
    return NextResponse.json(
      { success: false, error: "Seller login failed" },
      { status: 500 }
    );
  }
}
