import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Ad from "@/app/models/Ads";

interface ProductType {
  _id: string;
  name: string;
  calculatedPrice: number;
  images?: string[];
  slug?: string;
}

interface AdType {
  _id: string;
  sellerId: string;
  title: string;
  description?: string;
  category?: string;
  mediaUrl: string;
  mediaType: "video" | "image";
  product?: ProductType;
  views?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/* ------------------------------------------------ */
/* GET ADS */
/* ------------------------------------------------ */

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get("sellerId");

    let sellerAds: AdType[] = [];
    let otherAds: AdType[] = [];

    /* -------------------------------- */
    /* Seller Ads */
    /* -------------------------------- */

    if (sellerId) {
      const sellerResults = await Ad.find({ sellerId })
        .populate({
          path: "productId",
          select: "name calculatedPrice images slug",
        })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      sellerAds = sellerResults.map((ad: any) => ({
        ...ad,
        product: ad.productId || null,
      })) as AdType[];

      /* -------------------------------- */
      /* Other Ads */
      /* -------------------------------- */

      const otherResults = await Ad.find({
        sellerId: { $ne: sellerId },
      })
        .populate({
          path: "productId",
          select: "name calculatedPrice images slug",
        })
        .sort({ createdAt: -1 })
        .limit(30)
        .lean();

      otherAds = otherResults.map((ad: any) => ({
        ...ad,
        product: ad.productId || null,
      })) as AdType[];
    } else {
      /* -------------------------------- */
      /* All Ads (no sellerId) */
      /* -------------------------------- */

      const results = await Ad.find()
        .populate({
          path: "productId",
          select: "name calculatedPrice images slug",
        })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      otherAds = results.map((ad: any) => ({
        ...ad,
        product: ad.productId || null,
      })) as AdType[];
    }

    const response = NextResponse.json({
      sellerAds,
      otherAds,
    });

    /* -------------------------------- */
    /* Mobile Feed Cache */
    /* -------------------------------- */

    response.headers.set(
      "Cache-Control",
      "public, max-age=10, stale-while-revalidate=59"
    );

    return response;
  } catch (err) {
    console.error("❌ Error fetching ads:", err);
    return NextResponse.json(
      { error: "Failed to fetch ads" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------ */
/* INCREMENT AD VIEWS */
/* ------------------------------------------------ */

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { adId } = await req.json();

    if (!adId)
      return NextResponse.json(
        { error: "Missing adId" },
        { status: 400 }
      );

    const ad = await Ad.findById(adId);

    if (!ad)
      return NextResponse.json(
        { error: "Ad not found" },
        { status: 404 }
      );

    ad.views = (ad.views || 0) + 1;

    await ad.save();

    return NextResponse.json({
      success: true,
      views: ad.views,
    });
  } catch (err) {
    console.error("❌ Error updating ad views:", err);

    return NextResponse.json(
      { error: "Failed to update ad views" },
      { status: 500 }
    );
  }
}