"use client";

import { useEffect, useState } from "react";
import { Users, Store, Package, Wallet, LogOut } from "lucide-react";
import { toast } from "react-toastify";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Seller {
  _id: string;
  name: string;
  email: string;
  shopName: string;
}

interface Product {
  _id: string;
  title: string;
  price: number;
}

interface Withdrawal {
  _id: string;
  sellerId: string;
  amount: number;
  status: string; // pending | approved
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<User[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, sellersRes, productsRes, withdrawalsRes] =
          await Promise.all([
            fetch("/api/users"),
            fetch("/api/sellers"),
            fetch("/api/products/all"),
            fetch("/api/withdrawalrequest"),
          ]);

        setUsers(await usersRes.json());
        setSellers(await sellersRes.json());
        setProducts(await productsRes.json());
        setWithdrawals(await withdrawalsRes.json());
      } catch (err) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Approve withdrawal
  const approveWithdrawal = async (id: string) => {
    try {
      const res = await fetch(
        `/api/withdrawals/approve/${id}`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Approval failed");

      toast.success("Withdrawal approved ✅");

      setWithdrawals((prev) =>
        prev.map((w) => (w._id === id ? { ...w, status: "approved" } : w))
      );
    } catch (err) {
      toast.error("Error approving withdrawal");
    }
  };

  const renderContent = () => {
    if (loading) return <p>Loading...</p>;

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
                {users.map((u) => (
                  <tr key={u._id}>
                    <td className="border p-2">{u._id}</td>
                    <td className="border p-2">{u.name}</td>
                    <td className="border p-2">{u.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "sellers":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Sellers</h2>
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">ID</th>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Shop</th>
                  <th className="border p-2">Email</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((s) => (
                  <tr key={s._id}>
                    <td className="border p-2">{s._id}</td>
                    <td className="border p-2">{s.name}</td>
                    <td className="border p-2">{s.shopName}</td>
                    <td className="border p-2">{s.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "products":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Products</h2>
            <div className="grid grid-cols-2 gap-4">
              {products.map((p) => (
                <div
                  key={p._id}
                  className="border p-4 rounded shadow bg-white"
                >
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="text-sm">Price: ${p.price}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case "withdrawals":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Withdrawal Requests</h2>
            <div className="space-y-4">
              {withdrawals.map((w) => (
                <div
                  key={w._id}
                  className="flex justify-between items-center border p-4 rounded shadow bg-white"
                >
                  <span>
                    Seller: {w.sellerId} – Amount: KES {w.amount} – Status:{" "}
                    {w.status}
                  </span>
                  {w.status === "pending" && (
                    <button
                      onClick={() => approveWithdrawal(w._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                  )}
                </div>
              ))}
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
      <main className="flex-1 p-6 bg-gray-50">{renderContent()}</main>
    </div>
  );
}
