"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParamSchema = exports.paginationSchema = exports.updateApplicationSchema = exports.createApplicationSchema = exports.travelInfoSchema = exports.passportInfoSchema = exports.contactInfoSchema = exports.addressSchema = exports.personalInfoSchema = exports.updateInquiryStatusSchema = exports.createInquirySchema = exports.updateRoleSchema = exports.updateUserSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const types_1 = require("../types");
// Common validations
const emailSchema = zod_1.z.string().email('Invalid email address').max(255).toLowerCase().trim();
const passwordSchema = zod_1.z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');
const phoneSchema = zod_1.z.string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 characters');
const nameSchema = zod_1.z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');
// Auth schemas
exports.registerSchema = zod_1.z.object({
    email: emailSchema,
    password: passwordSchema,
    name: zod_1.z.string().min(1).max(100).optional(),
});
exports.loginSchema = zod_1.z.object({
    email: emailSchema,
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
// User schemas
exports.updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    role: zod_1.z.nativeEnum(types_1.UserRole).optional(),
});
exports.updateRoleSchema = zod_1.z.object({
    role: zod_1.z.nativeEnum(types_1.UserRole),
});
// Inquiry schemas
exports.createInquirySchema = zod_1.z.object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    message: zod_1.z.string()
        .min(10, 'Message must be at least 10 characters')
        .max(2000, 'Message must be less than 2000 characters'),
    serviceType: zod_1.z.nativeEnum(types_1.ServiceType),
});
exports.updateInquiryStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(types_1.InquiryStatus),
    adminNotes: zod_1.z.string().max(1000).optional(),
});
// DS-160 Application schemas
exports.personalInfoSchema = zod_1.z.object({
    surnames: zod_1.z.string().min(1).max(100),
    givenNames: zod_1.z.string().min(1).max(100),
    fullNameNative: zod_1.z.string().max(200).optional(),
    otherNamesUsed: zod_1.z.boolean(),
    otherNames: zod_1.z.array(zod_1.z.string().max(100)).max(10).optional(),
    telCode: zod_1.z.string().min(1).max(5),
    sex: zod_1.z.enum(['M', 'F']),
    maritalStatus: zod_1.z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED']),
    dateOfBirth: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    cityOfBirth: zod_1.z.string().min(1).max(100),
    stateOfBirth: zod_1.z.string().max(100).optional(),
    countryOfBirth: zod_1.z.string().min(2).max(100),
    nationality: zod_1.z.string().min(2).max(100),
});
exports.addressSchema = zod_1.z.object({
    street: zod_1.z.string().min(1).max(200),
    city: zod_1.z.string().min(1).max(100),
    state: zod_1.z.string().max(100).optional(),
    postalCode: zod_1.z.string().max(20).optional(),
    country: zod_1.z.string().min(2).max(100),
});
exports.contactInfoSchema = zod_1.z.object({
    homeAddress: exports.addressSchema,
    mailingAddress: exports.addressSchema.optional(),
    phone: phoneSchema,
    secondaryPhone: phoneSchema.optional(),
    workPhone: phoneSchema.optional(),
    email: emailSchema,
});
exports.passportInfoSchema = zod_1.z.object({
    passportType: zod_1.z.enum(['REGULAR', 'OFFICIAL', 'DIPLOMATIC', 'OTHER']),
    passportNumber: zod_1.z.string()
        .min(5, 'Passport number must be at least 5 characters')
        .max(20, 'Passport number must be less than 20 characters')
        .regex(/^[A-Z0-9]+$/, 'Passport number can only contain uppercase letters and numbers'),
    passportBookNumber: zod_1.z.string().max(20).optional(),
    countryOfIssuance: zod_1.z.string().min(2).max(100),
    cityOfIssuance: zod_1.z.string().min(1).max(100),
    stateOfIssuance: zod_1.z.string().max(100).optional(),
    issuanceDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    expirationDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    hasOtherPassport: zod_1.z.boolean(),
    otherPassportInfo: zod_1.z.object({
        number: zod_1.z.string().max(20),
        country: zod_1.z.string().min(2).max(100),
    }).optional(),
});
exports.travelInfoSchema = zod_1.z.object({
    purposeOfTrip: zod_1.z.string().min(1).max(200),
    specificPurpose: zod_1.z.string().max(500).optional(),
    intendedArrivalDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    intendedLengthOfStay: zod_1.z.string().min(1).max(50),
    addressWhileInUS: zod_1.z.object({
        street: zod_1.z.string().min(1).max(200),
        city: zod_1.z.string().min(1).max(100),
        state: zod_1.z.string().min(2).max(2),
        zipCode: zod_1.z.string().max(10).optional(),
    }),
    payingForTrip: zod_1.z.string().min(1).max(200),
    travelingWithOthers: zod_1.z.boolean(),
    companions: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().max(200),
        relationship: zod_1.z.string().max(50),
    })).max(10).optional(),
});
exports.createApplicationSchema = zod_1.z.object({
    visaType: zod_1.z.nativeEnum(types_1.VisaType),
});
exports.updateApplicationSchema = zod_1.z.object({
    currentStep: zod_1.z.number().int().min(1).max(15).optional(),
    personalInfo: exports.personalInfoSchema.optional(),
    contactInfo: exports.contactInfoSchema.optional(),
    passportInfo: exports.passportInfoSchema.optional(),
    travelInfo: exports.travelInfoSchema.optional(),
});
// Pagination schema
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(20),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
// ID parameter schema
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'ID is required'),
});
//# sourceMappingURL=schemas.js.map