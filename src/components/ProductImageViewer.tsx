'use client';

import { useState, useRef } from 'react';
import { CldImage } from 'next-cloudinary';
import {
  Eye,
  Heart,
  Share2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

const ProductImageViewer = ({
  images,
  name,
}: {
  images: string[];
  name: string;
}) => {
  const [wishlist, setWishlist] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const toggleWishlist = () => setWishlist(!wishlist);
  const toggleZoom = () => setZoomed(!zoomed);

  const getPublicId = (url?: string) => {
    if (!url || typeof url !== 'string') return '';
    const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    return match ? match[1] : url;
  };

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
const handleScroll = () => {
  const container = scrollContainerRef.current;
  if (!container) return;

  const containerCenter = container.scrollLeft + container.clientWidth / 2;

  let bestIndex = 0;
  let smallestCenterDiff = Infinity;

  imageRefs.current.forEach((ref, index) => {
    if (!ref) return;

    const rect = ref.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const imageCenter =
      rect.left - containerRect.left + rect.width / 2 + container.scrollLeft;

    const diff = Math.abs(imageCenter - containerCenter);

    if (diff < smallestCenterDiff) {
      smallestCenterDiff = diff;
      bestIndex = index;
    }
  });

  setCurrentIndex(bestIndex);
};



  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: name,
        text: 'Check out this product!',
        url: window.location.href,
      });
    } else {
      alert('Sharing is not supported on this browser.');
    }
  };

  const handleOpenModal = (index: number) => {
    setCurrentIndex(index);
    setZoomedImage(images[index]);
    setZoomed(false);

    setTimeout(() => {
      imageRefs.current[index]?.scrollIntoView({
        behavior: 'smooth',
        inline: 'start',
        block: 'nearest',
      });
    }, 100);
  };

  const prevImage = () => {
    const prev = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prev);
    setZoomedImage(images[prev]);
    setZoomed(false);
    scrollToImage(prev);
  };

  const nextImage = () => {
    const next = (currentIndex + 1) % images.length;
    setCurrentIndex(next);
    setZoomedImage(images[next]);
    setZoomed(false);
    scrollToImage(next);
  };

  const scrollToImage = (index: number) => {
    setTimeout(() => {
      imageRefs.current[index]?.scrollIntoView({
        behavior: 'smooth',
        inline: 'start',
        block: 'nearest',
      });
    }, 100);
  };

  return (
    <div className="p-4">
      {/* Horizontal Scrollable Cards */}
      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        {images.map((image, index) => (
<div
  key={index}
  className="min-w-[250px] flex-shrink-0 flex items-center justify-center cursor-pointer hover:ring hover:ring-orange-200 transition bg-white p-2"
  onClick={() => handleOpenModal(index)}
>
<CldImage
  src={getPublicId(image)}
  alt={name}
  width="600"
  height="400"
  className="rounded-md w-full max-h-80 object-contain bg-white"
/>

            <div className="absolute top-2 right-2 flex gap-2 bg-white/80 p-1 rounded-full shadow">
              <Share2
                size={18}
                className="text-gray-700 cursor-pointer hover:text-orange-600"
onClick={(e: React.MouseEvent<SVGElement>) => {
  e.stopPropagation();
  handleShare();
}}

              />
              <Heart
                size={18}
                className={`cursor-pointer ${
                  wishlist ? 'text-orange-500' : 'text-gray-700'
                }`}
onClick={(e: React.MouseEvent<SVGElement>) => {
  e.stopPropagation();
  toggleWishlist();
}}

              />
              <Eye size={18} className="text-orange-700 hover:text-orange-600" />
            </div>
          </div>
        ))}
      </div>
      {/* Modal View */}
      {zoomedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex flex-col items-center justify-center">
          <button
            className="absolute top-4 right-4 text-white z-[9999]"
            onClick={() => setZoomedImage(null)}
          >
            <X size={28} />
          </button>

          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white z-40"
            onClick={prevImage}
          >
            <ChevronLeft size={36} />
          </button>

          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white z-40"
            onClick={nextImage}
          >
            <ChevronRight size={36} />
          </button>

          <button
            className="absolute bottom-20 right-6 text-white z-50"
            onClick={toggleZoom}
          >
            {zoomed ? <ZoomOut size={24} /> : <ZoomIn size={24} />}
          </button>

<div
  ref={scrollContainerRef}
  onScroll={handleScroll}
  className="flex overflow-x-auto gap-4 w-full h-[80vh] px-4 pt-8 snap-x snap-mandatory items-center justify-start scrollbar-hide"
>

            {images.map((image, index) => (
              <div
                key={index}
                ref={(el) => {
                  imageRefs.current[index] = el;
                }}

                className="flex-shrink-0 w-full h-full snap-start flex justify-center items-center"
                onClick={() => {
                  setCurrentIndex(index);
                  setZoomedImage(image);
                  scrollToImage(index);
                }}
              >
                <CldImage
                src={getPublicId(image)}
                alt={`Thumb ${index}`}
                width={300}
                height={300}
                className="rounded object-cover border"
                />
              </div>
            ))}
          </div>

          <div className="flex overflow-x-auto mt-4 gap-2 px-4 py-2 w-full justify-center items-center scrollbar-hide">
            {images.map((image, index) => (
              <div
                key={index}
                className={`w-20 h-20 border-2 rounded-md cursor-pointer flex-shrink-0 ${
                  currentIndex === index
                    ? 'border-orange-500'
                    : 'border-transparent'
                }`}
                onClick={() => {
                  setCurrentIndex(index);
                  setZoomedImage(image);
                  setZoomed(false);
                  scrollToImage(index);
                }}
              >
                <CldImage
                src={getPublicId(image)}
                alt={`Thumb ${index}`}
                width={80}
                height={80}
                className="w-full h-full object-cover rounded"
                />
              </div>
            ))}
          </div>
<div className="absolute top-4 left-4 text-white text-sm bg-black/40 px-3 py-1 rounded-full z-50">
  {currentIndex + 1} / {images.length}
</div>

        </div>
      )}
    </div>
  );
};

export default ProductImageViewer;
