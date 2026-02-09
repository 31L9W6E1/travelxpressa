/* eslint-disable no-console */
const path = require('path');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const DEFAULT_LOCALES = ['mn', 'ru', 'zh'];
const LOCALE_LABELS = {
  mn: 'Mongolian',
  ru: 'Russian',
  zh: 'Simplified Chinese',
};

function parseArgs(argv) {
  const opts = {
    locales: DEFAULT_LOCALES,
    limit: undefined,
    overwrite: false,
    dryRun: false,
    slug: undefined,
  };

  for (const arg of argv) {
    if (arg.startsWith('--locales=')) {
      const value = arg.split('=')[1] || '';
      opts.locales = value
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
    } else if (arg.startsWith('--limit=')) {
      const value = Number(arg.split('=')[1]);
      if (!Number.isNaN(value) && value > 0) {
        opts.limit = value;
      }
    } else if (arg === '--overwrite') {
      opts.overwrite = true;
    } else if (arg === '--dry-run') {
      opts.dryRun = true;
    } else if (arg.startsWith('--slug=')) {
      const value = arg.split('=')[1];
      if (value) {
        opts.slug = value.trim();
      }
    }
  }

  return opts;
}

function extractJson(text) {
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
}

function normalizeValue(value) {
  if (value == null) return null;
  return String(value).replace(/\r/g, '').trim();
}

function safeExcerpt(value, fallbackContent) {
  const cleaned = normalizeValue(value);
  if (cleaned && cleaned.length > 0) {
    return cleaned;
  }
  const fallback = normalizeValue(fallbackContent) || '';
  const paragraph = fallback.split(/\n\s*\n/)[0].replace(/[#>*`]/g, '').trim();
  if (paragraph.length <= 220) return paragraph || null;
  return `${paragraph.slice(0, 217).trim()}...`;
}

function buildLocalizedSlug(baseSlug, locale) {
  const maxLen = 180;
  const stem = `${baseSlug}-${locale}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/(^-|-$)/g, '');
  if (stem.length <= maxLen) return stem;
  return stem.slice(0, maxLen).replace(/-+$/g, '');
}

function pullOutputText(data) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) {
    return data.output_text;
  }

  const chunks = [];
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
}

async function translatePost({ post, locale, model, apiKey }) {
  const languageName = LOCALE_LABELS[locale] || locale;

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

  const userPayload = {
    targetLocale: locale,
    targetLanguage: languageName,
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
          content: [{ type: 'input_text', text: JSON.stringify(userPayload) }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${body.slice(0, 400)}`);
  }

  const data = await response.json();
  const outputText = pullOutputText(data);
  const parsed = extractJson(outputText);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Failed to parse OpenAI JSON output');
  }

  return {
    title: normalizeValue(parsed.title),
    excerpt: safeExcerpt(parsed.excerpt, parsed.content),
    content: normalizeValue(parsed.content),
    tags: normalizeValue(parsed.tags),
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_TRANSLATION_MODEL || 'gpt-4.1-mini';

  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY. Set it in environment or backend/.env.');
  }

  if (!options.locales.length) {
    throw new Error('No locales provided. Use --locales=mn,ru,zh');
  }

  const where = {
    category: 'news',
    status: 'published',
    ...(options.slug ? { slug: options.slug } : {}),
  };

  const posts = await prisma.post.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
    ...(options.limit ? { take: options.limit } : {}),
  });

  if (posts.length === 0) {
    console.log('No published news posts found for translation.');
    return;
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const post of posts) {
    for (const locale of options.locales) {
      const existing = await prisma.postTranslation.findUnique({
        where: {
          postId_locale: {
            postId: post.id,
            locale,
          },
        },
      });

      if (existing && !options.overwrite) {
        skipped += 1;
        continue;
      }

      console.log(`Translating: ${post.slug} -> ${locale}`);
      const translated = await translatePost({ post, locale, model, apiKey });
      const slug = buildLocalizedSlug(post.slug, locale);

      if (!translated.title || !translated.content) {
        throw new Error(`Invalid translated payload for post ${post.slug} (${locale})`);
      }

      const data = {
        sourceLocale: 'en',
        title: translated.title,
        slug,
        excerpt: translated.excerpt,
        content: translated.content,
        tags: translated.tags,
        status: 'draft',
        publishedAt: null,
        translator: 'openai',
        translationModel: model,
        translatedAt: new Date(),
        sourceUpdatedAt: post.updatedAt,
      };

      if (options.dryRun) {
        console.log(`[dry-run] ${existing ? 'update' : 'create'} ${post.slug} (${locale})`);
        continue;
      }

      if (existing) {
        await prisma.postTranslation.update({
          where: { postId_locale: { postId: post.id, locale } },
          data,
        });
        updated += 1;
      } else {
        await prisma.postTranslation.create({
          data: {
            postId: post.id,
            locale,
            ...data,
          },
        });
        created += 1;
      }
    }
  }

  console.log('Translation complete.');
  console.log(`Source posts scanned: ${posts.length}`);
  console.log(`Locales: ${options.locales.join(', ')}`);
  console.log(`Created drafts: ${created}`);
  console.log(`Updated drafts: ${updated}`);
  console.log(`Skipped existing: ${skipped}`);
}

main()
  .catch((error) => {
    console.error('Translation failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
