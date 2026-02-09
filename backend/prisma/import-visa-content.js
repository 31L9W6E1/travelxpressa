const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const CONTENT_PACK_PATH = path.resolve(__dirname, '../../content/visa-content-pack.md');
const JSON_OUTPUT_PATH = path.resolve(__dirname, '../../content/visa-posts.json');

const NEWS_SECTION_START = '## Latest Visa News';
const NEWS_SECTION_END = '## In-Depth Visa Articles';

function normalizeSpaces(value) {
  return String(value || '')
    .replace(/\r/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(value) {
  return normalizeSpaces(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function excerptFromText(value, max = 220) {
  const clean = normalizeSpaces(value);
  if (clean.length <= max) {
    return clean;
  }
  return `${clean.slice(0, max - 3).trim()}...`;
}

function readContentPack() {
  if (!fs.existsSync(CONTENT_PACK_PATH)) {
    throw new Error(`Content pack not found: ${CONTENT_PACK_PATH}`);
  }
  return fs.readFileSync(CONTENT_PACK_PATH, 'utf8');
}

function extractSection(content, startMarker, endMarker) {
  const start = content.indexOf(startMarker);
  if (start === -1) {
    throw new Error(`Missing marker: ${startMarker}`);
  }
  const fromStart = content.slice(start + startMarker.length);
  if (!endMarker) {
    return fromStart.trim();
  }
  const end = fromStart.indexOf(endMarker);
  if (end === -1) {
    throw new Error(`Missing marker: ${endMarker}`);
  }
  return fromStart.slice(0, end).trim();
}

function parseNewsItems(newsSection) {
  const blocks = newsSection
    .split(/\n(?=\d+\.\s+\*\*Headline:\*\*)/g)
    .map((item) => item.trim())
    .filter(Boolean);

  return blocks.map((block, index) => {
    const headline = normalizeSpaces((block.match(/\*\*Headline:\*\*\s*(.+)/) || [])[1]);
    const region = normalizeSpaces((block.match(/\*\*Country \/ Region:\*\*\s*(.+)/) || [])[1]);
    const visaType = normalizeSpaces((block.match(/\*\*Visa Type:\*\*\s*(.+)/) || [])[1]);
    const imageUrl = normalizeSpaces((block.match(/\*\*Image:\*\*\s*!\[[^\]]*]\(([^)]+)\)/) || [])[1]);

    const summaryMatch = block.match(/\*\*Summary:\*\*\s*([\s\S]*?)\n\s*\*\*Source:\*\*/);
    const sourceMatch = block.match(/\*\*Source:\*\*\s*([\s\S]+)$/);
    const summary = normalizeSpaces(summaryMatch ? summaryMatch[1] : '');
    const source = normalizeSpaces(sourceMatch ? sourceMatch[1] : '');

    if (!headline || !summary || !imageUrl || !source) {
      throw new Error(`Failed to parse news item #${index + 1}`);
    }

    const content = [
      `### ${headline}`,
      '',
      `![${headline}](${imageUrl})`,
      '',
      `**Country / Region:** ${region}`,
      `**Visa Type:** ${visaType}`,
      '',
      summary,
      '',
      `**Source:** ${source}`,
    ].join('\n');

    const slug = `news-${String(index + 1).padStart(2, '0')}-${slugify(headline).slice(0, 80)}`;
    const publishedAt = new Date(Date.UTC(2026, 1, 9, 12, 0, 0) - index * 60 * 1000);

    return {
      title: headline,
      slug,
      excerpt: excerptFromText(summary, 220),
      content,
      imageUrl,
      category: 'news',
      tags: `${region}, ${visaType}, visa news`,
      status: 'published',
      publishedAt,
      authorName: 'TravelXpressa Editorial Desk',
      source,
    };
  });
}

function parseArticleBlocks(articleSection) {
  const headingRegex = /^###\s+\d+\.\s+(.+)$/gm;
  const markers = [];
  let match;

  while ((match = headingRegex.exec(articleSection)) !== null) {
    markers.push({
      title: normalizeSpaces(match[1]),
      headingIndex: match.index,
      bodyStart: headingRegex.lastIndex,
    });
  }

  return markers.map((marker, index) => {
    const next = markers[index + 1];
    const block = articleSection.slice(marker.bodyStart, next ? next.headingIndex : articleSection.length).trim();
    return {
      title: marker.title,
      block,
      index,
    };
  });
}

function firstArticleParagraph(block) {
  const withoutImage = block
    .replace(/^!\[[^\]]*]\([^)]+\)\s*\n+/m, '')
    .trim();

  const paragraphs = withoutImage
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean);

  for (const paragraph of paragraphs) {
    if (paragraph.startsWith('#### ')) {
      continue;
    }
    if (paragraph.startsWith('**Sources:**')) {
      continue;
    }
    return excerptFromText(paragraph, 220);
  }

  return excerptFromText(withoutImage, 220);
}

function parseArticles(articleSection) {
  const blocks = parseArticleBlocks(articleSection);

  return blocks.map(({ title, block, index }) => {
    const imageUrl = normalizeSpaces((block.match(/!\[[^\]]*]\(([^)]+)\)/) || [])[1]);
    const sourceMatch = block.match(/\*\*Sources:\*\*\s*([^\n]+)$/m);
    const source = normalizeSpaces(sourceMatch ? sourceMatch[1] : '');

    if (!title || !block || !imageUrl || !source) {
      throw new Error(`Failed to parse article #${index + 1}`);
    }

    const slug = `blog-${String(index + 1).padStart(2, '0')}-${slugify(title).slice(0, 80)}`;
    const publishedAt = new Date(Date.UTC(2026, 1, 8, 12, 0, 0) - index * 60 * 1000);

    return {
      title,
      slug,
      excerpt: firstArticleParagraph(block),
      content: block,
      imageUrl,
      category: 'blog',
      tags: 'visa guide, immigration policy, travel planning',
      status: 'published',
      publishedAt,
      authorName: 'TravelXpressa Editorial Desk',
      source,
    };
  });
}

function toCmsJson(posts) {
  return posts.map((post) => ({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    imageUrl: post.imageUrl,
    category: post.category,
    tags: post.tags,
    status: post.status,
    publishedAt: post.publishedAt,
    authorName: post.authorName,
    source: post.source,
  }));
}

async function upsertPosts(posts) {
  let created = 0;
  let updated = 0;

  for (const post of posts) {
    const data = {
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      imageUrl: post.imageUrl,
      category: post.category,
      tags: post.tags,
      status: post.status,
      publishedAt: post.publishedAt,
      authorName: post.authorName,
      authorId: null,
    };

    const existing = await prisma.post.findUnique({
      where: { slug: post.slug },
      select: { id: true },
    });

    if (existing) {
      await prisma.post.update({
        where: { slug: post.slug },
        data,
      });
      updated += 1;
    } else {
      await prisma.post.create({
        data: {
          slug: post.slug,
          ...data,
        },
      });
      created += 1;
    }
  }

  return { created, updated };
}

async function main() {
  const content = readContentPack();
  const newsSection = extractSection(content, NEWS_SECTION_START, NEWS_SECTION_END);
  const articleSection = extractSection(content, NEWS_SECTION_END, null);

  const newsPosts = parseNewsItems(newsSection);
  const blogPosts = parseArticles(articleSection);

  if (newsPosts.length !== 20) {
    throw new Error(`Expected 20 news posts, found ${newsPosts.length}`);
  }
  if (blogPosts.length !== 10) {
    throw new Error(`Expected 10 long-form articles, found ${blogPosts.length}`);
  }

  const allPosts = [...newsPosts, ...blogPosts];
  fs.writeFileSync(JSON_OUTPUT_PATH, `${JSON.stringify(toCmsJson(allPosts), null, 2)}\n`, 'utf8');

  const result = await upsertPosts(allPosts);
  console.log(`Imported ${allPosts.length} posts`);
  console.log(`Created: ${result.created}`);
  console.log(`Updated: ${result.updated}`);
  console.log(`JSON export: ${JSON_OUTPUT_PATH}`);
}

main()
  .catch((error) => {
    console.error('Import failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
