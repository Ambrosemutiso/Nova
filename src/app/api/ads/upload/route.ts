import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { dbConnect } from '@/lib/dbConnect';
import Ad from '@/app/models/Ads';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  await dbConnect();

  const { sellerId, title, description, mediaType, category, country, fileBase64 } = await req.json();

  if (!fileBase64 || !mediaType || !title || !category || !sellerId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // 🔹 Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(fileBase64, {
      resource_type: mediaType === 'video' ? 'video' : 'image',
      folder: 'novaxmax/ads',
      use_filename: true,
      unique_filename: true,
    });

    // 🔹 Clean the URL (remove /v123456/ version part)
    const cleanedUrl = uploadResult.secure_url.replace(/\/v\d+\//, '/');

    // 🔹 Save ad in DB
    const newAd = await Ad.create({
      sellerId,
      title,
      description,
      mediaUrl: cleanedUrl,
      mediaType,
      thumbnailUrl: mediaType === 'video' ? cleanedUrl : null,
      category,
      country,
    });

    return NextResponse.json({ ad: newAd });
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
