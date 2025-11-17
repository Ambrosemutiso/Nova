"use client";

import { useEffect, useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: "buyer" | "seller";
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [sortKey, setSortKey] = useState<keyof User>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    // fetch users from API
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/user"); // 🔹 API returns { users, pagination }
        const data = await res.json();

        // ✅ Make sure we only keep the array of users
        const usersArray = Array.isArray(data.users) ? data.users : [];
        setUsers(usersArray);
        setFilteredUsers(usersArray);
      } catch (err) {
        console.error("Failed to fetch users", err);
        setUsers([]);
        setFilteredUsers([]);
      }
    };
    fetchUsers();
  }, []);

  // Handle search filter
  useEffect(() => {
    let data = [...users];
    if (search) {
      data = data.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          u.role.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredUsers(data);
    setPage(1);
  }, [search, users]);

  // Handle sorting
  const handleSort = (key: keyof User) => {
    const order = sortKey === key && sortOrder === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortOrder(order);

    const sorted = [...filteredUsers].sort((a, b) => {
      const valA = a[key] || "";
      const valB = b[key] || "";
      if (typeof valA === "string" && typeof valB === "string") {
        return order === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return 0;
    });

    setFilteredUsers(sorted);
  };

  // Pagination
  const startIndex = (page - 1) * perPage;
  const paginatedUsers = Array.isArray(filteredUsers)
    ? filteredUsers.slice(startIndex, startIndex + perPage)
    : [];
  const totalPages = Math.ceil(filteredUsers.length / perPage) || 1;

  return (
    <div className="p-6 pt-11 pb-2">
      {/* Search Input */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded-lg w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full border-collapse">
          <thead className="bg-orange-500 text-white">
            <tr>
              <th
                onClick={() => handleSort("name")}
                className="cursor-pointer px-4 py-2 text-left"
              >
                Name <ArrowUpDown className="inline h-4 w-4" />
              </th>
              <th
                onClick={() => handleSort("email")}
                className="cursor-pointer px-4 py-2 text-left"
              >
                Email <ArrowUpDown className="inline h-4 w-4" />
              </th>
              <th
                onClick={() => handleSort("role")}
                className="cursor-pointer px-4 py-2 text-left"
              >
                Role <ArrowUpDown className="inline h-4 w-4" />
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <tr
                  key={user._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-2 flex items-center gap-2">
                    {user.image && (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="h-8 w-8 rounded-full"
                      />
                    )}
                    {user.name}
                  </td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2 capitalize">{user.role}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-6 text-center" colSpan={3}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="flex items-center gap-1 px-3 py-1 border rounded-md disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="flex items-center gap-1 px-3 py-1 border rounded-md disabled:opacity-50"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
