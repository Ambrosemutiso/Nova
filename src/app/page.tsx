'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Loader from '@/components/Loader';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import { Pagination, Autoplay } from 'swiper/modules';

const Main = dynamic(() => import('@/app/shop/page'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-12 h-12 border-4 border-orange-500 border-dashed rounded-full animate-spin"></div>
    </div>
  ),
});

const MotionImg = motion.img;

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [showMain, setShowMain] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;
  if (showMain) return <Main />;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-screen p-4"
    >
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setShowMain(true)}
          className="bg-white/70 hover:bg-white text-orange-500 font-bold py-2 px-4 rounded-full shadow"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 w-full">
        <Swiper
          pagination={{ clickable: true, type: 'progressbar' }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          modules={[Pagination, Autoplay]}
          className="w-full h-[calc(90vh-80px)]"
        >
          <SwiperSlide>
            <Slide
              src="/slider1.jpg"
              title="Welcome to Our App"
              description="Best products, best prices, just for you!"
              isActive={activeIndex === 0}
            />
          </SwiperSlide>
          <SwiperSlide>
            <Slide
              src="/slider2.jpg"
              title="Amazing Deals"
              description="Daily flash sales and unbeatable discounts!"
              isActive={activeIndex === 1}
            />
          </SwiperSlide>
          <SwiperSlide>
            <Slide
              src="/slider3.jpg"
              title="Fast & Secure"
              description="Shop safely with quick deliveries to your door!"
              isActive={activeIndex === 2}
            />
          </SwiperSlide>
        </Swiper>
      </div>

      <div className="w-full p-4 bg-white shadow-md sticky bottom-0">
        <button
          onClick={() => setShowMain(true)}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-full text-lg font-semibold"
        >
          Proceed
        </button>
      </div>
    </motion.main>
  );
}

function Slide({ src, title, description, isActive }: { src: string; title: string; description: string; isActive: boolean }) {
  return (
    <div className="relative flex flex-col items-center justify-center h-full p-6 text-center overflow-hidden">
      <MotionImg
        src={src}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover opacity-80"
        animate={{ scale: isActive ? 1.1 : 1 }}
        transition={{ duration: 8 }}
      />
      <motion.div
        className="relative z-10"
        initial={false}
        animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white/70 rounded-sm p-4">
          <h1 className="text-3xl font-bold text-orange-500 mb-4">{title}</h1>
          <p className="text-orange-400">{description}</p>
        </div>
      </motion.div>
    </div>
  );
}
