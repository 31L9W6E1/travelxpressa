import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';
import { config } from '../config';

const SUPPORTED_LOCALES = new Set(['mn', 'ru', 'zh', 'ja', 'ko']);
const DEFAULT_LOCALES = ['mn'];
const DEFAULT_MODEL = 'gpt-4.1-mini';

type SourcePost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  tags: string | null;
  status: string;
  publishedAt: Date | null;
  updatedAt: Date;
};

type TranslatedPayload = {
  title: string | null;
  excerpt: string | null;
  content: string | null;
  tags: string | null;
};

const normalizeValue = (value: unknown): string | null => {
  if (value == null) return null;
  return String(value).replace(/\r/g, '').trim();
};

const safeExcerpt = (value: unknown, fallbackContent: unknown): string | null => {
  const cleaned = normalizeValue(value);
  if (cleaned && cleaned.length > 0) {
    return cleaned;
  }

  const fallback = normalizeValue(fallbackContent) || '';
  const paragraph = fallback.split(/\n\s*\n/)[0].replace(/[#>*`]/g, '').trim();
  if (!paragraph) return null;
  if (paragraph.length <= 220) return paragraph;
  return `${paragraph.slice(0, 217).trim()}...`;
};

const extractJson = (text: string): Record<string, unknown> | null => {
  const cleaned = String(text || '').trim();
  if (!cleaned) return null;

  if (cleaned.startsWith('```')) {
    const withoutFence = cleaned
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();
    return JSON.parse(withoutFence);
  }

  if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
    return JSON.parse(cleaned);
  }

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = cleaned.slice(firstBrace, lastBrace + 1);
    return JSON.parse(candidate);
  }

  return null;
};

const pullOutputText = (data: any): string => {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) {
    return data.output_text;
  }

  const chunks: string[] = [];
  if (Array.isArray(data?.output)) {
    for (const part of data.output) {
      if (!Array.isArray(part?.content)) continue;
      for (const item of part.content) {
        if (typeof item?.text === 'string' && item.text.trim()) {
          chunks.push(item.text);
        }
      }
    }
  }
  return chunks.join('\n').trim();
};

const parseLocales = (): string[] => {
  const raw = String(config.cmsAutoTranslate.locales || DEFAULT_LOCALES.join(','));
  const locales = raw
    .split(',')
    .map((item) => item.trim().toLowerCase().split('-')[0])
    .filter(Boolean)
    .filter((locale) => locale !== 'en')
    .filter((locale) => SUPPORTED_LOCALES.has(locale));

  return locales.length > 0 ? Array.from(new Set(locales)) : DEFAULT_LOCALES;
};

const isEnabled = (): boolean => {
  return config.cmsAutoTranslate.enabled;
};

const buildLocalizedSlug = (baseSlug: string, locale: string, suffix?: number): string => {
  const maxLen = 190;
  const base = `${baseSlug}-${locale}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/(^-|-$)/g, '');
  const withSuffix = suffix && suffix > 0 ? `${base}-${suffix}` : base;
  if (withSuffix.length <= maxLen) return withSuffix;
  return withSuffix.slice(0, maxLen).replace(/-+$/g, '');
};

const resolveTranslationSlug = async (post: SourcePost, locale: string, existingSlug?: string | null): Promise<string> => {
  if (existingSlug && existingSlug.trim()) {
    return existingSlug;
  }

  let attempt = 0;
  while (attempt < 50) {
    const candidate = buildLocalizedSlug(post.slug, locale, attempt || undefined);
    const collision = await prisma.postTranslation.findUnique({
      where: {
        locale_slug: {
          locale,
          slug: candidate,
        },
      },
      select: { postId: true },
    });

    if (!collision || collision.postId === post.id) {
      return candidate;
    }
    attempt += 1;
  }

  return buildLocalizedSlug(post.slug, locale, Date.now());
};

const translatePost = async (
  post: SourcePost,
  locale: string,
  apiKey: string,
  model: string
): Promise<TranslatedPayload> => {
  const systemPrompt = [
    'You are a professional immigration policy translator.',
    'Translate the provided English CMS post into the target language.',
    'Return JSON only with keys: title, excerpt, content, tags.',
    'Rules:',
    '- Keep all facts unchanged.',
    '- Preserve markdown structure and headings.',
    '- Keep URLs unchanged.',
    '- Keep tone neutral and factual.',
    '- Do not add commentary or extra keys.',
  ].join('\n');

  const payload = {
    targetLocale: locale,
    source: {
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      tags: post.tags,
    },
  };

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: systemPrompt }],
        },
        {
          role: 'user',
          content: [{ type: 'input_text', text: JSON.stringify(payload) }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI translation error (${response.status}): ${body.slice(0, 300)}`);
  }

  const data = await response.json();
  const output = pullOutputText(data);
  const parsed = extractJson(output);

  if (!parsed) {
    throw new Error('Failed to parse OpenAI translation output');
  }

  return {
    title: normalizeValue(parsed.title),
    excerpt: safeExcerpt(parsed.excerpt, parsed.content),
    content: normalizeValue(parsed.content),
    tags: normalizeValue(parsed.tags),
  };
};

const shouldSkipTranslation = (existing: {
  sourceUpdatedAt: Date | null;
  status: string;
}, sourceUpdatedAt: Date): boolean => {
  const sourceSynced = existing.sourceUpdatedAt && existing.sourceUpdatedAt.getTime() >= sourceUpdatedAt.getTime();
  return Boolean(sourceSynced && existing.status === 'published');
};

export const autoTranslatePublishedPost = async (postId: string): Promise<void> => {
  if (!isEnabled()) return;

  const apiKey = String(config.cmsAutoTranslate.openAiApiKey || '').trim();
  if (!apiKey) {
    logger.warn('Auto-translation skipped: missing OPENAI_API_KEY');
    return;
  }

  const locales = parseLocales();
  if (locales.length === 0) return;

  const model = String(config.cmsAutoTranslate.openAiModel || DEFAULT_MODEL).trim() || DEFAULT_MODEL;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      tags: true,
      status: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  if (!post || post.status !== 'published') return;

  for (const locale of locales) {
    try {
      const existing = await prisma.postTranslation.findUnique({
        where: {
          postId_locale: {
            postId: post.id,
            locale,
          },
        },
        select: {
          id: true,
          slug: true,
          sourceUpdatedAt: true,
          status: true,
        },
      });

      if (existing && shouldSkipTranslation(existing, post.updatedAt)) {
        continue;
      }

      const translated = await translatePost(post, locale, apiKey, model);
      if (!translated.title || !translated.content) {
        throw new Error(`Invalid translation payload for locale: ${locale}`);
      }

      const slug = await resolveTranslationSlug(post, locale, existing?.slug);
      const translatedAt = new Date();
      const translationData = {
        sourceLocale: 'en',
        title: translated.title,
        slug,
        excerpt: translated.excerpt,
        content: translated.content,
        tags: translated.tags,
        status: 'published',
        publishedAt: post.publishedAt ?? translatedAt,
        translator: 'openai',
        translationModel: model,
        translatedAt,
        sourceUpdatedAt: post.updatedAt,
      };

      if (existing) {
        await prisma.postTranslation.update({
          where: {
            postId_locale: {
              postId: post.id,
              locale,
            },
          },
          data: translationData,
        });
      } else {
        await prisma.postTranslation.create({
          data: {
            postId: post.id,
            locale,
            ...translationData,
          },
        });
      }
    } catch (error) {
      logger.error('Auto-translation failed for locale', error, { postId: post.id, locale });
    }
  }
};

export const triggerAutoTranslateForPost = (postId: string): void => {
  void autoTranslatePublishedPost(postId).catch((error) => {
    logger.error('Auto-translation job failed', error, { postId });
  });
};
