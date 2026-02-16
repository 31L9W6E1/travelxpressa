import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Save, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  createAdminSeoPage,
  deleteAdminSeoPage,
  getAdminSeoPages,
  getAdminSeoPageById,
  type SeoPageConfig,
  type SitemapChangefreq,
  type TwitterCard,
  updateAdminSeoPage,
} from '@/api/seo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const EMPTY_FORM = {
  slug: '/',
  title: '',
  metaDescription: '',
  canonicalUrl: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  twitterCard: 'summary_large_image' as TwitterCard,
  twitterTitle: '',
  twitterDescription: '',
  twitterImage: '',
  noindex: false,
  jsonLdCustom: '',
  sitemapPriority: '0.5',
  sitemapChangefreq: 'weekly' as SitemapChangefreq,
};

const CHANGEFREQ_OPTIONS: SitemapChangefreq[] = [
  'always',
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'never',
];

const TWITTER_CARD_OPTIONS: TwitterCard[] = ['summary', 'summary_large_image', 'app', 'player'];

const mapSeoToForm = (seo: SeoPageConfig) => ({
  slug: seo.slug,
  title: seo.title || '',
  metaDescription: seo.metaDescription || '',
  canonicalUrl: seo.canonicalUrl || '',
  ogTitle: seo.ogTitle || '',
  ogDescription: seo.ogDescription || '',
  ogImage: seo.ogImage || '',
  twitterCard: (seo.twitterCard || 'summary_large_image') as TwitterCard,
  twitterTitle: seo.twitterTitle || '',
  twitterDescription: seo.twitterDescription || '',
  twitterImage: seo.twitterImage || '',
  noindex: !!seo.noindex,
  jsonLdCustom: seo.jsonLdCustom || '',
  sitemapPriority: String(seo.sitemapPriority ?? 0.5),
  sitemapChangefreq: (seo.sitemapChangefreq || 'weekly') as SitemapChangefreq,
});

const SeoManager = () => {
  const [items, setItems] = useState<SeoPageConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const activeItem = useMemo(
    () => items.find((item) => item.id === selectedId) || null,
    [items, selectedId],
  );

  const fetchItems = async (query?: string) => {
    setLoading(true);
    try {
      const result = await getAdminSeoPages(query);
      setItems(result);
      if (!result.length) {
        setSelectedId(null);
      } else if (selectedId && !result.some((item) => item.id === selectedId)) {
        setSelectedId(result[0].id);
        setForm(mapSeoToForm(result[0]));
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load SEO pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectItem = async (id: string) => {
    setSelectedId(id);
    try {
      const detail = await getAdminSeoPageById(id);
      setForm(mapSeoToForm(detail));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load SEO item');
    }
  };

  const handleCreateNew = () => {
    setSelectedId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    const priority = Number(form.sitemapPriority);
    if (Number.isNaN(priority) || priority < 0 || priority > 1) {
      toast.error('Sitemap priority must be between 0 and 1');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        slug: form.slug,
        title: form.title,
        metaDescription: form.metaDescription,
        canonicalUrl: form.canonicalUrl,
        ogTitle: form.ogTitle,
        ogDescription: form.ogDescription,
        ogImage: form.ogImage,
        twitterCard: form.twitterCard,
        twitterTitle: form.twitterTitle,
        twitterDescription: form.twitterDescription,
        twitterImage: form.twitterImage,
        noindex: form.noindex,
        jsonLdCustom: form.jsonLdCustom,
        sitemapPriority: priority,
        sitemapChangefreq: form.sitemapChangefreq,
      };

      let saved: SeoPageConfig;
      if (selectedId) {
        saved = await updateAdminSeoPage(selectedId, payload);
        toast.success('SEO configuration updated');
      } else {
        saved = await createAdminSeoPage(payload);
        toast.success('SEO configuration created');
      }

      setSelectedId(saved.id);
      setForm(mapSeoToForm(saved));
      await fetchItems(search || undefined);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save SEO configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId || !activeItem) return;

    const confirmed = window.confirm(`Delete SEO config for ${activeItem.slug}?`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteAdminSeoPage(selectedId);
      toast.success('SEO configuration deleted');
      setSelectedId(null);
      setForm(EMPTY_FORM);
      await fetchItems(search || undefined);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete SEO configuration');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>SEO Manager</CardTitle>
          <CardDescription>
            Manage page-level metadata, Open Graph, Twitter cards, JSON-LD, and sitemap settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search slug"
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={() => void fetchItems(search || undefined)}>
              Search
            </Button>
            <Button variant="outline" onClick={handleCreateNew}>
              <Plus className="w-4 h-4 mr-1" />
              New
            </Button>
          </div>

          <div className="mt-4 border rounded-lg max-h-64 overflow-y-auto divide-y">
            {loading ? (
              <div className="p-4 text-sm text-muted-foreground">Loading SEO pages...</div>
            ) : items.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">No SEO records found.</div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void handleSelectItem(item.id)}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    selectedId === item.id ? 'bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                >
                  <p className="font-medium text-sm">{item.slug}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {item.title || item.metaDescription || 'No metadata set'}
                  </p>
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{selectedId ? 'Edit SEO Record' : 'Create SEO Record'}</CardTitle>
          <CardDescription>
            Slug should match your route path (for example: /learn-more or /news/article-slug).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seo-slug">Slug</Label>
              <Input
                id="seo-slug"
                value={form.slug}
                onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                placeholder="/learn-more"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo-canonical">Canonical URL</Label>
              <Input
                id="seo-canonical"
                value={form.canonicalUrl}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, canonicalUrl: event.target.value }))
                }
                placeholder="https://visamn.com/learn-more"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seo-title">Title</Label>
              <Input
                id="seo-title"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Page title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo-meta-description">Meta Description</Label>
              <Input
                id="seo-meta-description"
                value={form.metaDescription}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, metaDescription: event.target.value }))
                }
                placeholder="Meta description"
              />
            </div>
          </div>

          <Separator />

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seo-og-title">og:title</Label>
              <Input
                id="seo-og-title"
                value={form.ogTitle}
                onChange={(event) => setForm((prev) => ({ ...prev, ogTitle: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo-og-description">og:description</Label>
              <Input
                id="seo-og-description"
                value={form.ogDescription}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, ogDescription: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="seo-og-image">og:image</Label>
              <Input
                id="seo-og-image"
                value={form.ogImage}
                onChange={(event) => setForm((prev) => ({ ...prev, ogImage: event.target.value }))}
              />
            </div>
          </div>

          <Separator />

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seo-twitter-card">Twitter Card</Label>
              <Select
                value={form.twitterCard}
                onValueChange={(value: TwitterCard) => setForm((prev) => ({ ...prev, twitterCard: value }))}
              >
                <SelectTrigger id="seo-twitter-card">
                  <SelectValue placeholder="Select card type" />
                </SelectTrigger>
                <SelectContent>
                  {TWITTER_CARD_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo-twitter-title">twitter:title</Label>
              <Input
                id="seo-twitter-title"
                value={form.twitterTitle}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, twitterTitle: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo-twitter-description">twitter:description</Label>
              <Input
                id="seo-twitter-description"
                value={form.twitterDescription}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, twitterDescription: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo-twitter-image">twitter:image</Label>
              <Input
                id="seo-twitter-image"
                value={form.twitterImage}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, twitterImage: event.target.value }))
                }
              />
            </div>
          </div>

          <Separator />

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seo-sitemap-priority">Sitemap Priority (0 - 1)</Label>
              <Input
                id="seo-sitemap-priority"
                value={form.sitemapPriority}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, sitemapPriority: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo-sitemap-changefreq">Sitemap Changefreq</Label>
              <Select
                value={form.sitemapChangefreq}
                onValueChange={(value: SitemapChangefreq) =>
                  setForm((prev) => ({ ...prev, sitemapChangefreq: value }))
                }
              >
                <SelectTrigger id="seo-sitemap-changefreq">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {CHANGEFREQ_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">Noindex</p>
              <p className="text-sm text-muted-foreground">
                When enabled, this route will output noindex and be excluded from sitemap.
              </p>
            </div>
            <Switch
              checked={form.noindex}
              onCheckedChange={(checked) => setForm((prev) => ({ ...prev, noindex: checked }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-jsonld">Custom JSON-LD</Label>
            <Textarea
              id="seo-jsonld"
              value={form.jsonLdCustom}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, jsonLdCustom: event.target.value }))
              }
              rows={8}
              placeholder='{"@context":"https://schema.org","@type":"WebPage"}'
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSave} disabled={saving || deleting}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {selectedId ? 'Update SEO' : 'Create SEO'}
            </Button>
            {selectedId && (
              <Button variant="destructive" onClick={handleDelete} disabled={saving || deleting}>
                {deleting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Delete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeoManager;
