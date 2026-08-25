'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { CldImage } from 'next-cloudinary';
import { useAuth } from '@/app/context/AuthContext';
import TranslateWidget from '@/components/TranslateWidget';
import {
  Headphones, ScanLine, Settings, Sparkles, ChevronRight, ChevronDown,
  ShieldCheck, LayoutGrid, PlusSquare, Package, ShoppingCart, TrendingUp,
  CreditCard, Star, MessageCircle, Video, Inbox, Users, Megaphone, ArrowRight,
  User, LogOut, ZoomIn, ZoomOut, Sun, Moon, Sliders, Award, Wallet,
  BarChart3, Bell, MapPin,
} from 'lucide-react';

type SellerAccountPageProps = {
  onOpenSellerLogin?: () => void;
};

const QUICK_ACTIONS = [
  { label: 'Dashboard', icon: LayoutGrid,  route: '/seller/dashboard' },
  { label: 'Orders',    icon: ShoppingCart, route: '/seller/orders'    },
  { label: 'Inventory', icon: Package,      route: '/seller/inventory' },
];

const FINANCE_ACTIONS = [
  { label: 'Finance',      icon: TrendingUp, route: '/seller/finance'      },
  { label: 'Installments', icon: CreditCard, route: '/seller/installments' },
  { label: 'Add product',  icon: PlusSquare, route: '/seller/products/add' },
  { label: 'Settings',     icon: Sliders,    route: '/seller/settings'     },
];

const MORE_FEATURES = [
  { label: 'Awards',    icon: Star,          route: '/seller/awards'      },
  { label: 'Messages',  icon: MessageCircle, route: '/seller/chat'        },
  { label: 'Ad videos', icon: Video,         route: '/seller/ads/upload'  },
  { label: 'Feedback',  icon: Inbox,         route: '/seller/feedback'    },
];

const SIDEBAR_NAV = [
  { label: 'Dashboard',    icon: LayoutGrid,   route: '/seller/dashboard'    },
  { label: 'Inventory',    icon: Package,       route: '/seller/inventory'    },
  { label: 'My Orders',    icon: ShoppingCart,  route: '/seller/orders'       },
  { label: 'Finance',      icon: TrendingUp,    route: '/seller/finance'      },
  { label: 'Installments', icon: CreditCard,    route: '/seller/installments' },
  { label: 'Awards',       icon: Award,         route: '/seller/awards'       },
  { label: 'Messages',     icon: MessageCircle, route: '/seller/chat'         },
  { label: 'Ad Videos',    icon: Video,         route: '/seller/ads/upload'   },
  { label: 'Feedback',     icon: Inbox,         route: '/seller/feedback'     },
  { label: 'Settings',     icon: Sliders,       route: '/seller/settings'     },
  { label: 'Help',         icon: Headphones,    route: '/desc/help/support'   },
];

/* ─── Tile helper ───────────────────────────────────────────────────────── */
function Tile({ icon: Icon, label, route, go }: {
  icon: React.ElementType; label: string; route: string;
  go: (r: string) => () => void;
}) {
  return (
    <button onClick={go(route)} className="flex flex-col items-center gap-2 text-center group">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200
        text-neutral-700 group-hover:border-orange-300 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
        <Icon className="h-5 w-5" strokeWidth={1.6} />
      </span>
      <span className="text-[12px] leading-tight text-neutral-600 group-hover:text-orange-600 transition-colors">{label}</span>
    </button>
  );
}

export default function SellerAccountPage({ onOpenSellerLogin }: SellerAccountPageProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout }    = useAuth();

  const [imgError,        setImgError]        = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showSettings,    setShowSettings]    = useState(false);
  const [language,        setLanguage]        = useState('en');

  const hasProfileImage = Boolean(user?.image) && !imgError;

  useEffect(() => { setImgError(false); }, [user?.image]);

  useEffect(() => {
    const saved = localStorage.getItem('language');
    if (saved) { setLanguage(saved); document.documentElement.lang = saved; }
  }, []);
  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    const sel = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (sel) { sel.value = language; sel.dispatchEvent(new Event('change')); }
  }, [language]);

  const getPublicId = (url?: string) => {
    if (!url) return '';
    const m = url.match(/\/upload\/(?:v\d+\/)?([^.]+)/);
    return m ? m[1] : url;
  };

  const go = (route: string) => () => router.push(route);

  const handleIdentityTap = () => {
    if (user) setShowAccountMenu(p => !p);
    else onOpenSellerLogin?.();
  };

  const handleLogout = () => { logout(); router.push('/'); };

  /* ── Preferences panel — shared between mobile & desktop sidebar ── */
  const PreferencesPanel = () => (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-neutral-400">Preferences</p>
      <div className="flex items-center gap-2">

      </div>
      <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 py-2 text-xs font-semibold text-neutral-700 hover:border-orange-300 hover:text-orange-600 transition-colors">
        {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
      </button>
      <div className="mt-2">
        <TranslateWidget />
        <select value={language} onChange={e => setLanguage(e.target.value)}
          className="mt-2 w-full rounded-xl border border-neutral-200 p-2 text-xs text-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-300/50">
          <option value="en">🇬🇧 English</option>
          <option value="sw">🇰🇪 Kiswahili</option>
          <option value="fr">🇫🇷 French</option>
          <option value="ar">🇸🇦 Arabic</option>
          <option value="am">🇪🇹 Amharic</option>
        </select>
      </div>
    </div>
  );

  /* ── Shared main content (used in mobile, duplicated cleanly for desktop) ── */
  const MainContent = () => (
    <>
      {/* quick actions */}
      <div className="grid grid-cols-3 gap-2.5 px-4 md:px-0">
        {QUICK_ACTIONS.map(({ label, icon: Icon, route }) => (
          <button key={label} onClick={go(route)}
            className="flex items-center justify-between rounded-2xl bg-white px-3.5 py-4 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[15px] font-medium text-neutral-800">{label}</span>
            <Icon className="h-5 w-5 text-neutral-400" />
          </button>
        ))}
      </div>

      {/* Boost / ads banner */}
      <button onClick={go('/seller/ads/upload')}
        className="mx-4 md:mx-0 mt-3 flex items-center justify-between rounded-2xl bg-white px-4 py-3.5 shadow-sm hover:shadow-md transition-shadow">
        <span className="flex items-center gap-2 text-[14px]">
          <Megaphone className="h-4 w-4 text-orange-500" />
          <span className="text-neutral-800">
            Try <span className="font-medium text-orange-500">Novaxmax Go Live</span> free
          </span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-neutral-400" />
      </button>

      {/* My sales */}
      <div className="mx-4 md:mx-0 mt-5 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-semibold text-neutral-900">My sales</h2>
          <button onClick={go('/seller/orders')} className="flex items-center gap-0.5 text-[13px] text-neutral-500 hover:text-orange-600 transition-colors">
            View all <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <button onClick={go('/seller/orders')} className="block w-full rounded-xl bg-[#f7f6f4] hover:bg-orange-50 transition-colors p-3.5 text-left">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-neutral-700" />
            <p className="text-[13.5px] leading-snug text-neutral-800">
              <span className="font-semibold">Ship on time</span> to keep your seller rating protected
            </p>
          </div>
          <p className="mt-1 pl-6 text-[12.5px] leading-snug text-emerald-600">
            Secure payouts · Buyer protection · Guaranteed delivery
          </p>
        </button>
      </div>

      {/* Finance & growth */}
      <div className="mt-5 bg-white px-4 pb-5 pt-5 md:rounded-2xl md:shadow-sm">
        <h2 className="text-[17px] font-semibold text-neutral-900 mb-4">Finance &amp; growth</h2>
        <div className="grid grid-cols-4 gap-2">
          {FINANCE_ACTIONS.map(({ label, icon, route }) => (
            <Tile key={label} icon={icon} label={label} route={route} go={go} />
          ))}
        </div>
      </div>

      {/* More features */}
      <div className="mt-2 md:mt-4 bg-white px-4 pb-5 pt-5 md:rounded-2xl md:shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-semibold text-neutral-900">More features</h2>
          <button onClick={go('/seller/dashboard')} className="flex items-center gap-0.5 text-[13px] text-neutral-400 hover:text-orange-600 transition-colors">
            All <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {MORE_FEATURES.map(({ label, icon, route }) => (
            <Tile key={label} icon={icon} label={label} route={route} go={go} />
          ))}
        </div>
      </div>

      {/* Promo cards */}
      <div className="mt-2 md:mt-4 grid grid-cols-2 gap-3 bg-white px-4 pb-5 pt-4 md:rounded-2xl md:shadow-sm">
        <button onClick={go('/seller/awards')}
          className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[#ffe4d6] to-[#ffd3bb] p-4 text-left min-h-[100px] hover:opacity-90 transition-opacity">
          <div>
            <p className="text-[14px] font-semibold text-[#8a3413]">Refer a seller</p>
            <p className="mt-1 flex items-center gap-0.5 text-[12.5px] text-[#8a3413]/80">
              Earn rewards <ChevronRight className="h-3.5 w-3.5" />
            </p>
          </div>
          <Users className="mt-3 h-8 w-8 self-end text-orange-500" strokeWidth={1.5} />
        </button>
        <button onClick={go('/seller/inventory')}
          className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[#fff3d6] to-[#ffe7ad] p-4 text-left min-h-[100px] hover:opacity-90 transition-opacity">
          <div>
            <p className="text-[14px] font-semibold text-[#7a5a10]">Buyer searches</p>
            <p className="mt-1 flex items-center gap-0.5 text-[12.5px] text-[#7a5a10]/80">
              Explore now <ChevronRight className="h-3.5 w-3.5" />
            </p>
          </div>
          <Package className="mt-3 h-8 w-8 self-end text-orange-500" strokeWidth={1.5} />
        </button>
      </div>

      {/* Utility rows */}
      <div className="mt-2 md:mt-4 bg-white px-4 pb-2 md:rounded-2xl md:shadow-sm">
        <button onClick={go('/seller/ads/upload')} className="flex w-full items-center justify-between border-b border-neutral-100 py-4 hover:text-orange-600 transition-colors group">
          <span className="flex items-center gap-3 text-[14.5px] text-neutral-800 group-hover:text-orange-600">
            <Sparkles className="h-5 w-5" /> FREE trial: Novaxmax Go Live
          </span>
          <ArrowRight className="h-4 w-4 text-neutral-400" />
        </button>
        <button onClick={go('/desc/help/support')} className="flex w-full items-center justify-between py-4 hover:text-orange-600 transition-colors group">
          <span className="flex items-center gap-3 text-[14.5px] text-neutral-800 group-hover:text-orange-600">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-800 group-hover:border-orange-600 text-[10px] font-bold">N</span>
            Visit Seller Support
          </span>
          <ChevronRight className="h-4 w-4 text-neutral-400" />
        </button>
      </div>

      <div className="mt-4">

      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f4f4f2] pt-24 pb-20 font-sans text-neutral-900">

      {/* ════════════════════════════════════════════════════════
          DESKTOP — two-column layout (identical pattern to MyAccountPage)
      ════════════════════════════════════════════════════════ */}
      <div className="hidden md:block max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-[280px_1fr] gap-6 items-start">

          {/* ── Left sidebar ─────────────────────────────────────── */}
          <aside className="sticky top-28 space-y-4">

            {/* Profile card */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-br from-orange-500 to-amber-500 px-5 pt-6 pb-8" />
              <div className="px-5 pb-5 -mt-6">
                <div className="relative mb-3">
                  {hasProfileImage ? (
                    <CldImage
                      src={getPublicId(user!.image)}
                      alt="Profile"
                      width={72} height={72} crop="fill" gravity="face"
                      className="h-[72px] w-[72px] rounded-full object-cover border-4 border-white shadow-md"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-orange-100 border-4 border-white shadow-md">
                      <User className="h-8 w-8 text-orange-500" />
                    </div>
                  )}
                  {user && (
                    <span className="absolute right-1 bottom-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                  )}
                </div>

                {user ? (
                  <>
                    <p className="text-base font-bold text-neutral-900 truncate">{user.name}</p>
                    <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Active seller</p>
                  </>
                ) : (
                  <button
                    onClick={() => onOpenSellerLogin?.()}
                    className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    Sign In as Seller
                  </button>
                )}

                {user && (
                  <button
                    onClick={handleLogout}
                    className="mt-3 flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Log out
                  </button>
                )}
              </div>
            </div>

            {/* Nav links */}
            <div className="bg-white rounded-2xl shadow-sm py-2 px-3">
              {SIDEBAR_NAV.map(({ label, icon: Icon, route }) => (
                <button
                  key={label}
                  onClick={go(route)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-neutral-700
                    hover:bg-orange-50 hover:text-orange-600 transition-colors group"
                >
                  <Icon className="h-4 w-4 text-neutral-400 group-hover:text-orange-500 transition-colors flex-shrink-0" />
                  {label}
                </button>
              ))}
            </div>

            {/* Status line */}
            <div className="bg-white rounded-2xl shadow-sm px-4 py-3.5 flex items-center gap-2 text-sm text-neutral-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <span className="font-medium text-emerald-700">{user ? 'Active seller' : 'Sign in to sell'}</span>
            </div>

            {/* Preferences */}
            <PreferencesPanel />
          </aside>

          {/* ── Right content panel ────────────────────────────────── */}
          <main className="space-y-4">

            {/* Page heading */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Seller Account<span className="text-orange-500">.</span>
              </h1>
              <div className="flex items-center gap-3 text-neutral-600">
                <button onClick={go('/desc/help/support')} className="hover:text-orange-600 transition-colors">
                  <Headphones className="h-5 w-5" />
                </button>
                <button onClick={go('/seller/dashboard')} className="hover:text-orange-600 transition-colors">
                  <ScanLine className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-3 gap-3">
              {QUICK_ACTIONS.map(({ label, icon: Icon, route }) => (
                <button key={label} onClick={go(route)}
                  className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 shadow-sm
                    hover:shadow-md border border-transparent hover:border-orange-200 transition-all">
                  <span className="text-[15px] font-medium text-neutral-800">{label}</span>
                  <Icon className="h-5 w-5 text-neutral-400" />
                </button>
              ))}
            </div>

            {/* Ads banner */}
            <button onClick={go('/seller/ads/upload')}
              className="flex w-full items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-sm hover:shadow-md transition-all">
              <span className="flex items-center gap-2 text-[14px]">
                <Megaphone className="h-4 w-4 text-orange-500" />
                <span className="text-neutral-800">
                  Try <span className="font-medium text-orange-500">Novaxmax Go Live</span> free and reach more buyers
                </span>
              </span>
              <ArrowRight className="h-4 w-4 text-neutral-400" />
            </button>

            {/* My sales */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[17px] font-semibold text-neutral-900">My sales</h2>
                <button onClick={go('/seller/orders')} className="flex items-center gap-0.5 text-[13px] text-neutral-500 hover:text-orange-600 transition-colors">
                  View all <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <button onClick={go('/seller/orders')} className="block w-full rounded-xl bg-[#f7f6f4] hover:bg-orange-50 transition-colors p-4 text-left">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-neutral-700" />
                  <p className="text-[13.5px] leading-snug text-neutral-800">
                    <span className="font-semibold">Ship on time</span> to keep your seller rating protected
                  </p>
                </div>
                <p className="mt-1 pl-6 text-[12.5px] leading-snug text-emerald-600">
                  Secure payouts · Buyer protection · Guaranteed delivery
                </p>
              </button>
            </div>

            {/* Finance & growth */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-[17px] font-semibold text-neutral-900 mb-4">Finance &amp; growth</h2>
              <div className="grid grid-cols-4 gap-4">
                {FINANCE_ACTIONS.map(({ label, icon, route }) => (
                  <Tile key={label} icon={icon} label={label} route={route} go={go} />
                ))}
              </div>
            </div>

            {/* More features */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[17px] font-semibold text-neutral-900">More features</h2>
                <button onClick={go('/seller/dashboard')} className="flex items-center gap-0.5 text-[13px] text-neutral-400 hover:text-orange-600 transition-colors">
                  All <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {MORE_FEATURES.map(({ label, icon, route }) => (
                  <Tile key={label} icon={icon} label={label} route={route} go={go} />
                ))}
              </div>
            </div>

            {/* Promo cards */}
            <div className="grid grid-cols-2 gap-4">
              <button onClick={go('/seller/awards')}
                className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[#ffe4d6] to-[#ffd3bb] p-5 text-left min-h-[120px] hover:opacity-90 transition-opacity">
                <div>
                  <p className="text-[15px] font-semibold text-[#8a3413]">Refer a seller</p>
                  <p className="mt-1 flex items-center gap-0.5 text-[13px] text-[#8a3413]/80">Earn rewards <ChevronRight className="h-3.5 w-3.5" /></p>
                </div>
                <Users className="mt-4 h-9 w-9 self-end text-orange-500" strokeWidth={1.5} />
              </button>
              <button onClick={go('/seller/inventory')}
                className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[#fff3d6] to-[#ffe7ad] p-5 text-left min-h-[120px] hover:opacity-90 transition-opacity">
                <div>
                  <p className="text-[15px] font-semibold text-[#7a5a10]">Buyer searches</p>
                  <p className="mt-1 flex items-center gap-0.5 text-[13px] text-[#7a5a10]/80">Explore now <ChevronRight className="h-3.5 w-3.5" /></p>
                </div>
                <Package className="mt-4 h-9 w-9 self-end text-orange-500" strokeWidth={1.5} />
              </button>
            </div>

            {/* Utility rows */}
            <div className="rounded-2xl bg-white px-5 py-2 shadow-sm">
              <button onClick={go('/seller/ads/upload')} className="flex w-full items-center justify-between border-b border-neutral-100 py-4 hover:text-orange-600 transition-colors group">
                <span className="flex items-center gap-3 text-[14.5px] text-neutral-800 group-hover:text-orange-600">
                  <Sparkles className="h-5 w-5" /> FREE trial: Novaxmax Go Live
                </span>
                <ArrowRight className="h-4 w-4 text-neutral-400" />
              </button>
              <button onClick={go('/desc/help/support')} className="flex w-full items-center justify-between py-4 hover:text-orange-600 transition-colors group">
                <span className="flex items-center gap-3 text-[14.5px] text-neutral-800 group-hover:text-orange-600">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-800 group-hover:border-orange-600 text-[10px] font-bold">N</span>
                  Visit Seller Support
                </span>
                <ChevronRight className="h-4 w-4 text-neutral-400" />
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          MOBILE — single column, unchanged feel
      ════════════════════════════════════════════════════════ */}
      <div className="md:hidden flex flex-col max-w-[420px] mx-auto">

        {/* Mobile header */}
        <div className="bg-[#f4f4f2] px-4 pb-4 pt-2">
          <div className="flex items-center justify-between">
            <button onClick={handleIdentityTap} className="flex items-center gap-3">
              <span className="relative">
                {hasProfileImage ? (
                  <CldImage
                    src={getPublicId(user!.image)}
                    alt="Profile"
                    width={44} height={44} crop="fill" gravity="face"
                    className="h-11 w-11 rounded-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-200">
                    <User className="h-6 w-6 text-neutral-400" />
                  </span>
                )}
                {user && (
                  <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-[#f4f4f2] bg-emerald-500" />
                )}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-[17px] font-semibold text-neutral-900">
                  {user
                    ? user.name?.split(' ')[0] + (user.name?.split(' ')[1] ? ` ${user.name.split(' ')[1]}` : '')
                    : 'Seller sign in'}
                </span>
                <ChevronDown className="h-4 w-4 text-neutral-500" />
              </span>
            </button>

            <div className="flex items-center gap-5 text-neutral-800">
              <button onClick={go('/desc/help/support')} aria-label="Support"><Headphones className="h-5 w-5" /></button>
              <button onClick={go('/seller/dashboard')} aria-label="Dashboard"><ScanLine className="h-5 w-5" /></button>
              <button onClick={() => setShowSettings(p => !p)} aria-label="Preferences"><Settings className="h-5 w-5" /></button>
            </div>
          </div>

          <div className="mt-1.5 flex items-center gap-1.5 pl-[3.5rem]">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[13px] text-emerald-700 font-medium">{user ? 'Active seller' : 'Sign in to sell'}</span>
          </div>
        </div>

        {/* Mobile inline account menu */}
        {showAccountMenu && user && (
          <div className="mx-4 mb-1 rounded-2xl bg-white p-4 shadow-sm">
            <div className="border-b border-neutral-100 pb-3">
              <p className="truncate text-[14px] font-semibold text-neutral-900">{user.name}</p>
              {user.email && <p className="truncate text-[12px] text-neutral-500">{user.email}</p>}
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Active seller</p>
            </div>
            <div className="mt-2 space-y-0.5">
              {[
                { label: 'Dashboard', route: '/seller/dashboard' },
                { label: 'My Orders', route: '/seller/orders'    },
                { label: 'Inventory', route: '/seller/inventory' },
                { label: 'Finance',   route: '/seller/finance'   },
              ].map(({ label, route }) => (
                <button key={route} onClick={go(route)}
                  className="flex w-full items-center justify-between rounded-xl px-2 py-2.5 text-[13.5px] text-neutral-700 hover:bg-neutral-50">
                  {label} <ChevronRight className="h-4 w-4 text-neutral-300" />
                </button>
              ))}
            </div>
            <button onClick={handleLogout}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">
              <LogOut className="h-3.5 w-3.5" /> Log out
            </button>
          </div>
        )}

        {/* Mobile preferences */}
        {showSettings && (
          <div className="mx-4 mb-1">
            <PreferencesPanel />
          </div>
        )}

        {/* Mobile main content */}
        <MainContent />
      </div>
    </div>
  );
}