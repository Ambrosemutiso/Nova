// components/HeroSlider.js
'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/autoplay';

const banners = [
  { id: 1, src: '/banner1.jpg', alt: 'Banner 1' },
  { id: 2, src: '/banner2.jpg', alt: 'Banner 2' },
  { id: 3, src: '/banner3.jpg', alt: 'Banner 3' },
  { id: 4, src: '/banner4.jpg', alt: 'Banner 4' },
  { id: 5, src: '/banner5.jpg', alt: 'Banner 5' },
  { id: 6, src: '/banner6.jpg', alt: 'Banner 6' },
];

export default function HeroSlider() {
  return (
    <div className="w-full max-w-[100vw] overflow-hidden">
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
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
                className="object-contain" // or 'object-cover' if you want full bleed
                priority
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
