"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart, DollarSign, Eye, BarChart3, Box,
  TrendingUp, TrendingDown, Award, ChevronRight, Users,
  ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer, CartesianGrid, Tooltip, TooltipProps,
  PieChart, Pie, Cell, Label,
  AreaChart, Area, XAxis, YAxis,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

/* ══════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════ */
interface StatItem {
  id: string;
  title: string;
  value: string;
  change: string;
  icon: string;
  trend: "up" | "down";
  series: { v: number }[];
}

interface SalesDataItem { sales: number; views: number; }
interface OrderStatusItem { name: string; value: number; }
interface SummaryItem { label: string; value: number; color: string; percent: number; usd?: string; }
interface FollowerItem { value: number; }

interface SellerPerformance {
  isTopSeller: boolean;
  rank: string;
  revenue: number;
  progressPercent: number;
  nextTier: string;
  nextThreshold: number;
}

/* ══════════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════════ */
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DONUT_COLORS = ["#f97316","#3b82f6","#10b981","#ef4444","#8b5cf6","#14b8a6"];

const iconMap: Record<string, React.ElementType> = {
  ShoppingCart, DollarSign, Eye, BarChart3, Box,
};

/* ══════════════════════════════════════════════════════════════
   CUSTOM TOOLTIP
══════════════════════════════════════════════════════════════ */
function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-xl shadow-xl">
      <p className="font-semibold mb-1 text-gray-300">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-bold">
          {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STATS CARD
══════════════════════════════════════════════════════════════ */
function StatsCard({ id, title, value, change, icon, trend, series }: StatItem) {
  const isUp = trend === "up";
  const strokeColor = isUp ? "#10b981" : "#ef4444";
  const gradientId = `grad-${id}`;
  const Icon = iconMap[icon] ?? ShoppingCart;
  const TrendIcon = isUp ? TrendingUp : TrendingDown;

  const chartData = MONTHS.map((m, i) => ({ month: m, v: series[i]?.v ?? 0 }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="relative bg-white rounded-2xl border border-gray-100 shadow-sm
        hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 p-5 flex flex-col justify-between"
      style={{ minHeight: 160 }}
    >
      {/* top */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 tracking-wide uppercase">{title}</p>
          <h3 className="text-2xl font-black text-gray-900 mt-1 leading-none">{value}</h3>
          <p className={`text-xs mt-1.5 font-semibold flex items-center gap-1
            ${isUp ? "text-emerald-600" : "text-red-500"}`}>
            <TrendIcon className="w-3 h-3" />
            {change}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
          <Icon size={18} className="text-orange-500" />
        </div>
      </div>

      {/* sparkline */}
      <div className="w-full h-12 mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={strokeColor} strokeWidth={2}
              fill={`url(#${gradientId})`} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TABBED CHART (Sales + Views merged)
══════════════════════════════════════════════════════════════ */
function TabbedChart({ data }: { data: SalesDataItem[] }) {
  const [tab, setTab] = useState<"sales" | "views">("sales");

  const chartData = MONTHS.map((m, i) => ({
    name: m,
    sales: Number(data[i]?.sales) || 0,
    views: Number(data[i]?.views) || 0,
  }));

  const isSales = tab === "sales";
  const color   = isSales ? "#f97316" : "#3b82f6";
  const gradId  = `tab-grad-${tab}`;

  const peak    = Math.max(...chartData.map(d => isSales ? d.sales : d.views));
  const total   = chartData.reduce((s, d) => s + (isSales ? d.sales : d.views), 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-sm font-bold text-gray-800">Performance Overview</h2>
          <p className="text-xs text-gray-400 mt-0.5">Yearly breakdown</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          {(["sales", "views"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200
                ${tab === t ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >
              {t === "sales" ? "💰 Sales" : "👁 Views"}
            </button>
          ))}
        </div>
      </div>

      {/* stat pills */}
      <div className="flex gap-3 mb-4">
        {[
          { label: "Total", value: total.toLocaleString() },
          { label: "Peak",  value: peak.toLocaleString()  },
        ].map((pill) => (
          <div key={pill.label} className="bg-gray-50 rounded-xl px-3 py-2">
            <p className="text-[10px] text-gray-400">{pill.label}</p>
            <p className="text-sm font-black text-gray-900">{pill.value}</p>
          </div>
        ))}
      </div>

      {/* chart */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          style={{ width: "100%", height: 220 }}
        >
          <ResponsiveContainer>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey={tab}
                stroke={color}
                strokeWidth={2.5}
                fill={`url(#${gradId})`}
                dot={false}
                activeDot={{ r: 5, fill: color, stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ORDER STATUS DONUT
══════════════════════════════════════════════════════════════ */
function OrderStatusDonut({ data }: { data: OrderStatusItem[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-bold text-gray-800 mb-4">Order Status</h3>
      <div className="flex items-center gap-5">
        <div style={{ width: 130, height: 130, flexShrink: 0 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={40} outerRadius={58}
                paddingAngle={3} startAngle={90} endAngle={-270}>
                {data.map((_, i) => (
                  <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                ))}
                <Label value={total.toLocaleString()} position="center"
                  fontSize={15} fontWeight={700} fill="#111827" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="space-y-2 flex-1 min-w-0">
          {data.map((d, i) => (
            <li key={i} className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                <span className="text-gray-600 truncate">{d.name}</span>
              </div>
              <span className="font-bold text-gray-900 shrink-0">{d.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SUMMARY ROWS  (replaces 4 MiniDonuts + FollowersDonut)
══════════════════════════════════════════════════════════════ */
function GrowthCard({
  summary, followersValue,
}: {
  summary: SummaryItem[];
  followersValue: number;
}) {
  const allItems = [
    ...summary,
    { label: "Followers", value: followersValue, color: "#8b5cf6", percent: Math.min(100, followersValue) },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Users className="w-4 h-4 text-orange-500" /> Growth Metrics
      </h3>
      <div className="space-y-4">
        {allItems.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500 font-medium">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-gray-900">
                  {Number(item.value).toLocaleString()}
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />{item.percent}%
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, item.percent)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PERFORMANCE BANNER
══════════════════════════════════════════════════════════════ */
function PerformanceBanner({ data }: { data: SellerPerformance }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl overflow-hidden text-white shadow-lg"
      style={{ background: "linear-gradient(135deg, #c2410c 0%, #ea580c 50%, #f97316 100%)" }}
    >
      {/* decorative blobs */}
      <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-black/10 blur-2xl pointer-events-none" />

      <div className="relative px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* left */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-5 h-5 text-yellow-300" />
              <span className="text-xs font-bold text-orange-100 uppercase tracking-wider">
                {data.isTopSeller ? "Top Seller of the Month" : `${data.rank} Seller`}
              </span>
            </div>
            <h2 className="text-3xl font-black tracking-tight">
              Ksh {data.revenue.toLocaleString()}
            </h2>
            <p className="text-orange-100 text-sm mt-1">
              {data.isTopSeller
                ? "Congratulations — highest sales this month! 🎉"
                : `Keep going! You're ${data.progressPercent}% toward ${data.nextTier}`}
            </p>

            {!data.isTopSeller && (
              <div className="mt-3 max-w-xs">
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${data.progressPercent}%` }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-orange-100 mt-1">
                  <span>{data.progressPercent}% complete</span>
                  <span>Target: Ksh {data.nextThreshold.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* right CTA */}
          <button
            onClick={() => (window.location.href = "/seller/awards")}
            className="flex items-center gap-2 bg-white text-orange-600 font-bold text-sm
              px-5 py-2.5 rounded-xl hover:bg-orange-50 active:scale-95 transition
              shadow-md whitespace-nowrap self-start sm:self-auto"
          >
            View Awards <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE HEADER
══════════════════════════════════════════════════════════════ */
function PageHeader() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-black text-gray-900">{greeting} 👋</h1>
        <p className="text-sm text-gray-500 mt-0.5">Here's what's happening with your store today.</p>
      </div>
      <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm text-xs text-gray-500">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        Live data
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [stats,             setStats]             = useState<StatItem[]>([]);
  const [salesData,         setSalesData]         = useState<SalesDataItem[]>([]);
  const [orderStatus,       setOrderStatus]       = useState<OrderStatusItem[]>([]);
  const [summary,           setSummary]           = useState<SummaryItem[]>([]);
  const [sellerPerformance, setSellerPerformance] = useState<SellerPerformance | null>(null);
  const [followersDonut,    setFollowersDonut]    = useState<FollowerItem[]>([]);
  const [loading,           setLoading]           = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const storedUser = localStorage.getItem("sellerUser");
        if (!storedUser) return;
        const { _id: sellerId } = JSON.parse(storedUser);
        if (!sellerId) return;

        const res  = await fetch(`/api/seller/metrics/dashboard?sellerId=${sellerId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setStats(data.stats || []);
        setSalesData(data.salesData || []);
        setOrderStatus(data.donutData || []);
        setSummary([...(data.summary || []), ...(data.activeProductsSummary || [])]);
        setSellerPerformance(data.sellerPerformance || null);
        setFollowersDonut(data.followersDonut || []);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  /* ── skeleton ── */
  if (loading) return (
    <div className="min-h-screen bg-gray-50 pt-28 p-6 space-y-6">
      <div className="h-8 w-64 bg-gray-200 rounded-xl animate-pulse" />
      <div className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-40 bg-gray-200 rounded-2xl animate-pulse" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-80 bg-gray-200 rounded-2xl animate-pulse" />
        <div className="space-y-4">
          <div className="h-52 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="h-52 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <main className="max-w-7xl mx-auto pt-28 px-4 md:px-6 pb-12 space-y-6">

        {/* ── page header ── */}
        <PageHeader />

        {/* ── performance banner ── */}
        {sellerPerformance && <PerformanceBanner data={sellerPerformance} />}

        {/* ── stats row ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => <StatsCard key={s.id} {...s} />)}
        </section>

        {/* ── main charts + side panels ── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* chart — takes 2 cols */}
          <div className="lg:col-span-2">
            <TabbedChart data={salesData} />
          </div>

          {/* right side */}
          <div className="space-y-4">
            <OrderStatusDonut data={orderStatus} />
            <GrowthCard
              summary={summary}
              followersValue={followersDonut[0]?.value ?? 0}
            />
          </div>
        </section>

      </main>
    </div>
  );
}