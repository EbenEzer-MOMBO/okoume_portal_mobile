import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { MenuItem } from '@/lib/api/types';

export type CartLine = {
  item: MenuItem;
  quantity: number;
  notes: string;
};

type RoomServiceCart = {
  lines: CartLine[];
  totalItems: number;
  totalAmount: number;
  add: (item: MenuItem) => void;
  setQuantity: (menuItemId: number, quantity: number) => void;
  setNotes: (menuItemId: number, notes: string) => void;
  remove: (menuItemId: number) => void;
  clear: () => void;
};

const RoomServiceCartContext = createContext<RoomServiceCart | null>(null);

function getMaxStock(item: MenuItem): number {
  if (typeof item.stock === 'number' && item.stock >= 0) {
    return item.stock;
  }
  return 20;
}

export function RoomServiceCartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const value = useMemo<RoomServiceCart>(() => {
    const add = (item: MenuItem) => {
      const maxStock = getMaxStock(item);
      setLines((current) => {
        const existing = current.find((line) => line.item.id === item.id);
        if (existing) {
          if (existing.quantity >= maxStock) return current;
          return current.map((line) =>
            line.item.id === item.id ? { ...line, quantity: line.quantity + 1 } : line
          );
        }
        if (maxStock <= 0) return current;
        return [...current, { item, quantity: 1, notes: '' }];
      });
    };

    const setQuantity = (menuItemId: number, quantity: number) => {
      setLines((current) => {
        const existing = current.find((line) => line.item.id === menuItemId);
        if (!existing) return current;
        if (quantity <= 0) {
          return current.filter((line) => line.item.id !== menuItemId);
        }
        const maxStock = getMaxStock(existing.item);
        const clampedQty = Math.min(quantity, maxStock);
        return current.map((line) => (line.item.id === menuItemId ? { ...line, quantity: clampedQty } : line));
      });
    };

    const setNotes = (menuItemId: number, notes: string) => {
      setLines((current) => current.map((line) => (line.item.id === menuItemId ? { ...line, notes } : line)));
    };

    const remove = (menuItemId: number) => {
      setLines((current) => current.filter((line) => line.item.id !== menuItemId));
    };

    const clear = () => setLines([]);

    return {
      lines,
      totalItems: lines.reduce((sum, line) => sum + line.quantity, 0),
      totalAmount: lines.reduce((sum, line) => sum + line.quantity * line.item.prix, 0),
      add,
      setQuantity,
      setNotes,
      remove,
      clear,
    };
  }, [lines]);

  return <RoomServiceCartContext.Provider value={value}>{children}</RoomServiceCartContext.Provider>;
}

export function useRoomServiceCart(): RoomServiceCart {
  const cart = useContext(RoomServiceCartContext);
  if (!cart) {
    throw new Error('useRoomServiceCart doit être utilisé à l’intérieur de <RoomServiceCartProvider>.');
  }
  return cart;
}
