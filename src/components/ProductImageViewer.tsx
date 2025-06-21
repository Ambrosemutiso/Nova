'use client';

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { CldImage } from 'next-cloudinary';
import {
  Eye,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import 'swiper/css';

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

  const toggleWishlist = () => setWishlist(!wishlist);

  const getPublicId = (url?: string) => {
    if (!url || typeof url !== 'string') return '';
    const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    return match ? match[1] : url;
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
  };

  const prevImage = () => {
    const prev = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prev);
    setZoomedImage(images[prev]);
    setZoomed(false);
  };

  const nextImage = () => {
    const next = (currentIndex + 1) % images.length;
    setCurrentIndex(next);
    setZoomedImage(images[next]);
    setZoomed(false);
  };

  const toggleZoom = () => setZoomed(!zoomed);

  return (
    <div className="relative">
      {/* Image Carousel */}
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 3000 }}
        loop
        spaceBetween={10}
        slidesPerView={1}
        allowTouchMove={true}
        className="rounded-md"
      >
        {images.slice(0, 4).map((image: string, index: number) => (
          <SwiperSlide key={index} onClick={() => handleOpenModal(index)}>
            <CldImage
              src={getPublicId(image)}
              alt={name}
              width="400"
              height="200"
              className="rounded-md object-cover w-full h-64"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Bottom-right Icons */}
      <div className="absolute bottom-3 right-3 flex gap-3 bg-transparent p-2 rounded-full shadow z-10">
        <Share2
          size={20}
          className="text-gray-700 cursor-pointer hover:text-orange-600"
          onClick={handleShare}
        />
        <Heart
          size={20}
          className={`cursor-pointer ${wishlist ? 'text-orange-500' : 'text-gray-700'}`}
          onClick={toggleWishlist}
        />
        
        <Eye
          size={20}
          className="text-orange-700 cursor-pointer hover:text-orange-600"
          onClick={() => handleOpenModal(currentIndex)}
        />
      </div>

      {/* Zoomable Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <button className="absolute top-4 right-4 text-white" onClick={() => setZoomedImage(null)}>
            <X size={28} />
          </button>

          <button className="absolute left-4 text-white" onClick={prevImage}>
            <ChevronLeft size={32} />
          </button>

          <img
            src={zoomedImage}
            alt="Zoomed"
            onClick={toggleZoom}
            className={`max-w-[90vw] max-h-[80vh] rounded-lg cursor-zoom-in transition-transform ${
              zoomed ? 'scale-150' : 'scale-100'
            }`}
          />

          <button className="absolute right-4 text-white" onClick={nextImage}>
            <ChevronRight size={32} />
          </button>

          <button onClick={toggleZoom} className="absolute bottom-6 right-6 text-white">
            {zoomed ? <ZoomOut size={24} /> : <ZoomIn size={24} />}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductImageViewer;
