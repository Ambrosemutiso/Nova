import { NextRequest, NextResponse } from 'next/server';
import Product from '@/app/models/product';
import { dbConnect } from '@/lib/dbConnect';

// DELETE /api/seller/products/[id]
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await dbConnect();

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// GET /api/seller/products/[id]
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await dbConnect();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// PUT /api/seller/products/[id]
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await dbConnect();
    const body = await req.json();

    const updated = await Product.findByIdAndUpdate(id, body, { new: true });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, message: 'Update failed' },
      { status: 500 }
    );
  }
}
