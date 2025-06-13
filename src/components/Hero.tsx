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
    <div className="left-4 right-4 h-80 md:h-80 overflow-hidden py-11">
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop
        slidesPerView={1}
        spaceBetween={0}
        allowTouchMove={true} // Enables swipe and horizontal scroll
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div className="relative w-full h-60 md:h-80">
              <Image
                src={banner.src}
                alt={banner.alt}
                layout="fill"
                objectFit="cover"
                className="rounded"
                priority
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
