import { Request } from 'express';
export declare enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN",
    AGENT = "AGENT"
}
export declare enum InquiryStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    COMPLETED = "COMPLETED"
}
export declare enum ServiceType {
    VISA_APPLICATION = "VISA_APPLICATION",
    TOURISM_PACKAGE = "TOURISM_PACKAGE",
    CONSULTATION = "CONSULTATION",
    DOCUMENT_REVIEW = "DOCUMENT_REVIEW"
}
export declare enum VisaType {
    B1_B2 = "B1_B2",
    F1 = "F1",
    J1 = "J1",
    H1B = "H1B",
    L1 = "L1",
    O1 = "O1",
    OTHER = "OTHER"
}
export declare enum ApplicationStatus {
    DRAFT = "DRAFT",
    IN_PROGRESS = "IN_PROGRESS",
    PAYMENT_PENDING = "PAYMENT_PENDING",
    SUBMITTED = "SUBMITTED",
    UNDER_REVIEW = "UNDER_REVIEW",
    COMPLETED = "COMPLETED",
    REJECTED = "REJECTED"
}
export interface JWTPayload {
    userId: string;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}
export interface AuthenticatedRequest extends Request {
    user: JWTPayload;
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    errors?: ValidationError[];
}
export interface ValidationError {
    field: string;
    message: string;
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface CreateUserDTO {
    email: string;
    password: string;
    name?: string;
}
export interface UpdateUserDTO {
    name?: string;
    role?: UserRole;
}
export interface UserResponse {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt: Date;
}
export interface LoginDTO {
    email: string;
    password: string;
}
export interface AuthResponse {
    user: UserResponse;
    accessToken: string;
    refreshToken: string;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
export interface CreateInquiryDTO {
    name: string;
    email: string;
    phone: string;
    message: string;
    serviceType: ServiceType;
}
export interface UpdateInquiryDTO {
    status?: InquiryStatus;
    adminNotes?: string;
}
export interface DS160PersonalInfo {
    surnames: string;
    givenNames: string;
    fullNameNative?: string;
    otherNamesUsed: boolean;
    otherNames?: string[];
    telCode: string;
    sex: 'M' | 'F';
    maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED';
    dateOfBirth: string;
    cityOfBirth: string;
    stateOfBirth?: string;
    countryOfBirth: string;
    nationality: string;
}
export interface DS160TravelInfo {
    purposeOfTrip: string;
    specificPurpose?: string;
    intendedArrivalDate: string;
    intendedLengthOfStay: string;
    addressWhileInUS: {
        street: string;
        city: string;
        state: string;
        zipCode?: string;
    };
    payingForTrip: string;
    travelingWithOthers: boolean;
    companions?: Array<{
        name: string;
        relationship: string;
    }>;
}
export interface DS160ContactInfo {
    homeAddress: {
        street: string;
        city: string;
        state?: string;
        postalCode?: string;
        country: string;
    };
    mailingAddress?: {
        street: string;
        city: string;
        state?: string;
        postalCode?: string;
        country: string;
    };
    phone: string;
    secondaryPhone?: string;
    workPhone?: string;
    email: string;
}
export interface DS160PassportInfo {
    passportType: 'REGULAR' | 'OFFICIAL' | 'DIPLOMATIC' | 'OTHER';
    passportNumber: string;
    passportBookNumber?: string;
    countryOfIssuance: string;
    cityOfIssuance: string;
    stateOfIssuance?: string;
    issuanceDate: string;
    expirationDate: string;
    hasOtherPassport: boolean;
    otherPassportInfo?: {
        number: string;
        country: string;
    };
}
export interface DS160Application {
    id: string;
    userId: string;
    visaType: VisaType;
    status: ApplicationStatus;
    currentStep: number;
    personalInfo?: DS160PersonalInfo;
    travelInfo?: DS160TravelInfo;
    contactInfo?: DS160ContactInfo;
    passportInfo?: DS160PassportInfo;
    createdAt: Date;
    updatedAt: Date;
    submittedAt?: Date;
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    PAID = "PAID",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED",
    PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED"
}
export declare enum PaymentProvider {
    QPAY = "QPAY",
    KHAN_BANK = "KHAN_BANK",
    MONPAY = "MONPAY",
    SOCIALPAY = "SOCIALPAY",
    BANK_TRANSFER = "BANK_TRANSFER"
}
export declare enum PaymentServiceType {
    VISA_APPLICATION = "VISA_APPLICATION",
    CONSULTATION = "CONSULTATION",
    DOCUMENT_REVIEW = "DOCUMENT_REVIEW",
    RUSH_PROCESSING = "RUSH_PROCESSING"
}
export interface CreatePaymentDTO {
    userId: string;
    serviceType: PaymentServiceType;
    amount: number;
    currency?: string;
    description?: string;
    applicationId?: string;
    metadata?: Record<string, unknown>;
}
export interface PaymentResponse {
    id: string;
    invoiceNo: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    provider: PaymentProvider;
    serviceType: PaymentServiceType;
    description?: string;
    qrCode?: string;
    qrImage?: string;
    deepLinks?: Array<{
        name: string;
        logo: string;
        link: string;
    }>;
    expiresAt?: Date;
    createdAt: Date;
}
export interface PaymentCallbackData {
    invoiceId: string;
    paymentId?: string;
    paymentStatus?: string;
    paymentAmount?: number;
    paymentDate?: string;
}
export interface PaymentSummary {
    totalRevenue: number;
    totalTransactions: number;
    successfulPayments: number;
    failedPayments: number;
    pendingPayments: number;
    refundedAmount: number;
    byServiceType: Record<string, {
        count: number;
        revenue: number;
    }>;
    byProvider: Record<string, {
        count: number;
        revenue: number;
    }>;
}
export interface PaymentListParams extends PaginationParams {
    status?: PaymentStatus;
    provider?: PaymentProvider;
    serviceType?: PaymentServiceType;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
}
//# sourceMappingURL=index.d.ts.map