"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { syncWooCommerceToLocalStorage } from "@/lib/cartService";

export interface CartItem {
  id: string;
  name: string;
  price: string;
  rawPrice: number; // Stored as a strict number for mathematical totals
  image: string;
  slug: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  syncCartFromServer: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load existing cart from local storage on initial mount
  useEffect(() => {
    const initializeCart = async () => {
      const savedCart = localStorage.getItem("gg_cart_data");
      
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
          console.log("📦 Cart loaded from localStorage");
        } catch {
          // Error parsing cart data, starting with empty cart
        }
      }
      
      // 🔴 DO NOT auto-sync on app load
      // Let login() handle cart sync to avoid clearing guest cart
      // Only restore from localStorage
      setIsInitialized(true);
    };
    
    initializeCart();
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("gg_cart_data", JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  const addToCart = (newItem: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === newItem.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prevCart, newItem];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const syncCartFromServer = async () => {
    console.log("🔄 Syncing cart from WooCommerce backend...");
    try {
      const syncedCart = await syncWooCommerceToLocalStorage();
      setCart(syncedCart);
      console.log("✅ Cart synced successfully:", syncedCart.length, "items");
    } catch (error) {
      console.error("❌ Error syncing cart from server:", error);
    }
  };

  const cartTotal = cart.reduce((total, item) => total + item.rawPrice * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        syncCartFromServer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }
  return context;
}