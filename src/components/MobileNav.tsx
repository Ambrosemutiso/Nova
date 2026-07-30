"use client";

import { useEffect, useState } from "react";
import { Home, Heart, Plus, Megaphone, User, LayoutDashboard, Package, PlusSquare, BarChart3 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

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

  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
      }`}
    >
      <div
        className="flex items-center justify-between w-full px-2 pt-2 rounded-t-3xl border-t border-gray-200
          shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md bg-white/95"
        style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
      >
        {role === "buyer" ? (
          <>
            {/* Buyer Nav */}
            {navItem("/", Home, "Home")}
            {navItem("/wishlist", Heart, "Fav")}

            <Link href="/desc/sell-on-novaxmax" className="relative -mt-9 flex flex-1 flex-col items-center">
              <div className="bg-orange-600 text-white p-4 rounded-full shadow-lg shadow-orange-300/50 flex items-center justify-center hover:scale-105 active:scale-95 transition">
                <Plus size={30} strokeWidth={2.4} />
              </div>
            </Link>

            {navItem("/ads", Megaphone, "Discover")}
            {navItem("/account", User, "Me")}
          </>
        ) : (
          <>
            {/* Seller Nav */}
            {navItem("/seller/dashboard", LayoutDashboard, "Home")}
            {navItem("/seller/inventory", Package, "Inventory")}

            <Link href="/seller/products/add" className="relative -mt-9 flex flex-1 flex-col items-center">
              <div className="bg-orange-600 text-white p-4 rounded-full shadow-lg shadow-orange-300/50 flex items-center justify-center hover:scale-105 active:scale-95 transition">
                <PlusSquare size={30} strokeWidth={2.4} />
              </div>
            </Link>

            {navItem("/seller/ads/upload", BarChart3, "Ads")}
            {navItem("/seller/account", User, "Me")}
          </>
        )}
      </div>
    </div>
  );
}