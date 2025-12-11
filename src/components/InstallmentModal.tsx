'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallmentModal({ product, onClose }: any) {
  const [deposit, setDeposit] = useState('');
  const [months, setMonths] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleStart = async () => {
    setLoading(true);

    const res = await fetch('/api/installments/create', {
      method: 'POST',
      body: JSON.stringify({
        productId: product._id,
        deposit: Number(deposit),
        months,
      }),
    });

    const data = await res.json();
    setLoading(false);
    setResult(data);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center z-[9999]"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white w-[90%] max-w-md rounded-2xl p-6 shadow-lg"
          initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
        >
          <h2 className="text-xl font-semibold mb-3">{product.title}</h2>

          <p className="mb-4 text-gray-500">{product.description}</p>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Deposit Amount</label>
              <input
                type="number"
                className="w-full border rounded-xl p-2 mt-1"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
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

          {result && (
            <p className="mt-4 text-orange-600 text-sm">
              Plan created — proceed to pay deposit.
            </p>
          )}

          <div className="flex justify-between mt-6">
            <button
              className="px-4 py-2 bg-gray-300 rounded-xl"
              onClick={onClose}
            >
              Close
            </button>

            <button
              className="px-4 py-2 bg-orange-600 text-white rounded-xl"
              onClick={handleStart}
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
