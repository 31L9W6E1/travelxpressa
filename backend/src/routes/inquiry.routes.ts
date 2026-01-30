import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma';
import { validate } from '../middleware/validate';
import { optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { createInquirySchema } from '../validation/schemas';
import { AuthenticatedRequest } from '../types';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Submit a new inquiry
 */
router.post(
  '/inquiry',
  optionalAuth,
  validate({ body: createInquirySchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { name, email, phone, message, serviceType } = req.body;
    const userId = (req as AuthenticatedRequest).user?.userId;

    const inquiry = await prisma.inquiry.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        message,
        serviceType,
        status: 'PENDING',
        userId: userId || null,
      },
    });

    logger.info('Inquiry submitted', {
      inquiryId: inquiry.id,
      email,
      serviceType,
      userId,
    });

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been submitted successfully. We will contact you soon.',
      data: {
        id: inquiry.id,
        status: inquiry.status,
        createdAt: inquiry.createdAt,
      },
    });
  })
);

export default router;
