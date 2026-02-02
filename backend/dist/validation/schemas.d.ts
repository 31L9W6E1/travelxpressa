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
export declare const personalInfoDraftSchema: z.ZodObject<{
    surnames: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    givenNames: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    fullNameNative: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    otherNamesUsed: z.ZodOptional<z.ZodBoolean>;
    otherNames: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    telCode: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    sex: z.ZodOptional<z.ZodString>;
    maritalStatus: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    cityOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    stateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    countryOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    nationality: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    surnames: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    givenNames: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    fullNameNative: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    otherNamesUsed: z.ZodOptional<z.ZodBoolean>;
    otherNames: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    telCode: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    sex: z.ZodOptional<z.ZodString>;
    maritalStatus: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    cityOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    stateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    countryOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    nationality: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    surnames: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    givenNames: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    fullNameNative: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    otherNamesUsed: z.ZodOptional<z.ZodBoolean>;
    otherNames: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    telCode: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    sex: z.ZodOptional<z.ZodString>;
    maritalStatus: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    cityOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    stateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    countryOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    nationality: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, z.ZodTypeAny, "passthrough">>;
export declare const addressDraftSchema: z.ZodOptional<z.ZodObject<{
    street: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    city: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    state: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    postalCode: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    country: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    street: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    city: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    state: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    postalCode: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    country: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    street: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    city: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    state: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    postalCode: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    country: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, z.ZodTypeAny, "passthrough">>>;
export declare const contactInfoDraftSchema: z.ZodObject<{
    homeAddress: z.ZodOptional<z.ZodAny>;
    mailingAddress: z.ZodOptional<z.ZodAny>;
    phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    secondaryPhone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    workPhone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    homeAddress: z.ZodOptional<z.ZodAny>;
    mailingAddress: z.ZodOptional<z.ZodAny>;
    phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    secondaryPhone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    workPhone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    homeAddress: z.ZodOptional<z.ZodAny>;
    mailingAddress: z.ZodOptional<z.ZodAny>;
    phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    secondaryPhone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    workPhone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, z.ZodTypeAny, "passthrough">>;
export declare const passportInfoDraftSchema: z.ZodObject<{
    passportType: z.ZodOptional<z.ZodString>;
    passportNumber: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    passportBookNumber: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    countryOfIssuance: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    cityOfIssuance: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    stateOfIssuance: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    issuanceDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    expirationDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    hasOtherPassport: z.ZodOptional<z.ZodBoolean>;
    otherPassportInfo: z.ZodOptional<z.ZodAny>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    passportType: z.ZodOptional<z.ZodString>;
    passportNumber: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    passportBookNumber: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    countryOfIssuance: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    cityOfIssuance: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    stateOfIssuance: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    issuanceDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    expirationDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    hasOtherPassport: z.ZodOptional<z.ZodBoolean>;
    otherPassportInfo: z.ZodOptional<z.ZodAny>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    passportType: z.ZodOptional<z.ZodString>;
    passportNumber: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    passportBookNumber: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    countryOfIssuance: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    cityOfIssuance: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    stateOfIssuance: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    issuanceDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    expirationDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    hasOtherPassport: z.ZodOptional<z.ZodBoolean>;
    otherPassportInfo: z.ZodOptional<z.ZodAny>;
}, z.ZodTypeAny, "passthrough">>;
export declare const travelInfoDraftSchema: z.ZodObject<{
    purposeOfTrip: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    specificPurpose: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    intendedArrivalDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    intendedLengthOfStay: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    addressWhileInUS: z.ZodOptional<z.ZodAny>;
    payingForTrip: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    travelingWithOthers: z.ZodOptional<z.ZodBoolean>;
    companions: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    purposeOfTrip: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    specificPurpose: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    intendedArrivalDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    intendedLengthOfStay: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    addressWhileInUS: z.ZodOptional<z.ZodAny>;
    payingForTrip: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    travelingWithOthers: z.ZodOptional<z.ZodBoolean>;
    companions: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    purposeOfTrip: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    specificPurpose: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    intendedArrivalDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    intendedLengthOfStay: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    addressWhileInUS: z.ZodOptional<z.ZodAny>;
    payingForTrip: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    travelingWithOthers: z.ZodOptional<z.ZodBoolean>;
    companions: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
}, z.ZodTypeAny, "passthrough">>;
export declare const familyInfoDraftSchema: z.ZodObject<{
    fatherSurnames: z.ZodOptional<z.ZodString>;
    fatherGivenNames: z.ZodOptional<z.ZodString>;
    fatherDateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    isFatherInUS: z.ZodOptional<z.ZodBoolean>;
    fatherUSStatus: z.ZodOptional<z.ZodString>;
    motherSurnames: z.ZodOptional<z.ZodString>;
    motherGivenNames: z.ZodOptional<z.ZodString>;
    motherDateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    isMotherInUS: z.ZodOptional<z.ZodBoolean>;
    motherUSStatus: z.ZodOptional<z.ZodString>;
    hasSpouse: z.ZodOptional<z.ZodBoolean>;
    spouseFullName: z.ZodOptional<z.ZodString>;
    spouseDateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    spouseNationality: z.ZodOptional<z.ZodString>;
    spouseCityOfBirth: z.ZodOptional<z.ZodString>;
    spouseCountryOfBirth: z.ZodOptional<z.ZodString>;
    spouseAddress: z.ZodOptional<z.ZodString>;
    spouseAddressSameAsApplicant: z.ZodOptional<z.ZodBoolean>;
    hasChildren: z.ZodOptional<z.ZodBoolean>;
    children: z.ZodOptional<z.ZodArray<z.ZodObject<{
        fullName: z.ZodOptional<z.ZodString>;
        dateOfBirth: z.ZodOptional<z.ZodString>;
        relationship: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        dateOfBirth?: string | undefined;
        relationship?: string | undefined;
        fullName?: string | undefined;
    }, {
        dateOfBirth?: string | undefined;
        relationship?: string | undefined;
        fullName?: string | undefined;
    }>, "many">>;
    hasImmediateRelativesInUS: z.ZodOptional<z.ZodBoolean>;
    immediateRelativesInUS: z.ZodOptional<z.ZodArray<z.ZodObject<{
        fullName: z.ZodOptional<z.ZodString>;
        relationship: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status?: string | undefined;
        relationship?: string | undefined;
        fullName?: string | undefined;
    }, {
        status?: string | undefined;
        relationship?: string | undefined;
        fullName?: string | undefined;
    }>, "many">>;
    hasOtherRelativesInUS: z.ZodOptional<z.ZodBoolean>;
    otherRelativesInUS: z.ZodOptional<z.ZodArray<z.ZodObject<{
        fullName: z.ZodOptional<z.ZodString>;
        relationship: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status?: string | undefined;
        relationship?: string | undefined;
        fullName?: string | undefined;
    }, {
        status?: string | undefined;
        relationship?: string | undefined;
        fullName?: string | undefined;
    }>, "many">>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    fatherSurnames: z.ZodOptional<z.ZodString>;
    fatherGivenNames: z.ZodOptional<z.ZodString>;
    fatherDateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    isFatherInUS: z.ZodOptional<z.ZodBoolean>;
    fatherUSStatus: z.ZodOptional<z.ZodString>;
    motherSurnames: z.ZodOptional<z.ZodString>;
    motherGivenNames: z.ZodOptional<z.ZodString>;
    motherDateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    isMotherInUS: z.ZodOptional<z.ZodBoolean>;
    motherUSStatus: z.ZodOptional<z.ZodString>;
    hasSpouse: z.ZodOptional<z.ZodBoolean>;
    spouseFullName: z.ZodOptional<z.ZodString>;
    spouseDateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    spouseNationality: z.ZodOptional<z.ZodString>;
    spouseCityOfBirth: z.ZodOptional<z.ZodString>;
    spouseCountryOfBirth: z.ZodOptional<z.ZodString>;
    spouseAddress: z.ZodOptional<z.ZodString>;
    spouseAddressSameAsApplicant: z.ZodOptional<z.ZodBoolean>;
    hasChildren: z.ZodOptional<z.ZodBoolean>;
    children: z.ZodOptional<z.ZodArray<z.ZodObject<{
        fullName: z.ZodOptional<z.ZodString>;
        dateOfBirth: z.ZodOptional<z.ZodString>;
        relationship: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        dateOfBirth?: string | undefined;
        relationship?: string | undefined;
        fullName?: string | undefined;
    }, {
        dateOfBirth?: string | undefined;
        relationship?: string | undefined;
        fullName?: string | undefined;
    }>, "many">>;
    hasImmediateRelativesInUS: z.ZodOptional<z.ZodBoolean>;
    immediateRelativesInUS: z.ZodOptional<z.ZodArray<z.ZodObject<{
        fullName: z.ZodOptional<z.ZodString>;
        relationship: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status?: string | undefined;
        relationship?: string | undefined;
        fullName?: string | undefined;
    }, {
        status?: string | undefined;
        relationship?: string | undefined;
        fullName?: string | undefined;
    }>, "many">>;
    hasOtherRelativesInUS: z.ZodOptional<z.ZodBoolean>;
    otherRelativesInUS: z.ZodOptional<z.ZodArray<z.ZodObject<{
        fullName: z.ZodOptional<z.ZodString>;
        relationship: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status?: string | undefined;
        relationship?: string | undefined;
        fullName?: string | undefined;
    }, {
        status?: string | undefined;
        relationship?: string | undefined;
        fullName?: string | undefined;
    }>, "many">>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    fatherSurnames: z.ZodOptional<z.ZodString>;
    fatherGivenNames: z.ZodOptional<z.ZodString>;
    fatherDateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    isFatherInUS: z.ZodOptional<z.ZodBoolean>;
    fatherUSStatus: z.ZodOptional<z.ZodString>;
    motherSurnames: z.ZodOptional<z.ZodString>;
    motherGivenNames: z.ZodOptional<z.ZodString>;
    motherDateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    isMotherInUS: z.ZodOptional<z.ZodBoolean>;
    motherUSStatus: z.ZodOptional<z.ZodString>;
    hasSpouse: z.ZodOptional<z.ZodBoolean>;
    spouseFullName: z.ZodOptional<z.ZodString>;
    spouseDateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    spouseNationality: z.ZodOptional<z.ZodString>;
    spouseCityOfBirth: z.ZodOptional<z.ZodString>;
    spouseCountryOfBirth: z.ZodOptional<z.ZodString>;
    spouseAddress: z.ZodOptional<z.ZodString>;
    spouseAddressSameAsApplicant: z.ZodOptional<z.ZodBoolean>;
    hasChildren: z.ZodOptional<z.ZodBoolean>;
    children: z.ZodOptional<z.ZodArray<z.ZodObject<{
        fullName: z.ZodOptional<z.ZodString>;
        dateOfBirth: z.ZodOptional<z.ZodString>;
        relationship: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        dateOfBirth?: string | undefined;
        relationship?: string | undefined;
        fullName?: string | undefined;
    }, {
        dateOfBirth?: string | undefined;
        relationship?: string | undefined;
        fullName?: string | undefined;
    }>, "many">>;
    hasImmediateRelativesInUS: z.ZodOptional<z.ZodBoolean>;
    immediateRelativesInUS: z.ZodOptional<z.ZodArray<z.ZodObject<{
        fullName: z.ZodOptional<z.ZodString>;
        relationship: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status?: string | undefined;
        relationship?: string | undefined;
        fullName?: string | undefined;
    }, {
        status?: string | undefined;
        relationship?: string | undefined;
        fullName?: string | undefined;
    }>, "many">>;
    hasOtherRelativesInUS: z.ZodOptional<z.ZodBoolean>;
    otherRelativesInUS: z.ZodOptional<z.ZodArray<z.ZodObject<{
        fullName: z.ZodOptional<z.ZodString>;
        relationship: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status?: string | undefined;
        relationship?: string | undefined;
        fullName?: string | undefined;
    }, {
        status?: string | undefined;
        relationship?: string | undefined;
        fullName?: string | undefined;
    }>, "many">>;
}, z.ZodTypeAny, "passthrough">>;
export declare const workEducationDraftSchema: z.ZodObject<{
    primaryOccupation: z.ZodOptional<z.ZodString>;
    presentEmployerName: z.ZodOptional<z.ZodString>;
    presentEmployerAddress: z.ZodOptional<z.ZodString>;
    presentEmployerCity: z.ZodOptional<z.ZodString>;
    presentEmployerState: z.ZodOptional<z.ZodString>;
    presentEmployerPostalCode: z.ZodOptional<z.ZodString>;
    presentEmployerCountry: z.ZodOptional<z.ZodString>;
    presentEmployerPhone: z.ZodOptional<z.ZodString>;
    monthlySalary: z.ZodOptional<z.ZodString>;
    jobDuties: z.ZodOptional<z.ZodString>;
    startDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    wasPreviouslyEmployed: z.ZodOptional<z.ZodBoolean>;
    previousEmployment: z.ZodOptional<z.ZodArray<z.ZodObject<{
        employerName: z.ZodOptional<z.ZodString>;
        employerAddress: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        jobTitle: z.ZodOptional<z.ZodString>;
        supervisorSurname: z.ZodOptional<z.ZodString>;
        supervisorGivenName: z.ZodOptional<z.ZodString>;
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
        duties: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        phone?: string | undefined;
        country?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
        startDate?: string | undefined;
        employerName?: string | undefined;
        employerAddress?: string | undefined;
        jobTitle?: string | undefined;
        supervisorSurname?: string | undefined;
        supervisorGivenName?: string | undefined;
        endDate?: string | undefined;
        duties?: string | undefined;
    }, {
        phone?: string | undefined;
        country?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
        startDate?: string | undefined;
        employerName?: string | undefined;
        employerAddress?: string | undefined;
        jobTitle?: string | undefined;
        supervisorSurname?: string | undefined;
        supervisorGivenName?: string | undefined;
        endDate?: string | undefined;
        duties?: string | undefined;
    }>, "many">>;
    hasAttendedEducation: z.ZodOptional<z.ZodBoolean>;
    education: z.ZodOptional<z.ZodArray<z.ZodObject<{
        institutionName: z.ZodOptional<z.ZodString>;
        institutionAddress: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        courseOfStudy: z.ZodOptional<z.ZodString>;
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        country?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        institutionName?: string | undefined;
        institutionAddress?: string | undefined;
        courseOfStudy?: string | undefined;
    }, {
        country?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        institutionName?: string | undefined;
        institutionAddress?: string | undefined;
        courseOfStudy?: string | undefined;
    }>, "many">>;
    belongsToClanOrTribe: z.ZodOptional<z.ZodBoolean>;
    clanOrTribeName: z.ZodOptional<z.ZodString>;
    languages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    hasVisitedCountriesLastFiveYears: z.ZodOptional<z.ZodBoolean>;
    countriesVisited: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    belongsToProfessionalOrg: z.ZodOptional<z.ZodBoolean>;
    professionalOrgs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    hasSpecializedSkills: z.ZodOptional<z.ZodBoolean>;
    specializedSkillsDescription: z.ZodOptional<z.ZodString>;
    hasServedInMilitary: z.ZodOptional<z.ZodBoolean>;
    militaryService: z.ZodOptional<z.ZodObject<{
        country: z.ZodOptional<z.ZodString>;
        branch: z.ZodOptional<z.ZodString>;
        rank: z.ZodOptional<z.ZodString>;
        specialty: z.ZodOptional<z.ZodString>;
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        country?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        branch?: string | undefined;
        rank?: string | undefined;
        specialty?: string | undefined;
    }, {
        country?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        branch?: string | undefined;
        rank?: string | undefined;
        specialty?: string | undefined;
    }>>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    primaryOccupation: z.ZodOptional<z.ZodString>;
    presentEmployerName: z.ZodOptional<z.ZodString>;
    presentEmployerAddress: z.ZodOptional<z.ZodString>;
    presentEmployerCity: z.ZodOptional<z.ZodString>;
    presentEmployerState: z.ZodOptional<z.ZodString>;
    presentEmployerPostalCode: z.ZodOptional<z.ZodString>;
    presentEmployerCountry: z.ZodOptional<z.ZodString>;
    presentEmployerPhone: z.ZodOptional<z.ZodString>;
    monthlySalary: z.ZodOptional<z.ZodString>;
    jobDuties: z.ZodOptional<z.ZodString>;
    startDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    wasPreviouslyEmployed: z.ZodOptional<z.ZodBoolean>;
    previousEmployment: z.ZodOptional<z.ZodArray<z.ZodObject<{
        employerName: z.ZodOptional<z.ZodString>;
        employerAddress: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        jobTitle: z.ZodOptional<z.ZodString>;
        supervisorSurname: z.ZodOptional<z.ZodString>;
        supervisorGivenName: z.ZodOptional<z.ZodString>;
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
        duties: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        phone?: string | undefined;
        country?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
        startDate?: string | undefined;
        employerName?: string | undefined;
        employerAddress?: string | undefined;
        jobTitle?: string | undefined;
        supervisorSurname?: string | undefined;
        supervisorGivenName?: string | undefined;
        endDate?: string | undefined;
        duties?: string | undefined;
    }, {
        phone?: string | undefined;
        country?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
        startDate?: string | undefined;
        employerName?: string | undefined;
        employerAddress?: string | undefined;
        jobTitle?: string | undefined;
        supervisorSurname?: string | undefined;
        supervisorGivenName?: string | undefined;
        endDate?: string | undefined;
        duties?: string | undefined;
    }>, "many">>;
    hasAttendedEducation: z.ZodOptional<z.ZodBoolean>;
    education: z.ZodOptional<z.ZodArray<z.ZodObject<{
        institutionName: z.ZodOptional<z.ZodString>;
        institutionAddress: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        courseOfStudy: z.ZodOptional<z.ZodString>;
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        country?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        institutionName?: string | undefined;
        institutionAddress?: string | undefined;
        courseOfStudy?: string | undefined;
    }, {
        country?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        institutionName?: string | undefined;
        institutionAddress?: string | undefined;
        courseOfStudy?: string | undefined;
    }>, "many">>;
    belongsToClanOrTribe: z.ZodOptional<z.ZodBoolean>;
    clanOrTribeName: z.ZodOptional<z.ZodString>;
    languages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    hasVisitedCountriesLastFiveYears: z.ZodOptional<z.ZodBoolean>;
    countriesVisited: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    belongsToProfessionalOrg: z.ZodOptional<z.ZodBoolean>;
    professionalOrgs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    hasSpecializedSkills: z.ZodOptional<z.ZodBoolean>;
    specializedSkillsDescription: z.ZodOptional<z.ZodString>;
    hasServedInMilitary: z.ZodOptional<z.ZodBoolean>;
    militaryService: z.ZodOptional<z.ZodObject<{
        country: z.ZodOptional<z.ZodString>;
        branch: z.ZodOptional<z.ZodString>;
        rank: z.ZodOptional<z.ZodString>;
        specialty: z.ZodOptional<z.ZodString>;
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        country?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        branch?: string | undefined;
        rank?: string | undefined;
        specialty?: string | undefined;
    }, {
        country?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        branch?: string | undefined;
        rank?: string | undefined;
        specialty?: string | undefined;
    }>>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    primaryOccupation: z.ZodOptional<z.ZodString>;
    presentEmployerName: z.ZodOptional<z.ZodString>;
    presentEmployerAddress: z.ZodOptional<z.ZodString>;
    presentEmployerCity: z.ZodOptional<z.ZodString>;
    presentEmployerState: z.ZodOptional<z.ZodString>;
    presentEmployerPostalCode: z.ZodOptional<z.ZodString>;
    presentEmployerCountry: z.ZodOptional<z.ZodString>;
    presentEmployerPhone: z.ZodOptional<z.ZodString>;
    monthlySalary: z.ZodOptional<z.ZodString>;
    jobDuties: z.ZodOptional<z.ZodString>;
    startDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    wasPreviouslyEmployed: z.ZodOptional<z.ZodBoolean>;
    previousEmployment: z.ZodOptional<z.ZodArray<z.ZodObject<{
        employerName: z.ZodOptional<z.ZodString>;
        employerAddress: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        jobTitle: z.ZodOptional<z.ZodString>;
        supervisorSurname: z.ZodOptional<z.ZodString>;
        supervisorGivenName: z.ZodOptional<z.ZodString>;
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
        duties: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        phone?: string | undefined;
        country?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
        startDate?: string | undefined;
        employerName?: string | undefined;
        employerAddress?: string | undefined;
        jobTitle?: string | undefined;
        supervisorSurname?: string | undefined;
        supervisorGivenName?: string | undefined;
        endDate?: string | undefined;
        duties?: string | undefined;
    }, {
        phone?: string | undefined;
        country?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
        startDate?: string | undefined;
        employerName?: string | undefined;
        employerAddress?: string | undefined;
        jobTitle?: string | undefined;
        supervisorSurname?: string | undefined;
        supervisorGivenName?: string | undefined;
        endDate?: string | undefined;
        duties?: string | undefined;
    }>, "many">>;
    hasAttendedEducation: z.ZodOptional<z.ZodBoolean>;
    education: z.ZodOptional<z.ZodArray<z.ZodObject<{
        institutionName: z.ZodOptional<z.ZodString>;
        institutionAddress: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        courseOfStudy: z.ZodOptional<z.ZodString>;
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        country?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        institutionName?: string | undefined;
        institutionAddress?: string | undefined;
        courseOfStudy?: string | undefined;
    }, {
        country?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        institutionName?: string | undefined;
        institutionAddress?: string | undefined;
        courseOfStudy?: string | undefined;
    }>, "many">>;
    belongsToClanOrTribe: z.ZodOptional<z.ZodBoolean>;
    clanOrTribeName: z.ZodOptional<z.ZodString>;
    languages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    hasVisitedCountriesLastFiveYears: z.ZodOptional<z.ZodBoolean>;
    countriesVisited: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    belongsToProfessionalOrg: z.ZodOptional<z.ZodBoolean>;
    professionalOrgs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    hasSpecializedSkills: z.ZodOptional<z.ZodBoolean>;
    specializedSkillsDescription: z.ZodOptional<z.ZodString>;
    hasServedInMilitary: z.ZodOptional<z.ZodBoolean>;
    militaryService: z.ZodOptional<z.ZodObject<{
        country: z.ZodOptional<z.ZodString>;
        branch: z.ZodOptional<z.ZodString>;
        rank: z.ZodOptional<z.ZodString>;
        specialty: z.ZodOptional<z.ZodString>;
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        country?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        branch?: string | undefined;
        rank?: string | undefined;
        specialty?: string | undefined;
    }, {
        country?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        branch?: string | undefined;
        rank?: string | undefined;
        specialty?: string | undefined;
    }>>;
}, z.ZodTypeAny, "passthrough">>;
export declare const securityInfoDraftSchema: z.ZodObject<{
    hasCommunicableDisease: z.ZodOptional<z.ZodBoolean>;
    hasMentalOrPhysicalDisorder: z.ZodOptional<z.ZodBoolean>;
    isDrugAbuser: z.ZodOptional<z.ZodBoolean>;
    hasBeenArrested: z.ZodOptional<z.ZodBoolean>;
    arrestDetails: z.ZodOptional<z.ZodString>;
    hasViolatedControlledSubstancesLaw: z.ZodOptional<z.ZodBoolean>;
    isEngagedInProstitution: z.ZodOptional<z.ZodBoolean>;
    isInvolvedInMoneyLaundering: z.ZodOptional<z.ZodBoolean>;
    hasCommittedHumanTrafficking: z.ZodOptional<z.ZodBoolean>;
    hasBenefitedFromTrafficking: z.ZodOptional<z.ZodBoolean>;
    hasAidedHumanTrafficking: z.ZodOptional<z.ZodBoolean>;
    seeksEspionage: z.ZodOptional<z.ZodBoolean>;
    seeksToEngageInTerrorism: z.ZodOptional<z.ZodBoolean>;
    hasProvidedTerroristSupport: z.ZodOptional<z.ZodBoolean>;
    isTerroristOrganizationMember: z.ZodOptional<z.ZodBoolean>;
    isRelatedToTerrorist: z.ZodOptional<z.ZodBoolean>;
    hasParticipatedInGenocide: z.ZodOptional<z.ZodBoolean>;
    hasParticipatedInTorture: z.ZodOptional<z.ZodBoolean>;
    hasParticipatedInExtrajudicialKillings: z.ZodOptional<z.ZodBoolean>;
    hasRecruitedChildSoldiers: z.ZodOptional<z.ZodBoolean>;
    hasViolatedReligiousFreedom: z.ZodOptional<z.ZodBoolean>;
    hasEnforcedPopulationControls: z.ZodOptional<z.ZodBoolean>;
    hasInvolvedInOrganTrafficking: z.ZodOptional<z.ZodBoolean>;
    hasSoughtVisaByFraud: z.ZodOptional<z.ZodBoolean>;
    hasBeenRemovedOrDeported: z.ZodOptional<z.ZodBoolean>;
    hasWithheldCustodyOfUSCitizen: z.ZodOptional<z.ZodBoolean>;
    hasVotedInUSIllegally: z.ZodOptional<z.ZodBoolean>;
    hasRenouncedUSCitizenshipToAvoidTax: z.ZodOptional<z.ZodBoolean>;
    hasBeenInUS: z.ZodOptional<z.ZodBoolean>;
    usVisitDetails: z.ZodOptional<z.ZodString>;
    hasBeenIssuedUSVisa: z.ZodOptional<z.ZodBoolean>;
    lastVisaDetails: z.ZodOptional<z.ZodString>;
    hasBeenRefusedUSVisa: z.ZodOptional<z.ZodBoolean>;
    refusalDetails: z.ZodOptional<z.ZodString>;
    hasImmigrantPetitionFiled: z.ZodOptional<z.ZodBoolean>;
    petitionDetails: z.ZodOptional<z.ZodString>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    hasCommunicableDisease: z.ZodOptional<z.ZodBoolean>;
    hasMentalOrPhysicalDisorder: z.ZodOptional<z.ZodBoolean>;
    isDrugAbuser: z.ZodOptional<z.ZodBoolean>;
    hasBeenArrested: z.ZodOptional<z.ZodBoolean>;
    arrestDetails: z.ZodOptional<z.ZodString>;
    hasViolatedControlledSubstancesLaw: z.ZodOptional<z.ZodBoolean>;
    isEngagedInProstitution: z.ZodOptional<z.ZodBoolean>;
    isInvolvedInMoneyLaundering: z.ZodOptional<z.ZodBoolean>;
    hasCommittedHumanTrafficking: z.ZodOptional<z.ZodBoolean>;
    hasBenefitedFromTrafficking: z.ZodOptional<z.ZodBoolean>;
    hasAidedHumanTrafficking: z.ZodOptional<z.ZodBoolean>;
    seeksEspionage: z.ZodOptional<z.ZodBoolean>;
    seeksToEngageInTerrorism: z.ZodOptional<z.ZodBoolean>;
    hasProvidedTerroristSupport: z.ZodOptional<z.ZodBoolean>;
    isTerroristOrganizationMember: z.ZodOptional<z.ZodBoolean>;
    isRelatedToTerrorist: z.ZodOptional<z.ZodBoolean>;
    hasParticipatedInGenocide: z.ZodOptional<z.ZodBoolean>;
    hasParticipatedInTorture: z.ZodOptional<z.ZodBoolean>;
    hasParticipatedInExtrajudicialKillings: z.ZodOptional<z.ZodBoolean>;
    hasRecruitedChildSoldiers: z.ZodOptional<z.ZodBoolean>;
    hasViolatedReligiousFreedom: z.ZodOptional<z.ZodBoolean>;
    hasEnforcedPopulationControls: z.ZodOptional<z.ZodBoolean>;
    hasInvolvedInOrganTrafficking: z.ZodOptional<z.ZodBoolean>;
    hasSoughtVisaByFraud: z.ZodOptional<z.ZodBoolean>;
    hasBeenRemovedOrDeported: z.ZodOptional<z.ZodBoolean>;
    hasWithheldCustodyOfUSCitizen: z.ZodOptional<z.ZodBoolean>;
    hasVotedInUSIllegally: z.ZodOptional<z.ZodBoolean>;
    hasRenouncedUSCitizenshipToAvoidTax: z.ZodOptional<z.ZodBoolean>;
    hasBeenInUS: z.ZodOptional<z.ZodBoolean>;
    usVisitDetails: z.ZodOptional<z.ZodString>;
    hasBeenIssuedUSVisa: z.ZodOptional<z.ZodBoolean>;
    lastVisaDetails: z.ZodOptional<z.ZodString>;
    hasBeenRefusedUSVisa: z.ZodOptional<z.ZodBoolean>;
    refusalDetails: z.ZodOptional<z.ZodString>;
    hasImmigrantPetitionFiled: z.ZodOptional<z.ZodBoolean>;
    petitionDetails: z.ZodOptional<z.ZodString>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    hasCommunicableDisease: z.ZodOptional<z.ZodBoolean>;
    hasMentalOrPhysicalDisorder: z.ZodOptional<z.ZodBoolean>;
    isDrugAbuser: z.ZodOptional<z.ZodBoolean>;
    hasBeenArrested: z.ZodOptional<z.ZodBoolean>;
    arrestDetails: z.ZodOptional<z.ZodString>;
    hasViolatedControlledSubstancesLaw: z.ZodOptional<z.ZodBoolean>;
    isEngagedInProstitution: z.ZodOptional<z.ZodBoolean>;
    isInvolvedInMoneyLaundering: z.ZodOptional<z.ZodBoolean>;
    hasCommittedHumanTrafficking: z.ZodOptional<z.ZodBoolean>;
    hasBenefitedFromTrafficking: z.ZodOptional<z.ZodBoolean>;
    hasAidedHumanTrafficking: z.ZodOptional<z.ZodBoolean>;
    seeksEspionage: z.ZodOptional<z.ZodBoolean>;
    seeksToEngageInTerrorism: z.ZodOptional<z.ZodBoolean>;
    hasProvidedTerroristSupport: z.ZodOptional<z.ZodBoolean>;
    isTerroristOrganizationMember: z.ZodOptional<z.ZodBoolean>;
    isRelatedToTerrorist: z.ZodOptional<z.ZodBoolean>;
    hasParticipatedInGenocide: z.ZodOptional<z.ZodBoolean>;
    hasParticipatedInTorture: z.ZodOptional<z.ZodBoolean>;
    hasParticipatedInExtrajudicialKillings: z.ZodOptional<z.ZodBoolean>;
    hasRecruitedChildSoldiers: z.ZodOptional<z.ZodBoolean>;
    hasViolatedReligiousFreedom: z.ZodOptional<z.ZodBoolean>;
    hasEnforcedPopulationControls: z.ZodOptional<z.ZodBoolean>;
    hasInvolvedInOrganTrafficking: z.ZodOptional<z.ZodBoolean>;
    hasSoughtVisaByFraud: z.ZodOptional<z.ZodBoolean>;
    hasBeenRemovedOrDeported: z.ZodOptional<z.ZodBoolean>;
    hasWithheldCustodyOfUSCitizen: z.ZodOptional<z.ZodBoolean>;
    hasVotedInUSIllegally: z.ZodOptional<z.ZodBoolean>;
    hasRenouncedUSCitizenshipToAvoidTax: z.ZodOptional<z.ZodBoolean>;
    hasBeenInUS: z.ZodOptional<z.ZodBoolean>;
    usVisitDetails: z.ZodOptional<z.ZodString>;
    hasBeenIssuedUSVisa: z.ZodOptional<z.ZodBoolean>;
    lastVisaDetails: z.ZodOptional<z.ZodString>;
    hasBeenRefusedUSVisa: z.ZodOptional<z.ZodBoolean>;
    refusalDetails: z.ZodOptional<z.ZodString>;
    hasImmigrantPetitionFiled: z.ZodOptional<z.ZodBoolean>;
    petitionDetails: z.ZodOptional<z.ZodString>;
}, z.ZodTypeAny, "passthrough">>;
export declare const documentsDraftSchema: z.ZodObject<{
    photo: z.ZodOptional<z.ZodObject<{
        fileName: z.ZodOptional<z.ZodString>;
        fileUrl: z.ZodOptional<z.ZodString>;
        fileSize: z.ZodOptional<z.ZodNumber>;
        uploadedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        fileName?: string | undefined;
        fileUrl?: string | undefined;
        fileSize?: number | undefined;
        uploadedAt?: string | undefined;
    }, {
        fileName?: string | undefined;
        fileUrl?: string | undefined;
        fileSize?: number | undefined;
        uploadedAt?: string | undefined;
    }>>;
    invitationLetter: z.ZodOptional<z.ZodObject<{
        fileName: z.ZodOptional<z.ZodString>;
        fileUrl: z.ZodOptional<z.ZodString>;
        fileSize: z.ZodOptional<z.ZodNumber>;
        uploadedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        fileName?: string | undefined;
        fileUrl?: string | undefined;
        fileSize?: number | undefined;
        uploadedAt?: string | undefined;
    }, {
        fileName?: string | undefined;
        fileUrl?: string | undefined;
        fileSize?: number | undefined;
        uploadedAt?: string | undefined;
    }>>;
    additionalDocuments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        fileName: z.ZodOptional<z.ZodString>;
        fileUrl: z.ZodOptional<z.ZodString>;
        fileSize: z.ZodOptional<z.ZodNumber>;
        uploadedAt: z.ZodOptional<z.ZodString>;
        documentType: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        fileName?: string | undefined;
        fileUrl?: string | undefined;
        fileSize?: number | undefined;
        uploadedAt?: string | undefined;
        documentType?: string | undefined;
    }, {
        fileName?: string | undefined;
        fileUrl?: string | undefined;
        fileSize?: number | undefined;
        uploadedAt?: string | undefined;
        documentType?: string | undefined;
    }>, "many">>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    photo: z.ZodOptional<z.ZodObject<{
        fileName: z.ZodOptional<z.ZodString>;
        fileUrl: z.ZodOptional<z.ZodString>;
        fileSize: z.ZodOptional<z.ZodNumber>;
        uploadedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        fileName?: string | undefined;
        fileUrl?: string | undefined;
        fileSize?: number | undefined;
        uploadedAt?: string | undefined;
    }, {
        fileName?: string | undefined;
        fileUrl?: string | undefined;
        fileSize?: number | undefined;
        uploadedAt?: string | undefined;
    }>>;
    invitationLetter: z.ZodOptional<z.ZodObject<{
        fileName: z.ZodOptional<z.ZodString>;
        fileUrl: z.ZodOptional<z.ZodString>;
        fileSize: z.ZodOptional<z.ZodNumber>;
        uploadedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        fileName?: string | undefined;
        fileUrl?: string | undefined;
        fileSize?: number | undefined;
        uploadedAt?: string | undefined;
    }, {
        fileName?: string | undefined;
        fileUrl?: string | undefined;
        fileSize?: number | undefined;
        uploadedAt?: string | undefined;
    }>>;
    additionalDocuments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        fileName: z.ZodOptional<z.ZodString>;
        fileUrl: z.ZodOptional<z.ZodString>;
        fileSize: z.ZodOptional<z.ZodNumber>;
        uploadedAt: z.ZodOptional<z.ZodString>;
        documentType: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        fileName?: string | undefined;
        fileUrl?: string | undefined;
        fileSize?: number | undefined;
        uploadedAt?: string | undefined;
        documentType?: string | undefined;
    }, {
        fileName?: string | undefined;
        fileUrl?: string | undefined;
        fileSize?: number | undefined;
        uploadedAt?: string | undefined;
        documentType?: string | undefined;
    }>, "many">>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    photo: z.ZodOptional<z.ZodObject<{
        fileName: z.ZodOptional<z.ZodString>;
        fileUrl: z.ZodOptional<z.ZodString>;
        fileSize: z.ZodOptional<z.ZodNumber>;
        uploadedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        fileName?: string | undefined;
        fileUrl?: string | undefined;
        fileSize?: number | undefined;
        uploadedAt?: string | undefined;
    }, {
        fileName?: string | undefined;
        fileUrl?: string | undefined;
        fileSize?: number | undefined;
        uploadedAt?: string | undefined;
    }>>;
    invitationLetter: z.ZodOptional<z.ZodObject<{
        fileName: z.ZodOptional<z.ZodString>;
        fileUrl: z.ZodOptional<z.ZodString>;
        fileSize: z.ZodOptional<z.ZodNumber>;
        uploadedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        fileName?: string | undefined;
        fileUrl?: string | undefined;
        fileSize?: number | undefined;
        uploadedAt?: string | undefined;
    }, {
        fileName?: string | undefined;
        fileUrl?: string | undefined;
        fileSize?: number | undefined;
        uploadedAt?: string | undefined;
    }>>;
    additionalDocuments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        fileName: z.ZodOptional<z.ZodString>;
        fileUrl: z.ZodOptional<z.ZodString>;
        fileSize: z.ZodOptional<z.ZodNumber>;
        uploadedAt: z.ZodOptional<z.ZodString>;
        documentType: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        fileName?: string | undefined;
        fileUrl?: string | undefined;
        fileSize?: number | undefined;
        uploadedAt?: string | undefined;
        documentType?: string | undefined;
    }, {
        fileName?: string | undefined;
        fileUrl?: string | undefined;
        fileSize?: number | undefined;
        uploadedAt?: string | undefined;
        documentType?: string | undefined;
    }>, "many">>;
}, z.ZodTypeAny, "passthrough">>;
export declare const updateApplicationSchema: z.ZodObject<{
    currentStep: z.ZodOptional<z.ZodNumber>;
    personalInfo: z.ZodOptional<z.ZodObject<{
        surnames: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        givenNames: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        fullNameNative: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        otherNamesUsed: z.ZodOptional<z.ZodBoolean>;
        otherNames: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        telCode: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        sex: z.ZodOptional<z.ZodString>;
        maritalStatus: z.ZodOptional<z.ZodString>;
        dateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        cityOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        stateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        countryOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        nationality: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        surnames: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        givenNames: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        fullNameNative: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        otherNamesUsed: z.ZodOptional<z.ZodBoolean>;
        otherNames: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        telCode: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        sex: z.ZodOptional<z.ZodString>;
        maritalStatus: z.ZodOptional<z.ZodString>;
        dateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        cityOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        stateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        countryOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        nationality: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        surnames: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        givenNames: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        fullNameNative: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        otherNamesUsed: z.ZodOptional<z.ZodBoolean>;
        otherNames: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        telCode: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        sex: z.ZodOptional<z.ZodString>;
        maritalStatus: z.ZodOptional<z.ZodString>;
        dateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        cityOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        stateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        countryOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        nationality: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    }, z.ZodTypeAny, "passthrough">>>;
    contactInfo: z.ZodOptional<z.ZodObject<{
        homeAddress: z.ZodOptional<z.ZodAny>;
        mailingAddress: z.ZodOptional<z.ZodAny>;
        phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        secondaryPhone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        workPhone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        homeAddress: z.ZodOptional<z.ZodAny>;
        mailingAddress: z.ZodOptional<z.ZodAny>;
        phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        secondaryPhone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        workPhone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        homeAddress: z.ZodOptional<z.ZodAny>;
        mailingAddress: z.ZodOptional<z.ZodAny>;
        phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        secondaryPhone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        workPhone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    }, z.ZodTypeAny, "passthrough">>>;
    passportInfo: z.ZodOptional<z.ZodObject<{
        passportType: z.ZodOptional<z.ZodString>;
        passportNumber: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        passportBookNumber: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        countryOfIssuance: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        cityOfIssuance: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        stateOfIssuance: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        issuanceDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        expirationDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        hasOtherPassport: z.ZodOptional<z.ZodBoolean>;
        otherPassportInfo: z.ZodOptional<z.ZodAny>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        passportType: z.ZodOptional<z.ZodString>;
        passportNumber: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        passportBookNumber: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        countryOfIssuance: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        cityOfIssuance: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        stateOfIssuance: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        issuanceDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        expirationDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        hasOtherPassport: z.ZodOptional<z.ZodBoolean>;
        otherPassportInfo: z.ZodOptional<z.ZodAny>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        passportType: z.ZodOptional<z.ZodString>;
        passportNumber: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        passportBookNumber: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        countryOfIssuance: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        cityOfIssuance: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        stateOfIssuance: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        issuanceDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        expirationDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        hasOtherPassport: z.ZodOptional<z.ZodBoolean>;
        otherPassportInfo: z.ZodOptional<z.ZodAny>;
    }, z.ZodTypeAny, "passthrough">>>;
    travelInfo: z.ZodOptional<z.ZodObject<{
        purposeOfTrip: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        specificPurpose: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        intendedArrivalDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        intendedLengthOfStay: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        addressWhileInUS: z.ZodOptional<z.ZodAny>;
        payingForTrip: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        travelingWithOthers: z.ZodOptional<z.ZodBoolean>;
        companions: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        purposeOfTrip: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        specificPurpose: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        intendedArrivalDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        intendedLengthOfStay: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        addressWhileInUS: z.ZodOptional<z.ZodAny>;
        payingForTrip: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        travelingWithOthers: z.ZodOptional<z.ZodBoolean>;
        companions: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        purposeOfTrip: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        specificPurpose: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        intendedArrivalDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        intendedLengthOfStay: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        addressWhileInUS: z.ZodOptional<z.ZodAny>;
        payingForTrip: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        travelingWithOthers: z.ZodOptional<z.ZodBoolean>;
        companions: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
    }, z.ZodTypeAny, "passthrough">>>;
    familyInfo: z.ZodOptional<z.ZodObject<{
        fatherSurnames: z.ZodOptional<z.ZodString>;
        fatherGivenNames: z.ZodOptional<z.ZodString>;
        fatherDateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        isFatherInUS: z.ZodOptional<z.ZodBoolean>;
        fatherUSStatus: z.ZodOptional<z.ZodString>;
        motherSurnames: z.ZodOptional<z.ZodString>;
        motherGivenNames: z.ZodOptional<z.ZodString>;
        motherDateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        isMotherInUS: z.ZodOptional<z.ZodBoolean>;
        motherUSStatus: z.ZodOptional<z.ZodString>;
        hasSpouse: z.ZodOptional<z.ZodBoolean>;
        spouseFullName: z.ZodOptional<z.ZodString>;
        spouseDateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        spouseNationality: z.ZodOptional<z.ZodString>;
        spouseCityOfBirth: z.ZodOptional<z.ZodString>;
        spouseCountryOfBirth: z.ZodOptional<z.ZodString>;
        spouseAddress: z.ZodOptional<z.ZodString>;
        spouseAddressSameAsApplicant: z.ZodOptional<z.ZodBoolean>;
        hasChildren: z.ZodOptional<z.ZodBoolean>;
        children: z.ZodOptional<z.ZodArray<z.ZodObject<{
            fullName: z.ZodOptional<z.ZodString>;
            dateOfBirth: z.ZodOptional<z.ZodString>;
            relationship: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            dateOfBirth?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }, {
            dateOfBirth?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }>, "many">>;
        hasImmediateRelativesInUS: z.ZodOptional<z.ZodBoolean>;
        immediateRelativesInUS: z.ZodOptional<z.ZodArray<z.ZodObject<{
            fullName: z.ZodOptional<z.ZodString>;
            relationship: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }, {
            status?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }>, "many">>;
        hasOtherRelativesInUS: z.ZodOptional<z.ZodBoolean>;
        otherRelativesInUS: z.ZodOptional<z.ZodArray<z.ZodObject<{
            fullName: z.ZodOptional<z.ZodString>;
            relationship: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }, {
            status?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }>, "many">>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        fatherSurnames: z.ZodOptional<z.ZodString>;
        fatherGivenNames: z.ZodOptional<z.ZodString>;
        fatherDateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        isFatherInUS: z.ZodOptional<z.ZodBoolean>;
        fatherUSStatus: z.ZodOptional<z.ZodString>;
        motherSurnames: z.ZodOptional<z.ZodString>;
        motherGivenNames: z.ZodOptional<z.ZodString>;
        motherDateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        isMotherInUS: z.ZodOptional<z.ZodBoolean>;
        motherUSStatus: z.ZodOptional<z.ZodString>;
        hasSpouse: z.ZodOptional<z.ZodBoolean>;
        spouseFullName: z.ZodOptional<z.ZodString>;
        spouseDateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        spouseNationality: z.ZodOptional<z.ZodString>;
        spouseCityOfBirth: z.ZodOptional<z.ZodString>;
        spouseCountryOfBirth: z.ZodOptional<z.ZodString>;
        spouseAddress: z.ZodOptional<z.ZodString>;
        spouseAddressSameAsApplicant: z.ZodOptional<z.ZodBoolean>;
        hasChildren: z.ZodOptional<z.ZodBoolean>;
        children: z.ZodOptional<z.ZodArray<z.ZodObject<{
            fullName: z.ZodOptional<z.ZodString>;
            dateOfBirth: z.ZodOptional<z.ZodString>;
            relationship: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            dateOfBirth?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }, {
            dateOfBirth?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }>, "many">>;
        hasImmediateRelativesInUS: z.ZodOptional<z.ZodBoolean>;
        immediateRelativesInUS: z.ZodOptional<z.ZodArray<z.ZodObject<{
            fullName: z.ZodOptional<z.ZodString>;
            relationship: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }, {
            status?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }>, "many">>;
        hasOtherRelativesInUS: z.ZodOptional<z.ZodBoolean>;
        otherRelativesInUS: z.ZodOptional<z.ZodArray<z.ZodObject<{
            fullName: z.ZodOptional<z.ZodString>;
            relationship: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }, {
            status?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }>, "many">>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        fatherSurnames: z.ZodOptional<z.ZodString>;
        fatherGivenNames: z.ZodOptional<z.ZodString>;
        fatherDateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        isFatherInUS: z.ZodOptional<z.ZodBoolean>;
        fatherUSStatus: z.ZodOptional<z.ZodString>;
        motherSurnames: z.ZodOptional<z.ZodString>;
        motherGivenNames: z.ZodOptional<z.ZodString>;
        motherDateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        isMotherInUS: z.ZodOptional<z.ZodBoolean>;
        motherUSStatus: z.ZodOptional<z.ZodString>;
        hasSpouse: z.ZodOptional<z.ZodBoolean>;
        spouseFullName: z.ZodOptional<z.ZodString>;
        spouseDateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        spouseNationality: z.ZodOptional<z.ZodString>;
        spouseCityOfBirth: z.ZodOptional<z.ZodString>;
        spouseCountryOfBirth: z.ZodOptional<z.ZodString>;
        spouseAddress: z.ZodOptional<z.ZodString>;
        spouseAddressSameAsApplicant: z.ZodOptional<z.ZodBoolean>;
        hasChildren: z.ZodOptional<z.ZodBoolean>;
        children: z.ZodOptional<z.ZodArray<z.ZodObject<{
            fullName: z.ZodOptional<z.ZodString>;
            dateOfBirth: z.ZodOptional<z.ZodString>;
            relationship: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            dateOfBirth?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }, {
            dateOfBirth?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }>, "many">>;
        hasImmediateRelativesInUS: z.ZodOptional<z.ZodBoolean>;
        immediateRelativesInUS: z.ZodOptional<z.ZodArray<z.ZodObject<{
            fullName: z.ZodOptional<z.ZodString>;
            relationship: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }, {
            status?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }>, "many">>;
        hasOtherRelativesInUS: z.ZodOptional<z.ZodBoolean>;
        otherRelativesInUS: z.ZodOptional<z.ZodArray<z.ZodObject<{
            fullName: z.ZodOptional<z.ZodString>;
            relationship: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }, {
            status?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }>, "many">>;
    }, z.ZodTypeAny, "passthrough">>>;
    workEducation: z.ZodOptional<z.ZodObject<{
        primaryOccupation: z.ZodOptional<z.ZodString>;
        presentEmployerName: z.ZodOptional<z.ZodString>;
        presentEmployerAddress: z.ZodOptional<z.ZodString>;
        presentEmployerCity: z.ZodOptional<z.ZodString>;
        presentEmployerState: z.ZodOptional<z.ZodString>;
        presentEmployerPostalCode: z.ZodOptional<z.ZodString>;
        presentEmployerCountry: z.ZodOptional<z.ZodString>;
        presentEmployerPhone: z.ZodOptional<z.ZodString>;
        monthlySalary: z.ZodOptional<z.ZodString>;
        jobDuties: z.ZodOptional<z.ZodString>;
        startDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        wasPreviouslyEmployed: z.ZodOptional<z.ZodBoolean>;
        previousEmployment: z.ZodOptional<z.ZodArray<z.ZodObject<{
            employerName: z.ZodOptional<z.ZodString>;
            employerAddress: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
            state: z.ZodOptional<z.ZodString>;
            postalCode: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
            phone: z.ZodOptional<z.ZodString>;
            jobTitle: z.ZodOptional<z.ZodString>;
            supervisorSurname: z.ZodOptional<z.ZodString>;
            supervisorGivenName: z.ZodOptional<z.ZodString>;
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
            duties: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            phone?: string | undefined;
            country?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postalCode?: string | undefined;
            startDate?: string | undefined;
            employerName?: string | undefined;
            employerAddress?: string | undefined;
            jobTitle?: string | undefined;
            supervisorSurname?: string | undefined;
            supervisorGivenName?: string | undefined;
            endDate?: string | undefined;
            duties?: string | undefined;
        }, {
            phone?: string | undefined;
            country?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postalCode?: string | undefined;
            startDate?: string | undefined;
            employerName?: string | undefined;
            employerAddress?: string | undefined;
            jobTitle?: string | undefined;
            supervisorSurname?: string | undefined;
            supervisorGivenName?: string | undefined;
            endDate?: string | undefined;
            duties?: string | undefined;
        }>, "many">>;
        hasAttendedEducation: z.ZodOptional<z.ZodBoolean>;
        education: z.ZodOptional<z.ZodArray<z.ZodObject<{
            institutionName: z.ZodOptional<z.ZodString>;
            institutionAddress: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
            state: z.ZodOptional<z.ZodString>;
            postalCode: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
            courseOfStudy: z.ZodOptional<z.ZodString>;
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            country?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postalCode?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            institutionName?: string | undefined;
            institutionAddress?: string | undefined;
            courseOfStudy?: string | undefined;
        }, {
            country?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postalCode?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            institutionName?: string | undefined;
            institutionAddress?: string | undefined;
            courseOfStudy?: string | undefined;
        }>, "many">>;
        belongsToClanOrTribe: z.ZodOptional<z.ZodBoolean>;
        clanOrTribeName: z.ZodOptional<z.ZodString>;
        languages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        hasVisitedCountriesLastFiveYears: z.ZodOptional<z.ZodBoolean>;
        countriesVisited: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        belongsToProfessionalOrg: z.ZodOptional<z.ZodBoolean>;
        professionalOrgs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        hasSpecializedSkills: z.ZodOptional<z.ZodBoolean>;
        specializedSkillsDescription: z.ZodOptional<z.ZodString>;
        hasServedInMilitary: z.ZodOptional<z.ZodBoolean>;
        militaryService: z.ZodOptional<z.ZodObject<{
            country: z.ZodOptional<z.ZodString>;
            branch: z.ZodOptional<z.ZodString>;
            rank: z.ZodOptional<z.ZodString>;
            specialty: z.ZodOptional<z.ZodString>;
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            country?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            branch?: string | undefined;
            rank?: string | undefined;
            specialty?: string | undefined;
        }, {
            country?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            branch?: string | undefined;
            rank?: string | undefined;
            specialty?: string | undefined;
        }>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        primaryOccupation: z.ZodOptional<z.ZodString>;
        presentEmployerName: z.ZodOptional<z.ZodString>;
        presentEmployerAddress: z.ZodOptional<z.ZodString>;
        presentEmployerCity: z.ZodOptional<z.ZodString>;
        presentEmployerState: z.ZodOptional<z.ZodString>;
        presentEmployerPostalCode: z.ZodOptional<z.ZodString>;
        presentEmployerCountry: z.ZodOptional<z.ZodString>;
        presentEmployerPhone: z.ZodOptional<z.ZodString>;
        monthlySalary: z.ZodOptional<z.ZodString>;
        jobDuties: z.ZodOptional<z.ZodString>;
        startDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        wasPreviouslyEmployed: z.ZodOptional<z.ZodBoolean>;
        previousEmployment: z.ZodOptional<z.ZodArray<z.ZodObject<{
            employerName: z.ZodOptional<z.ZodString>;
            employerAddress: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
            state: z.ZodOptional<z.ZodString>;
            postalCode: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
            phone: z.ZodOptional<z.ZodString>;
            jobTitle: z.ZodOptional<z.ZodString>;
            supervisorSurname: z.ZodOptional<z.ZodString>;
            supervisorGivenName: z.ZodOptional<z.ZodString>;
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
            duties: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            phone?: string | undefined;
            country?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postalCode?: string | undefined;
            startDate?: string | undefined;
            employerName?: string | undefined;
            employerAddress?: string | undefined;
            jobTitle?: string | undefined;
            supervisorSurname?: string | undefined;
            supervisorGivenName?: string | undefined;
            endDate?: string | undefined;
            duties?: string | undefined;
        }, {
            phone?: string | undefined;
            country?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postalCode?: string | undefined;
            startDate?: string | undefined;
            employerName?: string | undefined;
            employerAddress?: string | undefined;
            jobTitle?: string | undefined;
            supervisorSurname?: string | undefined;
            supervisorGivenName?: string | undefined;
            endDate?: string | undefined;
            duties?: string | undefined;
        }>, "many">>;
        hasAttendedEducation: z.ZodOptional<z.ZodBoolean>;
        education: z.ZodOptional<z.ZodArray<z.ZodObject<{
            institutionName: z.ZodOptional<z.ZodString>;
            institutionAddress: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
            state: z.ZodOptional<z.ZodString>;
            postalCode: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
            courseOfStudy: z.ZodOptional<z.ZodString>;
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            country?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postalCode?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            institutionName?: string | undefined;
            institutionAddress?: string | undefined;
            courseOfStudy?: string | undefined;
        }, {
            country?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postalCode?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            institutionName?: string | undefined;
            institutionAddress?: string | undefined;
            courseOfStudy?: string | undefined;
        }>, "many">>;
        belongsToClanOrTribe: z.ZodOptional<z.ZodBoolean>;
        clanOrTribeName: z.ZodOptional<z.ZodString>;
        languages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        hasVisitedCountriesLastFiveYears: z.ZodOptional<z.ZodBoolean>;
        countriesVisited: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        belongsToProfessionalOrg: z.ZodOptional<z.ZodBoolean>;
        professionalOrgs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        hasSpecializedSkills: z.ZodOptional<z.ZodBoolean>;
        specializedSkillsDescription: z.ZodOptional<z.ZodString>;
        hasServedInMilitary: z.ZodOptional<z.ZodBoolean>;
        militaryService: z.ZodOptional<z.ZodObject<{
            country: z.ZodOptional<z.ZodString>;
            branch: z.ZodOptional<z.ZodString>;
            rank: z.ZodOptional<z.ZodString>;
            specialty: z.ZodOptional<z.ZodString>;
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            country?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            branch?: string | undefined;
            rank?: string | undefined;
            specialty?: string | undefined;
        }, {
            country?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            branch?: string | undefined;
            rank?: string | undefined;
            specialty?: string | undefined;
        }>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        primaryOccupation: z.ZodOptional<z.ZodString>;
        presentEmployerName: z.ZodOptional<z.ZodString>;
        presentEmployerAddress: z.ZodOptional<z.ZodString>;
        presentEmployerCity: z.ZodOptional<z.ZodString>;
        presentEmployerState: z.ZodOptional<z.ZodString>;
        presentEmployerPostalCode: z.ZodOptional<z.ZodString>;
        presentEmployerCountry: z.ZodOptional<z.ZodString>;
        presentEmployerPhone: z.ZodOptional<z.ZodString>;
        monthlySalary: z.ZodOptional<z.ZodString>;
        jobDuties: z.ZodOptional<z.ZodString>;
        startDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        wasPreviouslyEmployed: z.ZodOptional<z.ZodBoolean>;
        previousEmployment: z.ZodOptional<z.ZodArray<z.ZodObject<{
            employerName: z.ZodOptional<z.ZodString>;
            employerAddress: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
            state: z.ZodOptional<z.ZodString>;
            postalCode: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
            phone: z.ZodOptional<z.ZodString>;
            jobTitle: z.ZodOptional<z.ZodString>;
            supervisorSurname: z.ZodOptional<z.ZodString>;
            supervisorGivenName: z.ZodOptional<z.ZodString>;
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
            duties: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            phone?: string | undefined;
            country?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postalCode?: string | undefined;
            startDate?: string | undefined;
            employerName?: string | undefined;
            employerAddress?: string | undefined;
            jobTitle?: string | undefined;
            supervisorSurname?: string | undefined;
            supervisorGivenName?: string | undefined;
            endDate?: string | undefined;
            duties?: string | undefined;
        }, {
            phone?: string | undefined;
            country?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postalCode?: string | undefined;
            startDate?: string | undefined;
            employerName?: string | undefined;
            employerAddress?: string | undefined;
            jobTitle?: string | undefined;
            supervisorSurname?: string | undefined;
            supervisorGivenName?: string | undefined;
            endDate?: string | undefined;
            duties?: string | undefined;
        }>, "many">>;
        hasAttendedEducation: z.ZodOptional<z.ZodBoolean>;
        education: z.ZodOptional<z.ZodArray<z.ZodObject<{
            institutionName: z.ZodOptional<z.ZodString>;
            institutionAddress: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
            state: z.ZodOptional<z.ZodString>;
            postalCode: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
            courseOfStudy: z.ZodOptional<z.ZodString>;
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            country?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postalCode?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            institutionName?: string | undefined;
            institutionAddress?: string | undefined;
            courseOfStudy?: string | undefined;
        }, {
            country?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postalCode?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            institutionName?: string | undefined;
            institutionAddress?: string | undefined;
            courseOfStudy?: string | undefined;
        }>, "many">>;
        belongsToClanOrTribe: z.ZodOptional<z.ZodBoolean>;
        clanOrTribeName: z.ZodOptional<z.ZodString>;
        languages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        hasVisitedCountriesLastFiveYears: z.ZodOptional<z.ZodBoolean>;
        countriesVisited: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        belongsToProfessionalOrg: z.ZodOptional<z.ZodBoolean>;
        professionalOrgs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        hasSpecializedSkills: z.ZodOptional<z.ZodBoolean>;
        specializedSkillsDescription: z.ZodOptional<z.ZodString>;
        hasServedInMilitary: z.ZodOptional<z.ZodBoolean>;
        militaryService: z.ZodOptional<z.ZodObject<{
            country: z.ZodOptional<z.ZodString>;
            branch: z.ZodOptional<z.ZodString>;
            rank: z.ZodOptional<z.ZodString>;
            specialty: z.ZodOptional<z.ZodString>;
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            country?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            branch?: string | undefined;
            rank?: string | undefined;
            specialty?: string | undefined;
        }, {
            country?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            branch?: string | undefined;
            rank?: string | undefined;
            specialty?: string | undefined;
        }>>;
    }, z.ZodTypeAny, "passthrough">>>;
    securityInfo: z.ZodOptional<z.ZodObject<{
        hasCommunicableDisease: z.ZodOptional<z.ZodBoolean>;
        hasMentalOrPhysicalDisorder: z.ZodOptional<z.ZodBoolean>;
        isDrugAbuser: z.ZodOptional<z.ZodBoolean>;
        hasBeenArrested: z.ZodOptional<z.ZodBoolean>;
        arrestDetails: z.ZodOptional<z.ZodString>;
        hasViolatedControlledSubstancesLaw: z.ZodOptional<z.ZodBoolean>;
        isEngagedInProstitution: z.ZodOptional<z.ZodBoolean>;
        isInvolvedInMoneyLaundering: z.ZodOptional<z.ZodBoolean>;
        hasCommittedHumanTrafficking: z.ZodOptional<z.ZodBoolean>;
        hasBenefitedFromTrafficking: z.ZodOptional<z.ZodBoolean>;
        hasAidedHumanTrafficking: z.ZodOptional<z.ZodBoolean>;
        seeksEspionage: z.ZodOptional<z.ZodBoolean>;
        seeksToEngageInTerrorism: z.ZodOptional<z.ZodBoolean>;
        hasProvidedTerroristSupport: z.ZodOptional<z.ZodBoolean>;
        isTerroristOrganizationMember: z.ZodOptional<z.ZodBoolean>;
        isRelatedToTerrorist: z.ZodOptional<z.ZodBoolean>;
        hasParticipatedInGenocide: z.ZodOptional<z.ZodBoolean>;
        hasParticipatedInTorture: z.ZodOptional<z.ZodBoolean>;
        hasParticipatedInExtrajudicialKillings: z.ZodOptional<z.ZodBoolean>;
        hasRecruitedChildSoldiers: z.ZodOptional<z.ZodBoolean>;
        hasViolatedReligiousFreedom: z.ZodOptional<z.ZodBoolean>;
        hasEnforcedPopulationControls: z.ZodOptional<z.ZodBoolean>;
        hasInvolvedInOrganTrafficking: z.ZodOptional<z.ZodBoolean>;
        hasSoughtVisaByFraud: z.ZodOptional<z.ZodBoolean>;
        hasBeenRemovedOrDeported: z.ZodOptional<z.ZodBoolean>;
        hasWithheldCustodyOfUSCitizen: z.ZodOptional<z.ZodBoolean>;
        hasVotedInUSIllegally: z.ZodOptional<z.ZodBoolean>;
        hasRenouncedUSCitizenshipToAvoidTax: z.ZodOptional<z.ZodBoolean>;
        hasBeenInUS: z.ZodOptional<z.ZodBoolean>;
        usVisitDetails: z.ZodOptional<z.ZodString>;
        hasBeenIssuedUSVisa: z.ZodOptional<z.ZodBoolean>;
        lastVisaDetails: z.ZodOptional<z.ZodString>;
        hasBeenRefusedUSVisa: z.ZodOptional<z.ZodBoolean>;
        refusalDetails: z.ZodOptional<z.ZodString>;
        hasImmigrantPetitionFiled: z.ZodOptional<z.ZodBoolean>;
        petitionDetails: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        hasCommunicableDisease: z.ZodOptional<z.ZodBoolean>;
        hasMentalOrPhysicalDisorder: z.ZodOptional<z.ZodBoolean>;
        isDrugAbuser: z.ZodOptional<z.ZodBoolean>;
        hasBeenArrested: z.ZodOptional<z.ZodBoolean>;
        arrestDetails: z.ZodOptional<z.ZodString>;
        hasViolatedControlledSubstancesLaw: z.ZodOptional<z.ZodBoolean>;
        isEngagedInProstitution: z.ZodOptional<z.ZodBoolean>;
        isInvolvedInMoneyLaundering: z.ZodOptional<z.ZodBoolean>;
        hasCommittedHumanTrafficking: z.ZodOptional<z.ZodBoolean>;
        hasBenefitedFromTrafficking: z.ZodOptional<z.ZodBoolean>;
        hasAidedHumanTrafficking: z.ZodOptional<z.ZodBoolean>;
        seeksEspionage: z.ZodOptional<z.ZodBoolean>;
        seeksToEngageInTerrorism: z.ZodOptional<z.ZodBoolean>;
        hasProvidedTerroristSupport: z.ZodOptional<z.ZodBoolean>;
        isTerroristOrganizationMember: z.ZodOptional<z.ZodBoolean>;
        isRelatedToTerrorist: z.ZodOptional<z.ZodBoolean>;
        hasParticipatedInGenocide: z.ZodOptional<z.ZodBoolean>;
        hasParticipatedInTorture: z.ZodOptional<z.ZodBoolean>;
        hasParticipatedInExtrajudicialKillings: z.ZodOptional<z.ZodBoolean>;
        hasRecruitedChildSoldiers: z.ZodOptional<z.ZodBoolean>;
        hasViolatedReligiousFreedom: z.ZodOptional<z.ZodBoolean>;
        hasEnforcedPopulationControls: z.ZodOptional<z.ZodBoolean>;
        hasInvolvedInOrganTrafficking: z.ZodOptional<z.ZodBoolean>;
        hasSoughtVisaByFraud: z.ZodOptional<z.ZodBoolean>;
        hasBeenRemovedOrDeported: z.ZodOptional<z.ZodBoolean>;
        hasWithheldCustodyOfUSCitizen: z.ZodOptional<z.ZodBoolean>;
        hasVotedInUSIllegally: z.ZodOptional<z.ZodBoolean>;
        hasRenouncedUSCitizenshipToAvoidTax: z.ZodOptional<z.ZodBoolean>;
        hasBeenInUS: z.ZodOptional<z.ZodBoolean>;
        usVisitDetails: z.ZodOptional<z.ZodString>;
        hasBeenIssuedUSVisa: z.ZodOptional<z.ZodBoolean>;
        lastVisaDetails: z.ZodOptional<z.ZodString>;
        hasBeenRefusedUSVisa: z.ZodOptional<z.ZodBoolean>;
        refusalDetails: z.ZodOptional<z.ZodString>;
        hasImmigrantPetitionFiled: z.ZodOptional<z.ZodBoolean>;
        petitionDetails: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        hasCommunicableDisease: z.ZodOptional<z.ZodBoolean>;
        hasMentalOrPhysicalDisorder: z.ZodOptional<z.ZodBoolean>;
        isDrugAbuser: z.ZodOptional<z.ZodBoolean>;
        hasBeenArrested: z.ZodOptional<z.ZodBoolean>;
        arrestDetails: z.ZodOptional<z.ZodString>;
        hasViolatedControlledSubstancesLaw: z.ZodOptional<z.ZodBoolean>;
        isEngagedInProstitution: z.ZodOptional<z.ZodBoolean>;
        isInvolvedInMoneyLaundering: z.ZodOptional<z.ZodBoolean>;
        hasCommittedHumanTrafficking: z.ZodOptional<z.ZodBoolean>;
        hasBenefitedFromTrafficking: z.ZodOptional<z.ZodBoolean>;
        hasAidedHumanTrafficking: z.ZodOptional<z.ZodBoolean>;
        seeksEspionage: z.ZodOptional<z.ZodBoolean>;
        seeksToEngageInTerrorism: z.ZodOptional<z.ZodBoolean>;
        hasProvidedTerroristSupport: z.ZodOptional<z.ZodBoolean>;
        isTerroristOrganizationMember: z.ZodOptional<z.ZodBoolean>;
        isRelatedToTerrorist: z.ZodOptional<z.ZodBoolean>;
        hasParticipatedInGenocide: z.ZodOptional<z.ZodBoolean>;
        hasParticipatedInTorture: z.ZodOptional<z.ZodBoolean>;
        hasParticipatedInExtrajudicialKillings: z.ZodOptional<z.ZodBoolean>;
        hasRecruitedChildSoldiers: z.ZodOptional<z.ZodBoolean>;
        hasViolatedReligiousFreedom: z.ZodOptional<z.ZodBoolean>;
        hasEnforcedPopulationControls: z.ZodOptional<z.ZodBoolean>;
        hasInvolvedInOrganTrafficking: z.ZodOptional<z.ZodBoolean>;
        hasSoughtVisaByFraud: z.ZodOptional<z.ZodBoolean>;
        hasBeenRemovedOrDeported: z.ZodOptional<z.ZodBoolean>;
        hasWithheldCustodyOfUSCitizen: z.ZodOptional<z.ZodBoolean>;
        hasVotedInUSIllegally: z.ZodOptional<z.ZodBoolean>;
        hasRenouncedUSCitizenshipToAvoidTax: z.ZodOptional<z.ZodBoolean>;
        hasBeenInUS: z.ZodOptional<z.ZodBoolean>;
        usVisitDetails: z.ZodOptional<z.ZodString>;
        hasBeenIssuedUSVisa: z.ZodOptional<z.ZodBoolean>;
        lastVisaDetails: z.ZodOptional<z.ZodString>;
        hasBeenRefusedUSVisa: z.ZodOptional<z.ZodBoolean>;
        refusalDetails: z.ZodOptional<z.ZodString>;
        hasImmigrantPetitionFiled: z.ZodOptional<z.ZodBoolean>;
        petitionDetails: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
    documents: z.ZodOptional<z.ZodObject<{
        photo: z.ZodOptional<z.ZodObject<{
            fileName: z.ZodOptional<z.ZodString>;
            fileUrl: z.ZodOptional<z.ZodString>;
            fileSize: z.ZodOptional<z.ZodNumber>;
            uploadedAt: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
        }, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
        }>>;
        invitationLetter: z.ZodOptional<z.ZodObject<{
            fileName: z.ZodOptional<z.ZodString>;
            fileUrl: z.ZodOptional<z.ZodString>;
            fileSize: z.ZodOptional<z.ZodNumber>;
            uploadedAt: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
        }, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
        }>>;
        additionalDocuments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            fileName: z.ZodOptional<z.ZodString>;
            fileUrl: z.ZodOptional<z.ZodString>;
            fileSize: z.ZodOptional<z.ZodNumber>;
            uploadedAt: z.ZodOptional<z.ZodString>;
            documentType: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
            documentType?: string | undefined;
        }, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
            documentType?: string | undefined;
        }>, "many">>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        photo: z.ZodOptional<z.ZodObject<{
            fileName: z.ZodOptional<z.ZodString>;
            fileUrl: z.ZodOptional<z.ZodString>;
            fileSize: z.ZodOptional<z.ZodNumber>;
            uploadedAt: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
        }, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
        }>>;
        invitationLetter: z.ZodOptional<z.ZodObject<{
            fileName: z.ZodOptional<z.ZodString>;
            fileUrl: z.ZodOptional<z.ZodString>;
            fileSize: z.ZodOptional<z.ZodNumber>;
            uploadedAt: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
        }, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
        }>>;
        additionalDocuments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            fileName: z.ZodOptional<z.ZodString>;
            fileUrl: z.ZodOptional<z.ZodString>;
            fileSize: z.ZodOptional<z.ZodNumber>;
            uploadedAt: z.ZodOptional<z.ZodString>;
            documentType: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
            documentType?: string | undefined;
        }, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
            documentType?: string | undefined;
        }>, "many">>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        photo: z.ZodOptional<z.ZodObject<{
            fileName: z.ZodOptional<z.ZodString>;
            fileUrl: z.ZodOptional<z.ZodString>;
            fileSize: z.ZodOptional<z.ZodNumber>;
            uploadedAt: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
        }, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
        }>>;
        invitationLetter: z.ZodOptional<z.ZodObject<{
            fileName: z.ZodOptional<z.ZodString>;
            fileUrl: z.ZodOptional<z.ZodString>;
            fileSize: z.ZodOptional<z.ZodNumber>;
            uploadedAt: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
        }, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
        }>>;
        additionalDocuments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            fileName: z.ZodOptional<z.ZodString>;
            fileUrl: z.ZodOptional<z.ZodString>;
            fileSize: z.ZodOptional<z.ZodNumber>;
            uploadedAt: z.ZodOptional<z.ZodString>;
            documentType: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
            documentType?: string | undefined;
        }, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
            documentType?: string | undefined;
        }>, "many">>;
    }, z.ZodTypeAny, "passthrough">>>;
}, "strip", z.ZodTypeAny, {
    currentStep?: number | undefined;
    personalInfo?: z.objectOutputType<{
        surnames: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        givenNames: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        fullNameNative: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        otherNamesUsed: z.ZodOptional<z.ZodBoolean>;
        otherNames: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        telCode: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        sex: z.ZodOptional<z.ZodString>;
        maritalStatus: z.ZodOptional<z.ZodString>;
        dateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        cityOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        stateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        countryOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        nationality: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    contactInfo?: z.objectOutputType<{
        homeAddress: z.ZodOptional<z.ZodAny>;
        mailingAddress: z.ZodOptional<z.ZodAny>;
        phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        secondaryPhone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        workPhone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    passportInfo?: z.objectOutputType<{
        passportType: z.ZodOptional<z.ZodString>;
        passportNumber: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        passportBookNumber: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        countryOfIssuance: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        cityOfIssuance: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        stateOfIssuance: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        issuanceDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        expirationDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        hasOtherPassport: z.ZodOptional<z.ZodBoolean>;
        otherPassportInfo: z.ZodOptional<z.ZodAny>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    travelInfo?: z.objectOutputType<{
        purposeOfTrip: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        specificPurpose: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        intendedArrivalDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        intendedLengthOfStay: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        addressWhileInUS: z.ZodOptional<z.ZodAny>;
        payingForTrip: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        travelingWithOthers: z.ZodOptional<z.ZodBoolean>;
        companions: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    familyInfo?: z.objectOutputType<{
        fatherSurnames: z.ZodOptional<z.ZodString>;
        fatherGivenNames: z.ZodOptional<z.ZodString>;
        fatherDateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        isFatherInUS: z.ZodOptional<z.ZodBoolean>;
        fatherUSStatus: z.ZodOptional<z.ZodString>;
        motherSurnames: z.ZodOptional<z.ZodString>;
        motherGivenNames: z.ZodOptional<z.ZodString>;
        motherDateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        isMotherInUS: z.ZodOptional<z.ZodBoolean>;
        motherUSStatus: z.ZodOptional<z.ZodString>;
        hasSpouse: z.ZodOptional<z.ZodBoolean>;
        spouseFullName: z.ZodOptional<z.ZodString>;
        spouseDateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        spouseNationality: z.ZodOptional<z.ZodString>;
        spouseCityOfBirth: z.ZodOptional<z.ZodString>;
        spouseCountryOfBirth: z.ZodOptional<z.ZodString>;
        spouseAddress: z.ZodOptional<z.ZodString>;
        spouseAddressSameAsApplicant: z.ZodOptional<z.ZodBoolean>;
        hasChildren: z.ZodOptional<z.ZodBoolean>;
        children: z.ZodOptional<z.ZodArray<z.ZodObject<{
            fullName: z.ZodOptional<z.ZodString>;
            dateOfBirth: z.ZodOptional<z.ZodString>;
            relationship: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            dateOfBirth?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }, {
            dateOfBirth?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }>, "many">>;
        hasImmediateRelativesInUS: z.ZodOptional<z.ZodBoolean>;
        immediateRelativesInUS: z.ZodOptional<z.ZodArray<z.ZodObject<{
            fullName: z.ZodOptional<z.ZodString>;
            relationship: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }, {
            status?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }>, "many">>;
        hasOtherRelativesInUS: z.ZodOptional<z.ZodBoolean>;
        otherRelativesInUS: z.ZodOptional<z.ZodArray<z.ZodObject<{
            fullName: z.ZodOptional<z.ZodString>;
            relationship: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }, {
            status?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }>, "many">>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    workEducation?: z.objectOutputType<{
        primaryOccupation: z.ZodOptional<z.ZodString>;
        presentEmployerName: z.ZodOptional<z.ZodString>;
        presentEmployerAddress: z.ZodOptional<z.ZodString>;
        presentEmployerCity: z.ZodOptional<z.ZodString>;
        presentEmployerState: z.ZodOptional<z.ZodString>;
        presentEmployerPostalCode: z.ZodOptional<z.ZodString>;
        presentEmployerCountry: z.ZodOptional<z.ZodString>;
        presentEmployerPhone: z.ZodOptional<z.ZodString>;
        monthlySalary: z.ZodOptional<z.ZodString>;
        jobDuties: z.ZodOptional<z.ZodString>;
        startDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        wasPreviouslyEmployed: z.ZodOptional<z.ZodBoolean>;
        previousEmployment: z.ZodOptional<z.ZodArray<z.ZodObject<{
            employerName: z.ZodOptional<z.ZodString>;
            employerAddress: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
            state: z.ZodOptional<z.ZodString>;
            postalCode: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
            phone: z.ZodOptional<z.ZodString>;
            jobTitle: z.ZodOptional<z.ZodString>;
            supervisorSurname: z.ZodOptional<z.ZodString>;
            supervisorGivenName: z.ZodOptional<z.ZodString>;
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
            duties: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            phone?: string | undefined;
            country?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postalCode?: string | undefined;
            startDate?: string | undefined;
            employerName?: string | undefined;
            employerAddress?: string | undefined;
            jobTitle?: string | undefined;
            supervisorSurname?: string | undefined;
            supervisorGivenName?: string | undefined;
            endDate?: string | undefined;
            duties?: string | undefined;
        }, {
            phone?: string | undefined;
            country?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postalCode?: string | undefined;
            startDate?: string | undefined;
            employerName?: string | undefined;
            employerAddress?: string | undefined;
            jobTitle?: string | undefined;
            supervisorSurname?: string | undefined;
            supervisorGivenName?: string | undefined;
            endDate?: string | undefined;
            duties?: string | undefined;
        }>, "many">>;
        hasAttendedEducation: z.ZodOptional<z.ZodBoolean>;
        education: z.ZodOptional<z.ZodArray<z.ZodObject<{
            institutionName: z.ZodOptional<z.ZodString>;
            institutionAddress: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
            state: z.ZodOptional<z.ZodString>;
            postalCode: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
            courseOfStudy: z.ZodOptional<z.ZodString>;
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            country?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postalCode?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            institutionName?: string | undefined;
            institutionAddress?: string | undefined;
            courseOfStudy?: string | undefined;
        }, {
            country?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postalCode?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            institutionName?: string | undefined;
            institutionAddress?: string | undefined;
            courseOfStudy?: string | undefined;
        }>, "many">>;
        belongsToClanOrTribe: z.ZodOptional<z.ZodBoolean>;
        clanOrTribeName: z.ZodOptional<z.ZodString>;
        languages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        hasVisitedCountriesLastFiveYears: z.ZodOptional<z.ZodBoolean>;
        countriesVisited: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        belongsToProfessionalOrg: z.ZodOptional<z.ZodBoolean>;
        professionalOrgs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        hasSpecializedSkills: z.ZodOptional<z.ZodBoolean>;
        specializedSkillsDescription: z.ZodOptional<z.ZodString>;
        hasServedInMilitary: z.ZodOptional<z.ZodBoolean>;
        militaryService: z.ZodOptional<z.ZodObject<{
            country: z.ZodOptional<z.ZodString>;
            branch: z.ZodOptional<z.ZodString>;
            rank: z.ZodOptional<z.ZodString>;
            specialty: z.ZodOptional<z.ZodString>;
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            country?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            branch?: string | undefined;
            rank?: string | undefined;
            specialty?: string | undefined;
        }, {
            country?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            branch?: string | undefined;
            rank?: string | undefined;
            specialty?: string | undefined;
        }>>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    securityInfo?: z.objectOutputType<{
        hasCommunicableDisease: z.ZodOptional<z.ZodBoolean>;
        hasMentalOrPhysicalDisorder: z.ZodOptional<z.ZodBoolean>;
        isDrugAbuser: z.ZodOptional<z.ZodBoolean>;
        hasBeenArrested: z.ZodOptional<z.ZodBoolean>;
        arrestDetails: z.ZodOptional<z.ZodString>;
        hasViolatedControlledSubstancesLaw: z.ZodOptional<z.ZodBoolean>;
        isEngagedInProstitution: z.ZodOptional<z.ZodBoolean>;
        isInvolvedInMoneyLaundering: z.ZodOptional<z.ZodBoolean>;
        hasCommittedHumanTrafficking: z.ZodOptional<z.ZodBoolean>;
        hasBenefitedFromTrafficking: z.ZodOptional<z.ZodBoolean>;
        hasAidedHumanTrafficking: z.ZodOptional<z.ZodBoolean>;
        seeksEspionage: z.ZodOptional<z.ZodBoolean>;
        seeksToEngageInTerrorism: z.ZodOptional<z.ZodBoolean>;
        hasProvidedTerroristSupport: z.ZodOptional<z.ZodBoolean>;
        isTerroristOrganizationMember: z.ZodOptional<z.ZodBoolean>;
        isRelatedToTerrorist: z.ZodOptional<z.ZodBoolean>;
        hasParticipatedInGenocide: z.ZodOptional<z.ZodBoolean>;
        hasParticipatedInTorture: z.ZodOptional<z.ZodBoolean>;
        hasParticipatedInExtrajudicialKillings: z.ZodOptional<z.ZodBoolean>;
        hasRecruitedChildSoldiers: z.ZodOptional<z.ZodBoolean>;
        hasViolatedReligiousFreedom: z.ZodOptional<z.ZodBoolean>;
        hasEnforcedPopulationControls: z.ZodOptional<z.ZodBoolean>;
        hasInvolvedInOrganTrafficking: z.ZodOptional<z.ZodBoolean>;
        hasSoughtVisaByFraud: z.ZodOptional<z.ZodBoolean>;
        hasBeenRemovedOrDeported: z.ZodOptional<z.ZodBoolean>;
        hasWithheldCustodyOfUSCitizen: z.ZodOptional<z.ZodBoolean>;
        hasVotedInUSIllegally: z.ZodOptional<z.ZodBoolean>;
        hasRenouncedUSCitizenshipToAvoidTax: z.ZodOptional<z.ZodBoolean>;
        hasBeenInUS: z.ZodOptional<z.ZodBoolean>;
        usVisitDetails: z.ZodOptional<z.ZodString>;
        hasBeenIssuedUSVisa: z.ZodOptional<z.ZodBoolean>;
        lastVisaDetails: z.ZodOptional<z.ZodString>;
        hasBeenRefusedUSVisa: z.ZodOptional<z.ZodBoolean>;
        refusalDetails: z.ZodOptional<z.ZodString>;
        hasImmigrantPetitionFiled: z.ZodOptional<z.ZodBoolean>;
        petitionDetails: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    documents?: z.objectOutputType<{
        photo: z.ZodOptional<z.ZodObject<{
            fileName: z.ZodOptional<z.ZodString>;
            fileUrl: z.ZodOptional<z.ZodString>;
            fileSize: z.ZodOptional<z.ZodNumber>;
            uploadedAt: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
        }, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
        }>>;
        invitationLetter: z.ZodOptional<z.ZodObject<{
            fileName: z.ZodOptional<z.ZodString>;
            fileUrl: z.ZodOptional<z.ZodString>;
            fileSize: z.ZodOptional<z.ZodNumber>;
            uploadedAt: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
        }, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
        }>>;
        additionalDocuments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            fileName: z.ZodOptional<z.ZodString>;
            fileUrl: z.ZodOptional<z.ZodString>;
            fileSize: z.ZodOptional<z.ZodNumber>;
            uploadedAt: z.ZodOptional<z.ZodString>;
            documentType: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
            documentType?: string | undefined;
        }, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
            documentType?: string | undefined;
        }>, "many">>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
}, {
    currentStep?: number | undefined;
    personalInfo?: z.objectInputType<{
        surnames: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        givenNames: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        fullNameNative: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        otherNamesUsed: z.ZodOptional<z.ZodBoolean>;
        otherNames: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        telCode: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        sex: z.ZodOptional<z.ZodString>;
        maritalStatus: z.ZodOptional<z.ZodString>;
        dateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        cityOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        stateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        countryOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        nationality: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    contactInfo?: z.objectInputType<{
        homeAddress: z.ZodOptional<z.ZodAny>;
        mailingAddress: z.ZodOptional<z.ZodAny>;
        phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        secondaryPhone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        workPhone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    passportInfo?: z.objectInputType<{
        passportType: z.ZodOptional<z.ZodString>;
        passportNumber: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        passportBookNumber: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        countryOfIssuance: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        cityOfIssuance: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        stateOfIssuance: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        issuanceDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        expirationDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        hasOtherPassport: z.ZodOptional<z.ZodBoolean>;
        otherPassportInfo: z.ZodOptional<z.ZodAny>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    travelInfo?: z.objectInputType<{
        purposeOfTrip: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        specificPurpose: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        intendedArrivalDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        intendedLengthOfStay: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        addressWhileInUS: z.ZodOptional<z.ZodAny>;
        payingForTrip: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        travelingWithOthers: z.ZodOptional<z.ZodBoolean>;
        companions: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    familyInfo?: z.objectInputType<{
        fatherSurnames: z.ZodOptional<z.ZodString>;
        fatherGivenNames: z.ZodOptional<z.ZodString>;
        fatherDateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        isFatherInUS: z.ZodOptional<z.ZodBoolean>;
        fatherUSStatus: z.ZodOptional<z.ZodString>;
        motherSurnames: z.ZodOptional<z.ZodString>;
        motherGivenNames: z.ZodOptional<z.ZodString>;
        motherDateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        isMotherInUS: z.ZodOptional<z.ZodBoolean>;
        motherUSStatus: z.ZodOptional<z.ZodString>;
        hasSpouse: z.ZodOptional<z.ZodBoolean>;
        spouseFullName: z.ZodOptional<z.ZodString>;
        spouseDateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        spouseNationality: z.ZodOptional<z.ZodString>;
        spouseCityOfBirth: z.ZodOptional<z.ZodString>;
        spouseCountryOfBirth: z.ZodOptional<z.ZodString>;
        spouseAddress: z.ZodOptional<z.ZodString>;
        spouseAddressSameAsApplicant: z.ZodOptional<z.ZodBoolean>;
        hasChildren: z.ZodOptional<z.ZodBoolean>;
        children: z.ZodOptional<z.ZodArray<z.ZodObject<{
            fullName: z.ZodOptional<z.ZodString>;
            dateOfBirth: z.ZodOptional<z.ZodString>;
            relationship: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            dateOfBirth?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }, {
            dateOfBirth?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }>, "many">>;
        hasImmediateRelativesInUS: z.ZodOptional<z.ZodBoolean>;
        immediateRelativesInUS: z.ZodOptional<z.ZodArray<z.ZodObject<{
            fullName: z.ZodOptional<z.ZodString>;
            relationship: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }, {
            status?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }>, "many">>;
        hasOtherRelativesInUS: z.ZodOptional<z.ZodBoolean>;
        otherRelativesInUS: z.ZodOptional<z.ZodArray<z.ZodObject<{
            fullName: z.ZodOptional<z.ZodString>;
            relationship: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }, {
            status?: string | undefined;
            relationship?: string | undefined;
            fullName?: string | undefined;
        }>, "many">>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    workEducation?: z.objectInputType<{
        primaryOccupation: z.ZodOptional<z.ZodString>;
        presentEmployerName: z.ZodOptional<z.ZodString>;
        presentEmployerAddress: z.ZodOptional<z.ZodString>;
        presentEmployerCity: z.ZodOptional<z.ZodString>;
        presentEmployerState: z.ZodOptional<z.ZodString>;
        presentEmployerPostalCode: z.ZodOptional<z.ZodString>;
        presentEmployerCountry: z.ZodOptional<z.ZodString>;
        presentEmployerPhone: z.ZodOptional<z.ZodString>;
        monthlySalary: z.ZodOptional<z.ZodString>;
        jobDuties: z.ZodOptional<z.ZodString>;
        startDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        wasPreviouslyEmployed: z.ZodOptional<z.ZodBoolean>;
        previousEmployment: z.ZodOptional<z.ZodArray<z.ZodObject<{
            employerName: z.ZodOptional<z.ZodString>;
            employerAddress: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
            state: z.ZodOptional<z.ZodString>;
            postalCode: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
            phone: z.ZodOptional<z.ZodString>;
            jobTitle: z.ZodOptional<z.ZodString>;
            supervisorSurname: z.ZodOptional<z.ZodString>;
            supervisorGivenName: z.ZodOptional<z.ZodString>;
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
            duties: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            phone?: string | undefined;
            country?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postalCode?: string | undefined;
            startDate?: string | undefined;
            employerName?: string | undefined;
            employerAddress?: string | undefined;
            jobTitle?: string | undefined;
            supervisorSurname?: string | undefined;
            supervisorGivenName?: string | undefined;
            endDate?: string | undefined;
            duties?: string | undefined;
        }, {
            phone?: string | undefined;
            country?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postalCode?: string | undefined;
            startDate?: string | undefined;
            employerName?: string | undefined;
            employerAddress?: string | undefined;
            jobTitle?: string | undefined;
            supervisorSurname?: string | undefined;
            supervisorGivenName?: string | undefined;
            endDate?: string | undefined;
            duties?: string | undefined;
        }>, "many">>;
        hasAttendedEducation: z.ZodOptional<z.ZodBoolean>;
        education: z.ZodOptional<z.ZodArray<z.ZodObject<{
            institutionName: z.ZodOptional<z.ZodString>;
            institutionAddress: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
            state: z.ZodOptional<z.ZodString>;
            postalCode: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
            courseOfStudy: z.ZodOptional<z.ZodString>;
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            country?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postalCode?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            institutionName?: string | undefined;
            institutionAddress?: string | undefined;
            courseOfStudy?: string | undefined;
        }, {
            country?: string | undefined;
            city?: string | undefined;
            state?: string | undefined;
            postalCode?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            institutionName?: string | undefined;
            institutionAddress?: string | undefined;
            courseOfStudy?: string | undefined;
        }>, "many">>;
        belongsToClanOrTribe: z.ZodOptional<z.ZodBoolean>;
        clanOrTribeName: z.ZodOptional<z.ZodString>;
        languages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        hasVisitedCountriesLastFiveYears: z.ZodOptional<z.ZodBoolean>;
        countriesVisited: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        belongsToProfessionalOrg: z.ZodOptional<z.ZodBoolean>;
        professionalOrgs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        hasSpecializedSkills: z.ZodOptional<z.ZodBoolean>;
        specializedSkillsDescription: z.ZodOptional<z.ZodString>;
        hasServedInMilitary: z.ZodOptional<z.ZodBoolean>;
        militaryService: z.ZodOptional<z.ZodObject<{
            country: z.ZodOptional<z.ZodString>;
            branch: z.ZodOptional<z.ZodString>;
            rank: z.ZodOptional<z.ZodString>;
            specialty: z.ZodOptional<z.ZodString>;
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            country?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            branch?: string | undefined;
            rank?: string | undefined;
            specialty?: string | undefined;
        }, {
            country?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            branch?: string | undefined;
            rank?: string | undefined;
            specialty?: string | undefined;
        }>>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    securityInfo?: z.objectInputType<{
        hasCommunicableDisease: z.ZodOptional<z.ZodBoolean>;
        hasMentalOrPhysicalDisorder: z.ZodOptional<z.ZodBoolean>;
        isDrugAbuser: z.ZodOptional<z.ZodBoolean>;
        hasBeenArrested: z.ZodOptional<z.ZodBoolean>;
        arrestDetails: z.ZodOptional<z.ZodString>;
        hasViolatedControlledSubstancesLaw: z.ZodOptional<z.ZodBoolean>;
        isEngagedInProstitution: z.ZodOptional<z.ZodBoolean>;
        isInvolvedInMoneyLaundering: z.ZodOptional<z.ZodBoolean>;
        hasCommittedHumanTrafficking: z.ZodOptional<z.ZodBoolean>;
        hasBenefitedFromTrafficking: z.ZodOptional<z.ZodBoolean>;
        hasAidedHumanTrafficking: z.ZodOptional<z.ZodBoolean>;
        seeksEspionage: z.ZodOptional<z.ZodBoolean>;
        seeksToEngageInTerrorism: z.ZodOptional<z.ZodBoolean>;
        hasProvidedTerroristSupport: z.ZodOptional<z.ZodBoolean>;
        isTerroristOrganizationMember: z.ZodOptional<z.ZodBoolean>;
        isRelatedToTerrorist: z.ZodOptional<z.ZodBoolean>;
        hasParticipatedInGenocide: z.ZodOptional<z.ZodBoolean>;
        hasParticipatedInTorture: z.ZodOptional<z.ZodBoolean>;
        hasParticipatedInExtrajudicialKillings: z.ZodOptional<z.ZodBoolean>;
        hasRecruitedChildSoldiers: z.ZodOptional<z.ZodBoolean>;
        hasViolatedReligiousFreedom: z.ZodOptional<z.ZodBoolean>;
        hasEnforcedPopulationControls: z.ZodOptional<z.ZodBoolean>;
        hasInvolvedInOrganTrafficking: z.ZodOptional<z.ZodBoolean>;
        hasSoughtVisaByFraud: z.ZodOptional<z.ZodBoolean>;
        hasBeenRemovedOrDeported: z.ZodOptional<z.ZodBoolean>;
        hasWithheldCustodyOfUSCitizen: z.ZodOptional<z.ZodBoolean>;
        hasVotedInUSIllegally: z.ZodOptional<z.ZodBoolean>;
        hasRenouncedUSCitizenshipToAvoidTax: z.ZodOptional<z.ZodBoolean>;
        hasBeenInUS: z.ZodOptional<z.ZodBoolean>;
        usVisitDetails: z.ZodOptional<z.ZodString>;
        hasBeenIssuedUSVisa: z.ZodOptional<z.ZodBoolean>;
        lastVisaDetails: z.ZodOptional<z.ZodString>;
        hasBeenRefusedUSVisa: z.ZodOptional<z.ZodBoolean>;
        refusalDetails: z.ZodOptional<z.ZodString>;
        hasImmigrantPetitionFiled: z.ZodOptional<z.ZodBoolean>;
        petitionDetails: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    documents?: z.objectInputType<{
        photo: z.ZodOptional<z.ZodObject<{
            fileName: z.ZodOptional<z.ZodString>;
            fileUrl: z.ZodOptional<z.ZodString>;
            fileSize: z.ZodOptional<z.ZodNumber>;
            uploadedAt: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
        }, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
        }>>;
        invitationLetter: z.ZodOptional<z.ZodObject<{
            fileName: z.ZodOptional<z.ZodString>;
            fileUrl: z.ZodOptional<z.ZodString>;
            fileSize: z.ZodOptional<z.ZodNumber>;
            uploadedAt: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
        }, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
        }>>;
        additionalDocuments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            fileName: z.ZodOptional<z.ZodString>;
            fileUrl: z.ZodOptional<z.ZodString>;
            fileSize: z.ZodOptional<z.ZodNumber>;
            uploadedAt: z.ZodOptional<z.ZodString>;
            documentType: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
            documentType?: string | undefined;
        }, {
            fileName?: string | undefined;
            fileUrl?: string | undefined;
            fileSize?: number | undefined;
            uploadedAt?: string | undefined;
            documentType?: string | undefined;
        }>, "many">>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
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