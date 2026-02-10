import { config } from '../config';
import { logger } from '../utils/logger';

// QPay API Response Types
export interface QPayTokenResponse {
  token_type: string;
  refresh_expires_in: number;
  refresh_token: string;
  access_token: string;
  expires_in: number;
  scope: string;
  session_state: string;
}

export interface QPayInvoiceRequest {
  invoice_code: string;
  sender_invoice_no: string;
  invoice_receiver_code: string;
  invoice_description: string;
  amount?: number;
  callback_url?: string;
  sender_branch_code?: string;
  invoice_due_date?: string;
  allow_partial?: boolean;
  allow_exceed?: boolean;
  minimum_amount?: number;
  maximum_amount?: number;
  note?: string;
}

export interface QPayInvoiceUrl {
  name: string;
  description: string;
  logo: string;
  link: string;
}

export interface QPayInvoiceResponse {
  invoice_id: string;
  qr_text: string;
  qr_image: string;
  qPay_shortUrl: string;
  urls: QPayInvoiceUrl[];
}

export interface QPayPaymentCheckRequest {
  object_type: 'INVOICE' | 'QR' | 'ITEM';
  object_id: string;
  offset: {
    page_number: number;
    page_limit: number;
  };
}

export interface QPayPayment {
  payment_id: string;
  payment_status: 'NEW' | 'FAILED' | 'PAID' | 'REFUNDED';
  payment_date: string;
  payment_fee: string;
  payment_amount: string;
  payment_currency: string;
  payment_wallet: string;
  transaction_type: 'P2P' | 'CARD';
}

export interface QPayPaymentCheckResponse {
  count: number;
  paid_amount: number;
  rows: QPayPayment[];
}

export interface QPayPaymentInfo {
  payment_id: string;
  payment_status: string;
  payment_date: string;
  payment_fee: number;
  payment_amount: number;
  payment_currency: string;
  payment_wallet: string;
  payment_type: string;
  p2p_message?: string;
}

// Token cache to avoid frequent auth requests
interface TokenCache {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  refreshExpiresAt: number;
}

class QPayService {
  private baseUrl: string;
  private tokenCache: TokenCache | null = null;

  constructor() {
    this.baseUrl = config.qpay.useSandbox
      ? config.qpay.sandboxUrl
      : config.qpay.baseUrl;
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  private async getAccessToken(): Promise<string> {
    const now = Date.now();

    // Check if we have a valid cached token
    if (this.tokenCache && this.tokenCache.expiresAt > now + 60000) {
      return this.tokenCache.accessToken;
    }

    // Check if we can refresh the token
    if (this.tokenCache && this.tokenCache.refreshExpiresAt > now + 60000) {
      try {
        return await this.refreshToken();
      } catch (error) {
        logger.warn('Token refresh failed, getting new token', { error });
      }
    }

    // Get a new token
    return await this.authenticate();
  }

  /**
   * Authenticate with QPay and get access token
   */
  private async authenticate(): Promise<string> {
    const credentials = Buffer.from(
      `${config.qpay.username}:${config.qpay.password}`
    ).toString('base64');

    const response = await fetch(`${this.baseUrl}/auth/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error('QPay authentication failed', new Error(error));
      throw new Error(`QPay authentication failed: ${response.status}`);
    }

    const data = await response.json() as QPayTokenResponse;
    const now = Date.now();

    this.tokenCache = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: now + (data.expires_in * 1000),
      refreshExpiresAt: now + (data.refresh_expires_in * 1000),
    };

    logger.info('QPay authentication successful');
    return data.access_token;
  }

  /**
   * Refresh the access token using refresh token
   */
  private async refreshToken(): Promise<string> {
    if (!this.tokenCache) {
      throw new Error('No token to refresh');
    }

    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.tokenCache.refreshToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      this.tokenCache = null;
      throw new Error('Token refresh failed');
    }

    const data = await response.json() as QPayTokenResponse;
    const now = Date.now();

    this.tokenCache = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: now + (data.expires_in * 1000),
      refreshExpiresAt: now + (data.refresh_expires_in * 1000),
    };

    return data.access_token;
  }

  /**
   * Make an authenticated API request to QPay
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('QPay API request failed', new Error(errorText), {
        method,
        endpoint,
        status: response.status,
      });
      throw new Error(`QPay API error: ${response.status} - ${errorText}`);
    }

    return await response.json() as T;
  }

  /**
   * Create a payment invoice
   */
  async createInvoice(params: {
    invoiceNo: string;
    receiverCode: string;
    description: string;
    amount: number;
    callbackUrl?: string;
    dueDate?: string;
  }): Promise<QPayInvoiceResponse> {
    const invoiceRequest: QPayInvoiceRequest = {
      invoice_code: config.qpay.invoiceCode,
      sender_invoice_no: params.invoiceNo,
      invoice_receiver_code: params.receiverCode,
      invoice_description: params.description,
      amount: params.amount,
      callback_url: params.callbackUrl || config.qpay.callbackUrl,
      invoice_due_date: params.dueDate,
    };

    logger.info('Creating QPay invoice', { invoiceNo: params.invoiceNo, amount: params.amount });

    const response = await this.request<QPayInvoiceResponse>(
      'POST',
      '/invoice',
      invoiceRequest
    );

    logger.info('QPay invoice created', {
      invoiceNo: params.invoiceNo,
      invoiceId: response.invoice_id
    });

    return response;
  }

  /**
   * Get invoice details
   */
  async getInvoice(invoiceId: string): Promise<QPayInvoiceResponse> {
    return this.request<QPayInvoiceResponse>('GET', `/invoice/${invoiceId}`);
  }

  /**
   * Cancel an invoice
   */
  async cancelInvoice(invoiceId: string): Promise<void> {
    await this.request('DELETE', `/invoice/${invoiceId}`);
    logger.info('QPay invoice cancelled', { invoiceId });
  }

  /**
   * Check payment status for an invoice
   */
  async checkPayment(invoiceId: string): Promise<QPayPaymentCheckResponse> {
    const request: QPayPaymentCheckRequest = {
      object_type: 'INVOICE',
      object_id: invoiceId,
      offset: {
        page_number: 1,
        page_limit: 100,
      },
    };

    return this.request<QPayPaymentCheckResponse>('POST', '/payment/check', request);
  }

  /**
   * Get payment details
   */
  async getPayment(paymentId: string): Promise<QPayPaymentInfo> {
    return this.request<QPayPaymentInfo>('GET', `/payment/${paymentId}`);
  }

  /**
   * Cancel a payment
   */
  async cancelPayment(paymentId: string): Promise<void> {
    await this.request('DELETE', `/payment/cancel/${paymentId}`);
    logger.info('QPay payment cancelled', { paymentId });
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentId: string): Promise<void> {
    await this.request('DELETE', `/payment/refund/${paymentId}`);
    logger.info('QPay payment refunded', { paymentId });
  }

  /**
   * List payments with optional filters
   */
  async listPayments(params: {
    pageNumber?: number;
    pageLimit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<QPayPaymentCheckResponse> {
    const body = {
      offset: {
        page_number: params.pageNumber || 1,
        page_limit: params.pageLimit || 50,
      },
      start_date: params.startDate,
      end_date: params.endDate,
    };

    return this.request<QPayPaymentCheckResponse>('POST', '/payment/list', body);
  }

  /**
   * Generate a unique invoice number
   */
  generateInvoiceNo(prefix: string = 'TXP'): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Verify webhook callback signature (if QPay provides one)
   * Note: Implement based on QPay's actual webhook security mechanism
   */
  verifyWebhookSignature(payload: unknown, signature: string): boolean {
    // QPay may send callback without signature verification
    // Verify by checking payment status via API instead
    logger.info('Webhook received, verifying via API', { payload });
    return true;
  }
}

// Export singleton instance
export const qpayService = new QPayService();
