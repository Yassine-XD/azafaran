import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./AuthContext";
import type { CartItem } from "@/lib/types";

type CartState = {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  isLoading: boolean;
};

type CartContextType = CartState & {
  fetchCart: () => Promise<void>;
  addItem: (variantId: string, quantity: number) => Promise<{ success: boolean; error?: string }>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyPromo: (code: string) => Promise<{ success: boolean; error?: string; data?: any }>;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<CartState>({
    items: [],
    subtotal: 0,
    itemCount: 0,
    isLoading: false,
  });

  const fetchCart = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true }));
    const res = await api.get("/cart/");
    if (res.success && res.data) {
      const items: CartItem[] = res.data.items || [];
      const subtotal = items.reduce(
        (sum: number, i: CartItem) => sum + (i.price || 0) * i.quantity,
        0,
      );
      setState({
        items,
        subtotal,
        itemCount: items.reduce((sum: number, i: CartItem) => sum + i.quantity, 0),
        isLoading: false,
      });
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  // Fetch cart when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setState({ items: [], subtotal: 0, itemCount: 0, isLoading: false });
    }
  }, [isAuthenticated, fetchCart]);

  const addItem = useCallback(async (variantId: string, quantity: number) => {
    const res = await api.post("/cart/items", { variant_id: variantId, quantity });
    if (res.success) {
      await fetchCart();
      return { success: true };
    }
    return { success: false, error: res.error?.message || "Error al añadir al carrito" };
  }, [fetchCart]);

  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    await api.put(`/cart/items/${itemId}`, { quantity });
    await fetchCart();
  }, [fetchCart]);

  const removeItem = useCallback(async (itemId: string) => {
    await api.delete(`/cart/items/${itemId}`);
    await fetchCart();
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    await api.delete("/cart/");
    setState({ items: [], subtotal: 0, itemCount: 0, isLoading: false });
  }, []);

  const applyPromo = useCallback(async (code: string) => {
    const res = await api.post("/cart/apply-promo", { code });
    if (res.success) {
      await fetchCart();
      return { success: true, data: res.data };
    }
    return { success: false, error: res.error?.message || "Código no válido" };
  }, [fetchCart]);

  return (
    <CartContext.Provider value={{ ...state, fetchCart, addItem, updateItem, removeItem, clearCart, applyPromo }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
