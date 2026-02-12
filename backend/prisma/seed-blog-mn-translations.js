/* eslint-disable no-console */

/**
 * Seed/Upsert Mongolian (mn) translations for published BLOG posts.
 *
 * This does NOT call any external API. It uses curated manual translations.
 *
 * Usage (example):
 *   DATABASE_URL='postgresql://...' node prisma/seed-blog-mn-translations.js
 */

const { PrismaClient } = require('@prisma/client');
const translations = require('./manual-translations/blog_mn');

const prisma = new PrismaClient();

const LOCALE = 'mn';

const normalize = (value) => String(value || '').replace(/\r/g, '').trim();

async function main() {
  const now = new Date();

  if (!Array.isArray(translations) || translations.length === 0) {
    throw new Error('No translations found in prisma/manual-translations/blog_mn.js');
  }

  let created = 0;
  let updated = 0;
  let missing = 0;

  for (const item of translations) {
    const slug = normalize(item.slug);
    if (!slug) continue;

    const post = await prisma.post.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        category: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!post) {
      missing += 1;
      console.warn(`[missing] Post not found for slug: ${slug}`);
      continue;
    }

    if (post.category !== 'blog' || post.status !== 'published') {
      console.warn(`[skip] Not a published blog post: ${slug}`);
      continue;
    }

    const data = {
      sourceLocale: 'en',
      title: normalize(item.title),
      // Keep slugs stable across locales so routing doesn't break on language switch.
      slug: post.slug,
      excerpt: normalize(item.excerpt) || null,
      content: normalize(item.content),
      tags: normalize(item.tags) || null,
      status: 'published',
      publishedAt: post.publishedAt || post.createdAt,
      translator: 'manual',
      translationModel: null,
      translatedAt: now,
      sourceUpdatedAt: post.updatedAt,
    };

    if (!data.title || !data.content) {
      throw new Error(`Invalid translation payload for slug: ${slug}`);
    }

    const existing = await prisma.postTranslation.findUnique({
      where: {
        postId_locale: {
          postId: post.id,
          locale: LOCALE,
        },
      },
      select: { id: true },
    });

    await prisma.postTranslation.upsert({
      where: {
        postId_locale: {
          postId: post.id,
          locale: LOCALE,
        },
      },
      create: {
        postId: post.id,
        locale: LOCALE,
        ...data,
      },
      update: data,
    });

    if (existing) {
      updated += 1;
    } else {
      created += 1;
    }
  }

  console.log('Done.');
  console.log(JSON.stringify({ locale: LOCALE, created, updated, missing }, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

