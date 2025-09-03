"use client";

import { useEffect, useState } from "react";

interface Seller {
  _id: string;
  name: string;
  email: string;
  shopName: string;
  isVerified: boolean;
  createdAt: string;
}

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const fetchSellers = async () => {
      setLoading(true);
      const res = await fetch(
        `/api/admin/sellers?search=${search}&sortBy=${sortBy}&order=${order}&page=${page}&limit=10`
      );
      const data = await res.json();
      setSellers(data.data);
      setPages(data.pagination.pages);
      setLoading(false);
    };
    fetchSellers();
  }, [search, sortBy, order, page]);

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search sellers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-64"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="createdAt">Created At</option>
          <option value="name">Name</option>
          <option value="email">Email</option>
          <option value="shopName">Shop Name</option>
        </select>

        <select
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Shop Name</th>
              <th className="p-3 border">Verified</th>
              <th className="p-3 border">Created At</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : sellers.length > 0 ? (
              sellers.map((seller) => (
                <tr key={seller._id} className="hover:bg-gray-50">
                  <td className="p-3 border">{seller.name}</td>
                  <td className="p-3 border">{seller.email}</td>
                  <td className="p-3 border">{seller.shopName}</td>
                  <td className="p-3 border">
                    {seller.isVerified ? (
                      <span className="text-green-600 font-medium">Yes</span>
                    ) : (
                      <span className="text-red-600 font-medium">No</span>
                    )}
                  </td>
                  <td className="p-3 border">
                    {new Date(seller.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  No sellers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: pages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 border rounded ${
              page === i + 1 ? "bg-blue-500 text-white" : "bg-white"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
