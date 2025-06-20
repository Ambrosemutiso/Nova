import { NextResponse } from 'next/server';
import Product from '@/app/models/product';
import { dbConnect } from '@/lib/dbConnect';

export async function DELETE(_: Request, context: { params: { id: string } }) {
  try {
    await dbConnect();
    const { id } = context.params;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Product ID is required' }, { status: 400 });
    }

    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
