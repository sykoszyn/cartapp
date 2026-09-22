"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { CartItem } from "@/lib/types";

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, qty: number) => void;
  quantityOf: (productId: string) => number;
  clear: () => void;
  subtotal: number;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  businessId,
  children,
}: {
  businessId: string;
  children: React.ReactNode;
}) {
  const storageKey = `qrcartapp:cart:${businessId}`;
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // localStorage no disponible, seguimos con carrito vacío
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // ignorado
    }
  }, [items, hydrated, storageKey]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const setQuantity = useCallback((productId: string, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((i) => i.productId !== productId);
      return prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i));
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const quantityOf = (productId: string) =>
    items.find((i) => i.productId === productId)?.quantity ?? 0;

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, setQuantity, quantityOf, clear, subtotal, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
