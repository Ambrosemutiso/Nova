'use client';

import { useState } from 'react';
import WalletModal from './WalletModal';

export default function DepositModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    setLoading(true);
    await fetch('/api/wallet/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, phone }),
    });
    setLoading(false);
    onClose();
  };

  return (
    <WalletModal title="Deposit to Wallet" onClose={onClose}>
      <input
        placeholder="Amount (KES)"
        className="w-full border rounded p-2"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />

      <input
        placeholder="M-Pesa phone number"
        className="w-full border rounded p-2"
        value={phone}
        onChange={e => setPhone(e.target.value)}
      />

      <button
        onClick={handleDeposit}
        disabled={loading}
        className="w-full bg-orange-600 text-white rounded py-2"
      >
        {loading ? 'Processing…' : 'Deposit'}
      </button>
    </WalletModal>
  );
}
