/**
 * Encrypts sensitive data using AES-256-GCM
 */
export declare function encrypt(text: string): string;
/**
 * Decrypts data encrypted with encrypt()
 */
export declare function decrypt(encryptedText: string): string;
/**
 * Hashes data with SHA-256 (for non-reversible hashing)
 */
export declare function hash(text: string): string;
/**
 * Generates a secure random token
 */
export declare function generateToken(length?: number): string;
/**
 * Generates a secure random password
 */
export declare function generatePassword(length?: number): string;
/**
 * Constant-time string comparison to prevent timing attacks
 */
export declare function secureCompare(a: string, b: string): boolean;
//# sourceMappingURL=encryption.d.ts.map