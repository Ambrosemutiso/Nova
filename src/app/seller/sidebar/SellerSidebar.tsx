'use client';
import { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface Props {
  onClose: () => void;
}

export default function SellerSidebar({ onClose }: Props) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Start animation after mount
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Match transition duration
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 transition-opacity duration-300 z-40 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-md p-4 z-50 transform transition-transform duration-300 ${
          isVisible ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-end mb-4">
          <button onClick={handleClose} className="text-gray-500 hover:text-red-500">
            <FiX size={24} />
          </button>
        </div>

        <nav className="flex flex-col gap-4">
        <button
            onClick={() => {
              router.push('/seller/dashboard');
              handleClose();
            }}
            className="text-left text-gray-700 hover:text-orange-500"
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              router.push('/seller/products/add');
              handleClose();
            }}
            className="text-left text-gray-700 hover:text-orange-500"
          >
            Add Product
          </button>
          <button
            onClick={() => {
              router.push('/seller/products');
              handleClose();
            }}
            className="text-left text-gray-700 hover:text-orange-500"
          >
            Products
          </button>
          <button
            onClick={() => {
              router.push('/seller/orders');
              handleClose();
            }}
            className="text-left text-gray-700 hover:text-orange-500"
          >
            Orders
          </button>
          <button
            onClick={() => {
              router.push('/seller/analytics');
              handleClose();
            }}
            className="text-left text-gray-700 hover:text-orange-500"
          >
            Analytics
          </button>
        </nav>
      </aside>
    </>
  );
}
