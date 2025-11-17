"use client";

import { useEffect, useState } from "react";

interface Transaction {
  _id: string;
  phone: number;
  amount: number;
  status: string;
  transactionDate: string;
  mpesaReceiptNumber: string;
  createdAt: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [status, setStatus] = useState("");
  const [phone, setPhone] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, [page, sortField, sortOrder, status, phone, from, to]);

  const fetchTransactions = async () => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "10",
      sortField,
      sortOrder,
    });
    if (status) params.append("status", status);
    if (phone) params.append("phone", phone);
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const res = await fetch(`/api/admin/transactions?${params.toString()}`);
    const data = await res.json();
    setTransactions(data.transactions);
    setTotalPages(data.totalPages);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Transactions</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Filter by phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border p-2 rounded"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="Success">Success</option>
          <option value="Failed">Failed</option>
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {/* Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th
              className="p-2 cursor-pointer"
              onClick={() => {
                setSortField("phone");
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              }}
            >
              Phone
            </th>
            <th className="p-2">Amount</th>
            <th
              className="p-2 cursor-pointer"
              onClick={() => {
                setSortField("createdAt");
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              }}
            >
              Date
            </th>
            <th className="p-2">Receipt</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx._id} className="border-t">
              <td className="p-2">{tx.phone}</td>
              <td className="p-2">{tx.amount}</td>
              <td className="p-2">
                {new Date(tx.createdAt).toLocaleString()}
              </td>
              <td className="p-2">{tx.mpesaReceiptNumber}</td>
              <td className="p-2">{tx.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
