"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const errorHandler_1 = require("../middleware/errorHandler");
const security_1 = require("../middleware/security");
const schemas_1 = require("../validation/schemas");
const types_1 = require("../types");
const encryption_1 = require("../utils/encryption");
const logger_1 = require("../utils/logger");
// Helper to safely extract string param
const getIdParam = (req) => {
    const id = req.params.id;
    return Array.isArray(id) ? id[0] : id;
};
const safeDecryptJson = (value) => {
    if (!value)
        return null;
    try {
        return JSON.parse((0, encryption_1.decrypt)(value));
    }
    catch {
        // Fallback for legacy/plain JSON values (or corrupted ciphertext).
        try {
            return JSON.parse(value);
        }
        catch {
            // Avoid throwing for corrupted/legacy values; admin UI can still show metadata.
            return null;
        }
    }
};
const router = (0, express_1.Router)();
// All admin routes require authentication and admin role
router.use(auth_1.authenticateToken);
router.use(auth_1.isAdmin);
/**
 * Get all inquiries (admin only)
 */
router.get('/inquiries', (0, validate_1.validate)({ query: schemas_1.paginationSchema }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 20, sortOrder = 'desc' } = req.query;
    const status = req.query.status;
    const skip = (page - 1) * limit;
    const whereClause = status ? { status } : {};
    const [inquiries, total] = await Promise.all([
        prisma_1.prisma.inquiry.findMany({
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
        prisma_1.prisma.inquiry.count({ where: whereClause }),
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
}));
/**
 * Update inquiry status (admin only)
 */
router.put('/inquiries/:id/status', (0, validate_1.validate)({ params: schemas_1.idParamSchema, body: schemas_1.updateInquiryStatusSchema }), (0, security_1.auditLog)('UPDATE_INQUIRY_STATUS'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const id = getIdParam(req);
    const { status, adminNotes } = req.body;
    const adminId = req.user.userId;
    const inquiry = await prisma_1.prisma.inquiry.findUnique({
        where: { id },
    });
    if (!inquiry) {
        throw new errorHandler_1.NotFoundError('Inquiry not found');
    }
    const updatedInquiry = await prisma_1.prisma.inquiry.update({
        where: { id },
        data: {
            status,
            adminNotes: adminNotes || inquiry.adminNotes,
            assignedTo: adminId,
            resolvedAt: status === 'COMPLETED' ? new Date() : null,
        },
    });
    logger_1.logger.audit('Inquiry status updated', adminId, {
        inquiryId: id,
        oldStatus: inquiry.status,
        newStatus: status,
    });
    res.json({
        success: true,
        data: updatedInquiry,
    });
}));
/**
 * Delete inquiry (admin only)
 */
router.delete('/inquiries/:id', (0, validate_1.validate)({ params: schemas_1.idParamSchema }), (0, security_1.auditLog)('DELETE_INQUIRY'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const id = getIdParam(req);
    const adminId = req.user.userId;
    const inquiry = await prisma_1.prisma.inquiry.findUnique({
        where: { id },
    });
    if (!inquiry) {
        throw new errorHandler_1.NotFoundError('Inquiry not found');
    }
    await prisma_1.prisma.inquiry.delete({ where: { id } });
    logger_1.logger.audit('Inquiry deleted', adminId, { inquiryId: id });
    res.json({
        success: true,
        message: 'Inquiry deleted successfully',
    });
}));
/**
 * Get admin dashboard statistics
 */
router.get('/stats', (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    // Get current date and calculate date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const [
    // Inquiry stats
    totalInquiries, pendingInquiries, approvedInquiries, rejectedInquiries, 
    // User stats
    totalUsers, usersThisMonth, usersLastMonth, 
    // Application stats - COMPREHENSIVE
    totalApplications, draftApplications, inProgressApplications, submittedApplications, underReviewApplications, completedApplications, rejectedApplications, applicationsThisMonth, applicationsLastMonth, 
    // Recent items
    recentInquiries, recentApplications, recentUsers, 
    // Monthly trends (last 6 months)
    monthlyApplications, monthlyUsers,] = await Promise.all([
        // Inquiry counts
        prisma_1.prisma.inquiry.count(),
        prisma_1.prisma.inquiry.count({ where: { status: 'PENDING' } }),
        prisma_1.prisma.inquiry.count({ where: { status: 'APPROVED' } }),
        prisma_1.prisma.inquiry.count({ where: { status: 'REJECTED' } }),
        // User counts
        prisma_1.prisma.user.count(),
        prisma_1.prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
        prisma_1.prisma.user.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
        // Application counts by status
        prisma_1.prisma.application.count(),
        prisma_1.prisma.application.count({ where: { status: 'DRAFT' } }),
        prisma_1.prisma.application.count({ where: { status: 'IN_PROGRESS' } }),
        prisma_1.prisma.application.count({ where: { status: 'SUBMITTED' } }),
        prisma_1.prisma.application.count({ where: { status: 'UNDER_REVIEW' } }),
        prisma_1.prisma.application.count({ where: { status: 'COMPLETED' } }),
        prisma_1.prisma.application.count({ where: { status: 'REJECTED' } }),
        prisma_1.prisma.application.count({ where: { createdAt: { gte: startOfMonth } } }),
        prisma_1.prisma.application.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
        // Recent items
        prisma_1.prisma.inquiry.findMany({
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
        prisma_1.prisma.application.findMany({
            orderBy: { updatedAt: 'desc' },
            take: 5,
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        }),
        prisma_1.prisma.user.findMany({
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
        prisma_1.prisma.$queryRaw `
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
        prisma_1.prisma.$queryRaw `
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
    const formatMonthlyData = (data) => {
        return data.map((item) => {
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
                monthlyApplications: formatMonthlyData(monthlyApplications),
                monthlyUsers: monthlyUsers.map((item) => {
                    const [year, month] = item.month.split('-');
                    return {
                        month: monthNames[parseInt(month) - 1],
                        users: Number(item.total),
                    };
                }).reverse(),
            },
        },
    });
}));
/**
 * Get all users (admin only)
 */
router.get('/users', (0, validate_1.validate)({ query: schemas_1.paginationSchema }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 20, sortOrder = 'desc' } = req.query;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const skip = (pageNum - 1) * limitNum;
    const order = sortOrder === 'asc' ? 'asc' : 'desc';
    const [users, total] = await Promise.all([
        prisma_1.prisma.user.findMany({
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
        prisma_1.prisma.user.count(),
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
}));
/**
 * Get single user details (admin only)
 */
router.get('/users/:id', (0, validate_1.validate)({ params: schemas_1.idParamSchema }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const id = getIdParam(req);
    const user = await prisma_1.prisma.user.findUnique({
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
        throw new errorHandler_1.NotFoundError('User not found');
    }
    res.json({
        success: true,
        data: user,
    });
}));
/**
 * Update user role (admin only)
 */
router.put('/users/:id/role', (0, validate_1.validate)({ params: schemas_1.idParamSchema, body: schemas_1.updateRoleSchema }), (0, security_1.auditLog)('UPDATE_USER_ROLE'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const id = getIdParam(req);
    const { role } = req.body;
    const adminId = req.user.userId;
    // Prevent admin from demoting themselves
    if (id === adminId && role !== types_1.UserRole.ADMIN) {
        throw new errorHandler_1.BadRequestError('Cannot change your own role');
    }
    const user = await prisma_1.prisma.user.findUnique({
        where: { id },
    });
    if (!user) {
        throw new errorHandler_1.NotFoundError('User not found');
    }
    const updatedUser = await prisma_1.prisma.user.update({
        where: { id },
        data: { role },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
        },
    });
    logger_1.logger.audit('User role updated', adminId, {
        targetUserId: id,
        oldRole: user.role,
        newRole: role,
    });
    res.json({
        success: true,
        data: updatedUser,
    });
}));
/**
 * Delete user (admin only)
 */
router.delete('/users/:id', (0, validate_1.validate)({ params: schemas_1.idParamSchema }), (0, security_1.auditLog)('DELETE_USER'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const id = getIdParam(req);
    const adminId = req.user.userId;
    // Prevent admin from deleting themselves
    if (id === adminId) {
        throw new errorHandler_1.BadRequestError('Cannot delete your own account');
    }
    const user = await prisma_1.prisma.user.findUnique({
        where: { id },
    });
    if (!user) {
        throw new errorHandler_1.NotFoundError('User not found');
    }
    await prisma_1.prisma.user.delete({ where: { id } });
    logger_1.logger.audit('User deleted', adminId, { deletedUserId: id, email: user.email });
    res.json({
        success: true,
        message: 'User deleted successfully',
    });
}));
/**
 * Get all applications (admin only)
 */
router.get('/applications', (0, validate_1.validate)({ query: schemas_1.paginationSchema }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 50, sortOrder = 'desc' } = req.query;
    const status = req.query.status;
    const visaType = req.query.visaType;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 50;
    const skip = (pageNum - 1) * limitNum;
    const order = sortOrder === 'asc' ? 'asc' : 'desc';
    const whereClause = {};
    if (status)
        whereClause.status = status;
    if (visaType)
        whereClause.visaType = visaType;
    const [applications, total] = await Promise.all([
        prisma_1.prisma.application.findMany({
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
        prisma_1.prisma.application.count({ where: whereClause }),
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
}));
/**
 * Get single application with full details (admin only)
 */
router.get('/applications/:id', (0, validate_1.validate)({ params: schemas_1.idParamSchema }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const id = getIdParam(req);
    const application = await prisma_1.prisma.application.findUnique({
        where: { id },
        include: {
            user: {
                select: { id: true, name: true, email: true, phone: true, country: true },
            },
        },
    });
    if (!application) {
        throw new errorHandler_1.NotFoundError('Application not found');
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
    };
    res.json({
        success: true,
        data: decryptedApplication,
    });
}));
/**
 * Update application status (admin only)
 */
router.put('/applications/:id/status', (0, validate_1.validate)({ params: schemas_1.idParamSchema }), (0, security_1.auditLog)('UPDATE_APPLICATION_STATUS'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const id = getIdParam(req);
    const { status, adminNotes } = req.body;
    const adminId = req.user.userId;
    const application = await prisma_1.prisma.application.findUnique({
        where: { id },
    });
    if (!application) {
        throw new errorHandler_1.NotFoundError('Application not found');
    }
    const validStatuses = ['DRAFT', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'COMPLETED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
        throw new errorHandler_1.BadRequestError('Invalid status');
    }
    const updatedApplication = await prisma_1.prisma.application.update({
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
    logger_1.logger.audit('Application status updated', adminId, {
        applicationId: id,
        oldStatus: application.status,
        newStatus: status,
    });
    res.json({
        success: true,
        data: updatedApplication,
    });
}));
/**
 * Get audit logs (admin only)
 */
router.get('/audit-logs', (0, validate_1.validate)({ query: schemas_1.paginationSchema }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 20, sortOrder = 'desc' } = req.query;
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
        prisma_1.prisma.auditLog.findMany({
            orderBy: { createdAt: sortOrder },
            skip,
            take: limit,
            include: {
                user: { select: { name: true, email: true } },
            },
        }),
        prisma_1.prisma.auditLog.count(),
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
}));
exports.default = router;
//# sourceMappingURL=admin.routes.js.map