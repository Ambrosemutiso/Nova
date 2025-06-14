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
  userName: string;
  comment: string;
  rating: number;
  createdAt: string;
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
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">{product.name}</h1>

      <div className="relative bg-white p-4 shadow-lg rounded-lg hover:shadow-xl transition duration-300">
        <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-0.5 rounded-bl-lg text-sm">
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
        <div className="mt-4">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 line-through">Ksh.{product.oldPrice}</span>
            <span className="text-red-600 font-bold">Ksh.{product.calculatedPrice}</span>
          </div>
{product.description && (
  <div className="mt-6 bg-white shadow rounded-lg p-6">
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
        >
          {hasReviewed ? 'You have already reviewed this product' : 'Write a Review'}
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
    </div>
    </div>
  );
}
