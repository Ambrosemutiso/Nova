"use client";

import { useEffect, useState } from "react";

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  createdAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const limit = 5;

  useEffect(() => {
    fetchProducts();
  }, [page, search, category, sortBy, order, minPrice, maxPrice]);

  const fetchProducts = async () => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      category,
      sortBy,
      order,
      ...(minPrice ? { minPrice } : {}),
      ...(maxPrice ? { maxPrice } : {}),
    });

    const res = await fetch(`/api/admin/products?${params}`);
    const data = await res.json();

    setProducts(data.products);
    setTotalPages(data.totalPages);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Products</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Fashion">Fashion</option>
        </select>

        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="border p-2 rounded w-24"
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="border p-2 rounded w-24"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="createdAt">Newest</option>
          <option value="price">Price</option>
          <option value="name">Name</option>
        </select>

        <select
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>

      {/* Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Category</th>
            <th className="p-2 border">Price</th>
            <th className="p-2 border">Created</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td className="p-2 border">{p.name}</td>
              <td className="p-2 border">{p.category}</td>
              <td className="p-2 border">${p.price}</td>
              <td className="p-2 border">
                {new Date(p.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                No products found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
