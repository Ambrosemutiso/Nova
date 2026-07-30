"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { CldImage } from "next-cloudinary";
import { useAuth } from "@/app/context/AuthContext";
import TranslateWidget from "@/components/TranslateWidget";
import {
  Headphones,
  ScanLine,
  Settings,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  LayoutGrid,
  PlusSquare,
  Package,
  ShoppingCart,
  TrendingUp,
  CreditCard,
  Star,
  MessageCircle,
  Video,
  Inbox,
  Sliders,
  Users,
  Megaphone,
  ArrowRight,
  User,
  LogOut,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon,
} from "lucide-react";

/**
 * "Seller Account" page — the seller-side counterpart to MyAccountPage.
 * Same layout language and the same shared prefs (font size / dark mode /
 * language, same localStorage keys as MyAccountPage and the old sidebar so
 * the setting stays in sync everywhere), but every tile routes to a real
 * /seller/* page instead. Route list, icon choices and grouping are pulled
 * straight from SellerSidebar.tsx so this page and the sidebar always point
 * to the same places.
 */

interface ActionItem {
  label: string;
  icon: React.ElementType;
  route: string;
}

type SellerAccountPageProps = {
  /** optional: reuse the same seller-login modal trigger the Navbar uses, if any */
  onOpenSellerLogin?: () => void;
};

// Top-row quick actions — the three things a seller checks most often.
const QUICK_ACTIONS: ActionItem[] = [
  { label: "Dashboard", icon: LayoutGrid, route: "/seller/dashboard" },
  { label: "Orders", icon: ShoppingCart, route: "/seller/orders" },
  { label: "Inventory", icon: Package, route: "/seller/inventory" },
];

// Finance & growth — mirrors Finance / Installments in SellerSidebar, plus
// the two things every seller eventually needs: payouts and product intake.
const FINANCE_ACTIONS: ActionItem[] = [
  { label: "Finance", icon: TrendingUp, route: "/seller/finance" },
  { label: "Installments", icon: CreditCard, route: "/seller/installments" },
  { label: "Add product", icon: PlusSquare, route: "/seller/products/add" },
  { label: "Settings", icon: Sliders, route: "/seller/settings" },
];

// Everything else in SellerSidebar that doesn't fit above.
const MORE_FEATURES: ActionItem[] = [
  { label: "Awards", icon: Star, route: "/seller/awards" },
  { label: "Messages", icon: MessageCircle, route: "/seller/chat" },
  { label: "Ad videos", icon: Video, route: "/seller/ads/upload" },
  { label: "Feedback", icon: Inbox, route: "/seller/feedback" },
];

export default function SellerAccountPage({ onOpenSellerLogin }: SellerAccountPageProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const [imgError, setImgError] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(1);
  const [language, setLanguage] = useState("en");

  const hasProfileImage = Boolean(user?.image) && !imgError;

  useEffect(() => { setImgError(false); }, [user?.image]);

  // ── font size — same localStorage key as MyAccountPage / the old sidebar,
  // so it's one shared preference rather than a disconnected control ──
  useEffect(() => {
    const saved = localStorage.getItem("fontSize");
    setFontSize(saved ? parseFloat(saved) : 1);
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize * 100}%`;
    localStorage.setItem("fontSize", fontSize.toString());
  }, [fontSize]);

  // ── language — same as MyAccountPage ──
  useEffect(() => {
    const saved = localStorage.getItem("language");
    if (saved) { setLanguage(saved); document.documentElement.lang = saved; }
  }, []);

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
    const sel = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (sel) { sel.value = language; sel.dispatchEvent(new Event("change")); }
  }, [language]);

  const getPublicId = (url?: string) => {
    if (!url) return "";
    const m = url.match(/\/upload\/(?:v\d+\/)?([^.]+)/);
    return m ? m[1] : url;
  };

  const goTo = (route: string) => () => router.push(route);

  // Signed-in sellers get an inline account menu right here; a signed-out
  // visitor on this route gets sent to seller login instead.
  const handleIdentityTap = () => {
    if (user) {
      setShowAccountMenu((p) => !p);
    } else {
      onOpenSellerLogin?.();
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="mx-auto flex min-h-screen pt-28 w-full max-w-[420px] flex-col bg-[#f4f4f2] font-sans text-neutral-900">
      {/* header */}
      <div className="bg-[#f4f4f2] px-4 pb-4 pt-5">
        <div className="flex items-center justify-between">
          <button onClick={handleIdentityTap} className="flex items-center gap-3">
            <span className="relative">
              {hasProfileImage ? (
                <CldImage
                  src={getPublicId(user!.image)}
                  alt="Profile"
                  width={44}
                  height={44}
                  crop="fill"
                  gravity="face"
                  className="h-11 w-11 rounded-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-200">
                  <User className="h-6 w-6 text-neutral-400" />
                </span>
              )}
              {user && (
                <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-[#f4f4f2] bg-[#22c55e]" />
              )}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-[17px] font-semibold text-neutral-900">
                {user ? user.name?.split(" ")[0] + (user.name?.split(" ")[1] ? ` ${user.name.split(" ")[1]}` : "") : "Seller sign in"}
              </span>
              <ChevronDown className="h-4 w-4 text-neutral-500" />
            </span>
          </button>

          <div className="flex items-center gap-5 text-neutral-800">
            <button onClick={goTo("/desc/help/support")} aria-label="Support">
              <Headphones className="h-5 w-5" />
            </button>
            <button onClick={goTo("/seller/dashboard")} aria-label="Dashboard">
              <ScanLine className="h-5 w-5" />
            </button>
            <button onClick={() => setShowSettings((p) => !p)} aria-label="Preferences">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        <button onClick={goTo("/seller/dashboard")} className="mt-1.5 flex items-center gap-1.5 pl-[3.5rem] text-[14px] text-neutral-500">
          <span>Status</span>
          <span className="text-[#22c55e] font-medium">
            {user ? "Active seller" : "Sign in to sell"}
          </span>
        </button>
      </div>

      {/* inline account menu */}
      {showAccountMenu && user && (
        <div className="mx-4 mb-1 rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="border-b border-neutral-100 pb-3">
            <p className="truncate text-[14px] font-semibold text-neutral-900">{user.name}</p>
            {user.email && <p className="truncate text-[12px] text-neutral-500">{user.email}</p>}
          </div>
          <div className="mt-2 space-y-0.5">
            {[
              { label: "Dashboard", route: "/seller/dashboard" },
              { label: "My Orders", route: "/seller/orders" },
              { label: "Inventory", route: "/seller/inventory" },
              { label: "Finance", route: "/seller/finance" },
            ].map(({ label, route }) => (
              <button
                key={route}
                onClick={goTo(route)}
                className="flex w-full items-center justify-between rounded-xl px-2 py-2.5 text-[13.5px] text-neutral-700 hover:bg-neutral-50"
              >
                {label}
                <ChevronRight className="h-4 w-4 text-neutral-300" />
              </button>
            ))}
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-3.5 w-3.5" /> Log out
          </button>
        </div>
      )}

      {/* preferences panel — same shared prefs as MyAccountPage */}
      {showSettings && (
        <div className="mx-4 mb-1 rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
            Preferences
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFontSize((f) => Math.max(f - 0.1, 0.6))}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 py-2 text-xs font-semibold text-neutral-700 hover:border-[#ff6b35]/40 hover:text-[#ff6b35]"
            >
              <ZoomOut className="h-3.5 w-3.5" /> Smaller
            </button>
            <button
              onClick={() => setFontSize((f) => Math.min(f + 0.1, 2))}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 py-2 text-xs font-semibold text-neutral-700 hover:border-[#ff6b35]/40 hover:text-[#ff6b35]"
            >
              <ZoomIn className="h-3.5 w-3.5" /> Larger
            </button>
          </div>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 py-2 text-xs font-semibold text-neutral-700 hover:border-[#ff6b35]/40 hover:text-[#ff6b35]"
          >
            {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>

          <div className="mt-2">
            <TranslateWidget />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-200 p-2 text-xs text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/30"
            >
              <option value="en">English</option>
              <option value="sw">Kiswahili</option>
              <option value="fr">French</option>
              <option value="ar">Arabic</option>
              <option value="am">Amharic</option>
            </select>
          </div>
        </div>
      )}

      {/* quick actions */}
      <div className="grid grid-cols-3 gap-2.5 px-4">
        {QUICK_ACTIONS.map(({ label, icon: Icon, route }) => (
          <button
            key={label}
            onClick={goTo(route)}
            className="flex items-center justify-between rounded-2xl bg-white px-3.5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            <span className="text-[15px] font-medium text-neutral-800">{label}</span>
            <Icon className="h-5 w-5 text-neutral-400" />
          </button>
        ))}
      </div>

      {/* boost / ads banner — seller equivalent of the buyer "AI Mode" banner */}
      <button
        onClick={goTo("/seller/ads/upload")}
        className="mx-4 mt-3 flex items-center justify-between rounded-2xl bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      >
        <span className="flex items-center gap-2 text-[14px]">
          <Megaphone className="h-4 w-4 text-[#ff6b35]" />
          <span className="text-neutral-800">
            Try <span className="font-medium text-[#ff6b35]">Novaxmax Go Live</span> free and reach more buyers
          </span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-neutral-400" />
      </button>

      {/* my sales */}
      <div className="mx-4 mt-5 rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-neutral-900">My sales</h2>
          <button onClick={goTo("/seller/orders")} className="flex items-center gap-0.5 text-[13px] text-neutral-500">
            View all
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <button onClick={goTo("/seller/orders")} className="mt-3 block w-full rounded-xl bg-[#f7f6f4] p-3.5 text-left">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-neutral-700" />
            <p className="text-[13.5px] leading-snug text-neutral-800">
              <span className="font-semibold">Ship on time</span> to keep your seller rating protected
            </p>
          </div>
          <p className="mt-1 pl-6 text-[12.5px] leading-snug text-[#3a8a5c]">
            Secure payouts &middot; Buyer protection &middot; Guaranteed delivery
          </p>
        </button>
      </div>

      {/* finance & growth */}
      <div className="mt-5 bg-white px-4 pb-5 pt-5">
        <h2 className="text-[17px] font-semibold text-neutral-900">Finance &amp; growth</h2>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {FINANCE_ACTIONS.map(({ label, icon: Icon, route }) => (
            <button key={label} onClick={goTo(route)} className="flex flex-col items-center gap-2 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 text-neutral-700">
                <Icon className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <span className="text-[12px] leading-tight text-neutral-700">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* more features */}
      <div className="mt-2 bg-white px-4 pb-5 pt-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-neutral-900">More features</h2>
          <button onClick={goTo("/seller/dashboard")} className="flex items-center gap-0.5 text-[13px] text-neutral-400">
            All features
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-1.5">
          {MORE_FEATURES.map(({ label, icon: Icon, route }) => (
            <button key={label} onClick={goTo(route)} className="flex flex-col items-center gap-2 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 text-neutral-700">
                <Icon className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <span className="text-[11px] leading-tight text-neutral-700">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* promo cards */}
      <div className="mt-2 grid grid-cols-2 gap-3 bg-white px-4 pb-5 pt-1">
        <button onClick={goTo("/seller/awards")} className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[#ffe4d6] to-[#ffd3bb] p-4 text-left">
          <div>
            <p className="text-[14px] font-semibold text-[#8a3413]">Refer a seller</p>
            <p className="mt-1 flex items-center gap-0.5 text-[12.5px] text-[#8a3413]/80">
              Earn rewards
              <ChevronRight className="h-3.5 w-3.5" />
            </p>
          </div>
          <Users className="mt-3 h-8 w-8 self-end text-[#ff6b35]" strokeWidth={1.5} />
        </button>

        <button onClick={goTo("/seller/inventory")} className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[#fff3d6] to-[#ffe7ad] p-4 text-left">
          <div>
            <p className="text-[14px] font-semibold text-[#7a5a10]">
              See what buyers are searching for
            </p>
            <p className="mt-1 flex items-center gap-0.5 text-[12.5px] text-[#7a5a10]/80">
              Explore now
              <ChevronRight className="h-3.5 w-3.5" />
            </p>
          </div>
          <Package className="mt-3 h-8 w-8 self-end text-[#ff6b35]" strokeWidth={1.5} />
        </button>
      </div>

      {/* utility rows */}
      <div className="mt-2 bg-white px-4 pb-2">
        <button onClick={goTo("/seller/ads/upload")} className="flex w-full items-center justify-between border-b border-neutral-100 py-4">
          <span className="flex items-center gap-3 text-[14.5px] text-neutral-800">
            <Sparkles className="h-5 w-5 text-neutral-800" />
            FREE trial: Novaxmax Go Live
          </span>
          <ArrowRight className="h-4 w-4 text-neutral-400" />
        </button>

        <button onClick={goTo("/desc/help/support")} className="flex w-full items-center justify-between py-4">
          <span className="flex items-center gap-3 text-[14.5px] text-neutral-800">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-800 text-[10px] font-bold">
              N
            </span>
            Visit Seller Support
          </span>
          <ChevronRight className="h-4 w-4 text-neutral-400" />
        </button>
      </div>
    </div>
  );
}