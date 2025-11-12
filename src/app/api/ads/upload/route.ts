import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { dbConnect } from '@/lib/dbConnect';
import Ad from '@/app/models/Ads';
import stream from 'stream';

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

    console.log('📤 Uploading video to Cloudinary...');

    // Convert File to Node.js readable stream
    const buffer = Buffer.from(await file.arrayBuffer());
    const readable = stream.Readable.from(buffer);

    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'novamax/ads',
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      readable.pipe(uploadStream);
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
      thumbnailUrl: cleanedUrl,
      category,
      country,
    });

    return NextResponse.json({ ad: newAd }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Upload failed:', error);
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
