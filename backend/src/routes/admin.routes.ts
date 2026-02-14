import { Router, type Request, type Response } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { authenticateToken, isAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler, NotFoundError, BadRequestError } from '../middleware/errorHandler';
import { auditLog } from '../middleware/security';
import {
  paginationSchema,
  idParamSchema,
  updateInquiryStatusSchema,
  updateRoleSchema,
  siteSettingsSchema,
  adminInquiriesQuerySchema,
} from '../validation/schemas';
import { AuthenticatedRequest, UserRole } from '../types';
import { decrypt } from '../utils/encryption';
import { logger } from '../utils/logger';
import { getSiteSettings } from '../services/siteSettings.service';

// Helper to safely extract string param
const getIdParam = (req: Request): string => {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
};

const safeDecryptJson = (value?: string | null) => {
  if (!value) return null;
  try {
    return JSON.parse(decrypt(value));
  } catch {
    // Fallback for legacy/plain JSON values (or corrupted ciphertext).
    try {
      return JSON.parse(value);
    } catch {
      // Avoid throwing for corrupted/legacy values; admin UI can still show metadata.
      return null;
    }
  }
};

const buildDocumentsPayload = (photoUrl?: string | null, updatedAt?: Date) => {
  if (!photoUrl) return null;

  return {
    photo: {
      fileName: photoUrl.split('/').pop() || 'uploaded-photo',
      fileUrl: photoUrl,
      uploadedAt: updatedAt ? updatedAt.toISOString() : undefined,
    },
  };
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
  validate({ query: adminInquiriesQuerySchema }),
  asyncHandler(async (req: Request, res: Response) => {
    // Always read parsed query from validation middleware to avoid Prisma type errors.
    const validatedQuery = (req as any).validatedQuery ?? {};
    const page = typeof validatedQuery.page === 'number' ? validatedQuery.page : 1;
    const limit = typeof validatedQuery.limit === 'number' ? validatedQuery.limit : 20;
    const sortOrder: Prisma.SortOrder = validatedQuery.sortOrder === 'asc' ? 'asc' : 'desc';
    const status =
      typeof validatedQuery.status === 'string' && validatedQuery.status.trim()
        ? validatedQuery.status.trim()
        : undefined;
    const serviceType =
      typeof validatedQuery.serviceType === 'string' && validatedQuery.serviceType.trim()
        ? validatedQuery.serviceType.trim()
        : undefined;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.InquiryWhereInput = {};
    if (status) whereClause.status = status;
    if (serviceType) whereClause.serviceType = serviceType;

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
    // Get current date and calculate date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      // Inquiry stats
      totalInquiries,
      pendingInquiries,
      approvedInquiries,
      rejectedInquiries,
      // User stats
      totalUsers,
      usersThisMonth,
      usersLastMonth,
      // Application stats - COMPREHENSIVE
      totalApplications,
      draftApplications,
      inProgressApplications,
      submittedApplications,
      underReviewApplications,
      completedApplications,
      rejectedApplications,
      applicationsThisMonth,
      applicationsLastMonth,
      // Recent items
      recentInquiries,
      recentApplications,
      recentUsers,
      // Monthly trends (last 6 months)
      monthlyApplications,
      monthlyUsers,
    ] = await Promise.all([
      // Inquiry counts
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: 'PENDING' } }),
      prisma.inquiry.count({ where: { status: 'APPROVED' } }),
      prisma.inquiry.count({ where: { status: 'REJECTED' } }),
      // User counts
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      // Application counts by status
      prisma.application.count(),
      prisma.application.count({ where: { status: 'DRAFT' } }),
      prisma.application.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.application.count({ where: { status: 'SUBMITTED' } }),
      prisma.application.count({ where: { status: 'UNDER_REVIEW' } }),
      prisma.application.count({ where: { status: 'COMPLETED' } }),
      prisma.application.count({ where: { status: 'REJECTED' } }),
      prisma.application.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.application.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      // Recent items
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
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          lastLoginAt: true,
        },
      }),
      // Monthly application trends (last 6 months) - using raw query for grouping (PostgreSQL)
      prisma.$queryRaw`
        SELECT
          TO_CHAR("createdAt", 'YYYY-MM') as month,
          COUNT(*)::int as total,
          SUM(CASE WHEN status = 'SUBMITTED' THEN 1 ELSE 0 END)::int as submitted,
          SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END)::int as approved,
          SUM(CASE WHEN status IN ('DRAFT', 'IN_PROGRESS', 'UNDER_REVIEW') THEN 1 ELSE 0 END)::int as pending,
          SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END)::int as rejected
        FROM "Application"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
        ORDER BY month DESC
        LIMIT 6
      `,
      // Monthly user registration trends (PostgreSQL)
      prisma.$queryRaw`
        SELECT
          TO_CHAR("createdAt", 'YYYY-MM') as month,
          COUNT(*)::int as total
        FROM "User"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
        ORDER BY month DESC
        LIMIT 6
      `,
    ]);

    // Calculate growth percentages
    const userGrowth = usersLastMonth > 0
      ? Math.round(((usersThisMonth - usersLastMonth) / usersLastMonth) * 100)
      : usersThisMonth > 0 ? 100 : 0;

    const applicationGrowth = applicationsLastMonth > 0
      ? Math.round(((applicationsThisMonth - applicationsLastMonth) / applicationsLastMonth) * 100)
      : applicationsThisMonth > 0 ? 100 : 0;

    // Calculate approval rate
    const processedApplications = completedApplications + rejectedApplications;
    const approvalRate = processedApplications > 0
      ? Math.round((completedApplications / processedApplications) * 100)
      : 0;

    // Format monthly data for charts
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formatMonthlyData = (data: any[]) => {
      return data.map((item: any) => {
        const [year, month] = item.month.split('-');
        return {
          month: monthNames[parseInt(month) - 1],
          ...item,
          total: Number(item.total),
          submitted: Number(item.submitted || 0),
          approved: Number(item.approved || 0),
          pending: Number(item.pending || 0),
          rejected: Number(item.rejected || 0),
        };
      }).reverse();
    };

    res.json({
      success: true,
      data: {
        // Overview stats
        overview: {
          totalUsers,
          totalApplications,
          approvedApplications: completedApplications,
          pendingApplications: submittedApplications + underReviewApplications + inProgressApplications,
          rejectedApplications,
        },
        // Detailed user stats
        users: {
          total: totalUsers,
          thisMonth: usersThisMonth,
          lastMonth: usersLastMonth,
          growth: userGrowth,
        },
        // Detailed application stats
        applications: {
          total: totalApplications,
          draft: draftApplications,
          inProgress: inProgressApplications,
          submitted: submittedApplications,
          underReview: underReviewApplications,
          completed: completedApplications,
          rejected: rejectedApplications,
          thisMonth: applicationsThisMonth,
          lastMonth: applicationsLastMonth,
          growth: applicationGrowth,
          approvalRate,
        },
        // Inquiry stats
        inquiries: {
          total: totalInquiries,
          pending: pendingInquiries,
          approved: approvedInquiries,
          rejected: rejectedInquiries,
        },
        // Recent items
        recent: {
          inquiries: recentInquiries,
          applications: recentApplications,
          users: recentUsers,
        },
        // Chart data
        charts: {
          monthlyApplications: formatMonthlyData(monthlyApplications as any[]),
          monthlyUsers: (monthlyUsers as any[]).map((item: any) => {
            const [year, month] = item.month.split('-');
            return {
              month: monthNames[parseInt(month) - 1],
              users: Number(item.total),
            };
          }).reverse(),
        },
      },
    });
  })
);

/**
 * Get website traffic stats (admin only)
 */
router.get(
  '/traffic',
  asyncHandler(async (_req: Request, res: Response) => {
    const [lastHour, last24h, hourlyBuckets, topPages, countries24h] = await Promise.all([
      prisma.$queryRaw<
        Array<{ views: number; visitors: number }>
      >`
        SELECT
          COUNT(*)::int AS views,
          COUNT(DISTINCT COALESCE("userId", "ipAddress"))::int AS visitors
        FROM "AuditLog"
        WHERE action = 'PAGE_VIEW'
          AND entity = 'PAGE'
          AND "createdAt" >= NOW() - INTERVAL '1 hour'
          AND ("entityId" IS NULL OR "entityId" NOT LIKE '/admin%')
      `,
      prisma.$queryRaw<
        Array<{ views: number; visitors: number }>
      >`
        SELECT
          COUNT(*)::int AS views,
          COUNT(DISTINCT COALESCE("userId", "ipAddress"))::int AS visitors
        FROM "AuditLog"
        WHERE action = 'PAGE_VIEW'
          AND entity = 'PAGE'
          AND "createdAt" >= NOW() - INTERVAL '24 hours'
          AND ("entityId" IS NULL OR "entityId" NOT LIKE '/admin%')
      `,
      prisma.$queryRaw<
        Array<{ bucket: Date; views: number; visitors: number }>
      >`
        SELECT
          date_trunc('hour', "createdAt") AS bucket,
          COUNT(*)::int AS views,
          COUNT(DISTINCT COALESCE("userId", "ipAddress"))::int AS visitors
        FROM "AuditLog"
        WHERE action = 'PAGE_VIEW'
          AND entity = 'PAGE'
          AND "createdAt" >= NOW() - INTERVAL '24 hours'
          AND ("entityId" IS NULL OR "entityId" NOT LIKE '/admin%')
        GROUP BY bucket
        ORDER BY bucket ASC
      `,
      prisma.$queryRaw<
        Array<{ path: string | null; views: number }>
      >`
        SELECT
          "entityId" AS path,
          COUNT(*)::int AS views
        FROM "AuditLog"
        WHERE action = 'PAGE_VIEW'
          AND entity = 'PAGE'
          AND "createdAt" >= NOW() - INTERVAL '7 days'
          AND ("entityId" IS NULL OR "entityId" NOT LIKE '/admin%')
        GROUP BY "entityId"
        ORDER BY views DESC
        LIMIT 8
      `,
      prisma.$queryRaw<
        Array<{ countrycode: string | null; country: string | null; views: number; visitors: number }>
      >`
        SELECT
          COALESCE(
            (NULLIF(metadata, '')::jsonb -> 'geo' ->> 'countryCode'),
            (NULLIF(metadata, '')::jsonb -> 'geo' ->> 'country_code'),
            'Unknown'
          ) AS countryCode,
          COALESCE(
            (NULLIF(metadata, '')::jsonb -> 'geo' ->> 'country'),
            'Unknown'
          ) AS country,
          COUNT(*)::int AS views,
          COUNT(DISTINCT COALESCE("userId", "ipAddress"))::int AS visitors
        FROM "AuditLog"
        WHERE action = 'PAGE_VIEW'
          AND entity = 'PAGE'
          AND "createdAt" >= NOW() - INTERVAL '24 hours'
          AND ("entityId" IS NULL OR "entityId" NOT LIKE '/admin%')
        GROUP BY countryCode, country
        ORDER BY views DESC
        LIMIT 8
      `,
    ]);

    const lastHourRow = lastHour?.[0] || { views: 0, visitors: 0 };
    const last24hRow = last24h?.[0] || { views: 0, visitors: 0 };

    // Normalize to a stable 24-point series (hourly).
    const now = new Date();
    const start = new Date(now);
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() - 23);

    const byIsoHour = new Map<string, { views: number; visitors: number }>();
    for (const row of hourlyBuckets || []) {
      const bucket = row.bucket instanceof Date ? row.bucket : new Date(row.bucket as any);
      byIsoHour.set(bucket.toISOString(), { views: Number(row.views) || 0, visitors: Number(row.visitors) || 0 });
    }

    const series24h: Array<{ hour: string; views: number; visitors: number }> = [];
    for (let i = 0; i < 24; i++) {
      const d = new Date(start);
      d.setHours(start.getHours() + i);
      const iso = d.toISOString();
      const data = byIsoHour.get(iso) || { views: 0, visitors: 0 };
      series24h.push({
        hour: d.toISOString(),
        views: data.views,
        visitors: data.visitors,
      });
    }

    res.setHeader('Cache-Control', 'no-store');
    res.json({
      success: true,
      data: {
        lastHour: {
          views: Number(lastHourRow.views) || 0,
          uniqueVisitors: Number(lastHourRow.visitors) || 0,
        },
        last24h: {
          views: Number(last24hRow.views) || 0,
          uniqueVisitors: Number(last24hRow.visitors) || 0,
        },
        series24h,
        topPages7d: (topPages || []).map((row) => ({
          path: row.path || '/',
          views: Number(row.views) || 0,
        })),
        countries24h: (countries24h || []).map((row: any) => ({
          countryCode: row.countrycode || row.countryCode || 'Unknown',
          country: row.country || 'Unknown',
          views: Number(row.views) || 0,
          visitors: Number(row.visitors) || 0,
        })),
      },
    });
  })
);

/**
 * Get site settings (admin only)
 */
router.get(
  '/site-settings',
  asyncHandler(async (_req: Request, res: Response) => {
    const settings = await getSiteSettings();
    res.setHeader('Cache-Control', 'no-store');
    res.json({ success: true, data: settings });
  })
);

/**
 * Update site settings (admin only)
 */
router.put(
  '/site-settings',
  validate({ body: siteSettingsSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const adminId = (req as AuthenticatedRequest).user.userId;
    const nextSettings = req.body;
    const prevSettings = await getSiteSettings();

    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'SITE_SETTINGS_UPDATE',
        entity: 'SITE_SETTINGS',
        entityId: 'global',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        oldData: JSON.stringify(prevSettings),
        newData: JSON.stringify(nextSettings),
      },
    });

    res.setHeader('Cache-Control', 'no-store');
    res.json({
      success: true,
      data: nextSettings,
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
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const skip = (pageNum - 1) * limitNum;
    const order = sortOrder === 'asc' ? 'asc' : 'desc';

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: order },
        skip,
        take: limitNum,
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
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
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
    const status = req.query.status as string | undefined;
    const visaType = req.query.visaType as string | undefined;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 50;
    const skip = (pageNum - 1) * limitNum;
    const order = sortOrder === 'asc' ? 'asc' : 'desc';

    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (visaType) whereClause.visaType = visaType;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where: whereClause,
        orderBy: { createdAt: order },
        skip,
        take: limitNum,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.application.count({ where: whereClause }),
    ]);

    res.json({
      success: true,
      data: applications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  })
);

/**
 * Get single application with full details (admin only)
 */
router.get(
  '/applications/:id',
  validate({ params: idParamSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const id = getIdParam(req);

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, country: true },
        },
      },
    });

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    const decryptedApplication = {
      ...application,
      personalInfo: safeDecryptJson(application.personalInfo),
      contactInfo: safeDecryptJson(application.contactInfo),
      passportInfo: safeDecryptJson(application.passportInfo),
      travelInfo: safeDecryptJson(application.travelInfo),
      familyInfo: safeDecryptJson(application.familyInfo),
      workEducation: safeDecryptJson(application.workEducation),
      securityInfo: safeDecryptJson(application.securityInfo),
      documents: buildDocumentsPayload(application.photoUrl, application.updatedAt),
    };

    res.json({
      success: true,
      data: decryptedApplication,
    });
  })
);

/**
 * Update application status (admin only)
 */
router.put(
  '/applications/:id/status',
  validate({ params: idParamSchema }),
  auditLog('UPDATE_APPLICATION_STATUS'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = getIdParam(req);
    const { status, adminNotes } = req.body;
    const adminId = (req as AuthenticatedRequest).user.userId;

    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    const validStatuses = ['DRAFT', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'COMPLETED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestError('Invalid status');
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes || application.adminNotes,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    logger.audit('Application status updated', adminId, {
      applicationId: id,
      oldStatus: application.status,
      newStatus: status,
    });

    res.json({
      success: true,
      data: updatedApplication,
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
