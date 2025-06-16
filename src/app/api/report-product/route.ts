import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { dbConnect } from '@/lib/dbConnect';
import { Report } from '@/app/models/report';
import { writeFile } from 'fs/promises';
import path from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

cloudinary.config({
  cloud_name: 'your_cloud_name',
  api_key: 'your_api_key',
  api_secret: 'your_api_secret',
});

export async function POST(req: NextRequest) {
  await dbConnect();
  const formData = await req.formData();

  const productId = formData.get('productId') as string;
  const userId = formData.get('userId') as string;
  const reason = formData.get('reason') as string;
  const message = formData.get('message') as string;
  const screenshot = formData.get('screenshot') as File | null;

  let imageUrl = '';

  if (screenshot) {
    const arrayBuffer = await screenshot.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `${randomUUID()}-${screenshot.name}`;
    const tmpPath = path.join(tmpdir(), filename);
    await writeFile(tmpPath, buffer);

    const uploadResult = await cloudinary.uploader.upload(tmpPath);
    imageUrl = uploadResult.secure_url;
  }

  await Report.create({
    productId,
    userId,
    reason,
    message,
    screenshot: imageUrl,
    createdAt: new Date(),
  });

  return NextResponse.json({ message: 'Report submitted' }, { status: 200 });
}
