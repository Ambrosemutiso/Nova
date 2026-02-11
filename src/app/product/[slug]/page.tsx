import type { Metadata } from 'next';
import Product from '@/app/models/product';
import { dbConnect } from '@/lib/dbConnect';
import ProductDetails from '@/components/Product';
import type { ProductType } from '@/app/types/product';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {

  const { slug } = await params; // ✅ unwrap params

  await dbConnect();

  const product = await Product
    .findOne({ slug })
    .lean<ProductType | null>();

  if (!product) {
    return {
      title: 'Product not found | NovaXmax',
      description: 'This product does not exist or was removed.',
      robots: { index: false },
    };
  }

  const cleanDescription =
    product.description?.replace(/<[^>]*>/g, '').slice(0, 160) ??
    `Buy ${product.name} online in Kenya on NovaXmax`;

  const image =
    product.images?.[0] ??
    'https://novaxmax.com/og-default.png';

  const url = `https://novaxmax.com/product/${product.slug}`;

  return {
    title: `${product.name} | Buy Online in Kenya`,
    description: cleanDescription,
    alternates: { canonical: url },

    openGraph: {
      title: product.name,
      description: cleanDescription,
      url,
      siteName: 'NovaXmax',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: 'website',
    },

    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: cleanDescription,
      images: [image],
    },
  };
}

export default async function ProductPage() {
  return <ProductDetails />;
}
