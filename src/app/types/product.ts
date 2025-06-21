// types/product.ts
export interface Product {
  _id: string;
  name: string;
  price: number;
  oldPrice: number;
  category: string;
  county: string;
  town: string;
  quantity: number;
  rating?: number;
  calculatedPrice: number;
  description: string;
  images: string[];
  sellerId: string;
  brand: string;
  model: string;
  material: string;
  color: string;
  keyFeatures: string[]; 
  boxContents: string[];
  warranty: string;
  dimensions: string;
  weight: string;
  createdAt: string;
  updatedAt: string;
}
