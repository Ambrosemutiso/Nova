import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Ad from '@/app/models/Ads';

interface AdType {
  _id: string;
  sellerId: string;
  title: string;
  description?: string;
  category?: string;
  mediaUrl: string;
  mediaType: 'video' | 'image';
  views?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// ✅ GET: Fetch seller ads + others
export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');

    let sellerAds: AdType[] = [];
    let otherAds: AdType[] = [];

    if (sellerId) {
      // 🔹 Seller's own ads
      sellerAds = (await Ad.find({ sellerId })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean()) as unknown as AdType[];

      // 🔹 Other ads
      otherAds = (await Ad.find({ sellerId: { $ne: sellerId } })
        .sort({ createdAt: -1 })
        .limit(30)
        .lean()) as unknown as AdType[];
    } else {
      // 🔹 All ads (no sellerId)
      otherAds = (await Ad.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .lean()) as unknown as AdType[];
    }

    const response = NextResponse.json({ sellerAds, otherAds });

    // 🔹 Production-friendly caching for mobile
    response.headers.set('Cache-Control', 'public, max-age=10, stale-while-revalidate=59');

    return response;
  } catch (err) {
    console.error('❌ Error fetching ads:', err);
    return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 });
  }
}

// ✅ POST: Increment ad views
export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { adId } = await req.json();
    if (!adId) return NextResponse.json({ error: 'Missing adId' }, { status: 400 });

    const ad = await Ad.findById(adId);
    if (!ad) return NextResponse.json({ error: 'Ad not found' }, { status: 404 });

    ad.views = (ad.views || 0) + 1;
    await ad.save();

    return NextResponse.json({ success: true, views: ad.views });
  } catch (err) {
    console.error('❌ Error updating ad views:', err);
    return NextResponse.json({ error: 'Failed to update ad views' }, { status: 500 });
  }
}
