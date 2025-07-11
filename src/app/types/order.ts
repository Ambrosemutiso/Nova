export type OrderType = {
  _id: string;
  createdAt: string;
  status: string;
  deliveryFee: number;
  items?: {
    name: string;
    quantity: number;
    price: number;
    image: string;
    status?: string;
  }[];
  paymentInfo?: {
    receipt?: string;
    phone?: string;
    amount?: number;
  };
};
