import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { dbConnect } from '@/lib/dbConnect';
import Ad from '@/app/models/Ads';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const formData = await req.formData();

    const sellerId = formData.get('sellerId')?.toString();
    const title = formData.get('title')?.toString();
    const description = formData.get('description')?.toString() || '';
    const category = formData.get('category')?.toString();
    const country = formData.get('country')?.toString() || 'Unknown';
    const mediaType = formData.get('mediaType')?.toString(); // 'video' or 'image'
    const file = formData.get('file') as File;

    if (!sellerId || !title || !category || !mediaType || !file) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (mediaType === 'video' && !file.type.startsWith('video/')) {
      return NextResponse.json({ error: 'File must be a video' }, { status: 400 });
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Build base64 string with MIME prefix
    const mimeType = mediaType === 'video' ? 'video/mp4' : 'image/jpeg';
    const uploadString = `data:${mimeType};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary
    console.log('📤 Uploading to Cloudinary...');
    const uploadResult = await cloudinary.uploader.upload(uploadString, {
      resource_type: mediaType === 'video' ? 'video' : 'image',
      folder: 'novamax/ads',
      use_filename: true,
      unique_filename: true,
    });

    console.log('✅ Cloudinary upload success:', uploadResult.secure_url);

    const cleanedUrl = uploadResult.secure_url.replace(/\/v\d+\//, '/');

    // Save ad in DB
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

    return NextResponse.json({ ad: newAd }, { status: 201 });
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
    bodyParser: false,
  },
};
