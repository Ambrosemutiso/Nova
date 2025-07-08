export type OrderType = {
  _id: string;
  createdAt: string;
  status: string;
  items?: {
    name: string;
    quantity: number;
    calculatedPrice: number;
    image: string;
    status?: string;
  }[];
  paymentInfo?: {
    receipt?: string;
    phone?: string;
    amount?: number;
  };
};
