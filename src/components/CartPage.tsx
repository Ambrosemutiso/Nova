'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/app/context/CartContext';
import { CldImage } from 'next-cloudinary';
import { useRouter } from 'next/navigation';
import { Player } from '@lottiefiles/react-lottie-player';
import RecentlyViewed from "@/components/RecentlyViewed";
import SponsoredProducts from '@/components/SponsoredProducts';
import TopPicksForYou from '@/components/TopPicksForYou';
import SuggestedForYou from '@/components/SuggestedForYou';
import { toast } from 'react-toastify';

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
  Makueni: ['Wote', 'Makindu', 'Kibwezi', 'Mtito Andei', 'Emali'],
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



export default function CartPage() {
  const { cartItems, removeFromCart, increaseQuantity, decreaseQuantity } = useCart();
  const [loading, setLoading] = useState(false);
  const [county, setCounty] = useState<string>('');
  const [town, setTown] = useState<string>('');
  const [towns, setTowns] = useState<string[]>([]);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const router = useRouter();

  // 🎯 Auto update towns when county changes
  useEffect(() => {
    if (county && countyTownMap[county]) {
      setTowns(countyTownMap[county]);
      setTown('');
    } else {
      setTowns([]);
    }
  }, [county]);

  // 🧮 Delivery fee calculation logic
const calculateDeliveryFee = (county: string, town: string, cartItems: any[]) => {
  if (!county || !town) return 0;

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

  let maxFee = 0;

  cartItems.forEach(item => {
    const sellerCounty = item.county;
    const sellerTown = item.town;

    if (sellerCounty === county && sellerTown === town) {
      maxFee = Math.max(maxFee, 50); // same town
    } else if (sellerCounty === county && sellerTown !== town) {
      maxFee = Math.max(maxFee, 120); // same county, different town
    } else {
      const randomModifier = Math.random() * 40;
      const fee = (baseCountyFees[sellerCounty] || 150) + randomModifier;
      maxFee = Math.max(maxFee, Math.round(fee));
    }
  });

  return maxFee;
};

  // 🧾 Auto-calc delivery fee
useEffect(() => {
  if (county && town) {
    const fee = calculateDeliveryFee(county, town, cartItems);
    setDeliveryFee(fee);
  } else {
    setDeliveryFee(0);
  }
}, [county, town, cartItems]);

  // 🧮 Totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.calculatedPrice * item.quantity, 0);
  const total = subtotal + deliveryFee;

  const getPublicId = (url?: string) => {
    if (!url || typeof url !== 'string') return '';
    const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    return match ? match[1] : url;
  };

  const handleCheckout = async () => {
    if (!county || !town) {
      toast.warn('Please select your delivery location first');
      return;
    }

    setLoading(true);
    try {
      router.push('/checkout');
    } catch (error) {
      toast.error('Checkout failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const confirmRemove = (id: string) => {
    setSelectedItemId(id);
    setShowModal(true);
  };

  const handleConfirmRemove = () => {
    if (selectedItemId) {
      removeFromCart(selectedItemId);
    }
    setShowModal(false);
    setSelectedItemId(null);
  };

  // 🌀 Loading animation
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-12 h-12 border-4 border-orange-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );

  // 🛒 Empty cart
  if (cartItems.length === 0) {
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
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pt-28 pb-10 relative">
      {/* Confirm Remove Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 text-center shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Remove this item?</h3>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleConfirmRemove}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cart Items Section */}
        <div className="md:col-span-2 space-y-6">
          {cartItems.map(item => (
            <div key={item.id} className="flex gap-4 border p-4 rounded-lg shadow-sm bg-white">
              <CldImage
                src={getPublicId(item.images[0])}
                alt={item.name}
                width="80"
                height="80"
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex flex-col justify-between w-full">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Shipped from <span className="font-medium">{item.county}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Town: <span className="font-medium">{item.town}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Weight: <span className="font-medium">{item.weight || 1} kg</span>
                    </p>
                    <p className="text-orange-600 mt-2 font-bold">
                      Ksh.{item.calculatedPrice.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => confirmRemove(item.id)}
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

        {/* Summary Section */}
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

          {/* County Selection */}
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

          {/* Town Selection */}
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
            {loading ? 'Processing...' : 'Proceed to Checkout'}
          </button>
        </div>
      </div>

      {/* Recommended Sections */}
      <RecentlyViewed />
      <SponsoredProducts />
      <SuggestedForYou />
      <TopPicksForYou />
    </div>
  );
}
