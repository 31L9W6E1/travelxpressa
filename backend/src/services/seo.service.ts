import { prisma } from '../lib/prisma';
import { BadRequestError } from '../middleware/errorHandler';
import { config } from '../config';
import type { CreateSeoPageInput, UpdateSeoPageInput } from '../validation/schemas';

const SITEMAP_CHANGEFREQ_VALUES = [
  'always',
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'never',
] as const;

const STATIC_SITEMAP_ROUTES: string[] = [
  '/',
  '/about',
  '/learn-more',
  '/translation-service',
  '/gallery',
  '/news',
  '/blog',
  '/flight',
  '/insurance',
  '/help-center',
  '/q-and-a',
  '/feedback',
  '/privacy',
  '/terms',
  '/data-deletion',
];

const DYNAMIC_SEO_BLOCK_PATTERN = /<\s*script\b|javascript:|on\w+\s*=/i;
const CONTROL_CHAR_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const getBaseUrl = (): string => {
  const raw = (config.frontendUrl || 'https://visamn.com').trim();
  if (/^https?:\/\//i.test(raw)) {
    return raw.replace(/\/+$/, '');
  }
  return `https://${raw.replace(/^\/+/, '').replace(/\/+$/, '')}`;
};

const sanitizeSeoText = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const cleaned = value.trim().replace(CONTROL_CHAR_PATTERN, '');
  if (!cleaned) return undefined;
  if (DYNAMIC_SEO_BLOCK_PATTERN.test(cleaned)) {
    throw new BadRequestError('Unsafe content detected in SEO text', 'SEO_UNSAFE_TEXT');
  }
  return cleaned;
};

const sanitizeHttpUrl = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const nextValue = value.trim();
  if (!nextValue) return undefined;
  if (DYNAMIC_SEO_BLOCK_PATTERN.test(nextValue)) {
    throw new BadRequestError('Unsafe URL detected', 'SEO_UNSAFE_URL');
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(nextValue);
  } catch {
    throw new BadRequestError('Invalid URL format', 'SEO_INVALID_URL');
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new BadRequestError('Only http/https URLs are allowed', 'SEO_INVALID_URL_PROTOCOL');
  }

  return parsedUrl.toString();
};

const normalizeSeoSlug = (slug: string): string => {
  const nextSlug = slug.trim();
  if (!nextSlug) {
    throw new BadRequestError('Slug is required', 'SEO_SLUG_REQUIRED');
  }

  const withLeadingSlash = nextSlug.startsWith('/') ? nextSlug : `/${nextSlug}`;
  const collapsed = withLeadingSlash.replace(/\/{2,}/g, '/');
  const withoutTrailingSlash = collapsed.length > 1 ? collapsed.replace(/\/+$/, '') : collapsed;

  if (DYNAMIC_SEO_BLOCK_PATTERN.test(withoutTrailingSlash) || /[<>'"`\s]/.test(withoutTrailingSlash)) {
    throw new BadRequestError('Invalid slug format', 'SEO_INVALID_SLUG');
  }

  return withoutTrailingSlash;
};

const sanitizeJsonLdNode = (node: unknown, depth = 0): unknown => {
  if (depth > 20) {
    throw new BadRequestError('JSON-LD is too deeply nested', 'SEO_JSONLD_TOO_DEEP');
  }

  if (node === null || typeof node === 'number' || typeof node === 'boolean') {
    return node;
  }

  if (typeof node === 'string') {
    const nextValue = node.trim().replace(CONTROL_CHAR_PATTERN, '');
    if (DYNAMIC_SEO_BLOCK_PATTERN.test(nextValue)) {
      throw new BadRequestError('Unsafe JSON-LD content detected', 'SEO_JSONLD_UNSAFE');
    }
    return nextValue;
  }

  if (Array.isArray(node)) {
    return node.map((item) => sanitizeJsonLdNode(item, depth + 1));
  }

  if (typeof node === 'object') {
    const input = node as Record<string, unknown>;
    const output: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(input)) {
      const nextKey = key.trim();
      if (!nextKey) continue;
      if (/^on/i.test(nextKey) || DYNAMIC_SEO_BLOCK_PATTERN.test(nextKey)) {
        throw new BadRequestError('Unsafe JSON-LD key detected', 'SEO_JSONLD_UNSAFE_KEY');
      }
      output[nextKey] = sanitizeJsonLdNode(value, depth + 1);
    }

    return output;
  }

  throw new BadRequestError('JSON-LD contains unsupported value types', 'SEO_JSONLD_UNSUPPORTED_TYPE');
};

const sanitizeJsonLdCustom = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const raw = value.trim();
  if (!raw) return undefined;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new BadRequestError('jsonLdCustom must be valid JSON', 'SEO_JSONLD_INVALID_JSON');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new BadRequestError('jsonLdCustom must be a JSON object or array', 'SEO_JSONLD_INVALID_ROOT');
  }

  const sanitized = sanitizeJsonLdNode(parsed);
  return JSON.stringify(sanitized);
};

const sanitizeSitemapPriority = (value?: number | null): number => {
  if (value === undefined || value === null || Number.isNaN(value)) return 0.5;
  if (value < 0 || value > 1) {
    throw new BadRequestError('sitemapPriority must be between 0 and 1', 'SEO_INVALID_PRIORITY');
  }
  return Number(value.toFixed(1));
};

const sanitizeSitemapChangefreq = (value?: string | null): (typeof SITEMAP_CHANGEFREQ_VALUES)[number] => {
  if (!value) return 'weekly';
  const nextValue = value.trim().toLowerCase();
  if (
    !SITEMAP_CHANGEFREQ_VALUES.includes(
      nextValue as (typeof SITEMAP_CHANGEFREQ_VALUES)[number],
    )
  ) {
    throw new BadRequestError('Invalid sitemapChangefreq value', 'SEO_INVALID_CHANGEFREQ');
  }
  return nextValue as (typeof SITEMAP_CHANGEFREQ_VALUES)[number];
};

export const isDynamicSeoEnabled = (): boolean => config.features.enableDynamicSeo;

const isMissingSeoTableError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error || '');
  return message.includes('SeoPage') && message.includes('does not exist');
};

const sanitizeSeoPayload = (input: Partial<CreateSeoPageInput | UpdateSeoPageInput>) => ({
  slug: input.slug ? normalizeSeoSlug(input.slug) : undefined,
  title: sanitizeSeoText(input.title),
  metaDescription: sanitizeSeoText(input.metaDescription),
  canonicalUrl: sanitizeHttpUrl(input.canonicalUrl),
  ogTitle: sanitizeSeoText(input.ogTitle),
  ogDescription: sanitizeSeoText(input.ogDescription),
  ogImage: sanitizeHttpUrl(input.ogImage),
  twitterCard: input.twitterCard?.trim() || undefined,
  twitterTitle: sanitizeSeoText(input.twitterTitle),
  twitterDescription: sanitizeSeoText(input.twitterDescription),
  twitterImage: sanitizeHttpUrl(input.twitterImage),
  noindex: input.noindex ?? false,
  jsonLdCustom: sanitizeJsonLdCustom(input.jsonLdCustom),
  sitemapPriority: sanitizeSitemapPriority(input.sitemapPriority),
  sitemapChangefreq: sanitizeSitemapChangefreq(input.sitemapChangefreq),
});

export async function listSeoPages(search?: string) {
  return prisma.seoPage.findMany({
    where: search
      ? {
          slug: {
            contains: search,
            mode: 'insensitive',
          },
        }
      : undefined,
    orderBy: [{ updatedAt: 'desc' }, { slug: 'asc' }],
  });
}

export async function getSeoPageById(id: string) {
  return prisma.seoPage.findUnique({ where: { id } });
}

export async function getSeoPageBySlug(slug: string) {
  const normalizedSlug = normalizeSeoSlug(slug);
  return prisma.seoPage.findUnique({ where: { slug: normalizedSlug } });
}

export async function createSeoPage(input: CreateSeoPageInput) {
  const data = sanitizeSeoPayload(input);
  if (!data.slug) {
    throw new BadRequestError('Slug is required', 'SEO_SLUG_REQUIRED');
  }

  return prisma.seoPage.create({
    data: {
      slug: data.slug,
      title: data.title,
      metaDescription: data.metaDescription,
      canonicalUrl: data.canonicalUrl,
      ogTitle: data.ogTitle,
      ogDescription: data.ogDescription,
      ogImage: data.ogImage,
      twitterCard: data.twitterCard,
      twitterTitle: data.twitterTitle,
      twitterDescription: data.twitterDescription,
      twitterImage: data.twitterImage,
      noindex: data.noindex,
      jsonLdCustom: data.jsonLdCustom,
      sitemapPriority: data.sitemapPriority,
      sitemapChangefreq: data.sitemapChangefreq,
    },
  });
}

export async function updateSeoPage(id: string, input: UpdateSeoPageInput) {
  const data = sanitizeSeoPayload(input);
  const hasOwn = (field: keyof UpdateSeoPageInput) => Object.prototype.hasOwnProperty.call(input, field);

  return prisma.seoPage.update({
    where: { id },
    data: {
      ...(hasOwn('slug') ? { slug: data.slug } : {}),
      ...(hasOwn('title') ? { title: data.title } : {}),
      ...(hasOwn('metaDescription') ? { metaDescription: data.metaDescription } : {}),
      ...(hasOwn('canonicalUrl') ? { canonicalUrl: data.canonicalUrl } : {}),
      ...(hasOwn('ogTitle') ? { ogTitle: data.ogTitle } : {}),
      ...(hasOwn('ogDescription') ? { ogDescription: data.ogDescription } : {}),
      ...(hasOwn('ogImage') ? { ogImage: data.ogImage } : {}),
      ...(hasOwn('twitterCard') ? { twitterCard: data.twitterCard } : {}),
      ...(hasOwn('twitterTitle') ? { twitterTitle: data.twitterTitle } : {}),
      ...(hasOwn('twitterDescription') ? { twitterDescription: data.twitterDescription } : {}),
      ...(hasOwn('twitterImage') ? { twitterImage: data.twitterImage } : {}),
      ...(hasOwn('noindex') ? { noindex: !!input.noindex } : {}),
      ...(hasOwn('jsonLdCustom') ? { jsonLdCustom: data.jsonLdCustom } : {}),
      ...(hasOwn('sitemapPriority') ? { sitemapPriority: data.sitemapPriority } : {}),
      ...(hasOwn('sitemapChangefreq')
        ? { sitemapChangefreq: data.sitemapChangefreq }
        : {}),
    },
  });
}

export async function deleteSeoPage(id: string) {
  return prisma.seoPage.delete({ where: { id } });
}

type SitemapEntry = {
  loc: string;
  lastmod: string;
  changefreq: (typeof SITEMAP_CHANGEFREQ_VALUES)[number];
  priority: number;
};

const createAbsoluteUrl = (pathOrUrl: string): string => {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const baseUrl = getBaseUrl();
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${baseUrl}${path}`;
};

const addOrReplaceEntry = (target: Map<string, SitemapEntry>, entry: SitemapEntry) => {
  target.set(entry.loc, entry);
};

export async function buildSitemapEntries(): Promise<SitemapEntry[]> {
  const now = new Date();
  const entries = new Map<string, SitemapEntry>();

  let seoPages: Awaited<ReturnType<typeof prisma.seoPage.findMany>> = [];
  if (isDynamicSeoEnabled()) {
    try {
      seoPages = await prisma.seoPage.findMany({ orderBy: { updatedAt: 'desc' } });
    } catch (error) {
      if (!isMissingSeoTableError(error)) {
        throw error;
      }
      seoPages = [];
    }
  }

  const seoBySlug = new Map<string, (typeof seoPages)[number]>();
  for (const seo of seoPages) {
    seoBySlug.set(normalizeSeoSlug(seo.slug), seo);
  }

  for (const route of STATIC_SITEMAP_ROUTES) {
    const normalizedRoute = normalizeSeoSlug(route);
    const seo = seoBySlug.get(normalizedRoute);

    if (seo?.noindex) continue;

    addOrReplaceEntry(entries, {
      loc: createAbsoluteUrl(seo?.canonicalUrl || normalizedRoute),
      lastmod: (seo?.updatedAt || new Date()).toISOString(),
      changefreq: sanitizeSitemapChangefreq(seo?.sitemapChangefreq),
      priority: sanitizeSitemapPriority(seo?.sitemapPriority ?? (normalizedRoute === '/' ? 1 : 0.7)),
    });
  }

  let publishedPosts: Array<{
    slug: string;
    category: string;
    updatedAt: Date;
    publishedAt: Date | null;
    translations: Array<{
      slug: string;
      updatedAt: Date;
      publishedAt: Date | null;
    }>;
  }> = [];
  try {
    publishedPosts = await prisma.post.findMany({
      where: { status: 'published' },
      select: {
        slug: true,
        category: true,
        updatedAt: true,
        publishedAt: true,
        translations: {
          where: { status: 'published' },
          select: {
            slug: true,
            updatedAt: true,
            publishedAt: true,
          },
        },
      },
    });
  } catch {
    publishedPosts = [];
  }

  for (const post of publishedPosts) {
    const prefix = post.category === 'news' ? '/news' : '/blog';
    const postPath = normalizeSeoSlug(`${prefix}/${post.slug}`);
    const seo = seoBySlug.get(postPath);
    if (!seo?.noindex) {
      addOrReplaceEntry(entries, {
        loc: createAbsoluteUrl(seo?.canonicalUrl || postPath),
        lastmod: (seo?.updatedAt || post.updatedAt || post.publishedAt || new Date()).toISOString(),
        changefreq: sanitizeSitemapChangefreq(seo?.sitemapChangefreq || 'weekly'),
        priority: sanitizeSitemapPriority(seo?.sitemapPriority ?? 0.8),
      });
    }

    for (const translation of post.translations) {
      const translatedPath = normalizeSeoSlug(`${prefix}/${translation.slug}`);
      const translatedSeo = seoBySlug.get(translatedPath);
      if (translatedSeo?.noindex) continue;

      addOrReplaceEntry(entries, {
        loc: createAbsoluteUrl(translatedSeo?.canonicalUrl || translatedPath),
        lastmod: (
          translatedSeo?.updatedAt ||
          translation.updatedAt ||
          translation.publishedAt ||
          post.updatedAt ||
          now
        ).toISOString(),
        changefreq: sanitizeSitemapChangefreq(translatedSeo?.sitemapChangefreq || 'weekly'),
        priority: sanitizeSitemapPriority(translatedSeo?.sitemapPriority ?? 0.7),
      });
    }
  }

  return Array.from(entries.values()).sort((a, b) => a.loc.localeCompare(b.loc));
}

export function renderSitemapXml(entries: SitemapEntry[]): string {
  const urlset = entries
    .map(
      (entry) => `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority.toFixed(1)}</priority>\n  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlset}\n</urlset>`;
}

export function renderRobotsTxt(): string {
  const sitemapUrl = `${getBaseUrl()}/sitemap.xml`;
  const lines = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /profile',
    'Disallow: /api/',
    '',
    `Sitemap: ${sitemapUrl}`,
  ];

  if (!isDynamicSeoEnabled()) {
    lines.unshift('# Dynamic SEO disabled via ENABLE_DYNAMIC_SEO');
  }

  return `${lines.join('\n')}\n`;
}

export function normalizeSlugForLookup(slug: string): string {
  return normalizeSeoSlug(slug);
}
