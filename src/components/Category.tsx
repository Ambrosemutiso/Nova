//components/Category.tsx
'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CldImage } from 'next-cloudinary';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { useCart } from '@/app/context/CartContext';
import { addToWishlist, isInWishlist } from '@/lib/wishlist';
import type { ProductType } from "@/app/types/product";

const LIMIT = 12;

const categoryBannerMap: Record<string, string> = {
  phones: '/Phones.jpg',
  laptops: '/Laptops.jpg',
};

type FetchResponse = {
  total: number;
  products: ProductType[];
  brands: string[];
};

const fetchProducts = async (
  categorySlug: string,
  page: number,
  sort: string,
  brand: string,
  minPrice: string,
  maxPrice: string
): Promise<FetchResponse> => {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(LIMIT),
    sort,
  });

  if (brand) query.set('brand', brand);
  if (minPrice) query.set('minPrice', minPrice);
  if (maxPrice) query.set('maxPrice', maxPrice);

  const res = await fetch(`/api/products/category/${categorySlug}?${query}`);
  if (!res.ok) throw new Error('Failed to fetch products');

  return res.json();
};

const getPublicId = (url?: string): string => {
  if (!url) return '';
  const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
  return match?.[1] ?? '';
};

export default function CategoryPage() {
  const params = useParams<{ categorySlug?: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { addToCart, cartItems, increaseQuantity, decreaseQuantity } = useCart();

  const categorySlug = params.categorySlug ?? 'default';
  const bannerSrc = categoryBannerMap[categorySlug] ?? '/Electronics.jpg';

  const page = Number(searchParams.get('page') ?? 1);
  const sort = searchParams.get('sort') ?? 'name-asc';
  const brand = searchParams.get('brand') ?? '';
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';

  const [products, setProducts] = useState<ProductType[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const totalPages = Math.ceil(total / LIMIT);

  useEffect(() => {
    setLoading(true);

    fetchProducts(categorySlug, page, sort, brand, minPrice, maxPrice)
      .then(({ products, total, brands }) => {
        const lastPage = Math.max(1, Math.ceil(total / LIMIT));

        if (page > lastPage) {
          router.push(`/category/${categorySlug}?page=${lastPage}&sort=${sort}`);
          return;
        }

        setProducts(products);
        setTotal(total);
        setBrands(brands ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [categorySlug, page, sort, brand, minPrice, maxPrice, router]);

  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    value ? params.set(key, value) : params.delete(key);
    params.set('page', '1');

    router.push(`/category/${categorySlug}?${params}`);
  };

  const handleAddToCart = (product: ProductType) => {
    addToCart({
      id: product._id,
      productId: product._id,
      name: product.name,
      images: product.images ?? [],
      brand: product.brand,
      model: product.model,
      quantity: 1,
      calculatedPrice: product.calculatedPrice,
      fulfillmentMode: product.fulfillmentMode,
      sellerId: product.sellerId,
      county: product.county,
      town: product.town,
      weight: product.weight,
    });
  };

  const renderStars = (rating: number = 0) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="flex space-x-1 mb-1">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
          </svg>
        ))}
        {halfStar && (
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0z" />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
          </svg>
        ))}
      </div>
    );
  };

  const renderStockProgress = (quantity: number = 0) => {
    const max = 50;
    const percent = Math.min((quantity / max) * 100, 100);

    return (
      <div className="mt-1">
        <div className="text-xs text-gray-500 mb-1">Stock left: {quantity}</div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${percent}%` }}></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-6xl mx-auto px-4 pt-28 pb-10">

        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/">Home</Link>
          <ChevronRight className="mx-2 w-4 h-4" />
          <Link href="/shop">Shop</Link>
          <ChevronRight className="mx-2 w-4 h-4" />
          <span className="capitalize font-semibold text-gray-700">
            {categorySlug}
          </span>
        </nav>

        {/* Banner */}
        <div className="relative w-full h-44 mb-6 rounded-lg overflow-hidden">
          <Image src={bannerSrc} alt="Category banner" fill className="object-cover" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6 bg-white p-4 rounded-lg shadow-sm">
          <select
            value={brand}
            onChange={(e) => updateQuery('brand', e.target.value)}
            className="border px-3 py-2 rounded text-sm"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => updateQuery('minPrice', e.target.value)}
            className="border px-3 py-2 rounded text-sm w-28"
          />

          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => updateQuery('maxPrice', e.target.value)}
            className="border px-3 py-2 rounded text-sm w-28"
          />

          <select
            value={sort}
            onChange={(e) => updateQuery('sort', e.target.value)}
            className="border px-3 py-2 rounded text-sm ml-auto"
          >
            <option value="name-asc">Name (A–Z)</option>
            <option value="name-desc">Name (Z–A)</option>
            <option value="price-asc">Price (Low–High)</option>
            <option value="price-desc">Price (High–Low)</option>
          </select>
        </div>

        {/* Products */}
        {loading ? (
          <p className="text-center py-12">Loading products…</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => {
              const cartItem = cartItems.find(i => i.id === product._id);
              const inWishlist = isInWishlist(product._id);

              return (
<div
  key={product._id}
  className="border p-4 rounded bg-white flex flex-col"
>
  <Link
    href={`/product/${product.slug}`}
    className="block relative aspect-square w-full mb-2 overflow-hidden"
  >
    <CldImage
      src={getPublicId(product.images?.[0]) || 'sample'}
      alt={product.name}
      width={300}
      height={300}
      crop="fill"
      className="object-cover rounded w-full h-full"
    />
  </Link>

  <div className="flex flex-col flex-grow">
    <h3 className="text-sm font-semibold line-clamp-2">
      {product.name}
    </h3>

    {renderStars(product.rating || 4)}
    {renderStockProgress(product.quantity)}

    <p className="text-red-600 font-bold mt-auto">
      Ksh. {product.calculatedPrice.toLocaleString()}
    </p>
</div>
                  <div className="flex gap-2 mt-2">
                    {cartItem ? (
                      <>
                        <button onClick={() => decreaseQuantity(product._id)}>-</button>
                        <span>{cartItem.quantity}</span>
                        <button onClick={() => increaseQuantity(product._id)}>+</button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="bg-orange-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Add to Cart
                      </button>
                    )}

                    <button onClick={() => addToWishlist(product)}>
                      {inWishlist ? '❤️' : '🤍'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }).map((_, i) => (
              <Link
                key={i}
                href={`/category/${categorySlug}?page=${i + 1}&sort=${sort}&brand=${brand}&minPrice=${minPrice}&maxPrice=${maxPrice}`}
                className={`px-3 py-1 border rounded ${
                  page === i + 1 ? 'bg-orange-500 text-white' : 'bg-white'
                }`}
              >
                {i + 1}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}