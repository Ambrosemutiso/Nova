"use client";

import { useEffect, useState } from "react";
import { Home, Heart, Plus, Megaphone, User, LayoutDashboard, Package, PlusSquare, BarChart3 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

// Radius of the carved-out notch, and how far the FAB hangs above the
// bar's top edge — kept in sync so the button visually nests inside
// the depression rather than floating above a random gap.
const NOTCH_RADIUS = 36; // px
const FAB_LIFT = 30;     // px the button sits above the bar's top edge

export default function MobileBottomNav() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const role = user?.role || "buyer";

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (currentScrollY > lastScrollY && currentScrollY > 60) {
            setVisible(false);
          } else {
            setVisible(true);
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const navItem = (href: string, icon: any, label: string) => {
    const isActive = pathname === href;
    const Icon = icon;

    return (
      <Link
        href={href}
        className={`flex flex-1 flex-col items-center justify-center gap-1 py-1 text-xs transition ${
          isActive ? "text-orange-600" : "text-gray-500"
        }`}
      >
        <Icon size={26} strokeWidth={isActive ? 2.4 : 2} />
        <span className="text-[10.5px] font-medium">{label}</span>
      </Link>
    );
  };

  const fabHref = role === "buyer" ? "/desc/sell-on-novaxmax" : "/seller/products/add";
  const FabIcon = role === "buyer" ? Plus : PlusSquare;

  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
      }`}
    >
      <div className="relative">

        {/* soft shadow pooled at the base of the notch — sells the sense
            of depth before the button even sits in it */}
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full bg-black/15 blur-md"
          style={{ top: `${-FAB_LIFT + 14}px`, width: `${NOTCH_RADIUS * 1.6}px`, height: `${NOTCH_RADIUS * 0.9}px` }}
        />

        {/* the bar — masked with a circular cutout at top-center so its
            own silhouette curves around the FAB instead of sitting flat
            under it */}
        <div
          className="relative flex items-center justify-between w-full px-2 pt-3 rounded-t-3xl border-t border-gray-200
            shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md bg-white/95"
          style={{
            paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))",
            WebkitMaskImage: `radial-gradient(circle ${NOTCH_RADIUS}px at 50% 0px, transparent 0 ${NOTCH_RADIUS}px, black ${NOTCH_RADIUS + 1}px)`,
            maskImage: `radial-gradient(circle ${NOTCH_RADIUS}px at 50% 0px, transparent 0 ${NOTCH_RADIUS}px, black ${NOTCH_RADIUS + 1}px)`,
          }}
        >
          {role === "buyer" ? (
            <>
              {navItem("/", Home, "Home")}
              {navItem("/wishlist", Heart, "Fav")}
              <div className="flex-1" aria-hidden />
              {navItem("/ads", Megaphone, "Discover")}
              {navItem("/account", User, "Me")}
            </>
          ) : (
            <>
              {navItem("/seller/dashboard", LayoutDashboard, "Home")}
              {navItem("/seller/inventory", Package, "Inventory")}
              <div className="flex-1" aria-hidden />
              {navItem("/seller/ads/upload", BarChart3, "Ads")}
              {navItem("/seller/account", User, "Me")}
            </>
          )}
        </div>

        {/* FAB — hangs in the notch, half above the bar's top edge */}
        <Link
          href={fabHref}
          aria-label={role === "buyer" ? "Sell on NovaXmax" : "Add product"}
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
          style={{ top: `-${FAB_LIFT}px` }}
        >
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-3.5 rounded-full
            ring-4 ring-white shadow-lg shadow-orange-400/40 flex items-center justify-center
            hover:scale-105 active:scale-95 transition">
            <FabIcon size={28} strokeWidth={2.6} />
          </div>
        </Link>
      </div>
    </div>
  );
}