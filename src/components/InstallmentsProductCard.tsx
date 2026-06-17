'use client';

import { useState, useEffect, useRef } from 'react';
import { CldImage } from 'next-cloudinary';
import type { ProductType } from '@/app/types/product';
import InstallmentModal from './InstallmentModal';
import { ShieldCheck, Zap, Calendar, ChevronRight, Users } from 'lucide-react';

interface InstallmentProductCardProps {
  product: ProductType;
  index?: number;
}

export default function InstallmentProductCard({ product, index = 0 }: InstallmentProductCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [visible, setVisible] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // fake "X people on this plan" — replace with real aggregate if available
  const [buyers] = useState(() => Math.floor(Math.random() * 40) + 8);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const getPublicId = (url: string) => {
    const m = url.match(/\/upload\/(?:v\d+\/)?([^.]+)/);
    return m ? m[1] : url;
  };

  const oldPrice     = product.oldPrice ?? product.calculatedPrice ?? 0;
  const currentPrice = product.calculatedPrice ?? 0;
  const months       = product.installmentMonths || 6;
  const depositPct   = product.installmentDepositPercent ?? 20;
  const deposit       = Math.ceil(currentPrice * (depositPct / 100));
  const monthlyPayment = Math.round((currentPrice - deposit) / months);
  const discount       = oldPrice > currentPrice ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100) : 0;

  const staggerDelay = Math.min(index * 60, 400);

  return (
    <>
      <div
        ref={cardRef}
        className="group relative flex flex-col bg-white rounded-2xl border border-gray-100
          shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
        style={{
          opacity:    visible ? 1 : 0,
          transform:  visible ? 'translateY(0)' : 'translateY(16px)',
          transition: `opacity 0.4s ease ${staggerDelay}ms, transform 0.4s ease ${staggerDelay}ms,
                       box-shadow 0.3s ease, translate 0.3s ease`,
        }}
      >
        {/* ── image ── */}
        <div
          className="relative aspect-square bg-gray-50 cursor-pointer overflow-hidden"
          onClick={() => setShowModal(true)}
        >
          {!imgLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
          )}
          <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
            <CldImage
              src={getPublicId(product.images?.[0] || '')}
              alt={product.name}
              width={300}
              height={300}
              crop="fill"
              className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImgLoaded(true)}
            />
          </div>

          {/* discount badge */}
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-lg shadow">
              -{discount}%
            </span>
          )}

          {/* installment badge */}
          <span className="absolute top-2 right-2 flex items-center gap-1 bg-orange-500 text-white text-[9px] font-bold px-2 py-1 rounded-lg shadow">
            <Calendar className="w-2.5 h-2.5" /> {months}mo
          </span>
        </div>

        {/* ── content ── */}
        <div className="flex flex-col flex-1 px-3 pt-2.5 pb-3 gap-2">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* price */}
          <div className="flex items-baseline gap-2">
            {oldPrice > currentPrice && (
              <span className="text-[10px] line-through text-gray-400">Ksh {oldPrice.toLocaleString()}</span>
            )}
            <span className="text-base font-black text-gray-900">Ksh {currentPrice.toLocaleString()}</span>
          </div>

          {/* monthly payment highlight */}
          <div className="bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 flex items-center justify-between">
            <div>
              <p className="text-[9px] text-orange-500 font-semibold uppercase tracking-wide">From</p>
              <p className="text-sm font-black text-orange-700 leading-none">
                Ksh {monthlyPayment.toLocaleString()}<span className="text-[10px] font-semibold">/mo</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-orange-500 font-semibold uppercase tracking-wide">Deposit</p>
              <p className="text-xs font-bold text-orange-700">Ksh {deposit.toLocaleString()}</p>
            </div>
          </div>

          {/* social proof */}
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <Users className="w-3 h-3 text-gray-400" />
            <span>{buyers} people on this plan</span>
          </div>

          {/* trust strip */}
          <div className="flex items-center gap-2 text-[9px] text-gray-400">
            <span className="flex items-center gap-0.5"><ShieldCheck className="w-2.5 h-2.5 text-orange-400" /> Secure</span>
            <span className="text-gray-200">·</span>
            <span className="flex items-center gap-0.5"><Zap className="w-2.5 h-2.5 text-orange-400" /> Instant approval</span>
          </div>

          {/* CTA */}
          <button
            onClick={() => setShowModal(true)}
            className="mt-1 w-full flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600
              active:scale-[0.98] text-white text-xs font-bold py-2.5 rounded-xl transition
              shadow-sm shadow-orange-200"
          >
            Activate Plan <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showModal && (
        <InstallmentModal product={product} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}