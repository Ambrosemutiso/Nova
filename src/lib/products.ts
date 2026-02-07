import { dbConnect } from '@/lib/dbConnect';
import Product from '@/app/models/product';

export async function getAllProducts() {
  await dbConnect();

  const products = await Product.find(
    { slug: { $exists: true, $ne: '' } }, // only valid slugs
    { slug: 1, updatedAt: 1 }
  ).lean();

  return products.map((product) => ({
    slug: product.slug,
    updatedAt: product.updatedAt ?? new Date(),
  }));
}
