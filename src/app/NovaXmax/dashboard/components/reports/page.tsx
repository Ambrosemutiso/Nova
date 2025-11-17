"use client";

import { useEffect, useState } from "react";

interface Report {
  _id: string;
  productId: string;
  userId: string;
  reason: string;
  message?: string;
  screenshot?: string;
  createdAt: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [reason, setReason] = useState("");
  const [sort, setSort] = useState("desc");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchReports = async () => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sort,
    });
    if (reason) params.append("reason", reason);
    if (fromDate) params.append("from", fromDate);
    if (toDate) params.append("to", toDate);

    const res = await fetch(`/api/admin/reports?${params.toString()}`);
    const data = await res.json();
    setReports(data.reports);
    setTotalPages(data.totalPages);
  };

  useEffect(() => {
    fetchReports();
  }, [page, sort]);

  const handleClearFilters = () => {
    setReason("");
    setFromDate("");
    setToDate("");
    setSort("desc");
    setPage(1);
    fetchReports();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Reports</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Filter by reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
        <button
          onClick={() => {
            setPage(1);
            fetchReports();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Apply Filters
        </button>
        <button
          onClick={handleClearFilters}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Clear Filters
        </button>
      </div>

      {/* Reports Table */}
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Product</th>
            <th className="border px-4 py-2">User</th>
            <th className="border px-4 py-2">Reason</th>
            <th className="border px-4 py-2">Message</th>
            <th className="border px-4 py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r._id}>
              <td className="border px-4 py-2">{r.productId}</td>
              <td className="border px-4 py-2">{r.userId}</td>
              <td className="border px-4 py-2">{r.reason}</td>
              <td className="border px-4 py-2">{r.message}</td>
              <td className="border px-4 py-2">
                {new Date(r.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
