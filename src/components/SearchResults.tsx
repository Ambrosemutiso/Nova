'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/app/types/product';
import Loader from '@/components/Loader';
import RecentlyViewed from './RecentlyViewed';
import TopPicksForYou from './TopPicksForYou';
import SuggestedForYou from './SuggestedForYou';
import SponsoredProducts from './SponsoredProducts';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [sort, setSort] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    if (query.trim()) {
      const fetchResults = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          const products = data.products || [];
          setResults(products);

          const categories = [...new Set(products.map((p: Product) => p.category).filter(Boolean))];
          setAvailableCategories(categories as string[]);
        } catch (err) {
          console.error('Search error:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchResults();
    }
  }, [query]);

  useEffect(() => {
    let filteredData = [...results];

    if (category && category !== 'All') {
      filteredData = filteredData.filter(
        (p) => p.category?.toLowerCase() === category.toLowerCase()
      );
    }

    if (minPrice) {
      filteredData = filteredData.filter((p) => p.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
      filteredData = filteredData.filter((p) => p.price <= parseFloat(maxPrice));
    }

    if (sort === 'price-asc') {
      filteredData.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      filteredData.sort((a, b) => b.price - a.price);
    } else if (sort === 'name') {
      filteredData.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFiltered(filteredData);
    setPage(1);
  }, [results, category, sort, minPrice, maxPrice]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const displayedItems = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="pt-24 px-4 min-h-screen bg-white">
      <nav className="text-sm text-gray-600 mb-4">
        <span>Home</span> &gt; <span>All Products</span> &gt;{' '}
        <span className="text-gray-600 font-medium">{query}</span>
      </nav>

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 rounded-md w-40"
        >
          <option value="">All Categories</option>
          {availableCategories.map((cat, idx) => (
            <option key={idx} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="border p-2 rounded-md w-32"
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="border p-2 rounded-md w-32"
        />
        <select
          onChange={(e) => setSort(e.target.value)}
          className="border p-2 rounded-md w-40"
        >
          <option value="">Sort</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name</option>
        </select>
      </div>

      {/* Loader / Results */}
      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          No products found for &quot;{query}&quot;.
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-4 justify-center">
            {displayedItems.map((product) => (
              <div
                key={product._id}
                className="w-[48%] sm:w-[48%] md:w-[31%] lg:w-[23%] xl:w-[18%]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Extras */}
      <SponsoredProducts />
      <RecentlyViewed />
      <TopPicksForYou />
      <SuggestedForYou />
    </div>
  );
}
