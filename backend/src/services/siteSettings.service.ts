import { prisma } from '../lib/prisma';
import { siteSettingsSchema } from '../validation/schemas';

export type SiteSettings = {
  maintenance: {
    enabled: boolean;
    message?: string;
  };
  visibility: {
    about: boolean;
    learnMore: boolean;
    translationService: boolean;
    gallery: boolean;
    news: boolean;
    blog: boolean;
    flight: boolean;
    insurance: boolean;
    helpCenter: boolean;
    qAndA: boolean;
    feedback: boolean;
  };
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  maintenance: { enabled: false, message: '' },
  visibility: {
    about: true,
    learnMore: true,
    translationService: true,
    gallery: true,
    news: true,
    blog: true,
    flight: true,
    insurance: true,
    helpCenter: true,
    qAndA: true,
    feedback: true,
  },
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const latest = await prisma.auditLog.findFirst({
    where: { action: 'SITE_SETTINGS_UPDATE', entity: 'SITE_SETTINGS' },
    orderBy: { createdAt: 'desc' },
    select: { newData: true, metadata: true },
  });

  const raw = latest?.newData || latest?.metadata;
  if (!raw) return DEFAULT_SITE_SETTINGS;

  try {
    const parsed = siteSettingsSchema.safeParse(JSON.parse(raw));
    if (parsed.success) return parsed.data as SiteSettings;
  } catch {
    // ignore and fall back
  }

  return DEFAULT_SITE_SETTINGS;
}

