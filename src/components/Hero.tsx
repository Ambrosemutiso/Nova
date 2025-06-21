'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/autoplay';

const banners = [
  {
    id: 1,
    src: '/banner1.jpg',
    alt: 'Banner 1',
    heading: 'Big Deals!',
    cta: 'Shop Now',
  },
  {
    id: 2,
    src: '/banner2.jpg',
    alt: 'Banner 2',
    heading: 'New Arrivals',
    cta: 'Explore',
  },
  {
    id: 3,
    src: '/banner3.jpg',
    alt: 'Banner 3',
    heading: 'Hot Offers',
    cta: 'Buy Now',
  },
];

export default function HeroSlider() {
  return (
    <div className="w-full max-w-[100vw] overflow-hidden px-6 pt-28 pb-10">
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        loop
        slidesPerView={1}
        spaceBetween={0}
        allowTouchMove={true}
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div className="relative w-full h-[180px] sm:h-[220px] md:h-[280px] lg:h-[320px] xl:h-[360px]">
              <Image
                src={banner.src}
                alt={banner.alt}
                fill
                className="object-cover"
                priority
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/30 flex flex-col items-start justify-center px-6">
                <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-bold mb-2 drop-shadow">
                  {banner.heading}
                </h2>
                <button className="bg-orange-500 text-white text-sm sm:text-base px-4 py-2 rounded-md shadow hover:bg-orange-600 transition">
                  {banner.cta}
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
