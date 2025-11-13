import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { dbConnect } from '@/lib/dbConnect';
import Ad from '@/app/models/Ads';
import stream from 'stream';

export const runtime = 'nodejs';
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const formData = await req.formData();

    const sellerId = formData.get('sellerId')?.toString();
    const title = formData.get('title')?.toString();
    const description = formData.get('description')?.toString() || '';
    const category = formData.get('category')?.toString();
    const country = formData.get('country')?.toString() || 'Unknown';
    const mediaType = formData.get('mediaType')?.toString();
    const file = formData.get('file') as File;

    if (!sellerId || !title || !category || !mediaType || !file) {
      console.error('❌ Missing required fields', { sellerId, title, category, mediaType, file });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('📥 Received upload request:', {
      name: file.name,
      type: file.type,
      size: file.size,
      mediaType,
    });

    // Convert File to Node.js readable stream
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const readable = stream.Readable.from(buffer);

    console.log('📤 Starting Cloudinary upload...');

    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto', // ✅ auto handles both image/video
          folder: 'novamax/ads',
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            return reject(error);
          }
          console.log('✅ Cloudinary result received.');
          resolve(result);
        }
      );

      readable.on('data', (chunk) => {
        console.log(`⬆️ Uploading chunk of ${chunk.length} bytes...`);
      });

      readable.on('end', () => {
        console.log('📦 Finished streaming to Cloudinary.');
      });

      readable.on('error', (err) => {
        console.error('❌ Readable stream error:', err);
        reject(err);
      });

      readable.pipe(uploadStream);
    });

    if (!uploadResult || !uploadResult.secure_url) {
      console.error('❌ Cloudinary returned invalid response:', uploadResult);
      return NextResponse.json({ error: 'Invalid Cloudinary response' }, { status: 500 });
    }

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

    console.log('🗄️ Ad saved to database:', newAd._id);

    return NextResponse.json({ ad: newAd }, { status: 201 });
  } catch (error: any) {
    console.error('🔥 Unexpected upload error:', error);
    return NextResponse.json(
      {
        error: 'Upload failed',
        details: error.message || JSON.stringify(error),
      },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
