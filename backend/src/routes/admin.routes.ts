import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, isAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler, NotFoundError, BadRequestError } from '../middleware/errorHandler';
import { auditLog } from '../middleware/security';
import { paginationSchema, idParamSchema, updateInquiryStatusSchema, updateRoleSchema } from '../validation/schemas';
import { AuthenticatedRequest, UserRole } from '../types';
import { logger } from '../utils/logger';

// Helper to safely extract string param
const getIdParam = (req: Request): string => {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
};

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(isAdmin);

/**
 * Get all inquiries (admin only)
 */
router.get(
  '/inquiries',
  validate({ query: paginationSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 20, sortOrder = 'desc' } = req.query as any;
    const status = req.query.status as string | undefined;
    const skip = (page - 1) * limit;

    const whereClause = status ? { status } : {};

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where: whereClause,
        orderBy: { createdAt: sortOrder },
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
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
 * Update inquiry status (admin only)
 */
router.put(
  '/inquiries/:id/status',
  validate({ params: idParamSchema, body: updateInquiryStatusSchema }),
  auditLog('UPDATE_INQUIRY_STATUS'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = getIdParam(req);
    const { status, adminNotes } = req.body;
    const adminId = (req as AuthenticatedRequest).user.userId;

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
    });

    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }

    const updatedInquiry = await prisma.inquiry.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes || inquiry.adminNotes,
        assignedTo: adminId,
        resolvedAt: status === 'COMPLETED' ? new Date() : null,
      },
    });

    logger.audit('Inquiry status updated', adminId, {
      inquiryId: id,
      oldStatus: inquiry.status,
      newStatus: status,
    });

    res.json({
      success: true,
      data: updatedInquiry,
    });
  })
);

/**
 * Delete inquiry (admin only)
 */
router.delete(
  '/inquiries/:id',
  validate({ params: idParamSchema }),
  auditLog('DELETE_INQUIRY'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = getIdParam(req);
    const adminId = (req as AuthenticatedRequest).user.userId;

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
    });

    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }

    await prisma.inquiry.delete({ where: { id } });

    logger.audit('Inquiry deleted', adminId, { inquiryId: id });

    res.json({
      success: true,
      message: 'Inquiry deleted successfully',
    });
  })
);

/**
 * Get admin dashboard statistics
 */
router.get(
  '/stats',
  asyncHandler(async (_req: Request, res: Response) => {
    const [
      totalInquiries,
      pendingInquiries,
      approvedInquiries,
      rejectedInquiries,
      totalUsers,
      totalApplications,
      submittedApplications,
      recentInquiries,
      recentApplications,
    ] = await Promise.all([
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: 'PENDING' } }),
      prisma.inquiry.count({ where: { status: 'APPROVED' } }),
      prisma.inquiry.count({ where: { status: 'REJECTED' } }),
      prisma.user.count(),
      prisma.application.count(),
      prisma.application.count({ where: { status: 'SUBMITTED' } }),
      prisma.inquiry.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          serviceType: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.application.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        inquiries: {
          total: totalInquiries,
          pending: pendingInquiries,
          approved: approvedInquiries,
          rejected: rejectedInquiries,
        },
        users: {
          total: totalUsers,
        },
        applications: {
          total: totalApplications,
          submitted: submittedApplications,
        },
        recent: {
          inquiries: recentInquiries,
          applications: recentApplications,
        },
      },
    });
  })
);

/**
 * Get all users (admin only)
 */
router.get(
  '/users',
  validate({ query: paginationSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 20, sortOrder = 'desc' } = req.query as any;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: sortOrder },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              applications: true,
              inquiries: true,
            },
          },
        },
      }),
      prisma.user.count(),
    ]);

    res.json({
      success: true,
      data: users,
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
 * Get single user details (admin only)
 */
router.get(
  '/users/:id',
  validate({ params: idParamSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const id = getIdParam(req);

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        country: true,
        emailVerified: true,
        twoFactorEnabled: true,
        failedLogins: true,
        lockedUntil: true,
        lastLoginAt: true,
        lastLoginIp: true,
        createdAt: true,
        updatedAt: true,
        applications: {
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            visaType: true,
            status: true,
            currentStep: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        inquiries: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            serviceType: true,
            status: true,
            message: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            applications: true,
            inquiries: true,
            refreshTokens: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({
      success: true,
      data: user,
    });
  })
);

/**
 * Update user role (admin only)
 */
router.put(
  '/users/:id/role',
  validate({ params: idParamSchema, body: updateRoleSchema }),
  auditLog('UPDATE_USER_ROLE'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = getIdParam(req);
    const { role } = req.body;
    const adminId = (req as AuthenticatedRequest).user.userId;

    // Prevent admin from demoting themselves
    if (id === adminId && role !== UserRole.ADMIN) {
      throw new BadRequestError('Cannot change your own role');
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    logger.audit('User role updated', adminId, {
      targetUserId: id,
      oldRole: user.role,
      newRole: role,
    });

    res.json({
      success: true,
      data: updatedUser,
    });
  })
);

/**
 * Delete user (admin only)
 */
router.delete(
  '/users/:id',
  validate({ params: idParamSchema }),
  auditLog('DELETE_USER'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = getIdParam(req);
    const adminId = (req as AuthenticatedRequest).user.userId;

    // Prevent admin from deleting themselves
    if (id === adminId) {
      throw new BadRequestError('Cannot delete your own account');
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    await prisma.user.delete({ where: { id } });

    logger.audit('User deleted', adminId, { deletedUserId: id, email: user.email });

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  })
);

/**
 * Get all applications (admin only)
 */
router.get(
  '/applications',
  validate({ query: paginationSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 50, sortOrder = 'desc' } = req.query as any;
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        orderBy: { createdAt: sortOrder },
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.application.count(),
    ]);

    res.json({
      success: true,
      data: applications,
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
 * Get audit logs (admin only)
 */
router.get(
  '/audit-logs',
  validate({ query: paginationSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 20, sortOrder = 'desc' } = req.query as any;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        orderBy: { createdAt: sortOrder },
        skip,
        take: limit,
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.auditLog.count(),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
);

export default router;
