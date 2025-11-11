import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Ad from '@/app/models/Ads';

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const ads = await Ad.find().sort({ createdAt: -1 }).limit(50);
    return NextResponse.json({ ads });
  } catch (error) {
    console.error('❌ Error fetching ads:', error);
    return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 });
  }
}

// ✅ Add POST for incrementing ad views
export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { adId } = await req.json();
    if (!adId) {
      return NextResponse.json({ error: 'Missing adId' }, { status: 400 });
    }

    const ad = await Ad.findById(adId);
    if (!ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    ad.views = (ad.views || 0) + 1;
    await ad.save();

    return NextResponse.json({ success: true, views: ad.views });
  } catch (error) {
    console.error('❌ Error updating ad views:', error);
    return NextResponse.json({ error: 'Failed to update ad views' }, { status: 500 });
  }
}
