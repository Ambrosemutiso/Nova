// app/api/products/trending/route.ts
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import ProductModel from '@/app/models/product';
import type { ProductType } from '@/app/types/product';

export async function GET() {
  try {
    await dbConnect();

    // Fetch top 10 products sorted by combined views + visits score (descending)
    const products = await ProductModel.aggregate([
      {
        $addFields: {
          trendingScore: { $add: ['$views', '$visits'] },
        },
      },
      { $sort: { trendingScore: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          price: 1,
          oldPrice: 1,
          category: 1,
          subcategory: 1,
          productType: 1,
          condition: 1,
          county: 1,
          town: 1,
          quantity: 1,
          rating: 1,
          calculatedPrice: 1,
          description: 1,
          images: 1,
          sellerId: 1,
          brand: 1,
          model: 1,
          material: 1,
          color: 1,
          fulfillmentMode: 1,
          keyFeatures: 1,
          boxContents: 1,
          warranty: 1,
          dimensions: 1,
          weight: 1,
          createdAt: 1,
          updatedAt: 1,
          averageRating: 1,
          views: 1,
          visits: 1,
          currency: 1,
          reviewCount: 1,
          installmentEnabled: 1,
          installmentDepositPercent: 1,
          installmentMonths: 1,
          installmentPolicy: 1,
          trendingScore: 1,
        },
      },
    ]) as unknown as (ProductType & { trendingScore: number })[];

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Failed to fetch trending products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending products', products: [] },
      { status: 500 }
    );
  }
}

// Optional: Revalidate every 5 minutes to keep trending fresh
export const revalidate = 300;