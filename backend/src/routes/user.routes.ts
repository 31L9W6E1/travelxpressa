import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validate';
import { paginationSchema } from '../validation/schemas';
import { AuthenticatedRequest } from '../types';

const router = Router();

/**
 * Get current user's inquiries
 */
router.get(
  '/inquiries/user',
  authenticateToken,
  validate({ query: paginationSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user.userId;
    const { page = 1, limit = 20, sortOrder = 'desc' } = req.query as any;
    const skip = (page - 1) * limit;

    // Get user's email first
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      return res.json({
        success: true,
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      });
    }

    // Find inquiries by userId or email
    const whereClause = {
      OR: [
        { userId },
        { email: user.email },
      ],
    };

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where: whereClause,
        orderBy: { createdAt: sortOrder },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          serviceType: true,
          status: true,
          message: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.inquiry.count({ where: whereClause }),
    ]);

    res.json({
      success: true,
      data: inquiries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
);

/**
 * Get user's dashboard statistics
 */
router.get(
  '/dashboard/stats',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user.userId;

    const [
      totalApplications,
      draftApplications,
      submittedApplications,
      totalInquiries,
    ] = await Promise.all([
      prisma.application.count({ where: { userId } }),
      prisma.application.count({ where: { userId, status: 'DRAFT' } }),
      prisma.application.count({ where: { userId, status: 'SUBMITTED' } }),
      prisma.inquiry.count({ where: { userId } }),
    ]);

    res.json({
      success: true,
      data: {
        applications: {
          total: totalApplications,
          draft: draftApplications,
          submitted: submittedApplications,
        },
        inquiries: {
          total: totalInquiries,
        },
      },
    });
  })
);

export default router;
