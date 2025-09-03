// --- app/api/admin/transactions/route.ts ---
import { NextRequest, NextResponse } from "next/server";
import {dbConnect} from "@/lib/dbConnect";
import Transaction from "@/app/models/transaction";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const sortField = searchParams.get("sortField") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const status = searchParams.get("status");
    const phone = searchParams.get("phone");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const filter: any = {};
    if (status) filter.status = status;
    if (phone) filter.phone = phone;

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setDate(toDate.getDate() + 1); // include full day
        filter.createdAt.$lte = toDate;
      }
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(filter),
    ]);

    return NextResponse.json({
      transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
