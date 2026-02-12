import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma';
import { optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';
import { rateLimit } from '../middleware/rateLimit';
import { pageViewSchema } from '../validation/schemas';
import { getSiteSettings } from '../services/siteSettings.service';
import { resolveGeoForRequest } from '../services/geoIp.service';

const router = Router();

const pageViewRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 120,
  message: 'Too many tracking requests, please try again later',
});

router.get(
  '/settings',
  asyncHandler(async (_req: Request, res: Response) => {
    const settings = await getSiteSettings();
    res.setHeader('Cache-Control', 'no-store');
    res.json({ success: true, data: settings });
  })
);

router.post(
  '/pageview',
  pageViewRateLimit,
  optionalAuth,
  validate({ body: pageViewSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { path, title, referrer, locale } = req.body as {
      path: string;
      title?: string;
      referrer?: string;
      locale?: string;
    };

    const userId = (req as any).user?.userId as string | undefined;
    const userAgent = req.headers['user-agent'];

    const geo = await resolveGeoForRequest(req);

    // Keep metadata small and predictable.
    const metadata = JSON.stringify({
      title: title?.slice(0, 200),
      referrer: referrer?.slice(0, 500),
      locale: locale?.slice(0, 10),
      geo,
    });

    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action: 'PAGE_VIEW',
        entity: 'PAGE',
        entityId: path,
        ipAddress: req.ip,
        userAgent: typeof userAgent === 'string' ? userAgent.slice(0, 500) : undefined,
        metadata,
      },
    });

    res.status(204).send();
  })
);

export default router;
