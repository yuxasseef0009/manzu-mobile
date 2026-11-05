import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { exportSalesCsv, fetchSales, salesKeys } from './api';
import type { SalesFilters } from './types';
import { toExportQuery, toSalesQuery } from './utils';

/** Same page size as the web (pagination.limit 20). */
export const SALES_PAGE_SIZE = 20;

export function useSales(filters: SalesFilters) {
  return useInfiniteQuery({
    queryKey: salesKeys.list(filters),
    queryFn: ({ pageParam, signal }) => fetchSales({ ...toSalesQuery(filters), page: pageParam, limit: SALES_PAGE_SIZE }, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.pagination.page < last.pagination.pages ? last.pagination.page + 1 : undefined),
  });
}

/** Downloads /sales/export with the Bearer header, saves it to the cache dir and opens the share sheet. */
export function useExportSales() {
  return useMutation({
    mutationFn: async (filters: SalesFilters) => {
      if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available on this device.');
      const csv = await exportSalesCsv(toExportQuery(filters));
      const file = new File(Paths.cache, `sales-report-${new Date().toISOString().split('T')[0]}.csv`);
      file.create({ overwrite: true });
      await file.write(csv);
      await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', UTI: 'public.comma-separated-values-text', dialogTitle: 'Export sales' });
    },
  });
}
