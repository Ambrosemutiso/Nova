'use client';

import { useEffect, useState, useRef } from 'react';
import { FaRegHeart, FaHeart, FaRegCommentAlt, FaShare } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/context/AuthContext';
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// ---------------- TYPES ----------------
type Comment = {
  _id: string;
  userId: string;
  username: string;
  avatar: string;
  text: string;
  createdAt: string;
  likes: string[];
  replies: Comment[]; // 🔥 remove optional
};


type Ad = {
  _id: string;
  title: string;
  description?: string;
  mediaUrl: string;
  mediaType: 'video' | 'image';
  sellerId: string;
  category?: string;
  views: number;
  likes: string[];
  comments: Comment[];
  shares: number;
};

// ---------------- UTILS ----------------
function timeAgo(dateString: string) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  const intervals: any = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };
  for (let key in intervals) {
    const interval = Math.floor(seconds / intervals[key]);
    if (interval >= 1) return interval + key[0];
  }
  return 'now';
}

// ---------------- COMPONENT ----------------
export default function AdsFeedPage() {
  const { user } = useAuth();
  const userId = user?._id ?? '';
  const router = useRouter();

  const [ads, setAds] = useState<Ad[]>([]);
  const [commentDrawer, setCommentDrawer] = useState<Ad | null>(null);
  const [shareDrawer, setShareDrawer] = useState<Ad | null>(null);
  const [commentText, setCommentText] = useState('');
  const [heartBurst, setHeartBurst] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);

  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const lastTapRef = useRef<number>(0);

  const shortNum = (num: number) =>
    num >= 1_000_000
      ? (num / 1_000_000).toFixed(1) + 'm'
      : num >= 1000
      ? (num / 1000).toFixed(1) + 'k'
      : num.toString();

  // ---------------- FETCH ADS ----------------
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/ads/list');
        const data = await res.json();
        const merged = [...(data.sellerAds || []), ...(data.otherAds || [])];

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
            ? a.comments.map((c: any) => ({
                _id: String(c._id ?? 'temp-' + Date.now()),
                userId: String(c.userId ?? ''),
                username: c.username ?? 'Unknown',
                avatar: c.avatar ?? 'https://via.placeholder.com/40',
                text: String(c.text ?? ''),
                createdAt: c.createdAt ?? new Date().toISOString(),
                likes: Array.isArray(c.likes) ? c.likes.map(String) : [],
                replies: Array.isArray(c.replies)
                  ? c.replies.map((r: any) => ({
                      _id: String(r._id ?? 'temp-' + Date.now()),
                      userId: String(r.userId ?? ''),
                      username: r.username ?? 'Unknown',
                      avatar: r.avatar ?? 'https://via.placeholder.com/40',
                      text: String(r.text ?? ''),
                      createdAt: r.createdAt ?? new Date().toISOString(),
                      likes: Array.isArray(r.likes) ? r.likes.map(String) : [],
                      replies: [],
                    }))
                  : [],
              }))
            : [],
          shares: Number(a.shares ?? 0),
        }));

        setAds(normalized);
      } catch (err) {
        console.error('Failed to fetch ads', err);
      }
    })();
  }, []);

  // ---------------- VIDEO OBSERVER ----------------
  useEffect(() => {
    if (!ads.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLVideoElement;
          if (!el) return;
          const adId = el.dataset.id ?? '';

          if (entry.isIntersecting) {
            el.play().catch(() => {});
            fetch('/api/ads/list', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ adId, type: 'view' }),
            }).catch(() => {});
          } else {
            el.pause();
          }
        });
      },
      { threshold: 0.6 }
    );

    videoRefs.current.forEach((v) => v && observer.observe(v));
    return () => {
      videoRefs.current.forEach((v) => v && observer.unobserve(v));
      observer.disconnect();
    };
  }, [ads]);

  // ---------------- LIKE / UNLIKE AD ----------------
  const toggleLike = async (ad: Ad, withAnim = false) => {
    if (!userId) return;

    try {
      const res = await fetch('/api/ads/reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId: ad._id, action: 'like', userId }),
      });

      const data = await res.json();
      if (!res.ok) return console.error('Failed to like ad', data.error);

      setAds((prev) =>
        prev.map((a) => (a._id === ad._id ? { ...a, likes: data.likes } : a))
      );

      if (withAnim && data.liked) {
        setHeartBurst(ad._id);
        setTimeout(() => setHeartBurst(null), 600);
      }
    } catch (err) {
      console.error('Error liking ad:', err);
    }
  };

  // ---------------- LIKE / UNLIKE COMMENT ----------------
const toggleCommentLike = async (commentId: string) => {
  if (!userId || !commentDrawer) return;

  try {
    const res = await fetch("/api/ads/reaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adId: commentDrawer._id,
        action: "comment_like",
        userId,
        commentId,
      }),
    });

    const data = await res.json();
    if (!res.ok) return console.error("Failed to like comment", data.error);

    // --- Update ADS feed ---
    setAds(prev =>
      prev.map(ad =>
        ad._id === commentDrawer._id
          ? { ...ad, comments: data.comments }
          : ad
      )
    );

    // --- Update comment drawer (🔥 fixes real-time like on both comments & replies) ---
    setCommentDrawer(prev =>
      prev ? { ...prev, comments: data.comments } : prev
    );

  } catch (err) {
    console.error("Error liking comment:", err);
  }
};


  // ---------------- SUBMIT COMMENT ----------------
const submitComment = async () => {
  if (!commentDrawer) return;
  const text = commentText.trim();
  if (!text || !userId) return;

  try {
    const body: any = {
      adId: commentDrawer._id,
      action: "comment",
      userId,
      text,
      username: user?.name || "You",
      avatar: user?.image || "https://via.placeholder.com/40",
    };

    if (replyTo) body.replyTo = replyTo._id;

    const res = await fetch("/api/ads/reaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) return console.error("Failed to submit comment", data.error);

    // UPDATE ADS LIST
    setAds(prev =>
      prev.map(a =>
        a._id === commentDrawer._id ? { ...a, comments: data.comments } : a
      )
    );

    // UPDATE COMMENT DRAWER INSTANTLY
    setCommentDrawer(prev =>
      prev ? { ...prev, comments: data.comments } : prev
    );

    setCommentText("");
    setReplyTo(null);

  } catch (err) {
    console.error("Error submitting comment:", err);
  }
};


  // ---------------- DOUBLE TAP ----------------
  const handleDoubleTap = (ad: Ad) => {
    const now = Date.now();
    const diff = now - lastTapRef.current;
    if (diff < 350 && !ad.likes.includes(userId)) toggleLike(ad, true);
    lastTapRef.current = now;
  };

  // ---------------- SHARE ----------------
  const shareAd = async (platform: string, ad: Ad) => {
    fetch('/api/ads/reaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId: ad._id, action: 'share', userId }),
    }).catch(() => {});

    if (navigator.share) {
      try {
        await navigator.share({ title: ad.title, text: ad.description, url: ad.mediaUrl });
        return;
      } catch {}
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
      case 'tiktok':
        try {
          await navigator.clipboard.writeText(ad.mediaUrl);
          alert('Link copied! Share it in the app.');
        } catch {}
        break;
      default:
        window.open(ad.mediaUrl, '_blank');
    }
  };

  // ---------------- JSX ----------------
  return (
    <div className="relative w-full h-screen overflow-y-scroll snap-y snap-mandatory bg-black z-[9999]">
      <button
      onClick={() => router.back()}
      className="fixed top-4 left-4 z-[99999] p-2 rounded-full bg-black/40 backdrop-blur 
             text-white hover:bg-black/60 transition">
              <ChevronLeft size={26} />
              </button>

      {ads.map((ad, index) => (
        <div key={ad._id} className="h-screen snap-start relative" onClick={() => handleDoubleTap(ad)}>
          {ad.mediaType === 'video' ? (
            <video
              ref={(el) => { videoRefs.current[index] = el ?? null; }}
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

          {/* Heart animation */}
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

          {/* Bottom info */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute bottom-32 left-0 w-full p-6 pb-10 bg-gradient-to-t from-black/80 to-transparent text-white"
            >
            <h2 className="text-xl font-bold">{ad.title}</h2>
            {ad.description && <p className="text-gray-300 text-sm mt-1 line-clamp-2">{ad.description}</p>}
            {ad.category && <p className="text-orange-400 mt-1">#{ad.category}</p>}
          </motion.div>

          {/* Reactions */}
          <div className="absolute right-4 bottom-32 flex flex-col gap-6 text-white">
            <motion.button
              whileTap={{ scale: 1.2 }}
              onClick={(e) => { e.stopPropagation(); toggleLike(ad, true); }}
              className="flex flex-col items-center p-3 bg-white/20 rounded-full"
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

            <motion.button
              whileTap={{ scale: 1.1 }}
              onClick={(e) => { e.stopPropagation(); setCommentDrawer(ad); }}
              className="flex flex-col items-center p-3 bg-white/20 rounded-full"
            >
              <FaRegCommentAlt size={24} />
              <span className="text-xs mt-1">{shortNum(ad.comments.length)}</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 1.1 }}
              onClick={(e) => { e.stopPropagation(); setShareDrawer(ad); }}
              className="flex flex-col items-center p-3 bg-white/20 rounded-full"
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
            transition={{ type: 'spring', bounce: 0.15 }}
            className="fixed bottom-0 left-0 w-full h-[75vh] bg-white rounded-t-3xl z-[99999] flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h3 className="text-lg font-semibold">Comments</h3>
              <button onClick={() => setCommentDrawer(null)} className="text-gray-500 text-sm">Close</button>
            </div>

            {replyTo && (
              <div className="px-5 py-2 text-sm bg-gray-100 flex items-center justify-between">
                <p>Replying to <b>@{replyTo.username}</b></p>
                <button onClick={() => setReplyTo(null)} className="text-xs text-gray-500">Cancel</button>
              </div>
            )}

<div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
{/* FALLBACK WHEN NO COMMENTS */}
{commentDrawer.comments.length === 0 && (
  <div className="w-full flex flex-col items-center justify-center py-12 animate-fadeIn opacity-0">

    {/* Illustration */}
    <div className="w-32 h-32 mb-6">
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="100" cy="100" r="80" fill="#f3f4f6" />
        <path
          d="M60 90h80M60 115h55"
          stroke="#9ca3af"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="75" cy="70" r="6" fill="#9ca3af" />
      </svg>
    </div>

    {/* Message */}
    <p className="text-gray-500 text-sm">
      No comments yet —{" "}
      <span className="font-semibold text-gray-700">be the first to comment</span>
    </p>

    {/* Pulsing arrow */}
    <div className="mt-8 flex flex-col items-center">
      <div className="animate-bounce">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14" />
          <path d="M5 12l7 7 7-7" />
        </svg>
      </div>

      <p className="text-xs text-gray-400 mt-2">
        Type below to add a comment
      </p>
    </div>
  </div>
)}


  {/* COMMENTS LIST */}
  {commentDrawer.comments.length > 0 &&
    commentDrawer.comments.map((c) => (
      <CommentItem
        key={c._id}
        comment={c}
        onReply={setReplyTo}
        onLike={toggleCommentLike}
        userId={userId}
      />
    ))}
</div>


            <div className="p-3 border-t bg-white">
              <div className="flex items-center gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 p-3 bg-gray-100 rounded-full outline-none"
                />
                <button onClick={submitComment} className="bg-orange-500 text-white px-4 py-2 rounded-full">
                  Send
                </button>
              </div>
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
              {['facebook', 'instagram', 'tiktok', 'whatsapp'].map((plat) => (
                <button key={plat} className="py-2" onClick={() => shareDrawer && shareAd(plat, shareDrawer)}>
                  {plat.charAt(0).toUpperCase() + plat.slice(1)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
function CommentItem({ comment, onReply, onLike, userId }: {
  comment: Comment;
  onReply: (c: Comment) => void;
  onLike: (id: string) => void;
  userId: string;
}) {

  const [showReplies, setShowReplies] = useState(false);

  return (
    <div className="flex flex-col gap-3">

      {/* MAIN COMMENT */}
      <div className="flex gap-3">
        <img src={comment.avatar} className="w-10 h-10 rounded-full object-cover" />
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">@{comment.username}</p>
            <p className="text-xs text-gray-500">{timeAgo(comment.createdAt)}</p>
          </div>

          <p className="text-sm mt-1">{comment.text}</p>

          <div className="flex items-center gap-4 mt-2 text-xs">
            <button onClick={() => onReply(comment)} className="text-gray-600">Reply</button>

            {comment.replies?.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-gray-600"
              >
                {showReplies
                  ? `Hide replies`
                  : `View replies (${comment.replies.length})`}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center text-red-500">
          <button onClick={() => onLike(comment._id)}>
            <FaHeart 
              className={comment.likes.includes(userId) ? 'text-red-600' : 'text-gray-400'} 
              size={18} 
            />
          </button>
          <p className="text-xs text-gray-600">{comment.likes.length}</p>
        </div>
      </div>

      {/* REPLIES */}
      {showReplies && comment.replies?.length > 0 && (
        <div className="ml-12 space-y-3">
          {comment.replies.map((r) => (
            <CommentItem
              key={r._id}
              comment={r}
              onReply={onReply}
              onLike={onLike}
              userId={userId}
            />
          ))}
        </div>
      )}

    </div>
  );
}
