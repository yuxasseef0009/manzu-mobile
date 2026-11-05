import { apiRequest } from '@/api/client';
import type { CatalogResponse } from '@/features/inventory/types';

export const posKeys = {
  all: ['pos'] as const,
  search: (term: string) => [...posKeys.all, 'search', term] as const,
};

/**
 * pharmacyMedicationsAPI.fetchMedications({ search }) — GET /api/pharmacy/medications, which the backend maps to
 * the catalog with status 'stocked' (stock > 0).
 */
export function searchStockedMedications(search: string, signal?: AbortSignal): Promise<CatalogResponse> {
  return apiRequest<CatalogResponse>('/api/pharmacy/medications', { query: { search, limit: 20 }, signal });
}
