// manzu-b (med-version) routes/pharmacy.js banking / payouts / earnings routes.
// Order.pharmacyAmount and Payout.amount are Prisma Float → JSON numbers (0 when no rows).

export interface PayoutBucket {
  amount: number;
  count: number;
}

/** GET /api/pharmacy/payouts/summary — pharmacy-payouts.repository.js getPayoutSummary(). */
export interface PayoutSummaryResponse {
  message: string;
  /** COMPLETED orders with payoutStatus PENDING. */
  pending: PayoutBucket;
  processing: PayoutBucket;
  completed: PayoutBucket;
  failed: PayoutBucket;
  /** Pharmacy.recipientCode is set. */
  bankingConfigured: boolean;
}

/** GET /banking/status — pharmacy-banking.service.js getBankingStatus(). */
export interface BankingStatus {
  hasSetup: boolean;
  bankName: string | null;
  /** Masked: `****1234`. */
  accountNumber: string | null;
  accountName: string | null;
}

export interface Bank {
  name: string;
  code: string;
  slug: string;
}

/** GET /banking/banks — Paystack list; `[]` when Paystack fails. */
export interface BanksResponse {
  banks: Bank[];
}

/** POST /banking/verify (MANAGER). */
export interface VerifyAccountRequest {
  /** 10 digits. */
  accountNumber: string;
  bankCode: string;
}

export interface VerifyAccountResponse {
  message: string;
  accountName: string;
  accountNumber: string;
}

/** POST /banking/setup and PUT /banking/update (MANAGER). */
export interface BankAccountRequest extends VerifyAccountRequest {
  bankName: string;
}

export interface BankAccountResponse {
  message: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
}

export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

/** Raw Prisma Payout row. */
export interface Payout {
  id: number;
  pharmacyId: number;
  amount: number;
  orderIds: number[];
  status: PayoutStatus;
  reference: string;
  initiatedAt: string;
  completedAt: string | null;
  failureReason: string | null;
}

/** GET /payouts/history?page&limit. */
export interface PayoutHistoryResponse {
  message: string;
  payouts: Payout[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

/** Raw Prisma Order row (COMPLETED + PAID + payoutStatus PENDING); only the fields the UI reads. */
export interface PendingPayoutOrder {
  id: number;
  createdAt: string;
  filledAt: string | null;
  totalPrice: number;
  platformFee: number | null;
  pharmacyAmount: number | null;
}

/** GET /orders/pending-payout. */
export interface PendingPayoutResponse {
  message: string;
  orders: PendingPayoutOrder[];
  summary: { totalOrders: number; totalAmount: number };
}

export type EarningsPeriod = 'week' | 'month' | 'year';

/** GET /earnings/analytics?period — COMPLETED orders by filledAt, COMPLETED payouts by completedAt. */
export interface EarningsAnalytics {
  message: string;
  period: EarningsPeriod;
  totalEarnings: number;
  totalPaid: number;
  /** totalEarnings − totalPaid; can be negative. */
  pendingPayout: number;
  orderCount: number;
  payoutCount: number;
}
