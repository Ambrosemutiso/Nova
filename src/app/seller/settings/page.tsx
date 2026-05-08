"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store, Gem, Crown, CheckCircle, XCircle,
  Camera, User, Phone, Mail, MapPin, FileText,
  Save, X, Loader2, AlertCircle, Globe,
} from "lucide-react";
import { toast } from "react-toastify";
import GlobalPayModal from "@/components/payments/GlobalPayModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SellerProfile {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  image?: string;
  bio?: string;
  location?: string;
  website?: string;
  shop?: {
    plan?: "free" | "basic" | "premium";
    name?: string;
  };
}

interface EditForm {
  name: string;
  phoneNumber: string;
  bio: string;
  location: string;
  website: string;
  shopName: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLAN_COLORS = {
  premium: "bg-blue-600 text-white",
  basic: "bg-orange-100 text-orange-600",
  free: "bg-gray-100 text-gray-600",
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.38,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SellerSettingsPage() {
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "premium" | null>(null);
  const [activatingShop, setActivatingShop] = useState(false);

  // ── Edit state ──
  const [form, setForm] = useState<EditForm>({
    name: "", phoneNumber: "", bio: "", location: "", website: "", shopName: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<EditForm>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Load seller from localStorage ──
  useEffect(() => {
    const stored = localStorage.getItem("sellerUser");
    if (stored) {
      const parsed: SellerProfile = JSON.parse(stored);
      setSeller(parsed);
      setForm({
        name: parsed.name || "",
        phoneNumber: parsed.phoneNumber || "",
        bio: parsed.bio || "",
        location: parsed.location || "",
        website: parsed.website || "",
        shopName: parsed.shop?.name || "",
      });
    }
  }, []);

  // ── Avatar picker ──
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ── Validation ──
  const validate = (): boolean => {
    const errs: Partial<EditForm> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (form.phoneNumber && !/^\+?\d{9,15}$/.test(form.phoneNumber.replace(/\s/g, "")))
      errs.phoneNumber = "Enter a valid phone number";
    if (form.website && !/^https?:\/\/.+/.test(form.website))
      errs.website = "Website must start with http:// or https://";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Save handler ──
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    try {
      let imageUrl = seller?.image;

      // 1. Upload avatar to Cloudinary if a new one was picked
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");
        formData.append("folder", "sellers");

        const cloudRes = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );
        const cloudData = await cloudRes.json();
        if (!cloudRes.ok) throw new Error("Image upload failed");
        imageUrl = cloudData.secure_url;
      }

      // 2. Save profile to your API
      const res = await fetch("/api/seller/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId: seller?._id,
          name: form.name.trim(),
          phoneNumber: form.phoneNumber.trim(),
          bio: form.bio.trim(),
          location: form.location.trim(),
          website: form.website.trim(),
          shopName: form.shopName.trim(),
          image: imageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      // 3. Sync to localStorage + local state
      const updated: SellerProfile = {
        ...seller!,
        ...data.seller,
        image: imageUrl,
      };
      localStorage.setItem("sellerUser", JSON.stringify(updated));
      setSeller(updated);
      setShowEditModal(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const openPaymentModal = (plan: "basic" | "premium") => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
    setShowUpgradeModal(false);
  };

  const amount =
    selectedPlan === "basic" ? 1300
    : selectedPlan === "premium"
      ? seller?.shop?.plan === "basic" ? 1700 : 3000
    : 0;

  const planLabel = seller?.shop?.plan || "free";
  const displayAvatar = avatarPreview || seller?.image;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 pt-24 pb-16 px-4 md:px-8 relative overflow-hidden">
      {/* bg glow */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-orange-500/10 to-gray-200/5 blur-3xl -z-10" />

      {/* ── Page Header ── */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Seller Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your shop details, plan & preferences.</p>
      </motion.div>

      <div className="grid gap-6 max-w-5xl mx-auto">

        {/* ── Profile Card ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
        >
          {/* Banner */}
          <div className="h-24 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 relative">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
            />
          </div>

          <div className="px-6 pb-6">
            {/* Avatar row */}
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-orange-100 overflow-hidden flex items-center justify-center">
                  {displayAvatar ? (
                    <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-orange-500">
                      {seller?.name?.charAt(0)?.toUpperCase() || "S"}
                    </span>
                  )}
                </div>
                {/* Plan badge on avatar */}
                {seller?.shop?.plan && seller.shop.plan !== "free" && (
                  <span className={`absolute -bottom-1 -right-1 text-xs px-2 py-0.5 rounded-full font-semibold border-2 border-white ${PLAN_COLORS[seller.shop.plan]}`}>
                    {seller.shop.plan === "premium" ? "⭐ Pro" : "✦ Basic"}
                  </span>
                )}
              </div>

              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
              >
                <Camera size={15} /> Edit Profile
              </button>
            </div>

            {/* Info grid */}
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
              <InfoRow icon={<User size={15} />} label="Full Name" value={seller?.name} />
              <InfoRow icon={<Mail size={15} />} label="Email" value={seller?.email} />
              <InfoRow icon={<Phone size={15} />} label="Phone" value={seller?.phoneNumber} />
              <InfoRow icon={<Store size={15} />} label="Shop Name" value={seller?.shop?.name} />
              <InfoRow icon={<MapPin size={15} />} label="Location" value={seller?.location} />
              <InfoRow icon={<Globe size={15} />} label="Website" value={seller?.website} link />
              {seller?.bio && (
                <div className="md:col-span-2">
                  <InfoRow icon={<FileText size={15} />} label="Bio" value={seller.bio} />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Subscription Plan ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-2 mb-4">
            <Crown className="text-orange-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">Subscription Plan</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Plan</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${PLAN_COLORS[planLabel as keyof typeof PLAN_COLORS]}`}>
                {planLabel === "premium" ? <Crown size={13} /> : planLabel === "basic" ? <Gem size={13} /> : null}
                {planLabel.charAt(0).toUpperCase() + planLabel.slice(1)} Plan
              </span>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-sm transition"
            >
              {planLabel === "premium" ? "Manage Plan" : "Upgrade Plan"}
            </button>
          </div>
        </motion.div>

        {/* ── Business Preferences ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <Gem className="text-gray-400" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">Business Preferences</h2>
          </div>
          <p className="text-gray-400 text-sm">Coming soon — configure delivery, policies & working hours.</p>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════
          EDIT PROFILE MODAL
      ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center px-4 py-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Edit Profile</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Update your seller information</p>
                </div>
                <button onClick={() => { setShowEditModal(false); setAvatarPreview(null); setErrors({}); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 py-6 space-y-6">

                {/* Avatar Upload */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-24 h-24 rounded-full border-4 border-orange-100 overflow-hidden bg-orange-50 flex items-center justify-center shadow">
                      {avatarPreview || seller?.image ? (
                        <img src={avatarPreview || seller?.image} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl font-bold text-orange-400">
                          {form.name?.charAt(0)?.toUpperCase() || "S"}
                        </span>
                      )}
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <Camera size={20} className="text-white" />
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1.5 transition"
                  >
                    <Camera size={14} /> Change photo
                  </button>
                  <p className="text-xs text-gray-400">JPG, PNG or WebP · Max 5MB</p>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100" />

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <FormField
                    label="Full Name" required
                    icon={<User size={15} />}
                    value={form.name}
                    onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                    error={errors.name}
                    placeholder="Your full name"
                  />

                  <FormField
                    label="Shop Name"
                    icon={<Store size={15} />}
                    value={form.shopName}
                    onChange={(v) => setForm((p) => ({ ...p, shopName: v }))}
                    placeholder="Your shop display name"
                  />

                  <FormField
                    label="Phone Number"
                    icon={<Phone size={15} />}
                    value={form.phoneNumber}
                    onChange={(v) => setForm((p) => ({ ...p, phoneNumber: v }))}
                    error={errors.phoneNumber}
                    placeholder="+254 7XX XXX XXX"
                    type="tel"
                  />

                  <FormField
                    label="Location"
                    icon={<MapPin size={15} />}
                    value={form.location}
                    onChange={(v) => setForm((p) => ({ ...p, location: v }))}
                    placeholder="e.g. Nairobi, Kenya"
                  />

                  <div className="sm:col-span-2">
                    <FormField
                      label="Website"
                      icon={<Globe size={15} />}
                      value={form.website}
                      onChange={(v) => setForm((p) => ({ ...p, website: v }))}
                      error={errors.website}
                      placeholder="https://yourshop.com"
                      type="url"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      <span className="flex items-center gap-1.5"><FileText size={13} />Bio</span>
                    </label>
                    <textarea
                      value={form.bio}
                      onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                      placeholder="Tell buyers a little about yourself and your shop..."
                      rows={3}
                      maxLength={300}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">{form.bio.length}/300</p>
                  </div>
                </div>

                {/* Email — read-only */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3">
                  <Mail size={15} className="text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Email (cannot be changed)</p>
                    <p className="text-sm font-medium text-gray-600">{seller?.email}</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
                <button
                  onClick={() => { setShowEditModal(false); setAvatarPreview(null); setErrors({}); }}
                  className="px-5 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════
          UPGRADE PLAN MODAL (unchanged logic, kept as-is)
      ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-10 left-20 text-white/10 text-8xl animate-pulse">💼</div>
              <div className="absolute bottom-20 right-24 text-white/10 text-8xl animate-pulse delay-200">🛒</div>
            </div>
            <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500/10 via-transparent to-blue-400/10 pointer-events-none" />
              <button onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 right-5 text-white/70 hover:text-orange-400 text-3xl font-bold transition">×</button>
              <h2 className="text-3xl font-bold text-white mb-8 text-center">Upgrade Your Shop Plan</h2>
              <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto snap-x snap-mandatory px-2 pb-2">

                {/* Free */}
                <div className="min-w-[85%] md:min-w-0 snap-center border border-white/20 rounded-2xl p-6 bg-white/10 hover:bg-white/20 transition relative backdrop-blur-md">
                  {planLabel === "free" && <PlanBadge color="bg-gray-500" label="Current Plan" />}
                  <h3 className="text-xl font-semibold text-white">Free Plan</h3>
                  <p className="text-gray-300 mb-3">Ksh 0 / year</p>
                  <PlanFeatures features={[
                    { ok: true, text: "Up to 50 Products" },
                    { ok: true, text: "Up to 50 Orders" },
                    { ok: true, text: "Limited Analytics" },
                    { ok: false, text: "No Product Boost" },
                    { ok: false, text: "No Front Shop" },
                  ]} />
                  <button disabled className="w-full bg-gray-500 text-white py-2 rounded cursor-not-allowed text-sm mt-4">Free</button>
                </div>

                {/* Basic */}
                <div className="min-w-[85%] md:min-w-0 snap-center border border-orange-400/50 rounded-2xl p-6 bg-gradient-to-b from-orange-500/10 to-transparent hover:shadow-orange-500/30 hover:shadow-xl transition relative backdrop-blur-md">
                  {planLabel === "basic" && <PlanBadge color="bg-orange-500" label="Current Plan" />}
                  <h3 className="text-xl font-semibold text-orange-400">Basic Plan</h3>
                  <p className="text-gray-200 mb-3">Ksh 1,300 / year</p>
                  <PlanFeatures features={[
                    { ok: true, text: "Up to 500 Products" },
                    { ok: true, text: "Up to 500 Orders" },
                    { ok: true, text: "Standard Visibility" },
                    { ok: true, text: "Product Ads Boost" },
                    { ok: true, text: "Shop Visibility" },
                  ]} />
                  <button onClick={() => openPaymentModal("basic")} disabled={activatingShop}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-medium transition text-sm mt-4">
                    {activatingShop ? "Processing…" : "Upgrade to Basic"}
                  </button>
                </div>

                {/* Premium */}
                <div className="relative min-w-[85%] md:min-w-0 snap-center">
                  <div className="absolute inset-0 -z-10 flex items-center justify-center">
                    <div className="absolute w-[140%] h-[140%] rounded-full bg-gradient-to-r from-orange-400 via-pink-400 to-purple-500 opacity-30 blur-3xl animate-pulse" />
                  </div>
                  <div className="relative border border-blue-400/60 rounded-2xl p-6 bg-gradient-to-b from-blue-500/10 to-transparent hover:shadow-blue-400/40 hover:shadow-2xl hover:scale-[1.02] transition backdrop-blur-md">
                    {planLabel === "premium" && <PlanBadge color="bg-blue-500" label="Current Plan" />}
                    <span className="absolute -top-3 left-1/4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow">Recommended</span>
                    <h3 className="text-xl font-semibold text-blue-300">Premium Plan</h3>
                    <p className="text-gray-200 mb-3">{planLabel === "basic" ? "Top-up Ksh 1,700" : "Ksh 3,000 / year"}</p>
                    <PlanFeatures features={[
                      { ok: true, text: "All Basic Features" },
                      { ok: true, text: "Premium Badge" },
                      { ok: true, text: "Higher Visibility" },
                      { ok: true, text: "Unlimited Withdrawals" },
                      { ok: true, text: "Unlimited Orders" },
                      { ok: true, text: "Unlimited Products" },
                    ]} />
                    <button onClick={() => openPaymentModal("premium")} disabled={activatingShop}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium transition text-sm mt-4">
                      {activatingShop ? "Processing…" : "Upgrade to Premium"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && seller && (
          <motion.div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-xl w-full max-w-md relative shadow-xl">
              <GlobalPayModal
                payload={{ amount, items: [], deliveryFee: 0, county: "", town: "", userId: seller._id, purpose: "shop-upgrade", refId: seller._id }}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={() => { toast.success("Shop upgraded successfully!"); window.location.reload(); }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({ icon, label, value, link }: { icon: React.ReactNode; label: string; value?: string; link?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5 py-1">
      <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        {link ? (
          <a href={value} target="_blank" rel="noopener noreferrer"
            className="text-sm font-medium text-orange-600 hover:underline truncate block">{value}</a>
        ) : (
          <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
        )}
      </div>
    </div>
  );
}

function FormField({
  label, icon, value, onChange, error, placeholder, type = "text", required,
}: {
  label: string; icon: React.ReactNode; value: string;
  onChange: (v: string) => void; error?: string;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">
        <span className="flex items-center gap-1.5">
          {icon}{label}{required && <span className="text-red-400">*</span>}
        </span>
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none transition
          focus:ring-2 focus:ring-orange-400 focus:border-orange-400
          ${error ? "border-red-300 bg-red-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
      />
      {error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle size={11} />{error}
        </p>
      )}
    </div>
  );
}

function PlanBadge({ color, label }: { color: string; label: string }) {
  return (
    <span className={`absolute -top-3 left-1/2 -translate-x-1/2 ${color} text-white px-3 py-1 rounded-full text-xs font-bold shadow`}>
      {label}
    </span>
  );
}

function PlanFeatures({ features }: { features: { ok: boolean; text: string }[] }) {
  return (
    <ul className="space-y-2 text-sm text-gray-200">
      {features.map((f, i) => (
        <li key={i} className="flex items-center gap-2">
          {f.ok
            ? <CheckCircle size={15} className="text-green-400 flex-shrink-0" />
            : <XCircle size={15} className="text-red-400 flex-shrink-0" />}
          {f.text}
        </li>
      ))}
    </ul>
  );
}