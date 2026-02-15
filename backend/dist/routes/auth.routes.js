"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const schemas_1 = require("../validation/schemas");
const types_1 = require("../types");
const logger_1 = require("../utils/logger");
const config_1 = require("../config");
const encryption_1 = require("../utils/encryption");
const email_service_1 = require("../services/email.service");
const router = (0, express_1.Router)();
// OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '';
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';
const BCRYPT_ROUNDS = 12;
const MAX_FAILED_LOGINS = 100; // Increased for development
const LOCKOUT_DURATION_MS = 1 * 60 * 1000; // 1 minute in development
const PASSWORD_RESET_EXPIRES_IN = '30m';
const PASSWORD_RESET_EXPIRES_MINUTES = 30;
const PASSWORD_RESET_PURPOSE = 'PASSWORD_RESET';
function getPasswordResetSecret(passwordHash) {
    return `${config_1.config.jwt.secret}:${passwordHash}`;
}
function generatePasswordResetToken(userId, passwordHash) {
    const payload = {
        userId,
        purpose: PASSWORD_RESET_PURPOSE,
    };
    return jsonwebtoken_1.default.sign(payload, getPasswordResetSecret(passwordHash), {
        expiresIn: PASSWORD_RESET_EXPIRES_IN,
    });
}
function toOrigin(url) {
    try {
        return new URL(url).origin;
    }
    catch {
        return null;
    }
}
function getAllowedFrontendOrigins() {
    const origins = new Set();
    if (process.env.FRONTEND_URL) {
        const frontendOrigin = toOrigin(process.env.FRONTEND_URL);
        if (frontendOrigin)
            origins.add(frontendOrigin);
    }
    config_1.config.corsOrigin
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
        .forEach((value) => {
        const corsOrigin = toOrigin(value);
        if (corsOrigin)
            origins.add(corsOrigin);
    });
    return origins;
}
function getFrontendBaseUrl(req) {
    const allowedOrigins = getAllowedFrontendOrigins();
    const origin = req.get('origin');
    if (origin) {
        const normalizedOrigin = origin.replace(/\/+$/, '');
        if (allowedOrigins.has(normalizedOrigin)) {
            return normalizedOrigin;
        }
    }
    const referer = req.get('referer');
    if (referer) {
        try {
            const refererOrigin = new URL(referer).origin;
            if (allowedOrigins.has(refererOrigin)) {
                return refererOrigin;
            }
        }
        catch {
            // Ignore malformed referer and continue to fallback.
        }
    }
    if (process.env.FRONTEND_URL) {
        return process.env.FRONTEND_URL.replace(/\/+$/, '');
    }
    const firstCorsOrigin = config_1.config.corsOrigin
        .split(',')
        .map((value) => value.trim())
        .find(Boolean);
    if (firstCorsOrigin) {
        return firstCorsOrigin.replace(/\/+$/, '');
    }
    return 'http://localhost:5173';
}
function encodeOAuthState(frontendBaseUrl) {
    return Buffer.from(JSON.stringify({
        nonce: crypto_1.default.randomBytes(16).toString('hex'),
        frontendBaseUrl,
    })).toString('base64url');
}
function getFrontendBaseUrlFromState(state, req) {
    const stateValue = Array.isArray(state) ? state[0] : state;
    if (typeof stateValue === 'string' && stateValue.length > 0) {
        try {
            const decoded = JSON.parse(Buffer.from(stateValue, 'base64url').toString('utf8'));
            if (decoded.frontendBaseUrl) {
                const redirectOrigin = toOrigin(decoded.frontendBaseUrl);
                if (redirectOrigin && getAllowedFrontendOrigins().has(redirectOrigin)) {
                    return redirectOrigin;
                }
            }
        }
        catch {
            // Ignore state parsing errors and use fallback.
        }
    }
    return getFrontendBaseUrl(req);
}
function getBackendBaseUrl(req) {
    if (process.env.BACKEND_URL) {
        return process.env.BACKEND_URL.replace(/\/+$/, '');
    }
    const forwardedProto = req.get('x-forwarded-proto')?.split(',')[0]?.trim();
    const forwardedHost = req.get('x-forwarded-host')?.split(',')[0]?.trim();
    if (forwardedProto && forwardedHost) {
        return `${forwardedProto}://${forwardedHost}`;
    }
    return `${req.protocol}://${req.get('host')}`;
}
function sendBrowserRedirect(res, redirectUrl) {
    // Some reverse proxies can behave inconsistently with Set-Cookie on 302 responses.
    // Returning a 200 HTML redirect page ensures the refresh cookie is reliably set.
    const safeUrl = String(redirectUrl || '').trim();
    res.status(200);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Redirecting...</title>
    <meta http-equiv="refresh" content="0; url=${safeUrl}" />
    <style>html,body{height:100%;margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#fff;color:#111}main{display:flex;align-items:center;justify-content:center;height:100%}p{margin:0 16px;text-align:center}</style>
  </head>
  <body>
    <main>
      <p>Redirecting… If you are not redirected, <a href="${safeUrl}">click here</a>.</p>
    </main>
    <script>
      try { window.location.replace(${JSON.stringify(safeUrl)}); } catch (e) {}
    </script>
  </body>
</html>`);
}
function getCookieDomain() {
    const explicitDomain = (process.env.COOKIE_DOMAIN || '').trim();
    if (explicitDomain) {
        const normalized = explicitDomain.replace(/^\./, '').toLowerCase();
        if (!normalized || normalized === 'localhost' || normalized === '127.0.0.1') {
            return undefined;
        }
        return `.${normalized}`;
    }
    const candidateUrls = [
        process.env.FRONTEND_URL,
        process.env.BACKEND_URL,
        ...config_1.config.corsOrigin
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
    ].filter(Boolean);
    for (const value of candidateUrls) {
        try {
            const hostname = new URL(value).hostname.toLowerCase();
            if (hostname.endsWith('travelxpressa.com')) {
                return '.travelxpressa.com';
            }
            if (hostname.endsWith('visamn.com')) {
                return '.visamn.com';
            }
        }
        catch {
            // Ignore malformed URL and continue.
        }
    }
    return undefined;
}
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
function hashRefreshToken(token) {
    return (0, encryption_1.hash)(token);
}
function refreshTokenLookupCandidates(token) {
    const hashedToken = hashRefreshToken(token);
    return hashedToken === token ? [token] : [hashedToken, token];
}
function getRefreshTokenCandidates(req) {
    const candidates = [];
    const pushCandidate = (value) => {
        if (typeof value !== 'string')
            return;
        const token = value.trim();
        if (!token)
            return;
        if (!candidates.includes(token)) {
            candidates.push(token);
        }
    };
    // Parse raw cookie header to capture duplicate refreshToken entries.
    const cookieHeader = req.headers.cookie;
    if (typeof cookieHeader === 'string' && cookieHeader.length > 0) {
        cookieHeader.split(';').forEach((segment) => {
            const trimmed = segment.trim();
            if (!trimmed.startsWith('refreshToken='))
                return;
            const rawValue = trimmed.slice('refreshToken='.length);
            try {
                pushCandidate(decodeURIComponent(rawValue));
            }
            catch {
                pushCandidate(rawValue);
            }
        });
    }
    pushCandidate(req.cookies?.refreshToken);
    pushCandidate(req.body?.refreshToken);
    return candidates;
}
function setRefreshTokenCookie(res, token) {
    const cookieDomain = getCookieDomain();
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: config_1.config.isProduction,
        sameSite: 'lax',
        ...(cookieDomain ? { domain: cookieDomain } : {}),
        maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    });
}
function clearRefreshTokenCookie(res) {
    const cookieDomain = getCookieDomain();
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: config_1.config.isProduction,
        sameSite: 'lax',
        ...(cookieDomain ? { domain: cookieDomain } : {}),
    });
}
/**
 * Register a new user
 */
router.post('/register', (0, validate_1.validate)({ body: schemas_1.registerSchema }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password, name } = req.body;
    // Check if user exists
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });
    if (existingUser) {
        throw new errorHandler_1.ConflictError('An account with this email already exists');
    }
    // Hash password with strong cost factor
    const hashedPassword = await bcryptjs_1.default.hash(password, BCRYPT_ROUNDS);
    // Create user
    const user = await prisma_1.prisma.user.create({
        data: {
            email: email.toLowerCase(),
            password: hashedPassword,
            name: name || email.split('@')[0],
            role: types_1.UserRole.USER,
        },
    });
    // Generate tokens
    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = (0, auth_1.generateAccessToken)(tokenPayload);
    const refreshToken = (0, auth_1.generateRefreshToken)(tokenPayload);
    // Store refresh token
    const refreshTokenExpiry = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);
    await prisma_1.prisma.refreshToken.create({
        data: {
            token: hashRefreshToken(refreshToken),
            userId: user.id,
            expiresAt: refreshTokenExpiry,
        },
    });
    logger_1.logger.info('User registered', { userId: user.id, email: user.email });
    setRefreshTokenCookie(res, refreshToken);
    res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            accessToken,
            refreshToken: config_1.config.isProduction ? undefined : refreshToken,
        },
    });
}));
/**
 * Request password reset link
 */
router.post('/forgot-password', (0, validate_1.validate)({ body: schemas_1.forgotPasswordSchema }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase();
    const genericMessage = 'If an account exists for this email, a password reset link has been sent';
    const user = await prisma_1.prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: {
            id: true,
            email: true,
            name: true,
            password: true,
        },
    });
    if (!user) {
        logger_1.logger.info('Password reset requested for non-existent account', {
            email: normalizedEmail,
        });
        return res.json({
            success: true,
            message: genericMessage,
        });
    }
    const token = generatePasswordResetToken(user.id, user.password);
    const frontendBaseUrl = getFrontendBaseUrl(req);
    const resetLink = `${frontendBaseUrl}/reset-password?token=${encodeURIComponent(token)}`;
    const sent = await email_service_1.emailService.sendPasswordReset(user.email, {
        userName: user.name || 'there',
        resetLink,
        expiresInMinutes: PASSWORD_RESET_EXPIRES_MINUTES,
    });
    if (!sent) {
        logger_1.logger.warn('Password reset email could not be sent', {
            userId: user.id,
            email: user.email,
        });
    }
    logger_1.logger.info('Password reset link generated', {
        userId: user.id,
        email: user.email,
    });
    return res.json({
        success: true,
        message: genericMessage,
    });
}));
/**
 * Reset password using email token
 */
router.post('/reset-password', (0, validate_1.validate)({ body: schemas_1.resetPasswordSchema }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { token, newPassword } = req.body;
    const decoded = jsonwebtoken_1.default.decode(token);
    if (!decoded || typeof decoded !== 'object') {
        throw new errorHandler_1.BadRequestError('Invalid or expired reset token');
    }
    const tokenPayload = decoded;
    if (typeof tokenPayload.userId !== 'string' ||
        tokenPayload.purpose !== PASSWORD_RESET_PURPOSE) {
        throw new errorHandler_1.BadRequestError('Invalid or expired reset token');
    }
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: tokenPayload.userId },
        select: {
            id: true,
            email: true,
            password: true,
        },
    });
    if (!user) {
        throw new errorHandler_1.BadRequestError('Invalid or expired reset token');
    }
    try {
        jsonwebtoken_1.default.verify(token, getPasswordResetSecret(user.password));
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError || error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new errorHandler_1.BadRequestError('Invalid or expired reset token');
        }
        throw error;
    }
    const isSamePassword = await bcryptjs_1.default.compare(newPassword, user.password);
    if (isSamePassword) {
        throw new errorHandler_1.BadRequestError('New password must be different from current password');
    }
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, BCRYPT_ROUNDS);
    const now = new Date();
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                failedLogins: 0,
                lockedUntil: null,
            },
        }),
        prisma_1.prisma.refreshToken.updateMany({
            where: {
                userId: user.id,
                revokedAt: null,
            },
            data: { revokedAt: now },
        }),
    ]);
    clearRefreshTokenCookie(res);
    logger_1.logger.info('Password reset completed', { userId: user.id });
    res.json({
        success: true,
        message: 'Password has been reset successfully',
    });
}));
/**
 * Login user
 */
router.post('/login', (0, validate_1.validate)({ body: schemas_1.loginSchema }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const clientIp = req.ip || req.socket.remoteAddress;
    // Find user
    const user = await prisma_1.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });
    if (!user) {
        // Use constant-time comparison even for non-existent users
        await bcryptjs_1.default.compare(password, '$2a$12$invalid.hash.to.prevent.timing.attacks');
        throw new errorHandler_1.UnauthorizedError('Invalid email or password');
    }
    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
        const remainingMs = user.lockedUntil.getTime() - Date.now();
        const remainingMins = Math.ceil(remainingMs / 60000);
        logger_1.logger.security('Login attempt on locked account', { email, ip: clientIp });
        throw new errorHandler_1.UnauthorizedError(`Account is locked. Try again in ${remainingMins} minutes`);
    }
    // Verify password
    const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        // Increment failed login count
        const failedLogins = user.failedLogins + 1;
        const updateData = { failedLogins };
        // Lock account if too many failed attempts
        if (failedLogins >= MAX_FAILED_LOGINS) {
            updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
            logger_1.logger.security('Account locked due to failed logins', { email, failedLogins });
        }
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: updateData,
        });
        throw new errorHandler_1.UnauthorizedError('Invalid email or password');
    }
    // Reset failed login count and update last login
    await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: {
            failedLogins: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
            lastLoginIp: clientIp,
        },
    });
    // Generate tokens
    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = (0, auth_1.generateAccessToken)(tokenPayload);
    const refreshToken = (0, auth_1.generateRefreshToken)(tokenPayload);
    // Store refresh token
    const refreshTokenExpiry = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);
    await prisma_1.prisma.refreshToken.create({
        data: {
            token: hashRefreshToken(refreshToken),
            userId: user.id,
            expiresAt: refreshTokenExpiry,
        },
    });
    logger_1.logger.info('User logged in', { userId: user.id, email: user.email, ip: clientIp });
    setRefreshTokenCookie(res, refreshToken);
    res.json({
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            accessToken,
            refreshToken: config_1.config.isProduction ? undefined : refreshToken,
        },
    });
}));
/**
 * Refresh access token
 */
router.post('/refresh', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const refreshTokenCandidates = getRefreshTokenCandidates(req);
    if (refreshTokenCandidates.length === 0) {
        throw new errorHandler_1.UnauthorizedError('Refresh token required');
    }
    let matchedRefreshToken = null;
    let storedToken = null;
    let decodedUserIdForSecurity = null;
    let sawRevokedToken = false;
    const now = new Date();
    for (const candidate of refreshTokenCandidates) {
        let decoded;
        try {
            decoded = (0, auth_1.verifyRefreshToken)(candidate);
        }
        catch {
            continue;
        }
        decodedUserIdForSecurity = decoded.userId;
        const tokenRow = await prisma_1.prisma.refreshToken.findFirst({
            where: {
                token: {
                    in: refreshTokenLookupCandidates(candidate),
                },
            },
            include: { user: true },
        });
        if (!tokenRow) {
            continue;
        }
        if (tokenRow.revokedAt) {
            sawRevokedToken = true;
            logger_1.logger.security('Revoked refresh token candidate ignored', {
                userId: decoded.userId,
                tokenId: tokenRow.id,
                candidateCount: refreshTokenCandidates.length,
            });
            continue;
        }
        if (tokenRow.expiresAt < now) {
            continue;
        }
        matchedRefreshToken = candidate;
        storedToken = tokenRow;
        break;
    }
    if (!matchedRefreshToken || !storedToken) {
        // Maintain strict token reuse protection for single-token requests.
        if (refreshTokenCandidates.length === 1 && decodedUserIdForSecurity) {
            if (sawRevokedToken) {
                logger_1.logger.security('Revoked refresh token used', {
                    userId: decodedUserIdForSecurity,
                });
            }
            else {
                logger_1.logger.security('Refresh token not found - possible reuse', {
                    userId: decodedUserIdForSecurity,
                });
            }
            await prisma_1.prisma.refreshToken.updateMany({
                where: { userId: decodedUserIdForSecurity },
                data: { revokedAt: new Date() },
            });
        }
        throw new errorHandler_1.UnauthorizedError('Invalid refresh token');
    }
    // Generate new tokens
    const user = storedToken.user;
    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const newAccessToken = (0, auth_1.generateAccessToken)(tokenPayload);
    const newRefreshToken = (0, auth_1.generateRefreshToken)(tokenPayload);
    // Revoke old token and create new one (token rotation)
    const refreshTokenExpiry = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: {
                revokedAt: new Date(),
                replacedBy: hashRefreshToken(newRefreshToken),
            },
        }),
        prisma_1.prisma.refreshToken.create({
            data: {
                token: hashRefreshToken(newRefreshToken),
                userId: user.id,
                expiresAt: refreshTokenExpiry,
            },
        }),
    ]);
    setRefreshTokenCookie(res, newRefreshToken);
    res.json({
        success: true,
        data: {
            accessToken: newAccessToken,
            refreshToken: config_1.config.isProduction ? undefined : newRefreshToken,
        },
    });
}));
/**
 * Logout user
 */
router.post('/logout', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.userId;
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    // Revoke refresh token if provided
    if (refreshToken) {
        await prisma_1.prisma.refreshToken.updateMany({
            where: {
                userId,
                token: {
                    in: refreshTokenLookupCandidates(refreshToken),
                },
            },
            data: { revokedAt: new Date() },
        });
    }
    clearRefreshTokenCookie(res);
    logger_1.logger.info('User logged out', { userId });
    res.json({
        success: true,
        message: 'Logged out successfully',
    });
}));
/**
 * Logout from all devices
 */
router.post('/logout-all', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.userId;
    // Revoke all refresh tokens for this user
    await prisma_1.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
    });
    clearRefreshTokenCookie(res);
    logger_1.logger.info('User logged out from all devices', { userId });
    res.json({
        success: true,
        message: 'Logged out from all devices',
    });
}));
/**
 * Get current user
 */
router.get('/me', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.userId;
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            phone: true,
            country: true,
            emailVerified: true,
            twoFactorEnabled: true,
            createdAt: true,
            lastLoginAt: true,
        },
    });
    if (!user) {
        throw new errorHandler_1.UnauthorizedError('User not found');
    }
    res.json({
        success: true,
        data: { user },
    });
}));
/**
 * Update current user profile
 */
router.patch('/me', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.userId;
    const { name, phone, country } = req.body;
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (phone !== undefined)
        updateData.phone = phone;
    if (country !== undefined)
        updateData.country = country;
    const user = await prisma_1.prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            phone: true,
            country: true,
        },
    });
    logger_1.logger.info('User profile updated', { userId });
    res.json({
        success: true,
        data: { user },
    });
}));
/**
 * Change password
 */
router.post('/change-password', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        throw new errorHandler_1.BadRequestError('Current password and new password are required');
    }
    // Validate new password strength
    if (newPassword.length < 8) {
        throw new errorHandler_1.BadRequestError('New password must be at least 8 characters');
    }
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new errorHandler_1.UnauthorizedError('User not found');
    }
    // Verify current password
    const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
        throw new errorHandler_1.BadRequestError('Current password is incorrect');
    }
    // Hash new password
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, BCRYPT_ROUNDS);
    // Update password and revoke all refresh tokens
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        }),
        prisma_1.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        }),
    ]);
    logger_1.logger.info('User changed password', { userId });
    clearRefreshTokenCookie(res);
    res.json({
        success: true,
        message: 'Password changed successfully. Please login again.',
    });
}));
/**
 * Google OAuth - Initiate
 */
router.get('/google', (req, res) => {
    const frontendBaseUrl = getFrontendBaseUrl(req);
    if (!GOOGLE_CLIENT_ID) {
        return res.redirect(`${frontendBaseUrl}/oauth/callback?error=google_not_configured`);
    }
    const state = encodeOAuthState(frontendBaseUrl);
    const redirectUri = `${getBackendBaseUrl(req)}/api/auth/google/callback`;
    const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        state,
        access_type: 'offline',
        prompt: 'consent',
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});
/**
 * Google OAuth - Callback
 */
router.get('/google/callback', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { code, error } = req.query;
    const frontendBaseUrl = getFrontendBaseUrlFromState(req.query.state, req);
    if (error || !code) {
        return sendBrowserRedirect(res, `${frontendBaseUrl}/oauth/callback?error=google_auth_failed`);
    }
    try {
        const redirectUri = `${getBackendBaseUrl(req)}/api/auth/google/callback`;
        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code: code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });
        const tokenData = await tokenResponse.json();
        if (!tokenData.access_token) {
            throw new Error('Failed to get access token');
        }
        // Get user info
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const userInfo = await userInfoResponse.json();
        if (!userInfo.email) {
            throw new Error('Failed to get user email');
        }
        // Find or create user
        let user = await prisma_1.prisma.user.findUnique({
            where: { email: userInfo.email.toLowerCase() },
        });
        if (!user) {
            // Create new user with OAuth
            const randomPassword = crypto_1.default.randomBytes(32).toString('hex');
            const hashedPassword = await bcryptjs_1.default.hash(randomPassword, 12);
            user = await prisma_1.prisma.user.create({
                data: {
                    email: userInfo.email.toLowerCase(),
                    password: hashedPassword,
                    name: userInfo.name || userInfo.email.split('@')[0],
                    role: types_1.UserRole.USER,
                    emailVerified: true, // OAuth emails are verified
                },
            });
            logger_1.logger.info('User created via Google OAuth', { userId: user.id, email: user.email });
        }
        // Generate refresh token and persist a hashed value for rotation.
        const tokenPayload = { userId: user.id, email: user.email, role: user.role };
        const refreshToken = (0, auth_1.generateRefreshToken)(tokenPayload);
        const refreshTokenExpiry = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);
        await prisma_1.prisma.refreshToken.create({
            data: {
                token: hashRefreshToken(refreshToken),
                userId: user.id,
                expiresAt: refreshTokenExpiry,
            },
        });
        setRefreshTokenCookie(res, refreshToken);
        // Update last login
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                lastLoginAt: new Date(),
                lastLoginIp: req.ip || req.socket.remoteAddress,
            },
        });
        logger_1.logger.info('User logged in via Google', { userId: user.id, email: user.email });
        // Redirect without tokens in URL. Frontend exchanges refresh cookie for access token.
        const params = new URLSearchParams({
            oauth: 'success',
            role: user.role,
        });
        sendBrowserRedirect(res, `${frontendBaseUrl}/oauth/callback?${params}`);
    }
    catch (err) {
        logger_1.logger.error('Google OAuth error', { error: err });
        sendBrowserRedirect(res, `${frontendBaseUrl}/oauth/callback?error=google_auth_failed`);
    }
}));
/**
 * Facebook OAuth - Initiate
 */
router.get('/facebook', (req, res) => {
    const frontendBaseUrl = getFrontendBaseUrl(req);
    if (!FACEBOOK_APP_ID) {
        return res.redirect(`${frontendBaseUrl}/oauth/callback?error=facebook_not_configured`);
    }
    const state = encodeOAuthState(frontendBaseUrl);
    const redirectUri = `${getBackendBaseUrl(req)}/api/auth/facebook/callback`;
    const params = new URLSearchParams({
        client_id: FACEBOOK_APP_ID,
        redirect_uri: redirectUri,
        scope: 'email,public_profile',
        state,
        response_type: 'code',
    });
    res.redirect(`https://www.facebook.com/v18.0/dialog/oauth?${params}`);
});
/**
 * Facebook OAuth - Callback
 */
router.get('/facebook/callback', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { code, error } = req.query;
    const frontendBaseUrl = getFrontendBaseUrlFromState(req.query.state, req);
    if (error || !code) {
        return sendBrowserRedirect(res, `${frontendBaseUrl}/oauth/callback?error=facebook_auth_failed`);
    }
    try {
        const redirectUri = `${getBackendBaseUrl(req)}/api/auth/facebook/callback`;
        // Exchange code for tokens
        const tokenParams = new URLSearchParams({
            client_id: FACEBOOK_APP_ID,
            client_secret: FACEBOOK_APP_SECRET,
            redirect_uri: redirectUri,
            code: code,
        });
        const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?${tokenParams}`);
        const tokenData = await tokenResponse.json();
        if (!tokenData.access_token) {
            throw new Error('Failed to get access token');
        }
        // Get user info
        const userInfoResponse = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${tokenData.access_token}`);
        const userInfo = await userInfoResponse.json();
        if (!userInfo.email) {
            // Facebook doesn't always provide email
            return sendBrowserRedirect(res, `${frontendBaseUrl}/oauth/callback?error=facebook_no_email`);
        }
        // Find or create user
        let user = await prisma_1.prisma.user.findUnique({
            where: { email: userInfo.email.toLowerCase() },
        });
        if (!user) {
            // Create new user with OAuth
            const randomPassword = crypto_1.default.randomBytes(32).toString('hex');
            const hashedPassword = await bcryptjs_1.default.hash(randomPassword, 12);
            user = await prisma_1.prisma.user.create({
                data: {
                    email: userInfo.email.toLowerCase(),
                    password: hashedPassword,
                    name: userInfo.name || userInfo.email.split('@')[0],
                    role: types_1.UserRole.USER,
                    emailVerified: true, // OAuth emails are verified
                },
            });
            logger_1.logger.info('User created via Facebook OAuth', { userId: user.id, email: user.email });
        }
        // Generate refresh token and persist a hashed value for rotation.
        const tokenPayload = { userId: user.id, email: user.email, role: user.role };
        const refreshToken = (0, auth_1.generateRefreshToken)(tokenPayload);
        const refreshTokenExpiry = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);
        await prisma_1.prisma.refreshToken.create({
            data: {
                token: hashRefreshToken(refreshToken),
                userId: user.id,
                expiresAt: refreshTokenExpiry,
            },
        });
        setRefreshTokenCookie(res, refreshToken);
        // Update last login
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                lastLoginAt: new Date(),
                lastLoginIp: req.ip || req.socket.remoteAddress,
            },
        });
        logger_1.logger.info('User logged in via Facebook', { userId: user.id, email: user.email });
        // Redirect without tokens in URL. Frontend exchanges refresh cookie for access token.
        const params = new URLSearchParams({
            oauth: 'success',
            role: user.role,
        });
        sendBrowserRedirect(res, `${frontendBaseUrl}/oauth/callback?${params}`);
    }
    catch (err) {
        logger_1.logger.error('Facebook OAuth error', { error: err });
        sendBrowserRedirect(res, `${frontendBaseUrl}/oauth/callback?error=facebook_auth_failed`);
    }
}));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map