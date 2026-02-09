import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, isAgentOrAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler, NotFoundError, BadRequestError } from '../middleware/errorHandler';
import { auditLog } from '../middleware/security';
import {
  createApplicationSchema,
  updateApplicationSchema,
  paginationSchema,
  idParamSchema,
} from '../validation/schemas';
import { AuthenticatedRequest, ApplicationStatus } from '../types';
import { encrypt, decrypt } from '../utils/encryption';
import { logger } from '../utils/logger';
import { sendTelegramMessage } from '../utils/telegram';
import { config } from '../config';

// Helper to safely extract string param
const getIdParam = (req: Request): string => {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
};

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * Create a new DS-160 application
 */
router.post(
  '/',
  validate({ body: createApplicationSchema }),
  auditLog('CREATE_APPLICATION'),
  asyncHandler(async (req: Request, res: Response) => {
    const { visaType } = req.body;
    const userId = (req as AuthenticatedRequest).user.userId;

    const application = await prisma.application.create({
      data: {
        userId,
        visaType,
        status: ApplicationStatus.DRAFT,
        currentStep: 1,
      },
    });

    logger.info('Application created', { applicationId: application.id, userId });

    res.status(201).json({
      success: true,
      data: application,
    });
  })
);

/**
 * Get all applications for current user
 */
router.get(
  '/',
  validate({ query: paginationSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user.userId;
    const { page, limit, sortOrder } = req.query as any;

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
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
      prisma.application.count({ where: { userId } }),
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
 * Get a specific application
 */
router.get(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const id = getIdParam(req);
    const userId = (req as AuthenticatedRequest).user.userId;
    const userRole = (req as AuthenticatedRequest).user.role;

    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    // Only allow access to own applications unless admin/agent
    if (application.userId !== userId && !['ADMIN', 'AGENT'].includes(userRole)) {
      throw new NotFoundError('Application not found');
    }

    // Decrypt sensitive fields if present
    const decryptedData = {
      ...application,
      personalInfo: application.personalInfo ? JSON.parse(decrypt(application.personalInfo as string)) : null,
      contactInfo: application.contactInfo ? JSON.parse(decrypt(application.contactInfo as string)) : null,
      passportInfo: application.passportInfo ? JSON.parse(decrypt(application.passportInfo as string)) : null,
      travelInfo: application.travelInfo ? JSON.parse(decrypt(application.travelInfo as string)) : null,
    };

    res.json({
      success: true,
      data: decryptedData,
    });
  })
);

/**
 * Update application - save progress
 */
router.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateApplicationSchema }),
  auditLog('UPDATE_APPLICATION'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = getIdParam(req);
    const userId = (req as AuthenticatedRequest).user.userId;
    const { currentStep, personalInfo, contactInfo, passportInfo, travelInfo } = req.body;

    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application || application.userId !== userId) {
      throw new NotFoundError('Application not found');
    }

    if (application.status === ApplicationStatus.SUBMITTED) {
      throw new BadRequestError('Cannot modify submitted application');
    }

    // Encrypt sensitive data before storing
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (currentStep !== undefined) {
      updateData.currentStep = currentStep;
    }

    if (personalInfo) {
      updateData.personalInfo = encrypt(JSON.stringify(personalInfo));
    }

    if (contactInfo) {
      updateData.contactInfo = encrypt(JSON.stringify(contactInfo));
    }

    if (passportInfo) {
      updateData.passportInfo = encrypt(JSON.stringify(passportInfo));
    }

    if (travelInfo) {
      updateData.travelInfo = encrypt(JSON.stringify(travelInfo));
    }

    // Update status to IN_PROGRESS if it was DRAFT
    if (application.status === ApplicationStatus.DRAFT) {
      updateData.status = ApplicationStatus.IN_PROGRESS;
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: updateData,
    });

    logger.info('Application updated', {
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
  })
);

/**
 * Submit application for review
 */
router.post(
  '/:id/submit',
  validate({ params: idParamSchema }),
  auditLog('SUBMIT_APPLICATION'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = getIdParam(req);
    const userId = (req as AuthenticatedRequest).user.userId;

    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application || application.userId !== userId) {
      throw new NotFoundError('Application not found');
    }

    if (application.status === ApplicationStatus.SUBMITTED) {
      throw new BadRequestError('Application already submitted');
    }

    // Validate all required sections are complete
    if (!application.personalInfo || !application.contactInfo ||
        !application.passportInfo || !application.travelInfo) {
      throw new BadRequestError('All sections must be completed before submission');
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status: ApplicationStatus.SUBMITTED,
        submittedAt: new Date(),
      },
    });

    logger.info('Application submitted', { applicationId: id, userId });

    const adminUrl = `${config.frontendUrl.replace(/\/+$/, '')}/admin`;
    const submittedAt = updatedApplication.submittedAt
      ? updatedApplication.submittedAt.toISOString()
      : new Date().toISOString();
    const userEmail = (req as AuthenticatedRequest).user.email;

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
    void sendTelegramMessage(telegramMessage).catch((notificationError) => {
      logger.error('Failed to send Telegram notification for submitted application', notificationError, {
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
  })
);

/**
 * Delete application (draft only)
 */
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  auditLog('DELETE_APPLICATION'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = getIdParam(req);
    const userId = (req as AuthenticatedRequest).user.userId;

    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application || application.userId !== userId) {
      throw new NotFoundError('Application not found');
    }

    if (application.status === ApplicationStatus.SUBMITTED) {
      throw new BadRequestError('Cannot delete submitted application');
    }

    await prisma.application.delete({ where: { id } });

    logger.info('Application deleted', { applicationId: id, userId });

    res.json({
      success: true,
      message: 'Application deleted successfully',
    });
  })
);

// Admin/Agent routes

/**
 * Get all applications (admin/agent only)
 */
router.get(
  '/admin/all',
  isAgentOrAdmin,
  validate({ query: paginationSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, sortOrder } = req.query as any;
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        orderBy: { updatedAt: sortOrder },
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, email: true, name: true },
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
 * Update application status (admin/agent only)
 */
router.patch(
  '/admin/:id/status',
  isAgentOrAdmin,
  validate({ params: idParamSchema }),
  auditLog('ADMIN_UPDATE_APPLICATION_STATUS'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = getIdParam(req);
    const { status, adminNotes } = req.body;
    const adminId = (req as AuthenticatedRequest).user.userId;

    const validStatuses = Object.values(ApplicationStatus);
    if (!validStatuses.includes(status)) {
      throw new BadRequestError('Invalid status');
    }

    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes || application.adminNotes,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });

    logger.audit('Application status updated by admin', adminId, {
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

export default router;
