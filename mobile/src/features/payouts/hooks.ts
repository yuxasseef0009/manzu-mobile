import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getBankingStatus, getBanks, getEarningsAnalytics, getPayoutHistory, getPendingPayoutOrders, payoutKeys, saveBankAccount, verifyBankAccount } from './api';
import type { BankAccountRequest, EarningsPeriod } from './types';

/** Web page size for /payouts/history. */
export const PAYOUT_PAGE_SIZE = 20;

export function useBankingStatus() {
  return useQuery({ queryKey: payoutKeys.bankingStatus(), queryFn: ({ signal }) => getBankingStatus(signal) });
}

export function useBanks(enabled: boolean) {
  return useQuery({ queryKey: payoutKeys.banks(), queryFn: ({ signal }) => getBanks(signal), enabled, staleTime: 24 * 60 * 60 * 1000 });
}

export function usePayoutHistory() {
  return useInfiniteQuery({
    queryKey: payoutKeys.history(),
    queryFn: ({ pageParam, signal }) => getPayoutHistory(pageParam, PAYOUT_PAGE_SIZE, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined),
  });
}

export function usePendingPayoutOrders() {
  return useQuery({ queryKey: payoutKeys.pendingOrders(), queryFn: ({ signal }) => getPendingPayoutOrders(signal) });
}

export function useEarnings(period: EarningsPeriod) {
  return useQuery({ queryKey: payoutKeys.earnings(period), queryFn: ({ signal }) => getEarningsAnalytics(period, signal) });
}

export function useVerifyBankAccount() {
  return useMutation({ mutationFn: verifyBankAccount });
}

export function useSaveBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ body, mode }: { body: BankAccountRequest; mode: 'setup' | 'update' }) => saveBankAccount(body, mode),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: payoutKeys.all }),
  });
}
