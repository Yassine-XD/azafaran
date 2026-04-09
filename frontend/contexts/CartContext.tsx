import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/lib/api";
import { useAuth } from "./AuthContext";
import type { CartItem } from "@/lib/types";

const GUEST_CART_KEY = "guest_cart";

export type AppliedPromo = {
  code: string;
  type: string;
  value: number;
  discount_amount: number;
  free_delivery: boolean;
};

type GuestCartItem = {
  id: string; // use variantId as id for guest items
  variant_id: string;
  quantity: number;
  product_name?: string;
  product_image?: string;
  weight_label?: string;
  price?: number;
};

type CartState = {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  isLoading: boolean;
};

type ProductInfo = {
  product_name?: string;
  product_image?: string;
  weight_label?: string;
  price?: number;
};

type CartContextType = CartState & {
  fetchCart: () => Promise<void>;
  addItem: (variantId: string, quantity: number, productInfo?: ProductInfo) => Promise<{ success: boolean; error?: string }>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyPromo: (code: string) => Promise<{ success: boolean; error?: string; data?: any }>;
  appliedPromo: AppliedPromo | null;
  clearPromo: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

// ── Guest cart helpers ──────────────────────────────────────
async function loadGuestCart(): Promise<GuestCartItem[]> {
  try {
    const raw = await AsyncStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveGuestCart(items: GuestCartItem[]): Promise<void> {
  await AsyncStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

async function clearGuestCart(): Promise<void> {
  await AsyncStorage.removeItem(GUEST_CART_KEY);
}

function guestItemsToState(guestItems: GuestCartItem[]): CartState {
  const items: CartItem[] = guestItems.map((g) => ({
    id: g.id,
    cart_id: "guest",
    variant_id: g.variant_id,
    quantity: g.quantity,
    product_name: g.product_name,
    product_image: g.product_image,
    weight_label: g.weight_label,
    price: g.price,
  }));
  const subtotal = items.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  return { items, subtotal, itemCount, isLoading: false };
}

// ── Provider ────────────────────────────────────────────────
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const prevAuth = useRef(isAuthenticated);
  const [state, setState] = useState<CartState>({
    items: [],
    subtotal: 0,
    itemCount: 0,
    isLoading: false,
  });
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);

  // ── Server cart (authenticated) ───────────────────────────
  const fetchServerCart = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true }));
    const res = await api.get("/cart/");
    if (res.success && res.data) {
      const items: CartItem[] = (res.data.items || []).map((i: any) => ({
        id: i.id,
        cart_id: i.cart_id,
        variant_id: i.variant_id,
        quantity: i.quantity,
        product_id: i.product_id,
        product_name: i.product_name,
        product_image: Array.isArray(i.product_images) ? i.product_images[0]?.url : i.product_image,
        weight_label: i.variant_label || i.weight_label,
        price: i.current_price ?? i.price,
        compare_at_price: i.compare_at_price,
        stock_qty: i.stock_qty,
      }));
      const subtotal = items.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0);
      setState({
        items,
        subtotal,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
        isLoading: false,
      });
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  // ── Guest cart (local) ────────────────────────────────────
  const fetchGuestCart = useCallback(async () => {
    const guestItems = await loadGuestCart();
    setState(guestItemsToState(guestItems));
  }, []);

  // ── Merge guest cart into server on login ─────────────────
  const mergeGuestCartToServer = useCallback(async () => {
    const guestItems = await loadGuestCart();
    if (guestItems.length === 0) return;

    // Add each guest item to the server cart
    for (const item of guestItems) {
      await api.post("/cart/items", {
        variant_id: item.variant_id,
        quantity: item.quantity,
      });
    }
    await clearGuestCart();
  }, []);

  // ── React to auth state changes ───────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      // User just logged in — merge guest cart, then fetch server cart
      if (!prevAuth.current) {
        (async () => {
          await mergeGuestCartToServer();
          await fetchServerCart();
        })();
      } else {
        fetchServerCart();
      }
    } else {
      // Guest — load local cart
      fetchGuestCart();
    }
    prevAuth.current = isAuthenticated;
  }, [isAuthenticated, fetchServerCart, fetchGuestCart, mergeGuestCartToServer]);

  // ── Unified fetchCart ─────────────────────────────────────
  const fetchCart = useCallback(async () => {
    if (isAuthenticated) {
      await fetchServerCart();
    } else {
      await fetchGuestCart();
    }
  }, [isAuthenticated, fetchServerCart, fetchGuestCart]);

  // ── Add item ──────────────────────────────────────────────
  const addItem = useCallback(async (variantId: string, quantity: number, productInfo?: ProductInfo) => {
    if (isAuthenticated) {
      const res = await api.post("/cart/items", { variant_id: variantId, quantity });
      if (res.success) {
        setAppliedPromo(null); // Cart changed — promo discount may no longer be valid
        await fetchServerCart();
        return { success: true };
      }
      return { success: false, error: res.error?.message || "Error al añadir al carrito" };
    }

    // Guest — store locally
    const guestItems = await loadGuestCart();
    const existing = guestItems.find((i) => i.variant_id === variantId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      guestItems.push({
        id: variantId,
        variant_id: variantId,
        quantity,
        ...productInfo,
      });
    }
    await saveGuestCart(guestItems);
    setState(guestItemsToState(guestItems));
    return { success: true };
  }, [isAuthenticated, fetchServerCart]);

  // ── Update item quantity ──────────────────────────────────
  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    if (isAuthenticated) {
      await api.put(`/cart/items/${itemId}`, { quantity });
      setAppliedPromo(null); // Cart changed — promo discount may no longer be valid
      await fetchServerCart();
      return;
    }

    // Guest
    let guestItems = await loadGuestCart();
    if (quantity <= 0) {
      guestItems = guestItems.filter((i) => i.id !== itemId);
    } else {
      const item = guestItems.find((i) => i.id === itemId);
      if (item) item.quantity = quantity;
    }
    await saveGuestCart(guestItems);
    setState(guestItemsToState(guestItems));
  }, [isAuthenticated, fetchServerCart]);

  // ── Remove item ───────────────────────────────────────────
  const removeItem = useCallback(async (itemId: string) => {
    if (isAuthenticated) {
      await api.delete(`/cart/items/${itemId}`);
      setAppliedPromo(null); // Cart changed — promo discount may no longer be valid
      await fetchServerCart();
      return;
    }

    // Guest
    const guestItems = (await loadGuestCart()).filter((i) => i.id !== itemId);
    await saveGuestCart(guestItems);
    setState(guestItemsToState(guestItems));
  }, [isAuthenticated, fetchServerCart]);

  // ── Clear cart ────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      await api.delete("/cart/");
    }
    await clearGuestCart();
    setAppliedPromo(null);
    setState({ items: [], subtotal: 0, itemCount: 0, isLoading: false });
  }, [isAuthenticated]);

  // ── Apply promo (auth only) ───────────────────────────────
  const applyPromo = useCallback(async (code: string) => {
    if (!isAuthenticated) {
      return { success: false, error: "Inicia sesión para usar códigos promocionales" };
    }
    const res = await api.post("/cart/apply-promo", { code });
    if (res.success && res.data) {
      setAppliedPromo(res.data as AppliedPromo);
      await fetchServerCart();
      return { success: true, data: res.data };
    }
    return { success: false, error: res.error?.message || "Código no válido" };
  }, [isAuthenticated, fetchServerCart]);

  const clearPromo = useCallback(() => {
    setAppliedPromo(null);
  }, []);

  return (
    <CartContext.Provider value={{ ...state, fetchCart, addItem, updateItem, removeItem, clearCart, applyPromo, appliedPromo, clearPromo }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
