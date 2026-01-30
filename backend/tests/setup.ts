import { PrismaClient } from '@prisma/client';

// Mock Prisma client for unit tests
jest.mock('../src/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    inquiry: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    application: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    refreshToken: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    auditLog: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((args) => Promise.all(args)),
    $queryRaw: jest.fn(),
    $disconnect: jest.fn(),
  },
}));

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-for-testing-only';
process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

// Global test utilities
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  password: '$2a$12$hashedpassword',
  name: 'Test User',
  role: 'USER',
  emailVerified: false,
  phone: null,
  country: null,
  lastLoginAt: null,
  lastLoginIp: null,
  failedLogins: 0,
  lockedUntil: null,
  twoFactorEnabled: false,
  twoFactorSecret: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockApplication = (overrides = {}) => ({
  id: 'test-app-id',
  userId: 'test-user-id',
  visaType: 'B1_B2',
  status: 'DRAFT',
  currentStep: 1,
  personalInfo: null,
  contactInfo: null,
  passportInfo: null,
  travelInfo: null,
  familyInfo: null,
  workEducation: null,
  securityInfo: null,
  photoUrl: null,
  confirmationNumber: null,
  adminNotes: null,
  reviewedBy: null,
  reviewedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  submittedAt: null,
  ...overrides,
});

export const createMockInquiry = (overrides = {}) => ({
  id: 'test-inquiry-id',
  userId: null,
  name: 'Test User',
  email: 'test@example.com',
  phone: '+1234567890',
  message: 'Test inquiry message',
  serviceType: 'VISA_APPLICATION',
  status: 'PENDING',
  adminNotes: null,
  assignedTo: null,
  resolvedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Clean up after all tests
afterAll(async () => {
  jest.clearAllMocks();
});
