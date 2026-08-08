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
        alt: 'Electronics',
        heading: 'Electronics Deals!',
        cta: 'Shop Now',
        link: 'https://novaxmax.com/category/electronics',
      },
      {
        id: 2,
        src: '/banner2.png',
        alt: 'Baby Products',
        heading: 'Baby Deals!',
        cta: 'Explore',
        link: 'https://www.novaxmax.com/baby-products',
      },
      {
        id: 3,
        src: '/banner3.png',
        alt: 'Fashion',
        heading: 'Fashion Deals!',
        cta: 'Buy Now',
        link: 'https://www.novaxmax.com/category/fashion',
      },
            {
        id: 4,
        src: '/banner4.png',
        alt: 'Kitchen',
        heading: 'Kitchen Deals!',
        cta: 'Explore',
        link: 'https://www.novaxmax.com/category/home-and-kitchen',
      },
            {
        id: 5,
        src: '/banner5.png',
        alt: 'Networking',
        heading: 'Networking Deals!',
        cta: 'Check Now',
        link: 'https://www.novaxmax.com/category/netwroking-and-internet',
      },
    ];

    const bannerData = await Promise.all(
      banners.map(async (banner) => {
        const products = await Product.aggregate([{ $sample: { size: 3 } }]); 
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