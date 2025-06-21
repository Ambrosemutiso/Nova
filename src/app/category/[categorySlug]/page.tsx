'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CldImage } from 'next-cloudinary';
import { useCart } from '@/app/context/CartContext';
import { addToWishlist, isInWishlist } from '@/lib/wishlist';
import type { Product } from '@/app/types/product';
import { ChevronRight } from 'lucide-react';

const LIMIT = 12;

const categoryBannerMap: Record<string, string> = {
  phones: '/Phones.jpg',
  laptops: '/Laptops.jpg',
};

const fetchProducts = async (
  categorySlug: string,
  page: number,
  sort: string
): Promise<{ total: number; products: Product[] }> => {
  const res = await fetch(`/api/products/category/${categorySlug}?page=${page}&limit=${LIMIT}&sort=${sort}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
};

const getPublicId = (url?: string) => {
  if (!url || typeof url !== 'string') return '';
  const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
  return match ? match[1] : url;
};

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart, cartItems, increaseQuantity, decreaseQuantity } = useCart();

  const categorySlug = params.categorySlug as string;
  const safeCategory = categorySlug || 'default';
  const bannerSrc = categoryBannerMap[safeCategory] || '/Electronics.jpg';

  const page = parseInt(searchParams.get('page') || '1');
  const sort = searchParams.get('sort') || 'name-asc';

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const totalPages = Math.ceil(total / LIMIT);

  useEffect(() => {
    setLoading(true);
    fetchProducts(safeCategory, page, sort)
      .then(({ products, total }) => {
        const lastPage = Math.ceil(total / LIMIT);
        if (page > lastPage && lastPage > 0) {
          router.push(`/category/${safeCategory}?page=${lastPage}&sort=${sort}`);
        } else {
          setProducts(products);
          setTotal(total);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [safeCategory, page, sort, router]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`/category/${safeCategory}?page=1&sort=${e.target.value}`);
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product._id,
      name: product.name,
      images: product.images,
      county: product.county,
      model: product.model,
      brand: product.brand,
      calculatedPrice: product.calculatedPrice,
      quantity: 1,
    });
  };

  const renderStars = (rating: number = 0) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="flex space-x-1 mb-1">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
          </svg>
        ))}
        {halfStar && (
          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
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
          <div
            className="bg-orange-500 h-2 rounded-full"
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="md:px-8 lg:px-16 max-w-6xl mx-auto px-4 pt-28 pb-10">
                  {/* Breadcrumb */}
                    <div className="mb-6 overflow-x-auto">
                      <nav className="flex items-center text-sm text-gray-500 whitespace-nowrap flex-nowrap gap-1 px-1">
                        <span>Home</span>
                        <ChevronRight className="mx-2 h-4 w-4 shrink-0" />
                        <span>Shop</span>
                        <ChevronRight className="mx-2 h-4 w-4 shrink-0" />
                        <span>Products</span>
                        <ChevronRight className="mx-2 h-4 w-4 shrink-0" />
                        <span className="text-orange-700 font-medium">{safeCategory}</span>
                        </nav>
                      </div>
      <div className="w-full h-40 rounded-md mb-6 overflow-hidden relative">
        <Image src={bannerSrc} alt={`${safeCategory} banner`} fill className="object-cover" />
      </div>

      <div className="flex justify-end mb-4">
        <select
          value={sort}
          onChange={handleSortChange}
          className="border border-gray-300 px-3 py-2 rounded-md text-sm"
        >
          <option value="name-asc">Name (A–Z)</option>
          <option value="name-desc">Name (Z–A)</option>
          <option value="price-asc">Price (Low to High)</option>
          <option value="price-desc">Price (High to Low)</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-600">Loading products...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {products.map((product) => {
            const inWishlist = isInWishlist(product._id);
            return (
              <div key={product._id} className="border p-4 rounded-md bg-white shadow-sm">
                <div
                  onClick={() => router.push(`/product/${product._id}`)}
                  className="cursor-pointer mb-2 w-full h-40 relative"
                >
                  <CldImage
                    src={getPublicId(product.images?.[0]) || '/Electronics.jpg'}
                    alt={product.name}
                    width={300}
                    height={300}
                    crop="fill"
                    className="w-full h-full object-cover rounded"
                  />
                </div>

                <h3 className="text-sm font-semibold text-gray-800 truncate mb-1">{product.name}</h3>

                {renderStars(product.rating || 4)}

                {renderStockProgress(product.quantity)}

                <span className="text-gray-500 line-through text-sm">Ksh.{product.oldPrice}</span>
                <span className="text-red-600 font-bold block">Ksh.{product.calculatedPrice}</span>

                <div className="flex gap-2 mt-2">
                  {(() => {
                    const cartItem = cartItems.find((item) => item.id === product._id);
                    return cartItem ? (
                      <div className="flex items-center gap-2 w-full">
                        <button
                          onClick={() => decreaseQuantity(product._id)}
                          className="bg-gray-200 px-2 py-1 rounded text-sm font-bold"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 bg-orange-100 text-orange-600 font-semibold rounded-full text-sm">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => increaseQuantity(product._id)}
                          className="bg-gray-200 px-2 py-1 rounded text-sm font-bold"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 bg-orange-500 text-white text-sm py-1 rounded hover:bg-orange-600"
                      >
                        Add to Cart
                      </button>
                    );
                  })()}

                  <button
                    onClick={() => addToWishlist(product)}
                    className={`text-sm px-3 py-1 rounded ${
                      inWishlist ? 'bg-red-100 text-red-500' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {inWishlist ? '❤️' : '🤍'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <a
            key={i}
            href={`?page=${i + 1}&sort=${sort}`}
            className={`px-3 py-1 border rounded-md ${
              page === i + 1 ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'
            }`}
          >
            {i + 1}
          </a>
        ))}
      </div>
    </div>
  );
}
