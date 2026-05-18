"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store, Gem, Crown, CheckCircle, XCircle,
  Camera, User, Phone, Mail, MapPin, FileText,
  Save, X, Loader2, AlertCircle, Globe,
  Zap, ShieldCheck, TrendingUp, Package, Sparkles,
  ArrowRight, Check,
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
  businessPreferences?: BusinessPreferences;
}

interface EditForm {
  name: string;
  phoneNumber: string;
  bio: string;
  location: string;
  website: string;
  shopName: string;
}

interface WorkingDay {
  open: string;
  close: string;
  enabled: boolean;
}

interface PaymentMethod {
  id: string;
  label: string;
  enabled: boolean;
  details: string;
}

interface BusinessPreferences {
  delivery: {
    sameDay: boolean;
    pickupAvailable: boolean;
    estimatedDelivery: string;
    deliveryFee: number;
    freeDeliveryThreshold: number;
  };
  returns: {
    acceptsReturns: boolean;
    returnWindow: number;
    conditions: string;
  };
  workingHours: {
    monday: WorkingDay;
    tuesday: WorkingDay;
    wednesday: WorkingDay;
    thursday: WorkingDay;
    friday: WorkingDay;
    saturday: WorkingDay;
    sunday: WorkingDay;
  };
  paymentMethods: PaymentMethod[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "mpesa",  label: "M-Pesa",              enabled: false, details: "" },
  { id: "card",   label: "Credit / Debit Card",  enabled: false, details: "" },
  { id: "bank",   label: "Bank Transfer",        enabled: false, details: "" },
  { id: "cash",   label: "Cash on Delivery",     enabled: false, details: "" },
  { id: "paypal", label: "PayPal",               enabled: false, details: "" },
];

const DEFAULT_BUSINESS_PREFS: BusinessPreferences = {
  delivery: {
    sameDay: false,
    pickupAvailable: false,
    estimatedDelivery: "",
    deliveryFee: 0,
    freeDeliveryThreshold: 0,
  },
  returns: {
    acceptsReturns: false,
    returnWindow: 0,
    conditions: "",
  },
  workingHours: {
    monday:    { open: "08:00", close: "18:00", enabled: true  },
    tuesday:   { open: "08:00", close: "18:00", enabled: true  },
    wednesday: { open: "08:00", close: "18:00", enabled: true  },
    thursday:  { open: "08:00", close: "18:00", enabled: true  },
    friday:    { open: "08:00", close: "18:00", enabled: true  },
    saturday:  { open: "08:00", close: "18:00", enabled: false },
    sunday:    { open: "08:00", close: "18:00", enabled: false },
  },
  paymentMethods: DEFAULT_PAYMENT_METHODS,
};

const PLAN_COLORS = {
  premium: "bg-blue-600 text-white",
  basic:   "bg-orange-100 text-orange-600",
  free:    "bg-gray-100 text-gray-600",
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

const PAYMENT_DETAIL_LABELS: Record<string, string> = {
  mpesa:  "M-Pesa Till / Paybill / Phone Number",
  card:   "Stripe / Payment processor account",
  bank:   "Bank name, account number & branch",
  cash:   "Collection address or instructions",
  paypal: "PayPal email address",
};

const PAYMENT_DETAIL_PLACEHOLDERS: Record<string, string> = {
  mpesa:  "e.g. Till 123456 or +254 7XX XXX XXX",
  card:   "e.g. Stripe account ID or merchant ID",
  bank:   "e.g. KCB — 1234567890, Westlands Branch",
  cash:   "e.g. Collect at Shop B2, Westgate Mall, Nairobi",
  paypal: "e.g. payments@yourbusiness.com",
};

const PAYMENT_DETAIL_HINTS: Record<string, string> = {
  mpesa:  "Buyers will be prompted to pay to this number or till at checkout.",
  card:   "Your payment processor handles card transactions and deposits earnings to you.",
  bank:   "Used for direct bank transfers. Include account name, number and bank branch.",
  cash:   "Only show this if buyers physically collect orders. Describe where to pay.",
  paypal: "Buyers pay via PayPal; funds are sent to this email address.",
};

// ─── Plan definitions (single source of truth) ────────────────────────────────

interface Plan {
  id:           "free" | "basic" | "premium";
  name:         string;
  price:        string;
  period:       string;
  description:  string;
  icon:         React.ReactNode;
  iconBg:       string;
  accent:       string;
  btnClass:     string;
  topupPrice?:  string;
  recommended?: boolean;
  features:     { ok: boolean; text: string }[];
}

const PLANS: Plan[] = [
  {
    id:          "free" as const,
    name:        "Free",
    price:       "Ksh 0",
    period:      "forever",
    description: "Get started and test the waters.",
    icon:        <Package size={22} className="text-gray-500" />,
    iconBg:      "bg-gray-100",
    accent:      "border-gray-200",
    btnClass:    "bg-gray-100 text-gray-400 cursor-not-allowed",
    features: [
      { ok: true,  text: "Up to 50 active products"          },
      { ok: true,  text: "Up to 50 orders / month"           },
      { ok: true,  text: "Basic sales dashboard"             },
      { ok: false, text: "Product boost & ads"               },
      { ok: false, text: "Featured shop page"                },
      { ok: false, text: "Priority customer support"         },
      { ok: false, text: "Unlimited withdrawals"             },
    ],
  },
  {
    id:          "basic" as const,
    name:        "Basic",
    price:       "Ksh 1,300",
    period:      "per year",
    description: "For sellers ready to grow.",
    icon:        <Zap size={22} className="text-orange-500" />,
    iconBg:      "bg-orange-50",
    accent:      "border-orange-400",
    btnClass:    "bg-orange-600 hover:bg-orange-700 text-white",
    features: [
      { ok: true,  text: "Up to 500 active products"         },
      { ok: true,  text: "Up to 500 orders / month"          },
      { ok: true,  text: "Standard analytics & reports"      },
      { ok: true,  text: "Product boost & ads"               },
      { ok: true,  text: "Shop page visibility"              },
      { ok: false, text: "Priority customer support"         },
      { ok: false, text: "Unlimited withdrawals"             },
    ],
  },
  {
    id:          "premium" as const,
    name:        "Premium",
    price:       "Ksh 3,000",
    period:      "per year",
    topupPrice:  "Ksh 1,700",
    description: "Maximum reach. Zero limits.",
    icon:        <Sparkles size={22} className="text-blue-500" />,
    iconBg:      "bg-blue-50",
    accent:      "border-blue-500",
    btnClass:    "bg-blue-600 hover:bg-blue-700 text-white",
    recommended: true,
    features: [
      { ok: true, text: "Unlimited active products"          },
      { ok: true, text: "Unlimited orders"                   },
      { ok: true, text: "Advanced analytics & reports"       },
      { ok: true, text: "Product boost & premium ads"        },
      { ok: true, text: "Featured shop + Premium badge"      },
      { ok: true, text: "Priority customer support"          },
      { ok: true, text: "Unlimited withdrawals"              },
    ],
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SellerSettingsPage() {
  const [seller, setSeller]                   = useState<SellerProfile | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditModal, setShowEditModal]       = useState(false);
  const [selectedPlan, setSelectedPlan]         = useState<"basic" | "premium" | null>(null);
  const [activatingShop, setActivatingShop]     = useState(false);

  const [form, setForm] = useState<EditForm>({
    name: "", phoneNumber: "", bio: "", location: "", website: "", shopName: "",
  });
  const [avatarFile, setAvatarFile]       = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving]               = useState(false);
  const [errors, setErrors]               = useState<Partial<EditForm>>({});
  const fileInputRef                      = useRef<HTMLInputElement>(null);
  const [savingBusinessPrefs, setSavingBusinessPrefs] = useState(false);
  const [businessPrefs, setBusinessPrefs] = useState<BusinessPreferences>(DEFAULT_BUSINESS_PREFS);

  // ── Load seller ──
  useEffect(() => {
    const stored = localStorage.getItem("sellerUser");
    if (stored) {
      const parsed: SellerProfile = JSON.parse(stored);
      setSeller(parsed);
      if (parsed.businessPreferences) setBusinessPrefs(parsed.businessPreferences);
      setForm({
        name:        parsed.name            || "",
        phoneNumber: parsed.phoneNumber     || "",
        bio:         parsed.bio             || "",
        location:    parsed.location        || "",
        website:     parsed.website         || "",
        shopName:    parsed.shop?.name      || "",
      });
    }
  }, []);

  // ── Business prefs save ──
  const handleSaveBusinessPreferences = async () => {
    try {
      setSavingBusinessPrefs(true);
      const res = await fetch("/api/seller/business-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId:       seller?._id,
          delivery:       businessPrefs.delivery,
          returns:        businessPrefs.returns,
          workingHours:   businessPrefs.workingHours,
          paymentMethods: businessPrefs.paymentMethods,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save preferences");
      const updatedSeller = { ...seller, businessPreferences: businessPrefs };
      localStorage.setItem("sellerUser", JSON.stringify(updatedSeller));
      setSeller(updatedSeller as any);
      toast.success("Business preferences updated");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setSavingBusinessPrefs(false);
    }
  };

  // ── Avatar picker ──
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
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

  // ── Profile save ──
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("sellerId",    seller?._id   || "");
      formData.append("name",        form.name.trim());
      formData.append("phoneNumber", form.phoneNumber.trim());
      formData.append("bio",         form.bio.trim());
      formData.append("location",    form.location.trim());
      formData.append("website",     form.website.trim());
      formData.append("shopName",    form.shopName.trim());
      if (avatarFile) formData.append("image", avatarFile);

      const res  = await fetch("/api/seller/profile", { method: "PATCH", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      const updated: SellerProfile = { ...seller!, ...data.seller };
      localStorage.setItem("sellerUser", JSON.stringify(updated));
      setSeller(updated);
      setAvatarFile(null);
      setAvatarPreview(null);
      setShowEditModal(false);
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
    selectedPlan === "basic"    ? 1300
    : selectedPlan === "premium"
      ? seller?.shop?.plan === "basic" ? 1700 : 3000
    : 0;

  const planLabel    = seller?.shop?.plan || "free";
  const displayAvatar = avatarPreview || seller?.image;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 pt-24 pb-16 px-4 md:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-orange-500/10 to-gray-200/5 blur-3xl -z-10" />

      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your shop details, plan & preferences.</p>
      </motion.div>

      <div className="grid gap-6 max-w-5xl mx-auto">

        {/* ── Profile Card ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 relative">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
            />
          </div>
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-orange-100 overflow-hidden flex items-center justify-center">
                  {displayAvatar
                    ? <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" />
                    : <span className="text-2xl font-bold text-orange-500">{seller?.name?.charAt(0)?.toUpperCase() || "S"}</span>
                  }
                </div>
                {seller?.shop?.plan && seller.shop.plan !== "free" && (
                  <span className={`absolute -bottom-1 -right-1 text-xs px-2 py-0.5 rounded-full font-semibold border-2 border-white ${PLAN_COLORS[seller.shop.plan]}`}>
                    {seller.shop.plan === "premium" ? "⭐ Pro" : "✦ Basic"}
                  </span>
                )}
              </div>
              <button onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
                <Camera size={15} /> Edit Profile
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
              <InfoRow icon={<User size={15} />}    label="Full Name"  value={seller?.name} />
              <InfoRow icon={<Mail size={15} />}    label="Email"      value={seller?.email} />
              <InfoRow icon={<Phone size={15} />}   label="Phone"      value={seller?.phoneNumber} />
              <InfoRow icon={<Store size={15} />}   label="Shop Name"  value={seller?.shop?.name} />
              <InfoRow icon={<MapPin size={15} />}  label="Location"   value={seller?.location} />
              <InfoRow icon={<Globe size={15} />}   label="Website"    value={seller?.website} link />
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
          className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
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
            <button onClick={() => setShowUpgradeModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-sm transition">
              {planLabel === "premium" ? "Manage Plan" : "Upgrade Plan"}
            </button>
          </div>
        </motion.div>

        {/* ── Business Preferences ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Business Preferences</h2>
              <p className="text-sm text-gray-500 mt-1">Configure delivery, returns, operating hours and payment options.</p>
            </div>
            <button onClick={handleSaveBusinessPreferences} disabled={savingBusinessPrefs}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60">
              {savingBusinessPrefs ? "Saving..." : "Save Preferences"}
            </button>
          </div>

          <div className="space-y-6">

            {/* Delivery */}
            <section className="border border-gray-100 rounded-xl p-5">
              <h3 className="font-semibold text-gray-800 mb-1">Delivery Settings</h3>
              <p className="text-xs text-gray-400 mb-4">Tell buyers how you ship — fees, timelines and pickup options.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <ToggleRow label="Same Day Delivery" hint="Offer delivery within the same calendar day for eligible orders"
                  checked={businessPrefs.delivery.sameDay}
                  onChange={(v) => setBusinessPrefs((p) => ({ ...p, delivery: { ...p.delivery, sameDay: v } }))} />
                <ToggleRow label="Pickup Available" hint="Buyers can collect orders directly from your location"
                  checked={businessPrefs.delivery.pickupAvailable}
                  onChange={(v) => setBusinessPrefs((p) => ({ ...p, delivery: { ...p.delivery, pickupAvailable: v } }))} />
                <LabeledInput label="Estimated Delivery Time" hint='How long does delivery normally take? e.g. "1–3 business days"'
                  placeholder="e.g. 1–3 business days" value={businessPrefs.delivery.estimatedDelivery}
                  onChange={(v) => setBusinessPrefs((p) => ({ ...p, delivery: { ...p.delivery, estimatedDelivery: v } }))} />
                <LabeledInput label="Standard Delivery Fee" hint="Flat fee charged per order. Enter 0 for free delivery."
                  placeholder="e.g. 150" type="number" prefix="Ksh" value={String(businessPrefs.delivery.deliveryFee)}
                  onChange={(v) => setBusinessPrefs((p) => ({ ...p, delivery: { ...p.delivery, deliveryFee: Number(v) } }))} />
                <LabeledInput label="Free Delivery Threshold" hint="Orders above this amount qualify for free delivery. Set to 0 to disable."
                  placeholder="e.g. 2000" type="number" prefix="Ksh" className="sm:col-span-2"
                  value={String(businessPrefs.delivery.freeDeliveryThreshold)}
                  onChange={(v) => setBusinessPrefs((p) => ({ ...p, delivery: { ...p.delivery, freeDeliveryThreshold: Number(v) } }))} />
              </div>
            </section>

            {/* Returns */}
            <section className="border border-gray-100 rounded-xl p-5">
              <h3 className="font-semibold text-gray-800 mb-1">Return Policy</h3>
              <p className="text-xs text-gray-400 mb-4">Define your return rules — buyers see this on every product page.</p>
              <div className="space-y-4">
                <ToggleRow label="Accept Returns" hint="Allow buyers to initiate return requests"
                  checked={businessPrefs.returns.acceptsReturns}
                  onChange={(v) => setBusinessPrefs((p) => ({ ...p, returns: { ...p.returns, acceptsReturns: v } }))} />
                {businessPrefs.returns.acceptsReturns && (
                  <>
                    <LabeledInput label="Return Window" hint="How many days after delivery can buyers request a return?"
                      placeholder="e.g. 7" type="number" suffix="days" value={String(businessPrefs.returns.returnWindow)}
                      onChange={(v) => setBusinessPrefs((p) => ({ ...p, returns: { ...p.returns, returnWindow: Number(v) } }))} />
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Return Conditions</label>
                      <p className="text-xs text-gray-400 mb-1.5">Describe the state items must be in to qualify for a return.</p>
                      <textarea placeholder='e.g. "Item must be unused, in original packaging, with proof of purchase."'
                        value={businessPrefs.returns.conditions} rows={3}
                        onChange={(e) => setBusinessPrefs((p) => ({ ...p, returns: { ...p.returns, conditions: e.target.value } }))}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition resize-none" />
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Working Hours */}
            <section className="border border-gray-100 rounded-xl p-5">
              <h3 className="font-semibold text-gray-800 mb-1">Operating Hours</h3>
              <p className="text-xs text-gray-400 mb-4">Set the hours you're available to process orders. Unchecked days show as "Closed" on your shop page.</p>
              <div className="space-y-2">
                {Object.entries(businessPrefs.workingHours).map(([day, value]) => (
                  <div key={day} className={`grid grid-cols-[110px_1fr_1fr_auto] gap-3 items-center rounded-lg p-3 border transition ${value.enabled ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50 opacity-60"}`}>
                    <span className="capitalize text-sm font-medium text-gray-700">{day}</span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-gray-400 leading-none">Opens</span>
                      <input type="time" value={value.open} disabled={!value.enabled}
                        onChange={(e) => setBusinessPrefs((p) => ({ ...p, workingHours: { ...p.workingHours, [day]: { ...value, open: e.target.value } } }))}
                        className="border border-gray-200 rounded px-2 py-1.5 text-sm disabled:bg-gray-100 disabled:text-gray-400 outline-none focus:ring-1 focus:ring-orange-400" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-gray-400 leading-none">Closes</span>
                      <input type="time" value={value.close} disabled={!value.enabled}
                        onChange={(e) => setBusinessPrefs((p) => ({ ...p, workingHours: { ...p.workingHours, [day]: { ...value, close: e.target.value } } }))}
                        className="border border-gray-200 rounded px-2 py-1.5 text-sm disabled:bg-gray-100 disabled:text-gray-400 outline-none focus:ring-1 focus:ring-orange-400" />
                    </div>
                    <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
                      <input type="checkbox" checked={value.enabled} className="accent-orange-500 w-4 h-4"
                        onChange={(e) => setBusinessPrefs((p) => ({ ...p, workingHours: { ...p.workingHours, [day]: { ...value, enabled: e.target.checked } } }))} />
                      {value.enabled ? "Open" : "Closed"}
                    </label>
                  </div>
                ))}
              </div>
            </section>

            {/* Payment Methods */}
            <section className="border border-gray-100 rounded-xl p-5">
              <h3 className="font-semibold text-gray-800 mb-1">Payment Methods</h3>
              <p className="text-xs text-gray-400 mb-4">Enable the payment methods you accept. Buyers will see these on your shop and at checkout.</p>
              <div className="space-y-3">
                {businessPrefs.paymentMethods.map((method, idx) => (
                  <div key={method.id} className={`border rounded-xl p-4 transition ${method.enabled ? "border-orange-200 bg-orange-50/40" : "border-gray-100 bg-gray-50/50"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <PaymentMethodIcon id={method.id} />
                        <span className="text-sm font-medium text-gray-800">{method.label}</span>
                        {method.enabled && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Active</span>}
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <span className="text-xs text-gray-500">{method.enabled ? "Enabled" : "Disabled"}</span>
                        <input type="checkbox" checked={method.enabled} className="accent-orange-500 w-4 h-4"
                          onChange={(e) => {
                            const updated = [...businessPrefs.paymentMethods];
                            updated[idx] = { ...method, enabled: e.target.checked };
                            setBusinessPrefs((p) => ({ ...p, paymentMethods: updated }));
                          }} />
                      </label>
                    </div>
                    {method.enabled && (
                      <div className="mt-3">
                        <label className="block text-xs text-gray-500 mb-1">{PAYMENT_DETAIL_LABELS[method.id] ?? "Account details"}</label>
                        <input type="text" placeholder={PAYMENT_DETAIL_PLACEHOLDERS[method.id] ?? "Enter details"} value={method.details}
                          onChange={(e) => {
                            const updated = [...businessPrefs.paymentMethods];
                            updated[idx] = { ...method, details: e.target.value };
                            setBusinessPrefs((p) => ({ ...p, paymentMethods: updated }));
                          }}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white transition" />
                        <p className="text-[11px] text-gray-400 mt-1">{PAYMENT_DETAIL_HINTS[method.id]}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                <AlertCircle size={11} /> Payment details are only used to route payouts. They are never shown publicly to buyers.
              </p>
            </section>

          </div>
        </motion.div>

      </div>

      {/* ═══════════════════════════════════════════════════
          EDIT PROFILE MODAL
      ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999999999] flex items-center justify-center px-4 py-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Edit Profile</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Update your seller information</p>
                </div>
                <button onClick={() => { setShowEditModal(false); setAvatarPreview(null); setErrors({}); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition">
                  <X size={18} />
                </button>
              </div>
              <div className="px-6 py-6 space-y-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-24 h-24 rounded-full border-4 border-orange-100 overflow-hidden bg-orange-50 flex items-center justify-center shadow">
                      {avatarPreview || seller?.image
                        ? <img src={avatarPreview || seller?.image} alt="avatar" className="w-full h-full object-cover" />
                        : <span className="text-3xl font-bold text-orange-400">{form.name?.charAt(0)?.toUpperCase() || "S"}</span>
                      }
                    </div>
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <Camera size={20} className="text-white" />
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1.5 transition">
                    <Camera size={14} /> Change photo
                  </button>
                  <p className="text-xs text-gray-400">JPG, PNG or WebP · Max 5MB</p>
                </div>
                <div className="border-t border-gray-100" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Full Name" required icon={<User size={15} />} value={form.name}
                    onChange={(v) => setForm((p) => ({ ...p, name: v }))} error={errors.name} placeholder="Your full name" />
                  <FormField label="Shop Name" icon={<Store size={15} />} value={form.shopName}
                    onChange={(v) => setForm((p) => ({ ...p, shopName: v }))} placeholder="Your shop display name" />
                  <FormField label="Phone Number" icon={<Phone size={15} />} value={form.phoneNumber} type="tel"
                    onChange={(v) => setForm((p) => ({ ...p, phoneNumber: v }))} error={errors.phoneNumber} placeholder="+254 7XX XXX XXX" />
                  <FormField label="Location" icon={<MapPin size={15} />} value={form.location}
                    onChange={(v) => setForm((p) => ({ ...p, location: v }))} placeholder="e.g. Nairobi, Kenya" />
                  <div className="sm:col-span-2">
                    <FormField label="Website" icon={<Globe size={15} />} value={form.website} type="url"
                      onChange={(v) => setForm((p) => ({ ...p, website: v }))} error={errors.website} placeholder="https://yourshop.com" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      <span className="flex items-center gap-1.5"><FileText size={13} />Bio</span>
                    </label>
                    <textarea value={form.bio} rows={3} maxLength={300} placeholder="Tell buyers a little about yourself and your shop..."
                      onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition resize-none" />
                    <p className="text-xs text-gray-400 mt-1 text-right">{form.bio.length}/300</p>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3">
                  <Mail size={15} className="text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Email (cannot be changed)</p>
                    <p className="text-sm font-medium text-gray-600">{seller?.email}</p>
                  </div>
                </div>
              </div>
              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
                <button onClick={() => { setShowEditModal(false); setAvatarPreview(null); setErrors({}); }} disabled={saving}
                  className="px-5 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════
          UPGRADE PLAN MODAL — redesigned Meta-style
      ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999999999] flex items-center justify-center px-4 py-8 overflow-y-auto"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowUpgradeModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 24 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="px-8 pt-8 pb-6 border-b border-gray-100 flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-orange-500 uppercase tracking-widest mb-1">Shop Plans</p>
                  <h2 className="text-2xl font-bold text-gray-900">Choose the right plan for your shop</h2>
                  <p className="text-sm text-gray-500 mt-1.5">
                    Unlock more products, visibility, and earning power. Upgrade anytime — cancel anytime.
                  </p>
                </div>
                <button onClick={() => setShowUpgradeModal(false)}
                  className="ml-4 mt-0.5 flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 text-gray-500 transition">
                  <X size={17} />
                </button>
              </div>

              {/* Current plan callout */}
              <div className="px-8 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2 text-sm text-gray-600">
                <ShieldCheck size={15} className="text-orange-500 flex-shrink-0" />
                You are currently on the <span className="font-semibold text-gray-900 capitalize ml-1 mr-1">{planLabel}</span> plan.
                {planLabel !== "free" && <span className="text-gray-400">· Renews annually.</span>}
              </div>

              {/* Plan cards */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {PLANS.map((plan) => {
                    const isCurrent   = planLabel === plan.id;
                    const isDowngrade = plan.id === "basic" && planLabel === "premium";
                    const isDisabled  = isCurrent || isDowngrade || plan.id === "free";

                    // Price shown (topup for premium if already basic)
                    const displayPrice =
                      plan.id === "premium" && planLabel === "basic" && plan.topupPrice
                        ? plan.topupPrice
                        : plan.price;

                    return (
                      <div
                        key={plan.id}
                        className={`relative flex flex-col rounded-2xl border-2 transition-all ${
                          plan.recommended
                            ? "border-blue-500 shadow-lg shadow-blue-100"
                            : isCurrent
                              ? "border-orange-400 shadow-md shadow-orange-50"
                              : "border-gray-200 hover:border-gray-300"
                        } bg-white overflow-hidden`}
                      >
                        {/* Recommended ribbon */}
                        {plan.recommended && (
                          <div className="bg-blue-500 text-white text-[11px] font-bold text-center py-1.5 tracking-wider uppercase">
                            Recommended
                          </div>
                        )}

                        {/* Current plan ribbon */}
                        {isCurrent && !plan.recommended && (
                          <div className="bg-orange-500 text-white text-[11px] font-bold text-center py-1.5 tracking-wider uppercase">
                            Current Plan
                          </div>
                        )}

                        <div className="p-6 flex flex-col flex-1">
                          {/* Icon + name */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-xl ${plan.iconBg} flex items-center justify-center flex-shrink-0`}>
                              {plan.icon}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-base">{plan.name}</p>
                              <p className="text-xs text-gray-400">{plan.description}</p>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="mb-5">
                            <span className="text-3xl font-extrabold text-gray-900">{displayPrice}</span>
                            <span className="text-sm text-gray-400 ml-1.5">{plan.period}</span>
                            {plan.id === "premium" && planLabel === "basic" && (
                              <p className="text-[11px] text-blue-500 font-medium mt-1">
                                Top-up from Basic — save Ksh 1,300
                              </p>
                            )}
                          </div>

                          {/* Features */}
                          <ul className="space-y-2.5 mb-6 flex-1">
                            {plan.features.map((f, i) => (
                              <li key={i} className="flex items-start gap-2.5">
                                {f.ok
                                  ? <Check size={14} className="text-green-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                                  : <X     size={14} className="text-gray-300 flex-shrink-0 mt-0.5"  strokeWidth={2.5} />
                                }
                                <span className={`text-sm ${f.ok ? "text-gray-700" : "text-gray-400"}`}>{f.text}</span>
                              </li>
                            ))}
                          </ul>

                          {/* CTA */}
                          <button
                            disabled={isDisabled || activatingShop}
                            onClick={() => !isDisabled && plan.id !== "free" && openPaymentModal(plan.id)}
                            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 ${
                              isDisabled
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : plan.btnClass
                            }`}
                          >
                            {isCurrent ? (
                              <>
                                <Check size={14} strokeWidth={2.5} /> Current Plan
                              </>
                            ) : isDowngrade ? (
                              "Not available"
                            ) : plan.id === "free" ? (
                              "Free"
                            ) : activatingShop ? (
                              <><Loader2 size={14} className="animate-spin" /> Processing…</>
                            ) : (
                              <>Upgrade to {plan.name} <ArrowRight size={14} /></>
                            )}
                          </button>

                          {/* Downgrade notice */}
                          {isDowngrade && (
                            <p className="text-[11px] text-center text-gray-400 mt-2">
                              You're already on a higher plan
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer trust line */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-green-500" />Secure payment via M-Pesa & card</span>
                  <span className="flex items-center gap-1.5"><TrendingUp  size={13} className="text-blue-400"  />Instant plan activation after payment</span>
                  <span className="flex items-center gap-1.5"><Zap         size={13} className="text-orange-400"/>Cancel or change plan anytime</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
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
        {link
          ? <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-orange-600 hover:underline truncate block">{value}</a>
          : <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
        }
      </div>
    </div>
  );
}

function FormField({ label, icon, value, onChange, error, placeholder, type = "text", required }:
  { label: string; icon: React.ReactNode; value: string; onChange: (v: string) => void; error?: string; placeholder?: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">
        <span className="flex items-center gap-1.5">{icon}{label}{required && <span className="text-red-400">*</span>}</span>
      </label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:ring-2 focus:ring-orange-400 focus:border-orange-400 ${error ? "border-red-300 bg-red-50" : "border-gray-200 bg-white hover:border-gray-300"}`} />
      {error && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
    </div>
  );
}

function PlanFeatures({ features }: { features: { ok: boolean; text: string }[] }) {
  return (
    <ul className="space-y-2 text-sm text-gray-200">
      {features.map((f, i) => (
        <li key={i} className="flex items-center gap-2">
          {f.ok ? <CheckCircle size={15} className="text-green-400 flex-shrink-0" /> : <XCircle size={15} className="text-red-400 flex-shrink-0" />}
          {f.text}
        </li>
      ))}
    </ul>
  );
}

function PaymentMethodIcon({ id }: { id: string }) {
  const icons: Record<string, string> = { mpesa: "📱", card: "💳", bank: "🏦", cash: "💵", paypal: "🅿️" };
  return <span className="text-lg leading-none">{icons[id] ?? "💰"}</span>;
}

function LabeledInput({ label, hint, placeholder, type = "text", value, onChange, prefix, suffix, className = "" }:
  { label: string; hint?: string; placeholder?: string; type?: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-orange-400 focus-within:border-orange-400 transition bg-white">
        {prefix && <span className="bg-gray-50 border-r border-gray-200 px-3 py-2.5 text-xs font-medium text-gray-500 select-none whitespace-nowrap">{prefix}</span>}
        <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2.5 text-sm text-gray-800 outline-none bg-transparent min-w-0" />
        {suffix && <span className="bg-gray-50 border-l border-gray-200 px-3 py-2.5 text-xs font-medium text-gray-500 select-none">{suffix}</span>}
      </div>
    </div>
  );
}

function ToggleRow({ label, hint, checked, onChange }:
  { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start justify-between gap-4 border border-gray-200 rounded-lg px-4 py-3 cursor-pointer hover:border-orange-200 hover:bg-orange-50/30 transition">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
      <div className="relative flex-shrink-0 mt-0.5">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
        <div onClick={() => onChange(!checked)} className={`w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 ${checked ? "bg-orange-500" : "bg-gray-200"}`}>
          <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
        </div>
      </div>
    </label>
  );
}
