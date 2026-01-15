'use client';

import { useState } from 'react';
import WalletModal from './WalletModal';

export default function WithdrawModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');

  const handleWithdraw = async () => {
    await fetch('/api/wallet/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, phone }),
    });
    onClose();
  };

  return (
    <WalletModal title="Withdraw Funds" onClose={onClose}>
      <input
        placeholder="Amount (NC)"
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
        onClick={handleWithdraw}
        className="w-full bg-red-600 text-white rounded py-2"
      >
        Withdraw
      </button>
    </WalletModal>
  );
}
