import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, User, Loader2 } from 'lucide-react';
import { getPostBySlug, formatPostDate, calculateReadTime, getDefaultImage, updatePost, upsertPostTranslation } from '@/api/posts';
import type { Post } from '@/api/posts';
import { Button } from '@/components/ui/button';
import { normalizeImageUrl } from '@/api/upload';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import MarkdownRenderer from "@/components/MarkdownRenderer";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const BlogPost = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftExcerpt, setDraftExcerpt] = useState('');
  const [draftTags, setDraftTags] = useState('');
  const [draftContent, setDraftContent] = useState('');

  const locale = (i18n.language || 'en').toLowerCase().split('-')[0] || 'en';

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
  }, [i18n.language, slug, t]);

  useEffect(() => {
    if (!editOpen || !post) return;
    setDraftTitle(post.title || '');
    setDraftExcerpt(post.excerpt || '');
    setDraftTags(post.tags || '');
    setDraftContent(post.content || '');
  }, [editOpen, post]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20">
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20">
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

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-12 md:pt-24 pb-8 md:pb-12">
          <div className="flex items-start justify-between gap-4 mb-8">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('common.backToBlog', { defaultValue: 'Back to Blog' })}
            </Link>

            {user?.role === 'ADMIN' && (
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    {t('common.edit', { defaultValue: 'Edit' })}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>
                      {t('blogPostPage.adminEditor.title', { defaultValue: 'Edit Post' })}{' '}
                      <span className="text-muted-foreground text-sm font-normal">({locale.toUpperCase()})</span>
                    </DialogTitle>
                  </DialogHeader>

                  <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="blog-edit-title">
                          {t('content.fields.title', { defaultValue: 'Title' })}
                        </Label>
                        <Input
                          id="blog-edit-title"
                          value={draftTitle}
                          onChange={(e) => setDraftTitle(e.target.value)}
                          placeholder={t('content.placeholders.title', { defaultValue: 'Enter a title' })}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="blog-edit-excerpt">
                          {t('content.fields.excerpt', { defaultValue: 'Excerpt' })}
                        </Label>
                        <Textarea
                          id="blog-edit-excerpt"
                          value={draftExcerpt}
                          onChange={(e) => setDraftExcerpt(e.target.value)}
                          placeholder={t('content.placeholders.excerpt', { defaultValue: 'Short summary (optional)' })}
                          rows={3}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="blog-edit-tags">
                          {t('content.fields.tags', { defaultValue: 'Tags' })}
                        </Label>
                        <Input
                          id="blog-edit-tags"
                          value={draftTags}
                          onChange={(e) => setDraftTags(e.target.value)}
                          placeholder={t('content.placeholders.tags', { defaultValue: 'Comma-separated (optional)' })}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="blog-edit-content">
                          {t('content.fields.content', { defaultValue: 'Content' })}
                        </Label>
                        <Textarea
                          id="blog-edit-content"
                          value={draftContent}
                          onChange={(e) => setDraftContent(e.target.value)}
                          placeholder={t('content.placeholders.content', { defaultValue: 'Write the post...' })}
                          rows={12}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-4">
                      {t('blogPostPage.adminEditor.note', {
                        defaultValue:
                          'Edits apply to the currently selected language. Switch language to edit another translation.',
                      })}
                    </p>
                  </div>

                  <DialogFooter className="gap-2 sm:gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setEditOpen(false)}
                      disabled={saving}
                    >
                      {t('common.cancel', { defaultValue: 'Cancel' })}
                    </Button>
                    <Button
                      onClick={async () => {
                        if (!post) return;
                        const nextTitle = draftTitle.trim();
                        const nextContent = draftContent.trim();
                        if (!nextTitle || !nextContent) {
                          toast.error(t('common.validationRequired', { defaultValue: 'Title and content are required.' }));
                          return;
                        }

                        setSaving(true);
                        try {
                          if (locale === 'en') {
                            await updatePost(post.id, {
                              title: nextTitle,
                              excerpt: draftExcerpt.trim() || undefined,
                              content: nextContent,
                              tags: draftTags.trim() || undefined,
                            });
                          } else {
                            await upsertPostTranslation(post.id, locale, {
                              title: nextTitle,
                              excerpt: draftExcerpt.trim() || null,
                              content: nextContent,
                              tags: draftTags.trim() || null,
                              status: 'published',
                            });
                          }

                          const refreshed = await getPostBySlug(post.slug);
                          setPost(refreshed.data);
                          toast.success(t('common.saved', { defaultValue: 'Saved' }));
                          setEditOpen(false);
                        } catch (err: any) {
                          toast.error(
                            err?.message || t('common.saveFailed', { defaultValue: 'Failed to save changes' })
                          );
                        } finally {
                          setSaving(false);
                        }
                      }}
                      disabled={saving}
                    >
                      {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      {t('common.save', { defaultValue: 'Save' })}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

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

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

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
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-12">
        {post.excerpt && (
          <p className="text-base md:text-lg text-muted-foreground mb-6 border-l-4 border-primary pl-6">
            {post.excerpt}
          </p>
      )}

      <MarkdownRenderer content={post.content || ""} />
      </article>

      {/* Footer CTA */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 border-t border-border">
        <div className="bg-secondary rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">
            {t('home.cta.title', { defaultValue: 'Ready to Start Your Visa Journey?' })}
          </h3>
          <p className="text-muted-foreground mb-6">
            {t('blogPostPage.cta.subtitle', {
              defaultValue: 'Let visamn guide you through your visa application process.',
            })}
          </p>
          <Button asChild size="lg">
            <Link to={user ? (user.role === 'ADMIN' ? '/admin' : '/select-country') : '/login'}>
              {t('nav.getStarted', { defaultValue: 'Get Started' })}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
