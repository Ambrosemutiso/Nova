'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/app/context/CartContext';
import { CldImage } from 'next-cloudinary';
import RecentlyViewed from '@/components/RecentlyViewed';
import SponsoredProducts from '@/components/SponsoredProducts';
import TopPicksForYou from '@/components/TopPicksForYou';
import SuggestedForYou from '@/components/SuggestedForYou';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Player } from '@lottiefiles/react-lottie-player';
import GlobalPayModal from '@/components/payments/GlobalPayModal';

type CartProps = {
  onOpenBuyerLogin?: () => void;
  onOpenSellerLogin?: () => void;
};


// 🗺️ County → Town mapping (Kenya)
export const countyTownMap: Record<string, string[]> = {
  Nairobi: ['Westlands', 'Kasarani', 'Embakasi', 'Langata', 'Dagoretti', 'Starehe', 'Makadara', 'Kibra'],
  Mombasa: ['Nyali', 'Likoni', 'Kisauni', 'Changamwe', 'Mvita', 'Jomvu'],
  Kisumu: ['Kisumu Central', 'Kisumu East', 'Kisumu West', 'Muhoroni', 'Nyando', 'Seme'],
  Nakuru: ['Nakuru Town East', 'Nakuru Town West', 'Naivasha', 'Gilgil', 'Subukia', 'Molo', 'Bahati'],
  Kiambu: ['Thika', 'Ruiru', 'Juja', 'Limuru', 'Kikuyu', 'Githunguri', 'Kabete'],
  Machakos: ['Machakos Town', 'Kangundo', 'Mwala', 'Kathiani', 'Mavoko', 'Yatta'],
  'Murang\'a': ['Murang\'a Town', 'Kandara', 'Kangema', 'Maragua', 'Kiharu', 'Mathioya'],
  Nyeri: ['Nyeri Town', 'Othaya', 'Tetu', 'Mathira', 'Mukurweini', 'Kieni'],
  Kirinyaga: ['Kerugoya', 'Kutus', 'Sagana', 'Baricho', 'Mwea'],
  Meru: ['Meru Town', 'Maua', 'Nkubu', 'Timau', 'Tigania', 'Igembe'],
  Embu: ['Embu Town', 'Runyenjes', 'Manyatta', 'Siakago'],
  TharakaNithi: ['Chuka', 'Chogoria', 'Marimanti', 'Kanyanga'],
  Kitui: ['Kitui Town', 'Mutomo', 'Mwingi', 'Kabati', 'Kwa Vonza'],
  Makueni: ['Wote', 'Makindu', 'Kibwezi', 'Mtito Andei', 'Emali', 'Sultan Hamud'],
  Nyandarua: ['Ol Kalou', 'Engineer', 'Njabini', 'Ndemi', 'Kinangop'],
  Laikipia: ['Nanyuki', 'Rumuruti', 'Nyahururu', 'Kinamba', 'Doldol'],
  Turkana: ['Lodwar', 'Kakuma', 'Lokichogio', 'Lorugum'],
  WestPokot: ['Kapenguria', 'Makutano', 'Chepareria', 'Sigor'],
  Samburu: ['Maralal', 'Baragoi', 'Wamba'],
  TransNzoia: ['Kitale', 'Endebess', 'Kiminini', 'Cherangany'],
  UasinGishu: ['Eldoret', 'Turbo', 'Ziwa', 'Moiben', 'Kesses'],
  ElgeyoMarakwet: ['Iten', 'Tambach', 'Chebiemit', 'Kapsowar'],
  Nandi: ['Kapsabet', 'Nandi Hills', 'Mosoriot', 'Kobujoi'],
  Baringo: ['Kabarnet', 'Eldama Ravine', 'Marigat', 'Mogotio'],
  Kericho: ['Kericho Town', 'Litein', 'Londiani', 'Kipkelion'],
  Bomet: ['Bomet Town', 'Sotik', 'Longisa', 'Chepalungu'],
  Kakamega: ['Kakamega Town', 'Mumias', 'Lugari', 'Malava', 'Matungu'],
  Bungoma: ['Bungoma Town', 'Webuye', 'Kimilili', 'Chwele', 'Sirisia'],
  Busia: ['Busia Town', 'Nambale', 'Malaba', 'Butula', 'Funyula'],
  Siaya: ['Siaya Town', 'Bondo', 'Ugunja', 'Gem', 'Alego Usonga'],
  HomaBay: ['Homa Bay Town', 'Rongo', 'Mbita', 'Ndhiwa', 'Kabondo'],
  Migori: ['Migori Town', 'Awendo', 'Rongo', 'Kehancha', 'Isebania'],
  Kisii: ['Kisii Town', 'Ogembo', 'Nyamache', 'Keroka'],
  Nyamira: ['Nyamira Town', 'Keroka', 'Ekerenyo', 'Nyansiongo'],
  Narok: ['Narok Town', 'Kilgoris', 'Ololulung\'a', 'Suswa'],
  Kajiado: ['Kajiado Town', 'Ngong', 'Kitengela', 'Ongata Rongai', 'Loitokitok'],
  Kwale: ['Ukunda', 'Msambweni', 'Lunga Lunga', 'Kinango'],
  Kilifi: ['Kilifi Town', 'Malindi', 'Kaloleni', 'Rabai', 'Mariakani'],
  TaitaTaveta: ['Voi', 'Taveta', 'Wundanyi', 'Mwatate'],
  Garissa: ['Garissa Town', 'Modogashe', 'Balambala', 'Dadaab'],
  Wajir: ['Wajir Town', 'Griftu', 'Habaswein', 'Eldas', 'Buna'],
  Mandera: ['Mandera Town', 'Elwak', 'Rhamu', 'Lafey'],
  Marsabit: ['Marsabit Town', 'Moyale', 'Laisamis', 'North Horr'],
  Isiolo: ['Isiolo Town', 'Kinna', 'Garbatulla', 'Merti'],
  TanaRiver: ['Hola', 'Garsen', 'Bura', 'Wenje'],
  Lamu: ['Lamu Town', 'Mpeketoni', 'Hindi', 'Faza'],
  Vihiga: ['Mbale', 'Luanda', 'Chavakali', 'Hamisi'],
};

// 🚚 Base County Delivery Fees
const baseCountyFees: Record<string, number> = {
  Nairobi: 0,
  Mombasa: 180,
  Kisumu: 160,
  Nakuru: 170,
  Kiambu: 150,
  Machakos: 160,
  'Murang\'a': 160,
  Nyeri: 170,
  Kirinyaga: 160,
  Meru: 180,
  Embu: 170,
  TharakaNithi: 180,
  Kitui: 200,
  Makueni: 180,
  Nyandarua: 180,
  Laikipia: 190,
  Turkana: 300,
  WestPokot: 280,
  Samburu: 250,
  TransNzoia: 190,
  UasinGishu: 180,
  ElgeyoMarakwet: 190,
  Nandi: 180,
  Baringo: 190,
  Kericho: 170,
  Bomet: 170,
  Kakamega: 180,
  Bungoma: 180,
  Busia: 180,
  Siaya: 170,
  HomaBay: 170,
  Migori: 180,
  Kisii: 170,
  Nyamira: 170,
  Narok: 190,
  Kajiado: 180,
  Kwale: 190,
  Kilifi: 190,
  TaitaTaveta: 200,
  Garissa: 250,
  Wajir: 280,
  Mandera: 300,
  Marsabit: 300,
  Isiolo: 220,
  TanaRiver: 250,
  Lamu: 260,
  Vihiga: 170,
};

export default function CartPage({ onOpenBuyerLogin }: CartProps) {
  const { cartItems, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = useCart();
  const router = useRouter();

  const [county, setCounty] = useState('');
  const [town, setTown] = useState('');
  const [towns, setTowns] = useState<string[]>([]);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [showGlobalPay, setShowGlobalPay] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    setUserId(storedUserId);
  }, []);

  useEffect(() => {
    if (county && countyTownMap[county]) {
      setTowns(countyTownMap[county]);
      setTown('');
      setDeliveryFee(baseCountyFees[county]);
    } else {
      setTowns([]);
      setDeliveryFee(0);
    }
  }, [county]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.calculatedPrice * item.quantity, 0);
  const total = subtotal + deliveryFee;

const handleCheckout = () => {
  if (!county || !town) {
    toast.warn('Please select delivery location');
    return;
  }
  setShowGlobalPay(true);
};

const getPublicId = (url?: string) => {
   if (!url || typeof url !== 'string') 
   return ''; const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
   return match ? match[1] : url; };

  if (cartItems.length === 0)
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-112px)] pt-20">
        <Player
          autoplay
          loop
          src="https://assets5.lottiefiles.com/packages/lf20_qh5z2fdq.json"
          style={{ height: '300px', width: '300px' }}
        />
        <p className="mt-4 text-lg text-gray-700">Your cart is empty.</p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 pt-28 pb-10 relative">
      {/* 🟠 Payment Modal */}
{showGlobalPay && userId && (
  <GlobalPayModal
    payload={{
      amount: total,
      items: cartItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.calculatedPrice,
        images: item.images,
        productId: item.productId || item.id,
        sellerId: item.sellerId,
        fulfillmentMode: item.fulfillmentMode,
      })),
      deliveryFee,
      county,
      town,
      userId,

      // ✅ REQUIRED BY GLOBAL PAYMENT SYSTEM
      purpose: 'order',
      refId: 'cart', // backend will generate actual orderId
    }}
    onClose={() => setShowGlobalPay(false)}
    onSuccess={() => {
      clearCart();
      router.push('/orders');
    }}
  />
)}



{/* 🗑️ Remove Item Confirmation Modal */}
{showRemoveModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-xl relative">
      <button
        onClick={() => setShowRemoveModal(false)}
        className="absolute top-2 right-4 text-gray-500 text-2xl font-bold"
      >
        ×
      </button>

      <h2 className="text-lg font-semibold text-gray-800 text-center mb-3">
        Remove this item?
      </h2>
      <p className="text-center text-sm text-gray-500 mb-6">
        Are you sure you want to remove this item from your cart?
      </p>

      <div className="flex gap-4 justify-center">
        <button
          onClick={() => {
            if (itemToRemove) {
              removeFromCart(itemToRemove);
            }
            setShowRemoveModal(false);
            setItemToRemove(null);
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
        >
          Remove
        </button>
        <button
          onClick={() => setShowRemoveModal(false)}
          className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

      {/* 🧺 Cart Section */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="md:col-span-2 space-y-6">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-4 border p-4 rounded-lg bg-white shadow-sm">
              <CldImage 
              src={getPublicId(item.images[0])} 
              alt={item.name} 
              width="80" 
              height="80" 
              className="w-20 h-20 object-cover rounded" />
              
              <div className="flex flex-col justify-between w-full">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500 mt-1">Shipped from {item.county}</p>
                    <p className="text-orange-600 mt-2 font-bold">
                      Ksh.{item.calculatedPrice.toLocaleString()}
                    </p>
                  </div>
                  <button
                     onClick={() => {
                       setItemToRemove(item.id);
                       setShowRemoveModal(true);
                     }}
                     className="text-red-500 text-xl font-bold hover:text-red-700"
                   >
                     ×
                   </button>

                </div>

                <div className="flex items-center mt-3 gap-3">
                  <button
                    onClick={() => decreaseQuantity(item.id)}
                    className="bg-orange-200 w-7 h-7 rounded hover:bg-orange-300 text-lg"
                  >
                    -
                  </button>
                  <span className="font-medium">{item.quantity}</span>
                  <button
                    onClick={() => increaseQuantity(item.id)}
                    className="bg-orange-200 w-7 h-7 rounded hover:bg-orange-300 text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white border p-6 rounded-lg shadow-sm h-fit">
          <h3 className="text-xl font-semibold mb-4">Order Summary</h3>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-medium">Ksh.{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Delivery Fee</span>
              <span className="font-medium">
                {deliveryFee > 0 ? `Ksh.${deliveryFee.toLocaleString()}` : 'Select location'}
              </span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-3">
              <span>Total</span>
              <span>Ksh.{total.toLocaleString()}</span>
            </div>
          </div>

          {/* Location */}
          <div className="mt-4">
            <select
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded text-sm focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Select County</option>
              {Object.keys(countyTownMap).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {towns.length > 0 && (
            <div className="mt-3">
              <select
                value={town}
                onChange={(e) => setTown(e.target.value)}
                className="border border-gray-300 p-2 w-full rounded text-sm focus:ring-2 focus:ring-orange-400"
              >
                <option value="">Select Town</option>
                {towns.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

{!userId ? (
  <button
    onClick={() => {
      toast.info('Please log in to checkout your order.');
      if (onOpenBuyerLogin) onOpenBuyerLogin();
    }}
    className="mt-5 w-full bg-gray-400 text-white py-2 rounded cursor-pointer hover:bg-gray-500 transition"
  >
    Login to Checkout
  </button>
) : (
  <button
    onClick={handleCheckout}
    disabled={!county || !town}
    className="mt-5 w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition disabled:opacity-50"
  >
    Checkout & Pay
  </button>
)}


        </div>
      </div>

      {/* Recommendations */}
      <RecentlyViewed />
      <SponsoredProducts />
      <SuggestedForYou />
      <TopPicksForYou />
    </div>
  );
}
