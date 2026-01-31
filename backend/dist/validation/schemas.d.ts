import { z } from 'zod';
import { UserRole, InquiryStatus, ServiceType, VisaType } from '../types';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name?: string | undefined;
}, {
    email: string;
    password: string;
    name?: string | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const updateUserSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodNativeEnum<typeof UserRole>>;
}, "strip", z.ZodTypeAny, {
    role?: UserRole | undefined;
    name?: string | undefined;
}, {
    role?: UserRole | undefined;
    name?: string | undefined;
}>;
export declare const updateRoleSchema: z.ZodObject<{
    role: z.ZodNativeEnum<typeof UserRole>;
}, "strip", z.ZodTypeAny, {
    role: UserRole;
}, {
    role: UserRole;
}>;
export declare const createInquirySchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    message: z.ZodString;
    serviceType: z.ZodNativeEnum<typeof ServiceType>;
}, "strip", z.ZodTypeAny, {
    message: string;
    email: string;
    name: string;
    phone: string;
    serviceType: ServiceType;
}, {
    message: string;
    email: string;
    name: string;
    phone: string;
    serviceType: ServiceType;
}>;
export declare const updateInquiryStatusSchema: z.ZodObject<{
    status: z.ZodNativeEnum<typeof InquiryStatus>;
    adminNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: InquiryStatus;
    adminNotes?: string | undefined;
}, {
    status: InquiryStatus;
    adminNotes?: string | undefined;
}>;
export declare const personalInfoSchema: z.ZodObject<{
    surnames: z.ZodString;
    givenNames: z.ZodString;
    fullNameNative: z.ZodOptional<z.ZodString>;
    otherNamesUsed: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    otherNames: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    telCode: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    sex: z.ZodEnum<["M", "F"]>;
    maritalStatus: z.ZodEnum<["SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "SEPARATED"]>;
    dateOfBirth: z.ZodString;
    cityOfBirth: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    stateOfBirth: z.ZodOptional<z.ZodString>;
    countryOfBirth: z.ZodString;
    nationality: z.ZodString;
}, "strip", z.ZodTypeAny, {
    surnames: string;
    givenNames: string;
    otherNamesUsed: boolean;
    telCode: string;
    sex: "M" | "F";
    maritalStatus: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED" | "SEPARATED";
    dateOfBirth: string;
    cityOfBirth: string;
    countryOfBirth: string;
    nationality: string;
    fullNameNative?: string | undefined;
    otherNames?: string[] | undefined;
    stateOfBirth?: string | undefined;
}, {
    surnames: string;
    givenNames: string;
    sex: "M" | "F";
    maritalStatus: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED" | "SEPARATED";
    dateOfBirth: string;
    countryOfBirth: string;
    nationality: string;
    fullNameNative?: string | undefined;
    otherNamesUsed?: boolean | undefined;
    otherNames?: string[] | undefined;
    telCode?: string | undefined;
    cityOfBirth?: string | undefined;
    stateOfBirth?: string | undefined;
}>;
export declare const addressSchema: z.ZodObject<{
    street: z.ZodString;
    city: z.ZodString;
    state: z.ZodOptional<z.ZodString>;
    postalCode: z.ZodOptional<z.ZodString>;
    country: z.ZodString;
}, "strip", z.ZodTypeAny, {
    country: string;
    street: string;
    city: string;
    state?: string | undefined;
    postalCode?: string | undefined;
}, {
    country: string;
    street: string;
    city: string;
    state?: string | undefined;
    postalCode?: string | undefined;
}>;
export declare const contactInfoSchema: z.ZodObject<{
    homeAddress: z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodOptional<z.ZodString>;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        country: string;
        street: string;
        city: string;
        state?: string | undefined;
        postalCode?: string | undefined;
    }, {
        country: string;
        street: string;
        city: string;
        state?: string | undefined;
        postalCode?: string | undefined;
    }>;
    mailingAddress: z.ZodOptional<z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodOptional<z.ZodString>;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        country: string;
        street: string;
        city: string;
        state?: string | undefined;
        postalCode?: string | undefined;
    }, {
        country: string;
        street: string;
        city: string;
        state?: string | undefined;
        postalCode?: string | undefined;
    }>>;
    phone: z.ZodString;
    secondaryPhone: z.ZodOptional<z.ZodString>;
    workPhone: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    phone: string;
    homeAddress: {
        country: string;
        street: string;
        city: string;
        state?: string | undefined;
        postalCode?: string | undefined;
    };
    mailingAddress?: {
        country: string;
        street: string;
        city: string;
        state?: string | undefined;
        postalCode?: string | undefined;
    } | undefined;
    secondaryPhone?: string | undefined;
    workPhone?: string | undefined;
}, {
    email: string;
    phone: string;
    homeAddress: {
        country: string;
        street: string;
        city: string;
        state?: string | undefined;
        postalCode?: string | undefined;
    };
    mailingAddress?: {
        country: string;
        street: string;
        city: string;
        state?: string | undefined;
        postalCode?: string | undefined;
    } | undefined;
    secondaryPhone?: string | undefined;
    workPhone?: string | undefined;
}>;
export declare const passportInfoSchema: z.ZodObject<{
    passportType: z.ZodEnum<["REGULAR", "OFFICIAL", "DIPLOMATIC", "OTHER"]>;
    passportNumber: z.ZodString;
    passportBookNumber: z.ZodOptional<z.ZodString>;
    countryOfIssuance: z.ZodString;
    cityOfIssuance: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    stateOfIssuance: z.ZodOptional<z.ZodString>;
    issuanceDate: z.ZodString;
    expirationDate: z.ZodString;
    hasOtherPassport: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    otherPassportInfo: z.ZodOptional<z.ZodObject<{
        number: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        number: string;
        country: string;
    }, {
        number: string;
        country: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    passportType: "OTHER" | "REGULAR" | "OFFICIAL" | "DIPLOMATIC";
    passportNumber: string;
    countryOfIssuance: string;
    cityOfIssuance: string;
    issuanceDate: string;
    expirationDate: string;
    hasOtherPassport: boolean;
    passportBookNumber?: string | undefined;
    stateOfIssuance?: string | undefined;
    otherPassportInfo?: {
        number: string;
        country: string;
    } | undefined;
}, {
    passportType: "OTHER" | "REGULAR" | "OFFICIAL" | "DIPLOMATIC";
    passportNumber: string;
    countryOfIssuance: string;
    issuanceDate: string;
    expirationDate: string;
    passportBookNumber?: string | undefined;
    cityOfIssuance?: string | undefined;
    stateOfIssuance?: string | undefined;
    hasOtherPassport?: boolean | undefined;
    otherPassportInfo?: {
        number: string;
        country: string;
    } | undefined;
}>;
export declare const travelInfoSchema: z.ZodObject<{
    purposeOfTrip: z.ZodString;
    specificPurpose: z.ZodOptional<z.ZodString>;
    intendedArrivalDate: z.ZodString;
    intendedLengthOfStay: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    addressWhileInUS: z.ZodObject<{
        street: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        city: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        state: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        zipCode: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        street: string;
        city: string;
        state: string;
        zipCode?: string | undefined;
    }, {
        street?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        zipCode?: string | undefined;
    }>;
    payingForTrip: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    travelingWithOthers: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    companions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        relationship: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        relationship: string;
    }, {
        name: string;
        relationship: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    purposeOfTrip: string;
    intendedArrivalDate: string;
    intendedLengthOfStay: string;
    addressWhileInUS: {
        street: string;
        city: string;
        state: string;
        zipCode?: string | undefined;
    };
    payingForTrip: string;
    travelingWithOthers: boolean;
    specificPurpose?: string | undefined;
    companions?: {
        name: string;
        relationship: string;
    }[] | undefined;
}, {
    purposeOfTrip: string;
    intendedArrivalDate: string;
    addressWhileInUS: {
        street?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        zipCode?: string | undefined;
    };
    specificPurpose?: string | undefined;
    intendedLengthOfStay?: string | undefined;
    payingForTrip?: string | undefined;
    travelingWithOthers?: boolean | undefined;
    companions?: {
        name: string;
        relationship: string;
    }[] | undefined;
}>;
export declare const createApplicationSchema: z.ZodObject<{
    visaType: z.ZodNativeEnum<typeof VisaType>;
}, "strip", z.ZodTypeAny, {
    visaType: VisaType;
}, {
    visaType: VisaType;
}>;
export declare const updateApplicationSchema: z.ZodObject<{
    currentStep: z.ZodOptional<z.ZodNumber>;
    personalInfo: z.ZodOptional<z.ZodObject<{
        surnames: z.ZodString;
        givenNames: z.ZodString;
        fullNameNative: z.ZodOptional<z.ZodString>;
        otherNamesUsed: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        otherNames: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        telCode: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        sex: z.ZodEnum<["M", "F"]>;
        maritalStatus: z.ZodEnum<["SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "SEPARATED"]>;
        dateOfBirth: z.ZodString;
        cityOfBirth: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        stateOfBirth: z.ZodOptional<z.ZodString>;
        countryOfBirth: z.ZodString;
        nationality: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        surnames: string;
        givenNames: string;
        otherNamesUsed: boolean;
        telCode: string;
        sex: "M" | "F";
        maritalStatus: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED" | "SEPARATED";
        dateOfBirth: string;
        cityOfBirth: string;
        countryOfBirth: string;
        nationality: string;
        fullNameNative?: string | undefined;
        otherNames?: string[] | undefined;
        stateOfBirth?: string | undefined;
    }, {
        surnames: string;
        givenNames: string;
        sex: "M" | "F";
        maritalStatus: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED" | "SEPARATED";
        dateOfBirth: string;
        countryOfBirth: string;
        nationality: string;
        fullNameNative?: string | undefined;
        otherNamesUsed?: boolean | undefined;
        otherNames?: string[] | undefined;
        telCode?: string | undefined;
        cityOfBirth?: string | undefined;
        stateOfBirth?: string | undefined;
    }>>;
    contactInfo: z.ZodOptional<z.ZodObject<{
        homeAddress: z.ZodObject<{
            street: z.ZodString;
            city: z.ZodString;
            state: z.ZodOptional<z.ZodString>;
            postalCode: z.ZodOptional<z.ZodString>;
            country: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            country: string;
            street: string;
            city: string;
            state?: string | undefined;
            postalCode?: string | undefined;
        }, {
            country: string;
            street: string;
            city: string;
            state?: string | undefined;
            postalCode?: string | undefined;
        }>;
        mailingAddress: z.ZodOptional<z.ZodObject<{
            street: z.ZodString;
            city: z.ZodString;
            state: z.ZodOptional<z.ZodString>;
            postalCode: z.ZodOptional<z.ZodString>;
            country: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            country: string;
            street: string;
            city: string;
            state?: string | undefined;
            postalCode?: string | undefined;
        }, {
            country: string;
            street: string;
            city: string;
            state?: string | undefined;
            postalCode?: string | undefined;
        }>>;
        phone: z.ZodString;
        secondaryPhone: z.ZodOptional<z.ZodString>;
        workPhone: z.ZodOptional<z.ZodString>;
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        phone: string;
        homeAddress: {
            country: string;
            street: string;
            city: string;
            state?: string | undefined;
            postalCode?: string | undefined;
        };
        mailingAddress?: {
            country: string;
            street: string;
            city: string;
            state?: string | undefined;
            postalCode?: string | undefined;
        } | undefined;
        secondaryPhone?: string | undefined;
        workPhone?: string | undefined;
    }, {
        email: string;
        phone: string;
        homeAddress: {
            country: string;
            street: string;
            city: string;
            state?: string | undefined;
            postalCode?: string | undefined;
        };
        mailingAddress?: {
            country: string;
            street: string;
            city: string;
            state?: string | undefined;
            postalCode?: string | undefined;
        } | undefined;
        secondaryPhone?: string | undefined;
        workPhone?: string | undefined;
    }>>;
    passportInfo: z.ZodOptional<z.ZodObject<{
        passportType: z.ZodEnum<["REGULAR", "OFFICIAL", "DIPLOMATIC", "OTHER"]>;
        passportNumber: z.ZodString;
        passportBookNumber: z.ZodOptional<z.ZodString>;
        countryOfIssuance: z.ZodString;
        cityOfIssuance: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        stateOfIssuance: z.ZodOptional<z.ZodString>;
        issuanceDate: z.ZodString;
        expirationDate: z.ZodString;
        hasOtherPassport: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        otherPassportInfo: z.ZodOptional<z.ZodObject<{
            number: z.ZodString;
            country: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            number: string;
            country: string;
        }, {
            number: string;
            country: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        passportType: "OTHER" | "REGULAR" | "OFFICIAL" | "DIPLOMATIC";
        passportNumber: string;
        countryOfIssuance: string;
        cityOfIssuance: string;
        issuanceDate: string;
        expirationDate: string;
        hasOtherPassport: boolean;
        passportBookNumber?: string | undefined;
        stateOfIssuance?: string | undefined;
        otherPassportInfo?: {
            number: string;
            country: string;
        } | undefined;
    }, {
        passportType: "OTHER" | "REGULAR" | "OFFICIAL" | "DIPLOMATIC";
        passportNumber: string;
        countryOfIssuance: string;
        issuanceDate: string;
        expirationDate: string;
        passportBookNumber?: string | undefined;
        cityOfIssuance?: string | undefined;
        stateOfIssuance?: string | undefined;
        hasOtherPassport?: boolean | undefined;
        otherPassportInfo?: {
            number: string;
            country: string;
        } | undefined;
    }>>;
    travelInfo: z.ZodOptional<z.ZodObject<{
        purposeOfTrip: z.ZodString;
        specificPurpose: z.ZodOptional<z.ZodString>;
        intendedArrivalDate: z.ZodString;
        intendedLengthOfStay: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        addressWhileInUS: z.ZodObject<{
            street: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            city: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            state: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            zipCode: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            street: string;
            city: string;
            state: string;
            zipCode?: string | undefined;
        }, {
            street?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            zipCode?: string | undefined;
        }>;
        payingForTrip: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        travelingWithOthers: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        companions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            relationship: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            relationship: string;
        }, {
            name: string;
            relationship: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        purposeOfTrip: string;
        intendedArrivalDate: string;
        intendedLengthOfStay: string;
        addressWhileInUS: {
            street: string;
            city: string;
            state: string;
            zipCode?: string | undefined;
        };
        payingForTrip: string;
        travelingWithOthers: boolean;
        specificPurpose?: string | undefined;
        companions?: {
            name: string;
            relationship: string;
        }[] | undefined;
    }, {
        purposeOfTrip: string;
        intendedArrivalDate: string;
        addressWhileInUS: {
            street?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            zipCode?: string | undefined;
        };
        specificPurpose?: string | undefined;
        intendedLengthOfStay?: string | undefined;
        payingForTrip?: string | undefined;
        travelingWithOthers?: boolean | undefined;
        companions?: {
            name: string;
            relationship: string;
        }[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    currentStep?: number | undefined;
    personalInfo?: {
        surnames: string;
        givenNames: string;
        otherNamesUsed: boolean;
        telCode: string;
        sex: "M" | "F";
        maritalStatus: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED" | "SEPARATED";
        dateOfBirth: string;
        cityOfBirth: string;
        countryOfBirth: string;
        nationality: string;
        fullNameNative?: string | undefined;
        otherNames?: string[] | undefined;
        stateOfBirth?: string | undefined;
    } | undefined;
    contactInfo?: {
        email: string;
        phone: string;
        homeAddress: {
            country: string;
            street: string;
            city: string;
            state?: string | undefined;
            postalCode?: string | undefined;
        };
        mailingAddress?: {
            country: string;
            street: string;
            city: string;
            state?: string | undefined;
            postalCode?: string | undefined;
        } | undefined;
        secondaryPhone?: string | undefined;
        workPhone?: string | undefined;
    } | undefined;
    passportInfo?: {
        passportType: "OTHER" | "REGULAR" | "OFFICIAL" | "DIPLOMATIC";
        passportNumber: string;
        countryOfIssuance: string;
        cityOfIssuance: string;
        issuanceDate: string;
        expirationDate: string;
        hasOtherPassport: boolean;
        passportBookNumber?: string | undefined;
        stateOfIssuance?: string | undefined;
        otherPassportInfo?: {
            number: string;
            country: string;
        } | undefined;
    } | undefined;
    travelInfo?: {
        purposeOfTrip: string;
        intendedArrivalDate: string;
        intendedLengthOfStay: string;
        addressWhileInUS: {
            street: string;
            city: string;
            state: string;
            zipCode?: string | undefined;
        };
        payingForTrip: string;
        travelingWithOthers: boolean;
        specificPurpose?: string | undefined;
        companions?: {
            name: string;
            relationship: string;
        }[] | undefined;
    } | undefined;
}, {
    currentStep?: number | undefined;
    personalInfo?: {
        surnames: string;
        givenNames: string;
        sex: "M" | "F";
        maritalStatus: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED" | "SEPARATED";
        dateOfBirth: string;
        countryOfBirth: string;
        nationality: string;
        fullNameNative?: string | undefined;
        otherNamesUsed?: boolean | undefined;
        otherNames?: string[] | undefined;
        telCode?: string | undefined;
        cityOfBirth?: string | undefined;
        stateOfBirth?: string | undefined;
    } | undefined;
    contactInfo?: {
        email: string;
        phone: string;
        homeAddress: {
            country: string;
            street: string;
            city: string;
            state?: string | undefined;
            postalCode?: string | undefined;
        };
        mailingAddress?: {
            country: string;
            street: string;
            city: string;
            state?: string | undefined;
            postalCode?: string | undefined;
        } | undefined;
        secondaryPhone?: string | undefined;
        workPhone?: string | undefined;
    } | undefined;
    passportInfo?: {
        passportType: "OTHER" | "REGULAR" | "OFFICIAL" | "DIPLOMATIC";
        passportNumber: string;
        countryOfIssuance: string;
        issuanceDate: string;
        expirationDate: string;
        passportBookNumber?: string | undefined;
        cityOfIssuance?: string | undefined;
        stateOfIssuance?: string | undefined;
        hasOtherPassport?: boolean | undefined;
        otherPassportInfo?: {
            number: string;
            country: string;
        } | undefined;
    } | undefined;
    travelInfo?: {
        purposeOfTrip: string;
        intendedArrivalDate: string;
        addressWhileInUS: {
            street?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            zipCode?: string | undefined;
        };
        specificPurpose?: string | undefined;
        intendedLengthOfStay?: string | undefined;
        payingForTrip?: string | undefined;
        travelingWithOthers?: boolean | undefined;
        companions?: {
            name: string;
            relationship: string;
        }[] | undefined;
    } | undefined;
}>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortOrder: "asc" | "desc";
    sortBy?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
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
//# sourceMappingURL=schemas.d.ts.map