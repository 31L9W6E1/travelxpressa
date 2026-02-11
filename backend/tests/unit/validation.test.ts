import { describe, it, expect } from '@jest/globals';
import {
  registerSchema,
  loginSchema,
  createInquirySchema,
  personalInfoSchema,
  passportInfoSchema,
} from '../../src/validation/schemas';

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate a valid registration', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Password123!',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject weak password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'weak',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require at least one uppercase letter in password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123!',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require at least one special character in password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login credentials', () => {
      const validData = {
        email: 'test@example.com',
        password: 'anypassword',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('createInquirySchema', () => {
    it('should validate a valid inquiry', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        message: 'This is a valid inquiry message.',
        serviceType: 'VISA_APPLICATION',
      };

      const result = createInquirySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid phone number', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: 'invalid',
        message: 'This is a valid inquiry message.',
        serviceType: 'VISA_APPLICATION',
      };

      const result = createInquirySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject message that is too short', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        message: 'Short',
        serviceType: 'VISA_APPLICATION',
      };

      const result = createInquirySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid service type', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        message: 'This is a valid inquiry message.',
        serviceType: 'INVALID_TYPE',
      };

      const result = createInquirySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('personalInfoSchema', () => {
    it('should validate valid personal info', () => {
      const validData = {
        surnames: 'DOE',
        givenNames: 'JOHN',
        otherNamesUsed: false,
        telCode: '1',
        sex: 'M',
        maritalStatus: 'SINGLE',
        dateOfBirth: '1990-01-15',
        cityOfBirth: 'New York',
        countryOfBirth: 'USA',
        nationality: 'USA',
      };

      const result = personalInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date format', () => {
      const invalidData = {
        surnames: 'DOE',
        givenNames: 'JOHN',
        otherNamesUsed: false,
        telCode: '1',
        sex: 'M',
        maritalStatus: 'SINGLE',
        dateOfBirth: '01/15/1990', // Wrong format
        cityOfBirth: 'New York',
        countryOfBirth: 'USA',
        nationality: 'USA',
      };

      const result = personalInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid sex value', () => {
      const invalidData = {
        surnames: 'DOE',
        givenNames: 'JOHN',
        otherNamesUsed: false,
        telCode: '1',
        sex: 'X', // Invalid
        maritalStatus: 'SINGLE',
        dateOfBirth: '1990-01-15',
        cityOfBirth: 'New York',
        countryOfBirth: 'USA',
        nationality: 'USA',
      };

      const result = personalInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('passportInfoSchema', () => {
    it('should validate valid passport info', () => {
      const validData = {
        passportType: 'REGULAR',
        passportNumber: 'E12345678',
        countryOfIssuance: 'Mongolia',
        cityOfIssuance: 'Ulaanbaatar',
        issuanceDate: '2020-01-15',
        expirationDate: '2030-01-14',
        hasOtherPassport: false,
      };

      const result = passportInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid passport number format', () => {
      const invalidData = {
        passportType: 'REGULAR',
        passportNumber: '', // Empty is invalid
        countryOfIssuance: 'Mongolia',
        cityOfIssuance: 'Ulaanbaatar',
        issuanceDate: '2020-01-15',
        expirationDate: '2030-01-14',
        hasOtherPassport: false,
      };

      const result = passportInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject too short passport number', () => {
      const invalidData = {
        passportType: 'REGULAR',
        passportNumber: 'A'.repeat(21), // Too long
        countryOfIssuance: 'Mongolia',
        cityOfIssuance: 'Ulaanbaatar',
        issuanceDate: '2020-01-15',
        expirationDate: '2030-01-14',
        hasOtherPassport: false,
      };

      const result = passportInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
