'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CldImage } from 'next-cloudinary';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ImageZoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { useCart } from '@/app/context/CartContext';
import Image from 'next/image';
import { Star, StarHalf, StarOff, ShoppingCart, X } from 'lucide-react';
import type { Product } from '@/app/types/product';
import RelatedProducts from '@/components/RelatedProducts'
import CustomersAlsoViewed from "@/components/CustomersAlsoViewed";
import RecentlyViewed from "@/components/RecentlyViewed";
import SaveToRecentlyViewed from '@/components/SaveToRecentlyViewed';
import BehaviorTracker from '@/components/BehaviourTracker';

type Review = {
  _id: string;
  userId: string;
  userName: string;
  comment: string;
  rating: number;
  createdAt: string;
};
type Seller = {
  name: string;
  score: number;
  isVerified: boolean;
  followers: string[]; 
};

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewUser, setReviewUser] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState<number | ''>(0);
  const { addToCart, cartItems, increaseQuantity, decreaseQuantity } = useCart();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportMessage, setReportMessage] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [reportSuccess, setReportSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setScreenshot(file);
  };

  const handleReportSubmit = async () => {
    const formData = new FormData();
   formData.append('productId', Array.isArray(id) ? id[0] : id || '');
    formData.append('userId', userId || '');
    formData.append('reason', reportReason);
    formData.append('message', reportMessage);
    if (screenshot) formData.append('screenshot', screenshot);

    try {
      const res = await fetch('/api/report-product', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setReportSuccess(true);
        setReportReason('');
        setReportMessage('');
        setScreenshot(null);
      } else {
        console.error('Report submission failed');
      }
    } catch (err) {
      console.error('Error submitting report:', err);
    }
  };

  useEffect(() => {
    if (reportSuccess) {
      const timeout = setTimeout(() => setReportSuccess(false), 4000);
      return () => clearTimeout(timeout);
    }
  }, [reportSuccess]);



  useEffect(() => {
    if (typeof window !== 'undefined') {
      const uid = localStorage.getItem('userId');
      if (uid) setUserId(uid);
    }
  }, []);

  const sellerId = product?.sellerId;

  useEffect(() => {
    const fetchSeller = async () => {
      if (!sellerId) return;
      try {
        const res = await fetch(`/api/user/${sellerId}`);
        if (!res.ok) {
          console.warn('Seller not found or fetch failed');
          return;
        }

        const data = await res.json();
        setSeller(data);
        setFollowersCount(data.followers?.length || 0);

        if (userId && data.followers?.includes(userId)) {
          setIsFollowing(true);
        }
      } catch (error) {
        console.error('Error fetching seller:', error);
      }
    };

    fetchSeller();
  }, [sellerId, userId]);

  const handleFollowToggle = async () => {
    if (!userId || !sellerId) return;

    try {
      const res = await fetch(`/api/user/${sellerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        console.warn('Follow/unfollow request failed');
        return;
      }

      const data = await res.json();
      setIsFollowing(data.isFollowing);
      setFollowersCount(data.followers);
    } catch (err) {
      console.error('Follow/unfollow failed:', err);
    }
  };



  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/product/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();
        setProduct(data.product);
      } catch (err) {
        console.error('Error fetching product:', err);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/review/${id}`);
        if (!res.ok) throw new Error('Failed to fetch reviews');
        const data = await res.json();
        setReviews(data.reviews);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };

    fetchProduct();
    fetchReviews();
  }, [id]);

  const calculateDiscount = (oldPrice: number, newPrice: number): number => {
    return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
  };

  const getPublicId = (url?: string) => {
    if (!url || typeof url !== 'string') return '';
    const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    return match ? match[1] : url;
  };

    useEffect(() => {
    const userReviewed = reviews.some(
      (r) => r.userName.trim().toLowerCase() === reviewUser.trim().toLowerCase()
    );
    setHasReviewed(userReviewed);
  }, [reviewUser, reviews]);


  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product._id,
      name: product.name,
      images: product.images,
      calculatedPrice: product.calculatedPrice,
      quantity: 1,
    });
  };

  const averageRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<Star key={i} className="text-yellow-500 w-5 h-5" fill="currentColor" />);
      } else if (rating >= i - 0.5) {
        stars.push(<StarHalf key={i} className="text-yellow-500 w-5 h-5" fill="currentColor" />);
      } else {
        stars.push(<StarOff key={i} className="text-gray-300 w-5 h-5" />);
      }
    }
    return stars;
  };

  if (!product)
    return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-12 h-12 border-4 border-orange-500 border-dashed rounded-full animate-spin"></div>
    </div>
    );

return (
  <div className="max-w-6xl mx-auto px-4 pt-28 pb-10"> {/* pt-28 to offset navbar height */}
    
    {/* Breadcrumb */}
    <div className="mb-6">
      <nav className="text-sm text-gray-500">
        Home / Shop / {product.category} / <span className="text-orange-700 font-medium">{product.name}</span>
      </nav>
    </div>

    {/* Main Product Section */}
    <div className="bg-white rounded-lg shadow-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

      {/* Image Section */}
      <div className="relative">
        <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-0.5 rounded-bl-lg text-sm z-10">
          {calculateDiscount(product.oldPrice, product.calculatedPrice)}% OFF
        </div>

        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 3000 }}
          loop
          spaceBetween={10}
          slidesPerView={1}
          allowTouchMove={true}
          className="rounded-md"
        >
          {product.images.slice(0, 4).map((image, index) => (
            <SwiperSlide key={index} onClick={() => setZoomedImage(image)}>
              <CldImage
                src={getPublicId(image)}
                alt={product.name}
                width="600"
                height="400"
                className="rounded-md object-cover w-full h-64"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>

{/* Product Info Section */}
<div className="px-4 py-5 space-y-4 bg-white rounded-md shadow-sm text-gray-800">
  <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

  <p className="text-sm font-medium text-blue-600">
    Brand: <span className="capitalize">{product.brand}</span>
  </p>

  <div className="flex items-center gap-3">
    <span className="text-2xl font-extrabold text-orange-600">
      Ksh {product.calculatedPrice.toLocaleString()}
    </span>
    <span className="text-base text-gray-400 line-through">
      Ksh {product.oldPrice.toLocaleString()}
    </span>
    <span className="ml-auto text-sm px-2 py-1 bg-red-100 text-red-600 rounded-md">
      {Math.round(((product.oldPrice - product.calculatedPrice) / product.oldPrice) * 100)}% OFF
    </span>
  </div>

  <p className={`text-sm font-semibold ${product.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
    {product.quantity > 0 ? `${product.quantity} unit${product.quantity > 1 ? 's' : ''} left` : 'Out of stock'}
  </p>

  <p className="text-sm text-gray-600">
    + Shipping from <strong>{product.county}</strong>: <span className="text-gray-800 font-semibold">Ksh 200</span>
  </p>

  <div className="flex items-center space-x-2">
    <div className="flex text-yellow-500">
      {renderStars(averageRating)}
    </div>
    <span className="text-sm text-gray-600">
      ({averageRating.toFixed(1)} out of 5 from {reviews.length} review{reviews.length !== 1 ? 's' : ''})
    </span>
  </div>
</div>


    {/* Product Description */}
    {product.description && (
      <div className="mt-10 bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Product Description</h2>
        <div
          className="prose max-w-none text-gray-800"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      </div>
    )}


{product.keyFeatures && product.keyFeatures.length > 0 && (
  <div className="mt-6 bg-white shadow rounded-lg p-6">
    <h2 className="text-xl font-semibold mb-4 border-b pb-2">Key Features</h2>
    <ul className="list-disc list-inside text-gray-700 space-y-1">
      {product.keyFeatures.map((feature, index) => (
        <li key={index}>{feature}</li>
      ))}
    </ul>
  </div>
)}


{product.whatsInTheBox && (
  <div className="mt-6 bg-white shadow rounded-lg p-6">
<h2 className="text-xl font-semibold mb-4 border-b pb-2">What&apos;s in the Box</h2>
    <p className="text-gray-700">{product.whatsInTheBox}</p>
  </div>
)}


<div className="mt-6 bg-white shadow rounded-lg p-6">
  <h2 className="text-xl font-semibold mb-4 border-b pb-2">Specifications</h2>
  <div className="grid grid-cols-2 gap-4 text-gray-700">
    {product.brand && <div><span className="font-medium">Brand:</span> {product.brand}</div>}
    {product.model && <div><span className="font-medium">Model:</span> {product.model}</div>}
    {product.mainMaterial && <div><span className="font-medium">Main Material:</span> {product.mainMaterial}</div>}
    {product.color && <div><span className="font-medium">Color:</span> {product.color}</div>}
    {product.dimensions && <div><span className="font-medium">Dimensions:</span> {product.dimensions}</div>}
    {product.weight && <div><span className="font-medium">Weight:</span> {product.weight}</div>}
    {product.warranty && <div><span className="font-medium">Warranty:</span> {product.warranty}</div>}
  </div>
</div>


      {zoomedImage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="relative p-4 bg-white rounded-lg">
              <X className="w-6 h-6 text-red-500 cursor-pointer" onClick={() => setZoomedImage(null)} />
            <ImageZoom>
              <Image
                src={zoomedImage}
                alt="Zoomed Image"
                width={600}
                height={600}
                className="object-contain w-full h-full"
                style={{ maxWidth: '600px', maxHeight: '600px' }}
              />
            </ImageZoom>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative shadow-lg">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
              onClick={() => setShowReviewModal(false)}
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4">Write a Review</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!reviewUser || !reviewComment || !reviewRating) return;

                try {
                  const res = await fetch(`/api/review/${product._id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      userName: reviewUser,
                      comment: reviewComment,
                      rating: reviewRating,
                    }),
                  });

                  if (!res.ok) throw new Error('Failed to submit review');
                  const data = await res.json();
                  setReviews((prev) => [...prev, data.review]);

                  setReviewUser('');
                  setReviewComment('');
                  setReviewRating(0);
                  setShowReviewModal(false);
                } catch (err) {
                  console.error('Error submitting review:', err);
                }
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium">Comment</label>
                <textarea
                  className="mt-1 p-2 border rounded w-full"
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium">Rating (1–5)</label>
                <input
                  type="number"
                  className="mt-1 p-2 border rounded w-full"
                  min="1"
                  max="5"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  required
                />
              </div>

        <button
          className={`bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 ${
            hasReviewed || !reviewUser ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={() => !hasReviewed && reviewUser && setShowReviewModal(true)}
          disabled={hasReviewed || !reviewUser}
        
  type="submit"
>
  Submit Review
</button>

            </form>
          </div>
        </div>
      )}

      <SaveToRecentlyViewed id={product._id.toString()} />
      <RecentlyViewed />
      <RelatedProducts name={product.name} currentId={product._id.toString()} />
      <CustomersAlsoViewed productId={product._id.toString()} />
      <BehaviorTracker product={product} />

    <>
      {/* 🏪 Seller Info UI */}
      {seller && (
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-gray-800">
                  {seller.name || 'Seller Name'}
                </span>
                {seller.isVerified && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                    ✅ Verified Seller
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                Seller Score: <span className="font-semibold">{seller.score ?? 'N/A'}</span> • Followers:{' '}
                <span className="font-semibold">{followersCount}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleFollowToggle}
            className={`text-sm px-4 py-2 rounded-full border transition duration-200 ${
              isFollowing
                ? 'text-gray-700 border-gray-400 hover:bg-gray-100'
                : 'text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white'
            }`}
          >
            {isFollowing ? 'Unfollow Seller' : 'Follow Seller'}
          </button>
        </div>
      )}
    </>

      {/* ⭐ Ratings & Reviews Section */}
      <div className="mt-10 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Customer Ratings & Reviews</h2>
        <div className="flex items-center mb-4">
          {renderStars(averageRating)}
          <span className="ml-2 text-sm text-gray-600">
            ({averageRating.toFixed(1)} out of 5 from {reviews.length} reviews)
          </span>
        </div>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="border-b pb-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{review.userName}</p>
                  <div className="flex">{renderStars(review.rating)}</div>
                </div>
                <p className="text-gray-700 mt-1">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        )}
      </div>
      <div className="mt-10 bg-white p-6 rounded-lg shadow">
  <h2 className="text-lg font-semibold mb-4">Leave a Review</h2>
  <button
    className="bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
    onClick={() => setShowReviewModal(true)}
    disabled={hasReviewed}
  >
    {hasReviewed ? 'You have already reviewed' : 'Write a Review'}
  </button>
</div>

<button
  className="text-sm text-red-600 underline mt-4"
  onClick={() => setShowReportModal(true)}
>
  Report Incorrect Product Details
</button>

{showReportModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-5 rounded shadow-md w-11/12 max-w-md space-y-3">
      <h2 className="text-lg font-semibold">Report Product</h2>

      <label className="block text-sm font-medium">Reason</label>
      <select
        value={reportReason}
        onChange={(e) => setReportReason(e.target.value)}
        className="w-full border border-gray-300 rounded p-2"
      >
        <option value="">Select a reason</option>
        <option value="Wrong price">Wrong price</option>
        <option value="Incorrect description">Incorrect description</option>
        <option value="Misleading images">Misleading images</option>
        <option value="Inappropriate content">Inappropriate content</option>
        <option value="Other">Other</option>
      </select>

      <label className="block text-sm font-medium">Description (optional)</label>
      <textarea
        className="w-full border border-gray-300 rounded p-2"
        rows={3}
        value={reportMessage}
        onChange={(e) => setReportMessage(e.target.value)}
        placeholder="Explain the issue (optional)"
      />

      <label className="block text-sm font-medium">Screenshot (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full"
        />
      <div className="flex justify-end space-x-2 pt-2">
        <button
          onClick={() => setShowReportModal(false)}
          className="px-3 py-1 bg-gray-300 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleReportSubmit}
          className="px-3 py-1 bg-red-600 text-white rounded"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
)}
      {reportSuccess && (
        <p className="text-green-600 mt-2">Report submitted successfully!</p>
      )}


      {/* 🛒 Add to Cart Section */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
        {(() => {
          const cartItem = cartItems.find((item) => item.id === product._id);
          return cartItem ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => decreaseQuantity(product._id)}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              >
                -
              </button>
              <span>{cartItem.quantity}</span>
              <button
                onClick={() => increaseQuantity(product._id)}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-2 bg-orange-600 text-white py-3 px-6 rounded-full shadow-xl hover:bg-orange-700 transition duration-300"
              >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
          );
        })()}
      </div>
    </div>
  );
}

