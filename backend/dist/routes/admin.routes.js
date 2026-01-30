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
const logger_1 = require("../utils/logger");
// Helper to safely extract string param
const getIdParam = (req) => {
    const id = req.params.id;
    return Array.isArray(id) ? id[0] : id;
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
    const [totalInquiries, pendingInquiries, approvedInquiries, rejectedInquiries, totalUsers, totalApplications, submittedApplications, recentInquiries, recentApplications,] = await Promise.all([
        prisma_1.prisma.inquiry.count(),
        prisma_1.prisma.inquiry.count({ where: { status: 'PENDING' } }),
        prisma_1.prisma.inquiry.count({ where: { status: 'APPROVED' } }),
        prisma_1.prisma.inquiry.count({ where: { status: 'REJECTED' } }),
        prisma_1.prisma.user.count(),
        prisma_1.prisma.application.count(),
        prisma_1.prisma.application.count({ where: { status: 'SUBMITTED' } }),
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
}));
/**
 * Get all users (admin only)
 */
router.get('/users', (0, validate_1.validate)({ query: schemas_1.paginationSchema }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 20, sortOrder = 'desc' } = req.query;
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
        prisma_1.prisma.user.findMany({
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
        prisma_1.prisma.user.count(),
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
    const skip = (page - 1) * limit;
    const [applications, total] = await Promise.all([
        prisma_1.prisma.application.findMany({
            orderBy: { createdAt: sortOrder },
            skip,
            take: limit,
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
        }),
        prisma_1.prisma.application.count(),
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