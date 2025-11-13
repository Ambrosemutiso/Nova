import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";
import { dbConnect } from "@/lib/dbConnect";
import Ad from "@/app/models/Ads";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ----------- Generate Cloudinary upload signature -----------
export async function POST(req: NextRequest) {
  try {
    const { sellerId, title, description, category, country, mediaType } =
      await req.json();

    if (!sellerId || !title || !category || !mediaType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create signature for secure client upload
    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = {
      timestamp,
      folder: "novamax/ads",
      resource_type: "auto",
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY!,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
      folder: "novamax/ads",
    });
  } catch (err: any) {
    console.error("❌ Error creating Cloudinary signature:", err);
    return NextResponse.json(
      { error: "Failed to create signature", details: err.message },
      { status: 500 }
    );
  }
}

// ----------- Save uploaded ad metadata -----------
export async function PUT(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const { sellerId, title, description, category, country, mediaType, mediaUrl } = body;

    if (!mediaUrl) {
      return NextResponse.json({ error: "Missing media URL" }, { status: 400 });
    }

    const ad = await Ad.create({
      sellerId,
      title,
      description,
      category,
      country,
      mediaType,
      mediaUrl,
      thumbnailUrl: mediaUrl,
    });

    console.log("✅ Ad saved to DB:", ad._id);
    return NextResponse.json({ ad });
  } catch (err: any) {
    console.error("🔥 Error saving ad:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
