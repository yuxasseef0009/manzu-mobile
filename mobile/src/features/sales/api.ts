import { apiRequest } from '@/api/client';

import type { RecordSaleRequest, RecordSaleResponse, SalesExportQuery, SalesFilters, SalesQuery, SalesResponse } from './types';

export const salesKeys = {
  all: ['sales'] as const,
  lists: () => [...salesKeys.all, 'list'] as const,
  list: (filters: SalesFilters) => [...salesKeys.lists(), filters] as const,
};

export function fetchSales(query: SalesQuery, signal?: AbortSignal): Promise<SalesResponse> {
  return apiRequest<SalesResponse>('/api/pharmacy/sales', { query: { ...query }, signal });
}

export function recordSale(body: RecordSaleRequest): Promise<RecordSaleResponse> {
  return apiRequest<RecordSaleResponse>('/api/pharmacy/sales', { method: 'POST', body });
}

/** CSV text (Transaction ID,Date,Time,Items Count,Total Amount,Payment Method). */
export function exportSalesCsv(query: SalesExportQuery): Promise<string> {
  return apiRequest<string>('/api/pharmacy/sales/export', { query: { ...query }, responseType: 'text', timeoutMs: 60_000 });
}
