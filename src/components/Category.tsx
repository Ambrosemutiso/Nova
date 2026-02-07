'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CldImage } from 'next-cloudinary';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { useCart } from '@/app/context/CartContext';
import { addToWishlist, isInWishlist } from '@/lib/wishlist';
import type { Product } from '@/app/types/product';

const LIMIT = 12;

const categoryBannerMap: Record<string, string> = {
  phones: '/Phones.jpg',
  laptops: '/Laptops.jpg',
};

type FetchResponse = {
  total: number;
  products: Product[];
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

  const [products, setProducts] = useState<Product[]>([]);
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

  const handleAddToCart = (product: Product) => {
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
                <div key={product._id} className="border p-4 rounded bg-white">
                  <Link href={`/product/${product.slug}`} className="block relative h-40 mb-2">
                    <CldImage
                      src={getPublicId(product.images?.[0]) || 'sample'}
                      alt={product.name}
                      width={300}
                      height={300}
                      crop="fill"
                      className="object-cover rounded"
                    />
                  </Link>

                  <h3 className="text-sm font-semibold truncate">{product.name}</h3>

                  <p className="text-red-600 font-bold">
                    Ksh. {product.calculatedPrice.toLocaleString()}
                  </p>

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
