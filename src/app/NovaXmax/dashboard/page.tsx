"use client";

import { useState } from "react";
import Users from "@/app/NovaXmax/dashboard/components/users/page";
import Products from "@/app/NovaXmax/dashboard/components/products/page";
import Sellers from "@/app/NovaXmax/dashboard/components/sellers/page";
import Orders from "@/app/NovaXmax/dashboard/components/orders/page";
import Transactions from "@/app/NovaXmax/dashboard/components/transactions/page";
import Reports from "@/app/NovaXmax/dashboard/components/reports/page";
import Coupons from "@/app/NovaXmax/dashboard/components/orders/page";
import Mailing from "@/app/NovaXmax/dashboard/components/mailing/page";
import Settings from "@/app/NovaXmax/dashboard/components/orders/page";
import Analytics from "@/app/NovaXmax/dashboard/components/orders/page";
import Withdrawals from "@/app/NovaXmax/dashboard/components/Withdrawals/page";
import Notifications from "@/app/NovaXmax/dashboard/components/notifications/page";

const navItems = [
  { name: "Dashboard", key: "dashboard" },
  { name: "Users", key: "users" },
  { name: "Sellers", key: "sellers" },
  { name: "Products", key: "products" },
  { name: "Orders", key: "orders" },
  { name: "Notifications", key: "notifications" },
  { name: "Transactions", key: "transactions" },
  { name: "Withdrawals", key: "withdrawals" },
  { name: "Reports", key: "reports" },
  { name: "Coupons", key: "coupons" },
  { name: "Mailing", key: "mailing" },
  { name: "Analytics", key: "analytics" },
  { name: "Settings", key: "settings" },
];

// map component keys to actual components
const components: Record<string, React.ReactNode> = {
  dashboard: <h1 className="text-xl font-bold">Welcome Admin Dashboard</h1>,
  users: <Users />,
  sellers: <Sellers />,
  products: <Products />,
  orders: <Orders />,
  transactions: <Transactions/>,
  notifications: <Notifications/>,
  withdrawals: <Withdrawals/>,
  reports: <Reports/>,
  coupons: <Coupons/>,
  mailing: <Mailing/>,
  analytics: <Analytics/>,
  settings: <Settings/>,
};

export default function DashboardPage() {
  const [active, setActive] = useState("dashboard");

  return (
    <div className="flex min-h-screen bg-gray-50 pt-11">
      <aside className="w-64 bg-black text-white min-h-screen flex flex-col fixed left-0 top-11 bottom-0">
        <div className="p-6 text-2xl font-bold text-orange-500">Admin</div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              className={`block w-full text-left px-4 py-2 rounded-lg ${
                active === item.key
                  ? "bg-orange-500 text-white"
                  : "hover:bg-orange-100 hover:text-black"
              }`}
            >
              {item.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* Page Content */}
      <main className="flex-1 ml-64 p-6 overflow-y-auto">
        {components[active]}
      </main>
    </div>
  );
}
