import { formatNairaShort } from '@/lib/format';

import type { Sale, SaleItem, SalesExportQuery, SalesFilters, SalesQuery } from './types';

export const EMPTY_SALES_FILTERS: SalesFilters = { date: '', startDate: '', endDate: '', paymentMethod: '', minAmount: '', maxAmount: '' };

/** `Sale.items` is untyped JSON; drop anything that isn't a usable line. */
export function saleItems(sale: Pick<Sale, 'items'>): SaleItem[] {
  if (!Array.isArray(sale.items)) return [];
  return sale.items
    .filter((i): i is SaleItem => !!i && typeof i === 'object')
    .map((i) => ({ medicationId: Number(i.medicationId), quantity: Number(i.quantity) || 0, price: Number(i.price) || 0, name: String(i.name ?? 'Unknown') }));
}

export function itemCount(items: SaleItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

/** sales-history/page.jsx loadSales params: `date` wins; a range needs both ends. */
export function toSalesQuery(filters: SalesFilters): SalesQuery {
  return {
    ...toExportQuery(filters),
    minAmount: filters.minAmount || undefined,
    maxAmount: filters.maxAmount || undefined,
  };
}

/** sales-history/page.jsx handleExport params (no amounts). */
export function toExportQuery(filters: SalesFilters): SalesExportQuery {
  const range = !filters.date && filters.startDate && filters.endDate;
  return {
    date: filters.date || undefined,
    startDate: range ? filters.startDate : undefined,
    endDate: range ? filters.endDate : undefined,
    paymentMethod: filters.paymentMethod || undefined,
  };
}

export type QuickDate = 'today' | 'yesterday' | 'week' | 'month';

/** UTC calendar date, as the web's toISOString().split('T')[0]. */
function utcIso(d: Date): string {
  return d.toISOString().split('T')[0] ?? '';
}

/** sales-history/page.jsx setQuickDateFilter. */
export function quickDateFilters(type: QuickDate | 'clear'): Pick<SalesFilters, 'date' | 'startDate' | 'endDate'> {
  const today = new Date();
  switch (type) {
    case 'today':
      return { date: utcIso(today), startDate: '', endDate: '' };
    case 'yesterday': {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      return { date: utcIso(y), startDate: '', endDate: '' };
    }
    case 'week': {
      const start = new Date(today);
      start.setDate(today.getDate() - 7);
      return { date: '', startDate: utcIso(start), endDate: utcIso(today) };
    }
    case 'month':
      return { date: '', startDate: utcIso(new Date(today.getFullYear(), today.getMonth(), 1)), endDate: utcIso(today) };
    case 'clear':
      return { date: '', startDate: '', endDate: '' };
  }
}

export function activeQuickDate(filters: SalesFilters): QuickDate | null {
  const types: QuickDate[] = ['today', 'yesterday', 'week', 'month'];
  return types.find((t) => {
    const q = quickDateFilters(t);
    return q.date === filters.date && q.startDate === filters.startDate && q.endDate === filters.endDate;
  }) ?? null;
}

/** Plain-text receipt for the share sheet (the web prints the receipt modal). */
export function receiptText(sale: { id: number; items: SaleItem[]; total: number; paymentMethod: string; createdAt: string | number | Date }, pharmacyName?: string | null): string {
  const lines = [
    pharmacyName ? `${pharmacyName}` : 'Manzu Pharmacy',
    `Sale Receipt #${sale.id}`,
    new Date(sale.createdAt).toLocaleString(),
    '',
    ...sale.items.map((i) => `${i.name}\n  ${i.quantity} × ${formatNairaShort(i.price)} = ${formatNairaShort(i.quantity * i.price)}`),
    '',
    `Total: ${formatNairaShort(sale.total)}`,
    `Payment Method: ${sale.paymentMethod.toUpperCase()}`,
  ];
  return lines.join('\n');
}
