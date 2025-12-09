'use client';

import { useState } from "react";
import { CldImage } from "next-cloudinary";
import { Product } from "@/app/types/product";
import InstallmentModal from "./InstallmentModal";

interface InstallmentProductCardProps {
  product: Product;
}

export default function InstallmentProductCard({ product }: InstallmentProductCardProps) {
  const [showModal, setShowModal] = useState(false);

  const getPublicId = (url: string) => {
    const regex = /\/upload\/(?:v\d+\/)?([^\.]+)/;
    const match = url.match(regex);
    return match ? match[1] : url;
  };

  const monthlyPayment = Math.round(product.calculatedPrice / 6); // default preview

  return (
    <>
      {/* PRODUCT CARD */}
      <div className="border rounded-lg p-3 shadow hover:shadow-lg transition bg-white">
        {/* Image */}
        <div onClick={() => setShowModal(true)} className="cursor-pointer">
          <CldImage
            src={getPublicId(product.images[0])}
            alt={product.name}
            width="300"
            height="300"
            crop="fill"
            className="w-full h-40 object-cover rounded"
          />
        </div>

        {/* Name */}
        <h3 className="mt-2 text-sm font-medium text-gray-800 line-clamp-2">
          {product.name}
        </h3>

        {/* Prices */}
        <div className="mt-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="line-through text-gray-400 text-xs">
              Ksh.{product.oldPrice.toLocaleString()}
            </span>
            <span className="text-red-600 font-bold">
              Ksh.{product.calculatedPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Monthly Payment Preview */}
        <p className="text-xs text-gray-600 mt-1">
          From <span className="text-black font-semibold">
            Ksh.{monthlyPayment.toLocaleString()}
          </span>{" "}
          / month
        </p>

        {/* ACTIVATE INSTALLMENT BUTTON */}
        <button
          onClick={() => setShowModal(true)}
          className="mt-3 w-full bg-orange-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-orange-700 transition"
        >
          Activate Installment Plan
        </button>
      </div>

      {/* INSTALLMENT MODAL */}
      {showModal && (
        <InstallmentModal
          product={product}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
