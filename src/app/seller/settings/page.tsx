"use client";

import { useEffect, useState } from "react";
import { Store, Edit2, Gem, Crown, CheckCircle, XCircle} from "lucide-react";
import { toast } from "react-toastify";

export interface Seller {
  _id: string;
  name: string;
  email: string;
  image?: string;
  logo?: string;
  banner?: string;
  phoneNumber?: string;
  role: 'seller';
  shopName?: string;
  isVerified: boolean;
  followers: {
    userId: string;
    followedAt?: Date;
  }[];
  shop: {
    isActive: boolean;
    activatedAt?: Date;
    expiresAt?: Date;
    amountPaid?: number;
    transactionId?: string;
    plan?: 'free' | 'basic' | 'premium';
  };
  createdAt: Date;
}

export default function SellerSettingsPage() {
  const [seller, setSeller] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "premium" | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "airtel" | "">("");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [loading] = useState(false);
  const [activatingShop, setActivatingShop] = useState(false);
  const [editShopName, setEditShopName] = useState(seller?.name || '');
  const [editImage, setEditImage] = useState(seller?.image || '');
  const [editBanner, setEditBanner] = useState(seller?.banner || '');

  useEffect(() => {
    const stored = localStorage.getItem("sellerUser");
    if (stored) setSeller(JSON.parse(stored));
  }, []);

const openPaymentModal = (plan: "basic" | "premium") => {
  setSelectedPlan(plan);
  setPaymentMethod("");
  setPaymentPhone("");
  setShowPaymentModal(true);
};

const handleConfirmPayment = async () => {
  if (!selectedPlan || !paymentMethod || !paymentPhone) {
    toast.error("Please fill all details");
    return;
  }

  try {
    setActivatingShop(true);

    let amount = selectedPlan === "basic" ? 1300 : 3000;
    if (selectedPlan === "premium" && seller?.shop?.plan === "basic") {
      const alreadyPaid = seller.shop?.amountPaid || 0;
      amount = 3000 - alreadyPaid;
    }

    const res = await fetch("/api/seller/payment/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sellerId: seller?._id,
        plan: selectedPlan,
        method: paymentMethod,
        phone: paymentPhone,
        amount,
      }),
    });

    const data = await res.json();
    if (data.success) {
      toast.success("Payment request sent! Please complete on your phone.");
      setShowPaymentModal(false);
    } else {
      toast.error(data.error || "Payment initiation failed");
    }
  } catch (err) {
    console.error(err);
    toast.error("Error initiating payment");
  } finally {
    setActivatingShop(false);
  }
};

  const isShopActive =
    seller?.shop?.isActive &&
    seller.shop.expiresAt &&
    new Date(seller.shop.expiresAt) > new Date();

  return (
    <div className="md:ml-64 p-6 min-h-screen bg-gradient-to-b from-white to-gray-50 pt-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-orange-600">Seller Settings</h1>
          <p className="text-gray-600 text-sm">
            Manage your shop details, plan upgrades, and business settings.
          </p>
        </div>

      </div>

      {/* Sections */}
      <div className="grid gap-8 max-w-6xl mx-auto">
        {/* SHOP DETAILS */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Store className="text-orange-500" /> Shop Details
            {isShopActive ? (
            <p className="text-green-600 text-sm mt-1">
              Your shop is active until{' '}
              <strong>{new Date(seller!.shop.expiresAt!).toLocaleDateString()}</strong>{' '}
              (
              <span className="font-bold">
                {seller?.shop?.plan?.toUpperCase() || 'Unspecified'}
              </span>{' '}
              Package)
            </p>
          ) : (
            <p className="text-red-600 text-sm mt-1">
              You don&apos;t have an active shop.
            </p>
          )}
            </h2>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 text-sm text-orange-600 hover:underline"
            >
              <Edit2 size={16} /> Edit
            </button>

          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-500 text-sm">Shop Name</p>
              <p className="font-medium">{seller?.shopName || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Email</p>
              <p className="font-medium">{seller?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Phone</p>
              <p className="font-medium">{seller?.phoneNumber || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* PLAN UPGRADE */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Crown className="text-orange-500" /> Subscription Plan
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Current Plan</p>
              <div className="flex items-center gap-2 mt-1">
                {seller?.shop?.plan === "premium" ? (
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium">
                    <Crown size={14} /> Premium
                  </span>
                ) : seller?.shop?.plan === "basic" ? (
                  <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium">
                    <Gem size={14} /> Basic
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                    Free Plan
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowUpgradeModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition"
            >
              {seller?.shop?.plan === "premium" ? "Manage Plan" : "Upgrade Plan"}
            </button>
          </div>
        </div>

        {/* BUSINESS SETTINGS */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 hover:shadow-md transition">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Business Preferences
          </h2>
          <p className="text-gray-500 text-sm">
            Coming soon — configure business hours, delivery options, and store policies here.
          </p>
        </div>
      </div>

      {/* ====== PAYMENT MODAL ====== */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md relative shadow-xl">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-3 right-4 text-gray-500 text-2xl font-bold"
            >
              ×
            </button>

            <h2 className="text-xl font-semibold text-center text-gray-800 mb-3">
              {selectedPlan === "basic" ? "Basic Plan" : "Premium Plan"}
            </h2>

            <p className="text-center text-orange-600 font-semibold mb-4">
              Amount: {selectedPlan === "basic" ? "Ksh 1300" : "Ksh 3000"}
            </p>

            <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
            <input
              type="text"
              value={paymentPhone}
              onChange={(e) => setPaymentPhone(e.target.value)}
              placeholder="2547xxxxxxxx"
              className="w-full border px-3 py-2 rounded mb-4"
            />

            <label className="block text-sm text-gray-600 mb-1">Payment Method</label>
            <div className="flex gap-4 mb-5">
              <button
                onClick={() => setPaymentMethod("mpesa")}
                className={`flex-1 border rounded-lg px-3 py-2 ${
                  paymentMethod === "mpesa" ? "border-green-500 bg-green-50" : ""
                }`}
              >
                <img src="/mpesa.png" className="h-6 mx-auto" />
              </button>
              <button
                onClick={() => setPaymentMethod("airtel")}
                className={`flex-1 border rounded-lg px-3 py-2 ${
                  paymentMethod === "airtel" ? "border-red-500 bg-red-50" : ""
                }`}
              >
                <img src="/airtel.png" className="h-6 mx-auto" />
              </button>
            </div>

            <button
              onClick={handleConfirmPayment}
              disabled={loading}
              className={`w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Processing..." : "Confirm & Pay"}
            </button>
          </div>
        </div>
      )}

          {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl w-full max-w-md relative">
        <button onClick={() => setShowEditModal(false)} className="absolute top-2 right-4 text-gray-500 text-2xl font-bold">×</button>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Shop Info</h2>
      <label className="block mb-1 text-sm font-medium text-gray-600">Shop Name</label>
      <input
        type="text"
        value={editShopName}
        onChange={(e) => setEditShopName(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-4"
      />
      <label className="block mb-1 text-sm font-medium text-gray-600">Profile Image URL</label>
      <input
        type="text"
        value={editImage}
        onChange={(e) => setEditImage(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-4"
      />
      <label className="block mb-1 text-sm font-medium text-gray-600">Banner Image URL</label>
      <input
        type="text"
        value={editBanner}
        onChange={(e) => setEditBanner(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-4"
      />

      <button
        onClick={() => {
          const updated = {
            ...seller,
            shopName: editShopName,
            image: editImage,
            bannerImage: editBanner,
          };
          setSeller(updated as Seller);
          localStorage.setItem('sellerUser', JSON.stringify(updated));
          setShowEditModal(false);
          toast.success('Shop info updated locally!');
        }}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded"
        >
        Save Changes
      </button>
    </div>
  </div>
)}

{showUpgradeModal && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center px-4">
    {/* Floating Background Icons */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-10 left-20 text-white/10 text-8xl animate-pulse">💼</div>
      <div className="absolute bottom-20 right-24 text-white/10 text-8xl animate-pulse delay-200">🛒</div>
      <div className="absolute top-1/3 right-1/3 text-white/5 text-9xl animate-bounce-slow">💡</div>
    </div>

    {/* Modal Container */}
    <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden">
      {/* Gradient Glow Accent */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500/10 via-transparent to-blue-400/10 pointer-events-none"></div>

      <button
        onClick={() => setShowUpgradeModal(false)}
        className="absolute top-4 right-5 text-white/70 hover:text-orange-400 text-3xl font-bold transition"
      >
        ×
      </button>

      <h2 className="text-3xl font-bold text-white mb-8 text-center">
        Upgrade Your Shop Plan
      </h2>

      {/* Status Dots */}
      <div className="flex justify-center gap-6 mb-8">
        <div
          className={`h-4 w-4 rounded-full ${
            seller?.shop?.plan === "free"
              ? "bg-gray-400 animate-ping"
              : "bg-gray-600"
          }`}
        />
        <div
          className={`h-4 w-4 rounded-full ${
            seller?.shop?.plan === "basic"
              ? "bg-orange-400 animate-ping"
              : "bg-orange-600/70"
          }`}
        />
        <div
          className={`h-4 w-4 rounded-full ${
            seller?.shop?.plan === "premium"
              ? "bg-blue-400 animate-ping"
              : "bg-blue-600/70"
          }`}
        />
      </div>

      {/* Plans */}
      <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto snap-x snap-mandatory px-2 pb-2 scrollbar-hide">
        {/* Free Plan */}
        <div className="min-w-[85%] md:min-w-0 snap-center border border-white/20 rounded-2xl p-6 bg-white/10 hover:bg-white/20 transition relative backdrop-blur-md">
          {seller?.shop?.plan === "free" && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow">
              Current Plan
            </span>
          )}
          <h3 className="text-xl font-semibold text-white">Free Plan</h3>
          <p className="text-gray-300 mb-3">Ksh 0 / year</p>
          <ul className="space-y-2 text-sm text-gray-200 mb-5">
            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400" /> Add up to 5 Products</li>
            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400" /> Receive up to 5 Orders</li>
            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400" /> Limited Analytics</li>
            <li className="flex items-center gap-2"><XCircle size={16} className="text-red-400" /> No Product Boost</li>
            <li className="flex items-center gap-2"><XCircle size={16} className="text-red-400" /> No Front Shop</li>
            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400" /> Withdrawals capped at Ksh 1000</li>
          </ul>
          <button disabled className="w-full bg-gray-500 text-white py-2 rounded cursor-not-allowed">
            Free
          </button>
        </div>

        {/* Basic Plan */}
        <div className="min-w-[85%] md:min-w-0 snap-center border border-orange-400/50 rounded-2xl p-6 bg-gradient-to-b from-orange-500/10 to-transparent hover:shadow-orange-500/30 hover:shadow-xl transition relative backdrop-blur-md">
          {seller?.shop?.plan === "basic" && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow">
              Current Plan
            </span>
          )}
          <h3 className="text-xl font-semibold text-orange-400">Basic Plan</h3>
          <p className="text-gray-200 mb-3">Ksh 1300 / year</p>
          <ul className="space-y-2 text-sm text-gray-200 mb-5">
            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400" /> Add up to 100 Products</li>
            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400" /> Receive up to 100 Orders</li>
            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400" /> Standard Visibility</li>
            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400" /> Access to Orders</li>
            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400" /> Product Ads Boost</li>
            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400" /> Shop Visibility</li>
          </ul>
          <button
            onClick={() => openPaymentModal("basic")}
            disabled={activatingShop}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-medium transition"
          >
            {activatingShop ? "Processing..." : "Upgrade to Basic"}
          </button>
        </div>

        {/* Premium Plan */}
        <div className="relative min-w-[85%] md:min-w-0 snap-center">
          {/* Animated Aura */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="absolute w-[140%] h-[140%] rounded-full bg-gradient-to-r from-orange-400 via-pink-400 to-purple-500 opacity-30 blur-3xl animate-pulse-slow" />
          </div>

          {/* Floating Orbiting Badges with Glow */}
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute text-4xl text-white/80 animate-orbit-slow left-1/2 -translate-x-1/2 top-[-2rem] animate-glow-slow drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">
              ⭐
            </span>
            <span className="absolute text-3xl text-white/70 animate-orbit-fast left-[-1rem] top-1/3 animate-glow-medium drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
              🧭
            </span>
            <span className="absolute text-5xl text-white/80 animate-orbit-medium right-[-1rem] bottom-1/4 animate-glow-fast drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]">
              💎
            </span>
          </div>

          <div className="relative border border-blue-400/60 rounded-2xl p-6 bg-gradient-to-b from-blue-500/10 to-transparent hover:shadow-blue-400/40 hover:shadow-2xl hover:scale-[1.03] transition backdrop-blur-md">
            {seller?.shop?.plan === "premium" && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow">
                Current Plan
              </span>
            )}
            <span className="absolute -top-3 left-1/4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow">
              Recommended
            </span>
            <h3 className="text-xl font-semibold text-blue-300">Premium Plan</h3>
            <p className="text-gray-200 mb-3">
              {seller?.shop?.plan === "basic"
                ? "Top-up Ksh 1700 to upgrade"
                : "Ksh 3000 / year"}
            </p>
            <ul className="space-y-2 text-sm text-gray-200 mb-5">
              <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400" /> All Basic Features</li>
              <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400" /> Premium Badge</li>
              <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400" /> Higher Visibility</li>
              <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400" /> Unlimited Withdrawals</li>
              <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400" /> Unlimited Orders</li>
              <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400" /> Unlimited Products</li>
            </ul>
            <button
              onClick={() => openPaymentModal("premium")}
              disabled={activatingShop}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium transition"
            >
              {activatingShop ? "Processing..." : "Upgrade to Premium"}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}