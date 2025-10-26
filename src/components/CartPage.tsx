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
  Nairobi: 150,
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

export default function CartPage() {
  const { cartItems, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = useCart();
  const router = useRouter();

  const [county, setCounty] = useState('');
  const [town, setTown] = useState('');
  const [towns, setTowns] = useState<string[]>([]);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'airtel' | ''>('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);


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
      toast.warn('Please select your delivery location first');
      return;
    }
    setShowPaymentModal(true);
  };

const getPublicId = (url?: string) => {
   if (!url || typeof url !== 'string') 
   return ''; const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
   return match ? match[1] : url; };

  const handleConfirmPayment = async () => {
    if (!paymentPhone || !paymentMethod) {
      toast.warn('Please enter phone and select payment method');
      return;
    }

    if (!userId) {
      toast.error('User not logged in.');
      return;
    }

    setProcessingPayment(true);
    toast.loading(`Waiting for ${paymentMethod === 'mpesa' ? 'M-Pesa' : 'Airtel'} confirmation...`);

    try {
      const normalizedPhone = paymentPhone.replace(/^0/, '254');
      const endpoint = paymentMethod === 'mpesa' ? '/api/checkout/mpesa' : '/api/checkout/airtel';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: normalizedPhone,
          totalAmount: total,
          items: cartItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.calculatedPrice,
            images: item.images,
            productId: item.productId || item.id,
            sellerId: item.sellerId,
          })),
          deliveryFee,
          county,
          town,
          userId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.dismiss();
        toast.error(result.message || 'Payment initiation failed.');
        setProcessingPayment(false);
        return;
      }

      const orderId = result.orderId;
      let attempts = 0;
      const maxAttempts = 10;

      const interval = setInterval(async () => {
        attempts++;
        const statusRes = await fetch(`/api/orders/status?orderId=${orderId}`);
        const statusData = await statusRes.json();

        if (statusData.status === 'Paid') {
          clearInterval(interval);
          toast.dismiss();
          toast.success('Payment successful!');
          clearCart();
          setShowPaymentModal(false);

          // ✅ Lottie success animation
          const successPopup = document.createElement('div');
          successPopup.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50';
          successPopup.innerHTML = `
            <div class="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
              <lottie-player
                src="https://assets2.lottiefiles.com/packages/lf20_jbrw3hcz.json"
                background="transparent"
                speed="1"
                style="width: 180px; height: 180px;"
                autoplay
              ></lottie-player>
              <p class="text-green-600 font-semibold text-lg mt-3">Payment Successful!</p>
            </div>
          `;
          document.body.appendChild(successPopup);
          setTimeout(() => {
            document.body.removeChild(successPopup);
            router.push('/orders');
          }, 4000);
        } else if (statusData.status === 'Cancelled') {
          clearInterval(interval);
          toast.dismiss();
          toast.error('Payment cancelled.');

          // ❌ Lottie failure animation
          const failPopup = document.createElement('div');
          failPopup.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50';
          failPopup.innerHTML = `
            <div class="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
              <lottie-player
                src="https://assets10.lottiefiles.com/packages/lf20_qp1q7mct.json"
                background="transparent"
                speed="1"
                style="width: 180px; height: 180px;"
                autoplay
              ></lottie-player>
              <p class="text-red-600 font-semibold text-lg mt-3">Payment Cancelled!</p>
            </div>
          `;
          document.body.appendChild(failPopup);
          setTimeout(() => document.body.removeChild(failPopup), 4000);

          setShowPaymentModal(false);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          toast.dismiss();
          toast.error('Transaction timed out. Try again.');
          setShowPaymentModal(false);
        }
      }, 3000);
    } catch (error) {
      console.error('Payment error:', error);
      toast.dismiss();
      toast.error('Error processing payment.');
    } finally {
      setProcessingPayment(false);
    }
  };

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
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md relative shadow-xl">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-2 right-4 text-gray-500 text-2xl font-bold"
            >
              ×
            </button>

            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Checkout Payment</h2>
            <p className="text-center text-lg font-semibold text-orange-600 mb-4">
              Total: Ksh {total.toLocaleString()}
            </p>

            <label className="block mb-2 text-sm text-orange-600">Phone Number</label>
            <input
              type="text"
              value={paymentPhone}
              onChange={(e) => setPaymentPhone(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4"
              placeholder="Enter M-Pesa or Airtel number"
            />

            <label className="block mb-2 text-sm text-orange-600">Payment Method</label>
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setPaymentMethod('mpesa')}
                className={`flex-1 flex items-center gap-2 border px-3 py-2 rounded-lg transition ${
                  paymentMethod === 'mpesa'
                    ? 'border-green-500 bg-green-50'
                    : 'hover:border-green-400'
                }`}
              >
                <img src="/mpesa.png" alt="M-Pesa" className="h-6" />
                <span className="font-medium text-gray-700">M-Pesa</span>
              </button>

              <button
                onClick={() => setPaymentMethod('airtel')}
                className={`flex-1 flex items-center gap-2 border px-3 py-2 rounded-lg transition ${
                  paymentMethod === 'airtel'
                    ? 'border-red-500 bg-red-50'
                    : 'hover:border-red-400'
                }`}
              >
                <img src="/airtel.png" alt="Airtel" className="h-6" />
                <span className="font-medium text-gray-700">Airtel Money</span>
              </button>
            </div>

            <button
              onClick={handleConfirmPayment}
              disabled={processingPayment}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded transition"
            >
              {processingPayment ? 'Processing...' : 'Confirm & Pay'}
            </button>
          </div>
        </div>
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

          <button
            onClick={handleCheckout}
            disabled={!county || !town}
            className="mt-5 w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition disabled:opacity-50"
          >
            Checkout & Pay
          </button>
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
