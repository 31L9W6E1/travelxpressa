import api, { handleApiError, ApiResponse, PaginatedResponse } from './client';

// Payment types
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
export type PaymentProvider = 'QPAY' | 'KHAN_BANK' | 'MONPAY' | 'SOCIALPAY' | 'BANK_TRANSFER';
export type PaymentServiceType = 'VISA_APPLICATION' | 'CONSULTATION' | 'DOCUMENT_REVIEW' | 'RUSH_PROCESSING';

export interface DeepLink {
  name: string;
  description: string;
  logo: string;
  link: string;
}

export interface Payment {
  id: string;
  invoiceNo: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider?: PaymentProvider;
  serviceType: PaymentServiceType;
  description?: string;
  qrCode?: string;
  qrImage?: string;
  shortUrl?: string;
  deepLinks?: DeepLink[];
  expiresAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface PaymentSummary {
  totalRevenue: number;
  totalTransactions: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  cancelledPayments: number;
  refundedAmount: number;
  byServiceType: Record<string, { count: number; revenue: number }>;
  byProvider: Record<string, { count: number; revenue: number }>;
  byStatus: Record<string, number>;
}

export interface ServicePrice {
  service: PaymentServiceType;
  price: number;
  priceFormatted: string;
}

export interface CreatePaymentParams {
  serviceType: PaymentServiceType;
  amount?: number;
  description?: string;
  applicationId?: string;
}

/**
 * Create a new payment
 */
export const createPayment = async (params: CreatePaymentParams): Promise<ApiResponse<Payment>> => {
  try {
    const response = await api.post('/api/payments/create', params);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get payment by ID
 */
export const getPayment = async (paymentId: string): Promise<ApiResponse<Payment>> => {
  try {
    const response = await api.get(`/api/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Check payment status
 */
export const checkPaymentStatus = async (paymentId: string): Promise<ApiResponse<{
  status: PaymentStatus;
  paidAmount?: number;
  paidAt?: string;
  wallet?: string;
}>> => {
  try {
    const response = await api.get(`/api/payments/${paymentId}/status`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Cancel a pending payment
 */
export const cancelPayment = async (paymentId: string): Promise<ApiResponse<void>> => {
  try {
    const response = await api.post(`/api/payments/${paymentId}/cancel`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get user's payment history
 */
export const getPaymentHistory = async (params?: {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
}): Promise<PaginatedResponse<Payment>> => {
  try {
    const response = await api.get('/api/payments/user/history', { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get service prices
 */
export const getServicePrices = async (): Promise<ApiResponse<{
  currency: string;
  prices: ServicePrice[];
}>> => {
  try {
    const response = await api.get('/api/payments/prices');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// ==================== ADMIN FUNCTIONS ====================

/**
 * Get all payments (admin)
 */
export const adminGetPayments = async (params?: {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  provider?: PaymentProvider;
  serviceType?: PaymentServiceType;
  startDate?: string;
  endDate?: string;
}): Promise<PaginatedResponse<Payment & { userId: string; applicationId?: string; refundedAmount?: number }>> => {
  try {
    const response = await api.get('/api/payments/admin/list', { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get payment summary/analytics (admin)
 */
export const adminGetPaymentSummary = async (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<PaymentSummary>> => {
  try {
    const response = await api.get('/api/payments/admin/summary', { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Refund a payment (admin)
 */
export const adminRefundPayment = async (paymentId: string, params: {
  reason?: string;
  amount?: number;
}): Promise<ApiResponse<{ refundedAmount: number }>> => {
  try {
    const response = await api.post(`/api/payments/admin/${paymentId}/refund`, params);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Helper functions

/**
 * Format amount in MNT
 */
export const formatMNT = (amount: number): string => {
  return amount.toLocaleString('mn-MN') + '₮';
};

/**
 * Get status color for UI
 */
export const getPaymentStatusColor = (status: PaymentStatus): string => {
  const colors: Record<PaymentStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    PAID: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
    REFUNDED: 'bg-purple-100 text-purple-800',
    PARTIALLY_REFUNDED: 'bg-orange-100 text-orange-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Get human-readable status text
 */
export const getPaymentStatusText = (status: PaymentStatus): string => {
  const texts: Record<PaymentStatus, string> = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    PAID: 'Paid',
    FAILED: 'Failed',
    CANCELLED: 'Cancelled',
    REFUNDED: 'Refunded',
    PARTIALLY_REFUNDED: 'Partially Refunded',
  };
  return texts[status] || status;
};

/**
 * Get service type display name
 */
export const getServiceTypeName = (serviceType: PaymentServiceType): string => {
  const names: Record<PaymentServiceType, string> = {
    VISA_APPLICATION: 'Visa Application',
    CONSULTATION: 'Consultation',
    DOCUMENT_REVIEW: 'Document Review',
    RUSH_PROCESSING: 'Rush Processing',
  };
  return names[serviceType] || serviceType;
};
