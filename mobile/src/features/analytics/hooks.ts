import { useQuery } from '@tanstack/react-query';

import { analyticsKeys, fetchAnalyticsInventory, fetchAnalyticsOrders } from './api';

export function useAnalyticsOrders() {
  return useQuery({ queryKey: analyticsKeys.orders(), queryFn: ({ signal }) => fetchAnalyticsOrders(signal) });
}

export function useAnalyticsInventory() {
  return useQuery({ queryKey: analyticsKeys.inventory(), queryFn: ({ signal }) => fetchAnalyticsInventory(signal) });
}
