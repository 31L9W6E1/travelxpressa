import { Router, type Request, type Response } from 'express';
import { UserRole } from '../types';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler, NotFoundError } from '../middleware/errorHandler';
import {
  createSeoPageSchema,
  idParamSchema,
  listSeoPagesQuerySchema,
  seoSlugQuerySchema,
  updateSeoPageSchema,
} from '../validation/schemas';
import {
  buildSitemapEntries,
  createSeoPage,
  deleteSeoPage,
  getSeoPageById,
  getSeoPageBySlug,
  isDynamicSeoEnabled,
  normalizeSlugForLookup,
  renderRobotsTxt,
  renderSitemapXml,
  updateSeoPage,
  listSeoPages,
} from '../services/seo.service';

const isMissingSeoTableError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error || '');
  return message.includes('SeoPage') && message.includes('does not exist');
};

export const adminSeoRoutes = Router();
export const publicSeoRoutes = Router();
export const seoInfraRoutes = Router();

adminSeoRoutes.use(authenticateToken, requireRole(UserRole.ADMIN));

adminSeoRoutes.get(
  '/',
  validate({ query: listSeoPagesQuerySchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { q } = req.query as { q?: string };
    const data = await listSeoPages(q?.trim() || undefined);
    res.json({ success: true, data });
  }),
);

adminSeoRoutes.get(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const page = await getSeoPageById(String(req.params.id));
    if (!page) {
      throw new NotFoundError('SEO configuration not found', 'SEO_NOT_FOUND');
    }
    res.json({ success: true, data: page });
  }),
);

adminSeoRoutes.post(
  '/',
  validate({ body: createSeoPageSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const created = await createSeoPage(req.body);
    res.status(201).json({ success: true, data: created, message: 'SEO configuration created' });
  }),
);

adminSeoRoutes.put(
  '/:id',
  validate({ params: idParamSchema, body: updateSeoPageSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const updated = await updateSeoPage(String(req.params.id), req.body);
    res.json({ success: true, data: updated, message: 'SEO configuration updated' });
  }),
);

adminSeoRoutes.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    await deleteSeoPage(String(req.params.id));
    res.json({ success: true, message: 'SEO configuration deleted' });
  }),
);

publicSeoRoutes.get(
  '/by-slug',
  validate({ query: seoSlugQuerySchema }),
  asyncHandler(async (req: Request, res: Response) => {
    if (!isDynamicSeoEnabled()) {
      return res.json({ success: true, data: null, dynamicSeoEnabled: false });
    }

    const slug = normalizeSlugForLookup((req.query as { slug: string }).slug);
    let page = null;
    try {
      page = await getSeoPageBySlug(slug);
    } catch (error) {
      if (!isMissingSeoTableError(error)) {
        throw error;
      }
      page = null;
    }

    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    res.json({ success: true, data: page || null, dynamicSeoEnabled: true });
  }),
);

seoInfraRoutes.get(
  '/sitemap.xml',
  asyncHandler(async (_req: Request, res: Response) => {
    const entries = await buildSitemapEntries();
    const xml = renderSitemapXml(entries);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600');
    res.status(200).send(xml);
  }),
);

seoInfraRoutes.head('/sitemap.xml', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600');
  res.status(200).end();
});

seoInfraRoutes.get('/robots.txt', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600');
  res.status(200).send(renderRobotsTxt());
});

seoInfraRoutes.head('/robots.txt', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600');
  res.status(200).end();
});
