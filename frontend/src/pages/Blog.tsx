import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, Loader2 } from 'lucide-react';
import { getPosts, formatPostDate, calculateReadTime, getDefaultImage } from '@/api/posts';
import type { PostSummary } from '@/api/posts';
import { normalizeImageUrl } from '@/api/upload';
import { useTranslation } from 'react-i18next';

const Blog = () => {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await getPosts({ category: 'blog', limit: 9, page });
        setPosts(response.data);
        setTotalPages(response.pagination.totalPages);
        setError(null);
      } catch (err) {
        setError(t('blogPage.errors.loadFailed', { defaultValue: 'Failed to load blog posts' }));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page]);

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
            {t('blogPage.title', { defaultValue: 'Blog' })}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            {t('blogPage.subtitle', {
              defaultValue:
                'Visa guides, travel tips, and expert advice to help you navigate your journey to the United States.',
            })}
          </p>
        </div>
      </section>

      {/* Posts Grid */}
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
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {t('blogPage.empty.title', { defaultValue: 'No blog posts published yet.' })}
              </p>
              <p className="text-muted-foreground mt-2">
                {t('blogPage.empty.subtitle', {
                  defaultValue: 'Check back soon for visa guides and travel tips!',
                })}
              </p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <article key={post.id} className="group">
                    <Link to={`/blog/${post.slug}`} className="block">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-xl mb-4">
                        <img
                          src={post.imageUrl ? normalizeImageUrl(post.imageUrl) : getDefaultImage('blog')}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        {post.tags && (
                          <span className="absolute top-4 left-4 px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                            {post.tags.split(',')[0]}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatPostDate(post.publishedAt || post.createdAt, i18n.language)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {t('content.readTime', {
                            defaultValue: '{{minutes}} min read',
                            minutes: calculateReadTime(post.excerpt || ''),
                          })}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold mb-2 group-hover:text-muted-foreground transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground line-clamp-2">{post.excerpt}</p>
                      {post.authorName && (
                        <p className="text-sm text-muted-foreground mt-3">
                          {t('content.by', { defaultValue: 'By {{name}}', name: post.authorName })}
                        </p>
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

export default Blog;
