import { describe, it, expect, beforeAll } from '@jest/globals';

// Set environment variables before importing
process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

import { encrypt, decrypt, hash, generateToken, secureCompare } from '../../src/utils/encryption';

describe('Encryption Utils', () => {
  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt a string correctly', () => {
      const originalText = 'Hello, World!';
      const encrypted = encrypt(originalText);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(originalText);
    });

    it('should produce different ciphertext for the same plaintext', () => {
      const originalText = 'Hello, World!';
      const encrypted1 = encrypt(originalText);
      const encrypted2 = encrypt(originalText);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should handle empty string', () => {
      const originalText = '';
      const encrypted = encrypt(originalText);

      expect(encrypted).toBe('');
    });

    it('should handle special characters', () => {
      const originalText = 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
      const encrypted = encrypt(originalText);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(originalText);
    });

    it('should handle unicode characters', () => {
      const originalText = 'Unicode: \u4e2d\u6587 \u65e5\u672c\u8a9e \ud83d\ude00';
      const encrypted = encrypt(originalText);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(originalText);
    });

    it('should handle long strings', () => {
      const originalText = 'A'.repeat(10000);
      const encrypted = encrypt(originalText);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(originalText);
    });

    it('should handle JSON data', () => {
      const data = { name: 'John', age: 30, nested: { key: 'value' } };
      const originalText = JSON.stringify(data);
      const encrypted = encrypt(originalText);
      const decrypted = decrypt(encrypted);

      expect(JSON.parse(decrypted)).toEqual(data);
    });
  });

  describe('hash', () => {
    it('should produce consistent hash for same input', () => {
      const text = 'password123';
      const hash1 = hash(text);
      const hash2 = hash(text);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', () => {
      const hash1 = hash('password1');
      const hash2 = hash('password2');

      expect(hash1).not.toBe(hash2);
    });

    it('should produce 64 character hex string (SHA-256)', () => {
      const result = hash('test');
      expect(result).toHaveLength(64);
      expect(result).toMatch(/^[a-f0-9]+$/);
    });
  });

  describe('generateToken', () => {
    it('should generate token of default length (32 bytes = 64 hex chars)', () => {
      const token = generateToken();
      expect(token).toHaveLength(64);
      expect(token).toMatch(/^[a-f0-9]+$/);
    });

    it('should generate token of specified length', () => {
      const token = generateToken(16);
      expect(token).toHaveLength(32); // 16 bytes = 32 hex chars
    });

    it('should generate unique tokens', () => {
      const tokens = new Set();
      for (let i = 0; i < 100; i++) {
        tokens.add(generateToken());
      }
      expect(tokens.size).toBe(100);
    });
  });

  describe('secureCompare', () => {
    it('should return true for identical strings', () => {
      const str = 'test-string';
      expect(secureCompare(str, str)).toBe(true);
    });

    it('should return false for different strings', () => {
      expect(secureCompare('string1', 'string2')).toBe(false);
    });

    it('should return false for strings of different lengths', () => {
      expect(secureCompare('short', 'longer-string')).toBe(false);
    });

    it('should return true for empty strings', () => {
      expect(secureCompare('', '')).toBe(true);
    });
  });
});
