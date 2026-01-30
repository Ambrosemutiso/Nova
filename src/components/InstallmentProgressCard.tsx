'use client';

import { useEffect, useMemo, useState } from 'react';
import { CldImage } from 'next-cloudinary';
import GlobalPayModal from '@/components/payments/GlobalPayModal';

/* ============================================================
   🔌 PATCH POINT
   Import these from where you already defined them
   ------------------------------------------------------------
   import { countyTownMap, baseCountyFees } from '@/lib/delivery';
   ============================================================ */
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

type InstallmentPlan = {
  _id: string;
  status: 'active' | 'completed';
  orderId?: string;
  totalAmount: number;
  paidAmount: number;
  monthlyAmount: number;
  product?: {
    _id: string;
    name: string;
    images: string[];
    price: number;
  } | null;
};

interface Props {
  plan: InstallmentPlan;
}

export default function InstallmentProgressCard({ plan }: Props) {
  const [showPay, setShowPay] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const [county, setCounty] = useState('');
  const [town, setTown] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);

  const product = plan.product;

  const totalAmount = Number(plan.totalAmount ?? 0);
  const paidAmount = Number(plan.paidAmount ?? 0);
  const monthlyAmount = Number(plan.monthlyAmount ?? 0);

  const balance = Math.max(totalAmount - paidAmount, 0);

  const progress = useMemo(() => {
    if (totalAmount === 0) return 0;
    return Math.min((paidAmount / totalAmount) * 100, 100);
  }, [paidAmount, totalAmount]);

  const fullyPaid = plan.status === 'completed';
  const hasOrder = Boolean(plan.orderId);

  const buyerId =
    typeof window !== 'undefined'
      ? localStorage.getItem('userId')
      : null;

  /* ============================================================
     🚚 DELIVERY FEE CALCULATION (MATCHES CART LOGIC)
     ============================================================ */
  useEffect(() => {
    if (!county) {
      setDeliveryFee(0);
      return;
    }

    // 1️⃣ Base county fee
    let fee = baseCountyFees[county] ?? 0;

    // 2️⃣ OPTIONAL: Town-based surcharge (same idea as cart)
    // 🔌 PATCH POINT (example)
    /*
    if (town && remoteTowns.includes(town)) {
      fee += 100;
    }
    */

    setDeliveryFee(fee);
  }, [county, town]);

  const getPublicId = (url?: string) => {
    if (!url) return '';
    const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    return match ? match[1] : url;
  };

  return (
    <>
      <div className="bg-white rounded-xl p-4 shadow border space-y-4">
        {/* PRODUCT */}
        <div className="flex gap-4">
          {product?.images?.[0] && (
            <CldImage
              src={getPublicId(product.images[0])}
              width="120"
              height="120"
              crop="fill"
              alt={product.name}
              className="rounded"
            />
          )}

          <div>
            <h3 className="font-semibold text-gray-800">
              {product?.name ?? 'Product'}
            </h3>

            <p className="text-sm text-gray-600">
              Total: Ksh {totalAmount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              Paid: Ksh {paidAmount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              Balance: Ksh {balance.toLocaleString()}
            </p>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full ${
              fullyPaid ? 'bg-green-600' : 'bg-orange-600'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* ACTION */}
        {fullyPaid ? (
          hasOrder ? (
            <p className="text-green-600 font-semibold text-sm">
              ✅ Order placed — Awaiting delivery
            </p>
          ) : (
            <button
              onClick={() => setShowOrderModal(true)}
              className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition"
            >
              Place Order
            </button>
          )
        ) : (
          <button
            onClick={() => setShowPay(true)}
            className="w-full bg-orange-600 text-white py-2 rounded-xl"
          >
            Pay Installment
          </button>
        )}
      </div>

      {/* PAY MODAL */}
      {showPay && buyerId && (
        <GlobalPayModal
          payload={{
            amount: monthlyAmount,
            items: [],
            deliveryFee: 0,
            county: '',
            town: '',
            userId: buyerId,
            purpose: 'installment-monthly',
            refId: plan._id,
          }}
          onClose={() => setShowPay(false)}
          onSuccess={() => window.location.reload()}
        />
      )}

      {/* ORDER MODAL */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm">
            <h3 className="font-semibold text-lg mb-4">Delivery Location</h3>

            <select
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            >
              <option value="">Select County</option>
              {Object.keys(countyTownMap).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {county && (
              <select
                value={town}
                onChange={(e) => setTown(e.target.value)}
                className="w-full border p-2 rounded mb-3"
              >
                <option value="">Select Town</option>
                {countyTownMap[county].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}

            <p className="text-sm text-gray-600 mb-3">
              Delivery fee: <strong>Ksh {deliveryFee}</strong>
            </p>

            <button
              disabled={!county || !town}
              onClick={async () => {
                await fetch('/api/orders/from-installment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    installmentId: plan._id,
                    county,
                    town,
                    deliveryFee,
                    userId: buyerId,
                  }),
                });

                setShowOrderModal(false);
                window.location.reload();
              }}
              className="w-full bg-green-600 text-white py-2 rounded disabled:opacity-50"
            >
              Order Now
            </button>
          </div>
        </div>
      )}
    </>
  );
}
