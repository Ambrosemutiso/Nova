'use client';

import { useEffect, useState } from 'react';
import {
  FiEye,
  FiEyeOff,
  FiArrowDown,
  FiArrowUp,
  FiCreditCard,
} from 'react-icons/fi';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

type Transaction = {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  label: string;
  date: string;
};

export default function WalletPage() {
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(false);

  // 🔮 Replace later with API / WalletContext
  const userName = 'Ambrose';
  const balance = 1250;

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Later:
    // fetch('/api/wallet')
    // setBalance(...)
    // setTransactions(...)
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-12 space-y-8">

      {/* Greeting */}
      <div>
        <p className="text-gray-500">{getGreeting()},</p>
        <h1 className="text-2xl font-bold">{userName}</h1>
      </div>

      {/* Wallet Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white p-6 shadow-xl">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm opacity-90">Nova Wallet</p>
            <p className="text-xs opacity-80">Available Balance</p>
          </div>

          <button
            onClick={() => setShowBalance(!showBalance)}
            className="opacity-80 hover:opacity-100"
          >
            {showBalance ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        <div className="mt-4">
          <h2 className="text-3xl font-bold tracking-wide">
            {showBalance ? `${balance.toLocaleString()} NC` : '•••••'}
          </h2>
          <p className="text-xs opacity-80 mt-1">
            ≈ KES {balance.toLocaleString()}
          </p>
        </div>

        {/* Decorative */}
        <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button className="bg-white border rounded-2xl p-4 flex items-center gap-4 shadow hover:shadow-md transition">
          <FiArrowDown className="text-green-600 text-2xl" />
          <div>
            <p className="font-semibold">Deposit</p>
            <p className="text-sm text-gray-500">Top up wallet</p>
          </div>
        </button>

        <button className="bg-white border rounded-2xl p-4 flex items-center gap-4 shadow hover:shadow-md transition">
          <FiArrowUp className="text-red-600 text-2xl" />
          <div>
            <p className="font-semibold">Withdraw</p>
            <p className="text-sm text-gray-500">Cash out</p>
          </div>
        </button>

        <button className="bg-white border rounded-2xl p-4 flex items-center gap-4 shadow hover:shadow-md transition">
          <FiCreditCard className="text-orange-600 text-2xl" />
          <div>
            <p className="font-semibold">Pay</p>
            <p className="text-sm text-gray-500">Use Nova Coins</p>
          </div>
        </button>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl shadow p-5">
        <h3 className="font-semibold mb-4">Recent Transactions</h3>

        {transactions.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>No transactions yet</p>
            <p className="text-sm mt-1">
              Your wallet activity will appear here
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {transactions.map(tx => (
              <li
                key={tx.id}
                className="flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{tx.label}</p>
                  <p className="text-xs text-gray-500">{tx.date}</p>
                </div>

                <p
                  className={`font-semibold ${
                    tx.type === 'credit'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {tx.type === 'credit' ? '+' : '-'}
                  {tx.amount} NC
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
