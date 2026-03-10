//app/api/products/category/[categorySlug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Product from '@/app/models/product';
import Review from '@/app/models/review';
import { categoryTree } from "@/lib/productCategories";
import { slugify } from "@/lib/slugify";

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
    const brand = searchParams.get('brand') || '';
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '0');

    const skip = (page - 1) * limit;

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      'name-asc': { name: 1 },
      'name-desc': { name: -1 },
      'price-asc': { calculatedPrice: 1 },
      'price-desc': { calculatedPrice: -1 },
    };
    const sortOption = sortMap[sort] || { name: 1 };

    await dbConnect();
const categoryName = Object.keys(categoryTree).find(
  (cat) => slugify(cat) === categorySlug
);

if (!categoryName) {
  return NextResponse.json(
    { error: "Category not found" },
    { status: 404 }
  );
}

const filters: any = { category: categoryName };

    if (brand) filters.brand = brand;
    if (minPrice > 0) filters.calculatedPrice = { ...filters.calculatedPrice, $gte: minPrice };
    if (maxPrice > 0) filters.calculatedPrice = { ...filters.calculatedPrice, $lte: maxPrice };

    const [total, products, brands] = await Promise.all([
      Product.countDocuments(filters),
      Product.find(filters).sort(sortOption).skip(skip).limit(limit),
      Product.distinct('brand', { category: categoryName }), 
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
      reviews.map((r) => [
        r._id.toString(),
        {
          averageRating: r.averageRating,
          reviewCount: r.reviewCount,
        },
      ])
    );

    const enrichedProducts = products.map((product) => {
      const review = reviewMap.get(product._id.toString()) || {
        averageRating: 0,
        reviewCount: 0,
      };
      
      return {
        ...product.toObject(),
        rating: review.averageRating,
        reviewCount: review.reviewCount,
      };
    });

    return NextResponse.json({ products: enrichedProducts, total, brands });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}