'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
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
import { useAuth } from '@/app/context/AuthContext';

/* ---------------- Utils ---------------- */
type WeeklyStat = {
  day: string;
  total: number;
};

const getLast7Days = (): string[] => {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]); // YYYY-MM-DD
  }
  return days;
};

const formatDayLabel = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
  });
};

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
  const { user } = useAuth();

  const [showBalance, setShowBalance] = useState(true);
  const [currency, setCurrency] = useState<Currency>('NC');

  const [showAmountModal, setShowAmountModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number | null>(null);

  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number | null>(null);
  const [withdrawMethod, setWithdrawMethod] = useState<'mpesa'>('mpesa');
  const [balanceNC, setBalanceNC] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeFilter, setActiveFilter] = useState<'Today' | 'Yesterday' | 'Earlier'>('Today');
  const [showAllTx, setShowAllTx] = useState(false);

  const hideTimer = useRef<NodeJS.Timeout | null>(null);
  const lastPaymentRef = useRef<number | null>(null);
  
  const userName = user?.name || 'Welcome';

  const buyerId =
    typeof window !== 'undefined'
      ? localStorage.getItem('userId')
      : null;

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

  useEffect(() => {
  if (!user?._id) return;

  fetch(`/api/wallet/balance?userId=${user._id}`)
    .then(res => res.json())
    .then(data => setBalanceNC(data.balance));

  fetch(`/api/wallet/transactions?userId=${user._id}`)
    .then(res => res.json())
    .then(setTransactions);
}, [user]);



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
  if (pin.length !== 4 || !withdrawAmount) {
    toast.error('Invalid PIN or amount');
    return;
  }

  try {
    const res = await fetch('/api/wallet/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user!._id,
        pin,
        amount: withdrawAmount,
        method: withdrawMethod,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message);
      return;
    }

    toast.success('Withdrawal initiated');

    setShowPinModal(false);
    setPin('');
    setWithdrawAmount(null);

  } catch {
    toast.error('Withdrawal failed');
  }
};
const filteredTx = transactions.filter(tx => {
  const group = formatDateGroup(tx.date);
  return group === activeFilter;
});

const groupedTx = filteredTx.reduce((acc, tx) => {
  const key = formatDateGroup(tx.date);
  acc[key] = acc[key] || [];
  acc[key].push(tx);
  return acc;
}, {} as Record<string, Transaction[]>);

  const weeklyActivity: WeeklyStat[] = (() => {
  const last7Days = getLast7Days();

  const dailyTotals: Record<string, number> = {};

  last7Days.forEach(day => {
    dailyTotals[day] = 0;
  });

  transactions.forEach(tx => {
    const dayKey = new Date(tx.date).toISOString().split('T')[0];

    if (dailyTotals[dayKey] !== undefined) {
      dailyTotals[dayKey] += tx.amount;
    }
  });

  return last7Days.map(day => ({
    day: formatDayLabel(day),
    total: dailyTotals[day],
  }));
})();

const maxWeeklyValue = Math.max(
  ...weeklyActivity.map(d => d.total),
  1 // prevent division by zero
);



  return (
    <div className="max-w-5xl mx-auto px-4 pt-28 pb-12 space-y-10 min-h-screen bg-gradient-to-b from-orange-50 to-white">

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
              className="p-2 rounded-full bg-white/10 cursor-pointer"
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
              ≈ KES {showBalance? balanceNC.toLocaleString() : '•••••'}
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
  {weeklyActivity.map((day, i) => {
  const height =
  day.total === 0
    ? 0
    : Math.max((day.total / maxWeeklyValue) * 100, 8);


    return (
      <div key={i} className="flex-1 flex flex-col items-center">
        <div className="relative w-full h-20 bg-orange-100 rounded-lg overflow-hidden">
          <div
            className="absolute bottom-0 w-full bg-orange-500 rounded-lg transition-all duration-500"
            style={{ height: `${height}%` }}
          />
        </div>

        <span className="text-xs text-gray-500 mt-1">{day.day}</span>
      </div>
    );
  })}
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
  onClick={async () => {
  if (!user?._id) return;

  try {
    const res = await fetch(`/api/wallet/check-pin?userId=${user._id}`);
    const data = await res.json();

    if (!data.hasPin) {
      setShowSetPinModal(true);
    } else {
      setShowWithdrawModal(true);
    }
  } catch {
    toast.error('Unable to verify wallet PIN');
  }
}}
/>
        <WalletAction
          icon={<FiCreditCard />}
          title="Pay"
          subtitle="Use Nova Coins"
          color="orange"
        />
      </div>
      {/* Saved Payment Methods */}
{/* Saved Payment Methods */}
<div className="bg-white rounded-3xl p-6 shadow">
  <h3 className="font-semibold mb-4">Saved Payment Methods</h3>

  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
    <PaymentMethod
      image="/M-PESA.svg"
      alt="M-Pesa"
      label="M-Pesa"
    />

    <PaymentMethod
      image="/Airtel.svg"
      alt="Airtel Money"
      label="Airtel Money"
    />

    <PaymentMethod
      image="/visa.png"
      alt="Visa Card"
      label="Visa"
    />

    <PaymentMethod
      image="/mastercard.png"
      alt="MasterCard"
      label="Mastercard"
    />
  </div>
</div>

{/* Transactions */}
<div className="bg-white rounded-3xl shadow p-6">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <h3 className="font-semibold">Transactions</h3>

    <button
      onClick={() => setShowAllTx(true)}
      className="text-sm text-orange-600 hover:underline"
    >
      View all
    </button>
  </div>

  {/* Filters */}
  <div className="flex gap-2 mb-5">
    {(['Today', 'Yesterday', 'Earlier'] as const).map(label => (
      <button
        key={label}
        onClick={() => setActiveFilter(label)}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition
          ${
            activeFilter === label
              ? 'bg-orange-500 text-white'
              : 'bg-orange-50 text-orange-600'
          }`}
      >
        {label}
      </button>
    ))}
  </div>

  {/* Empty */}
  {filteredTx.length === 0 ? (
    <div className="text-center py-10 text-gray-500">
      <p className="font-medium">No transactions</p>
      <p className="text-sm mt-1">
        Your wallet activity will appear here
      </p>
    </div>
  ) : (
    <ul className="space-y-4">
      {filteredTx.map(tx => (
        <li
          key={tx.id}
          className={`flex items-center justify-between p-4 rounded-2xl
            ${
              tx.type === 'credit'
                ? 'bg-green-50'
                : 'bg-orange-50'
            }`}
        >
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center
                ${
                  tx.type === 'credit'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-orange-100 text-orange-600'
                }`}
            >
              {tx.type === 'credit' ? <FiArrowDown /> : <FiArrowUp />}
            </div>

            <div>
              <p className="font-medium">{tx.label}</p>
              <p className="text-xs text-gray-500">
                {new Date(tx.date).toLocaleString()}
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="text-right">
            <p
              className={`font-semibold flex items-center gap-1 justify-end
                ${
                  tx.type === 'credit'
                    ? 'text-green-600'
                    : 'text-orange-600'
                }`}
            >
              <span className="text-lg">🪙</span>
              {tx.type === 'credit' ? '+' : '-'}
              {tx.amount} NC
            </p>
          </div>
        </li>
      ))}
    </ul>
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

      {showSetPinModal && (
  <SetPinModal
    userId={user!._id}
    onClose={() => setShowSetPinModal(false)}
    onSuccess={() => {
      setShowSetPinModal(false);
      setShowPinModal(true);
    }}
  />
)}

{showWithdrawModal && (
  <WithdrawModal
    onClose={() => setShowWithdrawModal(false)}
    onConfirm={(amount, method, phone) => {
      setWithdrawAmount(amount);
      setWithdrawMethod(method);
      setWithdrawPhone(phone);
      setShowWithdrawModal(false);
      setShowPinModal(true);
    }}
  />
)}

{showAllTx && (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
    <div className="bg-white rounded-3xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">All Transactions</h3>
        <button
          onClick={() => setShowAllTx(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <ul className="space-y-4">
        {transactions.map(tx => (
          <li
            key={tx.id}
            className="flex justify-between items-center border-b pb-3"
          >
            <div>
              <p className="font-medium">{tx.label}</p>
              <p className="text-xs text-gray-500">
                {new Date(tx.date).toLocaleString()}
              </p>
            </div>

            <p
              className={`font-semibold ${
                tx.type === 'credit'
                  ? 'text-green-600'
                  : 'text-orange-600'
              }`}
            >
              {tx.type === 'credit' ? '+' : '-'}
              {tx.amount} NC
            </p>
          </li>
        ))}
      </ul>
    </div>
  </div>
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
            // Give MPESA callback time to complete
            setTimeout(() => {
              window.location.reload();
            }, 4000); // 3–5 seconds is safe
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

function PaymentMethod({
  image,
  alt,
  label,
}: {
  image: string;
  alt: string;
  label: string;
}) {
  return (
    <div className="border rounded-2xl p-4 flex flex-col items-center justify-center gap-2
      hover:shadow-md transition cursor-pointer bg-gray-50"
    >
      <Image
        src={image}
        alt={alt}
        width={48}
        height={30}
        className="object-contain"
      />

      <p className="text-sm font-medium text-gray-700">
        {label}
      </p>
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

function SetPinModal({
  userId,
  onClose,
  onSuccess,
}: {
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (pin.length !== 4) {
      toast.error('PIN must be 4 digits');
      return;
    }

    if (pin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/wallet/set-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, pin }),
    });

    setLoading(false);

    if (!res.ok) {
      toast.error('Failed to set PIN');
      return;
    }

    toast.success('PIN set successfully');
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-80 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <FiLock /> Set Wallet PIN
        </h3>

        <input
          type="password"
          maxLength={4}
          placeholder="Enter 4-digit PIN"
          value={pin}
          onChange={e => setPin(e.target.value)}
          className="w-full border rounded-xl p-2 text-center"
        />

        <input
          type="password"
          maxLength={4}
          placeholder="Confirm PIN"
          value={confirmPin}
          onChange={e => setConfirmPin(e.target.value)}
          className="w-full border rounded-xl p-2 text-center"
        />

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border rounded-xl py-2"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={submit}
            className="flex-1 bg-orange-600 text-white rounded-xl py-2"
          >
            {loading ? 'Saving...' : 'Save PIN'}
          </button>
        </div>
      </div>
    </div>
  );
}
function WithdrawModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (amount: number, method: 'mpesa', phone: string) => void;
}) {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl w-80 space-y-4">
        <h3 className="font-semibold">Withdraw Funds</h3>

        <select className="w-full border rounded-xl p-2" disabled>
          <option value="mpesa">M-Pesa</option>
        </select>

        <input
          type="text"
          placeholder="M-Pesa Phone (2547XXXXXXXX)"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="w-full border rounded-xl p-2"
        />

        <input
          type="number"
          placeholder="Amount"
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
            onClick={() =>
              onConfirm(Number(amount), 'mpesa', phone)
            }
            className="flex-1 bg-orange-600 text-white rounded-xl py-2"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}