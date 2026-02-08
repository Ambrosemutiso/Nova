import Product from "@/app/models/product";
import { dbConnect } from "@/lib/dbConnect";

export default async function sitemap() {
  await dbConnect();

  const products = await Product.find({}, "slug updatedAt").lean();

  const productUrls = products.map((product) => ({
    url: `https://novaxmax.com/product/${product.slug}`,
    lastModified: product.updatedAt || new Date(),
  }));

  return [
    {
      url: "https://novaxmax.com",
      lastModified: new Date(),
    },
    {
      url: "https://novaxmax.com/products",
      lastModified: new Date(),
    },
    ...productUrls,
  ];
}
