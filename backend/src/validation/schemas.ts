import { z } from 'zod';
import { UserRole, InquiryStatus, ServiceType, VisaType } from '../types';

// Common validations
const emailSchema = z.string().email('Invalid email address').max(255).toLowerCase().trim();
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const phoneSchema = z.string()
  .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format')
  .min(10, 'Phone number must be at least 10 digits')
  .max(20, 'Phone number must be less than 20 characters');

const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// Draft-friendly validators (allow empty strings for partial saves)
const optionalEmailSchema = z.string().max(255).refine(
  (val) => val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
  { message: 'Invalid email address' }
).optional();

const optionalPhoneSchema = z.string().max(20).refine(
  (val) => val === '' || val === undefined || /^[\d\s\-\+\(\)]{10,20}$/.test(val),
  { message: 'Invalid phone number format' }
).optional();

const optionalDateSchema = z.string().refine(
  (val) => val === '' || val === undefined || /^\d{4}-\d{2}-\d{2}$/.test(val),
  { message: 'Invalid date format' }
).optional();

// Auth schemas
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1).max(100).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// User schemas
export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.nativeEnum(UserRole).optional(),
});

export const updateRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
});

// Inquiry schemas
export const createInquirySchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
  serviceType: z.nativeEnum(ServiceType),
});

export const updateInquiryStatusSchema = z.object({
  status: z.nativeEnum(InquiryStatus),
  adminNotes: z.string().max(1000).optional(),
});

// DS-160 Application schemas
export const personalInfoSchema = z.object({
  surnames: z.string().min(1).max(100),
  givenNames: z.string().min(1).max(100),
  fullNameNative: z.string().max(200).optional(),
  otherNamesUsed: z.boolean().optional().default(false),
  otherNames: z.array(z.string().max(100)).max(10).optional(),
  telCode: z.string().max(5).optional().default(''),
  sex: z.enum(['M', 'F']),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED']),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  cityOfBirth: z.string().max(100).optional().default(''),
  stateOfBirth: z.string().max(100).optional(),
  countryOfBirth: z.string().min(1).max(100),
  nationality: z.string().min(1).max(100),
});

export const addressSchema = z.object({
  street: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().min(2).max(100),
});

export const contactInfoSchema = z.object({
  homeAddress: addressSchema,
  mailingAddress: addressSchema.optional(),
  phone: phoneSchema,
  secondaryPhone: phoneSchema.optional(),
  workPhone: phoneSchema.optional(),
  email: emailSchema,
});

export const passportInfoSchema = z.object({
  passportType: z.enum(['REGULAR', 'OFFICIAL', 'DIPLOMATIC', 'OTHER']),
  passportNumber: z.string()
    .min(1, 'Passport number is required')
    .max(20, 'Passport number must be less than 20 characters'),
  passportBookNumber: z.string().max(20).optional(),
  countryOfIssuance: z.string().min(1).max(100),
  cityOfIssuance: z.string().max(100).optional().default(''),
  stateOfIssuance: z.string().max(100).optional(),
  issuanceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  expirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  hasOtherPassport: z.boolean().optional().default(false),
  otherPassportInfo: z.object({
    number: z.string().max(20),
    country: z.string().min(2).max(100),
  }).optional(),
});

export const travelInfoSchema = z.object({
  purposeOfTrip: z.string().min(1).max(200),
  specificPurpose: z.string().max(500).optional(),
  intendedArrivalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  intendedLengthOfStay: z.string().max(50).optional().default(''),
  addressWhileInUS: z.object({
    street: z.string().max(200).optional().default(''),
    city: z.string().max(100).optional().default(''),
    state: z.string().max(50).optional().default(''),
    zipCode: z.string().max(10).optional(),
  }),
  payingForTrip: z.string().max(200).optional().default(''),
  travelingWithOthers: z.boolean().optional().default(false),
  companions: z.array(z.object({
    name: z.string().max(200),
    relationship: z.string().max(50),
  })).max(10).optional(),
});

export const createApplicationSchema = z.object({
  visaType: z.nativeEnum(VisaType),
});

// Draft schemas for saving partial form data (allow empty strings and missing fields)
export const personalInfoDraftSchema = z.object({
  surnames: z.string().max(100).optional(),
  givenNames: z.string().max(100).optional(),
  fullNameNative: z.string().max(200).optional(),
  otherNamesUsed: z.boolean().optional(),
  otherNames: z.array(z.string().max(100)).max(10).optional(),
  telCode: z.string().max(5).optional(),
  sex: z.enum(['M', 'F']).optional(),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED']).optional(),
  dateOfBirth: optionalDateSchema,
  cityOfBirth: z.string().max(100).optional(),
  stateOfBirth: z.string().max(100).optional(),
  countryOfBirth: z.string().max(100).optional(),
  nationality: z.string().max(100).optional(),
}).passthrough(); // Allow any extra fields

export const addressDraftSchema = z.object({
  street: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
}).passthrough().optional();

export const contactInfoDraftSchema = z.object({
  homeAddress: addressDraftSchema,
  mailingAddress: addressDraftSchema,
  phone: optionalPhoneSchema,
  secondaryPhone: optionalPhoneSchema,
  workPhone: optionalPhoneSchema,
  email: optionalEmailSchema,
}).passthrough();

export const passportInfoDraftSchema = z.object({
  passportType: z.enum(['REGULAR', 'OFFICIAL', 'DIPLOMATIC', 'OTHER']).optional(),
  passportNumber: z.string().max(20).optional(),
  passportBookNumber: z.string().max(20).optional(),
  countryOfIssuance: z.string().max(100).optional(),
  cityOfIssuance: z.string().max(100).optional(),
  stateOfIssuance: z.string().max(100).optional(),
  issuanceDate: optionalDateSchema,
  expirationDate: optionalDateSchema,
  hasOtherPassport: z.boolean().optional(),
  otherPassportInfo: z.object({
    number: z.string().max(20).optional(),
    country: z.string().max(100).optional(),
  }).optional(),
}).passthrough();

export const travelInfoDraftSchema = z.object({
  purposeOfTrip: z.string().max(200).optional(),
  specificPurpose: z.string().max(500).optional(),
  intendedArrivalDate: optionalDateSchema,
  intendedLengthOfStay: z.string().max(50).optional(),
  addressWhileInUS: z.object({
    street: z.string().max(200).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(50).optional(),
    zipCode: z.string().max(10).optional(),
  }).passthrough().optional(),
  payingForTrip: z.string().max(200).optional(),
  travelingWithOthers: z.boolean().optional(),
  companions: z.array(z.object({
    name: z.string().max(200).optional(),
    relationship: z.string().max(50).optional(),
  })).max(10).optional(),
}).passthrough();

export const updateApplicationSchema = z.object({
  currentStep: z.number().int().min(1).max(15).optional(),
  personalInfo: personalInfoDraftSchema.optional(),
  contactInfo: contactInfoDraftSchema.optional(),
  passportInfo: passportInfoDraftSchema.optional(),
  travelInfo: travelInfoDraftSchema.optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ID parameter schema
export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

// Type exports for use in route handlers
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
export type UpdateInquiryStatusInput = z.infer<typeof updateInquiryStatusSchema>;
export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;
export type ContactInfoInput = z.infer<typeof contactInfoSchema>;
export type PassportInfoInput = z.infer<typeof passportInfoSchema>;
export type TravelInfoInput = z.infer<typeof travelInfoSchema>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
