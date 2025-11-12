import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { dbConnect } from '@/lib/dbConnect';
import Ad from '@/app/models/Ads';

export const runtime = 'nodejs'; 

export async function POST(req: NextRequest) {
  await dbConnect();

  let body;
  try {
    body = await req.json();
  } catch (err) {
    console.error('❌ Invalid JSON body:', err);
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { sellerId, title, description, mediaType, category, country, fileBase64 } = body;

  if (!fileBase64 || !mediaType || !title || !category || !sellerId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!fileBase64.startsWith('data:')) {
    console.warn('⚠️ Invalid base64 format. Expected data URL.');
    return NextResponse.json({ error: 'Invalid file format' }, { status: 400 });
  }

  try {
    console.log('📤 Uploading to Cloudinary...');
    const uploadResult = await cloudinary.uploader.upload(fileBase64, {
      resource_type: mediaType === 'video' ? 'video' : 'image',
      folder: 'products',
      use_filename: true,
      unique_filename: true,
    });

    console.log('✅ Cloudinary upload success:', uploadResult.secure_url);

    const cleanedUrl = uploadResult.secure_url.replace(/\/v\d+\//, '/');

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
  } catch (error: any) {
    console.error('❌ Cloudinary upload failed:', {
      message: error.message,
      name: error.name,
      http_code: error.http_code || 'N/A',
      stack: error.stack,
    });

    return NextResponse.json(
      { error: 'Upload failed', details: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};
