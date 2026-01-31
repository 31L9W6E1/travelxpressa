import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, isAdmin, isAgentOrAdmin } from '../middleware/auth';
import { asyncHandler, NotFoundError, BadRequestError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';
import { logger } from '../utils/logger';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * Create a new chat thread (user)
 */
router.post(
  '/threads',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user.userId;
    const { applicationId, subject } = req.body;

    // Check if user already has an open thread
    const existingThread = await prisma.chatThread.findFirst({
      where: {
        userId,
        status: 'OPEN',
      },
    });

    if (existingThread) {
      return res.json({
        success: true,
        data: existingThread,
        message: 'Using existing open thread',
      });
    }

    const thread = await prisma.chatThread.create({
      data: {
        userId,
        applicationId: applicationId || null,
        subject: subject || 'Support Request',
        status: 'OPEN',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Create a system message
    await prisma.chatMessage.create({
      data: {
        threadId: thread.id,
        content: 'Chat thread created. An agent will respond shortly.',
        messageType: 'SYSTEM',
        senderType: 'SYSTEM',
      },
    });

    logger.info('Chat thread created', { threadId: thread.id, userId });

    res.status(201).json({
      success: true,
      data: thread,
    });
  })
);

/**
 * Get user's chat threads
 */
router.get(
  '/threads',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user.userId;
    const userRole = (req as AuthenticatedRequest).user.role;

    // Admin/Agent can see all threads
    const whereClause = ['ADMIN', 'AGENT'].includes(userRole)
      ? {}
      : { userId };

    const threads = await prisma.chatThread.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderType: { not: 'SYSTEM' },
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: threads,
    });
  })
);

/**
 * Get a specific thread with messages
 */
router.get(
  '/threads/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const userId = (req as AuthenticatedRequest).user.userId;
    const userRole = (req as AuthenticatedRequest).user.role;

    const thread = await prisma.chatThread.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!thread) {
      throw new NotFoundError('Thread not found');
    }

    // Users can only access their own threads
    if (thread.userId !== userId && !['ADMIN', 'AGENT'].includes(userRole)) {
      throw new NotFoundError('Thread not found');
    }

    // Mark messages as read
    await prisma.chatMessage.updateMany({
      where: {
        threadId: id,
        isRead: false,
        ...(userRole === 'USER'
          ? { senderType: { in: ['ADMIN', 'SYSTEM', 'TELEGRAM'] } }
          : { senderType: 'USER' }),
      },
      data: { isRead: true },
    });

    res.json({
      success: true,
      data: thread,
    });
  })
);

/**
 * Send a message in a thread
 */
router.post(
  '/threads/:id/messages',
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const userId = (req as AuthenticatedRequest).user.userId;
    const userRole = (req as AuthenticatedRequest).user.role;
    const { content, messageType = 'TEXT' } = req.body;

    if (!content || content.trim() === '') {
      throw new BadRequestError('Message content is required');
    }

    const thread = await prisma.chatThread.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!thread) {
      throw new NotFoundError('Thread not found');
    }

    // Users can only message in their own threads
    if (thread.userId !== userId && !['ADMIN', 'AGENT'].includes(userRole)) {
      throw new NotFoundError('Thread not found');
    }

    // Determine sender type
    const senderType = ['ADMIN', 'AGENT'].includes(userRole) ? 'ADMIN' : 'USER';

    const message = await prisma.chatMessage.create({
      data: {
        threadId: id,
        content: content.trim(),
        messageType,
        senderId: userId,
        senderType,
      },
    });

    // Update thread's updatedAt
    const threadId = id;
    await prisma.chatThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    });

    logger.info('Chat message sent', {
      threadId: id,
      messageId: message.id,
      senderId: userId,
      senderType,
    });

    // TODO: Send to Telegram if thread has telegramChatId
    // This would be handled by a Telegram bot integration

    res.status(201).json({
      success: true,
      data: message,
    });
  })
);

/**
 * Close a thread (admin/user)
 */
router.patch(
  '/threads/:id/close',
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const userId = (req as AuthenticatedRequest).user.userId;
    const userRole = (req as AuthenticatedRequest).user.role;

    const thread = await prisma.chatThread.findUnique({
      where: { id },
    });

    if (!thread) {
      throw new NotFoundError('Thread not found');
    }

    // Users can only close their own threads
    if (thread.userId !== userId && !['ADMIN', 'AGENT'].includes(userRole)) {
      throw new NotFoundError('Thread not found');
    }

    const updatedThread = await prisma.chatThread.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });

    // Add system message
    const closedThreadId = id;
    await prisma.chatMessage.create({
      data: {
        threadId: closedThreadId,
        content: 'Thread closed.',
        messageType: 'SYSTEM',
        senderType: 'SYSTEM',
      },
    });

    res.json({
      success: true,
      data: updatedThread,
    });
  })
);

// Admin routes

/**
 * Get all chat threads (admin only)
 */
router.get(
  '/admin/threads',
  isAgentOrAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const whereClause = status ? { status: status as string } : {};

    const [threads, total] = await Promise.all([
      prisma.chatThread.findMany({
        where: whereClause,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: Number(limit),
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          _count: {
            select: {
              messages: {
                where: { isRead: false, senderType: 'USER' },
              },
            },
          },
        },
      }),
      prisma.chatThread.count({ where: whereClause }),
    ]);

    res.json({
      success: true,
      data: threads,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  })
);

/**
 * Get chat statistics (admin only)
 */
router.get(
  '/admin/stats',
  isAdmin,
  asyncHandler(async (_req: Request, res: Response) => {
    const [totalThreads, openThreads, unreadMessages] = await Promise.all([
      prisma.chatThread.count(),
      prisma.chatThread.count({ where: { status: 'OPEN' } }),
      prisma.chatMessage.count({ where: { isRead: false, senderType: 'USER' } }),
    ]);

    res.json({
      success: true,
      data: {
        totalThreads,
        openThreads,
        unreadMessages,
      },
    });
  })
);

export default router;
