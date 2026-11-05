import { queryOptions } from '@tanstack/react-query';

import { apiRequest } from '@/api/client';

import type {
  BankAccountRequest,
  BankAccountResponse,
  BankingStatus,
  BanksResponse,
  EarningsAnalytics,
  EarningsPeriod,
  PayoutHistoryResponse,
  PayoutSummaryResponse,
  PendingPayoutResponse,
  VerifyAccountRequest,
  VerifyAccountResponse,
} from './types';

export const payoutKeys = {
  all: ['payouts'] as const,
  summary: () => [...payoutKeys.all, 'summary'] as const,
  history: () => [...payoutKeys.all, 'history'] as const,
  pendingOrders: () => [...payoutKeys.all, 'pending-orders'] as const,
  earnings: (period: EarningsPeriod) => [...payoutKeys.all, 'earnings', period] as const,
  bankingStatus: () => [...payoutKeys.all, 'banking-status'] as const,
  banks: () => ['banks'] as const,
};

export function getPayoutSummary(signal?: AbortSignal): Promise<PayoutSummaryResponse> {
  return apiRequest<PayoutSummaryResponse>('/api/pharmacy/payouts/summary', { signal });
}

export const payoutSummaryQueryOptions = queryOptions({
  queryKey: payoutKeys.summary(),
  queryFn: ({ signal }) => getPayoutSummary(signal),
});

export function getPayoutHistory(page: number, limit: number, signal?: AbortSignal): Promise<PayoutHistoryResponse> {
  return apiRequest<PayoutHistoryResponse>('/api/pharmacy/payouts/history', { query: { page, limit }, signal });
}

export function getPendingPayoutOrders(signal?: AbortSignal): Promise<PendingPayoutResponse> {
  return apiRequest<PendingPayoutResponse>('/api/pharmacy/orders/pending-payout', { signal });
}

export function getEarningsAnalytics(period: EarningsPeriod, signal?: AbortSignal): Promise<EarningsAnalytics> {
  return apiRequest<EarningsAnalytics>('/api/pharmacy/earnings/analytics', { query: { period }, signal });
}

export function getBankingStatus(signal?: AbortSignal): Promise<BankingStatus> {
  return apiRequest<BankingStatus>('/api/pharmacy/banking/status', { signal });
}

export function getBanks(signal?: AbortSignal): Promise<BanksResponse> {
  return apiRequest<BanksResponse>('/api/pharmacy/banking/banks', { signal });
}

export function verifyBankAccount(body: VerifyAccountRequest): Promise<VerifyAccountResponse> {
  return apiRequest<VerifyAccountResponse>('/api/pharmacy/banking/verify', { method: 'POST', body, timeoutMs: 30_000 });
}

export function saveBankAccount(body: BankAccountRequest, mode: 'setup' | 'update'): Promise<BankAccountResponse> {
  return mode === 'setup'
    ? apiRequest<BankAccountResponse>('/api/pharmacy/banking/setup', { method: 'POST', body, timeoutMs: 30_000 })
    : apiRequest<BankAccountResponse>('/api/pharmacy/banking/update', { method: 'PUT', body, timeoutMs: 30_000 });
}
