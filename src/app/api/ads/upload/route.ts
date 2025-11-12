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

  try {
    let uploadString = fileBase64;

    // 🧠 If the file is raw base64, prepend MIME type
    if (!fileBase64.startsWith('data:')) {
      const mimePrefix =
        mediaType === 'video'
          ? 'data:video/mp4;base64,'
          : 'data:image/jpeg;base64,';
      uploadString = `${mimePrefix}${fileBase64}`;
    }

    console.log('📤 Uploading to Cloudinary...');
    const uploadResult = await cloudinary.uploader.upload(uploadString, {
      resource_type: mediaType === 'video' ? 'video' : 'image',
      folder: 'novamax/ads',
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
    console.error('❌ Cloudinary upload failed:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: { sizeLimit: '50mb' },
  },
};
