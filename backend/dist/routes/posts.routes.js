"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const types_1 = require("../types");
const logger_1 = require("../utils/logger");
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
// ==================== PUBLIC ROUTES ====================
// GET /api/posts - Get all published posts (public)
router.get('/', async (req, res) => {
    try {
        const category = getQueryString(req.query.category);
        const limit = getQueryString(req.query.limit) || '10';
        const page = getQueryString(req.query.page) || '1';
        const take = Math.min(parseInt(limit) || 10, 50);
        const skip = (parseInt(page) - 1) * take;
        const where = {
            status: 'published',
        };
        if (category && (category === 'blog' || category === 'news')) {
            where.category = category;
        }
        const [posts, total] = await Promise.all([
            prisma_1.prisma.post.findMany({
                where,
                orderBy: { publishedAt: 'desc' },
                take,
                skip,
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    excerpt: true,
                    imageUrl: true,
                    category: true,
                    tags: true,
                    authorName: true,
                    publishedAt: true,
                    createdAt: true,
                },
            }),
            prisma_1.prisma.post.count({ where }),
        ]);
        res.json({
            success: true,
            data: posts,
            pagination: {
                total,
                page: parseInt(page),
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
        const [blogPosts, newsPosts] = await Promise.all([
            prisma_1.prisma.post.findMany({
                where: {
                    status: 'published',
                    category: 'blog',
                },
                orderBy: { publishedAt: 'desc' },
                take: 4,
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    excerpt: true,
                    imageUrl: true,
                    category: true,
                    tags: true,
                    authorName: true,
                    publishedAt: true,
                    createdAt: true,
                },
            }),
            prisma_1.prisma.post.findMany({
                where: {
                    status: 'published',
                    category: 'news',
                },
                orderBy: { publishedAt: 'desc' },
                take: 8,
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    excerpt: true,
                    imageUrl: true,
                    category: true,
                    tags: true,
                    authorName: true,
                    publishedAt: true,
                    createdAt: true,
                },
            }),
        ]);
        res.json({
            success: true,
            data: {
                blogPosts,
                newsPosts,
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
        const post = await prisma_1.prisma.post.findUnique({
            where: { slug },
        });
        if (!post || post.status !== 'published') {
            return res.status(404).json({
                success: false,
                message: 'Post not found',
            });
        }
        res.json({
            success: true,
            data: post,
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