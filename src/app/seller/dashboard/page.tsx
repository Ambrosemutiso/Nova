'use client';
import { useEffect, useState } from 'react';

interface Seller {
  name: string;
  email: string;
}

export default function SellerDashboard() {
  const [seller, setSeller] = useState<Seller | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('sellerUser');
    if (storedUser) setSeller(JSON.parse(storedUser));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-orange-600 mb-6">
        Welcome, {seller?.name || 'Loading...'}
      </h1>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow-md text-center">
          <h3 className="text-lg font-semibold">Total Orders</h3>
          <p className="text-2xl font-bold text-orange-600">125</p>
        </div>
        <div className="bg-white p-4 rounded shadow-md text-center">
          <h3 className="text-lg font-semibold">Revenue</h3>
          <p className="text-2xl font-bold text-orange-600">Ksh 54,000</p>
        </div>
        <div className="bg-white p-4 rounded shadow-md text-center">
          <h3 className="text-lg font-semibold">Active Products</h3>
          <p className="text-2xl font-bold text-orange-600">34</p>
        </div>
      </div>

      {/* Seller info (optional) */}
      {seller && (
        <div className="bg-white p-4 rounded shadow">
          <p className="font-semibold">Email:</p>
          <p>{seller.email}</p>
        </div>
      )}
    </div>
  );
}
