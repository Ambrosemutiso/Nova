'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import type { ProductType } from "@/app/types/product";
import {
  CreditCard, ChevronLeft, ToggleLeft, ToggleRight,
  Percent, Clock, FileText, Save, Info,
} from 'lucide-react';

/* ── labelled input wrapper ── */
function Field({ label, hint, children }: {
  label: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
        {label}
        {hint && (
          <span className="group relative">
            <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
            <span className="absolute left-5 top-0 w-52 bg-gray-900 text-white text-[10px]
              rounded-lg px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity
              pointer-events-none z-10 leading-relaxed shadow-xl">
              {hint}
            </span>
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

/* ── styled text input ── */
function StyledInput({ icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </div>
      )}
      <input
        {...props}
        className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pr-4 text-sm
          text-gray-900 placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
          transition-all duration-200
          ${icon ? 'pl-10' : 'pl-4'} ${props.className ?? ''}`}
      />
    </div>
  );
}

export default function EditInstallmentPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/seller/installments/${id}`);
        const data = await res.json();
        if (data.success) setProduct(data.product);
        else toast.error('Product not found');
      } catch {
        toast.error('Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/seller/installments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          installmentEnabled:       !!product.installmentEnabled,
          installmentDepositPercent: Number(product.installmentDepositPercent) || 0,
          installmentMonths:         Number(product.installmentMonths) || 0,
          installmentPolicy:         product.installmentPolicy || '',
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Plan updated successfully!');
        setTimeout(() => router.push('/seller/installments'), 1200);
      } else {
        toast.error(json.message || 'Failed to update');
      }
    } catch {
      toast.error('Error updating product');
    } finally {
      setSaving(false);
    }
  };

  /* ── derived preview values ── */
  const depositAmt = product
    ? Math.ceil(product.calculatedPrice * ((product.installmentDepositPercent || 0) / 100))
    : 0;
  const remaining = product ? product.calculatedPrice - depositAmt : 0;
  const monthly   = product && product.installmentMonths > 0
    ? Math.ceil(remaining / product.installmentMonths)
    : 0;

  /* ── skeleton ── */
  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 pt-28 pb-10 space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500 text-sm">Product not found.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 pt-28 pb-12 space-y-6">

        {/* ── back + header ── */}
        <div>
          <button
            onClick={() => router.push('/seller/installments')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800
              transition-colors mb-4 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Installments
          </button>

          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">Edit Installment Plan</h1>
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{product.name}</p>
            </div>
          </div>
        </div>

        {/* ── live preview card ── */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 text-white shadow-lg shadow-orange-200">
          <p className="text-xs font-semibold text-orange-100 uppercase tracking-wider mb-3">
            Live Plan Preview
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Product Price', value: `Ksh ${product.calculatedPrice.toLocaleString()}` },
              { label: 'Deposit', value: depositAmt > 0 ? `Ksh ${depositAmt.toLocaleString()}` : '—' },
              { label: 'Monthly', value: monthly > 0 ? `Ksh ${monthly.toLocaleString()}/mo` : '—' },
            ].map((item) => (
              <div key={item.label} className="bg-white/15 rounded-xl px-3 py-2.5">
                <p className="text-[10px] text-orange-100 font-medium">{item.label}</p>
                <p className="text-sm font-black mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
          {product.installmentMonths > 0 && (
            <p className="text-xs text-orange-100 mt-3">
              Buyer pays <strong className="text-white">Ksh {depositAmt.toLocaleString()}</strong> upfront,
              then <strong className="text-white">Ksh {monthly.toLocaleString()}</strong> for{' '}
              <strong className="text-white">{product.installmentMonths} months</strong>.
            </p>
          )}
        </div>

        {/* ── form card ── */}
        <form onSubmit={handleUpdate}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-700">Plan Settings</p>
            </div>

            <div className="px-5 py-5 space-y-5">

              {/* ── Toggle switch ── */}
              <Field label="Accept Installments" hint="When enabled, buyers can purchase this product using Lipa Mdogo Mdogo.">
                <button
                  type="button"
                  onClick={() => setProduct({ ...product, installmentEnabled: !product.installmentEnabled })}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all duration-200
                    ${product.installmentEnabled
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}
                >
                  {product.installmentEnabled
                    ? <ToggleRight className="w-6 h-6 text-green-500 shrink-0" />
                    : <ToggleLeft  className="w-6 h-6 text-gray-400 shrink-0" />
                  }
                  <span className="text-sm font-semibold">
                    {product.installmentEnabled ? 'Installments enabled' : 'Installments disabled'}
                  </span>
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full
                    ${product.installmentEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                    {product.installmentEnabled ? 'ON' : 'OFF'}
                  </span>
                </button>
              </Field>

              {/* ── Deposit percent ── */}
              <Field
                label="Deposit Percentage"
                hint="The percentage of the total price the buyer pays upfront."
              >
                <StyledInput
                  type="number"
                  value={product.installmentDepositPercent}
                  onChange={(e) => setProduct({ ...product, installmentDepositPercent: Number(e.target.value) })}
                  placeholder="e.g. 30"
                  min={0}
                  max={100}
                  icon={<Percent className="w-4 h-4" />}
                />
                {depositAmt > 0 && (
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    = Ksh {depositAmt.toLocaleString()} deposit on this product
                  </p>
                )}
              </Field>

              {/* ── Months ── */}
              <Field
                label="Installment Duration (Months)"
                hint="How many months the buyer has to complete payments after the deposit."
              >
                <StyledInput
                  type="number"
                  value={product.installmentMonths}
                  onChange={(e) => setProduct({ ...product, installmentMonths: Number(e.target.value) })}
                  placeholder="e.g. 6"
                  min={1}
                  icon={<Clock className="w-4 h-4" />}
                />
                {monthly > 0 && (
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    = Ksh {monthly.toLocaleString()} per month for {product.installmentMonths} months
                  </p>
                )}
              </Field>

              {/* ── Policy ── */}
              <Field
                label="Installment Policy"
                hint="Optional terms and conditions shown to buyers before they accept the plan."
              >
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  <textarea
                    value={product.installmentPolicy || ''}
                    onChange={(e) => setProduct({ ...product, installmentPolicy: e.target.value })}
                    placeholder="e.g. Buyer must pay remaining balance within agreed period. Late payments incur a 5% penalty."
                    rows={3}
                    className="w-full pl-10 pr-4 pt-3 pb-3 bg-gray-50 border border-gray-200 rounded-xl
                      text-sm text-gray-900 placeholder:text-gray-400 resize-none
                      focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
                      transition-all duration-200"
                  />
                </div>
              </Field>
            </div>

            {/* ── footer actions ── */}
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-gray-50/50">
              <button
                type="button"
                onClick={() => router.push('/seller/installments')}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold
                  text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600
                  disabled:opacity-60 disabled:cursor-not-allowed
                  text-white text-sm font-bold px-6 py-2.5 rounded-xl
                  transition-all duration-200 active:scale-[0.98] shadow-md shadow-orange-200"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}