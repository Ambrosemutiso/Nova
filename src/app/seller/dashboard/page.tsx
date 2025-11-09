"use client";

import React, { useEffect, useState } from "react";
import { ShoppingCart, DollarSign, Eye, BarChart3, Gift, Box } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
} from "recharts";

// Icon mapping for Stats Cards
const iconMap: Record<string, any> = {
  ShoppingCart,
  DollarSign,
  Eye,
  BarChart3,
  Box, // For active products
};

// ---------- Stats Card Component ----------
function StatsCard({ id, title, value, change, icon, trend, series }: any) {
  const isUp = trend === "up";
  const strokeColor = isUp ? "#10b981" : "#ef4444";
  const gradientId = `grad-spark-${id}`;
  const Icon = iconMap[icon] || ShoppingCart;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
          <p className={`text-sm font-medium mt-1 ${isUp ? "text-green-600" : "text-red-600"}`}>
            {change}
          </p>
        </div>
        <div className="ml-4 shrink-0 bg-orange-50 p-3 rounded-xl">
          <Icon size={22} className="text-orange-500" />
        </div>
      </div>
      <div className="mt-4" style={{ width: "100%", height: 40 }}>
        <ResponsiveContainer>
          <AreaChart data={series}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.24} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <Tooltip
              formatter={(value: number) => value.toLocaleString()}
              labelFormatter={(label) => `Day ${label}`}
              contentStyle={{ fontSize: "12px" }}
            />
            <Area
              type="monotone"
              dataKey="v"
              stroke={strokeColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ---------- Sales & Views Chart ----------
function SalesViewsChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-gray-700 font-semibold mb-4">Sales & Views</h2>
      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#94a3b8" />
            <Tooltip formatter={(value: number) => value.toLocaleString()} />
            <Bar dataKey="sales" radius={[6, 6, 0, 0]} fill="#f97316" />
            <Bar dataKey="views" radius={[6, 6, 0, 0]} fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ---------- Order Status Donut ----------
function OrderStatusDonut({ data }: { data: any[] }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-gray-700 font-semibold mb-4">Order Status</h3>
      <div className="flex items-center gap-6">
        <div style={{ width: 160, height: 160 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={3}
                startAngle={90}
                endAngle={-270}
                animationDuration={900}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
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
          <ul className="mt-3 text-sm space-y-1">
            {data.map((d, i) => (
              <li key={i}>
                <span
                  className="inline-block w-3 h-3 mr-2 rounded-sm"
                  style={{
                    backgroundColor: i === 0 ? "#3b82f6" : i === 1 ? "#f97316" : "#10b981",
                  }}
                />
                {d.name}: {d.value}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ---------- Mini Donut ----------
function MiniDonut({ label, value, color, percent, usd }: any) {
  const chartData = [
    { name: "progress", value: percent },
    { name: "rest", value: Math.max(0, 100 - percent) },
  ];
  const gradId = `mini-donut-grad-${label}`;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col items-center">
      <div style={{ width: 90, height: 90 }}>
        <ResponsiveContainer>
          <PieChart>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.95} />
                <stop offset="100%" stopColor={color} stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <Pie
              data={chartData}
              dataKey="value"
              innerRadius={30}
              outerRadius={40}
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
              animationDuration={900}
              animationEasing="ease-out"
            >
              <Cell key="progress" fill={`url(#${gradId})`} />
              <Cell key="rest" fill="#e5e7eb" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-gray-500 mt-2">{label}</p>
      <p className="text-lg font-bold text-gray-900">{Number(value).toLocaleString()}</p>
      <p className="text-sm font-medium text-green-600">
        +{percent}% {usd} USD
      </p>
    </div>
  );
}

// ---------- Main Dashboard ----------
export default function DashboardPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [orderStatus, setOrderStatus] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [topSeller, setTopSeller] = useState<any>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/seller/metrics/dashboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sellerId: "YOUR_SELLER_ID_HERE" }),
        });
        const data = await res.json();

        const enhancedStats = data.stats.map((s: any) => ({
          ...s,
          value: s.value.toLocaleString(),
          series: s.series,
        }));

        // Add total active products summary card
        const activeProductsSummary = [
          {
            label: "Active Products (Month)",
            value: data.activeProducts?.month || 0,
            color: "#f59e0b",
            percent: Math.round(
              ((data.activeProducts?.month || 0) /
                (data.activeProducts?.monthlyTarget || 100)) *
                100
            ),
            usd: data.activeProducts?.month || 0,
          },
          {
            label: "Active Products (Year)",
            value: data.activeProducts?.year || 0,
            color: "#8b5cf6",
            percent: Math.round(
              ((data.activeProducts?.year || 0) /
                (data.activeProducts?.yearlyTarget || 1000)) *
                100
            ),
            usd: data.activeProducts?.year || 0,
          },
        ];

        setStats(enhancedStats || []);
        setSalesData(data.salesData || []);
        setOrderStatus(data.donutData || []);
        setSummary([...(data.summary || []), ...activeProductsSummary]);
        setTopSeller(data.topSeller || null);
      } catch (err) {
        console.error("Failed to fetch dashboard metrics", err);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <main className="flex-1 pt-28 p-8 space-y-8">
        {/* Congratulations Card */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl p-6 flex items-center justify-between text-white shadow-md">
          <div>
            <h2 className="text-lg font-semibold">
              Congratulations {topSeller?.name || "Seller"} 🎉
            </h2>
            <p className="text-white/90 text-sm">You are the top seller this month!</p>
            <h3 className="text-3xl font-bold mt-2">
              ${topSeller?.revenue?.toLocaleString() || "0"}
            </h3>
            <p className="text-white/80 text-xs">
              {topSeller?.percentageAchieved || 0}% of sales target achieved
            </p>
            <button className="mt-3 bg-white text-orange-600 font-medium px-3 py-1 rounded-full text-sm hover:bg-gray-100">
              View Details
            </button>
          </div>
          <Gift size={64} className="opacity-90" />
        </div>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => (
            <StatsCard key={s.id} {...s} />
          ))}
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SalesViewsChart data={salesData} />
          </div>
          <div className="space-y-6">
            <OrderStatusDonut data={orderStatus} />
            <div className="grid grid-cols-2 gap-4">
              {summary.map((s) => (
                <MiniDonut key={s.label} {...s} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
