import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import { getPostBySlug, formatPostDate, getDefaultImage, updatePost, upsertPostTranslation } from '@/api/posts';
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
import ImageUpload from '@/components/ImageUpload';

const NewsArticle = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftExcerpt, setDraftExcerpt] = useState('');
  const [draftTags, setDraftTags] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftImageUrl, setDraftImageUrl] = useState('');

  const locale = (i18n.language || 'en').toLowerCase().split('-')[0] || 'en';

  const articleContent = useMemo(() => {
    if (!article?.content) return '';
    if (!article.imageUrl) return article.content;

    // Avoid showing a duplicate top image when a hero image already exists.
    return article.content.replace(
      /^(\s*(?:#{1,6}[^\n]*\n+)?)(?:\s*!\[[^\]]*]\([^)]+\)\s*\n+)+/,
      '$1',
    );
  }, [article?.content, article?.imageUrl]);

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
  }, [i18n.language, slug, t]);

  useEffect(() => {
    if (!editOpen || !article) return;
    setDraftTitle(article.title || '');
    setDraftExcerpt(article.excerpt || '');
    setDraftTags(article.tags || '');
    setDraftContent(article.content || '');
    setDraftImageUrl(article.imageUrl || '');
  }, [article, editOpen]);

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

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20">
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
      <div className="relative">
        {article.imageUrl && (
          <div className="absolute inset-0 h-[400px]">
            <img
              src={article.imageUrl ? normalizeImageUrl(article.imageUrl) : getDefaultImage('news')}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          </div>
        )}

        <section className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-12 md:pt-24 pb-8 md:pb-12">
          <div className="flex items-start justify-between gap-4 mb-8">
            <Link
              to="/news"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('common.backToNews', { defaultValue: 'Back to News' })}
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
                      {t('newsArticlePage.adminEditor.title', { defaultValue: 'Edit Article' })}{' '}
                      <span className="text-muted-foreground text-sm font-normal">({locale.toUpperCase()})</span>
                    </DialogTitle>
                  </DialogHeader>

                  <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="news-edit-title">
                          {t('content.fields.title', { defaultValue: 'Title' })}
                        </Label>
                        <Input
                          id="news-edit-title"
                          value={draftTitle}
                          onChange={(e) => setDraftTitle(e.target.value)}
                          placeholder={t('content.placeholders.title', { defaultValue: 'Enter a title' })}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="news-edit-excerpt">
                          {t('content.fields.excerpt', { defaultValue: 'Excerpt' })}
                        </Label>
                        <Textarea
                          id="news-edit-excerpt"
                          value={draftExcerpt}
                          onChange={(e) => setDraftExcerpt(e.target.value)}
                          placeholder={t('content.placeholders.excerpt', { defaultValue: 'Short summary (optional)' })}
                          rows={3}
                        />
                      </div>

                      <ImageUpload
                        value={draftImageUrl}
                        onChange={setDraftImageUrl}
                        label={t('content.fields.imageUrl', { defaultValue: 'Featured Image' })}
                        disabled={saving}
                      />

                      <div className="grid gap-2">
                        <Label htmlFor="news-edit-tags">
                          {t('content.fields.tags', { defaultValue: 'Tags' })}
                        </Label>
                        <Input
                          id="news-edit-tags"
                          value={draftTags}
                          onChange={(e) => setDraftTags(e.target.value)}
                          placeholder={t('content.placeholders.tags', { defaultValue: 'Comma-separated (optional)' })}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="news-edit-content">
                          {t('content.fields.content', { defaultValue: 'Content' })}
                        </Label>
                        <Textarea
                          id="news-edit-content"
                          value={draftContent}
                          onChange={(e) => setDraftContent(e.target.value)}
                          placeholder={t('content.placeholders.content', { defaultValue: 'Write the article...' })}
                          rows={12}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-4">
                      {t('newsArticlePage.adminEditor.note', {
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
                        if (!article) return;
                        const nextTitle = draftTitle.trim();
                        const nextContent = draftContent.trim();
                        if (!nextTitle || !nextContent) {
                          toast.error(t('common.validationRequired', { defaultValue: 'Title and content are required.' }));
                          return;
                        }

                        setSaving(true);
                        try {
                          const nextImageUrl = draftImageUrl.trim() || null;

                          if (locale === 'en') {
                            await updatePost(article.id, {
                              title: nextTitle,
                              excerpt: draftExcerpt.trim() || undefined,
                              content: nextContent,
                              tags: draftTags.trim() || undefined,
                              imageUrl: nextImageUrl,
                            });
                          } else {
                            await upsertPostTranslation(article.id, locale, {
                              title: nextTitle,
                              excerpt: draftExcerpt.trim() || null,
                              content: nextContent,
                              tags: draftTags.trim() || null,
                              status: 'published',
                            });

                            if ((article.imageUrl || '') !== (nextImageUrl || '')) {
                              await updatePost(article.id, { imageUrl: nextImageUrl });
                            }
                          }

                          const refreshed = await getPostBySlug(article.slug);
                          setArticle(refreshed.data);
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

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Calendar className="w-4 h-4" />
            {formatPostDate(article.publishedAt || article.createdAt, i18n.language)}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>

          {article.excerpt && (
            <p className="text-base md:text-lg text-muted-foreground">{article.excerpt}</p>
          )}
        </section>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <MarkdownRenderer content={articleContent} />
      </article>

      {/* Related News CTA */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 border-t border-border">
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
