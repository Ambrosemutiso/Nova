"use client";
import React, { useEffect, useState } from "react";
import { ShoppingCart, DollarSign, Eye, BarChart3, Gift, Box } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, PieChart, Pie, Cell, Label, AreaChart, Area } from "recharts";
import { motion } from "framer-motion";

const iconMap: Record<string, any> = { ShoppingCart, DollarSign, Eye, BarChart3, Box };

// ---------- Stats Card ----------
function StatsCard({ id, title, value, change, icon, trend, series }: any) {
  const isUp = trend === "up";
  const strokeColor = isUp ? "#10b981" : "#ef4444";
  const gradientId = `grad-spark-${id}`;
  const Icon = iconMap[icon] || ShoppingCart;

  // Map series to 12 months if not already
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const chartSeries = months.map((m, idx) => series[idx] ? { month: m, v: series[idx].v } : { month: m, v: 0 });

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
          <p className={`text-sm font-medium mt-1 ${isUp ? "text-green-600" : "text-red-600"}`}>{change}</p>
        </div>
        <div className="ml-4 shrink-0 bg-orange-50 p-3 rounded-xl">
          <Icon size={22} className="text-orange-500" />
        </div>
      </div>
      <div className="mt-4" style={{ width: "100%", height: 40 }}>
        <ResponsiveContainer>
          <AreaChart data={chartSeries}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.24} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <Tooltip formatter={(value: number) => value.toLocaleString()} labelFormatter={(label) => label} contentStyle={{ fontSize: "12px" }} />
            <Area type="monotone" dataKey="v" stroke={strokeColor} strokeWidth={2} fill={`url(#${gradientId})`} dot={false} activeDot={{ r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


// ---------- Sales & Views Chart ----------
function SalesViewsChart({ data }: { data: any[] }) {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Normalize data so each month exists and apply a minimum bar height for visibility
const chartData = months.map((m, idx) => {
  const monthData = data[idx] || { sales: 0, views: 0 };
  const safeSales = Number(monthData.sales) || 0;
  const safeViews = Number(monthData.views) || 0;

  // minimum 0.5 for visibility
  const adjustedViews = safeViews === 0 && safeSales > 0 ? safeSales * 0.05 : safeViews || 0;

  return { name: m, sales: safeSales, views: adjustedViews };
});


  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-gray-700 font-semibold mb-4">Sales & Views (Yearly)</h2>
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
            barCategoryGap="25%" // ✅ better spacing
          >
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              tick={{ fontSize: 12 }}
              interval={0} // ✅ shows all labels (Jan–Dec)
            />
<Tooltip
  contentStyle={{ borderRadius: "10px" }}
  formatter={(value: any) => Number(value)?.toLocaleString() || "0"}
/>

            <Bar
              dataKey="sales"
              fill="#f97316"
              name="Sales"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="views"
              fill="#3b82f6"
              name="Views"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-3 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-orange-500 rounded-sm"></span> Sales
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-blue-500 rounded-sm"></span> Views
        </div>
      </div>
    </div>
  );
}




// ---------- Order Status Donut ----------
function OrderStatusDonut({ data }: { data: { name: string; value: number }[] }) {
  const COLORS = ["#3b82f6", "#f97316", "#10b981", "#ef4444", "#8b5cf6", "#14b8a6"];

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
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
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
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
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
  const chartData = [{ name: "progress", value: percent }, { name: "rest", value: Math.max(0, 100 - percent) }];
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
            <Pie data={chartData} dataKey="value" innerRadius={30} outerRadius={40} startAngle={90} endAngle={-270}>
              {chartData.map((_, index) => <Cell key={index} fill={index === 0 ? `url(#${gradId})` : "#e5e7eb"} />)}
              <Label value={`${percent}%`} position="center" fontSize={14} fill="#374151" fontWeight={600} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-gray-500 mt-2">{label}</p>
      <p className="text-lg font-bold text-gray-900">{Number(value).toLocaleString()}</p>
      <p className="text-sm font-medium text-green-600">+{percent}% {usd}</p>
    </div>
  );
}

// ---------- Main Dashboard ----------
export default function DashboardPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [orderStatus, setOrderStatus] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [sellerPerformance, setSellerPerformance] = useState<any>(null);


  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const storedUser = localStorage.getItem("sellerUser");
        if (!storedUser) return;
        const seller = JSON.parse(storedUser);
        const sellerId = seller._id;
        if (!sellerId) return;

        const res = await fetch(`/api/seller/metrics/dashboard?sellerId=${sellerId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch metrics");

        setStats(data.stats || []);
        setSalesData(data.salesData || []);
        setOrderStatus(data.donutData || []);
        setSummary([...(data.summary || []), ...(data.activeProductsSummary || [])]);
        setSellerPerformance(data.sellerPerformance || null);
      } catch (err) {
        console.error("Dashboard metrics error:", err);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <main className="flex-1 pt-28 p-8 space-y-8">
{sellerPerformance && (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="relative rounded-2xl p-6 text-white shadow-lg overflow-hidden"
  >
    {/* Animated Aura */}
    <div className="absolute inset-0 -z-10 flex items-center justify-center">
      <div
        className={`absolute w-[160%] h-[160%] rounded-full blur-3xl opacity-40 animate-pulse-slow ${
          sellerPerformance.rank === "Gold"
            ? "bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500"
            : sellerPerformance.rank === "Silver"
            ? "bg-gradient-to-r from-gray-400 via-gray-300 to-gray-500"
            : sellerPerformance.rank === "Bronze"
            ? "bg-gradient-to-r from-amber-700 via-orange-600 to-orange-800"
            : "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500"
        }`}
      />
    </div>

    {/* Card Content */}
    <div className="relative z-10">
      {sellerPerformance.isTopSeller ? (
        <>
          <h2 className="text-2xl font-bold">🏆 Top Seller of the Month!</h2>
          <p className="text-white/90 mt-1">
            Congratulations — you’ve achieved the highest sales this month!
          </p>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold">
            🥇 {sellerPerformance.rank} Seller
          </h2>
          <p className="text-white/90 mt-1">
            You’ve earned <span className="font-semibold">{sellerPerformance.rank}</span> status!
          </p>
        </>
      )}

      {/* Revenue Display */}
      <h3 className="text-4xl font-extrabold mt-4">
        Ksh {sellerPerformance.revenue.toLocaleString()}
      </h3>

      {!sellerPerformance.isTopSeller && (
        <>
          {/* Progress Bar */}
          <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${sellerPerformance.progressPercent}%` }}
              transition={{ duration: 0.8 }}
              className="h-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-600"
            />
          </div>

          <div className="flex justify-between text-xs mt-2 text-white/80">
            <span>{sellerPerformance.progressPercent}% toward {sellerPerformance.nextTier}</span>
            <span>
              Target: Ksh {sellerPerformance.nextThreshold.toLocaleString()}
            </span>
          </div>
        </>
      )}

      {/* Button */}
      <button
        onClick={() => (window.location.href = "/seller/awards")}
        className="mt-5 bg-white text-orange-600 font-semibold px-4 py-2 rounded-full text-sm shadow hover:bg-gray-100 transition"
      >
        View Awards
      </button>
    </div>
  </motion.div>
)}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => <StatsCard key={s.id} {...s} />)}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SalesViewsChart data={salesData} />
          </div>

          <div className="space-y-6">
            <OrderStatusDonut data={orderStatus} />
            <div className="grid grid-cols-2 gap-4">
              {summary.map((s) => <MiniDonut key={s.label} {...s} />)}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
