import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { Report } from "@/app/models/report";
import Product from "@/app/models/product";
import Seller from "@/app/models/seller";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // get all reports, join with product & seller
    const reports = await Report.find()
      .populate({
        path: "productId",
        model: Product,
        populate: {
          path: "sellerId",
          model: Seller,
          select: "name email shopName",
        },
      })
      .exec();

    return NextResponse.json(reports, { status: 200 });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
