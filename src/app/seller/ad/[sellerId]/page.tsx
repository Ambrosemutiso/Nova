'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { CldImage} from 'next-cloudinary';

type Ad = {
  _id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'video' | 'image';
  views: number;
  category: string;
};

type Seller = {
  _id: string;
  name: string;
  logoUrl?: string;
  country?: string;
  bio?: string;
};

export default function SellerPage() {
  const { sellerId } = useParams();
  const router = useRouter();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

  useEffect(() => {
    async function fetchSeller() {
      try {
        const res = await fetch(`/api/seller/${sellerId}`);
        const data = await res.json();
        setSeller(data.seller || null);

        const adsRes = await fetch(`/api/ads/list?sellerId=${sellerId}`);
        const adsData = await adsRes.json();
        setAds(adsData.ads || []);
      } catch (err) {
        console.error('Error loading seller data', err);
      } finally {
        setLoading(false);
      }
    }

    if (sellerId) fetchSeller();
  }, [sellerId]);

    const getPublicId = (url: string) => {
    const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    return match ? match[1] : url;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 text-gray-600">
        Loading seller info...
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 text-gray-600">
        Seller not found
      </div>
    );
  }

  return (
    <div className="md:ml-64 max-w-2xl p-6 mx-auto px-4 pt-28 pb-10 min-h-screen bg-white text-gray-800 relative">
      {/* Seller Header */}
      <div className="flex flex-col items-center text-center pt-10 px-6">
        {seller.logoUrl ? (
          <Image
            src={seller.logoUrl}
            alt={seller.name}
            width={100}
            height={100}
            className="rounded-full shadow-md border-4 border-orange-500 object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-bold text-gray-600 shadow-md">
            {seller.name.charAt(0)}
          </div>
        )}
        <h1 className="text-2xl font-bold mt-4 text-black">{seller.name}</h1>
        {seller.country && <p className="text-sm text-gray-500">{seller.country}</p>}
        {seller.bio && <p className="text-gray-600 text-sm mt-2 max-w-md">{seller.bio}</p>}
      </div>

      {/* Stats */}
      <div className="flex justify-center mt-4 text-gray-600">
        <div className="flex gap-6 text-sm">
          <div className="text-center">
            <span className="block font-bold text-black">{ads.length}</span>
            <span>Ads</span>
          </div>
          <div className="text-center">
            <span className="block font-bold text-black">
              {ads.reduce((a, b) => a + (b.views || 0), 0)}
            </span>
            <span>Views</span>
          </div>
        </div>
      </div>

      {/* Ads Grid */}
      <div className="mt-8 px-4 pb-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {ads.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">
            No ads available yet.
          </p>
        ) : (
          ads.map(ad => (
            <div
              key={ad._id}
              onClick={() => setSelectedAd(ad)}
              className="relative bg-black rounded-xl overflow-hidden shadow-md group cursor-pointer"
            >
              {ad.mediaType === 'video' ? (
                <video
                  src={ad.mediaUrl}
                  className="w-full h-60 object-cover group-hover:opacity-80 transition"
                  muted
                  loop
                  playsInline
                />
              ) : (
            <CldImage
              src={getPublicId(ad.mediaUrl)}
              alt={ad.title}
              width={1080}
              height={1920}
              crop="fill"
              className="w-full h-full object-cover"
            />
              )}

              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white">
                <h3 className="text-sm font-semibold truncate">{ad.title}</h3>
                <p className="text-xs text-gray-300 truncate">{ad.views} views</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Full-Screen Modal Viewer */}
      {selectedAd && (
        <div
          className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50"
          onClick={() => setSelectedAd(null)}
        >
          <div
            className="relative max-w-md w-full h-[80vh] bg-black rounded-xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {selectedAd.mediaType === 'video' ? (
              <video
                src={selectedAd.mediaUrl}
                className="w-full h-full object-contain"
                autoPlay
                controls
              />
            ) : (
              <Image
                src={selectedAd.mediaUrl}
                alt={selectedAd.title}
                width={400}
                height={300}
                className="w-full h-full object-contain"
              />
            )}

            {/* Overlay Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5 text-white">
              <h2 className="text-lg font-bold">{selectedAd.title}</h2>
              <p className="text-sm text-gray-200 mt-1 line-clamp-2">{selectedAd.description}</p>
              <p className="text-xs text-orange-400 mt-1">#{selectedAd.category}</p>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => router.push(`/seller/${sellerId}`)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-md transition"
                >
                  🛍️ Shop Now
                </button>
                <button
                  onClick={() => setSelectedAd(null)}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-full text-sm"
                >
                  ✕ Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
