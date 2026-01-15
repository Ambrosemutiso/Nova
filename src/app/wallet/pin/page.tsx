'use client';

import { useState } from 'react';

export default function SetupPinPage() {
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSave = async () => {
    if (pin !== confirm || pin.length !== 4) return;

    await fetch('/api/wallet/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
  };

  return (
    <div className="max-w-sm mx-auto pt-24 space-y-4">
      <h1 className="text-xl font-bold">Set Wallet PIN</h1>

      <input
        type="password"
        maxLength={4}
        placeholder="Enter 4-digit PIN"
        className="w-full border rounded p-2"
        onChange={e => setPin(e.target.value)}
      />

      <input
        type="password"
        maxLength={4}
        placeholder="Confirm PIN"
        className="w-full border rounded p-2"
        onChange={e => setConfirm(e.target.value)}
      />

      <button
        onClick={handleSave}
        className="w-full bg-orange-600 text-white rounded py-2"
      >
        Save PIN
      </button>
    </div>
  );
}
