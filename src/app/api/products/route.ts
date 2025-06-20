import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Product from '@/app/models/product';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const formData = await request.formData();
    const name = formData.get('name')?.toString();
    const price = parseFloat(formData.get('price')?.toString() || '0');
    const oldPrice = parseFloat(formData.get('oldPrice')?.toString() || '0');
    const calculatedPrice = parseFloat(formData.get('calculatedPrice')?.toString() || '0');
    const description = formData.get('description')?.toString();
    const quantity = formData.get('quantity')?.toString()||('0');
    const category = formData.get('category')?.toString();
    const sellerId = formData.get('sellerId')?.toString();
    const county = formData.get('county')?.toString();
    const town = formData.get('town')?.toString();
    const brand = formData.get('brand')?.toString();
    const model = formData.get('model')?.toString();
    const material = formData.get('material')?.toString();
    const dimensions = formData.get('dimensions')?.toString();
    const color = formData.get('color')?.toString();
    const keyFeatures = formData.get('keyFeatures')?.toString();
    const boxContents = formData.get('boxContents')?.toString();
    const warranty = formData.get('warranty')?.toString();
    const weight = formData.get('weight')?.toString();
                                    

    if (!name || !price || !category || !sellerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Handle image uploads
    const images: string[] = [];
    const files = formData.getAll('images') as Blob[];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());

      try {
        const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${buffer.toString('base64')}`, {
          folder: 'products',
        });

        // Remove the version number from the URL before saving
        const cleanedUrl = result.secure_url.replace(/\/v\d+\//, '/');
        images.push(cleanedUrl);
      } catch (err) {
        console.error('❌ Image upload failed:', err);
        return NextResponse.json({ error: 'Image upload failed' }, { status: 500 });
      }
    }

    const newProduct = new Product({
      name,
      price,
      oldPrice,
      calculatedPrice,
      description,
      category,
      quantity,
      sellerId,
      county,
      town,
      images,
      brand,
      model,
      material,
      color,
      keyFeatures,
      boxContents,
      warranty,
      dimensions,
      weight
    });

    await newProduct.save();

    return NextResponse.json(
      { message: 'Product created successfully', product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
