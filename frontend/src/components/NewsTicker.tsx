import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPosts } from "@/api/posts";
import type { PostSummary } from "@/api/posts";
import { useTranslation } from "react-i18next";

export default function NewsTicker() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<PostSummary[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await getPosts({
          category: "news",
          page: 1,
          limit: 10,
          locale: i18n.language,
        });

        if (cancelled) return;
        setItems(res.data?.length ? res.data : []);
      } catch {
        if (cancelled) return;
        setItems([]);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [i18n.language]);

  const fallbackTitle = t("ticker.fallback", {
    defaultValue: "Latest visa news and updates",
  });

  const tickerItems: PostSummary[] =
    items.length > 0
      ? items
      : [
          {
            id: "fallback-news-1",
            title: fallbackTitle,
            excerpt: null,
            imageUrl: null,
            publishedAt: null,
            slug: "",
            category: "news",
            tags: null,
            authorName: "visamn",
            createdAt: new Date().toISOString(),
          },
        ];

  const tickerLoop = [...tickerItems, ...tickerItems];

  return (
    <section className="ticker-bar fixed top-16 left-0 right-0 md:left-[var(--sidebar-width,240px)] z-20 h-10 border-b border-dashed border-border/70">
      <div className="ticker-wrapper h-full">
        <div className="animate-ticker h-full items-center gap-10 pr-10">
          {tickerLoop.map((item, index) => (
            <Link
              key={`${item.id}-${index}`}
              to={item.slug ? `/news/${item.slug}` : "/news"}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/80" />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
