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
const telegram_1 = require("../utils/telegram");
const config_1 = require("../config");
// Helper to safely extract string param
const getIdParam = (req) => {
    const id = req.params.id;
    return Array.isArray(id) ? id[0] : id;
};
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticateToken);
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
            return null;
        }
    }
};
/**
 * Create a new DS-160 application
 */
router.post('/', (0, validate_1.validate)({ body: schemas_1.createApplicationSchema }), (0, security_1.auditLog)('CREATE_APPLICATION'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { visaType } = req.body;
    const userId = req.user.userId;
    const application = await prisma_1.prisma.application.create({
        data: {
            userId,
            visaType,
            status: types_1.ApplicationStatus.DRAFT,
            currentStep: 1,
        },
    });
    logger_1.logger.info('Application created', { applicationId: application.id, userId });
    res.status(201).json({
        success: true,
        data: application,
    });
}));
/**
 * Get all applications for current user
 */
router.get('/', (0, validate_1.validate)({ query: schemas_1.paginationSchema }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.userId;
    const { page, limit, sortOrder } = req.query;
    const skip = (page - 1) * limit;
    const [applications, total] = await Promise.all([
        prisma_1.prisma.application.findMany({
            where: { userId },
            orderBy: { updatedAt: sortOrder },
            skip,
            take: limit,
            select: {
                id: true,
                visaType: true,
                status: true,
                currentStep: true,
                createdAt: true,
                updatedAt: true,
                submittedAt: true,
            },
        }),
        prisma_1.prisma.application.count({ where: { userId } }),
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
 * Get a specific application
 */
router.get('/:id', (0, validate_1.validate)({ params: schemas_1.idParamSchema }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const id = getIdParam(req);
    const userId = req.user.userId;
    const userRole = req.user.role;
    const application = await prisma_1.prisma.application.findUnique({
        where: { id },
    });
    if (!application) {
        throw new errorHandler_1.NotFoundError('Application not found');
    }
    // Only allow access to own applications unless admin/agent
    if (application.userId !== userId && !['ADMIN', 'AGENT'].includes(userRole)) {
        throw new errorHandler_1.NotFoundError('Application not found');
    }
    // Decrypt sensitive fields if present
    const decryptedData = {
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
        data: decryptedData,
    });
}));
/**
 * Update application - save progress
 */
router.patch('/:id', (0, validate_1.validate)({ params: schemas_1.idParamSchema, body: schemas_1.updateApplicationSchema }), (0, security_1.auditLog)('UPDATE_APPLICATION'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const id = getIdParam(req);
    const userId = req.user.userId;
    const { currentStep, personalInfo, contactInfo, passportInfo, travelInfo, familyInfo, workEducation, securityInfo, } = req.body;
    const application = await prisma_1.prisma.application.findUnique({
        where: { id },
    });
    if (!application || application.userId !== userId) {
        throw new errorHandler_1.NotFoundError('Application not found');
    }
    if (application.status === types_1.ApplicationStatus.SUBMITTED) {
        throw new errorHandler_1.BadRequestError('Cannot modify submitted application');
    }
    // Encrypt sensitive data before storing
    const updateData = {
        updatedAt: new Date(),
    };
    if (currentStep !== undefined) {
        updateData.currentStep = currentStep;
    }
    if (personalInfo) {
        updateData.personalInfo = (0, encryption_1.encrypt)(JSON.stringify(personalInfo));
    }
    if (contactInfo) {
        updateData.contactInfo = (0, encryption_1.encrypt)(JSON.stringify(contactInfo));
    }
    if (passportInfo) {
        updateData.passportInfo = (0, encryption_1.encrypt)(JSON.stringify(passportInfo));
    }
    if (travelInfo) {
        updateData.travelInfo = (0, encryption_1.encrypt)(JSON.stringify(travelInfo));
    }
    if (familyInfo) {
        updateData.familyInfo = (0, encryption_1.encrypt)(JSON.stringify(familyInfo));
    }
    if (workEducation) {
        updateData.workEducation = (0, encryption_1.encrypt)(JSON.stringify(workEducation));
    }
    if (securityInfo) {
        updateData.securityInfo = (0, encryption_1.encrypt)(JSON.stringify(securityInfo));
    }
    // Update status to IN_PROGRESS if it was DRAFT
    if (application.status === types_1.ApplicationStatus.DRAFT) {
        updateData.status = types_1.ApplicationStatus.IN_PROGRESS;
    }
    const updatedApplication = await prisma_1.prisma.application.update({
        where: { id },
        data: updateData,
    });
    logger_1.logger.info('Application updated', {
        applicationId: id,
        userId,
        step: currentStep,
    });
    res.json({
        success: true,
        data: {
            id: updatedApplication.id,
            status: updatedApplication.status,
            currentStep: updatedApplication.currentStep,
            updatedAt: updatedApplication.updatedAt,
        },
    });
}));
/**
 * Submit application for review
 */
router.post('/:id/submit', (0, validate_1.validate)({ params: schemas_1.idParamSchema }), (0, security_1.auditLog)('SUBMIT_APPLICATION'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const id = getIdParam(req);
    const userId = req.user.userId;
    const application = await prisma_1.prisma.application.findUnique({
        where: { id },
    });
    if (!application || application.userId !== userId) {
        throw new errorHandler_1.NotFoundError('Application not found');
    }
    if (application.status === types_1.ApplicationStatus.SUBMITTED) {
        throw new errorHandler_1.BadRequestError('Application already submitted');
    }
    // Validate all required sections are complete
    if (!application.personalInfo || !application.contactInfo ||
        !application.passportInfo || !application.travelInfo) {
        throw new errorHandler_1.BadRequestError('All sections must be completed before submission');
    }
    const updatedApplication = await prisma_1.prisma.application.update({
        where: { id },
        data: {
            status: types_1.ApplicationStatus.SUBMITTED,
            submittedAt: new Date(),
        },
    });
    logger_1.logger.info('Application submitted', { applicationId: id, userId });
    const adminUrl = `${config_1.config.frontendUrl.replace(/\/+$/, '')}/admin`;
    const submittedAt = updatedApplication.submittedAt
        ? updatedApplication.submittedAt.toISOString()
        : new Date().toISOString();
    const userEmail = req.user.email;
    const telegramMessage = [
        'New DS-160 application submitted',
        `Application ID: ${updatedApplication.id}`,
        `User ID: ${userId}`,
        `User Email: ${userEmail}`,
        `Visa Type: ${updatedApplication.visaType}`,
        `Submitted At: ${submittedAt}`,
        `Admin Panel: ${adminUrl}`,
    ].join('\n');
    // Notification should never block submission success.
    void (0, telegram_1.sendTelegramMessage)(telegramMessage).catch((notificationError) => {
        logger_1.logger.error('Failed to send Telegram notification for submitted application', notificationError, {
            applicationId: updatedApplication.id,
            userId,
        });
    });
    res.json({
        success: true,
        data: {
            id: updatedApplication.id,
            status: updatedApplication.status,
            submittedAt: updatedApplication.submittedAt,
        },
        message: 'Application submitted successfully',
    });
}));
/**
 * Delete application (draft only)
 */
router.delete('/:id', (0, validate_1.validate)({ params: schemas_1.idParamSchema }), (0, security_1.auditLog)('DELETE_APPLICATION'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const id = getIdParam(req);
    const userId = req.user.userId;
    const application = await prisma_1.prisma.application.findUnique({
        where: { id },
    });
    if (!application || application.userId !== userId) {
        throw new errorHandler_1.NotFoundError('Application not found');
    }
    if (application.status === types_1.ApplicationStatus.SUBMITTED) {
        throw new errorHandler_1.BadRequestError('Cannot delete submitted application');
    }
    await prisma_1.prisma.application.delete({ where: { id } });
    logger_1.logger.info('Application deleted', { applicationId: id, userId });
    res.json({
        success: true,
        message: 'Application deleted successfully',
    });
}));
// Admin/Agent routes
/**
 * Get all applications (admin/agent only)
 */
router.get('/admin/all', auth_1.isAgentOrAdmin, (0, validate_1.validate)({ query: schemas_1.paginationSchema }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page, limit, sortOrder } = req.query;
    const skip = (page - 1) * limit;
    const [applications, total] = await Promise.all([
        prisma_1.prisma.application.findMany({
            orderBy: { updatedAt: sortOrder },
            skip,
            take: limit,
            include: {
                user: {
                    select: { id: true, email: true, name: true },
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
 * Update application status (admin/agent only)
 */
router.patch('/admin/:id/status', auth_1.isAgentOrAdmin, (0, validate_1.validate)({ params: schemas_1.idParamSchema }), (0, security_1.auditLog)('ADMIN_UPDATE_APPLICATION_STATUS'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const id = getIdParam(req);
    const { status, adminNotes } = req.body;
    const adminId = req.user.userId;
    const validStatuses = Object.values(types_1.ApplicationStatus);
    if (!validStatuses.includes(status)) {
        throw new errorHandler_1.BadRequestError('Invalid status');
    }
    const application = await prisma_1.prisma.application.findUnique({
        where: { id },
    });
    if (!application) {
        throw new errorHandler_1.NotFoundError('Application not found');
    }
    const updatedApplication = await prisma_1.prisma.application.update({
        where: { id },
        data: {
            status,
            adminNotes: adminNotes || application.adminNotes,
            reviewedBy: adminId,
            reviewedAt: new Date(),
        },
    });
    logger_1.logger.audit('Application status updated by admin', adminId, {
        applicationId: id,
        oldStatus: application.status,
        newStatus: status,
    });
    res.json({
        success: true,
        data: updatedApplication,
    });
}));
exports.default = router;
//# sourceMappingURL=application.routes.js.map