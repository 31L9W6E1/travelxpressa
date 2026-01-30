"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.hash = hash;
exports.generateToken = generateToken;
exports.generatePassword = generatePassword;
exports.secureCompare = secureCompare;
const crypto_1 = __importDefault(require("crypto"));
const config_1 = require("../config");
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;
function getEncryptionKey() {
    const key = config_1.config.encryptionKey;
    if (!key || key.length < 32) {
        if (config_1.config.isProduction) {
            throw new Error('ENCRYPTION_KEY must be at least 32 characters in production');
        }
        // Use a derived key for development
        return crypto_1.default.scryptSync('dev-encryption-key', 'salt', 32);
    }
    return Buffer.from(key, 'hex').length === 32
        ? Buffer.from(key, 'hex')
        : crypto_1.default.scryptSync(key, 'salt', 32);
}
/**
 * Encrypts sensitive data using AES-256-GCM
 */
function encrypt(text) {
    if (!text)
        return text;
    const key = getEncryptionKey();
    const iv = crypto_1.default.randomBytes(IV_LENGTH);
    const cipher = crypto_1.default.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    // Return iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}
/**
 * Decrypts data encrypted with encrypt()
 */
function decrypt(encryptedText) {
    if (!encryptedText || !encryptedText.includes(':'))
        return encryptedText;
    const key = getEncryptionKey();
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
    if (!ivHex || !authTagHex || !encrypted) {
        throw new Error('Invalid encrypted data format');
    }
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto_1.default.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
/**
 * Hashes data with SHA-256 (for non-reversible hashing)
 */
function hash(text) {
    return crypto_1.default.createHash('sha256').update(text).digest('hex');
}
/**
 * Generates a secure random token
 */
function generateToken(length = 32) {
    return crypto_1.default.randomBytes(length).toString('hex');
}
/**
 * Generates a secure random password
 */
function generatePassword(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const randomBytes = crypto_1.default.randomBytes(length);
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars[randomBytes[i] % chars.length];
    }
    return password;
}
/**
 * Constant-time string comparison to prevent timing attacks
 */
function secureCompare(a, b) {
    if (a.length !== b.length)
        return false;
    return crypto_1.default.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
//# sourceMappingURL=encryption.js.map