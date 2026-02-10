import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import { getPostBySlug, formatPostDate, getDefaultImage } from '@/api/posts';
import type { Post } from '@/api/posts';
import { Button } from '@/components/ui/button';
import { normalizeImageUrl } from '@/api/upload';
import { useTranslation } from 'react-i18next';

const NewsArticle = () => {
  const { t, i18n } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) {
        setError(t('newsArticlePage.errors.notFound', { defaultValue: 'Article not found' }));
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await getPostBySlug(slug);
        setArticle(response.data);
        setError(null);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError(t('newsArticlePage.errors.notFound', { defaultValue: 'Article not found' }));
        } else {
          setError(t('newsArticlePage.errors.loadFailed', { defaultValue: 'Failed to load article' }));
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold mb-4">
              {t('newsArticlePage.notFound.title', { defaultValue: 'Article Not Found' })}
            </h1>
            <p className="text-muted-foreground mb-8">
              {error ||
                t('newsArticlePage.notFound.description', {
                  defaultValue: 'The article you are looking for does not exist.',
                })}
            </p>
            <Button asChild>
              <Link to="/news">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.backToNews', { defaultValue: 'Back to News' })}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <section className="pt-20 pb-12 border-b border-border">
        <div className="max-w-4xl mx-auto px-6">
          <Link
            to="/news"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.backToNews', { defaultValue: 'Back to News' })}
          </Link>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Calendar className="w-4 h-4" />
            {formatPostDate(article.publishedAt || article.createdAt, i18n.language)}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6">{article.title}</h1>

          {article.excerpt && (
            <p className="text-xl text-muted-foreground">{article.excerpt}</p>
          )}
        </div>
      </section>

      {/* Featured Image */}
      {article.imageUrl && (
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="aspect-video rounded-xl overflow-hidden">
            <img
              src={article.imageUrl ? normalizeImageUrl(article.imageUrl) : getDefaultImage('news')}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <article className="max-w-4xl mx-auto px-6 py-8">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {article.content.split('\n').map((paragraph, i) => (
            paragraph.trim() && (
              <p key={i} className="mb-4 text-foreground leading-relaxed">
                {paragraph}
              </p>
            )
          ))}
        </div>
      </article>

      {/* Related News CTA */}
      <div className="max-w-4xl mx-auto px-6 py-12 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">
              {t('newsArticlePage.relatedCta.title', { defaultValue: 'Stay Updated' })}
            </h3>
            <p className="text-muted-foreground">
              {t('newsArticlePage.relatedCta.subtitle', {
                defaultValue: 'Check out more news and announcements.',
              })}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/news">
              {t('newsArticlePage.relatedCta.viewAll', { defaultValue: 'View All News' })}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewsArticle;
