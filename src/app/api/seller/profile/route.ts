import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Seller from "@/app/models/seller";
import cloudinary from "@/lib/cloudinary";

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();

    const formData = await req.formData();

    const sellerId = formData.get("sellerId")?.toString();
    const name = formData.get("name")?.toString();
    const phoneNumber = formData.get("phoneNumber")?.toString();
    const bio = formData.get("bio")?.toString();
    const location = formData.get("location")?.toString();
    const website = formData.get("website")?.toString();
    const shopName = formData.get("shopName")?.toString();

    const imageFile = formData.get("image") as File | null;

    if (!sellerId) {
      return NextResponse.json(
        { message: "Seller ID is required" },
        { status: 400 }
      );
    }

    if (!name?.trim()) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    let imageUrl: string | undefined;

    // ✅ Upload image to Cloudinary
    if (imageFile && imageFile.size > 0) {
      try {
        const buffer = Buffer.from(await imageFile.arrayBuffer());

        const result = await cloudinary.uploader.upload(
          `data:${imageFile.type};base64,${buffer.toString("base64")}`,
          {
            folder: "sellers",
          }
        );

        // remove Cloudinary version number
        imageUrl = result.secure_url.replace(/\/v\d+\//, "/");

      } catch (uploadError) {
        console.error("❌ Seller image upload failed:", uploadError);

        return NextResponse.json(
          { message: "Image upload failed" },
          { status: 500 }
        );
      }
    }

    // ✅ Build update object
    const updateFields: Record<string, any> = {
      name: name.trim(),
    };

    if (phoneNumber !== undefined)
      updateFields.phoneNumber = phoneNumber.trim();

    if (bio !== undefined)
      updateFields.bio = bio.trim();

    if (location !== undefined)
      updateFields.location = location.trim();

    if (website !== undefined)
      updateFields.website = website.trim();

    if (shopName !== undefined)
      updateFields["shop.name"] = shopName.trim();

    // ✅ only update image if new image exists
    if (imageUrl) {
      updateFields.image = imageUrl;
    }

    const updatedSeller = await Seller.findByIdAndUpdate(
      sellerId,
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedSeller) {
      return NextResponse.json(
        { message: "Seller not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      seller: updatedSeller,
    });

  } catch (error: any) {
    console.error("❌ Seller profile update error:", error);

    return NextResponse.json(
      {
        message: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}