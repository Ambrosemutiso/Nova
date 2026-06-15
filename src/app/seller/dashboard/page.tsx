"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ShoppingCart, DollarSign, Eye, BarChart3, Box,
  TrendingUp, TrendingDown, Plus, Megaphone,
  Package, Star, ChevronRight, Zap, Users,
  ArrowUpRight, Medal, Target
} from "lucide-react";
import {
  ResponsiveContainer, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Label,
  AreaChart, Area, XAxis, YAxis
} from "recharts";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

// ─── Icon map ─────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  ShoppingCart, DollarSign, Eye, BarChart3, Box
};

// ─── Token system ─────────────────────────────────────────────────────────────
const C = {
  bg:       "#070c18",
  card:     "#0f1520",
  border:   "#1a2236",
  orange:   "#f97316",
  emerald:  "#10b981",
  red:      "#ef4444",
  blue:     "#3b82f6",
  violet:   "#8b5cf6",
  muted:    "#4b5563",
  dim:      "#1e2d45",
};

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 0 }: {
  value: number; prefix?: string; suffix?: string; decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const controls = animate(0, value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate(v) {
        node.textContent = prefix + v.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + suffix;
      },
    });
    return controls.stop;
  }, [value]);
  return <span ref={ref}>{prefix}0{suffix}</span>;
}

// ─── Performance Score Ring (signature element) ───────────────────────────────
function PerformanceRing({ score, revenue, seller }: {
  score: number; revenue: number; seller: any;
}) {
  const size = 180;
  const radius = 76;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const tier = score >= 90 ? "Elite" : score >= 70 ? "Gold" : score >= 50 ? "Silver" : "Rising";
  const tierColor = score >= 90 ? "#f59e0b" : score >= 70 ? "#f97316" : score >= 50 ? "#8b5cf6" : C.emerald;

  return (
    <div className="relative flex flex-col items-center justify-center"
      style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        {/* Track */}
        <circle cx={size/2} cy={size/2} r={radius}
          fill="none" stroke={C.dim} strokeWidth={10} />
        {/* Progress */}
        <motion.circle
          cx={size/2} cy={size/2} r={radius}
          fill="none" stroke="url(#ring-grad)" strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={C.orange} />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
      </svg>
      {/* Centre text */}
      <div className="flex flex-col items-center z-10">
        <span className="font-mono text-3xl font-black text-white leading-none">
          <AnimatedNumber value={score} />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] mt-0.5" style={{ color: tierColor }}>{tier}</span>
      </div>
    </div>
  );
}

// ─── Stats card ───────────────────────────────────────────────────────────────
function StatsCard({ id, title, value, change, icon, trend, series }: any) {
  const isUp = trend === "up";
  const Icon = ICON_MAP[icon] || ShoppingCart;
  const gradId = `sg-${id}`;
  const strokeColor = isUp ? C.emerald : C.red;

  const months = ["J","F","M","A","M","J","J","A","S","O","N","D"];
  const chartData = months.map((m, i) => ({ m, v: series?.[i]?.v || 0 }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: id * 0.08 }}
      className="relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between"
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        height: 155,
      }}
    >
      {/* Subtle corner glow */}
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${C.orange}18 0%, transparent 70%)` }} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C.muted }}>{title}</p>
          <h3 className="font-mono text-2xl font-black text-white mt-1 leading-none">{value}</h3>
          <p className={`text-[11px] font-bold mt-1.5 flex items-center gap-1 ${isUp ? "text-emerald-400" : "text-red-400"}`}>
            {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {change}
          </p>
        </div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${C.orange}15`, border: `1px solid ${C.orange}30` }}>
          <Icon size={16} className="text-orange-400" />
        </div>
      </div>

      <div className="w-full h-10">
        <ResponsiveContainer>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={strokeColor} strokeWidth={1.5}
              fill={`url(#${gradId})`} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

// ─── Sales/Views chart ────────────────────────────────────────────────────────
function AreaMetricChart({ title, dataKey, color, data }: {
  title: string; dataKey: string; color: string; data: any[];
}) {
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const chartData = MONTHS.map((m, i) => ({ m, [dataKey]: Number(data[i]?.[dataKey]) || 0 }));
  const gradId = `area-${dataKey}`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl px-3 py-2 text-xs font-semibold"
        style={{ background: C.card, border: `1px solid ${C.border}`, color: "#e5e7eb" }}>
        <p className="text-gray-400 mb-0.5">{label}</p>
        <p style={{ color }}>{payload[0].value.toLocaleString()}</p>
      </div>
    );
  };

  return (
    <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: C.muted }}>{title}</p>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: `${color}15`, color }}>Yearly</span>
      </div>
      <div style={{ height: 200 }}>
        <ResponsiveContainer>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="m" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: C.border, strokeWidth: 1 }} />
            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2}
              fill={`url(#${gradId})`} dot={false} activeDot={{ r: 4, fill: color, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Order status donut ───────────────────────────────────────────────────────
function OrderStatusDonut({ data }: { data: { name: string; value: number }[] }) {
  const COLORS = [C.blue, C.orange, C.emerald, C.red, C.violet, "#14b8a6"];
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-4" style={{ color: C.muted }}>Order Breakdown</p>
      <div className="flex items-center gap-5">
        <div style={{ width: 130, height: 130, flexShrink: 0 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={42} outerRadius={58}
                paddingAngle={3} startAngle={90} endAngle={-270}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                <Label value={total} position="center" fontSize={18} fontWeight={800} fill="#f9fafb" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="flex-1 space-y-2 min-w-0">
          {data.map((d, i) => (
            <li key={i} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-[11px] text-gray-400 truncate">{d.name}</span>
              </div>
              <span className="font-mono text-xs font-bold text-gray-200 flex-shrink-0">{d.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Conversion CTA banner ────────────────────────────────────────────────────
function ConversionBanner({ type }: { type: "product" | "ad" }) {
  const isProduct = type === "product";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-2xl p-4 flex items-center gap-4 cursor-pointer group"
      style={{
        background: isProduct ? `${C.orange}0f` : `${C.violet}0f`,
        border: `1px solid ${isProduct ? C.orange : C.violet}30`,
      }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: isProduct ? `${C.orange}20` : `${C.violet}20` }}>
        {isProduct ? <Package size={17} className="text-orange-400" /> : <Megaphone size={17} className="text-violet-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-white leading-tight">
          {isProduct ? "List a new product" : "Run an ad campaign"}
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>
          {isProduct ? "More listings = more sales" : "Reach 50K+ active buyers"}
        </p>
      </div>
      <Link
        href={isProduct ? "/seller/products/add" : "/seller/ads"}
        className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 transition-all group-hover:scale-105"
        style={{
          background: isProduct ? C.orange : C.violet,
          color: "#fff",
          boxShadow: `0 4px 16px ${isProduct ? C.orange : C.violet}40`,
        }}
      >
        <Plus size={12} /> {isProduct ? "Add" : "Boost"}
      </Link>
    </motion.div>
  );
}

// ─── Followers ring ───────────────────────────────────────────────────────────
function FollowersCard({ value }: { value: number }) {
  const capped = Math.min(value, 100);
  const data = [{ v: capped }, { v: Math.max(0, 100 - capped) }];
  return (
    <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C.muted }}>Store Followers</p>
        <Users size={14} className="text-violet-400" />
      </div>
      <div className="flex items-center gap-4">
        <div style={{ width: 80, height: 80, flexShrink: 0 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="v" innerRadius={28} outerRadius={36} startAngle={90} endAngle={-270}>
                <Cell fill={C.violet} />
                <Cell fill={C.dim} />
                <Label value={value.toLocaleString()} position="center"
                  fontSize={13} fontWeight={800} fill="#f9fafb" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
          <p className="font-mono text-2xl font-black text-white">
            <AnimatedNumber value={value} />
          </p>
          <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
            <TrendingUp size={10} /> Growing
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Mini stat pair ───────────────────────────────────────────────────────────
function MiniStat({ label, value, color, percent }: any) {
  return (
    <div className="rounded-xl p-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.muted }}>{label}</p>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: `${color}15`, color }}>{percent}%</span>
      </div>
      <p className="font-mono text-lg font-black text-white">{Number(value).toLocaleString()}</p>
      {/* micro bar */}
      <div className="mt-2 h-1 rounded-full" style={{ background: C.dim }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percent, 100)}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [stats, setStats]           = useState<any[]>([]);
  const [salesData, setSalesData]   = useState<any[]>([]);
  const [orderStatus, setOrderStatus] = useState<any[]>([]);
  const [summary, setSummary]       = useState<any[]>([]);
  const [sellerPerf, setSellerPerf] = useState<any>(null);
  const [followers, setFollowers]   = useState(0);
  const [score, setScore]           = useState(0);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const storedUser = localStorage.getItem("sellerUser");
        if (!storedUser) return;
        const { _id: sellerId } = JSON.parse(storedUser);
        if (!sellerId) return;

        const res  = await fetch(`/api/seller/metrics/dashboard?sellerId=${sellerId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");

        setStats(data.stats || []);
        setSalesData(data.salesData || []);
        setOrderStatus(data.donutData || []);
        setSummary([...(data.summary || []), ...(data.activeProductsSummary || [])]);
        setSellerPerf(data.sellerPerformance || null);
        setFollowers(data.followersDonut?.[0]?.value || 0);

        // Derive a seller score from available data
        const rev = data.sellerPerformance?.revenue || 0;
        const perf = data.sellerPerformance?.progressPercent || 0;
        setScore(Math.min(100, Math.round(perf)));
      } catch (err) {
        console.error("Dashboard error:", err);
      }
    };
    fetchMetrics();
  }, []);

  const totalSales  = salesData.reduce((s, d) => s + (Number(d?.sales) || 0), 0);
  const totalViews  = salesData.reduce((s, d) => s + (Number(d?.views) || 0), 0);

  return (
    <div className="min-h-screen text-gray-100" style={{ background: C.bg }}>
      <main className="max-w-7xl mx-auto px-4 pt-28 pb-16 space-y-6">

        {/* ── Hero row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-5">

          {/* Performance + Revenue hero card */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl p-6 overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-6"
            style={{
              background: `linear-gradient(135deg, #0f1e35 0%, #0a1625 100%)`,
              border: `1px solid ${C.border}`,
            }}
          >
            {/* Radial glow */}
            <div className="absolute top-0 left-0 w-64 h-64 rounded-full pointer-events-none"
              style={{ background: `radial-gradient(circle, ${C.orange}14 0%, transparent 65%)`, filter: "blur(30px)" }} />

            {/* Score ring */}
            <PerformanceRing score={score} revenue={sellerPerf?.revenue || 0} seller={sellerPerf} />

            {/* Text */}
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-2 mb-1">
                {sellerPerf?.isTopSeller && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/25 rounded-full px-2 py-0.5">
                    <Medal size={10} /> Top Seller
                  </span>
                )}
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.muted }}>
                  Performance Score
                </span>
              </div>

              <h1 className="text-3xl font-black text-white leading-tight tracking-tight">
                {sellerPerf?.isTopSeller ? "You're #1 this month" : `${sellerPerf?.rank || "Rising"} Seller`}
                <span style={{ color: C.orange }}>.</span>
              </h1>

              {sellerPerf?.revenue != null && (
                <div className="mt-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: C.muted }}>Total Revenue</p>
                  <p className="font-mono text-4xl font-black text-white">
                    Ksh <AnimatedNumber value={sellerPerf.revenue} />
                  </p>
                </div>
              )}

              {!sellerPerf?.isTopSeller && sellerPerf?.progressPercent != null && (
                <div className="mt-4 max-w-xs">
                  <div className="flex justify-between text-[11px] mb-1.5" style={{ color: C.muted }}>
                    <span>{sellerPerf.progressPercent}% to {sellerPerf.nextTier}</span>
                    <span>Target: Ksh {sellerPerf.nextThreshold?.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.dim }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${sellerPerf.progressPercent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${C.orange}, #fbbf24)` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 mt-5">
                <Link href="/seller/products/add"
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full transition-all hover:scale-105"
                  style={{ background: C.orange, color: "#fff", boxShadow: `0 4px 20px ${C.orange}50` }}>
                  <Plus size={13} /> Add Product
                </Link>
                <Link href="/seller/ads"
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full transition-all hover:scale-105"
                  style={{ background: `${C.violet}20`, color: "#c4b5fd", border: `1px solid ${C.violet}40` }}>
                  <Megaphone size={13} /> Run Ad
                </Link>
                <Link href="/seller/awards"
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors">
                  Awards <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Right quick-actions column */}
          <div className="flex flex-col gap-3 lg:w-[220px]">
            <ConversionBanner type="product" />
            <ConversionBanner type="ad" />

            {/* Quick stat: Total views */}
            <div className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${C.blue}15`, border: `1px solid ${C.blue}30` }}>
                <Eye size={15} className="text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.muted }}>Total Views</p>
                <p className="font-mono text-lg font-black text-white">
                  <AnimatedNumber value={totalViews} />
                </p>
              </div>
            </div>

            {/* Quick stat: Total sales */}
            <div className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${C.emerald}15`, border: `1px solid ${C.emerald}30` }}>
                <TrendingUp size={15} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.muted }}>Yearly Sales</p>
                <p className="font-mono text-lg font-black text-white">
                  Ksh <AnimatedNumber value={totalSales} />
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats cards ─────────────────────────────────────────────────── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => <StatsCard key={s.id} {...s} id={i} />)}
        </section>

        {/* ── Charts + right panel ─────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

          {/* Charts */}
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <AreaMetricChart title="Revenue (Yearly)" dataKey="sales" color={C.orange} data={salesData} />
              <AreaMetricChart title="Product Views (Yearly)" dataKey="views" color={C.blue} data={salesData} />
            </div>

            {/* Insight prompt */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="rounded-2xl p-4 flex items-center gap-4"
              style={{ background: `${C.emerald}09`, border: `1px solid ${C.emerald}25` }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${C.emerald}18` }}>
                <Zap size={15} className="text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-white">Boost your reach</p>
                <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>
                  Sellers with 10+ products get 3× more views. You're{" "}
                  <span className="text-emerald-400 font-semibold">almost there.</span>
                </p>
              </div>
              <Link href="/seller/products/add"
                className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full flex-shrink-0"
                style={{ background: `${C.emerald}20`, color: "#34d399" }}>
                Add now <ArrowUpRight size={11} />
              </Link>
            </motion.div>
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            <OrderStatusDonut data={orderStatus} />

            {/* Mini stats grid */}
            {summary.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {summary.slice(0, 4).map((s: any) => (
                  <MiniStat key={s.label} {...s} />
                ))}
              </div>
            )}

            <FollowersCard value={followers} />
          </div>
        </section>

        {/* ── Bottom conversion strip ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{
            background: `linear-gradient(135deg, ${C.orange}10 0%, ${C.violet}10 100%)`,
            border: `1px solid ${C.border}`,
          }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-1">💡 Seller Tip</p>
            <p className="text-sm font-semibold text-white">
              Promoted listings get <span className="text-orange-400">5× more clicks</span> than organic listings.
            </p>
            <p className="text-[11px] mt-1" style={{ color: C.muted }}>
              Start an ad for as little as Ksh 200 and reach targeted buyers today.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/seller/ads"
              className="flex items-center gap-1.5 text-xs font-bold px-5 py-2.5 rounded-full transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${C.orange}, #fbbf24)`,
                color: "#fff",
                boxShadow: `0 4px 20px ${C.orange}45`,
              }}>
              <Megaphone size={13} /> Start Ad Campaign
            </Link>
            <Link href="/seller/inventory"
              className="text-xs font-semibold hover:text-white transition-colors flex items-center gap-1"
              style={{ color: C.muted }}>
              View Inventory <ChevronRight size={12} />
            </Link>
          </div>
        </motion.div>

      </main>
    </div>
  );
}