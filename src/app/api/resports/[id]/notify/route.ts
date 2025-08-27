import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { Report } from "@/app/models/report";
import Product from "@/app/models/product";
import Seller from "@/app/models/seller";
import nodemailer from "nodemailer"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();

    const report = await Report.findById(params.id)
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

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const product = report.productId as any;
    const seller = product.sellerId as any;

    if (!seller?.email) {
      return NextResponse.json({ error: "Seller email not found" }, { status: 400 });
    }

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail", // or use SMTP
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"NovaXpress Admin" <${process.env.EMAIL_USER}>`,
      to: seller.email,
      subject: "Your product has been reported 🚨",
      text: `Hello ${seller.name || seller.shopName},\n\nYour product "${product.name}" has been reported for review.\n\nIt has been temporarily removed from the store pending moderation.\n\nReason: ${report.reason}\n\nRegards,\nNovaXpress Admin`,
    });

    // Optionally mark product as inactive
    product.isActive = false;
    await product.save();

    return NextResponse.json({ success: true, message: "Seller notified" }, { status: 200 });
  } catch (error) {
    console.error("Error notifying seller:", error);
    return NextResponse.json({ error: "Failed to notify seller" }, { status: 500 });
  }
}
