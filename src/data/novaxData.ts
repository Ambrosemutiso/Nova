import { CategoryTheme } from "@/app/types/novax";

/**
 * The single source of truth for the hero.
 * Add/remove/reorder categories or products here — every visual
 * (podium material, glow color, particle color, background lighting)
 * follows automatically. No component needs to change.
 */
export const novaxData: CategoryTheme[] = [
  {
    id: "fashion",
    name: "Fashion",
    accent: "#ff6b35",
    accentSoft: "#ffb088",
    accentDeep: "#b8420a",
    podium: "orange-premium",
    products: [
      { id: "fashion-1", name: "Aria Wrap Jacket", image: "/hero/fashion/1.png", price: 189, rating: 4.9, isNew: true },
      { id: "fashion-2", name: "Studio Denim Set", image: "/hero/fashion/2.png", price: 159, rating: 4.8 },
      { id: "fashion-3", name: "Heritage Trench", image: "/hero/fashion/3.png", price: 229, rating: 4.9 },
    ],
  },
  {
    id: "electronics",
    name: "Electronics",
    accent: "#2f80ff",
    accentSoft: "#9dc2ff",
    accentDeep: "#0a3fa8",
    podium: "blue-glass",
    products: [
      { id: "electronics-1", name: "Nova Buds Pro", image: "/hero/electronics/1.png", price: 149, rating: 4.8, isNew: true },
      { id: "electronics-2", name: "Pulse Smartwatch", image: "/hero/electronics/2.png", price: 249, rating: 4.7 },
      { id: "electronics-3", name: "Aero Laptop 14", image: "/hero/electronics/3.png", price: 1299, rating: 4.9 },
    ],
  },
  {
    id: "furniture",
    name: "Furniture",
    accent: "#a5682f",
    accentSoft: "#d9b18a",
    accentDeep: "#5c3617",
    podium: "wood",
    products: [
      { id: "furniture-1", name: "Kaia Lounge Chair", image: "/hero/furniture/1.png", price: 449, rating: 4.9 },
      { id: "furniture-2", name: "Oakline Side Table", image: "/hero/furniture/2.png", price: 189, rating: 4.7 },
      { id: "furniture-3", name: "Elm Reading Lamp", image: "/hero/furniture/3.png", price: 99, rating: 4.6, isNew: true },
    ],
  },
  {
    id: "beauty",
    name: "Beauty",
    accent: "#e8a0a0",
    accentSoft: "#f6d4d4",
    accentDeep: "#9c4b56",
    podium: "marble-white",
    products: [
      { id: "beauty-1", name: "Silk Serum Duo", image: "/hero/beauty/1.png", price: 79, rating: 4.9, isNew: true },
      { id: "beauty-2", name: "Rose Glow Palette", image: "/hero/beauty/2.png", price: 59, rating: 4.8 },
      { id: "beauty-3", name: "Velvet Matte Kit", image: "/hero/beauty/3.png", price: 69, rating: 4.7 },
    ],
  },
  {
    id: "groceries",
    name: "Groceries",
    accent: "#3fa65a",
    accentSoft: "#a6dcb4",
    accentDeep: "#1f5c34",
    podium: "eco-green",
    products: [
      { id: "groceries-1", name: "Harvest Fresh Box", image: "/hero/groceries/1.png", price: 39, rating: 4.8, isNew: true },
      { id: "groceries-2", name: "Cold-Press Juice Set", image: "/hero/groceries/2.png", price: 29, rating: 4.7 },
      { id: "groceries-3", name: "Artisan Pantry Crate", image: "/hero/groceries/3.png", price: 49, rating: 4.9 },
    ],
  },
  {
    id: "automotive",
    name: "Automotive",
    accent: "#c1272d",
    accentSoft: "#e59a9d",
    accentDeep: "#5c0f13",
    podium: "dark-metallic",
    products: [
      { id: "automotive-1", name: "Carbon Roof Rack", image: "/hero/automotive/1.png", price: 219, rating: 4.6 },
      { id: "automotive-2", name: "Pro Dash Cam", image: "/hero/automotive/2.png", price: 129, rating: 4.8, isNew: true },
      { id: "automotive-3", name: "Alloy Wheel Set", image: "/hero/automotive/3.png", price: 899, rating: 4.9 },
    ],
  },
  {
    id: "home-appliances",
    name: "Home Appliances",
    accent: "#8a94a6",
    accentSoft: "#d4d9e0",
    accentDeep: "#40485a",
    podium: "brushed-aluminium",
    products: [
      { id: "appliance-1", name: "Aria Espresso Machine", image: "/hero/appliances/1.png", price: 349, rating: 4.9, isNew: true },
      { id: "appliance-2", name: "Quiet Blend Pro", image: "/hero/appliances/2.png", price: 129, rating: 4.7 },
      { id: "appliance-3", name: "Aero Air Purifier", image: "/hero/appliances/3.png", price: 259, rating: 4.8 },
    ],
  },
];
