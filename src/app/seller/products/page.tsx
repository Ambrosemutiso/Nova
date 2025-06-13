'use client';

import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import { useAuth } from '@/app/context/AuthContext';
import { CldImage } from 'next-cloudinary';

// Set the app element dynamically
if (typeof window !== 'undefined') {
  Modal.setAppElement(document.getElementById('__next') as HTMLElement);
}

// Define the Product type
type Product = {
  _id: string;
  name: string;
  oldPrice: number;
  category: string;
  description: string;
  images: string[];
  price: number;
};

export default function SellerProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const res = await fetch(`/api/products/${user.uid}`);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data.products);
      } catch (err) {
        console.error(err);
        toast.error('Error fetching products');
      }
    })();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-6">Your Products</h2>

      <div className="overflow-x-auto">
        <table className="w-full border border-red-300 text-left">
          <thead>
            <tr className="border-b border-red-300 text-sm text-gray-700 uppercase">
              <th className="p-3">Product</th>
              <th className="p-3">Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Category</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Edit</th>
              <th className="p-3">Delete</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-b border-red-300">
                <td className="p-3">
                  <div className="flex gap-2 overflow-x-scroll scrollbar-hide">
                    {product.images?.map((imageUrl, index) => (
                      <CldImage
                        key={index}
                        src={imageUrl.replace(/^https?:\/\/res\.cloudinary\.com\/[\w-]+\/image\/upload\//, '').replace(/\/v\d+\//, '/')}
                        alt={product.name}
                        width="20"
                        height="20"
                        crop="fill"
                        className="rounded-md"
                      />
                    ))}
                  </div>
                </td>
                <td className="p-3">{product.name}</td>
                <td className="p-3">Ksh.{product.oldPrice}</td>
                <td className="p-3">{product.category}</td>
                <td className="p-3">{product.description}</td>
                <td className="p-3">
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsEditModalOpen(true);
                    }}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsDeleteModalOpen(true);
                    }}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setIsDeleteModalOpen(false)}
        className="bg-white p-4 rounded shadow-md max-w-md mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete {selectedProduct?.name}?</p>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="bg-gray-300 px-3 py-1 rounded"
          >
            Cancel
          </button>
          <button className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        className="bg-white p-4 rounded shadow-md max-w-md mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <h2>Edit Product</h2>
        <div className="mt-4">
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm">Product Name</label>
            <input
              type="text"
              id="name"
              className="border p-2 rounded w-full"
              value={selectedProduct?.name || ''}
              onChange={(e) =>
                setSelectedProduct((prev) => prev ? { ...prev, name: e.target.value } : null)
              }
            />
          </div>
          <div className="mb-4">
            <label htmlFor="price" className="block text-sm">Price</label>
            <input
              type="number"
              id="price"
              className="border p-2 rounded w-full"
              value={selectedProduct?.price || ''}
              onChange={(e) =>
                setSelectedProduct((prev) => prev ? { ...prev, price: parseFloat(e.target.value) } : null)
              }
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="bg-gray-300 px-3 py-1 rounded"
            >
              Cancel
            </button>
            <button className="bg-blue-500 text-white px-3 py-1 rounded">Save Changes</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
