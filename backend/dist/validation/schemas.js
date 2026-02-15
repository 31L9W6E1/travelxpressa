"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParamSchema = exports.adminInquiriesQuerySchema = exports.paginationSchema = exports.flightSearchSchema = exports.updateApplicationSchema = exports.documentsDraftSchema = exports.securityInfoDraftSchema = exports.workEducationDraftSchema = exports.familyInfoDraftSchema = exports.travelInfoDraftSchema = exports.passportInfoDraftSchema = exports.contactInfoDraftSchema = exports.addressDraftSchema = exports.personalInfoDraftSchema = exports.createApplicationSchema = exports.travelInfoSchema = exports.passportInfoSchema = exports.contactInfoSchema = exports.addressSchema = exports.personalInfoSchema = exports.updateInquiryStatusSchema = exports.createInquirySchema = exports.updateRoleSchema = exports.updateUserSchema = exports.siteSettingsSchema = exports.pageViewSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
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
const phoneSchema = zod_1.z
    .string()
    .trim()
    .max(30, 'Phone number must be less than 30 characters')
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format')
    .refine((value) => {
    // Accept international formats (spaces, +, -, parentheses) but enforce a sane digit count.
    const digits = value.replace(/\D/g, '');
    return digits.length >= 8 && digits.length <= 15;
}, 'Phone number must be 8-15 digits');
const nameSchema = zod_1.z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters');
// Draft-friendly validators - very permissive for partial saves
// These accept any string value including empty strings
const optionalEmailDraft = zod_1.z.string().max(255).optional().or(zod_1.z.literal(''));
const optionalPhoneDraft = zod_1.z.string().max(30).optional().or(zod_1.z.literal(''));
const optionalDateDraft = zod_1.z.string().max(20).optional().or(zod_1.z.literal(''));
const optionalStringDraft = zod_1.z.string().optional().or(zod_1.z.literal(''));
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
exports.forgotPasswordSchema = zod_1.z.object({
    email: emailSchema,
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Reset token is required'),
    newPassword: passwordSchema,
});
// Site / Analytics schemas
exports.pageViewSchema = zod_1.z.object({
    path: zod_1.z
        .string()
        .min(1, 'Path is required')
        .max(200, 'Path is too long')
        .refine((value) => value.startsWith('/'), {
        message: 'Path must start with /',
    })
        .refine((value) => !value.includes('://'), {
        message: 'Path must not be a URL',
    }),
    title: zod_1.z.string().max(200).optional(),
    referrer: zod_1.z.string().max(500).optional(),
    locale: zod_1.z.string().max(10).optional(),
});
exports.siteSettingsSchema = zod_1.z.object({
    maintenance: zod_1.z.object({
        enabled: zod_1.z.boolean(),
        message: zod_1.z.string().max(500).optional().or(zod_1.z.literal('')),
    }),
    visibility: zod_1.z.object({
        about: zod_1.z.boolean(),
        learnMore: zod_1.z.boolean(),
        translationService: zod_1.z.boolean(),
        gallery: zod_1.z.boolean(),
        news: zod_1.z.boolean(),
        blog: zod_1.z.boolean(),
        flight: zod_1.z.boolean(),
        insurance: zod_1.z.boolean(),
        helpCenter: zod_1.z.boolean(),
        qAndA: zod_1.z.boolean(),
        feedback: zod_1.z.boolean(),
    }),
    agreement: zod_1.z
        .object({
        template: zod_1.z.string().min(50).max(40000),
        version: zod_1.z.string().max(80).optional().or(zod_1.z.literal('')),
    })
        .optional(),
    quickHelp: zod_1.z
        .object({
        title: zod_1.z.string().max(120).optional().or(zod_1.z.literal('')),
        description: zod_1.z.string().max(800).optional().or(zod_1.z.literal('')),
        facebookUrl: zod_1.z.string().max(500).optional().or(zod_1.z.literal('')),
        phone: zod_1.z.string().max(120).optional().or(zod_1.z.literal('')),
        email: zod_1.z.string().max(200).optional().or(zod_1.z.literal('')),
        branch1Title: zod_1.z.string().max(120).optional().or(zod_1.z.literal('')),
        branch1Hours: zod_1.z.string().max(1000).optional().or(zod_1.z.literal('')),
        headOfficeTitle: zod_1.z.string().max(120).optional().or(zod_1.z.literal('')),
        headOfficeHours: zod_1.z.string().max(1000).optional().or(zod_1.z.literal('')),
        onlineHours: zod_1.z.string().max(1000).optional().or(zod_1.z.literal('')),
    })
        .optional(),
    galleryHeroImageUrl: zod_1.z.string().max(2000).optional().or(zod_1.z.literal('')),
    qAndAItems: zod_1.z
        .array(zod_1.z.object({
        q: zod_1.z.string().min(1).max(500),
        a: zod_1.z.string().min(1).max(2000),
    }))
        .max(60)
        .optional(),
    galleryDemoItems: zod_1.z
        .array(zod_1.z.object({
        id: zod_1.z.number().int().min(1).max(9999).optional(),
        src: zod_1.z.string().min(1).max(2000),
        alt: zod_1.z.string().min(1).max(200),
        title: zod_1.z.string().max(200).optional().or(zod_1.z.literal('')),
        category: zod_1.z.string().min(1).max(80),
        tags: zod_1.z.array(zod_1.z.string().max(40)).max(20).optional(),
        description: zod_1.z.string().max(500).optional().or(zod_1.z.literal('')),
        published: zod_1.z.boolean().optional(),
    }))
        .max(120)
        .optional(),
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
        .max(10000, 'Message must be less than 10000 characters'),
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
    otherNamesUsed: zod_1.z.boolean().optional().default(false),
    otherNames: zod_1.z.array(zod_1.z.string().max(100)).max(10).optional(),
    telCode: zod_1.z.string().max(5).optional().default(''),
    sex: zod_1.z.enum(['M', 'F']),
    maritalStatus: zod_1.z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED']),
    dateOfBirth: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    cityOfBirth: zod_1.z.string().max(100).optional().default(''),
    stateOfBirth: zod_1.z.string().max(100).optional(),
    countryOfBirth: zod_1.z.string().min(1).max(100),
    nationality: zod_1.z.string().min(1).max(100),
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
        .min(1, 'Passport number is required')
        .max(20, 'Passport number must be less than 20 characters'),
    passportBookNumber: zod_1.z.string().max(20).optional(),
    countryOfIssuance: zod_1.z.string().min(1).max(100),
    cityOfIssuance: zod_1.z.string().max(100).optional().default(''),
    stateOfIssuance: zod_1.z.string().max(100).optional(),
    issuanceDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    expirationDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    hasOtherPassport: zod_1.z.boolean().optional().default(false),
    otherPassportInfo: zod_1.z.object({
        number: zod_1.z.string().max(20),
        country: zod_1.z.string().min(2).max(100),
    }).optional(),
});
exports.travelInfoSchema = zod_1.z.object({
    purposeOfTrip: zod_1.z.string().min(1).max(200),
    specificPurpose: zod_1.z.string().max(500).optional(),
    intendedArrivalDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    intendedLengthOfStay: zod_1.z.string().max(50).optional().default(''),
    addressWhileInUS: zod_1.z.object({
        street: zod_1.z.string().max(200).optional().default(''),
        city: zod_1.z.string().max(100).optional().default(''),
        state: zod_1.z.string().max(50).optional().default(''),
        zipCode: zod_1.z.string().max(10).optional(),
    }),
    payingForTrip: zod_1.z.string().max(200).optional().default(''),
    travelingWithOthers: zod_1.z.boolean().optional().default(false),
    companions: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().max(200),
        relationship: zod_1.z.string().max(50),
    })).max(10).optional(),
});
exports.createApplicationSchema = zod_1.z.object({
    visaType: zod_1.z.nativeEnum(types_1.VisaType),
});
// Draft schemas for saving partial form data (very permissive - accept anything)
// Using z.any() for nested objects to avoid validation issues during partial saves
exports.personalInfoDraftSchema = zod_1.z.object({
    surnames: optionalStringDraft,
    givenNames: optionalStringDraft,
    fullNameNative: optionalStringDraft,
    otherNamesUsed: zod_1.z.boolean().optional(),
    otherNames: zod_1.z.array(zod_1.z.string()).optional(),
    telCode: optionalStringDraft,
    sex: zod_1.z.string().optional(),
    maritalStatus: zod_1.z.string().optional(),
    dateOfBirth: optionalDateDraft,
    cityOfBirth: optionalStringDraft,
    stateOfBirth: optionalStringDraft,
    countryOfBirth: optionalStringDraft,
    nationality: optionalStringDraft,
}).passthrough();
exports.addressDraftSchema = zod_1.z.object({
    street: optionalStringDraft,
    city: optionalStringDraft,
    state: optionalStringDraft,
    postalCode: optionalStringDraft,
    country: optionalStringDraft,
}).passthrough().optional();
exports.contactInfoDraftSchema = zod_1.z.object({
    homeAddress: zod_1.z.any().optional(),
    mailingAddress: zod_1.z.any().optional(),
    phone: optionalPhoneDraft,
    secondaryPhone: optionalPhoneDraft,
    workPhone: optionalPhoneDraft,
    email: optionalEmailDraft,
}).passthrough();
exports.passportInfoDraftSchema = zod_1.z.object({
    passportType: zod_1.z.string().optional(),
    passportNumber: optionalStringDraft,
    passportBookNumber: optionalStringDraft,
    countryOfIssuance: optionalStringDraft,
    cityOfIssuance: optionalStringDraft,
    stateOfIssuance: optionalStringDraft,
    issuanceDate: optionalDateDraft,
    expirationDate: optionalDateDraft,
    hasOtherPassport: zod_1.z.boolean().optional(),
    otherPassportInfo: zod_1.z.any().optional(),
}).passthrough();
exports.travelInfoDraftSchema = zod_1.z.object({
    purposeOfTrip: optionalStringDraft,
    specificPurpose: optionalStringDraft,
    intendedArrivalDate: optionalDateDraft,
    intendedLengthOfStay: optionalStringDraft,
    addressWhileInUS: zod_1.z.any().optional(),
    payingForTrip: optionalStringDraft,
    travelingWithOthers: zod_1.z.boolean().optional(),
    companions: zod_1.z.array(zod_1.z.any()).optional(),
}).passthrough();
// Family Info Draft Schema
exports.familyInfoDraftSchema = zod_1.z.object({
    fatherSurnames: zod_1.z.string().max(100).optional(),
    fatherGivenNames: zod_1.z.string().max(100).optional(),
    fatherDateOfBirth: optionalDateDraft,
    isFatherInUS: zod_1.z.boolean().optional(),
    fatherUSStatus: zod_1.z.string().max(50).optional(),
    motherSurnames: zod_1.z.string().max(100).optional(),
    motherGivenNames: zod_1.z.string().max(100).optional(),
    motherDateOfBirth: optionalDateDraft,
    isMotherInUS: zod_1.z.boolean().optional(),
    motherUSStatus: zod_1.z.string().max(50).optional(),
    hasSpouse: zod_1.z.boolean().optional(),
    spouseFullName: zod_1.z.string().max(200).optional(),
    spouseDateOfBirth: optionalDateDraft,
    spouseNationality: zod_1.z.string().max(100).optional(),
    spouseCityOfBirth: zod_1.z.string().max(100).optional(),
    spouseCountryOfBirth: zod_1.z.string().max(100).optional(),
    spouseAddress: zod_1.z.string().max(500).optional(),
    spouseAddressSameAsApplicant: zod_1.z.boolean().optional(),
    hasChildren: zod_1.z.boolean().optional(),
    children: zod_1.z.array(zod_1.z.object({
        fullName: zod_1.z.string().max(200).optional(),
        dateOfBirth: zod_1.z.string().optional(),
        relationship: zod_1.z.string().max(50).optional(),
    })).optional(),
    hasImmediateRelativesInUS: zod_1.z.boolean().optional(),
    immediateRelativesInUS: zod_1.z.array(zod_1.z.object({
        fullName: zod_1.z.string().max(200).optional(),
        relationship: zod_1.z.string().max(50).optional(),
        status: zod_1.z.string().max(50).optional(),
    })).optional(),
    hasOtherRelativesInUS: zod_1.z.boolean().optional(),
    otherRelativesInUS: zod_1.z.array(zod_1.z.object({
        fullName: zod_1.z.string().max(200).optional(),
        relationship: zod_1.z.string().max(50).optional(),
        status: zod_1.z.string().max(50).optional(),
    })).optional(),
}).passthrough();
// Work/Education Draft Schema
exports.workEducationDraftSchema = zod_1.z.object({
    primaryOccupation: zod_1.z.string().max(100).optional(),
    presentEmployerName: zod_1.z.string().max(200).optional(),
    presentEmployerAddress: zod_1.z.string().max(500).optional(),
    presentEmployerCity: zod_1.z.string().max(100).optional(),
    presentEmployerState: zod_1.z.string().max(100).optional(),
    presentEmployerPostalCode: zod_1.z.string().max(20).optional(),
    presentEmployerCountry: zod_1.z.string().max(100).optional(),
    presentEmployerPhone: zod_1.z.string().max(30).optional(),
    monthlySalary: zod_1.z.string().max(50).optional(),
    jobDuties: zod_1.z.string().max(1000).optional(),
    startDate: optionalDateDraft,
    wasPreviouslyEmployed: zod_1.z.boolean().optional(),
    previousEmployment: zod_1.z.array(zod_1.z.object({
        employerName: zod_1.z.string().max(200).optional(),
        employerAddress: zod_1.z.string().max(500).optional(),
        city: zod_1.z.string().max(100).optional(),
        state: zod_1.z.string().max(100).optional(),
        postalCode: zod_1.z.string().max(20).optional(),
        country: zod_1.z.string().max(100).optional(),
        phone: zod_1.z.string().max(30).optional(),
        jobTitle: zod_1.z.string().max(100).optional(),
        supervisorSurname: zod_1.z.string().max(100).optional(),
        supervisorGivenName: zod_1.z.string().max(100).optional(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
        duties: zod_1.z.string().max(1000).optional(),
    })).optional(),
    hasAttendedEducation: zod_1.z.boolean().optional(),
    education: zod_1.z.array(zod_1.z.object({
        institutionName: zod_1.z.string().max(200).optional(),
        institutionAddress: zod_1.z.string().max(500).optional(),
        city: zod_1.z.string().max(100).optional(),
        state: zod_1.z.string().max(100).optional(),
        postalCode: zod_1.z.string().max(20).optional(),
        country: zod_1.z.string().max(100).optional(),
        courseOfStudy: zod_1.z.string().max(200).optional(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
    })).optional(),
    belongsToClanOrTribe: zod_1.z.boolean().optional(),
    clanOrTribeName: zod_1.z.string().max(100).optional(),
    languages: zod_1.z.array(zod_1.z.string().max(50)).optional(),
    hasVisitedCountriesLastFiveYears: zod_1.z.boolean().optional(),
    countriesVisited: zod_1.z.array(zod_1.z.string().max(100)).optional(),
    belongsToProfessionalOrg: zod_1.z.boolean().optional(),
    professionalOrgs: zod_1.z.array(zod_1.z.string().max(200)).optional(),
    hasSpecializedSkills: zod_1.z.boolean().optional(),
    specializedSkillsDescription: zod_1.z.string().max(1000).optional(),
    hasServedInMilitary: zod_1.z.boolean().optional(),
    militaryService: zod_1.z.object({
        country: zod_1.z.string().max(100).optional(),
        branch: zod_1.z.string().max(100).optional(),
        rank: zod_1.z.string().max(100).optional(),
        specialty: zod_1.z.string().max(200).optional(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
    }).optional(),
}).passthrough();
// Security Questions Draft Schema
exports.securityInfoDraftSchema = zod_1.z.object({
    hasCommunicableDisease: zod_1.z.boolean().optional(),
    hasMentalOrPhysicalDisorder: zod_1.z.boolean().optional(),
    isDrugAbuser: zod_1.z.boolean().optional(),
    hasBeenArrested: zod_1.z.boolean().optional(),
    arrestDetails: zod_1.z.string().max(2000).optional(),
    hasViolatedControlledSubstancesLaw: zod_1.z.boolean().optional(),
    isEngagedInProstitution: zod_1.z.boolean().optional(),
    isInvolvedInMoneyLaundering: zod_1.z.boolean().optional(),
    hasCommittedHumanTrafficking: zod_1.z.boolean().optional(),
    hasBenefitedFromTrafficking: zod_1.z.boolean().optional(),
    hasAidedHumanTrafficking: zod_1.z.boolean().optional(),
    seeksEspionage: zod_1.z.boolean().optional(),
    seeksToEngageInTerrorism: zod_1.z.boolean().optional(),
    hasProvidedTerroristSupport: zod_1.z.boolean().optional(),
    isTerroristOrganizationMember: zod_1.z.boolean().optional(),
    isRelatedToTerrorist: zod_1.z.boolean().optional(),
    hasParticipatedInGenocide: zod_1.z.boolean().optional(),
    hasParticipatedInTorture: zod_1.z.boolean().optional(),
    hasParticipatedInExtrajudicialKillings: zod_1.z.boolean().optional(),
    hasRecruitedChildSoldiers: zod_1.z.boolean().optional(),
    hasViolatedReligiousFreedom: zod_1.z.boolean().optional(),
    hasEnforcedPopulationControls: zod_1.z.boolean().optional(),
    hasInvolvedInOrganTrafficking: zod_1.z.boolean().optional(),
    hasSoughtVisaByFraud: zod_1.z.boolean().optional(),
    hasBeenRemovedOrDeported: zod_1.z.boolean().optional(),
    hasWithheldCustodyOfUSCitizen: zod_1.z.boolean().optional(),
    hasVotedInUSIllegally: zod_1.z.boolean().optional(),
    hasRenouncedUSCitizenshipToAvoidTax: zod_1.z.boolean().optional(),
    hasBeenInUS: zod_1.z.boolean().optional(),
    usVisitDetails: zod_1.z.string().max(2000).optional(),
    hasBeenIssuedUSVisa: zod_1.z.boolean().optional(),
    lastVisaDetails: zod_1.z.string().max(2000).optional(),
    hasBeenRefusedUSVisa: zod_1.z.boolean().optional(),
    refusalDetails: zod_1.z.string().max(2000).optional(),
    hasImmigrantPetitionFiled: zod_1.z.boolean().optional(),
    petitionDetails: zod_1.z.string().max(2000).optional(),
}).passthrough();
// Documents Draft Schema
exports.documentsDraftSchema = zod_1.z.object({
    photo: zod_1.z.object({
        fileName: zod_1.z.string().max(255).optional(),
        fileUrl: zod_1.z.string().max(500).optional(),
        fileSize: zod_1.z.number().optional(),
        uploadedAt: zod_1.z.string().optional(),
    }).optional(),
    invitationLetter: zod_1.z.object({
        fileName: zod_1.z.string().max(255).optional(),
        fileUrl: zod_1.z.string().max(500).optional(),
        fileSize: zod_1.z.number().optional(),
        uploadedAt: zod_1.z.string().optional(),
    }).optional(),
    additionalDocuments: zod_1.z.array(zod_1.z.object({
        fileName: zod_1.z.string().max(255).optional(),
        fileUrl: zod_1.z.string().max(500).optional(),
        fileSize: zod_1.z.number().optional(),
        uploadedAt: zod_1.z.string().optional(),
        documentType: zod_1.z.string().max(50).optional(),
    })).optional(),
}).passthrough();
exports.updateApplicationSchema = zod_1.z.object({
    currentStep: zod_1.z.number().int().min(1).max(15).optional(),
    personalInfo: exports.personalInfoDraftSchema.optional(),
    contactInfo: exports.contactInfoDraftSchema.optional(),
    passportInfo: exports.passportInfoDraftSchema.optional(),
    travelInfo: exports.travelInfoDraftSchema.optional(),
    familyInfo: exports.familyInfoDraftSchema.optional(),
    workEducation: exports.workEducationDraftSchema.optional(),
    securityInfo: exports.securityInfoDraftSchema.optional(),
    documents: exports.documentsDraftSchema.optional(),
});
// Flight search schemas
const iataSchema = zod_1.z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, 'IATA code must be exactly 3 letters');
const isoDateSchema = zod_1.z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');
exports.flightSearchSchema = zod_1.z
    .object({
    from: iataSchema,
    to: iataSchema,
    departDate: isoDateSchema,
    returnDate: isoDateSchema.optional(),
    adults: zod_1.z.coerce.number().int().min(1).max(9).default(1),
    children: zod_1.z.coerce.number().int().min(0).max(9).default(0),
    infants: zod_1.z.coerce.number().int().min(0).max(9).default(0),
    cabinClass: zod_1.z
        .enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'])
        .default('ECONOMY'),
})
    .superRefine((value, ctx) => {
    if (value.from === value.to) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ['to'],
            message: 'Destination must be different from origin',
        });
    }
    if (value.returnDate && value.returnDate < value.departDate) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ['returnDate'],
            message: 'Return date must be on or after departure date',
        });
    }
    if (value.infants > value.adults) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ['infants'],
            message: 'Infants cannot exceed number of adults',
        });
    }
});
// Pagination schema
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(20),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
// Admin inquiries list schema (pagination + optional filters)
exports.adminInquiriesQuerySchema = exports.paginationSchema.extend({
    status: zod_1.z.string().max(50).optional(),
    serviceType: zod_1.z.string().max(50).optional(),
});
// ID parameter schema
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'ID is required'),
});
//# sourceMappingURL=schemas.js.map