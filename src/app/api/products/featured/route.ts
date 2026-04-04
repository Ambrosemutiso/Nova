import { NextResponse } from 'next/server';
import Product from '@/app/models/product';
import { dbConnect } from '@/lib/dbConnect';

export async function GET() {
  try {
    await dbConnect();

    const banners = [
      { id: 1, src: '/banner1.jpg', heading: 'Big Deals!', cta: 'Shop Now' },
      { id: 2, src: '/banner2.jpg', heading: 'New Arrivals', cta: 'Explore' },
      { id: 3, src: '/banner3.jpg', heading: 'Hot Offers', cta: 'Buy Now' },
    ];

    const bannerData = await Promise.all(
      banners.map(async (banner) => {
        const products = await Product.aggregate([
          { $match: { isFeatured: true } },
          { $sample: { size: 4 } },
        ]);

        return { ...banner, products };
      })
    );

    return NextResponse.json(bannerData);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}