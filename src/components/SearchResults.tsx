// app/search/SearchResults.tsx
'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/app/types/product';
import { Player } from '@lottiefiles/react-lottie-player';
import Loader from '@/components/Loader';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="pt-24 px-4 min-h-screen bg-red-100">
      <h1 className="text-2xl font-semibold mb-6 text-center">
        Search Results for <span className="text-orange-600">&quot;{query}&quot;</span>
      </h1>

      {loading ? (
        <Loader />
      ) : results.length === 0 ? (
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
        <div className="flex flex-wrap gap-4 justify-center">
          {results.map((product) => (
            <div key={product._id} className="w-[48%] sm:w-[48%] md:w-[31%] lg:w-[23%] xl:w-[18%]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
