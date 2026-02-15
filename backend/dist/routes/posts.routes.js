"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const types_1 = require("../types");
const logger_1 = require("../utils/logger");
const postAutoTranslate_service_1 = require("../services/postAutoTranslate.service");
const router = (0, express_1.Router)();
// Helper to generate slug from title
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        + '-' + Date.now().toString(36);
};
// Helper to get string from query param (handles string | string[] | undefined)
const getQueryString = (value) => {
    if (Array.isArray(value))
        return value[0];
    return value;
};
const SUPPORTED_LOCALES = new Set(['en', 'mn', 'ru', 'zh', 'ja', 'ko']);
const normalizeLocale = (value) => {
    const raw = String(value || 'en').trim().toLowerCase();
    const locale = raw.split('-')[0];
    return SUPPORTED_LOCALES.has(locale) ? locale : 'en';
};
const normalizeValue = (value) => String(value || '').trim().toLowerCase();
const isPublishedStatus = (value) => normalizeValue(value) === 'published';
const isPubliclyVisibleStatus = (value) => {
    const normalized = normalizeValue(value);
    return normalized === '' || normalized === 'published';
};
const isSchemaCompatibilityError = (error) => {
    const code = error?.code;
    const message = normalizeValue(error?.message);
    return code === 'P2022' || message.includes('does not exist');
};
const pickBestTranslation = (translations) => {
    if (!Array.isArray(translations) || translations.length === 0)
        return null;
    return translations.find((item) => isPubliclyVisibleStatus(item.status)) || translations[0];
};
const getPostColumnSet = async () => {
    const rows = await prisma_1.prisma.$queryRawUnsafe(`SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'Post'`);
    return new Set(rows.map((row) => row.column_name));
};
const buildPostSelectSql = (columns) => {
    const has = (name) => columns.has(name);
    const col = (name, fallbackSql) => (has(name) ? `"${name}"` : `${fallbackSql} AS "${name}"`);
    return [
        col('id', `''::text`),
        col('title', `''::text`),
        col('slug', `''::text`),
        col('excerpt', `NULL`),
        col('imageUrl', `NULL`),
        col('category', `NULL`),
        col('tags', `NULL`),
        col('authorName', `NULL`),
        col('publishedAt', `NULL`),
        col('createdAt', `NOW()`),
        col('status', `'published'::text`),
    ].join(', ');
};
const queryLegacyPostRows = async () => {
    const columns = await getPostColumnSet();
    const selectSql = buildPostSelectSql(columns);
    const orderBySql = columns.has('createdAt') ? `"createdAt" DESC` : `1`;
    return await prisma_1.prisma.$queryRawUnsafe(`SELECT ${selectSql} FROM "Post" ORDER BY ${orderBySql}`);
};
// ==================== PUBLIC ROUTES ====================
// GET /api/posts - Get all published posts (public)
router.get('/', async (req, res) => {
    try {
        const requestedCategory = normalizeValue(getQueryString(req.query.category));
        const limit = getQueryString(req.query.limit) || '10';
        const page = getQueryString(req.query.page) || '1';
        const locale = normalizeLocale(getQueryString(req.query.locale));
        const useTranslation = locale !== 'en';
        const take = Math.min(parseInt(limit) || 10, 50);
        const currentPage = Math.max(parseInt(page) || 1, 1);
        const skip = (currentPage - 1) * take;
        const categoryFilter = requestedCategory && ['blog', 'news'].includes(requestedCategory) ? requestedCategory : '';
        const baseSelect = {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            imageUrl: true,
            category: true,
            tags: true,
            authorName: true,
            createdAt: true,
        };
        const getPostsWithFallback = async () => {
            try {
                return await prisma_1.prisma.post.findMany({
                    orderBy: { createdAt: 'desc' },
                    select: {
                        ...baseSelect,
                        publishedAt: true,
                        status: true,
                        ...(useTranslation
                            ? {
                                translations: {
                                    where: { locale },
                                    select: {
                                        title: true,
                                        slug: true,
                                        excerpt: true,
                                        tags: true,
                                        status: true,
                                    },
                                },
                            }
                            : {}),
                    },
                });
            }
            catch (error) {
                if (!isSchemaCompatibilityError(error))
                    throw error;
                logger_1.logger.warn('Using compatibility fallback for /api/posts');
                try {
                    const fallbackRows = await prisma_1.prisma.post.findMany({
                        orderBy: { createdAt: 'desc' },
                        select: {
                            ...baseSelect,
                            ...(useTranslation
                                ? {
                                    translations: {
                                        where: { locale },
                                        select: {
                                            title: true,
                                            slug: true,
                                            excerpt: true,
                                            tags: true,
                                        },
                                    },
                                }
                                : {}),
                        },
                    });
                    return fallbackRows.map((row) => ({
                        ...row,
                        status: 'published',
                    }));
                }
                catch (innerError) {
                    if (!isSchemaCompatibilityError(innerError))
                        throw innerError;
                    logger_1.logger.warn('Using legacy raw fallback for /api/posts');
                    const legacyRows = await queryLegacyPostRows();
                    return legacyRows.map((row) => ({
                        ...row,
                        status: row.status || 'published',
                        translations: [],
                    }));
                }
            }
        };
        const posts = await getPostsWithFallback();
        const filteredPosts = posts.filter((post) => {
            if (!isPubliclyVisibleStatus(post.status))
                return false;
            if (!categoryFilter)
                return true;
            return normalizeValue(post.category) === categoryFilter;
        });
        const localizedPosts = filteredPosts.map((post) => {
            if (!useTranslation) {
                const { status, translations, ...base } = post;
                return {
                    ...base,
                    publishedAt: post.publishedAt ?? post.createdAt,
                };
            }
            const translation = pickBestTranslation(post.translations);
            if (!translation) {
                const { status, translations, ...base } = post;
                return {
                    ...base,
                    publishedAt: post.publishedAt ?? post.createdAt,
                };
            }
            return {
                id: post.id,
                title: translation.title || post.title,
                slug: translation.slug || post.slug,
                excerpt: translation.excerpt ?? post.excerpt,
                imageUrl: post.imageUrl,
                category: post.category,
                tags: translation.tags ?? post.tags,
                authorName: post.authorName,
                publishedAt: post.publishedAt ?? post.createdAt,
                createdAt: post.createdAt,
            };
        });
        const paginatedPosts = localizedPosts.slice(skip, skip + take);
        const total = localizedPosts.length;
        res.json({
            success: true,
            data: paginatedPosts,
            pagination: {
                total,
                page: currentPage,
                limit: take,
                totalPages: Math.ceil(total / take),
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching posts', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch posts',
        });
    }
});
// GET /api/posts/featured - Get featured posts for homepage
router.get('/featured', async (_req, res) => {
    try {
        const locale = normalizeLocale(getQueryString(_req.query.locale));
        const useTranslation = locale !== 'en';
        const baseSelect = {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            imageUrl: true,
            category: true,
            tags: true,
            authorName: true,
            createdAt: true,
        };
        const getFeaturedWithFallback = async () => {
            try {
                return await prisma_1.prisma.post.findMany({
                    orderBy: { createdAt: 'desc' },
                    select: {
                        ...baseSelect,
                        publishedAt: true,
                        status: true,
                        ...(useTranslation
                            ? {
                                translations: {
                                    where: { locale },
                                    select: {
                                        title: true,
                                        slug: true,
                                        excerpt: true,
                                        tags: true,
                                        status: true,
                                    },
                                },
                            }
                            : {}),
                    },
                });
            }
            catch (error) {
                if (!isSchemaCompatibilityError(error))
                    throw error;
                logger_1.logger.warn('Using compatibility fallback for /api/posts/featured');
                try {
                    const fallbackRows = await prisma_1.prisma.post.findMany({
                        orderBy: { createdAt: 'desc' },
                        select: {
                            ...baseSelect,
                            ...(useTranslation
                                ? {
                                    translations: {
                                        where: { locale },
                                        select: {
                                            title: true,
                                            slug: true,
                                            excerpt: true,
                                            tags: true,
                                        },
                                    },
                                }
                                : {}),
                        },
                    });
                    return fallbackRows.map((row) => ({ ...row, status: 'published' }));
                }
                catch (innerError) {
                    if (!isSchemaCompatibilityError(innerError))
                        throw innerError;
                    logger_1.logger.warn('Using legacy raw fallback for /api/posts/featured');
                    const legacyRows = await queryLegacyPostRows();
                    return legacyRows.map((row) => ({
                        ...row,
                        status: row.status || 'published',
                        translations: [],
                    }));
                }
            }
        };
        const allPosts = await getFeaturedWithFallback();
        const mapLocalized = (post) => {
            if (!useTranslation) {
                const { status, translations, ...base } = post;
                return {
                    ...base,
                    publishedAt: post.publishedAt ?? post.createdAt,
                };
            }
            const translation = pickBestTranslation(post.translations);
            if (!translation) {
                const { status, translations, ...base } = post;
                return {
                    ...base,
                    publishedAt: post.publishedAt ?? post.createdAt,
                };
            }
            return {
                id: post.id,
                title: translation.title || post.title,
                slug: translation.slug || post.slug,
                excerpt: translation.excerpt ?? post.excerpt,
                imageUrl: post.imageUrl,
                category: post.category,
                tags: translation.tags ?? post.tags,
                authorName: post.authorName,
                publishedAt: post.publishedAt ?? post.createdAt,
                createdAt: post.createdAt,
            };
        };
        const publishedPosts = allPosts.filter((post) => isPubliclyVisibleStatus(post.status));
        const blogPosts = publishedPosts
            .filter((post) => normalizeValue(post.category) === 'blog')
            .slice(0, 9);
        const newsPosts = publishedPosts
            .filter((post) => normalizeValue(post.category) === 'news')
            .slice(0, 9);
        res.json({
            success: true,
            data: {
                blogPosts: blogPosts.map(mapLocalized),
                newsPosts: newsPosts.map(mapLocalized),
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching featured posts', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured posts',
        });
    }
});
// GET /api/posts/:slug - Get single post by slug (public)
router.get('/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const locale = normalizeLocale(getQueryString(req.query.locale));
        const useTranslation = locale !== 'en';
        if (useTranslation) {
            try {
                const localizedBySlug = await prisma_1.prisma.postTranslation.findFirst({
                    where: {
                        locale,
                        slug,
                    },
                    include: {
                        post: true,
                    },
                });
                if (localizedBySlug && isPubliclyVisibleStatus(localizedBySlug.status) && isPubliclyVisibleStatus(localizedBySlug.post.status)) {
                    return res.json({
                        success: true,
                        data: {
                            ...localizedBySlug.post,
                            title: localizedBySlug.title,
                            slug: localizedBySlug.slug,
                            excerpt: localizedBySlug.excerpt ?? localizedBySlug.post.excerpt,
                            content: localizedBySlug.content,
                            tags: localizedBySlug.tags ?? localizedBySlug.post.tags,
                            publishedAt: localizedBySlug.publishedAt ?? localizedBySlug.post.publishedAt,
                        },
                    });
                }
            }
            catch (error) {
                if (!isSchemaCompatibilityError(error))
                    throw error;
                logger_1.logger.warn('Using compatibility fallback for translation slug lookup');
            }
        }
        const getPostWithFallback = async () => {
            try {
                return await prisma_1.prisma.post.findUnique({
                    where: { slug },
                    include: useTranslation
                        ? {
                            translations: {
                                where: { locale },
                            },
                        }
                        : undefined,
                });
            }
            catch (error) {
                if (!isSchemaCompatibilityError(error))
                    throw error;
                logger_1.logger.warn('Using compatibility fallback for /api/posts/:slug');
                const legacyPost = await prisma_1.prisma.post.findUnique({
                    where: { slug },
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        excerpt: true,
                        content: true,
                        imageUrl: true,
                        category: true,
                        tags: true,
                        authorName: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                });
                if (!legacyPost || !useTranslation) {
                    return legacyPost ? { ...legacyPost, status: 'published' } : null;
                }
                try {
                    const translations = await prisma_1.prisma.postTranslation.findMany({
                        where: { postId: legacyPost.id, locale },
                        select: {
                            title: true,
                            slug: true,
                            excerpt: true,
                            content: true,
                            tags: true,
                            publishedAt: true,
                            status: true,
                        },
                    });
                    return {
                        ...legacyPost,
                        status: 'published',
                        translations,
                    };
                }
                catch (innerError) {
                    if (!isSchemaCompatibilityError(innerError))
                        throw innerError;
                    return {
                        ...legacyPost,
                        status: 'published',
                        translations: [],
                    };
                }
            }
        };
        const post = await getPostWithFallback();
        if (!post || !isPubliclyVisibleStatus(post.status)) {
            return res.status(404).json({
                success: false,
                message: 'Post not found',
            });
        }
        res.json({
            success: true,
            data: (() => {
                if (!useTranslation)
                    return post;
                const translation = pickBestTranslation(post.translations);
                if (!translation) {
                    const { translations, ...base } = post;
                    return base;
                }
                const { translations, ...base } = post;
                return {
                    ...base,
                    title: translation.title || post.title,
                    slug: translation.slug || post.slug,
                    excerpt: translation.excerpt ?? post.excerpt,
                    content: translation.content || post.content,
                    tags: translation.tags ?? post.tags,
                    publishedAt: translation.publishedAt ?? post.publishedAt ?? post.createdAt,
                };
            })(),
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching post', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch post',
        });
    }
});
// ==================== ADMIN ROUTES ====================
// GET /api/posts/admin/all - Get all posts including drafts (admin only)
router.get('/admin/all', auth_1.authenticateToken, (0, auth_1.requireRole)(types_1.UserRole.ADMIN), async (req, res) => {
    try {
        const category = getQueryString(req.query.category);
        const status = getQueryString(req.query.status);
        const where = {};
        if (category)
            where.category = category;
        if (status)
            where.status = status;
        const posts = await prisma_1.prisma.post.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                translations: {
                    orderBy: { updatedAt: 'desc' },
                },
            },
        });
        res.json({
            success: true,
            data: posts,
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching admin posts', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch posts',
        });
    }
});
// POST /api/posts/admin - Create new post (admin only)
router.post('/admin', auth_1.authenticateToken, (0, auth_1.requireRole)(types_1.UserRole.ADMIN), async (req, res) => {
    try {
        const { title, excerpt, content, imageUrl, category, tags, status } = req.body;
        if (!title || !content || !category) {
            return res.status(400).json({
                success: false,
                message: 'Title, content, and category are required',
            });
        }
        if (!['blog', 'news'].includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Category must be "blog" or "news"',
            });
        }
        const slug = generateSlug(title);
        const postStatus = status || 'draft';
        const publishedAt = postStatus === 'published' ? new Date() : null;
        const post = await prisma_1.prisma.post.create({
            data: {
                title,
                slug,
                excerpt: excerpt || content.substring(0, 200) + '...',
                content,
                imageUrl: imageUrl || null,
                category,
                tags: tags || null,
                status: postStatus,
                publishedAt,
                authorId: req.user?.userId || null,
                authorName: 'Admin',
            },
        });
        logger_1.logger.info('Post created', { postId: post.id, category, status: postStatus });
        if (post.status === 'published') {
            (0, postAutoTranslate_service_1.triggerAutoTranslateForPost)(post.id);
        }
        res.status(201).json({
            success: true,
            data: post,
            message: `${category === 'blog' ? 'Blog post' : 'News article'} created successfully`,
        });
    }
    catch (error) {
        logger_1.logger.error('Error creating post', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create post',
        });
    }
});
// PUT /api/posts/admin/:id - Update post (admin only)
router.put('/admin/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(types_1.UserRole.ADMIN), async (req, res) => {
    try {
        const id = req.params.id;
        const { title, excerpt, content, imageUrl, category, tags, status } = req.body;
        const existingPost = await prisma_1.prisma.post.findUnique({ where: { id } });
        if (!existingPost) {
            return res.status(404).json({
                success: false,
                message: 'Post not found',
            });
        }
        // Determine publishedAt
        let publishedAt = existingPost.publishedAt;
        if (status === 'published' && !existingPost.publishedAt) {
            publishedAt = new Date();
        }
        else if (status === 'draft') {
            publishedAt = null;
        }
        const post = await prisma_1.prisma.post.update({
            where: { id },
            data: {
                title: title ?? existingPost.title,
                excerpt: excerpt ?? existingPost.excerpt,
                content: content ?? existingPost.content,
                imageUrl: imageUrl !== undefined ? imageUrl : existingPost.imageUrl,
                category: category ?? existingPost.category,
                tags: tags !== undefined ? tags : existingPost.tags,
                status: status ?? existingPost.status,
                publishedAt,
            },
        });
        logger_1.logger.info('Post updated', { postId: id });
        if (post.status === 'published') {
            (0, postAutoTranslate_service_1.triggerAutoTranslateForPost)(post.id);
        }
        res.json({
            success: true,
            data: post,
            message: 'Post updated successfully',
        });
    }
    catch (error) {
        logger_1.logger.error('Error updating post', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update post',
        });
    }
});
// PUT /api/posts/admin/:id/translations/:locale - Upsert a translation (admin only)
router.put('/admin/:id/translations/:locale', auth_1.authenticateToken, (0, auth_1.requireRole)(types_1.UserRole.ADMIN), async (req, res) => {
    try {
        const id = req.params.id;
        const locale = normalizeLocale(req.params.locale);
        if (locale === 'en') {
            return res.status(400).json({
                success: false,
                message: 'Use the base post update endpoint for English content',
            });
        }
        const { title, excerpt, content, tags, status } = req.body || {};
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required',
            });
        }
        const translationStatus = status && ['draft', 'published'].includes(status) ? status : undefined;
        const post = await prisma_1.prisma.post.findUnique({
            where: { id },
            select: {
                id: true,
                slug: true,
                status: true,
                publishedAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found',
            });
        }
        const existingTranslation = await prisma_1.prisma.postTranslation.findUnique({
            where: {
                postId_locale: {
                    postId: post.id,
                    locale,
                },
            },
            select: {
                status: true,
                publishedAt: true,
            },
        });
        const nextStatus = translationStatus ?? existingTranslation?.status ?? (post.status === 'published' ? 'published' : 'draft');
        let publishedAt = existingTranslation?.publishedAt ?? null;
        if (nextStatus === 'published' && !publishedAt) {
            publishedAt = post.publishedAt ?? post.createdAt ?? new Date();
        }
        else if (nextStatus === 'draft') {
            publishedAt = null;
        }
        const now = new Date();
        const translation = await prisma_1.prisma.postTranslation.upsert({
            where: {
                postId_locale: {
                    postId: post.id,
                    locale,
                },
            },
            create: {
                postId: post.id,
                locale,
                sourceLocale: 'en',
                title,
                // Keep the slug stable across locales to avoid breaking routing.
                slug: post.slug,
                excerpt: excerpt ?? null,
                content,
                tags: tags ?? null,
                status: nextStatus,
                publishedAt,
                translator: 'manual',
                translationModel: null,
                translatedAt: now,
                sourceUpdatedAt: post.updatedAt,
            },
            update: {
                title,
                slug: post.slug,
                excerpt: excerpt ?? null,
                content,
                tags: tags ?? null,
                status: nextStatus,
                publishedAt,
                translator: 'manual',
                translationModel: null,
                translatedAt: now,
                sourceUpdatedAt: post.updatedAt,
            },
        });
        logger_1.logger.info('Post translation upserted', { postId: post.id, locale, status: nextStatus });
        res.json({
            success: true,
            data: translation,
            message: 'Translation updated successfully',
        });
    }
    catch (error) {
        logger_1.logger.error('Error upserting post translation', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update translation',
        });
    }
});
// DELETE /api/posts/admin/:id - Delete post (admin only)
router.delete('/admin/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(types_1.UserRole.ADMIN), async (req, res) => {
    try {
        const id = req.params.id;
        const existingPost = await prisma_1.prisma.post.findUnique({ where: { id } });
        if (!existingPost) {
            return res.status(404).json({
                success: false,
                message: 'Post not found',
            });
        }
        await prisma_1.prisma.post.delete({ where: { id } });
        logger_1.logger.info('Post deleted', { postId: id });
        res.json({
            success: true,
            message: 'Post deleted successfully',
        });
    }
    catch (error) {
        logger_1.logger.error('Error deleting post', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete post',
        });
    }
});
// PATCH /api/posts/admin/:id/publish - Toggle publish status (admin only)
router.patch('/admin/:id/publish', auth_1.authenticateToken, (0, auth_1.requireRole)(types_1.UserRole.ADMIN), async (req, res) => {
    try {
        const id = req.params.id;
        const existingPost = await prisma_1.prisma.post.findUnique({ where: { id } });
        if (!existingPost) {
            return res.status(404).json({
                success: false,
                message: 'Post not found',
            });
        }
        const newStatus = existingPost.status === 'published' ? 'draft' : 'published';
        const publishedAt = newStatus === 'published' ? new Date() : null;
        const post = await prisma_1.prisma.post.update({
            where: { id },
            data: {
                status: newStatus,
                publishedAt,
            },
        });
        logger_1.logger.info('Post publish status toggled', { postId: id, newStatus });
        if (newStatus === 'published') {
            (0, postAutoTranslate_service_1.triggerAutoTranslateForPost)(post.id);
        }
        res.json({
            success: true,
            data: post,
            message: `Post ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`,
        });
    }
    catch (error) {
        logger_1.logger.error('Error toggling post status', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update post status',
        });
    }
});
exports.default = router;
//# sourceMappingURL=posts.routes.js.map