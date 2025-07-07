export type OrderType = {
  _id: string;
  createdAt: string;
  status: string;
  items?: {
    name: string;
    quantity: number;
    price: number;
  }[];
  paymentInfo?: {
    receipt?: string;
    phone?: string;
    amount?: number;
  };
};
