"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../validation/schemas");
const router = (0, express_1.Router)();
/**
 * Get current user's inquiries
 */
router.get('/inquiries/user', auth_1.authenticateToken, (0, validate_1.validate)({ query: schemas_1.paginationSchema }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.userId;
    const { page = 1, limit = 20, sortOrder = 'desc' } = req.query;
    const skip = (page - 1) * limit;
    // Get user's email first
    const user = await prisma_1.prisma.user.findUnique({
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
        prisma_1.prisma.inquiry.findMany({
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
 * Get user's dashboard statistics
 */
router.get('/dashboard/stats', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.userId;
    const [totalApplications, draftApplications, submittedApplications, totalInquiries,] = await Promise.all([
        prisma_1.prisma.application.count({ where: { userId } }),
        prisma_1.prisma.application.count({ where: { userId, status: 'DRAFT' } }),
        prisma_1.prisma.application.count({ where: { userId, status: 'SUBMITTED' } }),
        prisma_1.prisma.inquiry.count({ where: { userId } }),
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
}));
exports.default = router;
//# sourceMappingURL=user.routes.js.map