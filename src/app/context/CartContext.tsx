'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import toast from 'react-hot-toast';

const CART_KEY = 'cart_items';

// 1. Type definition for a cart item
export interface CartItem {
  id: string;
  name: string;
  images: string[];
  calculatedPrice: number;
  quantity: number;
  county: string;
  model: string;
  brand: string;
}


// 2. Type definition for the cart context
type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
};

// 3. Create the context with proper typing
const CartContext = createContext<CartContextType | undefined>(undefined);

// 4. Provider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const storedCart = localStorage.getItem(CART_KEY);
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: CartItem) => {
    const existing = cartItems.find((i) => i.id === item.id);
    if (existing) {
      increaseQuantity(item.id);
      toast.success(`Increased quantity of ${item.name}`);
    } else {
      setCartItems((prev) => [...prev, { ...item, quantity: 1 }]);
      toast.success(`${item.name} added to cart`);
    }
  };

  const removeFromCart = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    setCartItems((prev) => prev.filter((i) => i.id !== id));
    toast.error(`${item?.name || 'Item'} removed from cart`);
  };

  const increaseQuantity = (id: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    if (item?.quantity === 1) {
      toast.error('Minimum quantity is 1');
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        setCartItems,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// 5. Hook with return type
export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
