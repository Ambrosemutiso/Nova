'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CldImage } from 'next-cloudinary';
import { FaRegCommentAlt, FaRegHeart, FaShare } from 'react-icons/fa';

type Ad = {
  _id: string;
  title: string;
  description?: string;
  mediaUrl: string; // full Cloudinary URL stored in MongoDB
  mediaType: 'video' | 'image';
  category?: string;
  sellerId: string;
  views?: number;
};

export default function AdsFeedPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const router = useRouter();

  // ✅ Fetch ads and merge seller + others
  useEffect(() => {
    async function fetchAds() {
      try {
        const res = await fetch('/api/ads/list');
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const merged = [...(data.sellerAds || []), ...(data.otherAds || [])];
        setAds(merged);
      } catch (err) {
        console.error('❌ Failed to fetch ads:', err);
      }
    }
    fetchAds();
  }, []);

  // ✅ Auto play/pause videos when in viewport
  useEffect(() => {
    if (!ads.length) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play();
            handleView(video.dataset.id!);
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.6 }
    );

    videoRefs.current.forEach(v => observer.observe(v));
    return () => videoRefs.current.forEach(v => observer.unobserve(v));
  }, [ads]);

  // ✅ Increment ad views
  const handleView = async (adId: string) => {
    try {
      await fetch('/api/ads/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId }),
      });
    } catch (err) {
      console.warn('⚠️ View tracking failed:', err);
    }
  };

  // ✅ Go to seller page
  const handleVisitSeller = (sellerId: string) => {
    router.push(`/seller/ad/${sellerId}`);
  };

  // ✅ Extract Cloudinary public ID safely
  const getPublicId = (url: string) => {
    const parts = url.split('/upload/');
    if (parts.length < 2) return url;
    return parts[1].split('.')[0];
  };

  return (
    <div className="relative w-full h-screen overflow-y-scroll snap-y snap-mandatory bg-black">
      {ads.map((ad, index) => (
        <div
          key={ad._id}
          className="h-screen flex flex-col justify-center items-center snap-start relative"
        >
          {/* Media content */}
          {ad.mediaType === 'video' ? (
            <video
              ref={el => {
                if (el) videoRefs.current[index] = el;
              }}
              data-id={ad._id}
              src={ad.mediaUrl}
              className="w-full h-full object-cover"
              controls={false}
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

          {/* Bottom overlay info */}
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-6 text-white">
            <h2 className="text-xl font-bold">{ad.title}</h2>
            {ad.description && (
              <p className="text-gray-200 text-sm mt-1 line-clamp-2">{ad.description}</p>
            )}
            {ad.category && (
              <span className="text-orange-400 text-xs mt-2 block">#{ad.category}</span>
            )}

            <button
              onClick={() => handleVisitSeller(ad.sellerId)}
              className="mt-4 bg-orange-500 hover:bg-orange-600 transition-all duration-300 text-white px-5 py-2 rounded-full font-semibold shadow-lg"
            >
              🛍️ Visit Seller / Shop Now
            </button>
          </div>

          {/* Floating reaction buttons */}
          <div className="absolute right-4 bottom-28 flex flex-col items-center gap-5">
            <button className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition">
              <FaRegHeart/>
            </button>
            <button className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition">
              <FaRegCommentAlt/>
            </button>
            <button className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition">
              <FaShare/>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
