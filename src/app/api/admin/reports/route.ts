import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { Report } from "@/app/models/report";

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const sort = searchParams.get("sort") === "asc" ? 1 : -1;
  const reason = searchParams.get("reason");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const query: any = {};
  if (reason) query.reason = { $regex: reason, $options: "i" };
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }

  const reports = await Report.find(query)
    .sort({ createdAt: sort })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Report.countDocuments(query);

  return NextResponse.json({
    reports,
    totalPages: Math.ceil(total / limit),
  });
}
