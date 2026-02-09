"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../lib/prisma");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const schemas_1 = require("../validation/schemas");
const types_1 = require("../types");
const logger_1 = require("../utils/logger");
const config_1 = require("../config");
const router = (0, express_1.Router)();
// OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '';
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';
const BCRYPT_ROUNDS = 12;
const MAX_FAILED_LOGINS = 100; // Increased for development
const LOCKOUT_DURATION_MS = 1 * 60 * 1000; // 1 minute in development
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
    if (process.env.FRONTEND_URL) {
        return process.env.FRONTEND_URL.replace(/\/+$/, '');
    }
    const origin = req.get('origin');
    if (origin) {
        return origin.replace(/\/+$/, '');
    }
    const referer = req.get('referer');
    if (referer) {
        try {
            return new URL(referer).origin;
        }
        catch {
            // Ignore malformed referer and continue to fallback.
        }
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
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await prisma_1.prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: refreshTokenExpiry,
        },
    });
    logger_1.logger.info('User registered', { userId: user.id, email: user.email });
    // Set refresh token as httpOnly cookie in production
    if (config_1.config.isProduction) {
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    }
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
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma_1.prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: refreshTokenExpiry,
        },
    });
    logger_1.logger.info('User logged in', { userId: user.id, email: user.email, ip: clientIp });
    // Set refresh token as httpOnly cookie in production
    if (config_1.config.isProduction) {
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }
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
    // Get refresh token from cookie or body
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) {
        throw new errorHandler_1.UnauthorizedError('Refresh token required');
    }
    // Verify token signature
    let decoded;
    try {
        decoded = (0, auth_1.verifyRefreshToken)(refreshToken);
    }
    catch {
        throw new errorHandler_1.UnauthorizedError('Invalid refresh token');
    }
    // Find token in database
    const storedToken = await prisma_1.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
    });
    if (!storedToken) {
        // Token not found - possible token reuse attack
        logger_1.logger.security('Refresh token not found - possible reuse', {
            userId: decoded.userId,
        });
        // Revoke all tokens for this user
        await prisma_1.prisma.refreshToken.updateMany({
            where: { userId: decoded.userId },
            data: { revokedAt: new Date() },
        });
        throw new errorHandler_1.UnauthorizedError('Invalid refresh token');
    }
    if (storedToken.revokedAt) {
        // Token was revoked - possible token reuse attack
        logger_1.logger.security('Revoked refresh token used', {
            userId: decoded.userId,
            tokenId: storedToken.id,
        });
        // Revoke all tokens for this user
        await prisma_1.prisma.refreshToken.updateMany({
            where: { userId: decoded.userId },
            data: { revokedAt: new Date() },
        });
        throw new errorHandler_1.UnauthorizedError('Invalid refresh token');
    }
    if (storedToken.expiresAt < new Date()) {
        throw new errorHandler_1.UnauthorizedError('Refresh token expired');
    }
    // Generate new tokens
    const user = storedToken.user;
    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const newAccessToken = (0, auth_1.generateAccessToken)(tokenPayload);
    const newRefreshToken = (0, auth_1.generateRefreshToken)(tokenPayload);
    // Revoke old token and create new one (token rotation)
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: {
                revokedAt: new Date(),
                replacedBy: newRefreshToken,
            },
        }),
        prisma_1.prisma.refreshToken.create({
            data: {
                token: newRefreshToken,
                userId: user.id,
                expiresAt: refreshTokenExpiry,
            },
        }),
    ]);
    // Set new refresh token as httpOnly cookie in production
    if (config_1.config.isProduction) {
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }
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
            where: { token: refreshToken, userId },
            data: { revokedAt: new Date() },
        });
    }
    // Clear cookie
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: config_1.config.isProduction,
        sameSite: 'strict',
    });
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
    // Clear cookie
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: config_1.config.isProduction,
        sameSite: 'strict',
    });
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
    // Clear cookie
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: config_1.config.isProduction,
        sameSite: 'strict',
    });
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
        return res.redirect(`${frontendBaseUrl}/oauth/callback?error=google_auth_failed`);
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
        // Generate tokens
        const tokenPayload = { userId: user.id, email: user.email, role: user.role };
        const accessToken = (0, auth_1.generateAccessToken)(tokenPayload);
        const refreshToken = (0, auth_1.generateRefreshToken)(tokenPayload);
        // Store refresh token
        const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await prisma_1.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: refreshTokenExpiry,
            },
        });
        // Update last login
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                lastLoginAt: new Date(),
                lastLoginIp: req.ip || req.socket.remoteAddress,
            },
        });
        logger_1.logger.info('User logged in via Google', { userId: user.id, email: user.email });
        // Redirect to frontend with tokens
        const params = new URLSearchParams({
            accessToken,
            refreshToken,
            userId: user.id,
            email: user.email,
            name: user.name || '',
            role: user.role,
        });
        res.redirect(`${frontendBaseUrl}/oauth/callback?${params}`);
    }
    catch (err) {
        logger_1.logger.error('Google OAuth error', { error: err });
        res.redirect(`${frontendBaseUrl}/oauth/callback?error=google_auth_failed`);
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
        return res.redirect(`${frontendBaseUrl}/oauth/callback?error=facebook_auth_failed`);
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
            return res.redirect(`${frontendBaseUrl}/oauth/callback?error=facebook_no_email`);
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
        // Generate tokens
        const tokenPayload = { userId: user.id, email: user.email, role: user.role };
        const accessToken = (0, auth_1.generateAccessToken)(tokenPayload);
        const refreshToken = (0, auth_1.generateRefreshToken)(tokenPayload);
        // Store refresh token
        const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await prisma_1.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: refreshTokenExpiry,
            },
        });
        // Update last login
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                lastLoginAt: new Date(),
                lastLoginIp: req.ip || req.socket.remoteAddress,
            },
        });
        logger_1.logger.info('User logged in via Facebook', { userId: user.id, email: user.email });
        // Redirect to frontend with tokens
        const params = new URLSearchParams({
            accessToken,
            refreshToken,
            userId: user.id,
            email: user.email,
            name: user.name || '',
            role: user.role,
        });
        res.redirect(`${frontendBaseUrl}/oauth/callback?${params}`);
    }
    catch (err) {
        logger_1.logger.error('Facebook OAuth error', { error: err });
        res.redirect(`${frontendBaseUrl}/oauth/callback?error=facebook_auth_failed`);
    }
}));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map