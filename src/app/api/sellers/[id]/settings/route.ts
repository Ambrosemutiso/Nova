import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Seller from "@/app/models/seller"; // your Seller model

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await req.json();

    if (!body.settings) {
      return NextResponse.json(
        { error: "Settings object is required" },
        { status: 400 }
      );
    }

    const allowedFields = ["country", "currency", "language", "timezone"];
    const updates: Record<string, string> = {};

    for (const field of allowedFields) {
      if (body.settings[field]) {
        updates[`settings.${field}`] = body.settings[field];
      }
    }

    const updatedSeller = await Seller.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    if (!updatedSeller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    return NextResponse.json({ seller: updatedSeller });
  } catch (error) {
    console.error("Error updating seller settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
