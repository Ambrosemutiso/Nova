'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { CreditCard, Pencil, PackageSearch, TrendingUp, Clock, Percent } from "lucide-react";

type InstallmentProduct = {
  _id: string;
  name: string;
  calculatedPrice: number;
  installmentEnabled: boolean;
  installmentDepositPercent: number;
  installmentMonths: number;
  installmentPolicy?: string;
};

/* ── stat card ── */
function StatCard({ icon, label, value, sub }: {
  icon: React.ReactNode; label: string; value: string; sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-black text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function InstallmentsPage() {
  const [products, setProducts] = useState<InstallmentProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sellerData = localStorage.getItem("sellerUser");
    if (!sellerData) return;
    const { _id: sellerId } = JSON.parse(sellerData);

    const fetchInstallments = async () => {
      try {
        const res = await fetch(`/api/seller/installments?sellerId=${sellerId}`);
        const json = await res.json();
        if (json.success) setProducts(json.data);
      } catch {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchInstallments();
  }, []);

  /* ── skeleton ── */
  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 pt-28 pb-10 space-y-4">
        <div className="h-8 w-64 bg-gray-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
      </div>
    </div>
  );

  const enabledCount  = products.filter(p => p.installmentEnabled).length;
  const avgDeposit    = products.length
    ? Math.round(products.reduce((s, p) => s + (p.installmentDepositPercent || 0), 0) / products.length)
    : 0;
  const avgMonths     = products.length
    ? Math.round(products.reduce((s, p) => s + (p.installmentMonths || 0), 0) / products.length)
    : 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 pt-28 pb-12 space-y-6">

        {/* ── header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Lipa Mdogo Mdogo</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage installment plans for your products</p>
          </div>
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 px-3 py-2 rounded-xl">
            <CreditCard className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-semibold text-orange-700">
              {enabledCount} active plan{enabledCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* ── stat cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-orange-500" />}
            label="Total Products"
            value={String(products.length)}
            sub="with installment plans"
          />
          <StatCard
            icon={<Percent className="w-5 h-5 text-orange-500" />}
            label="Avg. Deposit"
            value={`${avgDeposit}%`}
            sub="across all plans"
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-orange-500" />}
            label="Avg. Duration"
            value={`${avgMonths} mo`}
            sub="payment period"
          />
        </div>

        {/* ── empty state ── */}
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-16 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center">
              <PackageSearch className="w-7 h-7 text-orange-400" />
            </div>
            <h2 className="text-base font-bold text-gray-800">No installment plans yet</h2>
            <p className="text-sm text-gray-500 max-w-xs">
              Go to your product listings and enable installment payments to offer Lipa Mdogo Mdogo to buyers.
            </p>
          </div>
        ) : (

          /* ── table card ── */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-bold text-gray-700">All Installment Products</span>
            </div>

            {/* desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">Product</th>
                    <th className="px-5 py-3 text-left">Price</th>
                    <th className="px-5 py-3 text-left">Deposit</th>
                    <th className="px-5 py-3 text-left">Duration</th>
                    <th className="px-5 py-3 text-left">Monthly Est.</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((p) => {
                    const depositAmt  = Math.ceil(p.calculatedPrice * (p.installmentDepositPercent / 100));
                    const remaining   = p.calculatedPrice - depositAmt;
                    const monthly     = p.installmentMonths > 0 ? Math.ceil(remaining / p.installmentMonths) : 0;

                    return (
                      <tr key={p._id} className="hover:bg-orange-50/30 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-900 line-clamp-1 max-w-[200px]">{p.name}</p>
                        </td>
                        <td className="px-5 py-4 font-bold text-orange-600">
                          Ksh {p.calculatedPrice.toLocaleString()}
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <span className="font-semibold text-gray-800">{p.installmentDepositPercent}%</span>
                            <p className="text-[10px] text-gray-400">Ksh {depositAmt.toLocaleString()}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-700">
                          {p.installmentMonths} months
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-semibold text-gray-800">
                            Ksh {monthly.toLocaleString()}/mo
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full
                            ${p.installmentEnabled
                              ? 'bg-green-50 text-green-700 border border-green-100'
                              : 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${p.installmentEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                            {p.installmentEnabled ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/seller/installments/edit/${p._id}`}
                            className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600
                              text-white text-xs font-bold px-3 py-2 rounded-xl transition-all
                              active:scale-95 shadow-sm"
                          >
                            <Pencil className="w-3 h-3" />
                            Edit
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* mobile cards */}
            <div className="md:hidden divide-y divide-gray-50">
              {products.map((p) => {
                const depositAmt = Math.ceil(p.calculatedPrice * (p.installmentDepositPercent / 100));
                const remaining  = p.calculatedPrice - depositAmt;
                const monthly    = p.installmentMonths > 0 ? Math.ceil(remaining / p.installmentMonths) : 0;

                return (
                  <div key={p._id} className="px-4 py-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">{p.name}</p>
                      <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full
                        ${p.installmentEnabled ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.installmentEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {p.installmentEnabled ? 'Active' : 'Off'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-gray-50 rounded-xl px-3 py-2">
                        <p className="text-gray-400">Price</p>
                        <p className="font-bold text-orange-600">Ksh {p.calculatedPrice.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl px-3 py-2">
                        <p className="text-gray-400">Deposit</p>
                        <p className="font-bold text-gray-800">{p.installmentDepositPercent}%</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl px-3 py-2">
                        <p className="text-gray-400">Monthly</p>
                        <p className="font-bold text-gray-800">Ksh {monthly.toLocaleString()}</p>
                      </div>
                    </div>
                    <Link
                      href={`/seller/installments/edit/${p._id}`}
                      className="flex items-center justify-center gap-1.5 w-full bg-orange-500
                        hover:bg-orange-600 text-white text-xs font-bold py-2.5 rounded-xl transition"
                    >
                      <Pencil className="w-3 h-3" /> Edit Plan
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}