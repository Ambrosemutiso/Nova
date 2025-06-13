import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Product from '@/app/models/product';
import Review from '@/app/models/review';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ categorySlug: string }> }
) {
  try {
    const { categorySlug } = await context.params;
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sort = searchParams.get('sort') || 'name-asc';
    const skip = (page - 1) * limit;

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      'name-asc': { name: 1 },
      'name-desc': { name: -1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
    };
    const sortOption = sortMap[sort] || { name: 1 };

    await dbConnect();

    const categoryRegex = new RegExp(`^${categorySlug}$`, 'i');

    const [total, products] = await Promise.all([
      Product.countDocuments({ category: categoryRegex }),
      Product.find({ category: categoryRegex })
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
    ]);

    const productIds = products.map((p) => p._id);

    const reviews = await Review.aggregate([
      { $match: { productId: { $in: productIds } } },
      {
        $group: {
          _id: '$productId',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    const reviewMap = new Map(
      reviews.map((r) => [r._id.toString(), {
        averageRating: r.averageRating,
        reviewCount: r.reviewCount,
      }])
    );

    const enrichedProducts = products.map((product) => {
      const review = reviewMap.get(product._id.toString()) || { averageRating: 0, reviewCount: 0 };
      return {
        ...product.toObject(),
        rating: review.averageRating,
        reviewCount: review.reviewCount,
      };
    });

    return NextResponse.json({ products: enrichedProducts, total });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
