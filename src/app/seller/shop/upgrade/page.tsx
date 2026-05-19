"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Check, X, ShieldCheck,
  TrendingUp, Zap, Loader2, Package, Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";
import GlobalPayModal from "@/components/payments/GlobalPayModal";

// ─── Types ────────────────────────────────────────────────────────────────────

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
    id:          "free",
    name:        "Free",
    price:       "Ksh 0",
    period:      "forever",
    description: "Get started and test the waters.",
    icon:        <Package size={22} className="text-gray-500" />,
    iconBg:      "bg-gray-100",
    accent:      "border-gray-200",
    btnClass:    "bg-gray-100 text-gray-400 cursor-not-allowed",
    features: [
      { ok: true,  text: "Up to 50 active products"  },
      { ok: true,  text: "Up to 50 orders / month"   },
      { ok: true,  text: "Basic sales dashboard"      },
      { ok: false, text: "Product boost & ads"        },
      { ok: false, text: "Featured shop page"         },
      { ok: false, text: "Priority customer support"  },
      { ok: false, text: "Unlimited withdrawals"      },
    ],
  },
  {
    id:          "basic",
    name:        "Basic",
    price:       "Ksh 1,300",
    period:      "per year",
    description: "For sellers ready to grow.",
    icon:        <Zap size={22} className="text-orange-500" />,
    iconBg:      "bg-orange-50",
    accent:      "border-orange-400",
    btnClass:    "bg-orange-600 hover:bg-orange-700 text-white",
    features: [
      { ok: true,  text: "Up to 500 active products"     },
      { ok: true,  text: "Up to 500 orders / month"      },
      { ok: true,  text: "Standard analytics & reports"  },
      { ok: true,  text: "Product boost & ads"           },
      { ok: true,  text: "Shop page visibility"          },
      { ok: false, text: "Priority customer support"     },
      { ok: false, text: "Unlimited withdrawals"         },
    ],
  },
  {
    id:          "premium",
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
      { ok: true, text: "Unlimited active products"      },
      { ok: true, text: "Unlimited orders"               },
      { ok: true, text: "Advanced analytics & reports"   },
      { ok: true, text: "Product boost & premium ads"    },
      { ok: true, text: "Featured shop + Premium badge"  },
      { ok: true, text: "Priority customer support"      },
      { ok: true, text: "Unlimited withdrawals"          },
    ],
  },
];

export const PLAN_AMOUNT: Record<"basic" | "premium", (currentPlan: string) => number> = {
  basic:   ()             => 1300,
  premium: (current)      => current === "basic" ? 1700 : 3000,
};

interface SellerProfile {
  _id: string;
  shop?: { plan?: "free" | "basic" | "premium"; name?: string };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShopPackagesPage() {
  const router = useRouter();

  const [seller, setSeller]               = useState<SellerProfile | null>(null);
  const [selectedPlan, setSelectedPlan]   = useState<"basic" | "premium" | null>(null);
  const [showPayModal, setShowPayModal]   = useState(false);
  const [activating, setActivating]       = useState(false);

  // ── Load seller from localStorage ──
  useEffect(() => {
    const stored = localStorage.getItem("sellerUser");
    if (stored) setSeller(JSON.parse(stored));
  }, []);

  const planLabel = seller?.shop?.plan || "free";

  const amount = selectedPlan
    ? PLAN_AMOUNT[selectedPlan](planLabel)
    : 0;

  const handleSelectPlan = (planId: "basic" | "premium") => {
    setSelectedPlan(planId);
    setShowPayModal(true);
  };

  const handlePaySuccess = () => {
    toast.success("Shop upgraded successfully! 🎉");
    // Optimistically update localStorage so settings page reflects the change
    if (seller && selectedPlan) {
      const updated = { ...seller, shop: { ...seller.shop, plan: selectedPlan } };
      localStorage.setItem("sellerUser", JSON.stringify(updated));
    }
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 pt-24 pb-16 px-4 md:px-8 relative overflow-hidden">
      {/* Subtle bg glow */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-orange-500/10 to-blue-400/5 blur-3xl -z-10" />

      {/* ── Page header ── */}
      <div className="max-w-4xl mx-auto mb-10">
        <button
          onClick={() => router.push("/seller/settings")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition mb-6"
        >
          <ArrowLeft size={16} /> Back to Settings
        </button>

        <p className="text-xs font-semibold text-orange-500 uppercase tracking-widest mb-2">Shop Plans</p>
        <h1 className="text-3xl font-bold text-gray-900">Choose the right plan for your shop</h1>
        <p className="text-gray-500 mt-2 text-sm max-w-xl">
          Unlock more products, higher visibility, and greater earning power.
          Upgrade anytime — no hidden fees.
        </p>

        {/* Current plan indicator */}
        <div className="mt-5 inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 shadow-sm">
          <ShieldCheck size={15} className="text-orange-500" />
          You are currently on the
          <span className="font-semibold text-gray-900 capitalize ml-0.5">{planLabel}</span> plan.
          {planLabel !== "free" && <span className="text-gray-400 ml-1">· Renews annually.</span>}
        </div>
      </div>

      {/* ── Plan cards ── */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {PLANS.map((plan) => {
          const isCurrent   = planLabel === plan.id;
          const isDowngrade = plan.id === "basic" && planLabel === "premium";
          const isDisabled  = isCurrent || isDowngrade || plan.id === "free";

          const displayPrice =
            plan.id === "premium" && planLabel === "basic" && plan.topupPrice
              ? plan.topupPrice
              : plan.price;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: PLANS.indexOf(plan) * 0.08, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={`relative flex flex-col rounded-2xl border-2 bg-white overflow-hidden transition-all
                ${plan.recommended
                  ? "border-blue-500 shadow-xl shadow-blue-100"
                  : isCurrent
                    ? "border-orange-400 shadow-md shadow-orange-50"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
            >
              {/* Ribbon */}
              {plan.recommended && (
                <div className="bg-blue-500 text-white text-[11px] font-bold text-center py-1.5 tracking-wider uppercase">
                  Recommended
                </div>
              )}
              {isCurrent && !plan.recommended && (
                <div className="bg-orange-500 text-white text-[11px] font-bold text-center py-1.5 tracking-wider uppercase">
                  Current Plan
                </div>
              )}

              <div className="p-6 flex flex-col flex-1">
                {/* Icon + name */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-11 h-11 rounded-xl ${plan.iconBg} flex items-center justify-center flex-shrink-0`}>
                    {plan.icon}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-base">{plan.name}</p>
                    <p className="text-xs text-gray-400">{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-gray-900">{displayPrice}</span>
                  <span className="text-sm text-gray-400 ml-1.5">{plan.period}</span>
                  {plan.id === "premium" && planLabel === "basic" && (
                    <p className="text-[11px] text-blue-500 font-medium mt-1">
                      Top-up from Basic — save Ksh 1,300
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-7 flex-1">
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
                  disabled={isDisabled || activating}
                  onClick={() => !isDisabled && plan.id !== "free" && handleSelectPlan(plan.id as "basic" | "premium")}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2
                    ${isDisabled
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : plan.btnClass
                    }`}
                >
                  {isCurrent ? (
                    <><Check size={14} strokeWidth={2.5} /> Current Plan</>
                  ) : isDowngrade ? (
                    "Not available"
                  ) : plan.id === "free" ? (
                    "Free"
                  ) : activating ? (
                    <><Loader2 size={14} className="animate-spin" /> Processing…</>
                  ) : (
                    <>Upgrade to {plan.name} <ArrowLeft size={14} className="rotate-180" /></>
                  )}
                </button>

                {isDowngrade && (
                  <p className="text-[11px] text-center text-gray-400 mt-2">
                    You're already on a higher plan
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Trust footer ── */}
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-green-500" />
          Secure payment via M-Pesa & card
        </span>
        <span className="flex items-center gap-1.5">
          <TrendingUp size={13} className="text-blue-400" />
          Instant plan activation after payment
        </span>
        <span className="flex items-center gap-1.5">
          <Zap size={13} className="text-orange-400" />
          Cancel or change plan anytime
        </span>
      </div>

      {/* ── Payment Modal ── */}
      <AnimatePresence>
        {showPayModal && seller && selectedPlan && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowPayModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white p-6 rounded-2xl w-full max-w-md relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowPayModal(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition"
              >
                <X size={17} />
              </button>

              <GlobalPayModal
                payload={{
                  amount,
                  items:       [],
                  deliveryFee: 0,
                  county:      "",
                  town:        "",
                  userId:      seller._id,
                  purpose:     "shop-upgrade",
                  refId:       seller._id,
                }}
                onClose={() => setShowPayModal(false)}
                onSuccess={handlePaySuccess}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
