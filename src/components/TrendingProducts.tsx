'use client';

import { useEffect, useState, useRef } from 'react';
import ProductCard from './ProductCard';
import type { ProductType } from '@/app/types/product';

export default function TrendingProducts() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const scrollPosRef = useRef(0);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch('/api/products/trending');
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error('Failed to fetch trending products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || products.length === 0) return;

    const speed = 0.6; // px per frame

    const animate = () => {
      if (!isPaused && el) {
        scrollPosRef.current += speed;
        // Loop: when we've scrolled past half (the duplicated list), reset
        if (scrollPosRef.current >= el.scrollWidth / 2) {
          scrollPosRef.current = 0;
        }
        el.scrollLeft = scrollPosRef.current;

        // Update active dot
        const cardWidth = 220 + 16; // card width + gap
        const idx = Math.round(el.scrollLeft / cardWidth) % products.length;
        setActiveIndex(idx);
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPaused, products]);

  const scrollLeft = () => {
    const cardWidth = 220 + 16;
    scrollPosRef.current = Math.max(0, scrollPosRef.current - cardWidth * 2);
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollPosRef.current;
  };

  const scrollRight = () => {
    const cardWidth = 220 + 16;
    scrollPosRef.current += cardWidth * 2;
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollPosRef.current;
  };

  if (loading) {
    return (
      <div className="trending-skeleton">
        <div className="skeleton-header" />
        <div className="skeleton-strip">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
        <style>{skeletonStyles}</style>
      </div>
    );
  }

  if (products.length === 0) return null;

  // Duplicate list for seamless infinite scroll
  const displayProducts = [...products, ...products];

  return (
    <section className="trending-section">
      {/* Ambient background glow */}
      <div className="ambient-glow" aria-hidden="true" />

      {/* Header */}
      <div className="trending-header">
        <div className="title-group">
          <span className="fire-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
              <path d="M12 6v6l4 2" />
            </svg>
            TRENDING NOW
          </span>
          <h2 className="trending-title">
            <span className="title-hot">Hot</span> Picks
            <span className="title-dot">.</span>
          </h2>
          <p className="trending-sub">Most viewed &amp; visited — updated live</p>
        </div>

        <div className="nav-controls">
          <button
            className="nav-btn nav-prev"
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            className="nav-btn nav-next"
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Rank ticker strip */}
      <div className="rank-ticker">
        {products.map((p, i) => (
          <span key={p._id} className={`rank-item ${i === activeIndex ? 'rank-item--active' : ''}`}>
            <span className="rank-num">#{i + 1}</span>
            <span className="rank-name">{p.name}</span>
            <span className="rank-views">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {(p.views + p.visits).toLocaleString()}
            </span>
          </span>
        ))}
      </div>

      {/* Swiper */}
      <div
        className="swiper-wrapper-outer"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Left fade edge */}
        <div className="fade-edge fade-edge--left" aria-hidden="true" />
        <div className="fade-edge fade-edge--right" aria-hidden="true" />

        <div
          ref={scrollRef}
          className="swiper-track"
        >
          {displayProducts.map((product, i) => {
            const rank = (i % products.length) + 1;
            return (
              <div
                key={`${product._id}-${i}`}
                className="swiper-slide"
                style={{ animationDelay: `${(i % products.length) * 0.05}s` }}
              >
                {/* Rank badge */}
                <div className={`rank-badge rank-badge--${rank <= 3 ? rank : 'rest'}`}>
                  {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`}
                </div>

                {/* Trending score bar */}
                <div className="score-bar-wrap">
                  <div
                    className="score-bar"
                    style={{
                      width: `${Math.min(100, ((product.views + product.visits) /
                        Math.max(...products.map(p => p.views + p.visits))) * 100)}%`
                    }}
                  />
                </div>

                <div className="card-hover-wrapper">
                  <ProductCard product={product} />
                </div>

                {/* Stats overlay */}
                <div className="stats-pill">
                  <span className="stat">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                    {product.views.toLocaleString()}
                  </span>
                  <span className="stat-sep">·</span>
                  <span className="stat">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    {product.visits.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="dot-indicators" role="tablist" aria-label="Trending products navigation">
        {products.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === activeIndex}
            className={`dot ${i === activeIndex ? 'dot--active' : ''}`}
            onClick={() => {
              const cardWidth = 220 + 16;
              scrollPosRef.current = i * cardWidth;
              if (scrollRef.current) scrollRef.current.scrollLeft = scrollPosRef.current;
              setActiveIndex(i);
            }}
          />
        ))}
      </div>

      <style>{styles}</style>
    </section>
  );
}

const skeletonStyles = `
  .trending-skeleton { padding: 2rem 0; }
  .skeleton-header {
    width: 200px; height: 32px; border-radius: 8px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    margin-bottom: 1.5rem;
  }
  .skeleton-strip { display: flex; gap: 16px; overflow: hidden; }
  .skeleton-card {
    min-width: 220px; height: 320px; border-radius: 16px; flex-shrink: 0;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }
  @keyframes shimmer { to { background-position: -200% 0; } }
`;

const styles = `
  /* ── Section wrapper ─────────────────────────────── */
  .trending-section {
    position: relative;
    padding: 2.5rem 0 2rem;
    overflow: hidden;
    font-family: 'DM Sans', 'Sora', system-ui, sans-serif;
  }

  /* Ambient glow blob */
  .ambient-glow {
    position: absolute;
    top: -60px; left: 50%;
    transform: translateX(-50%);
    width: 600px; height: 300px;
    background: radial-gradient(ellipse, rgba(255,87,34,0.08) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  /* ── Header ──────────────────────────────────────── */
  .trending-header {
    position: relative; z-index: 1;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding: 0 1rem 1.25rem;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .title-group { display: flex; flex-direction: column; gap: 4px; }

  .fire-badge {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 0.65rem; font-weight: 700; letter-spacing: 0.12em;
    color: #ff5722;
    background: rgba(255,87,34,0.08);
    border: 1px solid rgba(255,87,34,0.25);
    border-radius: 100px;
    padding: 4px 10px;
    width: fit-content;
    animation: pulse-badge 2s ease-in-out infinite;
  }
  @keyframes pulse-badge {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255,87,34,0.3); }
    50% { box-shadow: 0 0 0 6px rgba(255,87,34,0); }
  }

  .trending-title {
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 900; line-height: 1;
    color: #111; margin: 0;
    letter-spacing: -0.03em;
  }
  .title-hot {
    background: linear-gradient(135deg, #ff5722, #ff9800);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .title-dot { color: #ff5722; }

  .trending-sub {
    font-size: 0.8rem; color: #888; margin: 0;
    font-weight: 400; letter-spacing: 0.01em;
  }

  /* ── Nav buttons ─────────────────────────────────── */
  .nav-controls { display: flex; gap: 8px; flex-shrink: 0; }

  .nav-btn {
    width: 38px; height: 38px;
    border-radius: 50%; border: 1.5px solid #e0e0e0;
    background: #fff;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #333;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .nav-btn:hover {
    border-color: #ff5722; color: #ff5722;
    transform: scale(1.08);
    box-shadow: 0 4px 16px rgba(255,87,34,0.2);
  }

  /* ── Rank ticker ─────────────────────────────────── */
  .rank-ticker {
    position: relative; z-index: 1;
    display: flex; gap: 6px;
    overflow-x: auto; scrollbar-width: none;
    padding: 0 1rem 1rem;
    -webkit-overflow-scrolling: touch;
  }
  .rank-ticker::-webkit-scrollbar { display: none; }

  .rank-item {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 0.7rem; padding: 4px 10px;
    border-radius: 100px;
    background: #f5f5f5; color: #666;
    white-space: nowrap; flex-shrink: 0;
    border: 1px solid transparent;
    transition: all 0.3s ease;
  }
  .rank-item--active {
    background: rgba(255,87,34,0.07);
    border-color: rgba(255,87,34,0.3);
    color: #ff5722;
  }
  .rank-num { font-weight: 700; color: #ff5722; }
  .rank-name { font-weight: 500; max-width: 80px; overflow: hidden; text-overflow: ellipsis; }
  .rank-views { display: flex; align-items: center; gap: 3px; color: #aaa; font-size: 0.65rem; }

  /* ── Swiper ──────────────────────────────────────── */
  .swiper-wrapper-outer {
    position: relative; z-index: 1;
    padding-bottom: 8px;
  }

  /* Fade edges */
  .fade-edge {
    position: absolute; top: 0; bottom: 8px;
    width: 80px; z-index: 2; pointer-events: none;
  }
  .fade-edge--left {
    left: 0;
    background: linear-gradient(to right, #fff 0%, transparent 100%);
  }
  .fade-edge--right {
    right: 0;
    background: linear-gradient(to left, #fff 0%, transparent 100%);
  }

  .swiper-track {
    display: flex; gap: 16px;
    overflow-x: scroll; scrollbar-width: none;
    padding: 12px 1rem 8px;
    scroll-behavior: auto;
    -webkit-overflow-scrolling: touch;
  }
  .swiper-track::-webkit-scrollbar { display: none; }

  /* ── Slide ───────────────────────────────────────── */
  .swiper-slide {
    position: relative; flex-shrink: 0;
    width: 220px;
    animation: slide-in 0.5s ease both;
  }
  @keyframes slide-in {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Rank badge */
  .rank-badge {
    position: absolute; top: -10px; left: 10px; z-index: 10;
    font-size: 0.7rem; font-weight: 800;
    padding: 3px 9px; border-radius: 100px;
    line-height: 1.6; white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    animation: badge-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  @keyframes badge-pop {
    from { transform: scale(0); }
    to { transform: scale(1); }
  }
  .rank-badge--1 { background: linear-gradient(135deg, #FFD700, #FFA500); color: #5a3e00; }
  .rank-badge--2 { background: linear-gradient(135deg, #C0C0C0, #9E9E9E); color: #fff; }
  .rank-badge--3 { background: linear-gradient(135deg, #CD7F32, #A0522D); color: #fff; }
  .rank-badge--rest { background: #111; color: #fff; font-size: 0.65rem; }

  /* Score bar */
  .score-bar-wrap {
    height: 3px; background: #f0f0f0;
    border-radius: 2px; margin-bottom: 10px;
    overflow: hidden;
  }
  .score-bar {
    height: 100%;
    background: linear-gradient(90deg, #ff5722, #ff9800);
    border-radius: 2px;
    transition: width 1s ease;
    animation: bar-grow 0.8s ease both;
  }
  @keyframes bar-grow {
    from { width: 0% !important; }
  }

  /* Card hover lift effect */
  .card-hover-wrapper {
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                box-shadow 0.25s ease;
    border-radius: 16px;
  }
  .swiper-slide:hover .card-hover-wrapper {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 16px 40px rgba(0,0,0,0.12);
  }

  /* Stats pill */
  .stats-pill {
    display: flex; align-items: center; gap: 6px;
    margin-top: 8px; padding: 0 4px;
    font-size: 0.7rem; color: #999;
    font-weight: 500;
  }
  .stat { display: flex; align-items: center; gap: 4px; }
  .stat-sep { color: #ddd; }

  /* ── Dot indicators ──────────────────────────────── */
  .dot-indicators {
    display: flex; justify-content: center; gap: 6px;
    padding-top: 1rem; position: relative; z-index: 1;
  }
  .dot {
    width: 6px; height: 6px; border-radius: 100px;
    background: #e0e0e0; border: none; cursor: pointer;
    padding: 0; transition: all 0.3s ease;
  }
  .dot--active {
    width: 20px; background: #ff5722;
  }

  /* ── Dark mode ───────────────────────────────────── */
  @media (prefers-color-scheme: dark) {
    .trending-title { color: #f0f0f0; }
    .trending-sub { color: #666; }
    .nav-btn { background: #1a1a1a; border-color: #333; color: #ccc; }
    .rank-item { background: #1e1e1e; color: #888; }
    .fade-edge--left { background: linear-gradient(to right, #0a0a0a 0%, transparent 100%); }
    .fade-edge--right { background: linear-gradient(to left, #0a0a0a 0%, transparent 100%); }
    .dot { background: #333; }
    .stats-pill { color: #555; }
    .ambient-glow { background: radial-gradient(ellipse, rgba(255,87,34,0.12) 0%, transparent 70%); }
    .score-bar-wrap { background: #222; }
  }

  /* ── Mobile ──────────────────────────────────────── */
  @media (max-width: 640px) {
    .trending-header { padding: 0 0.75rem 1rem; }
    .swiper-track { padding: 12px 0.75rem 8px; gap: 12px; }
    .swiper-slide { width: 185px; }
    .fade-edge { width: 40px; }
  }
`;