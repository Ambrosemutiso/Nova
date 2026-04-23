'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import type { ProductType } from '@/app/types/product';
import { Section } from '@/components/SectionWrapper';

export default function FullDescriptionPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/product/products/${slug}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();
        setProduct(data.product);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-10 h-10 border-4 border-orange-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-700">
        <p className="text-lg font-medium">Product not found</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-full hover:bg-orange-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-6xl mx-auto px-4 pt-28 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      {/* Description Section */}
      <Section>
      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 border-b pb-2 mb-3">
          Full Description
        </h2>
        <div
          className="prose max-w-none text-gray-700"
          dangerouslySetInnerHTML={{
            __html: product.description || '<p>No description available.</p>',
          }}
        />
      </div>
      </Section>

      {/* Key Features */}
      {Array.isArray(product.keyFeatures) && product.keyFeatures.length > 0 && (
        <Section>
        <div className="mt-6 bg-white shadow-md rounded-xl p-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 border-b pb-2 mb-3">
            Key Features
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {product.keyFeatures.map((feature, i) => (
              <li key={i}>{feature}</li>
            ))}
          </ul>
        </div>
        </Section>
      )}

      {/* Box Contents */}
      {Array.isArray(product.boxContents) && product.boxContents.length > 0 && (
        <Section>
        <div className="mt-6 bg-white shadow-md rounded-xl p-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 border-b pb-2 mb-3">
            What&apos;s in the Box
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {product.boxContents.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
        </Section>
      )}
    </div>
    </div>
  );
}
