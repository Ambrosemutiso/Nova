'use client';

import { useEffect, useState, useRef } from 'react';
import {
  FiEye,
  FiEyeOff,
  FiArrowDown,
  FiArrowUp,
  FiCreditCard,
  FiActivity,
  FiRepeat,
  FiLock,
} from 'react-icons/fi';
import GlobalPayModal from '@/components/payments/GlobalPayModal';
import { toast } from 'react-toastify';

/* ---------------- Utils ---------------- */

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const formatDateGroup = (date: string) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return 'Earlier';
};

type Transaction = {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  label: string;
  date: string;
};
/* ---------------- Types ---------------- */

type Currency = 'NC' | 'KES';

/* ---------------- Component ---------------- */

export default function WalletPage() {
  const [showBalance, setShowBalance] = useState(true);
  const [currency, setCurrency] = useState<Currency>('NC');

  const [showAmountModal, setShowAmountModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number | null>(null);

  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');

  const hideTimer = useRef<NodeJS.Timeout | null>(null);
  const lastPaymentRef = useRef<number | null>(null);

  const userName = 'Ambrose';
  const balanceNC = 1250;

  const buyerId =
    typeof window !== 'undefined'
      ? localStorage.getItem('userId')
      : null;

       const transactions: Transaction[] = [];

  /* 🔐 Auto-hide balance */
  useEffect(() => {
    const resetTimer = () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setShowBalance(false), 15000);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, []);

  /* 🧠 Duplicate payment prevention */
  const canInitiatePayment = () => {
    const now = Date.now();
    if (lastPaymentRef.current && now - lastPaymentRef.current < 10000) {
      toast.error('Please wait before initiating another payment.');
      return false;
    }
    lastPaymentRef.current = now;
    return true;
  };

  /* 🔐 Withdraw PIN */
  const confirmWithdraw = async () => {
    if (pin.length !== 4) return alert('Enter 4-digit PIN');
    setShowPinModal(false);
    setPin('');
    alert('Withdrawal initiated');
  };

    const groupedTx = transactions.reduce((acc, tx) => {
    const key = formatDateGroup(tx.date);
    acc[key] = acc[key] || [];
    acc[key].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>);

  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-12 space-y-10">

      {/* Greeting */}
      <div>
        <p className="text-gray-500 text-sm">{getGreeting()},</p>
        <h1 className="text-3xl font-bold">{userName}</h1>
      </div>

      {/* Wallet Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-orange-500 to-orange-700 text-white p-7 shadow-2xl overflow-hidden">
        <div className="flex justify-between">
          <div>
            <p className="text-sm opacity-90">Nova Wallet</p>
            <p className="text-xs opacity-80">Available Balance</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrency(currency === 'NC' ? 'KES' : 'NC')}
              className="bg-white/10 px-3 py-1 rounded-full text-xs flex items-center gap-1"
            >
              <FiRepeat /> {currency}
            </button>

            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 rounded-full bg-white/10"
            >
              {showBalance ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-4xl font-bold">
            {showBalance ? balanceNC.toLocaleString() : '•••••'} {currency}
          </h2>
          {currency === 'NC' && (
            <p className="text-sm opacity-80 mt-1">
              ≈ KES {balanceNC.toLocaleString()}
            </p>
          )}
        </div>

        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full" />
      </div>

      {/* Analytics */}
      <div className="bg-white rounded-3xl p-6 shadow">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <FiActivity /> Weekly Activity
        </h3>

<div className="flex items-end gap-3 h-24">
  {[20, 40, 30, 60, 45, 80, 55].map((v, i) => (
    <div
      key={i}
      className="flex-1 h-full bg-orange-100 rounded-lg relative"
    >
      <div
  className="bg-orange-500 rounded-lg absolute bottom-0 w-full transition-all duration-500"
        style={{ height: `${v}%` }}
      />
    </div>
  ))}
</div>
</div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-4">
        <WalletAction
          icon={<FiArrowDown />}
          title="Deposit"
          subtitle="Top up wallet"
          color="green"
          onClick={() => {
            if (!canInitiatePayment()) return;
            setShowAmountModal(true);
          }}
        />

        <WalletAction
          icon={<FiArrowUp />}
          title="Withdraw"
          subtitle="Cash out"
          color="red"
          onClick={() => setShowPinModal(true)}
        />

        <WalletAction
          icon={<FiCreditCard />}
          title="Pay"
          subtitle="Use Nova Coins"
          color="orange"
        />
      </div>
      {/* Saved Payment Methods */}
      <div className="bg-white rounded-3xl p-6 shadow">
        <h3 className="font-semibold mb-4">Saved Payment Methods</h3>

        <div className="flex gap-4">
          <PaymentMethod label="M-Pesa" />
          <PaymentMethod label="Airtel Money" />
          <PaymentMethod label="Card" />
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-3xl shadow p-6">
        <h3 className="font-semibold mb-4">Transactions</h3>

        {Object.keys(groupedTx).length === 0 ? (
<div className="text-center py-12 text-gray-500">
   <p className="font-medium"> No transactions yet </p>
    <p className="text-sm mt-1">
       Your deposits, payments, and withdrawals will appear here 
       </p>
 </div>
        ) : (
          Object.entries(groupedTx).map(([group, txs]) => (
            <div key={group} className="mb-6">
              <p className="text-sm text-gray-500 mb-2">{group}</p>
              <ul className="space-y-4">
                {txs.map(tx => (
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
            </div>
          ))
        )}
      </div>
      {/* 🔢 Amount Entry Modal */}
      {showAmountModal && (
        <AmountModal
          onClose={() => setShowAmountModal(false)}
          onConfirm={amount => {
            setTopUpAmount(amount);
            setShowAmountModal(false);
            setShowPayModal(true);
          }}
        />
      )}

      {/* 📲 GlobalPayModal */}
      {showPayModal && topUpAmount && (
        <GlobalPayModal
          payload={{
            amount: topUpAmount,
            items: [],
            deliveryFee: 0,
            county: '',
            town: '',
            userId: buyerId!,
            purpose: 'wallet',
            refId: buyerId!, // wallet reference
          }}
          onClose={() => setShowPayModal(false)}
          onSuccess={() => {
            setShowPayModal(false);
            window.location.reload();
          }}
        />
      )}

      {/* 🔐 PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl w-80 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <FiLock /> Enter PIN
            </h3>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={e => setPin(e.target.value)}
              className="w-full border rounded-xl p-2 text-center text-lg"
            />
            <button
              onClick={confirmWithdraw}
              className="w-full bg-orange-600 text-white py-2 rounded-xl"
            >
              Confirm Withdraw
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Components ---------------- */

function WalletAction({
  icon,
  title,
  subtitle,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: 'green' | 'red' | 'orange';
  onClick?: () => void;
}) {
  const colorMap = {
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <button
      onClick={onClick}
      className="bg-white border rounded-2xl p-4 shadow hover:shadow-md transition active:scale-[0.98]"
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorMap[color]}`}
      >
        {icon}
      </div>
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </button>
  );
}


function PaymentMethod({ label }: { label: string }) {
  return (
    <div className="border rounded-xl px-4 py-3 flex items-center gap-3">
      <FiCreditCard />
      <p className="font-medium">{label}</p>
    </div>
  );
}

/* 🔢 Amount Modal */
function AmountModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (amount: number) => void;
}) {
  const [amount, setAmount] = useState('');

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl w-80 space-y-4">
        <h3 className="font-semibold">Enter Amount</h3>
        <input
          type="number"
          placeholder="e.g. 500"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full border rounded-xl p-2"
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border rounded-xl py-2"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(Number(amount))}
            className="flex-1 bg-orange-600 text-white rounded-xl py-2"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}