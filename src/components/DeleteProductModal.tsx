'use client';

interface DeleteProductModalProps {
  productId: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteProductModal({ productId, onClose, onConfirm }: DeleteProductModalProps) {
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/seller/products/${productId}`, {
        method: 'DELETE',
      });

      const json = await res.json();
      if (json.success) {
        onConfirm();
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[90%] md:w-[400px] shadow-lg">
        <h2 className="text-lg font-semibold mb-4 text-red-600">Confirm Deletion</h2>
        <p className="mb-6 text-gray-700">Are you sure you want to delete this product?</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400">
            Cancel
          </button>
          <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
