"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const schemas_1 = require("../validation/schemas");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
/**
 * Submit a new inquiry
 */
router.post('/inquiry', auth_1.optionalAuth, (0, validate_1.validate)({ body: schemas_1.createInquirySchema }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name, email, phone, message, serviceType } = req.body;
    const userId = req.user?.userId;
    const inquiry = await prisma_1.prisma.inquiry.create({
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
    logger_1.logger.info('Inquiry submitted', {
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
}));
exports.default = router;
//# sourceMappingURL=inquiry.routes.js.map