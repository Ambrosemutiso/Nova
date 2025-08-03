'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/app/types/product';
import { Player } from '@lottiefiles/react-lottie-player';
import Loader from '@/components/Loader';
import Link from 'next/link';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Product[]>([]);
  const [filteredResults, setFilteredResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const PRODUCTS_PER_PAGE = 12;

  useEffect(() => {
    if (query.trim()) {
      const fetchResults = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          const data = await response.json();
          setResults(data.products || []);
        } catch (err) {
          console.error('Search error:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchResults();
    }
  }, [query]);

  // Filter, Sort, and Paginate
  useEffect(() => {
    let filtered = [...results];

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Price filter
    if (minPrice) filtered = filtered.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) filtered = filtered.filter((p) => p.price <= Number(maxPrice));

    // Sort
    if (sortOption === 'lowToHigh') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'highToLow') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    setFilteredResults(filtered);
    setCurrentPage(1); // reset to page 1 on filter/sort change
  }, [results, selectedCategory, minPrice, maxPrice, sortOption]);

  const categories = [...new Set(results.map((p) => p.category))];
  const totalPages = Math.ceil(filteredResults.length / PRODUCTS_PER_PAGE);
  const paginated = filteredResults.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);

  return (
    <div className="pt-24 px-4 min-h-screen bg-white">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-4">
        <Link href="/" className="hover:underline">Home</Link> &gt;{' '}
        <Link href="/products" className="hover:underline">All Products</Link> &gt;{' '}
        <span className="text-orange-600 font-medium">{query}</span>
      </nav>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        {/* Category */}
        <select
          className="border border-gray-300 rounded px-4 py-2"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Price Range */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="border rounded px-2 py-1 w-24"
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="border rounded px-2 py-1 w-24"
          />
        </div>

        {/* Sort */}
        <select
          className="border border-gray-300 rounded px-4 py-2"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="">Sort By</option>
          <option value="lowToHigh">Price: Low to High</option>
          <option value="highToLow">Price: High to Low</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {/* Results */}
      {loading ? (
        <Loader />
      ) : paginated.length === 0 ? (
        <div className="text-center text-gray-500 mt-10 flex flex-col items-center">
          <Player
            autoplay
            loop
            src="/lottie/Animation - 1749150445624.lottie"
            style={{ height: '300px', width: '300px' }}
          />
          <p className="mt-4 text-lg">No products found for &quot;{query}&quot;.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-4 justify-center">
            {paginated.map((product) => (
              <div key={product._id} className="w-[48%] sm:w-[48%] md:w-[31%] lg:w-[23%] xl:w-[18%]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded border ${
                    currentPage === i + 1 ? 'bg-orange-600 text-white' : 'bg-white text-gray-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
