import { NextResponse } from 'next/server';
import Product from '@/app/models/product';
import { dbConnect } from '@/lib/dbConnect';

export async function GET() {
  try {
    await dbConnect();

    const banners = [
      {
        id: 1,
        src: '/banner1.png',
        alt: 'Banner 1',
        heading: 'Big Deals!',
        cta: 'Shop Now',
        link: 'https://novaxmax.com/category/electronics',
      },
      {
        id: 2,
        src: '/banner2.png',
        alt: 'Banner 2',
        heading: 'New Arrivals',
        cta: 'Explore',
        link: 'https://www.novaxmax.com/installments',
      },
      {
        id: 3,
        src: '/banner3.png',
        alt: 'Banner 3',
        heading: 'Hot Offers',
        cta: 'Buy Now',
        link: 'https://www.novaxmax.com/category/fashion',
      },
            {
        id: 4,
        src: '/banner4.png',
        alt: 'Banner 4',
        heading: 'Best Offers',
        cta: 'Explore',
        link: 'https://www.novaxmax.com/category/home-and-kitchen',
      },
            {
        id: 5,
        src: '/banner5.png',
        alt: 'Banner 5',
        heading: 'Most Viewed',
        cta: 'Check Now',
        link: 'https://www.novaxmax.com/category/automotive-and-motorcycles',
      },
    ];

    // For each banner, fetch 3 random products
    const bannerData = await Promise.all(
      banners.map(async (banner) => {
        const products = await Product.aggregate([{ $sample: { size: 3 } }]); // Random 3 products
        return {
          ...banner,
          products,
        };
      })
    );

    return NextResponse.json(bannerData);
  } catch (error) {
    console.error('Failed to fetch banners:', error);
    return NextResponse.json({ error: 'Failed to load banners' }, { status: 500 });
  }
}