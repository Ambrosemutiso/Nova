'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  MessageSquare, Star, Send, Sparkles, ChevronRight,
  ChevronLeft, Quote, Heart, X, Zap, Shield, TrendingUp
} from 'lucide-react';

/* ════════════════════════════════════════════════════════════════
   CONFETTI
════════════════════════════════════════════════════════════════ */
const CONFETTI_COLORS = ['#f97316', '#fb923c', '#fdba74', '#fbbf24', '#1f2937', '#6b7280'];
function Confetti() {
  const pieces = Array.from({ length: 48 }, (_, i) => i);
  return (
    <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden">
      {pieces.map((i) => (
        <div
          key={i}
          className="absolute top-0 rounded-sm opacity-90"
          style={{
            left: `${Math.random() * 100}%`,
            width: `${6 + Math.random() * 6}px`,
            height: `${10 + Math.random() * 8}px`,
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animation: `feedbackConfetti ${1.6 + Math.random() * 2.2}s ease-in ${Math.random() * 0.9}s forwards`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
      <style>{`
        @keyframes feedbackConfetti {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(900deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   THANK YOU MODAL
════════════════════════════════════════════════════════════════ */
function ThankYouModal({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <>
      <Confetti />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden text-center"
        >
          <div className="bg-gradient-to-br from-[#1c1c1e] to-[#111213] px-6 pt-10 pb-8 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
            >
              <X size={13} />
            </button>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.18, type: 'spring', stiffness: 300 }}
              className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30"
            >
              <Heart className="w-9 h-9 text-white fill-white" />
            </motion.div>
            <h2 className="text-white font-black text-2xl leading-tight">
              Thank you{name ? `, ${name.split(' ')[0]}` : ''}! 🎉
            </h2>
            <p className="text-gray-400 text-sm mt-2 leading-relaxed">
              Your feedback helps us build a better NovaXmax for every seller.
            </p>
          </div>

          <div className="px-6 py-5 space-y-3">
            {[
              { icon: <Zap size={14} className="text-orange-500" />, text: 'Our team reviews every submission within 48 hours' },
              { icon: <Shield size={14} className="text-orange-500" />, text: 'Your identity is kept confidential' },
              { icon: <TrendingUp size={14} className="text-orange-500" />, text: 'Feedback like yours shapes our next updates' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5 text-left">
                {item.icon}
                <p className="text-xs text-orange-700 leading-snug">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="px-6 pb-6">
            <button
              onClick={onClose}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl transition shadow-md shadow-orange-200 active:scale-[0.98]"
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   INTERACTIVE STAR RATING
════════════════════════════════════════════════════════════════ */
function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  const labels = ['', 'Very Bad', 'Poor', 'Average', 'Good', 'Excellent'];
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            whileTap={{ scale: 0.82 }}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none"
          >
            <Star
              size={30}
              className={`transition-all duration-150 ${
                star <= (hover || value)
                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]'
                  : 'text-gray-200 fill-gray-200'
              }`}
            />
          </motion.button>
        ))}
        <AnimatePresence mode="wait">
          {(hover || value) > 0 && (
            <motion.span
              key={hover || value}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="ml-2 text-sm font-bold text-amber-500"
            >
              {labels[hover || value]}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   FAKE REVIEWS DATA
════════════════════════════════════════════════════════════════ */
const REVIEWS = [
  {
    name: 'James Mwangi',
    role: 'Electronics Seller · Nairobi',
    avatar: 'JM',
    rating: 5,
    text: 'The seller dashboard is genuinely one of the best I have used. Everything is clearly laid out and the analytics help me understand exactly how my products are performing.',
    time: '2 days ago',
  },
  {
    name: 'Aisha Kamau',
    role: 'Fashion Seller · Mombasa',
    avatar: 'AK',
    rating: 5,
    text: 'I love the installment feature. My customers keep coming back and completing payments. My sales have gone up by almost 40% since I started listing on NovaXmax.',
    time: '5 days ago',
  },
  {
    name: 'Brian Otieno',
    role: 'Phone Accessories · Kisumu',
    avatar: 'BO',
    rating: 4,
    text: 'Uploading products is fast and the category system makes it easy for buyers to find what I sell. Would love to see bulk upload in the future!',
    time: '1 week ago',
  },
  {
    name: 'Grace Njeri',
    role: 'Home & Kitchen · Nakuru',
    avatar: 'GN',
    rating: 5,
    text: 'The order management page is clean and the delivery label feature saves me so much time. NovaXmax really thinks about sellers.',
    time: '2 weeks ago',
  },
  {
    name: 'Samuel Cheruiyot',
    role: 'Sports Equipment · Eldoret',
    avatar: 'SC',
    rating: 5,
    text: 'Getting started was super easy. The team reached out within a day of me registering and helped me set everything up. That personal touch matters a lot.',
    time: '3 weeks ago',
  },
];

function ReviewCard({ review }: { review: typeof REVIEWS[0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-full flex flex-col"
    >
      <Quote size={18} className="text-orange-200 mb-3 flex-shrink-0" />
      <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-4">"{review.text}"</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
            {review.avatar}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800 leading-none">{review.name}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{review.role}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={10} className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
            ))}
          </div>
          <span className="text-[9px] text-gray-400">{review.time}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════ */
const inputCls = `w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800
  placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all`;

export default function FeedbackPage() {
  const [loading, setLoading] = useState(false);
  const [rating, setRating]   = useState(0);
  const [showThankYou, setShowThankYou] = useState(false);
  const [submittedName, setSubmittedName] = useState('');
  const [reviewPage, setReviewPage] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  const REVIEWS_PER_PAGE = 2;
  const totalPages = Math.ceil(REVIEWS.length / REVIEWS_PER_PAGE);
  const visibleReviews = REVIEWS.slice(reviewPage * REVIEWS_PER_PAGE, reviewPage * REVIEWS_PER_PAGE + REVIEWS_PER_PAGE);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a star rating'); return; }

    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload = {
      name: fd.get('name') as string,
      email: fd.get('email'),
      type: fd.get('type'),
      rating,
      message: fd.get('message') as string,
    };

    if (!payload.message || payload.message.length < 10) {
      toast.error('Feedback too short — please add more detail');
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSubmittedName(payload.name);
      setShowThankYou(true);
      form.reset();
      setRating(0);
    } catch {
      toast.error('Failed to send feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4">

        {/* ── Page header ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <Sparkles size={12} />
            Your voice shapes NovaXmax
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">
            Share Your<br />
            <span className="text-orange-500">Feedback.</span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-base mt-4 leading-relaxed">
            Tell us what you love, what we can improve, or any ideas you have. Every submission is read by our team.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start">

          {/* ── Reviews panel ───────────────────────────────────────────── */}
          <div className="order-2 lg:order-1">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">What sellers are saying</p>
                <h2 className="text-xl font-black text-gray-800">Seller Reviews</h2>
              </div>
              {/* avg rating callout */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 text-center">
                <p className="text-3xl font-black text-orange-500 leading-none">4.9</p>
                <div className="flex justify-center gap-0.5 mt-1">
                  {[1,2,3,4,5].map(s => <Star key={s} size={9} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{REVIEWS.length}+ reviews</p>
              </div>
            </div>

            {/* Review cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <AnimatePresence mode="wait">
                {visibleReviews.map((r) => (
                  <ReviewCard key={r.name} review={r} />
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setReviewPage(i)}
                    className={`transition-all rounded-full ${
                      i === reviewPage ? 'w-6 h-2 bg-orange-500' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setReviewPage(p => Math.max(0, p - 1))}
                  disabled={reviewPage === 0}
                  className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setReviewPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={reviewPage === totalPages - 1}
                  className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Trust strip */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { label: 'Response Time',   value: '< 48h',    sub: 'Team reviews all feedback' },
                { label: 'Satisfaction',    value: '97%',       sub: 'Of sellers rate us 4★+' },
                { label: 'Updates Shipped', value: '60+',       sub: 'From seller suggestions' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
                  <p className="text-xl font-black text-gray-800">{stat.value}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">{stat.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Feedback form ───────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="order-1 lg:order-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
          >
            {/* Form header */}
            <div className="bg-gradient-to-br from-[#1c1c1e] to-[#111213] px-6 pt-7 pb-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center">
                  <MessageSquare size={16} className="text-white" />
                </div>
                <h2 className="text-white font-black text-lg">Your Feedback</h2>
              </div>
              <p className="text-gray-400 text-xs ml-12">All fields marked * are required</p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-6 space-y-4">

              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Name *</label>
                  <input name="name" required placeholder="e.g. James Mwangi" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Email *</label>
                  <input name="email" type="email" required placeholder="you@email.com" className={inputCls} />
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Feedback Type *</label>
                <select name="type" className={inputCls + ' cursor-pointer'}>
                  <option>General Feedback</option>
                  <option>Bug Report</option>
                  <option>Feature Request</option>
                  <option>Complaint</option>
                </select>
              </div>

              {/* Interactive star rating */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">Your Rating *</label>
                <StarRating value={rating} onChange={setRating} />
                {rating === 0 && (
                  <p className="text-[11px] text-gray-400 mt-1">Tap a star to rate your experience</p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Your Message *</label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder="Tell us what you think — what's working, what isn't, or what you'd love to see next…"
                  className={inputCls + ' resize-none'}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl transition shadow-md shadow-orange-200 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send size={15} /> Submit Feedback
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-gray-400 leading-relaxed">
                Your identity is kept confidential. By submitting you agree to our{' '}
                <span className="text-orange-500 font-semibold cursor-pointer hover:underline">Privacy Policy</span>.
              </p>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Thank you modal */}
      <AnimatePresence>
        {showThankYou && (
          <ThankYouModal
            name={submittedName}
            onClose={() => setShowThankYou(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}