import api, { handleApiError } from './client';

export type SitemapChangefreq =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

export type TwitterCard = 'summary' | 'summary_large_image' | 'app' | 'player';

export interface SeoPageConfig {
  id: string;
  slug: string;
  title: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterCard: TwitterCard | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
  noindex: boolean;
  jsonLdCustom: string | null;
  sitemapPriority: number;
  sitemapChangefreq: SitemapChangefreq;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertSeoPageInput {
  slug: string;
  title?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: TwitterCard;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  noindex?: boolean;
  jsonLdCustom?: string;
  sitemapPriority?: number;
  sitemapChangefreq?: SitemapChangefreq;
}

const cleanPayload = (payload: Partial<UpsertSeoPageInput>) =>
  Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      if (typeof value !== 'string') return [key, value];
      return [key, value.trim()];
    }),
  );

export const getSeoBySlug = async (slug: string): Promise<SeoPageConfig | null> => {
  try {
    const response = await api.get('/api/seo/by-slug', {
      params: { slug },
    });
    return response.data?.data || null;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getAdminSeoPages = async (query?: string): Promise<SeoPageConfig[]> => {
  try {
    const response = await api.get('/api/admin/seo', {
      params: query ? { q: query } : undefined,
    });
    return response.data?.data || [];
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getAdminSeoPageById = async (id: string): Promise<SeoPageConfig> => {
  try {
    const response = await api.get(`/api/admin/seo/${id}`);
    return response.data?.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createAdminSeoPage = async (payload: UpsertSeoPageInput): Promise<SeoPageConfig> => {
  try {
    const response = await api.post('/api/admin/seo', cleanPayload(payload));
    return response.data?.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateAdminSeoPage = async (
  id: string,
  payload: Partial<UpsertSeoPageInput>,
): Promise<SeoPageConfig> => {
  try {
    const response = await api.put(`/api/admin/seo/${id}`, cleanPayload(payload));
    return response.data?.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteAdminSeoPage = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/admin/seo/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
};
