"use client";

import { useEffect, useState } from "react";
import { Users, Store, Package, Wallet, LogOut } from "lucide-react";
import { toast } from "react-toastify";
import { Product } from "@/app/types/product";

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

interface Withdrawal {
  _id: string;
  sellerId: string;
  amount: number;
  status: string; // pending | approved
}

// ✅ New Report type
interface Report {
  _id: string;
  productId: {
    _id: string;
    name: string;
    sellerId: {
      _id: string;
      name?: string;
      email?: string;
      shopName?: string;
    };
  };
  userId: string;
  reason: string;
  message?: string;
  screenshot?: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<User[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]); // ✅ typed now

  // search + sorting state for products
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Product | null;
    direction: "asc" | "desc";
  }>({
    key: null,
    direction: "asc",
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
const [usersRes, sellersRes, productsRes, withdrawalsRes, reportsRes] =
  await Promise.all([
    fetch("/api/users"),
    fetch("/api/sellers"),
    fetch("/api/products/admin"),
    fetch("/api/withdrawal"),
    fetch("/api/reports"), // 👈 new
  ]);

setReports(await reportsRes.json());


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
      const res = await fetch(`/api/withdrawal/${id}`, { method: "POST" });
      if (!res.ok) throw new Error("Approval failed");

      toast.success("Withdrawal approved ✅");

      setWithdrawals((prev) =>
        prev.map((w) => (w._id === id ? { ...w, status: "approved" } : w))
      );
    } catch (err) {
      toast.error("Error approving withdrawal");
    }
  };

  // Sorting handler
  const handleSort = (key: keyof Product) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Sorted + filtered products
  const sortedProducts = [...products].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valueA = a[sortConfig.key] ?? "";
    const valueB = b[sortConfig.key] ?? "";
    if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const filteredProducts = sortedProducts.filter((p) =>
    Object.values(p).join(" ").toLowerCase().includes(search.toLowerCase())
  );

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
                  <th className="border p-2">Email</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((s) => (
                  <tr key={s._id}>
                    <td className="border p-2">{s._id}</td>
                    <td className="border p-2">{s.name}</td>
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

            {/* Search */}
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-3 py-2 mb-4 w-full rounded-md"
            />

            <div className="overflow-x-auto">
              <table className="w-full border rounded-lg bg-white shadow">
                <thead>
                  <tr className="bg-gray-100">
                    <th
                      className="border p-2 cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      Name
                    </th>
                    <th
                      className="border p-2 cursor-pointer"
                      onClick={() => handleSort("brand")}
                    >
                      Brand
                    </th>
                    <th
                      className="border p-2 cursor-pointer"
                      onClick={() => handleSort("price")}
                    >
                      Price
                    </th>
                    <th
                      className="border p-2 cursor-pointer"
                      onClick={() => handleSort("county")}
                    >
                      Location
                    </th>
                    <th
                      className="border p-2 cursor-pointer"
                      onClick={() => handleSort("createdAt")}
                    >
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="border p-2">{p.name}</td>
                      <td className="border p-2">{p.brand || "—"}</td>
                      <td className="border p-2">
                        KES {p.calculatedPrice ?? p.price}
                      </td>
                      <td className="border p-2">
                        {p.county}, {p.town}
                      </td>
                      <td className="border p-2">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
case "withdrawals":
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Withdrawal Requests</h2>
      <div className="space-y-4">
        {withdrawals && withdrawals.length > 0 ? (
          withdrawals.map((w: {
            _id: string;
            sellerId:
              | string
              | {
                  _id: string;
                  name?: string;
                  email?: string;
                };
            amount: number;
            status: string;
          }) => (
            <div
              key={w._id}
              className="flex justify-between items-center border p-4 rounded shadow bg-white"
            >
              <span>
                Seller:{" "}
                {typeof w.sellerId === "object"
                  ? w.sellerId.name ??
                    w.sellerId.email ??
                    w.sellerId._id
                  : w.sellerId}
                {" – "}Amount: KES {w.amount}{" – "}Status: {w.status}
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
          ))
        ) : (
          <p className="text-gray-500">No withdrawal requests yet.</p>
        )}
      </div>
    </div>
  );
 case "reports":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Reported Products</h2>
            <div className="space-y-4">
              {reports.length > 0 ? (
                reports.map((r) => (
                  <div
                    key={r._id}
                    className="border p-4 rounded shadow bg-white flex justify-between items-center"
                  >
                    <span>
                      <strong>{r.productId.name}</strong> — Reported for:{" "}
                      {r.reason}
                      <br />
                      Seller:{" "}
                      {r.productId.sellerId.name ||
                        r.productId.sellerId.shopName}{" "}
                      ({r.productId.sellerId.email})
                    </span>
                    <button
                      onClick={async () => {
                        const res = await fetch(
                          `/api/reports/${r._id}/notify`,
                          {
                            method: "POST",
                          }
                        );
                        if (res.ok) {
                          toast.success("Seller notified & product flagged");
                        } else {
                          toast.error("Failed to notify seller");
                        }
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Notify Seller
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No reports yet.</p>
              )}
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
          <button
  onClick={() => setActiveTab("reports")}
  className={`flex items-center gap-2 p-2 w-full text-left rounded hover:bg-gray-700 ${
    activeTab === "reports" ? "bg-gray-700" : ""
  }`}
>
  🚨 Reports
</button>

        </nav>
        <div className="p-4 border-t border-gray-700">
          <button className="flex items-center gap-2 w-full p-2 rounded hover:bg-orange-600 bg-orange-500 text-white">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-50">{renderContent()}</main>
    </div>
  );
}
