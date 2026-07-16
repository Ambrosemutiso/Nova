export interface Product {
  id: string;
  name: string;
  /** Path under /public, e.g. /hero/sneakers/1.png */
  image: string;
  price: number;
}

export interface Category {
  id: string;
  name: string;
  /** exactly three products per category */
  products: [Product, Product, Product];
  /** small badge text shown on the card, e.g. "NEW" */
  badge: string;
  /** tailwind gradient classes used for the platform glow behind the product */
  glow: string;
}
