import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Product from '@/app/models/product';
import cloudinary from '@/lib/cloudinary';
import Notification from '@/app/models/notification';
import Seller from '@/app/models/seller';
import type { Follower } from '@/app/types/follower';
import slugify from 'slugify';
import { submitToIndexNow } from '@/lib/indexNow';

async function generateUniqueSlug(name: string) {
  const baseSlug = slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });

  let slug = baseSlug;
  let counter = 1;

  while (await Product.exists({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// 🔹 Define plan product limits
const PLAN_LIMITS: Record<string, number> = {
  free: 50,
  basic: 500,
  premium: 1000,
};

/* --------------------------------------------
   🟢 POST: Create a New Product
-------------------------------------------- */
export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const formData = await request.formData();
    const name = formData.get('name')?.toString();
    const price = parseFloat(formData.get('price')?.toString() || '0');
    const oldPrice = parseFloat(formData.get('oldPrice')?.toString() || '0');
    const calculatedPrice = parseFloat(formData.get('calculatedPrice')?.toString() || '0');
    const description = formData.get('description')?.toString();
    const quantity = formData.get('quantity')?.toString() || '0';
    const category = formData.get('category')?.toString();
    const subcategory = formData.get('subcategory')?.toString();
    const productType = formData.get('productType')?.toString();
    const sellerId = formData.get('sellerId')?.toString();
    const county = formData.get('county')?.toString();
    const town = formData.get('town')?.toString();
    const brand = formData.get('brand')?.toString();
    const model = formData.get('model')?.toString();
    const material = formData.get('material')?.toString();
    const dimensions = formData.get('dimensions')?.toString();
    const color = formData.get('color')?.toString();
    const keyFeatures = JSON.parse(formData.get('keyFeatures')?.toString() || '[]');
    const boxContents = JSON.parse(formData.get('boxContents')?.toString() || '[]');
    const warranty = formData.get('warranty')?.toString();
    const weight = formData.get('weight')?.toString();
    const fulfillmentMode = formData.get('fulfillmentMode')?.toString();
    const currency = formData.get('currency')?.toString();

    if (!name || !price || !category || !sellerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 🔹 Fetch seller from DB
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    // 🔹 Determine seller plan and limit
    const planType = seller.shop?.plan || 'free';
    const planLimit = PLAN_LIMITS[planType] || PLAN_LIMITS.free;

    // 🔹 Count seller's existing products
    const currentProductCount = await Product.countDocuments({ sellerId });

    if (currentProductCount >= planLimit) {
      return NextResponse.json(
        {
          error: `You’ve reached your ${planType.toUpperCase()} plan limit of ${planLimit} products. Upgrade to add more.`,
        },
        { status: 403 }
      );
    }

    // 🔹 Handle image uploads
    const images: string[] = [];
    const files = formData.getAll('images') as Blob[];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());

      try {
        const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${buffer.toString('base64')}`, {
          folder: 'products',
        });

        // Remove version number from Cloudinary URL
        const cleanedUrl = result.secure_url.replace(/\/v\d+\//, '/');
        images.push(cleanedUrl);
      } catch (err) {
        console.error('❌ Image upload failed:', err);
        return NextResponse.json({ error: 'Image upload failed' }, { status: 500 });
      }
    }
    // 🔹 Generate SEO-friendly unique slug
const slug = await generateUniqueSlug(name);

    // 🔹 Create new product
    const newProduct = new Product({
      name,
      slug,
      price,
      oldPrice,
      calculatedPrice,
      description,
      category,
      subcategory,
      productType,
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
      weight,
      fulfillmentMode,
      currency,
    });

    await newProduct.save();

// 🔹 Build product URL using the slug
const productUrl = `https://novaxmax.com/product/${slug}`;

// 🔹 Submit to IndexNow
await submitToIndexNow([productUrl]);


    // 🔔 Notify followers
    try {
      const sellerWithFollowers = await Seller.findById(sellerId).populate('followers.userId', 'name');

      if (sellerWithFollowers?.followers?.length) {
        const notifications = sellerWithFollowers.followers.map((follower: Follower) => ({
          type: 'new_product',
          sender: sellerWithFollowers._id,
          recipient: follower.userId._id,
          message: `🛒 ${sellerWithFollowers.shopName || sellerWithFollowers.name} just added a new product: ${name}`,
        }));

        await Notification.insertMany(notifications);
      }
    } catch (notifError) {
      console.error('❌ Failed to send notifications to followers:', notifError);
    }

    return NextResponse.json(
      { message: '✅ Product created successfully', product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

/* --------------------------------------------
   🟣 GET: Fetch Seller Product Stats
-------------------------------------------- */
export async function GET(request: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const sellerId = searchParams.get('sellerId');

  if (!sellerId) {
    return NextResponse.json({ error: 'Missing sellerId' }, { status: 400 });
  }

  try {
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    const planType = seller.shop?.plan || 'free';
    const planLimit = PLAN_LIMITS[planType] || PLAN_LIMITS.free;

    const productCount = await Product.countDocuments({ sellerId });
    const remainingSlots = Math.max(planLimit - productCount, 0);

    return NextResponse.json({
      sellerId,
      planType,
      planLimit,
      productCount,
      remainingSlots,
      message: `You’ve added ${productCount} of ${planLimit} products (${remainingSlots} remaining).`,
    });
  } catch (error) {
    console.error('❌ Error fetching product stats:', error);
    return NextResponse.json({ error: 'Failed to fetch product stats' }, { status: 500 });
  }
}
