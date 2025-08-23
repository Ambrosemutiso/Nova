import {dbConnect} from "@/lib/dbConnect";
import WithdrawRequest from "@/app/models/withdrawRequest";

export async function GET() {
  try {
    await dbConnect();
    const requests = await WithdrawRequest.find().populate("sellerId", "name shopName email");
    return new Response(JSON.stringify(requests), { status: 200 });
  } catch (error) {
    console.error("Error fetching withdrawal requests:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch withdrawal requests" }), { status: 500 });
  }
}
