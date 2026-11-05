import { apiRequest } from '@/api/client';
import { inventoryKeys } from '@/features/inventory/api';
import type { CatalogResponse } from '@/features/inventory/types';
import { fetchOrders, orderKeys } from '@/features/orders/api';
import type { OrdersResponse } from '@/features/orders/types';

// Nested under the orders/inventory keys so order, inventory and POS mutations also refresh analytics.
export const analyticsKeys = {
  orders: () => [...orderKeys.all, 'analytics'] as const,
  inventory: () => [...inventoryKeys.lists(), 'analytics'] as const,
};

/** The web loads a single page of 100 orders and filters on the client (PLAN G8). */
export const ANALYTICS_ORDER_LIMIT = 100;

export function fetchAnalyticsOrders(signal?: AbortSignal): Promise<OrdersResponse> {
  return fetchOrders({ limit: ANALYTICS_ORDER_LIMIT }, signal);
}

/** Same call as the web: no params, so the backend defaults apply (stocked items, first page). */
export function fetchAnalyticsInventory(signal?: AbortSignal): Promise<CatalogResponse> {
  return apiRequest<CatalogResponse>('/api/pharmacy/medications', { signal });
}
