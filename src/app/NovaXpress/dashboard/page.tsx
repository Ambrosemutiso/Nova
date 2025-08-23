"use client";

import { useState } from "react";
import { Users, Store, Package, Wallet, LogOut } from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("users");

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Users</h2>
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">ID</th>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Email</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">1</td>
                  <td className="border p-2">John Doe</td>
                  <td className="border p-2">john@example.com</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      case "sellers":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Sellers</h2>
            <ul className="space-y-2">
              <li className="border p-2 rounded">Seller A</li>
              <li className="border p-2 rounded">Seller B</li>
            </ul>
          </div>
        );
      case "products":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Products</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="border p-4 rounded shadow">Product 1</div>
              <div className="border p-4 rounded shadow">Product 2</div>
            </div>
          </div>
        );
      case "withdrawals":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Withdrawal Requests</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center border p-4 rounded shadow">
                <span>Seller A - KES 5,000</span>
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Approve
                </button>
              </div>
              <div className="flex justify-between items-center border p-4 rounded shadow">
                <span>Seller B - KES 3,000</span>
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Approve
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Select a section</div>;
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 font-bold text-xl border-b border-gray-700">
          NovaXpress Admin
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 p-2 w-full text-left rounded hover:bg-gray-700 ${
              activeTab === "users" ? "bg-gray-700" : ""
            }`}
          >
            <Users size={18} /> Users
          </button>
          <button
            onClick={() => setActiveTab("sellers")}
            className={`flex items-center gap-2 p-2 w-full text-left rounded hover:bg-gray-700 ${
              activeTab === "sellers" ? "bg-gray-700" : ""
            }`}
          >
            <Store size={18} /> Sellers
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 p-2 w-full text-left rounded hover:bg-gray-700 ${
              activeTab === "products" ? "bg-gray-700" : ""
            }`}
          >
            <Package size={18} /> Products
          </button>
          <button
            onClick={() => setActiveTab("withdrawals")}
            className={`flex items-center gap-2 p-2 w-full text-left rounded hover:bg-gray-700 ${
              activeTab === "withdrawals" ? "bg-gray-700" : ""
            }`}
          >
            <Wallet size={18} /> Withdrawals
          </button>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button className="flex items-center gap-2 w-full p-2 rounded hover:bg-red-600 bg-red-500 text-white">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">{renderContent()}</main>
    </div>
  );
}
