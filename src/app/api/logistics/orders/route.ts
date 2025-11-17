import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { dbConnect } from "@/lib/dbConnect";
import Order from "@/app/models/orders";
import LogisticsPartner from "@/app/models/Logistics"; // your logistics model

// Secure logistics JWT secret
const LOGISTICS_JWT_SECRET = process.env.JWT_SECRET || "secret_ecom";

// ---------------------------
// Helper: Verify Logistics Token
// ---------------------------
const verifyLogisticsToken = (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "").trim();
  try {
    const decoded: any = jwt.verify(token, LOGISTICS_JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
};
// ---------------------------
// GET → Fetch ALL Orders Assigned to Logistics Partner
// ---------------------------
export async function GET(req: NextRequest) {
  await dbConnect();

  const user = verifyLogisticsToken(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const partner = await LogisticsPartner.findById(user.id);
    if (!partner) {
      return NextResponse.json({ error: "Invalid logistics partner" }, { status: 401 });
    }

    const orders = await Order.find({ assignedLogistics: partner._id }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// ---------------------------
// POST → Update Order Status
// ---------------------------
export async function POST(req: NextRequest) {
  await dbConnect();

  const user = verifyLogisticsToken(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId, status, locationUpdate } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Missing orderId or status" },
        { status: 400 }
      );
    }

    const partner = await LogisticsPartner.findById(user.id);
    if (!partner) {
      return NextResponse.json({ error: "Invalid logistics partner" }, { status: 401 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Ensure logistics partner owns this order
    if (order.assignedLogistics?.toString() !== partner._id.toString()) {
      return NextResponse.json(
        { error: "You are not assigned to this order" },
        { status: 403 }
      );
    }

    // Update delivery status
    order.deliveryStatus = status;

    // Optional: Append live tracking location step
    if (locationUpdate) {
      order.trackingHistory.push({
        time: new Date(),
        message: locationUpdate,
      });
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error("ORDER UPDATE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
