// /app/api/products-by-seller/[sellerId]/route.ts
import { dbConnect } from '@/lib/dbConnect';
import Product from '@/app/models/product';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ sellerId: string }> }
) {
  try {
    const { sellerId } = await context.params;

    await dbConnect();

    const product = await Product.findById(sellerId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
