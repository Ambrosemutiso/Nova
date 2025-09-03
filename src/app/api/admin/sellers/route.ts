import { NextResponse } from "next/server";
import {dbConnect} from "@/lib/dbConnect";
import Seller from "@/app/models/seller";

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const order = searchParams.get("order") === "asc" ? 1 : -1;
  const search = searchParams.get("search") || "";
  const isVerified = searchParams.get("isVerified"); // optional filter

  const query: any = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { shopName: { $regex: search, $options: "i" } },
    ];
  }

  if (isVerified !== null && isVerified !== undefined) {
    query.isVerified = isVerified === "true";
  }

  const total = await Seller.countDocuments(query);

  const sellers = await Seller.find(query)
    .sort({ [sortBy]: order })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return NextResponse.json({
    data: sellers,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  });
}
