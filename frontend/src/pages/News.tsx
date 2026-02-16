import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import { getPosts, formatPostDate, getDefaultImage } from '@/api/posts';
import type { PostSummary } from '@/api/posts';
import { normalizeImageUrl } from '@/api/upload';
import { useTranslation } from 'react-i18next';
import PageHeader from "@/components/PageHeader";
import { CONTENT_TOPICS, matchesTopic } from '@/lib/contentTopics';
import { Button } from '@/components/ui/button';

const NEWS_HERO_IMAGE_URL =
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1800&auto=format&fit=crop&q=80';

const News = () => {
  const { t, i18n } = useTranslation();
  const [news, setNews] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [retryToken, setRetryToken] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState('all');

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const response = await getPosts({ category: 'news', limit: 12, page, locale: i18n.language });
        setNews(response.data);
        setTotalPages(response.pagination.totalPages);
        setError(null);
      } catch (err) {
        setError(t('newsPage.errors.loadFailed', { defaultValue: 'Failed to load news' }));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [i18n.language, page, retryToken, t]);

  const filteredNews = useMemo(
    () => news.filter((item) => matchesTopic(selectedTopic, item)),
    [news, selectedTopic]
  );
  const topicChipClass = (active: boolean) =>
    active
      ? 'px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full'
      : 'px-3 py-1 text-xs font-medium bg-secondary/70 text-muted-foreground rounded-full hover:bg-primary/5 hover:text-primary transition-colors';

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader
        title={t('newsPage.title', { defaultValue: 'News' })}
        subtitle={t('newsPage.subtitle', {
          defaultValue: 'Latest updates from embassies, consulates, and immigration services.',
        })}
        backgroundImageUrl={NEWS_HERO_IMAGE_URL}
        className="border-b-0"
      >
        <div className="space-y-4">
          <Button asChild size="sm" className="shadow-sm">
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
              {t('common.backToHome', { defaultValue: 'Back to Home' })}
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            {CONTENT_TOPICS.map((topic) => {
              const active = topic.id === selectedTopic;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setSelectedTopic(topic.id)}
                  className={topicChipClass(active)}
                >
                  {topic.label}
                </button>
              );
            })}
          </div>
        </div>
      </PageHeader>

      {/* News Grid */}
      <section className="py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {error ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <button
                onClick={() => {
                  setPage(1);
                  setRetryToken((prev) => prev + 1);
                }}
                className="text-primary hover:underline"
              >
                {t('errors.tryAgain', { defaultValue: 'Try again' })}
              </button>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {selectedTopic === 'all'
                  ? t('newsPage.empty.title', { defaultValue: 'No news articles published yet.' })
                  : t('newsPage.empty.filtered', {
                      defaultValue: 'No news found for this category on the current page.',
                    })}
              </p>
              <p className="text-muted-foreground mt-2">
                {t('newsPage.empty.subtitle', {
                  defaultValue: 'Check back soon for the latest updates!',
                })}
              </p>
            </div>
          ) : (
            <>
              {/* Grid layout: 4 columns on desktop, 2 on tablet, 1 on mobile */}
              <div className="grid grid-cols-2 min-[500px]:grid-cols-3 md:grid-cols-4 gap-2 md:gap-6">
                {filteredNews.map((item) => (
                  <article key={item.id} className="group">
                    <Link to={`/news/${item.slug}`} className="block">
                      <div className="relative aspect-square overflow-hidden rounded-lg mb-2 md:mb-3">
                        <img
                          src={item.imageUrl ? normalizeImageUrl(item.imageUrl) : getDefaultImage('news')}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4">
                          <h2 className="text-xs md:text-sm font-medium text-white line-clamp-2 group-hover:text-gray-300 transition-colors">
                            {item.title}
                          </h2>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatPostDate(item.publishedAt || item.createdAt, i18n.language)}
                      </div>
                      {item.excerpt && (
                        <p className="hidden md:block text-sm text-muted-foreground mt-2 line-clamp-2">{item.excerpt}</p>
                      )}
                    </Link>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && selectedTopic === 'all' && (
                <div className="flex flex-wrap items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {t('common.previous', { defaultValue: 'Previous' })}
                  </button>
                  <span className="px-3 py-1 text-xs font-medium bg-secondary/70 text-muted-foreground rounded-full">
                    {t('common.pageOf', {
                      defaultValue: 'Page {{page}} of {{total}}',
                      page,
                      total: totalPages,
                    })}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {t('common.next', { defaultValue: 'Next' })}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default News;
