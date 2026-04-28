"use client";

import { useEffect, useState } from "react";
import { Home, Heart, Plus, Megaphone, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (currentScrollY > lastScrollY && currentScrollY > 60) {
            setVisible(false); // scrolling down
          } else {
            setVisible(true); // scrolling up
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
        className={`flex flex-col items-center justify-center text-xs transition ${
          isActive ? "text-orange-600" : "text-gray-500"
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="text-[10px] mt-1">{label}</span>
      </Link>
    );
  };

  return (
    <div
      className={`md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
      }`}
    >
      <div className="flex items-center justify-between w-[92vw] max-w-md px-6 py-3 rounded-full border border-gray-200 shadow-xl backdrop-blur-md bg-white/80">

        {/* Home */}
        {navItem("/", Home, "Home")}

        {/* Favorites */}
        {navItem("/wishlist", Heart, "Fav")}

        {/* SELL BUTTON (CENTER) */}
        <Link
          href="/desc/sell-on-novaxmax"
          className="relative -mt-10"
        >
          <div className="bg-orange-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition">
            <Plus className="w-6 h-6" />
          </div>
        </Link>

        {/* Ads */}
        {navItem("/ads", Megaphone, "Ads")}

        {/* Account */}
        {navItem("/vouchers", User, "Me")}

      </div>
    </div>
  );
}