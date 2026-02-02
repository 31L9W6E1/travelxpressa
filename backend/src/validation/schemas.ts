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

// Family Info Draft Schema
export const familyInfoDraftSchema = z.object({
  fatherSurnames: z.string().max(100).optional(),
  fatherGivenNames: z.string().max(100).optional(),
  fatherDateOfBirth: optionalDateSchema,
  isFatherInUS: z.boolean().optional(),
  fatherUSStatus: z.string().max(50).optional(),
  motherSurnames: z.string().max(100).optional(),
  motherGivenNames: z.string().max(100).optional(),
  motherDateOfBirth: optionalDateSchema,
  isMotherInUS: z.boolean().optional(),
  motherUSStatus: z.string().max(50).optional(),
  hasSpouse: z.boolean().optional(),
  spouseFullName: z.string().max(200).optional(),
  spouseDateOfBirth: optionalDateSchema,
  spouseNationality: z.string().max(100).optional(),
  spouseCityOfBirth: z.string().max(100).optional(),
  spouseCountryOfBirth: z.string().max(100).optional(),
  spouseAddress: z.string().max(500).optional(),
  spouseAddressSameAsApplicant: z.boolean().optional(),
  hasChildren: z.boolean().optional(),
  children: z.array(z.object({
    fullName: z.string().max(200).optional(),
    dateOfBirth: z.string().optional(),
    relationship: z.string().max(50).optional(),
  })).optional(),
  hasImmediateRelativesInUS: z.boolean().optional(),
  immediateRelativesInUS: z.array(z.object({
    fullName: z.string().max(200).optional(),
    relationship: z.string().max(50).optional(),
    status: z.string().max(50).optional(),
  })).optional(),
  hasOtherRelativesInUS: z.boolean().optional(),
  otherRelativesInUS: z.array(z.object({
    fullName: z.string().max(200).optional(),
    relationship: z.string().max(50).optional(),
    status: z.string().max(50).optional(),
  })).optional(),
}).passthrough();

// Work/Education Draft Schema
export const workEducationDraftSchema = z.object({
  primaryOccupation: z.string().max(100).optional(),
  presentEmployerName: z.string().max(200).optional(),
  presentEmployerAddress: z.string().max(500).optional(),
  presentEmployerCity: z.string().max(100).optional(),
  presentEmployerState: z.string().max(100).optional(),
  presentEmployerPostalCode: z.string().max(20).optional(),
  presentEmployerCountry: z.string().max(100).optional(),
  presentEmployerPhone: z.string().max(30).optional(),
  monthlySalary: z.string().max(50).optional(),
  jobDuties: z.string().max(1000).optional(),
  startDate: optionalDateSchema,
  wasPreviouslyEmployed: z.boolean().optional(),
  previousEmployment: z.array(z.object({
    employerName: z.string().max(200).optional(),
    employerAddress: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    postalCode: z.string().max(20).optional(),
    country: z.string().max(100).optional(),
    phone: z.string().max(30).optional(),
    jobTitle: z.string().max(100).optional(),
    supervisorSurname: z.string().max(100).optional(),
    supervisorGivenName: z.string().max(100).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    duties: z.string().max(1000).optional(),
  })).optional(),
  hasAttendedEducation: z.boolean().optional(),
  education: z.array(z.object({
    institutionName: z.string().max(200).optional(),
    institutionAddress: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    postalCode: z.string().max(20).optional(),
    country: z.string().max(100).optional(),
    courseOfStudy: z.string().max(200).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })).optional(),
  belongsToClanOrTribe: z.boolean().optional(),
  clanOrTribeName: z.string().max(100).optional(),
  languages: z.array(z.string().max(50)).optional(),
  hasVisitedCountriesLastFiveYears: z.boolean().optional(),
  countriesVisited: z.array(z.string().max(100)).optional(),
  belongsToProfessionalOrg: z.boolean().optional(),
  professionalOrgs: z.array(z.string().max(200)).optional(),
  hasSpecializedSkills: z.boolean().optional(),
  specializedSkillsDescription: z.string().max(1000).optional(),
  hasServedInMilitary: z.boolean().optional(),
  militaryService: z.object({
    country: z.string().max(100).optional(),
    branch: z.string().max(100).optional(),
    rank: z.string().max(100).optional(),
    specialty: z.string().max(200).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }).optional(),
}).passthrough();

// Security Questions Draft Schema
export const securityInfoDraftSchema = z.object({
  hasCommunicableDisease: z.boolean().optional(),
  hasMentalOrPhysicalDisorder: z.boolean().optional(),
  isDrugAbuser: z.boolean().optional(),
  hasBeenArrested: z.boolean().optional(),
  arrestDetails: z.string().max(2000).optional(),
  hasViolatedControlledSubstancesLaw: z.boolean().optional(),
  isEngagedInProstitution: z.boolean().optional(),
  isInvolvedInMoneyLaundering: z.boolean().optional(),
  hasCommittedHumanTrafficking: z.boolean().optional(),
  hasBenefitedFromTrafficking: z.boolean().optional(),
  hasAidedHumanTrafficking: z.boolean().optional(),
  seeksEspionage: z.boolean().optional(),
  seeksToEngageInTerrorism: z.boolean().optional(),
  hasProvidedTerroristSupport: z.boolean().optional(),
  isTerroristOrganizationMember: z.boolean().optional(),
  isRelatedToTerrorist: z.boolean().optional(),
  hasParticipatedInGenocide: z.boolean().optional(),
  hasParticipatedInTorture: z.boolean().optional(),
  hasParticipatedInExtrajudicialKillings: z.boolean().optional(),
  hasRecruitedChildSoldiers: z.boolean().optional(),
  hasViolatedReligiousFreedom: z.boolean().optional(),
  hasEnforcedPopulationControls: z.boolean().optional(),
  hasInvolvedInOrganTrafficking: z.boolean().optional(),
  hasSoughtVisaByFraud: z.boolean().optional(),
  hasBeenRemovedOrDeported: z.boolean().optional(),
  hasWithheldCustodyOfUSCitizen: z.boolean().optional(),
  hasVotedInUSIllegally: z.boolean().optional(),
  hasRenouncedUSCitizenshipToAvoidTax: z.boolean().optional(),
  hasBeenInUS: z.boolean().optional(),
  usVisitDetails: z.string().max(2000).optional(),
  hasBeenIssuedUSVisa: z.boolean().optional(),
  lastVisaDetails: z.string().max(2000).optional(),
  hasBeenRefusedUSVisa: z.boolean().optional(),
  refusalDetails: z.string().max(2000).optional(),
  hasImmigrantPetitionFiled: z.boolean().optional(),
  petitionDetails: z.string().max(2000).optional(),
}).passthrough();

// Documents Draft Schema
export const documentsDraftSchema = z.object({
  photo: z.object({
    fileName: z.string().max(255).optional(),
    fileUrl: z.string().max(500).optional(),
    fileSize: z.number().optional(),
    uploadedAt: z.string().optional(),
  }).optional(),
  invitationLetter: z.object({
    fileName: z.string().max(255).optional(),
    fileUrl: z.string().max(500).optional(),
    fileSize: z.number().optional(),
    uploadedAt: z.string().optional(),
  }).optional(),
  additionalDocuments: z.array(z.object({
    fileName: z.string().max(255).optional(),
    fileUrl: z.string().max(500).optional(),
    fileSize: z.number().optional(),
    uploadedAt: z.string().optional(),
    documentType: z.string().max(50).optional(),
  })).optional(),
}).passthrough();

export const updateApplicationSchema = z.object({
  currentStep: z.number().int().min(1).max(15).optional(),
  personalInfo: personalInfoDraftSchema.optional(),
  contactInfo: contactInfoDraftSchema.optional(),
  passportInfo: passportInfoDraftSchema.optional(),
  travelInfo: travelInfoDraftSchema.optional(),
  familyInfo: familyInfoDraftSchema.optional(),
  workEducation: workEducationDraftSchema.optional(),
  securityInfo: securityInfoDraftSchema.optional(),
  documents: documentsDraftSchema.optional(),
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
