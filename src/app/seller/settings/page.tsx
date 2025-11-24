'use client';

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  Edit2,
  Gem,
  Crown,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-toastify";

/**
 * SellerSettingsPage — Premium Glassmorphism UI
 * Replace your existing SellerSettingsPage with this file.
 *
 * Notes:
 * - Keeps existing localStorage "sellerUser" logic intact.
 * - Uses framer-motion for smooth entrance/exit animations.
 * - Glass cards, subtle glows, floating badges, improved modals.
 * - Accessible buttons and clear CTA hierarchy.
 */

export default function SellerSettingsPage() {
  const [seller, setSeller] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "premium" | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "airtel" | "">("");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [activatingShop, setActivatingShop] = useState(false);
  const [editShopName, setEditShopName] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editBanner, setEditBanner] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("sellerUser");
    if (stored) {
      const parsed = JSON.parse(stored);
      setSeller(parsed);
      setEditShopName(parsed?.shopName || "");
      setEditImage(parsed?.image || "");
      setEditBanner(parsed?.banner || "");
    }
  }, []);

  const openPaymentModal = (plan: "basic" | "premium") => {
    setSelectedPlan(plan);
    setPaymentMethod("");
    setPaymentPhone("");
    setShowPaymentModal(true);
    setShowUpgradeModal(false);
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
        toast.success("Payment request sent! Complete on your phone.");
        setShowPaymentModal(false);
      } else {
        toast.error(data.error || "Payment failed");
      }
    } catch (err) {
      toast.error("Error initiating payment");
    } finally {
      setActivatingShop(false);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 14 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" },
    }),
  };

  const isShopActive =
    seller?.shop?.isActive &&
    seller.shop.expiresAt &&
    new Date(seller.shop.expiresAt) > new Date();

  return (
    <div className="md:ml-64 p-6 min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 pt-28">
      {/* Soft backdrop glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-36 left-1/4 w-[48rem] h-[36rem] bg-gradient-to-tr from-orange-200/30 to-pink-200/10 blur-3xl opacity-60 transform rotate-6" />
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Seller Settings</h1>
        <p className="text-gray-600 mt-1 max-w-2xl">
          Manage your shop, subscription and payment settings — crafted with care for a premium experience.
        </p>
      </motion.div>

      <div className="grid gap-8 max-w-6xl mx-auto">
        {/* Top summary card */}
        <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={0} className="relative bg-white/40 backdrop-blur-md border border-white/30 rounded-3xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white/60 border border-white/30 flex items-center justify-center">
              <img src={seller?.image || "/Logo.png"} alt="shop" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Shop</p>
              <h2 className="text-2xl font-semibold text-gray-900">{seller?.shopName || seller?.name || "Unnamed Shop"}</h2>
              <p className="text-sm text-gray-600 mt-1">{seller?.email || "No email set"}</p>
            </div>

            <div className="flex gap-2 items-center">
              <div className="text-right">
                <p className="text-xs text-gray-500">Status</p>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  isShopActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-700"
                }`}>
                  {isShopActive ? "Active" : "Inactive"}
                </div>
              </div>

              <button onClick={() => setShowEditModal(true)} className="ml-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/20 border border-white/25 hover:bg-white/30 transition">
                <Edit2 size={16} /> Edit
              </button>
            </div>
          </div>
        </motion.div>

        {/* Sections grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={1} className="bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-50 border border-orange-100">
                  <Store className="text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Shop Details</h3>
                  <p className="text-sm text-gray-500">Basic contact & shop info</p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <div>
                <p className="text-xs text-gray-400">Shop Name</p>
                <p className="text-sm font-medium text-gray-800">{seller?.shopName || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-800">{seller?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Phone</p>
                <p className="text-sm font-medium text-gray-800">{seller?.phoneNumber || "N/A"}</p>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button onClick={() => setShowEditModal(true)} className="text-sm text-orange-600 hover:underline inline-flex items-center gap-2">
                <Edit2 size={16} /> Edit
              </button>
            </div>
          </motion.div>

          <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={2} className="bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
                  <Crown className="text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Subscription Plan</h3>
                  <p className="text-sm text-gray-500">Manage your plan & visibility</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-400">Current Plan</p>
                <div className="mt-2 inline-flex items-center gap-2">
                  {seller?.shop?.plan === "premium" ? (
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"><Crown size={14} /> Premium</span>
                  ) : seller?.shop?.plan === "basic" ? (
                    <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm flex items-center gap-2"><Gem size={14} /> Basic</span>
                  ) : (
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Free</span>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowUpgradeModal(true)} className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium shadow hover:scale-[1.01] transition">
                  {seller?.shop?.plan === "premium" ? "Manage" : "Upgrade"}
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={3} className="bg-white/30 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-sm col-span-1 md:col-span-2">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-violet-50 border border-violet-100">
                <Gem className="text-violet-500"/>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">Business Preferences</h3>
                <p className="text-sm text-gray-500 mt-1">Configure delivery options, store policy, and working hours (coming soon).</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ====== MODALS ====== */}
      <AnimatePresence>
        {/* Edit Modal */}
        {showEditModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              className="relative w-full max-w-lg bg-white/60 backdrop-blur-lg border border-white/30 rounded-2xl p-6 shadow-2xl"
            >
              <button onClick={() => setShowEditModal(false)} aria-label="close" className="absolute top-4 right-4 text-gray-600">&times;</button>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Edit Shop Info</h3>

              <label className="block text-sm text-gray-500 mb-1">Shop Name</label>
              <input type="text" value={editShopName} onChange={(e) => setEditShopName(e.target.value)} className="w-full p-3 rounded-lg border border-white/30 mb-3 bg-white/40" />

              <label className="block text-sm text-gray-500 mb-1">Profile Image URL</label>
              <input type="text" value={editImage} onChange={(e) => setEditImage(e.target.value)} className="w-full p-3 rounded-lg border border-white/30 mb-3 bg-white/40" />

              <label className="block text-sm text-gray-500 mb-1">Banner Image URL</label>
              <input type="text" value={editBanner} onChange={(e) => setEditBanner(e.target.value)} className="w-full p-3 rounded-lg border border-white/30 mb-4 bg-white/40" />

              <div className="flex gap-3">
                <button onClick={() => {
                  const updated = {
                    ...seller,
                    shopName: editShopName,
                    image: editImage,
                    banner: editBanner,
                  };
                  setSeller(updated);
                  localStorage.setItem("sellerUser", JSON.stringify(updated));
                  setShowEditModal(false);
                  toast.success("Shop info updated!");
                }} className="flex-1 py-3 rounded-lg bg-orange-600 text-white font-medium">Save Changes</button>

                <button onClick={() => setShowEditModal(false)} className="py-3 px-4 rounded-lg bg-white/30 border border-white/20">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} className="relative w-full max-w-5xl p-8 rounded-3xl bg-gradient-to-br from-white/20 to-transparent border border-white/20 shadow-2xl">
              <button onClick={() => setShowUpgradeModal(false)} className="absolute top-4 right-6 text-white/80 text-2xl">×</button>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Upgrade Your Shop Plan</h2>

              <div className="flex gap-6 overflow-x-auto snap-x py-2">
                {/* Free */}
                <div className="min-w-[280px] snap-center rounded-2xl p-6 bg-white/30 border border-white/20">
                  <h4 className="font-semibold text-gray-800">Free</h4>
                  <p className="text-sm text-gray-500 mt-2">Ksh 0 / year</p>
                  <ul className="mt-4 text-sm space-y-2 text-gray-700">
                    <li className="flex items-center gap-2"><CheckCircle className="text-green-400" /> Add up to 5 Products</li>
                    <li className="flex items-center gap-2"><CheckCircle className="text-green-400" /> Receive up to 5 Orders</li>
                  </ul>
                  <div className="mt-6">
                    <button disabled className="w-full py-2 rounded-lg bg-gray-300 text-white cursor-not-allowed">Current</button>
                  </div>
                </div>

                {/* Basic */}
                <div className="min-w-[320px] snap-center rounded-2xl p-6 bg-gradient-to-b from-orange-50 to-white border border-orange-200 shadow">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-orange-600">Basic</h4>
                    <div className="text-sm font-semibold">Ksh 1300/yr</div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Standard shop visibility & boost credits</p>
                  <ul className="mt-4 text-sm space-y-2 text-gray-700">
                    <li className="flex items-center gap-2"><CheckCircle className="text-green-400" /> Add up to 100 Products</li>
                    <li className="flex items-center gap-2"><CheckCircle className="text-green-400" /> Receive up to 100 Orders</li>
                    <li className="flex items-center gap-2"><CheckCircle className="text-green-400" /> Product Ads Boost</li>
                  </ul>
                  <div className="mt-6">
                    <button onClick={() => openPaymentModal("basic")} className="w-full py-2 rounded-lg bg-orange-600 text-white">Upgrade to Basic</button>
                  </div>
                </div>

                {/* Premium */}
                <div className="min-w-[360px] snap-center rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-white border border-blue-200 shadow-2xl relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-br from-blue-300 to-purple-300 opacity-20 blur-2xl transform rotate-12" />
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-blue-600">Premium</h4>
                    <div className="text-sm font-semibold">Ksh 3000/yr</div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Maximum visibility, premium badge & unlimited products</p>
                  <ul className="mt-4 text-sm space-y-2 text-gray-700">
                    <li className="flex items-center gap-2"><CheckCircle className="text-green-400" /> Unlimited Products</li>
                    <li className="flex items-center gap-2"><CheckCircle className="text-green-400" /> Premium Badge</li>
                    <li className="flex items-center gap-2"><CheckCircle className="text-green-400" /> Higher Visibility</li>
                  </ul>
                  <div className="mt-6">
                    <button onClick={() => openPaymentModal("premium")} className="w-full py-2 rounded-lg bg-blue-600 text-white">Upgrade to Premium</button>
                  </div>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} className="relative w-full max-w-md rounded-2xl p-6 bg-white/60 backdrop-blur-lg border border-white/30 shadow-xl">
              <button onClick={() => setShowPaymentModal(false)} className="absolute top-3 right-4 text-gray-600">×</button>
              <h3 className="text-xl font-semibold mb-2">{selectedPlan === "basic" ? "Basic Plan" : "Premium Plan"} — Payment</h3>
              <p className="text-sm text-gray-600 mb-4">Amount: <span className="font-semibold">{selectedPlan === "basic" ? "Ksh 1300" : "Ksh 3000"}</span></p>

              <label className="block text-sm text-gray-500 mb-1">Phone Number</label>
              <input type="text" value={paymentPhone} onChange={(e) => setPaymentPhone(e.target.value)} placeholder="2547xxxxxxxx" className="w-full p-3 rounded-lg border border-white/30 mb-3 bg-white/40" />

              <label className="block text-sm text-gray-500 mb-1">Payment Method</label>
              <div className="flex gap-3 mb-5">
                <button onClick={() => setPaymentMethod("mpesa")} className={`flex-1 py-2 rounded-lg border ${paymentMethod === "mpesa" ? "border-green-500 bg-green-50" : "border-white/20 bg-white/30"}`}>M-Pesa</button>
                <button onClick={() => setPaymentMethod("airtel")} className={`flex-1 py-2 rounded-lg border ${paymentMethod === "airtel" ? "border-red-500 bg-red-50" : "border-white/20 bg-white/30"}`}>Airtel</button>
              </div>

              <div className="flex gap-3">
                <button onClick={handleConfirmPayment} className={`flex-1 py-3 rounded-lg bg-orange-600 text-white ${activatingShop ? "opacity-70 cursor-not-allowed" : ""}`}>{activatingShop ? "Processing..." : "Confirm & Pay"}</button>
                <button onClick={() => setShowPaymentModal(false)} className="py-3 px-4 rounded-lg bg-white/30 border border-white/20">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
