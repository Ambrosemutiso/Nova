'use client';

import { useEffect, useState, useRef } from 'react';
import { FaRegHeart, FaHeart, FaRegCommentAlt, FaShare } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/context/AuthContext';

type Comment = { userId: string; text: string };

type Ad = {
  _id: string;
  title: string;
  description?: string;
  mediaUrl: string;
  mediaType: 'video' | 'image';
  sellerId: string;
  category?: string;
  views: number;
  likes: string[]; // array of userIds
  comments: Comment[];
  shares: number;
};

export default function AdsFeedPage() {
  const { user } = useAuth();
  const userId = user?._id ?? ''; // always a string

  const [ads, setAds] = useState<Ad[]>([]);
  const [commentDrawer, setCommentDrawer] = useState<Ad | null>(null);
  const [shareDrawer, setShareDrawer] = useState<Ad | null>(null);
  const [commentText, setCommentText] = useState('');
  const [heartBurst, setHeartBurst] = useState<string | null>(null);

  // allow null entries while mounting/unmounting
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const lastTapRef = useRef<number>(0);

  // format numbers
  const shortNum = (num: number) =>
    num >= 1_000_000 ? (num / 1_000_000).toFixed(1) + 'm'
      : num >= 1000 ? (num / 1000).toFixed(1) + 'k'
      : num.toString();

  // fetch ads and normalize fields
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/ads/list');
        const data = await res.json();
        const merged = [...(data.sellerAds || []), ...(data.otherAds || [])];

        // Normalize each ad to ensure types are present
        const normalized: Ad[] = merged.map((a: any) => ({
          _id: String(a._id),
          title: String(a.title ?? ''),
          description: a.description ?? '',
          mediaUrl: String(a.mediaUrl ?? ''),
          mediaType: a.mediaType === 'image' ? 'image' : 'video',
          sellerId: String(a.sellerId ?? ''),
          category: a.category ?? '',
          views: Number(a.views ?? 0),
          likes: Array.isArray(a.likes) ? a.likes.filter(Boolean).map(String) : [],
          comments: Array.isArray(a.comments)
            ? a.comments.map((c: any) => ({ userId: String(c.userId ?? ''), text: String(c.text ?? '') }))
            : [],
          shares: Number(a.shares ?? 0),
        }));

        setAds(normalized);
      } catch (err) {
        console.error('Failed to fetch ads', err);
      }
    })();
  }, []);

  // auto-play & view counting using IntersectionObserver
  useEffect(() => {
    if (!ads.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target as HTMLVideoElement;
        if (!el) return;
        const adId = el.dataset.id ?? '';

        if (entry.isIntersecting) {
          // play and record view
          el.play().catch(() => {});
          // fire view increment (non-blocking)
          fetch('/api/ads/list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adId, type: 'view' }),
          }).catch(() => {});
        } else {
          el.pause();
        }
      });
    }, { threshold: 0.6 });

    // observe current refs
    videoRefs.current.forEach((v) => {
      if (v) observer.observe(v);
    });

    return () => {
      videoRefs.current.forEach((v) => {
        if (v) observer.unobserve(v);
      });
      observer.disconnect();
    };
  }, [ads]);

  // toggle like (server + local UI)
  const toggleLike = async (ad: Ad, withAnim = false) => {
    const adId = ad._id;

    // guard: require userId to be non-empty when liking
    if (!userId) {
      console.warn('User not logged in: cannot like');
      return;
    }

    // request
    fetch('/api/ads/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId, type: 'like', userId }),
    }).catch(() => {});

    // local optimistic update
    setAds((prev) =>
      prev.map((a) => {
        if (a._id !== adId) return a;
        const already = a.likes.includes(userId);
        const newLikes = already ? a.likes.filter((id) => id !== userId) : [...a.likes, userId];
        return { ...a, likes: newLikes };
      })
    );

    if (withAnim) {
      setHeartBurst(adId);
      setTimeout(() => setHeartBurst(null), 600);
    }
  };

  // double-tap like detection
  const handleDoubleTap = (ad: Ad) => {
    const now = Date.now();
    const diff = now - lastTapRef.current;
    if (diff < 350) {
      // double-tap detected
      if (!ad.likes.includes(userId)) toggleLike(ad, true);
    }
    lastTapRef.current = now;
  };

  // submit comment
  const submitComment = async () => {
    if (!commentDrawer) return;
    if (!commentText.trim()) return;

    const adId = commentDrawer._id;
    // send
    fetch('/api/ads/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId, type: 'comment', userId, commentText }),
    }).catch(() => {});

    // optimistic UI update
    setAds((prev) =>
      prev.map((a) =>
        a._id === adId ? { ...a, comments: [...a.comments, { userId, text: commentText }] } : a
      )
    );

    setCommentText('');
  };

  // sharing (native fallback)
  const shareAd = async (platform: string, ad: Ad) => {
    const adId = ad._id;
    // increment share count server-side (non-blocking)
    fetch('/api/ads/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId, type: 'share', userId }),
    }).catch(() => {});

    // Use native share if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: ad.title,
          text: ad.description,
          url: ad.mediaUrl,
        });
        return;
      } catch (err) {
        console.warn('Native share failed', err);
      }
    }

    const url = encodeURIComponent(ad.mediaUrl);
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${url}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        break;
      case 'instagram':
        // Instagram web does not accept external share URLs; fallback to copy
        try {
          await navigator.clipboard.writeText(ad.mediaUrl);
          alert('Link copied. Paste into Instagram to share.');
        } catch {
          alert('Copy link: ' + ad.mediaUrl);
        }
        break;
      case 'tiktok':
        // No public sharer for TikTok — copy fallback
        try {
          await navigator.clipboard.writeText(ad.mediaUrl);
          alert('Link copied. Share on TikTok using the app.');
        } catch {
          alert('Copy link: ' + ad.mediaUrl);
        }
        break;
      default:
        window.open(ad.mediaUrl, '_blank');
    }
  };

  return (
    <div className="relative w-full h-screen overflow-y-scroll snap-y snap-mandatory bg-black">
      {ads.map((ad, index) => (
        <div
          key={ad._id}
          className="h-screen snap-start relative"
          // detect double-tap anywhere on the card
          onClick={() => handleDoubleTap(ad)}
        >
          {/* Media */}
          {ad.mediaType === 'video' ? (
            <video
              // proper ref callback returning void
              ref={(el) => {
                // ensure array length
                videoRefs.current[index] = el;
              }}
              data-id={ad._id}
              src={ad.mediaUrl}
              className="w-full h-full object-cover"
              loop
              playsInline
              muted={false}
              controls={false}
            />
          ) : (
            <img src={ad.mediaUrl} alt={ad.title} className="w-full h-full object-cover" />
          )}

          {/* Double-tap heart burst */}
          <AnimatePresence>
            {heartBurst === ad._id && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 2.5, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.45 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <FaHeart className="text-red-500 drop-shadow-lg" size={120} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* bottom info */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent text-white"
          >
            <h2 className="text-xl font-bold">{ad.title}</h2>
            {ad.description ? (
              <p className="text-gray-300 text-sm mt-1 line-clamp-2">{ad.description}</p>
            ) : null}
            {ad.category ? <p className="text-orange-400 mt-1">#{ad.category}</p> : null}
          </motion.div>

          {/* reactions column */}
          <div className="absolute right-4 bottom-32 flex flex-col gap-6 text-white">
            {/* like */}
            <motion.button
              whileTap={{ scale: 1.2 }}
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(ad, true);
              }}
              className="flex flex-col items-center p-3 bg-white/20 rounded-full"
              aria-label={ad.likes.includes(userId) ? 'Unlike' : 'Like'}
            >
              {ad.likes.includes(userId) ? (
                <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 0.3 }}>
                  <FaHeart className="text-red-500" size={28} />
                </motion.div>
              ) : (
                <FaRegHeart size={28} />
              )}
              <span className="text-xs mt-1">{shortNum(ad.likes.length)}</span>
            </motion.button>

            {/* comment */}
            <motion.button
              whileTap={{ scale: 1.1 }}
              onClick={(e) => {
                e.stopPropagation();
                setCommentDrawer(ad);
              }}
              className="flex flex-col items-center p-3 bg-white/20 rounded-full"
              aria-label="Comments"
            >
              <FaRegCommentAlt size={24} />
              <span className="text-xs mt-1">{shortNum(ad.comments.length)}</span>
            </motion.button>

            {/* share */}
            <motion.button
              whileTap={{ scale: 1.1 }}
              onClick={(e) => {
                e.stopPropagation();
                setShareDrawer(ad);
              }}
              className="flex flex-col items-center p-3 bg-white/20 rounded-full"
              aria-label="Share"
            >
              <FaShare size={24} />
              <span className="text-xs mt-1">{shortNum(ad.shares)}</span>
            </motion.button>
          </div>
        </div>
      ))}

      {/* COMMENT DRAWER */}
      <AnimatePresence>
        {commentDrawer && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', bounce: 0.2 }}
            className="fixed bottom-0 left-0 w-full h-1/2 bg-white rounded-t-3xl p-4 z-[9999]"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold">Comments</h3>
              <button onClick={() => setCommentDrawer(null)}>Close</button>
            </div>

            <div className="mt-2 h-[60%] overflow-y-auto">
              {commentDrawer.comments.length === 0 ? (
                <p className="text-gray-500">No comments yet — be the first!</p>
              ) : (
                commentDrawer.comments.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.18 }}
                    className="py-2 border-b"
                  >
                    <div className="text-sm font-semibold">{c.userId}</div>
                    <div className="text-gray-700 text-sm">{c.text}</div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="flex items-center gap-2 mt-3">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 border rounded-full px-4 py-2"
              />
              <button
                onClick={() => {
                  submitComment();
                }}
                className="bg-orange-500 text-white px-4 py-2 rounded-full"
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SHARE DRAWER */}
      <AnimatePresence>
        {shareDrawer && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', bounce: 0.15 }}
            className="fixed bottom-0 left-0 w-full h-1/3 bg-white rounded-t-3xl p-6 z-[9999]"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Share</h3>
              <button onClick={() => setShareDrawer(null)}>Close</button>
            </div>

            <div className="grid grid-cols-4 gap-4 text-center">
              <button
                onClick={() => {
                  if (shareDrawer) shareAd('facebook', shareDrawer);
                }}
                className="py-2"
              >
                Facebook
              </button>
              <button
                onClick={() => {
                  if (shareDrawer) shareAd('instagram', shareDrawer);
                }}
                className="py-2"
              >
                Instagram
              </button>
              <button
                onClick={() => {
                  if (shareDrawer) shareAd('tiktok', shareDrawer);
                }}
                className="py-2"
              >
                TikTok
              </button>
              <button
                onClick={() => {
                  if (shareDrawer) shareAd('whatsapp', shareDrawer);
                }}
                className="py-2"
              >
                WhatsApp
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
