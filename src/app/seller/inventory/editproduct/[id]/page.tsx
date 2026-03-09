//app/seller/inventory/editproduct/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import type { ProductType } from "@/app/types/product";
import { categoryTree } from "@/lib/productCategories";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/seller/products/${id}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.product);
        } else {
          toast.error('Product not found');
        }
      } catch (err) {
        toast.error('Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);
  useEffect(() => {
  if (!product?.category) return;

  const subs = Object.keys(
    categoryTree[product.category as keyof typeof categoryTree] || {}
  );

  setSubcategories(subs);
}, [product?.category]);

useEffect(() => {
  if (!product?.category || !product?.subcategory) return;

  const category = product.category as keyof typeof categoryTree;

  const subcategoryMap = categoryTree[category];

  const types =
    subcategoryMap[
      product.subcategory as keyof typeof subcategoryMap
    ] || [];

  setProductTypes(types as string[]);
}, [product?.category, product?.subcategory]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    try {
      const res = await fetch(`/api/seller/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });

      const json = await res.json();
      if (json.success) {
        toast.success('Product updated!');
        setTimeout(() => router.push('/seller/inventory'), 1500);
      } else {
        toast.error(json.message || 'Failed to update product');
      }
    } catch (err) {
      toast.error('Error updating product');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!product) return;
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  if (loading) return <p className="mt-24 px-4">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-6xl mx-auto px-4 pt-28 pb-10">
      <h1 className="text-2xl font-bold text-orange-600 mb-4">Edit Product</h1>
      {product && (
        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            placeholder="Product name"
            className="w-full border rounded px-3 py-2"
          />
<select
  name="category"
  value={product.category || ""}
  onChange={handleChange}
  className="w-full border rounded px-3 py-2"
>
  <option value="">Select Category</option>

  {Object.keys(categoryTree).map((cat) => (
    <option key={cat} value={cat}>
      {cat}
    </option>
  ))}
</select>
<select
  name="subcategory"
  value={product.subcategory || ""}
  onChange={handleChange}
  className="w-full border rounded px-3 py-2"
>
  <option value="">Select Subcategory</option>

  {subcategories.map((sub) => (
    <option key={sub} value={sub}>
      {sub}
    </option>
  ))}
</select>
<select
  name="productType"
  value={product.productType || ""}
  onChange={handleChange}
  className="w-full border rounded px-3 py-2"
>
  <option value="">Select Product Type</option>

  {productTypes.map((type) => (
    <option key={type} value={type}>
      {type}
    </option>
  ))}
</select>
          <input
            type="number"
            name="price"
            value={product.calculatedPrice}
            onChange={handleChange}
            placeholder="Price"
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="number"
            name="quantity"
            value={product.quantity}
            onChange={handleChange}
            placeholder="Quantity"
            className="w-full border rounded px-3 py-2"
          />
          <button
            type="submit"
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
          >
            Update Product
          </button>
        </form>
      )}
    </div>
    </div>
  );
}
