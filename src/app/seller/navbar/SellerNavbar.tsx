'use client';
import { useEffect, useState } from 'react';
import { FiMenu, FiPackage } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function SellerNavbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const sellerData = localStorage.getItem('sellerUser');
    if (sellerData) {
      const seller = JSON.parse(sellerData);
      fetchOrders(seller.uid);
    }
  }, []);

  const fetchOrders = async (sellerId: string) => {
    const q = query(collection(db, 'orders'), where('sellerId', '==', sellerId));
    const snap = await getDocs(q);
    setOrderCount(snap.size);
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('sellerUser');
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-md p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button className="text-2xl text-orange-500">
          <FiMenu />
        </button>
        <input
          type="text"
          placeholder="Search..."
          className="border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:border-orange-500"
        />
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/seller/orders')} className="relative text-2xl text-orange-500">
          <FiPackage />
          {orderCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5">
              {orderCount}
            </span>
          )}
        </button>
        <div className="relative">
          <Image
            src="/default-profile.png" // Replace with dynamic user photo if available
            alt="Profile"
            width={40}
            height={40}
            className="rounded-full cursor-pointer"
            onClick={() => setShowDropdown(!showDropdown)}
          />
          {showDropdown && (
            <div className="absolute right-0 mt-2 bg-white border rounded shadow z-10">
              <button
                className="block px-4 py-2 text-sm text-red-600 hover:bg-red-100 w-full text-left"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
