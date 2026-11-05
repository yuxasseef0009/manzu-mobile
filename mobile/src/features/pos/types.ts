import type { SaleItem } from '@/features/sales/types';

/** pos/new-sale/page.jsx cart line (newItem in handleAddToCart). */
export interface CartItem {
  medicationId: number;
  name: string;
  form: string;
  packSize: string;
  price: number;
  quantity: number;
  /** Stock when the item was (last) added; quantity is capped at this. */
  availableStock: number;
}

/** What the receipt sheet shows after POST /sales succeeds. */
export interface CompletedSale {
  id: number;
  items: SaleItem[];
  total: number;
  paymentMethod: string;
  createdAt: string;
}
