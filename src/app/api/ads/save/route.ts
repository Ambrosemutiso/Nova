import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Ad from '@/app/models/Ads';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const { sellerId, productId, title, description, category, mediaUrl, mediaType, country } = body;

    if (!sellerId || !productId || !title || !category || !mediaUrl || !mediaType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newAd = await Ad.create({
      sellerId,
      productId,
      title,
      description,
      category,
      mediaUrl,
      thumbnailUrl: mediaUrl,
      mediaType,
      country: country || 'Unknown',
    });

    return NextResponse.json({ ad: newAd }, { status: 201 });
  } catch (error: any) {
    console.error('🔥 Error saving ad:', error);
    return NextResponse.json({ error: 'Failed to save ad' }, { status: 500 });
  }
}
