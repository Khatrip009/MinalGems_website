// src/context/CartContext.tsx
import React, { createContext, useState, useEffect } from "react";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} from "../api/cart.api";
import type { Cart } from "../api/types";

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addItem: (product_id: string, quantity?: number) => Promise<void>;
  updateItemQty: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
}

export const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  // Load cart initially
  async function refreshCart() {
    setLoading(true);
    try {
      const res = await getCart(); // { ok, cart }
      if (res.ok) {
        setCart(res.cart);
      } else {
        setCart(null);
      }
    } catch (err) {
      console.error("refreshCart failed:", err);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }

  // Add item
  async function addItem(product_id: string, quantity: number = 1) {
    try {
      const res = await addToCart(product_id, quantity); // { ok, cart }
      if (res.ok) {
        setCart(res.cart);
      }
    } catch (err) {
      console.error("addItem failed:", err);
    }
  }

  // Update quantity
  async function updateItemQty(itemId: string, quantity: number) {
    try {
      const res = await updateCartItem(itemId, quantity); // { ok, cart }
      if (res.ok) {
        setCart(res.cart);
      }
    } catch (err) {
      console.error("updateItemQty failed:", err);
    }
  }

  // Remove item
  async function removeItem(itemId: string) {
    try {
      const res = await removeCartItem(itemId); // { ok, cart }
      if (res.ok) {
        setCart(res.cart);
      }
    } catch (err) {
      console.error("removeItem failed:", err);
    }
  }

  useEffect(() => {
    refreshCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        refreshCart,
        addItem,
        updateItemQty,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
