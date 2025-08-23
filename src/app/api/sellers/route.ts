import {dbConnect} from "@/lib/dbConnect";
import Seller from "@/app/models/seller";

export async function GET() {
  try {
    await dbConnect();
    const sellers = await Seller.find();
    return new Response(JSON.stringify(sellers), { status: 200 });
  } catch (error) {
    console.error("Error fetching sellers:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch sellers" }), { status: 500 });
  }
}
