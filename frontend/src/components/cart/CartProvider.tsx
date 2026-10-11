"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartItem {
  productId: number;
  slug: string;
  name: string;
  price: number;
  currency: string;
  sizeCode: string;
  quantity: number;
  imageUrl: string | null;
}

export type NewCartItem = Omit<CartItem, "quantity">;

interface CartContextValue {
  items: CartItem[];
  /** False until localStorage has been read (avoids hydration mismatches). */
  ready: boolean;
  count: number;
  subtotal: number;
  currency: string;
  addItem: (item: NewCartItem, quantity?: number) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

const STORAGE_KEY = "malanka.cart.v1";

const CartContext = createContext<CartContextValue | null>(null);

export function cartItemKey(productId: number, sizeCode: string): string {
  return `${productId}::${sizeCode}`;
}

function normalize(items: CartItem[]): CartItem[] {
  if (!Array.isArray(items)) return [];
  return items.filter(
    (item) =>
      item &&
      typeof item.productId === "number" &&
      typeof item.sizeCode === "string" &&
      typeof item.quantity === "number" &&
      item.quantity > 0,
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  // Load once on the client.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(normalize(JSON.parse(raw) as CartItem[]));
    } catch {
      // ignore malformed / unavailable storage
    }
    setReady(true);
  }, []);

  // Persist after the initial read.
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota / unavailable storage
    }
  }, [items, ready]);

  const addItem = useCallback((item: NewCartItem, quantity = 1) => {
    setItems((current) => {
      const key = cartItemKey(item.productId, item.sizeCode);
      const existing = current.find(
        (entry) => cartItemKey(entry.productId, entry.sizeCode) === key,
      );
      if (existing) {
        return current.map((entry) =>
          cartItemKey(entry.productId, entry.sizeCode) === key
            ? { ...entry, quantity: entry.quantity + quantity }
            : entry,
        );
      }
      return [...current, { ...item, quantity }];
    });
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((current) =>
      current
        .map((entry) =>
          cartItemKey(entry.productId, entry.sizeCode) === key
            ? { ...entry, quantity: Math.max(0, quantity) }
            : entry,
        )
        .filter((entry) => entry.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((current) =>
      current.filter(
        (entry) => cartItemKey(entry.productId, entry.sizeCode) !== key,
      ),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    return {
      items,
      ready,
      count,
      subtotal,
      currency: items[0]?.currency ?? "BYN",
      addItem,
      updateQuantity,
      removeItem,
      clear,
    };
  }, [items, ready, addItem, updateQuantity, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
