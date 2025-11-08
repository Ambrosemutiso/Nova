"use client";

import React from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Eye,
  Gift,
  DollarSign,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";


// ---------- Dummy data ----------
const stats = [
  { id: 1, title: "Total Orders", value: "248k", change: "+24%", icon: ShoppingCart, trend: "up" },
  { id: 2, title: "Total Sales", value: "$47.6k", change: "+14%", icon: DollarSign, trend: "up" },
  { id: 3, title: "Total Visits", value: "189k", change: "-35%", icon: Eye, trend: "down" },
  { id: 4, title: "Bounce Rate", value: "24.6%", change: "+18%", icon: BarChart3, trend: "up" },
];

const salesData = [
  { name: "Jan", sales: 20, views: 12 },
  { name: "Feb", sales: 8, views: 6 },
  { name: "Mar", sales: 60, views: 56 },
  { name: "Apr", sales: 12, views: 10 },
  { name: "May", sales: 28, views: 22 },
  { name: "Jun", sales: 22, views: 18 },
  { name: "Jul", sales: 30, views: 40 },
  { name: "Aug", sales: 6, views: 4 },
  { name: "Sep", sales: 20, views: 26 },
];

const donutData = [
  { name: "Sales", value: 68 },
  { name: "Product", value: 25 },
  { name: "Income", value: 14 },
];

// ---------- Stats Card ----------
function StatsCard({ title, value, change, icon: Icon, trend }: any) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border border-gray-100 flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        <p className={`text-sm font-medium mt-1 ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
          {change}
        </p>
      </div>
      <div className="bg-orange-50 p-3 rounded-xl">
        <Icon size={22} className="text-orange-500" />
      </div>
    </div>
  );
}

// ---------- Charts ----------
function SalesViewsChart() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-gray-700 font-semibold mb-4">Sales & Views</h2>
      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer>
          <BarChart data={salesData}>
            <XAxis dataKey="name" stroke="#94a3b8" />
            <Tooltip cursor={{ fill: "#f3f4f6" }} />
            <Bar dataKey="sales" radius={[6, 6, 0, 0]} fill="#f97316" />
            <Bar dataKey="views" radius={[6, 6, 0, 0]} fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function OrderStatusDonut() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-gray-700 font-semibold mb-4">Order Status</h3>
      <div className="flex items-center gap-6">
        <div style={{ width: 160, height: 160 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={donutData} dataKey="value" innerRadius={50} outerRadius={70} paddingAngle={3}>
                {donutData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? "#3b82f6" : index === 1 ? "#f97316" : "#10b981"}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="text-gray-700">
          <p className="text-2xl font-bold text-gray-900">68%</p>
          <p className="text-sm text-gray-500">Total Sales</p>
          <ul className="mt-3 text-sm space-y-1">
            <li>
              <span className="inline-block w-3 h-3 bg-blue-500 mr-2 rounded-sm" /> Sales
            </li>
            <li>
              <span className="inline-block w-3 h-3 bg-orange-500 mr-2 rounded-sm" /> Product
            </li>
            <li>
              <span className="inline-block w-3 h-3 bg-green-500 mr-2 rounded-sm" /> Income
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}


export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between bg-white shadow-sm px-8 py-4 border-b border-gray-100 sticky top-0 z-20">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500">Affiliate Performance Insights</p>
        </div>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl shadow-sm transition">
          Settings
        </button>
      </header>

      {/* Main Content with Tailwind top padding */}
      <main className="flex-1 pt-28 p-8 space-y-8">
        {/* 🎉 Congratulations Card */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl p-6 flex items-center justify-between text-white shadow-md">
          <div>
            <h2 className="text-lg font-semibold">Congratulations Jhon 🎉</h2>
            <p className="text-white/90 text-sm">You are the top seller this month!</p>
            <h3 className="text-3xl font-bold mt-2">$168.5K</h3>
            <p className="text-white/80 text-xs">58% of sales target achieved</p>
            <button className="mt-3 bg-white text-orange-600 font-medium px-3 py-1 rounded-full text-sm hover:bg-gray-100">
              View Details
            </button>
          </div>
          <Gift size={64} className="opacity-90" />
        </div>

        {/* 📊 Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => (
            <StatsCard key={s.id} {...s} />
          ))}
        </section>

        {/* 📈 Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SalesViewsChart />
          </div>
          <div className="space-y-6">
            <OrderStatusDonut />
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-gray-700 font-semibold mb-3">Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">Monthly</p>
                  <p className="text-xl font-bold text-gray-900">65,127</p>
                  <p className="text-sm text-green-600 font-medium">+16.5% 55.21 USD</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">Yearly</p>
                  <p className="text-xl font-bold text-gray-900">984,246</p>
                  <p className="text-sm text-blue-600 font-medium">+24.9% 267.35 USD</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Bottom Action Bar */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-white shadow-md border border-gray-200 rounded-full flex items-center justify-around w-[90%] max-w-md px-6 py-3">
        <button className="text-orange-500 hover:text-orange-600">
          <LayoutDashboard size={22} />
        </button>
        <button className="text-gray-500 hover:text-orange-500">
          <ShoppingCart size={22} />
        </button>
        <button className="text-gray-500 hover:text-orange-500">
          <BarChart3 size={22} />
        </button>
        <button className="text-gray-500 hover:text-orange-500">
          <Users size={22} />
        </button>
        <button className="text-gray-500 hover:text-orange-500">
          <Settings size={22} />
        </button>
      </div>
    </div>
  );
}