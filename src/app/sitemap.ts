import { getAllProducts } from '@/lib/products';

export default async function sitemap() {
  const products = await getAllProducts();

  return [
    {
      url: 'https://novaxmax.com',
      lastModified: new Date(),
    },
    ...products.map((product) => ({
      url: `https://novaxmax.com/product/${product.slug}`,
      lastModified: product.updatedAt,
    })),
  ];
}
