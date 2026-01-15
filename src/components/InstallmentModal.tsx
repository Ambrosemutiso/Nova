'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function InstallmentModal({ product, onClose, user }: any) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [buyerId, setBuyerId] = useState<string | null>(null);

  useEffect(() => {
    if (user?._id) {
      setBuyerId(user._id);
    } else {
      const stored = localStorage.getItem('userId');
      if (stored) setBuyerId(stored);
    }
  }, [user]);

  const months = product.installmentMonths;
  const totalAmount = product.calculatedPrice;
  const deposit = product.depositAmount || 0;
  const remaining = totalAmount - deposit;
  const monthlyAmount = Math.round(remaining / months);

  const handleCreateInstallment = async () => {
    if (!buyerId) {
      alert("You must be logged in.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/installments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId,
          productId: product._id,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
          <h2 className="text-xl font-semibold mb-3">{product.name}</h2>

          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>Total Price:</strong> Ksh.{totalAmount.toLocaleString()}
            </p>
            <p>
              <strong>Deposit:</strong> Ksh.{deposit.toLocaleString()}
            </p>
            <p>
              <strong>Duration:</strong> {months} months
            </p>
            <p>
              <strong>Monthly Payment:</strong>{" "}
              <span className="text-black font-semibold">
                Ksh.{monthlyAmount.toLocaleString()}
              </span>
            </p>
          </div>

          {result?.success && (
            <p className="mt-4 text-green-600 text-sm">
              Installment plan created successfully.
            </p>
          )}

          {result?.error && (
            <p className="mt-4 text-red-600 text-sm">{result.error}</p>
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
              onClick={handleCreateInstallment}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Accept & Continue'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
