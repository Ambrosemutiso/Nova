import { dbConnect } from '@/lib/dbConnect';
import Seller from '@/app/models/seller';
import Product from '@/app/models/product';

export async function GET(req: Request, { params }: { params: { sellerId: string } }) {
  await dbConnect();

  const sellerId = params.sellerId;
  const url = new URL(req.url);
  const category = url.searchParams.get('category');

  try {
    const seller = await Seller.findById(sellerId);
    if (!seller || !seller.shop?.isActive) {
      return Response.json({ error: 'Shop not found or inactive' }, { status: 404 });
    }

const productFilter: Record<string, any> = { sellerId };

if (category) {
  productFilter['category'] = new RegExp(`^${category}$`, 'i');
}
    const products = await Product.find(productFilter).lean();

    return Response.json({ seller, products });
  } catch (err) {
    console.error('Shop fetch error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
