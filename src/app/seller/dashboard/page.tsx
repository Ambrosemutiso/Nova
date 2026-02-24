"use client";
import { useEffect, useState } from "react";
import { ShoppingCart, DollarSign, Eye, BarChart3, Gift, Box } from "lucide-react";
import { ResponsiveContainer,CartesianGrid, Tooltip, PieChart, Pie, Cell, Label, AreaChart, Area } from "recharts";
import { motion } from "framer-motion";

const iconMap: Record<string, any> = { ShoppingCart, DollarSign, Eye, BarChart3, Box };

// ---------- Professional Stats Card ----------
function StatsCard({ id, title, value, change, icon, trend, series }: any) {
  const isUp = trend === "up";
  const strokeColor = isUp ? "#10b981" : "#ef4444";
  const gradientId = `grad-spark-${id}`;
  const Icon = iconMap[icon] || ShoppingCart;

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const chartSeries = months.map((m, idx) =>
    series[idx]
      ? { month: m, v: series[idx].v }
      : { month: m, v: 0 }
  );

  return (
    <div
      className="
        relative
        bg-white dark:bg-gray-900
        rounded-2xl
        border border-gray-100 dark:border-gray-800
        shadow-sm
        hover:shadow-lg
        transition-all duration-300
        p-5
        flex flex-col
        justify-between
        h-[150px]
      "
    >
      {/* TOP SECTION */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium tracking-wide">
            {title}
          </p>

          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </h3>

          <p
            className={`text-xs mt-1 font-semibold flex items-center gap-1
            ${isUp ? "text-emerald-600" : "text-red-500"}`}
          >
            {change}
          </p>
        </div>

        {/* ICON */}
        <div
          className="
            h-10 w-10
            flex items-center justify-center
            rounded-xl
            bg-orange-50
            dark:bg-orange-900/20
          "
        >
          <Icon size={20} className="text-orange-500" />
        </div>
      </div>

      {/* MINI CHART */}
      <div className="w-full h-10 mt-3">
        <ResponsiveContainer>
          <AreaChart data={chartSeries}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25}/>
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0}/>
              </linearGradient>
            </defs>

            <Area
              type="monotone"
              dataKey="v"
              stroke={strokeColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ---------- Sales & Views Chart ----------
function SalesChart({ data }: { data: any[] }) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const chartData = months.map((m, i) => ({
    name: m,
    sales: Number(data[i]?.sales) || 0,
  }));

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="font-semibold text-gray-700 mb-4">Sales (Yearly)</h2>

      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#f97316"
              fill="#f97316"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


function ViewsChart({ data }: { data: any[] }) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const chartData = months.map((m, i) => ({
    name: m,
    views: Number(data[i]?.views) || 0,
  }));

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="font-semibold text-gray-700 mb-4">Product Views (Yearly)</h2>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Area
              type="monotone"
              dataKey="views"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
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

function FollowersDonut({ value }: { value: number }) {
  const data = [
    { name: "Followers", value },
    { name: "Spacer", value: Math.max(1, 100 - value) }, // 👈 prevents empty pie
  ];

  const COLORS = ["#8b5cf6", "#e5e7eb"];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-700 mb-4">Followers</h3>

      <div style={{ width: 160, height: 160 }} className="mx-auto">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={55}
              outerRadius={70}
              startAngle={90}
              endAngle={-270}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}

              <Label
                value={value.toLocaleString()}
                position="center"
                fontSize={20}
                fontWeight={700}
                fill="#374151"
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
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
  const [followersDonut, setFollowersDonut] = useState<any[]>([]);


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
        setFollowersDonut(data.followersDonut || []);
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
    className="relative rounded-2xl p-6 text-white shadow-lg overflow-hidden bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700"
  >
    {/* 🔥 Animated Aura */}
    <div className="absolute inset-0 -z-10 flex items-center justify-center">
      <div className="absolute w-[160%] h-[160%] rounded-full blur-3xl opacity-40 animate-pulse-slow bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600" />
    </div>

    {/* 🏆 Card Content */}
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
          <h2 className="text-2xl font-bold">🥇 {sellerPerformance.rank} Seller</h2>
          <p className="text-white/90 mt-1">
            You’ve earned <span className="font-semibold">{sellerPerformance.rank}</span> status!
          </p>
        </>
      )}

      {/* 💰 Revenue */}
      <h3 className="text-4xl font-extrabold mt-4">
        Ksh {sellerPerformance.revenue.toLocaleString()}
      </h3>

      {!sellerPerformance.isTopSeller && (
        <>
          {/* 📈 Progress Bar */}
          <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${sellerPerformance.progressPercent}%` }}
              transition={{ duration: 0.8 }}
              className="h-3 rounded-full bg-white"
            />
          </div>

          <div className="flex justify-between text-xs mt-2 text-white/80">
            <span>
              {sellerPerformance.progressPercent}% toward {sellerPerformance.nextTier}
            </span>
            <span>
              Target: Ksh {sellerPerformance.nextThreshold.toLocaleString()}
            </span>
          </div>
        </>
      )}

      {/* 🧡 Button */}
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
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <SalesChart data={salesData} />
  <ViewsChart data={salesData} />
</section>

          </div>

          <div className="space-y-6">
            <OrderStatusDonut data={orderStatus} />
            <div className="grid grid-cols-2 gap-4">
              {summary.map((s) => <MiniDonut key={s.label} {...s} />)}
            </div>
            <FollowersDonut value={followersDonut[0]?.value || 0} />
          </div>
        </section>
      </main>
    </div>
  );
}
