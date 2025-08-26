import {dbConnect} from "@/lib/dbConnect";
import Product from "@/app/models/product";

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find().populate("sellerId", "name shopName");
    return new Response(JSON.stringify(products), { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch products" }), { status: 500 });
  }
}
