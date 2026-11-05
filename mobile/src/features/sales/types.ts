// Shapes from manzu-b (med-version): routes/pharmacy.js POST/GET /sales and GET /sales/export,
// domains/pharmacy/sales/*, prisma `Sale { id, pharmacyId, items Json, total Float, paymentMethod String, createdAt }`.

export type SalePaymentMethod = 'CASH' | 'CARD';

/** One element of `Sale.items` (JSON), exactly what pos/new-sale sends. */
export interface SaleItem {
  medicationId: number;
  quantity: number;
  price: number;
  name: string;
}

export interface Sale {
  id: number;
  pharmacyId: number;
  /** Prisma Json: not validated by the backend, so read it defensively (see saleItems()). */
  items: SaleItem[] | null;
  total: number;
  /** Plain String column; the web only ever sends CASH or CARD. */
  paymentMethod: string;
  createdAt: string;
}

/** POST /api/pharmacy/sales. The route only checks `items` is an array and `total`/`paymentMethod` are truthy. */
export interface RecordSaleRequest {
  items: SaleItem[];
  total: number;
  paymentMethod: SalePaymentMethod;
}

export interface RecordSaleResponse {
  message: string;
  sale: Sale;
}

export interface SalesStats {
  totalRevenue: number;
  cashSales: number;
  cardSales: number;
}

export interface SalesResponse {
  message: string;
  sales: Sale[];
  pagination: { page: number; limit: number; total: number; pages: number };
  stats: SalesStats;
}

/** GET /api/pharmacy/sales. Dates are YYYY-MM-DD and read as UTC days by the backend. `date` wins over the range. */
export interface SalesQuery {
  page?: number;
  limit?: number;
  date?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: SalePaymentMethod;
  minAmount?: string;
  maxAmount?: string;
}

/** GET /api/pharmacy/sales/export ignores page/limit/amounts. */
export type SalesExportQuery = Pick<SalesQuery, 'date' | 'startDate' | 'endDate' | 'paymentMethod'>;

/** sales-history/page.jsx filter state. */
export interface SalesFilters {
  date: string;
  startDate: string;
  endDate: string;
  paymentMethod: '' | SalePaymentMethod;
  minAmount: string;
  maxAmount: string;
}
