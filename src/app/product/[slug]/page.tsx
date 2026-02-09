import type { Metadata } from "next";
import Product from "@/app/models/product";
import { dbConnect } from "@/lib/dbConnect";
import ProductDetails from "@/components/Product";
import type { ProductType } from "@/app/types/product";

type PageProps = {
  params: { slug: string };
};

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  await dbConnect();

  const product = (await Product
    .findOne({ slug: params.slug })
    .lean()) as ProductType | null;

  if (!product) {
    return {
      title: "Product not found | NovaXmax",
      description: "This product does not exist or was removed.",
    };
  }

  const title = `${product.name} | Buy Online in Kenya | NovaXmax`;

  const description =
    product.description
      ?.replace(/<[^>]*>/g, "")
      .slice(0, 160) ||
    "Shop quality products on NovaXmax with fast delivery across Kenya.";

  const image =
    product.images?.[0] || "https://novaxmax.com/og-default.png";

  const url = `https://novaxmax.com/product/${product.slug}`;

  const keywords: string[] = [
    product.name,
    product.brand ?? "",
    product.category ?? "",
    "NovaXmax",
    "Buy online Kenya",
    "Ecommerce Kenya",
  ].filter((k): k is string => Boolean(k));

  return {
    title,
    description,
    keywords,

    openGraph: {
      title,
      description,
      url,
      siteName: "NovaXmax",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },

    alternates: {
      canonical: url,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  await dbConnect();

  const product = (await Product
    .findOne({ slug: params.slug })
    .lean()) as ProductType | null;

  if (!product) {
    return <div>Product not found</div>;
  }

  return <ProductDetails product={product} />;
}