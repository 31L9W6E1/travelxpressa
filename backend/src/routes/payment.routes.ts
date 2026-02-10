import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole, PaymentStatus, PaymentProvider, PaymentServiceType, AuthenticatedRequest } from '../types';
import { qpayService } from '../services/qpay.service';
import { notificationService } from '../services/notification.service';
import { logger } from '../utils/logger';
import { config } from '../config';

const router = Router();

// Service prices in MNT (Mongolian Tugrik)
const SERVICE_PRICES: Record<string, number> = {
  VISA_APPLICATION: 150000,    // 150,000 MNT (~$44)
  CONSULTATION: 50000,          // 50,000 MNT (~$15)
  DOCUMENT_REVIEW: 75000,       // 75,000 MNT (~$22)
  RUSH_PROCESSING: 100000,      // 100,000 MNT (~$30) - additional fee
};

/**
 * Helper function to process successful payment
 * Updates payment status, application status, and sends notifications
 */
async function processSuccessfulPayment(
  paymentId: string,
  qpayPaymentId: string,
  paymentDate: Date
): Promise<void> {
  // Get payment with user data
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment || payment.status === PaymentStatus.PAID) {
    return; // Already processed or not found
  }

  // Get user information
  const user = await prisma.user.findUnique({
    where: { id: payment.userId },
  });

  if (!user) {
    logger.error('User not found for payment', { paymentId, userId: payment.userId });
    return;
  }

  // Update payment status
  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: PaymentStatus.PAID,
      providerPaymentId: qpayPaymentId,
      completedAt: paymentDate,
    },
  });

  // If this payment is for a visa application, update application status
  let applicationData = null;
  if (payment.applicationId && payment.serviceType === PaymentServiceType.VISA_APPLICATION) {
    const application = await prisma.application.findUnique({
      where: { id: payment.applicationId },
    });

    if (application && application.status === 'PAYMENT_PENDING') {
      await prisma.application.update({
        where: { id: payment.applicationId },
        data: {
          status: 'SUBMITTED',
          submittedAt: new Date(),
        },
      });

      applicationData = application;

      logger.info('Application status updated to SUBMITTED after payment', {
        applicationId: payment.applicationId,
        paymentId,
      });
    }
  }

  // Send notifications (async, non-blocking)
  setImmediate(async () => {
    try {
      await notificationService.notifyPaymentReceived({
        applicationId: payment.applicationId || paymentId,
        userId: payment.userId,
        userEmail: user.email,
        userName: user.name || 'Customer',
        visaType: applicationData?.visaType || payment.serviceType,
        paymentId: paymentId,
        invoiceNo: payment.invoiceNumber,
        amount: payment.amount,
        currency: payment.currency,
      });

      // If application was submitted, also send application notification
      if (applicationData) {
        await notificationService.notifyApplicationSubmitted({
          applicationId: payment.applicationId!,
          userId: payment.userId,
          userEmail: user.email,
          userName: user.name || 'Customer',
          visaType: applicationData.visaType,
        });
      }
    } catch (notifyError) {
      logger.error('Failed to send payment notifications', notifyError as Error);
    }
  });

  logger.info('Payment processed successfully', {
    paymentId,
    qpayPaymentId,
    applicationId: payment.applicationId,
  });
}

/**
 * POST /api/payments/create
 * Create a new payment invoice
 */
router.post(
  '/create',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const { serviceType, description, applicationId } = req.body;

      // Validate service type
      if (!SERVICE_PRICES[serviceType]) {
        return res.status(400).json({
          success: false,
          error: 'Invalid service type',
        });
      }

      // Get user for notifications
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      // If applicationId provided, verify it exists and belongs to user
      let application = null;
      if (applicationId) {
        application = await prisma.application.findFirst({
          where: {
            id: applicationId,
            userId,
          },
        });

        if (!application) {
          return res.status(404).json({
            success: false,
            error: 'Application not found',
          });
        }

        // Check if already paid
        const existingPayment = await prisma.payment.findFirst({
          where: {
            applicationId,
            status: PaymentStatus.PAID,
          },
        });

        if (existingPayment) {
          return res.status(400).json({
            success: false,
            error: 'Application already paid for',
          });
        }

        // Update application status to PAYMENT_PENDING
        await prisma.application.update({
          where: { id: applicationId },
          data: {
            status: 'PAYMENT_PENDING',
          },
        });
      }

      const amount = SERVICE_PRICES[serviceType];
      const invoiceNo = qpayService.generateInvoiceNo('TXP');

      // Create QPay invoice
      const qpayInvoice = await qpayService.createInvoice({
        invoiceNo,
        receiverCode: userId,
        description: description || `${serviceType} - TravelXpressa`,
        amount,
        callbackUrl: `${config.frontendUrl.replace('https://travelxpressa.com', 'https://travelxpressa-backend-production.up.railway.app')}/api/payments/webhook/qpay`,
      });

      // Store payment record in database
      const payment = await prisma.payment.create({
        data: {
          userId,
          amount,
          currency: 'MNT',
          status: PaymentStatus.PENDING,
          provider: PaymentProvider.QPAY,
          serviceType,
          description: description || `${serviceType} - TravelXpressa`,
          applicationId,
          invoiceNumber: invoiceNo,
          qpayInvoiceId: qpayInvoice.invoice_id,
          qpayQrText: qpayInvoice.qr_text,
          qpayQrImage: qpayInvoice.qr_image,
          qpayShortUrl: qpayInvoice.qPay_shortUrl,
          qpayDeepLinks: JSON.stringify(qpayInvoice.urls),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      logger.info('Payment created', { paymentId: payment.id, invoiceNo, amount, applicationId });

      // Send pending payment notification (async, non-blocking)
      setImmediate(async () => {
        try {
          await notificationService.notifyPaymentPending({
            applicationId: applicationId || payment.id,
            userId,
            userEmail: user.email,
            userName: user.name || 'Customer',
            visaType: application?.visaType || serviceType,
            paymentId: payment.id,
            invoiceNo,
            amount,
            currency: 'MNT',
            paymentLink: qpayInvoice.qPay_shortUrl || `${config.frontendUrl}/payment/${payment.id}`,
          });
        } catch (error) {
          logger.error('Failed to send payment pending notification', error as Error);
        }
      });

      res.json({
        success: true,
        data: {
          id: payment.id,
          invoiceNo: payment.invoiceNumber,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          qrCode: qpayInvoice.qr_text,
          qrImage: qpayInvoice.qr_image,
          shortUrl: qpayInvoice.qPay_shortUrl,
          deepLinks: qpayInvoice.urls,
          expiresAt: payment.expiresAt,
          createdAt: payment.createdAt,
        },
      });
    } catch (error) {
      logger.error('Failed to create payment', error as Error);
      res.status(500).json({
        success: false,
        error: 'Failed to create payment invoice',
      });
    }
  }
);

/**
 * GET /api/payments/:id
 * Get payment details by ID
 */
router.get(
  '/:id',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { userId, role } = (req as AuthenticatedRequest).user;
      const { id } = req.params;

      const payment = await prisma.payment.findUnique({
        where: { id },
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found',
        });
      }

      // Check authorization (user can only see their own payments, admin can see all)
      if (role !== UserRole.ADMIN && payment.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this payment',
        });
      }

      res.json({
        success: true,
        data: {
          id: payment.id,
          invoiceNo: payment.invoiceNumber,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          provider: payment.provider,
          serviceType: payment.serviceType,
          description: payment.description,
          qrCode: payment.qpayQrText,
          qrImage: payment.qpayQrImage,
          shortUrl: payment.qpayShortUrl,
          deepLinks: payment.qpayDeepLinks ? JSON.parse(payment.qpayDeepLinks) : [],
          expiresAt: payment.expiresAt,
          completedAt: payment.completedAt,
          createdAt: payment.createdAt,
        },
      });
    } catch (error) {
      logger.error('Failed to get payment', error as Error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve payment',
      });
    }
  }
);

/**
 * GET /api/payments/:id/status
 * Check payment status (also syncs with QPay)
 */
router.get(
  '/:id/status',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { userId, role } = (req as AuthenticatedRequest).user;
      const { id } = req.params;

      const payment = await prisma.payment.findUnique({
        where: { id },
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found',
        });
      }

      // Check authorization
      if (role !== UserRole.ADMIN && payment.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized',
        });
      }

      // If payment is still pending, check with QPay
      if (payment.status === PaymentStatus.PENDING && payment.qpayInvoiceId) {
        try {
          const qpayStatus = await qpayService.checkPayment(payment.qpayInvoiceId);

          if (qpayStatus.count > 0) {
            const paidPayment = qpayStatus.rows.find(p => p.payment_status === 'PAID');

            if (paidPayment) {
              // Process the successful payment
              await processSuccessfulPayment(
                payment.id,
                paidPayment.payment_id,
                new Date(paidPayment.payment_date)
              );

              return res.json({
                success: true,
                data: {
                  status: PaymentStatus.PAID,
                  paidAmount: parseInt(paidPayment.payment_amount),
                  paidAt: paidPayment.payment_date,
                  wallet: paidPayment.payment_wallet,
                },
              });
            }
          }
        } catch (qpayError) {
          logger.warn('Failed to check QPay status', { error: qpayError });
        }
      }

      res.json({
        success: true,
        data: {
          status: payment.status,
          paidAmount: payment.status === PaymentStatus.PAID ? payment.amount : null,
          paidAt: payment.completedAt,
        },
      });
    } catch (error) {
      logger.error('Failed to check payment status', error as Error);
      res.status(500).json({
        success: false,
        error: 'Failed to check payment status',
      });
    }
  }
);

/**
 * POST /api/payments/:id/cancel
 * Cancel a pending payment
 */
router.post(
  '/:id/cancel',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { userId, role } = (req as AuthenticatedRequest).user;
      const { id } = req.params;

      const payment = await prisma.payment.findUnique({
        where: { id },
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found',
        });
      }

      // Check authorization
      if (role !== UserRole.ADMIN && payment.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized',
        });
      }

      // Can only cancel pending payments
      if (payment.status !== PaymentStatus.PENDING) {
        return res.status(400).json({
          success: false,
          error: 'Can only cancel pending payments',
        });
      }

      // Cancel with QPay if possible
      if (payment.qpayInvoiceId) {
        try {
          await qpayService.cancelInvoice(payment.qpayInvoiceId);
        } catch (qpayError) {
          logger.warn('Failed to cancel QPay invoice', { error: qpayError });
        }
      }

      // Update payment status
      await prisma.payment.update({
        where: { id },
        data: {
          status: PaymentStatus.CANCELLED,
        },
      });

      // If this was for an application, revert status
      if (payment.applicationId) {
        await prisma.application.update({
          where: { id: payment.applicationId },
          data: {
            status: 'IN_PROGRESS',
          },
        });
      }

      logger.info('Payment cancelled', { paymentId: id });

      res.json({
        success: true,
        message: 'Payment cancelled successfully',
      });
    } catch (error) {
      logger.error('Failed to cancel payment', error as Error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel payment',
      });
    }
  }
);

/**
 * GET /api/payments/user/history
 * Get current user's payment history
 */
router.get(
  '/user/history',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const { page = 1, limit = 10, status } = req.query;

      const pageNum = parseInt(page as string) || 1;
      const limitNum = Math.min(parseInt(limit as string) || 10, 50);
      const skip = (pageNum - 1) * limitNum;

      const where: any = { userId };
      if (status) {
        where.status = status;
      }

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.payment.count({ where }),
      ]);

      res.json({
        success: true,
        data: payments.map(p => ({
          id: p.id,
          invoiceNo: p.invoiceNumber,
          amount: p.amount,
          currency: p.currency,
          status: p.status,
          serviceType: p.serviceType,
          description: p.description,
          createdAt: p.createdAt,
          completedAt: p.completedAt,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      logger.error('Failed to get payment history', error as Error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve payment history',
      });
    }
  }
);

/**
 * GET /api/payments/prices
 * Get service prices (public)
 */
router.get('/prices', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      currency: 'MNT',
      prices: Object.entries(SERVICE_PRICES).map(([service, price]) => ({
        service,
        price,
        priceFormatted: price.toLocaleString('mn-MN') + '₮',
      })),
    },
  });
});

// ==================== ADMIN ROUTES ====================

/**
 * GET /api/payments/admin/list
 * Get all payments (admin only)
 */
router.get(
  '/admin/list',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        provider,
        serviceType,
        startDate,
        endDate,
      } = req.query;

      const pageNum = parseInt(page as string) || 1;
      const limitNum = Math.min(parseInt(limit as string) || 20, 100);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};
      if (status) where.status = status;
      if (provider) where.provider = provider;
      if (serviceType) where.serviceType = serviceType;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate as string);
        if (endDate) where.createdAt.lte = new Date(endDate as string);
      }

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.payment.count({ where }),
      ]);

      res.json({
        success: true,
        data: payments.map(p => ({
          id: p.id,
          userId: p.userId,
          invoiceNo: p.invoiceNumber,
          amount: p.amount,
          currency: p.currency,
          status: p.status,
          provider: p.provider,
          serviceType: p.serviceType,
          description: p.description,
          applicationId: p.applicationId,
          createdAt: p.createdAt,
          completedAt: p.completedAt,
          refundedAmount: p.refundedAmount,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      logger.error('Failed to list payments', error as Error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve payments',
      });
    }
  }
);

/**
 * GET /api/payments/admin/summary
 * Get payment summary/analytics (admin only)
 */
router.get(
  '/admin/summary',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;

      const where: any = {};
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate as string);
        if (endDate) where.createdAt.lte = new Date(endDate as string);
      }

      // Get all payments in date range
      const payments = await prisma.payment.findMany({ where });

      // Calculate summary
      const summary = {
        totalRevenue: 0,
        totalTransactions: payments.length,
        successfulPayments: 0,
        failedPayments: 0,
        pendingPayments: 0,
        cancelledPayments: 0,
        refundedAmount: 0,
        byServiceType: {} as Record<string, { count: number; revenue: number }>,
        byProvider: {} as Record<string, { count: number; revenue: number }>,
        byStatus: {} as Record<string, number>,
      };

      for (const payment of payments) {
        // Count by status
        summary.byStatus[payment.status] = (summary.byStatus[payment.status] || 0) + 1;

        if (payment.status === PaymentStatus.PAID) {
          summary.successfulPayments++;
          summary.totalRevenue += payment.amount;

          // By service type
          if (!summary.byServiceType[payment.serviceType]) {
            summary.byServiceType[payment.serviceType] = { count: 0, revenue: 0 };
          }
          summary.byServiceType[payment.serviceType].count++;
          summary.byServiceType[payment.serviceType].revenue += payment.amount;

          // By provider
          if (!summary.byProvider[payment.provider]) {
            summary.byProvider[payment.provider] = { count: 0, revenue: 0 };
          }
          summary.byProvider[payment.provider].count++;
          summary.byProvider[payment.provider].revenue += payment.amount;
        } else if (payment.status === PaymentStatus.FAILED) {
          summary.failedPayments++;
        } else if (payment.status === PaymentStatus.PENDING) {
          summary.pendingPayments++;
        } else if (payment.status === PaymentStatus.CANCELLED) {
          summary.cancelledPayments++;
        } else if (payment.status === PaymentStatus.REFUNDED) {
          summary.refundedAmount += payment.refundedAmount || payment.amount;
        }
      }

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      logger.error('Failed to get payment summary', error as Error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve payment summary',
      });
    }
  }
);

/**
 * POST /api/payments/admin/:id/refund
 * Refund a payment (admin only)
 */
router.post(
  '/admin/:id/refund',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { reason, amount } = req.body;

      const payment = await prisma.payment.findUnique({
        where: { id },
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found',
        });
      }

      if (payment.status !== PaymentStatus.PAID) {
        return res.status(400).json({
          success: false,
          error: 'Can only refund paid payments',
        });
      }

      const refundAmount = amount || payment.amount;

      // Attempt QPay refund if applicable
      if (payment.providerPaymentId && payment.provider === PaymentProvider.QPAY) {
        try {
          await qpayService.refundPayment(payment.providerPaymentId);
        } catch (qpayError) {
          logger.error('QPay refund failed', qpayError as Error);
          return res.status(500).json({
            success: false,
            error: 'Failed to process refund with payment provider',
          });
        }
      }

      // Update payment record
      await prisma.payment.update({
        where: { id },
        data: {
          status: refundAmount >= payment.amount ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED,
          refundedAmount: refundAmount,
          refundReason: reason,
          refundedAt: new Date(),
        },
      });

      logger.info('Payment refunded', { paymentId: id, refundAmount, reason });

      res.json({
        success: true,
        message: 'Payment refunded successfully',
        data: { refundedAmount: refundAmount },
      });
    } catch (error) {
      logger.error('Failed to refund payment', error as Error);
      res.status(500).json({
        success: false,
        error: 'Failed to process refund',
      });
    }
  }
);

// ==================== WEBHOOK ROUTES ====================

/**
 * POST /api/payments/webhook/qpay
 * QPay callback webhook (no auth - called by QPay)
 */
router.post('/webhook/qpay', async (req: Request, res: Response) => {
  try {
    const callbackData = req.body;

    logger.info('QPay webhook received', { data: callbackData });

    // Find payment by QPay invoice ID
    const payment = await prisma.payment.findFirst({
      where: {
        qpayInvoiceId: callbackData.invoice_id,
      },
    });

    if (!payment) {
      logger.warn('Payment not found for QPay callback', { invoiceId: callbackData.invoice_id });
      return res.status(200).json({ received: true }); // Acknowledge anyway
    }

    // Skip if already processed
    if (payment.status === PaymentStatus.PAID) {
      logger.info('Payment already processed, skipping', { paymentId: payment.id });
      return res.status(200).json({ received: true });
    }

    // Verify payment status with QPay API
    try {
      const qpayStatus = await qpayService.checkPayment(callbackData.invoice_id);

      if (qpayStatus.count > 0) {
        const paidPayment = qpayStatus.rows.find(p => p.payment_status === 'PAID');

        if (paidPayment) {
          // Process the successful payment
          await processSuccessfulPayment(
            payment.id,
            paidPayment.payment_id,
            new Date(paidPayment.payment_date)
          );
        }
      }
    } catch (verifyError) {
      logger.error('Failed to verify QPay payment', verifyError as Error);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('QPay webhook error', error as Error);
    res.status(200).json({ received: true }); // Always acknowledge
  }
});

export default router;
