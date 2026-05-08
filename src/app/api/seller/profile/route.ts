// app/api/seller/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/app/models/user";

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();

    const {
      sellerId,
      name,
      phoneNumber,
      bio,
      location,
      website,
      shopName,
      image,
    } = await req.json();

    if (!sellerId) {
      return NextResponse.json({ message: "Seller ID is required" }, { status: 400 });
    }

    if (!name?.trim()) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

    // Build update object — only include fields that were sent
    const updateFields: Record<string, any> = {
      name: name.trim(),
    };

    if (phoneNumber !== undefined) updateFields.phoneNumber = phoneNumber.trim();
    if (bio !== undefined)         updateFields.bio = bio.trim();
    if (location !== undefined)    updateFields.location = location.trim();
    if (website !== undefined)     updateFields.website = website.trim();
    if (image !== undefined)       updateFields.image = image;

    // Shop name lives inside the nested shop object
    if (shopName !== undefined) {
      updateFields["shop.name"] = shopName.trim();
    }

    const updated = await User.findByIdAndUpdate(
      sellerId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated) {
      return NextResponse.json({ message: "Seller not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      seller: updated,
    });

  } catch (error: any) {
    console.error("Seller profile update error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}