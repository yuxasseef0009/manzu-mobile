import { create } from 'zustand';

import { useSession } from '@/features/auth/store';
import type { CatalogMedication } from '@/features/inventory/types';
import type { SalePaymentMethod } from '@/features/sales/types';

import type { CartItem } from './types';

interface PosState {
  cart: CartItem[];
  paymentMethod: SalePaymentMethod;
  /** Returns an error message when the item can't be added. */
  addItem: (med: CatalogMedication) => string | null;
  setQuantity: (medicationId: number, quantity: number) => void;
  removeItem: (medicationId: number) => void;
  clearCart: () => void;
  setPaymentMethod: (method: SalePaymentMethod) => void;
  reset: () => void;
}

function clampQuantity(quantity: number, availableStock: number): number {
  return Math.max(1, Math.min(Math.floor(quantity) || 1, availableStock));
}

// In-memory only (PLAN.md §2: online-only POS, checkout is never queued).
export const usePosStore = create<PosState>()((set, get) => ({
  cart: [],
  paymentMethod: 'CASH',

  addItem: (med) => {
    if (!med.stock || med.stock <= 0) return `${med.brandName} is out of stock`;
    if (!med.price || med.price <= 0) return `${med.brandName} has no price set. Update it in Inventory first.`;
    const existing = get().cart.find((i) => i.medicationId === med.medicationId);
    if (existing) {
      set({
        cart: get().cart.map((i) =>
          i.medicationId === med.medicationId ? { ...i, price: med.price ?? i.price, availableStock: med.stock ?? i.availableStock, quantity: clampQuantity(i.quantity + 1, med.stock ?? i.availableStock) } : i,
        ),
      });
      return null;
    }
    const item: CartItem = {
      medicationId: med.medicationId,
      name: med.brandName || 'Unknown',
      form: med.form || '',
      packSize: `${med.packSizeExpression || ''} ${med.packSizeUnit || ''}`.trim(),
      price: med.price,
      quantity: 1,
      availableStock: med.stock,
    };
    set({ cart: [...get().cart, item] });
    return null;
  },

  setQuantity: (medicationId, quantity) =>
    set({ cart: get().cart.map((i) => (i.medicationId === medicationId ? { ...i, quantity: clampQuantity(quantity, i.availableStock) } : i)) }),

  removeItem: (medicationId) => set({ cart: get().cart.filter((i) => i.medicationId !== medicationId) }),

  clearCart: () => set({ cart: [] }),

  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),

  reset: () => set({ cart: [], paymentMethod: 'CASH' }),
}));

export function cartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function cartItemCount(cart: CartItem[]): number {
  return cart.reduce((sum, i) => sum + i.quantity, 0);
}

// Never carry a cart across users.
useSession.subscribe((state, prev) => {
  if (state.status !== 'signedIn' && prev.status === 'signedIn') usePosStore.getState().reset();
});
