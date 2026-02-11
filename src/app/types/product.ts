// types/product.ts
export interface ProductType {
  _id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice: number;
  category: string;
  condition: string;
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
  fulfillmentMode: string;
  keyFeatures: string[]; 
  boxContents: string[];
  warranty: string;
  dimensions: string;
  weight: number;
  createdAt: string;
  updatedAt: string;
  averageRating: number;
  currency: string;
  reviewCount: number;
  installmentEnabled: boolean;
  installmentDepositPercent: number;
  installmentMonths: number;
  installmentPolicy: string;
}

