import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, User, Loader2 } from 'lucide-react';
import { getPostBySlug, formatPostDate, calculateReadTime, getDefaultImage } from '@/api/posts';
import type { Post } from '@/api/posts';
import { Button } from '@/components/ui/button';
import { normalizeImageUrl } from '@/api/upload';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const BlogPost = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) {
        setError(t('blogPostPage.errors.notFound', { defaultValue: 'Post not found' }));
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await getPostBySlug(slug);
        setPost(response.data);
        setError(null);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError(t('blogPostPage.errors.notFound', { defaultValue: 'Post not found' }));
        } else {
          setError(t('blogPostPage.errors.loadFailed', { defaultValue: 'Failed to load post' }));
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
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

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold mb-4">
              {t('blogPostPage.notFound.title', { defaultValue: 'Post Not Found' })}
            </h1>
            <p className="text-muted-foreground mb-8">
              {error ||
                t('blogPostPage.notFound.description', {
                  defaultValue: 'The post you are looking for does not exist.',
                })}
            </p>
            <Button asChild>
              <Link to="/blog">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.backToBlog', { defaultValue: 'Back to Blog' })}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with featured image */}
      <div className="relative">
        {post.imageUrl && (
          <div className="absolute inset-0 h-[400px]">
            <img
              src={post.imageUrl ? normalizeImageUrl(post.imageUrl) : getDefaultImage('blog')}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          </div>
        )}

        <div className="relative max-w-4xl mx-auto px-6 pt-24 pb-12">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.backToBlog', { defaultValue: 'Back to Blog' })}
          </Link>

          {post.tags && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.split(',').map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-bold mb-6">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            {post.authorName && (
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.authorName}
              </span>
            )}
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatPostDate(post.publishedAt || post.createdAt, i18n.language)}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t('content.readTime', {
                defaultValue: '{{minutes}} min read',
                minutes: calculateReadTime(post.content),
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-6 py-12">
        {post.excerpt && (
          <p className="text-xl text-muted-foreground mb-8 border-l-4 border-primary pl-6">
            {post.excerpt}
          </p>
        )}

        <div className="prose prose-lg dark:prose-invert max-w-none">
          {/* Render content - for now as plain text with line breaks */}
          {post.content.split('\n').map((paragraph, i) => (
            paragraph.trim() && (
              <p key={i} className="mb-4 text-foreground leading-relaxed">
                {paragraph}
              </p>
            )
          ))}
        </div>
      </article>

      {/* Footer CTA */}
      <div className="max-w-4xl mx-auto px-6 py-12 border-t border-border">
        <div className="bg-secondary rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">
            {t('home.cta.title', { defaultValue: 'Ready to Start Your Visa Journey?' })}
          </h3>
          <p className="text-muted-foreground mb-6">
            {t('blogPostPage.cta.subtitle', {
              defaultValue: 'Let TravelXpressa guide you through the DS-160 application process.',
            })}
          </p>
          <Button asChild size="lg">
            <Link to={user ? (user.role === 'ADMIN' ? '/admin' : '/application') : '/login'}>
              {t('nav.getStarted', { defaultValue: 'Get Started' })}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
