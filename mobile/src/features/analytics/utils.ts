import type { CatalogMedication } from '@/features/inventory/types';
import type { OrderSummary } from '@/features/orders/types';

import type { AnalyticsRange, DailyRevenue, InventoryHealth, OrderAnalytics, TopMedication } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

export const ANALYTICS_RANGES: { value: AnalyticsRange; label: string }[] = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'all', label: 'All Time' },
  { value: 'custom', label: 'Custom' },
];

// Same as the web filterOrdersByRange: custom dates are parsed as UTC midnight and only apply when both are set.
export function filterOrdersByRange(orders: OrderSummary[], range: AnalyticsRange, customStart: string, customEnd: string, now = Date.now()): OrderSummary[] {
  if (range === 'all') return orders;
  if (range === 'custom') {
    if (!customStart || !customEnd) return orders;
    const start = new Date(customStart).getTime();
    const end = new Date(customEnd).getTime();
    return orders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= start && t <= end;
    });
  }
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const start = now - days * DAY_MS;
  return orders.filter((o) => new Date(o.createdAt).getTime() >= start);
}

function localDay(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// Metrics from analytics/page.jsx: revenue = Σ pharmacyAmount, AOV = Σ totalPrice / orders,
// trend = Σ totalPrice per local day, top 5 medications by units.
export function computeOrderAnalytics(orders: OrderSummary[]): OrderAnalytics {
  const totalRevenue = orders.reduce((s, o) => s + (o.pharmacyAmount || 0), 0);
  const orderValue = orders.reduce((s, o) => s + (o.totalPrice || 0), 0);
  const totalOrders = orders.length;

  const perCustomer = new Map<string, number>();
  const statuses = new Map<string, number>();
  const meds = new Map<string, TopMedication>();
  const byDay = new Map<string, DailyRevenue>();

  for (const o of orders) {
    perCustomer.set(o.userIdentifier, (perCustomer.get(o.userIdentifier) ?? 0) + 1);
    statuses.set(o.status, (statuses.get(o.status) ?? 0) + 1);
    for (const item of o.items ?? []) {
      const name = item.medication?.brandName || 'Unknown';
      const m = meds.get(name) ?? { name, count: 0, revenue: 0 };
      m.count += item.quantity;
      m.revenue += item.quantity * item.price;
      meds.set(name, m);
    }
    const d = new Date(o.createdAt);
    const key = localDay(d);
    const entry = byDay.get(key) ?? { day: key, label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), revenue: 0 };
    entry.revenue += o.totalPrice || 0;
    byDay.set(key, entry);
  }

  const uniqueCustomers = perCustomer.size;
  const returningCustomers = [...perCustomer.values()].filter((c) => c > 1).length;

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue: totalOrders ? orderValue / totalOrders : 0,
    uniqueCustomers,
    returningCustomers,
    retentionRate: uniqueCustomers ? Math.round((returningCustomers / uniqueCustomers) * 100) : 0,
    statusCounts: [...statuses.entries()].map(([status, count]) => ({ status, count })),
    topMedications: [...meds.values()].sort((a, b) => b.count - a.count).slice(0, 5),
    revenueByDay: [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day)),
  };
}

// Web inventory health: low stock = 0 < stock < 10, out of stock = stock === 0, value = Σ stock × price.
export function computeInventoryHealth(meds: CatalogMedication[]): InventoryHealth {
  return {
    totalItems: meds.length,
    lowStock: meds.filter((m) => (m.stock ?? 0) > 0 && (m.stock ?? 0) < 10).length,
    outOfStock: meds.filter((m) => m.stock === 0).length,
    totalValue: meds.reduce((s, m) => s + (m.stock ?? 0) * (m.price ?? 0), 0),
  };
}

/** Doughnut colours in the web's order. */
export const STATUS_CHART_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

export function compactNaira(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (abs >= 1_000) return `₦${(value / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return `₦${Math.round(value)}`;
}
