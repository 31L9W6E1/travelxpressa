import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import { getPosts, formatPostDate, getDefaultImage } from '@/api/posts';
import type { PostSummary } from '@/api/posts';
import { normalizeImageUrl } from '@/api/upload';
import { useTranslation } from 'react-i18next';

const News = () => {
  const { t, i18n } = useTranslation();
  const [news, setNews] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
  }, [i18n.language, page, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <section className="pt-16 pb-12 border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.backToHome', { defaultValue: 'Back to Home' })}
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('newsPage.title', { defaultValue: 'News' })}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            {t('newsPage.subtitle', {
              defaultValue: 'Latest updates from embassies, consulates, and immigration services.',
            })}
          </p>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          {error ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <button
                onClick={() => setPage(1)}
                className="text-primary hover:underline"
              >
                {t('errors.tryAgain', { defaultValue: 'Try again' })}
              </button>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {t('newsPage.empty.title', { defaultValue: 'No news articles published yet.' })}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {news.map((item) => (
                  <article key={item.id} className="group">
                    <Link to={`/news/${item.slug}`} className="block">
                      <div className="relative aspect-square overflow-hidden rounded-lg mb-3">
                        <img
                          src={item.imageUrl ? normalizeImageUrl(item.imageUrl) : getDefaultImage('news')}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h2 className="text-sm font-medium text-white line-clamp-2 group-hover:text-gray-300 transition-colors">
                            {item.title}
                          </h2>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatPostDate(item.publishedAt || item.createdAt, i18n.language)}
                      </div>
                      {item.excerpt && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.excerpt}</p>
                      )}
                    </Link>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('common.previous', { defaultValue: 'Previous' })}
                  </button>
                  <span className="px-4 py-2 text-muted-foreground">
                    {t('common.pageOf', {
                      defaultValue: 'Page {{page}} of {{total}}',
                      page,
                      total: totalPages,
                    })}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
