export type PodiumMaterial =
  | "orange-premium"
  | "blue-glass"
  | "wood"
  | "marble-white"
  | "eco-green"
  | "dark-metallic"
  | "brushed-aluminium";

export interface Product {
  id: string;
  name: string;
  /** transparent PNG, path under /public, e.g. /hero/fashion/1.png */
  image: string;
  price: number;
  rating: number;
  isNew?: boolean;
}

export interface CategoryTheme {
  id: string;
  name: string;
  /** primary accent used for glows, text, particles */
  accent: string;
  /** softer tint of the accent, used for large ambient glows */
  accentSoft: string;
  /** dark contrast color used for shadows / deep gradient stops */
  accentDeep: string;
  podium: PodiumMaterial;
  /** exactly three products, cycled automatically */
  products: [Product, Product, Product];
}
