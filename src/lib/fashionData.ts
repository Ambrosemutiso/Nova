import { Category } from "@/app/types/fashion";

/**
 * All hero data lives here. No API calls, no backend.
 * Drop matching images into /public/hero/<category>/1.jpg, 2.jpg, 3.jpg
 * (see README in this folder for the expected file names).
 */
export const fashionData: Category[] = [
  {
    id: "sneakers",
    name: "Sneakers",
    badge: "NEW",
    glow: "from-[#ff6b00] via-[#ff8a3d] to-[#ffb066]",
    products: [
      { id: "sneaker-1", name: "Air Glide Runner", image: "/hero/sneakers/1.png", price: 129 },
      { id: "sneaker-2", name: "Urban Flex Low", image: "/hero/sneakers/2.png", price: 149 },
      { id: "sneaker-3", name: "Cloud Step Pro", image: "/hero/sneakers/3.png", price: 139 },
    ],
  },
  {
    id: "womens-fashion",
    name: "Women's Fashion",
    badge: "TRENDING",
    glow: "from-[#ff6b00] via-[#ff9a56] to-[#ffc38a]",
    products: [
      { id: "women-1", name: "Draped Silk Set", image: "/hero/womens/1.png", price: 189 },
      { id: "women-2", name: "Studio Wrap Coat", image: "/hero/womens/2.png", price: 219 },
      { id: "women-3", name: "Essential Knit Dress", image: "/hero/womens/3.png", price: 159 },
    ],
  },
  {
    id: "bags",
    name: "Bags",
    badge: "LIMITED",
    glow: "from-[#ff6b00] via-[#ff7d3d] to-[#ffa45c]",
    products: [
      { id: "bag-1", name: "Atelier Tote", image: "/hero/bags/1.png", price: 249 },
      { id: "bag-2", name: "Mono Crossbody", image: "/hero/bags/2.png", price: 179 },
      { id: "bag-3", name: "Structured Weekender", image: "/hero/bags/3.png", price: 289 },
    ],
  },
  {
    id: "watches",
    name: "Watches",
    badge: "ICONIC",
    glow: "from-[#ff6b00] via-[#ffab40] to-[#ffd08a]",
    products: [
      { id: "watch-1", name: "Meridian Chrono", image: "/hero/watches/1.png", price: 349 },
      { id: "watch-2", name: "Aero Steel", image: "/hero/watches/2.png", price: 299 },
      { id: "watch-3", name: "Minimal Line", image: "/hero/watches/3.png", price: 259 },
    ],
  },
  {
    id: "accessories",
    name: "Accessories",
    badge: "EDIT",
    glow: "from-[#ff6b00] via-[#ff8f4d] to-[#ffbb80]",
    products: [
      { id: "acc-1", name: "Layered Chain Set", image: "/hero/accessories/1.png", price: 89 },
      { id: "acc-2", name: "Signature Cap", image: "/hero/accessories/2.png", price: 59 },
      { id: "acc-3", name: "Leather Belt", image: "/hero/accessories/3.png", price: 69 },
    ],
  },
];
