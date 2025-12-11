'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallmentModal({ product, onClose, user }: any) {
  const [deposit, setDeposit] = useState('');
  const [months, setMonths] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [buyerId, setBuyerId] = useState<string | null>(null);

  // Load user ID (from props or localStorage)
  useEffect(() => {
    if (user?._id) {
      setBuyerId(user._id);
    } else {
      const stored = localStorage.getItem('userId');
      if (stored) setBuyerId(stored);
    }
  }, [user]);

  const handleCreateInstallment = async () => {
    if (!buyerId) {
      alert("You must be logged in to create an installment plan.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/installments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyerId,
          productId: product._id,
          deposit: Number(deposit),
          months,
        }),
      });

      const data = await res.json();
      setLoading(false);
      setResult(data);
    } catch (err) {
      console.error("Installment request failed:", err);
      setLoading(false);
    }
  };

  // Monthly payment preview (UI only)
  const depositAmount = Number(deposit) || 0;
  const remainingBalance = product.calculatedPrice - depositAmount;
  const monthlyPreview = months > 0 ? Math.round(remainingBalance / months) : 0;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white w-[90%] max-w-md rounded-2xl p-6 shadow-lg"
          initial={{ scale: 0.8 }} 
          animate={{ scale: 1 }} 
          exit={{ scale: 0.8 }}
        >
          {/* PRODUCT NAME */}
          <h2 className="text-xl font-semibold mb-3">
            {product.name}
          </h2>

          {/* PRODUCT DESC (optional) */}
          {product.description && (
            <p className="mb-4 text-gray-500">{product.description}</p>
          )}

          {/* INPUT FIELDS */}
          <div className="space-y-4">

            <div>
              <label className="text-sm text-gray-600">Deposit Amount</label>
              <input
                type="number"
                className="w-full border rounded-xl p-2 mt-1"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                placeholder="Enter deposit"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Payment Duration (Months)</label>
              <select
                className="w-full border rounded-xl p-2 mt-1"
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
              >
                <option value={1}>1 Month</option>
                <option value={2}>2 Months</option>
                <option value={3}>3 Months</option>
                <option value={6}>6 Months</option>
              </select>
            </div>
          </div>

          {/* MONTHLY PREVIEW */}
          <div className="mt-4 text-sm text-gray-700">
            Estimated Monthly Payment:{" "}
            <span className="font-semibold text-black">
              Ksh.{monthlyPreview.toLocaleString()}
            </span>
          </div>

          {/* SUCCESS MESSAGE */}
          {result?.success && (
            <p className="mt-4 text-green-600 text-sm">
              Installment plan created successfully! Proceed to deposit payment.
            </p>
          )}

          {/* FAILED MESSAGE */}
          {result?.error && (
            <p className="mt-4 text-red-600 text-sm">
              {result.error}
            </p>
          )}

          {/* BUTTONS */}
          <div className="flex justify-between mt-6">
            <button
              className="px-4 py-2 bg-gray-300 rounded-xl"
              onClick={onClose}
            >
              Close
            </button>

            <button
              className="px-4 py-2 bg-orange-600 text-white rounded-xl"
              onClick={handleCreateInstallment}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Start Plan'}
            </button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
