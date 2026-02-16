import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getSeoBySlug, type SeoPageConfig } from '@/api/seo';

type FallbackSeo = {
  title: string;
  description: string;
  noindex: boolean;
};

const DYNAMIC_SEO_ENABLED = !['0', 'false', 'no', 'off'].includes(
  String(import.meta.env.VITE_DYNAMIC_SEO_ENABLED ?? 'true').toLowerCase(),
);

const PRIVATE_PATH_PREFIXES = [
  '/admin',
  '/profile',
  '/application',
  '/form',
  '/dashboard',
  '/manage-users',
  '/contactsupport',
  '/oauth/callback',
];

const ROUTE_FALLBACKS: Array<{ match: (slug: string) => boolean; value: FallbackSeo }> = [
  {
    match: (slug) => slug === '/',
    value: {
      title: 'VISAMN | Visa Consulting Platform',
      description:
        'VISAMN helps Mongolian travelers prepare visa applications with guided workflows, document checklists, and support.',
      noindex: false,
    },
  },
  {
    match: (slug) => slug === '/news' || slug.startsWith('/news/'),
    value: {
      title: 'Visa News | VISAMN',
      description: 'Latest visa policy updates and embassy processing news for Mongolian applicants.',
      noindex: false,
    },
  },
  {
    match: (slug) => slug === '/blog' || slug.startsWith('/blog/'),
    value: {
      title: 'Visa Articles | VISAMN',
      description: 'In-depth visa guides, checklists, and preparation tips for global destinations.',
      noindex: false,
    },
  },
  {
    match: (slug) => slug === '/learn-more',
    value: {
      title: 'Visa Service Details | VISAMN',
      description: 'Compare visa timelines, official fees, and service support options before applying.',
      noindex: false,
    },
  },
];

const normalizeSlug = (pathname: string): string => {
  if (!pathname) return '/';
  const trimmed = pathname.trim();
  if (!trimmed || trimmed === '/') return '/';
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const collapsed = withLeadingSlash.replace(/\/{2,}/g, '/');
  return collapsed.length > 1 ? collapsed.replace(/\/+$/, '') : collapsed;
};

const isPrivateRoute = (slug: string): boolean =>
  PRIVATE_PATH_PREFIXES.some((prefix) => slug === prefix || slug.startsWith(`${prefix}/`));

const resolveFallback = (slug: string): FallbackSeo => {
  const matched = ROUTE_FALLBACKS.find((entry) => entry.match(slug));
  if (matched) return matched.value;

  return {
    title: 'VISAMN | Visa Consulting Platform',
    description:
      'Professional visa consulting and application preparation support for travelers from Mongolia.',
    noindex: isPrivateRoute(slug),
  };
};

const parseJsonLd = (value?: string | null): Record<string, unknown> | Array<unknown> | null => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
};

const RouteSeo = () => {
  const location = useLocation();
  const [seo, setSeo] = useState<SeoPageConfig | null>(null);

  const slug = useMemo(() => normalizeSlug(location.pathname), [location.pathname]);

  useEffect(() => {
    if (!DYNAMIC_SEO_ENABLED || isPrivateRoute(slug)) {
      setSeo(null);
      return;
    }

    let mounted = true;
    getSeoBySlug(slug)
      .then((result) => {
        if (mounted) {
          setSeo(result);
        }
      })
      .catch(() => {
        if (mounted) {
          setSeo(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  const fallback = resolveFallback(slug);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://visamn.com';
  const defaultImage = `${origin}/logo-visamn-com.png`;

  const title = seo?.title || fallback.title;
  const description = seo?.metaDescription || fallback.description;
  const canonicalUrl = seo?.canonicalUrl || `${origin}${slug}`;
  const ogTitle = seo?.ogTitle || title;
  const ogDescription = seo?.ogDescription || description;
  const ogImage = seo?.ogImage || defaultImage;
  const twitterCard = seo?.twitterCard || 'summary_large_image';
  const twitterTitle = seo?.twitterTitle || ogTitle;
  const twitterDescription = seo?.twitterDescription || ogDescription;
  const twitterImage = seo?.twitterImage || ogImage;
  const noindex = seo?.noindex ?? fallback.noindex;
  const jsonLd = parseJsonLd(seo?.jsonLdCustom);

  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitle} />
      <meta name="twitter:description" content={twitterDescription} />
      <meta name="twitter:image" content={twitterImage} />

      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />

      {jsonLd ? (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      ) : null}
    </Helmet>
  );
};

export default RouteSeo;
