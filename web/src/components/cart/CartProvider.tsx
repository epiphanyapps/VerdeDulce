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
import { menuItems, type MenuItem } from "@/content/menu";

/**
 * Replaces the MobX-State-Tree `CartStore`. Only the slug and quantity are
 * persisted — item name, price and image are always resolved from the menu
 * content at read time, so a price change or a delisted item can never be
 * served from a stale cart in someone's browser.
 */
const STORAGE_KEY = "verdedulce.cart.v1";

type CartLine = { slug: string; quantity: number };

export type ResolvedLine = { item: MenuItem; quantity: number; subtotal: number };

type CartContextValue = {
  lines: ResolvedLine[];
  count: number;
  total: number;
  /** False until the persisted cart has been read, to avoid a hydration mismatch. */
  ready: boolean;
  add: (slug: string, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((entry): CartLine[] => {
      if (typeof entry !== "object" || entry === null) return [];
      const { slug, quantity } = entry as Partial<CartLine>;
      if (typeof slug !== "string" || typeof quantity !== "number") return [];
      // Drop anything no longer on the menu rather than rendering a hole.
      if (!menuItems.some((item) => item.slug === slug)) return [];
      return [{ slug, quantity: Math.max(1, Math.floor(quantity)) }];
    });
  } catch {
    // Private mode, disabled storage, or corrupt JSON — start empty.
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  // Read after mount: the server render has no access to localStorage, so
  // seeding state from it directly would mismatch on hydration.
  useEffect(() => {
    setLines(readStoredCart());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Storage unavailable — the cart still works for this session.
    }
  }, [lines, ready]);

  const add = useCallback((slug: string, quantity = 1) => {
    setLines((current) => {
      const existing = current.find((line) => line.slug === slug);
      if (!existing) return [...current, { slug, quantity }];
      return current.map((line) =>
        line.slug === slug ? { ...line, quantity: line.quantity + quantity } : line,
      );
    });
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    setLines((current) =>
      quantity <= 0
        ? current.filter((line) => line.slug !== slug)
        : current.map((line) => (line.slug === slug ? { ...line, quantity } : line)),
    );
  }, []);

  const remove = useCallback((slug: string) => {
    setLines((current) => current.filter((line) => line.slug !== slug));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const resolved = lines.flatMap((line): ResolvedLine[] => {
      const item = menuItems.find((candidate) => candidate.slug === line.slug);
      if (!item) return [];
      return [{ item, quantity: line.quantity, subtotal: item.price * line.quantity }];
    });

    return {
      lines: resolved,
      count: resolved.reduce((sum, line) => sum + line.quantity, 0),
      total: resolved.reduce((sum, line) => sum + line.subtotal, 0),
      ready,
      add,
      setQuantity,
      remove,
      clear,
    };
  }, [lines, ready, add, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
