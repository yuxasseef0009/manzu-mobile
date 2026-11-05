import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { dashboardKeys } from '@/features/dashboard/api';
import { inventoryKeys } from '@/features/inventory/api';
import { recordSale, salesKeys } from '@/features/sales/api';
import type { RecordSaleRequest } from '@/features/sales/types';

import { posKeys, searchStockedMedications } from './api';

/** Web AutocompleteInput: searches from 2 characters. */
export const MIN_SEARCH_LENGTH = 2;

export function useStockedMedicationSearch(term: string) {
  return useQuery({
    queryKey: posKeys.search(term),
    queryFn: ({ signal }) => searchStockedMedications(term, signal),
    enabled: term.length >= MIN_SEARCH_LENGTH,
    staleTime: 0,
    meta: { persist: false },
  });
}

export function useRecordSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: RecordSaleRequest) => recordSale(body),
    // Refetch stock after success *and* failure: the backend decrements per item without a transaction (OQ C11).
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: posKeys.all }),
        queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: salesKeys.all }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      ]),
  });
}
