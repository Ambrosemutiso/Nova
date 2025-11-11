'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CldImage } from 'next-cloudinary'; // Optional video optimization

type Ad = {
  _id: string;
  title: string;
  description: string;
  mediaUrl: string; // full Cloudinary URL stored in MongoDB
  mediaType: 'video' | 'image';
  category: string;
  sellerId: string;
  views: number;
};

export default function AdsFeedPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchAds() {
      const res = await fetch('/api/ads/list');
      const data = await res.json();
      if (data.ads) setAds(data.ads);
    }
    fetchAds();
  }, []);

  useEffect(() => {
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

  const handleView = async (adId: string) => {
    await fetch('/api/ads/list', { method: 'POST' });
  };

  const handleVisitSeller = (sellerId: string) => {
    router.push(`/seller/ad/${sellerId}`);
  };

  const getPublicId = (url: string) => {
    const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    return match ? match[1] : url;
  };

  return (
    <div className="relative w-full h-screen overflow-y-scroll snap-y snap-mandatory bg-black">
      {ads.map((ad, index) => (
        <div
          key={ad._id}
          className="h-screen flex flex-col justify-center items-center snap-start relative"
        >
          {/* Video ads */}
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
              muted
              playsInline
            />
          ) : (
            /* Image ads (Cloudinary-optimized) */
            <CldImage
              src={getPublicId(ad.mediaUrl)}
              alt={ad.title}
              width={1080}
              height={1920}
              crop="fill"
              className="w-full h-full object-cover"
            />
          )}

          {/* Overlay info */}
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
            <h2 className="text-xl font-bold">{ad.title}</h2>
            <p className="text-gray-200 text-sm mt-1">{ad.description}</p>
            <span className="text-orange-400 text-xs mt-2 block">#{ad.category}</span>

            <button
              onClick={() => handleVisitSeller(ad.sellerId)}
              className="mt-4 bg-orange-500 hover:bg-orange-600 transition-all duration-300 text-white px-5 py-2 rounded-full font-semibold shadow-lg"
            >
              🛍️ Visit Seller / Shop Now
            </button>
          </div>

          {/* Floating actions */}
          <div className="absolute right-4 bottom-28 flex flex-col items-center gap-5">
            <button className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition">❤️</button>
            <button className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition">💬</button>
            <button className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition">🔁</button>
          </div>
        </div>
      ))}
    </div>
  );
}
