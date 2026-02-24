import { Request } from 'express';

// User roles enum
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
}

// Inquiry status enum
export enum InquiryStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

// Service types enum
export enum ServiceType {
  VISA_APPLICATION = 'VISA_APPLICATION',
  TOURISM_PACKAGE = 'TOURISM_PACKAGE',
  CONSULTATION = 'CONSULTATION',
  DOCUMENT_REVIEW = 'DOCUMENT_REVIEW',
  TRANSLATION_SERVICE = 'TRANSLATION_SERVICE',
}

// Visa types enum
export enum VisaType {
  B1_B2 = 'B1_B2',
  F1 = 'F1',
  J1 = 'J1',
  H1B = 'H1B',
  L1 = 'L1',
  O1 = 'O1',
  OTHER = 'OTHER',
}

// Application status enum
export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Extended Express Request with user
export interface AuthenticatedRequest extends Request {
  user: JWTPayload;
}

// API Response types
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

// Pagination params
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// User types
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

// Auth types
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

// Inquiry types
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

// DS-160 Application types
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
  // Additional sections would be added here
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
}

// Payment types
export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum PaymentProvider {
  QPAY = 'QPAY',
  DIGIPAY = 'DIGIPAY',
  KHAN_BANK = 'KHAN_BANK',
  MONPAY = 'MONPAY',
  SOCIALPAY = 'SOCIALPAY',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CARD = 'CARD',
  PAYPAL = 'PAYPAL',
  WECHAT_PAY = 'WECHAT_PAY',
  ZHIFUBAO = 'ZHIFUBAO',
}

export enum PaymentServiceType {
  VISA_APPLICATION = 'VISA_APPLICATION',
  CONSULTATION = 'CONSULTATION',
  DOCUMENT_REVIEW = 'DOCUMENT_REVIEW',
  RUSH_PROCESSING = 'RUSH_PROCESSING',
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
  byServiceType: Record<string, { count: number; revenue: number }>;
  byProvider: Record<string, { count: number; revenue: number }>;
}

export interface PaymentListParams extends PaginationParams {
  status?: PaymentStatus;
  provider?: PaymentProvider;
  serviceType?: PaymentServiceType;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}
