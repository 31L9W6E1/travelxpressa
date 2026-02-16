-- CreateTable
CREATE TABLE "SeoPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT,
    "metaDescription" TEXT,
    "canonicalUrl" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "twitterCard" TEXT,
    "twitterTitle" TEXT,
    "twitterDescription" TEXT,
    "twitterImage" TEXT,
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "jsonLdCustom" TEXT,
    "sitemapPriority" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "sitemapChangefreq" TEXT NOT NULL DEFAULT 'weekly',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeoPage_slug_key" ON "SeoPage"("slug");

-- CreateIndex
CREATE INDEX "SeoPage_slug_idx" ON "SeoPage"("slug");

-- CreateIndex
CREATE INDEX "SeoPage_updatedAt_idx" ON "SeoPage"("updatedAt");
