import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X, Pencil, Trash2, Globe, RefreshCcw } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import api from "@/api/client";
import {
  deleteImage,
  getAdminGallery,
  getFallbackImageUrl,
  getFullImageUrl,
  getPublicGallery,
  setGalleryImagePublish,
  updateGalleryImageMeta,
  uploadImage,
  type GalleryImageItem,
} from "@/api/upload";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type DemoSettingItem = {
  id?: number;
  src?: string;
  alt?: string;
  title?: string;
  category?: string;
  tags?: string[];
  description?: string;
  published?: boolean;
};

const LEGACY_GALLERY_HERO_URL =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1800&auto=format&fit=crop&q=80";
const RECOMMENDED_GALLERY_HERO_URL =
  "https://images.unsplash.com/photo-1483546416237-76fd26bbcdd1?w=1800&auto=format&fit=crop&q=80";

// Demo gallery images shown by default
const defaultGalleryImages: DemoSettingItem[] = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop&q=80",
    alt: "Airplane wing over clouds",
    category: "travel",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800&auto=format&fit=crop&q=80",
    alt: "US Capitol Building",
    category: "destinations",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800&auto=format&fit=crop&q=80",
    alt: "New York City skyline",
    category: "destinations",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&auto=format&fit=crop&q=80",
    alt: "Golden Gate Bridge",
    category: "destinations",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&auto=format&fit=crop&q=80",
    alt: "Grand Canyon",
    category: "nature",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&auto=format&fit=crop&q=80",
    alt: "Statue of Liberty",
    category: "landmarks",
  },
  {
    id: 7,
    src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80",
    alt: "Los Angeles downtown",
    category: "destinations",
  },
  {
    id: 8,
    src: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&auto=format&fit=crop&q=80",
    alt: "City at night",
    category: "destinations",
  },
  {
    id: 9,
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=80",
    alt: "Mountain landscape",
    category: "nature",
  },
  {
    id: 10,
    src: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&auto=format&fit=crop&q=80",
    alt: "City street view",
    category: "destinations",
  },
  {
    id: 11,
    src: "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=800&auto=format&fit=crop&q=80",
    alt: "Las Vegas strip",
    category: "destinations",
  },
  {
    id: 12,
    src: "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&auto=format&fit=crop&q=80",
    alt: "Travel adventure",
    category: "travel",
  },
  {
    id: 13,
    src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop&q=80",
    alt: "Lake and mountains",
    category: "nature",
  },
  {
    id: 14,
    src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80",
    alt: "Scenic cityscape",
    category: "destinations",
  },
  {
    id: 15,
    src: "https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=800&auto=format&fit=crop&q=80",
    alt: "Travel passport and map",
    category: "travel",
  },
];

type GalleryItem = {
  id: string | number;
  filename?: string;
  isDemo?: boolean;
  demoId?: number;
  src: string;
  alt: string;
  title: string;
  category: string;
  tags: string[];
  description?: string;
  published?: boolean;
  uploadedAt?: string;
};

const mapDemoSettingsToGalleryItems = (items?: DemoSettingItem[]): GalleryItem[] => {
  const source = Array.isArray(items) && items.length > 0 ? items : defaultGalleryImages;
  return source.map((item, index) => {
    const demoId = Number(item.id || index + 1);
    const title = String(item.title || item.alt || `Demo image ${demoId}`);
    return {
      id: `demo-${demoId}`,
      demoId,
      isDemo: true,
      src: String(item.src || ""),
      alt: String(item.alt || title),
      title,
      category: String(item.category || "general").toLowerCase(),
      tags: Array.isArray(item.tags) ? item.tags.map((tag) => String(tag)) : [],
      description: String(item.description || ""),
      published: item.published !== false,
    };
  }).filter((item) => Boolean(item.src));
};

const Gallery = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { settings, refresh: refreshSiteSettings } = useSiteSettings();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [demoImages, setDemoImages] = useState<GalleryItem[]>(() =>
    mapDemoSettingsToGalleryItems(settings.galleryDemoItems as DemoSettingItem[])
  );
  const [uploadedImages, setUploadedImages] = useState<GalleryItem[] | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingMeta, setIsSavingMeta] = useState(false);
  const [replacingImage, setReplacingImage] = useState<GalleryItem | null>(null);
  const [isReplacingPhoto, setIsReplacingPhoto] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    category: "",
    tags: "",
    description: "",
    published: true,
  });
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const getCategoryLabel = useCallback(
    (category: string) =>
      t(`gallery.categories.${category}`, {
        defaultValue: category.charAt(0).toUpperCase() + category.slice(1),
      }),
    [t]
  );

  const getImageAltText = useCallback(
    (image: GalleryItem) => {
      if (image.isDemo && image.demoId) {
        return t(`gallery.placeholderAlts.${image.demoId}`, { defaultValue: image.alt });
      }
      return image.alt;
    },
    [t]
  );

  const mapGalleryItems = useCallback(
    (images: GalleryImageItem[]) =>
      images.map((img) => {
        const filename = String(img?.filename || "");
        const url = String(img?.url || "");
        const title = String(img?.title || filename || t("gallery.uploadedImage", { defaultValue: "Uploaded image" }));
        const category = String(img?.category || "general");
        const tags = Array.isArray(img?.tags) ? img.tags.map((tag) => String(tag)) : [];
        return {
          id: filename || url || crypto.randomUUID(),
          filename: filename || undefined,
          src: getFullImageUrl(url),
          alt: title,
          title,
          category,
          tags,
          description: String(img?.description || ""),
          published: img?.published !== false,
          uploadedAt: img?.uploadedAt,
        } satisfies GalleryItem;
      }),
    [t]
  );

  const fetchGallery = useCallback(async () => {
    try {
      if (user?.role === "ADMIN") {
        const { images } = await getAdminGallery();
        return mapGalleryItems(images);
      }
      const { images } = await getPublicGallery();
      return mapGalleryItems(images);
    } catch (error) {
      if (user?.role === "ADMIN") {
        const { images } = await getPublicGallery();
        return mapGalleryItems(images);
      }
      throw error;
    }
  }, [mapGalleryItems, user?.role]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const mapped = await fetchGallery();
        if (!cancelled) setUploadedImages(mapped);
      } catch {
        // If the backend gallery isn't configured yet, keep placeholders.
        if (!cancelled) setUploadedImages([]);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [fetchGallery]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void refreshSiteSettings();
      void fetchGallery()
        .then((mapped) => setUploadedImages(mapped))
        .catch(() => {
          // Ignore transient poll errors.
        });
    }, 20_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchGallery, refreshSiteSettings]);

  useEffect(() => {
    setDemoImages(mapDemoSettingsToGalleryItems(settings.galleryDemoItems as DemoSettingItem[]));
  }, [settings.galleryDemoItems]);

  const saveDemoItemsToServer = useCallback(
    async (nextDemoImages: GalleryItem[]) => {
      if (user?.role !== "ADMIN") return;

      const payloadDemo = nextDemoImages
        .map((item, index) => ({
          id: Number(item.demoId || index + 1),
          src: String(item.src || "").trim(),
          alt: String(item.alt || item.title || `Demo image ${index + 1}`).trim(),
          title: String(item.title || item.alt || `Demo image ${index + 1}`).trim(),
          category: String(item.category || "general").trim().toLowerCase(),
          tags: Array.isArray(item.tags) ? item.tags.map((tag) => String(tag).trim()).filter(Boolean) : [],
          description: String(item.description || "").trim(),
          published: item.published !== false,
        }))
        .filter((item) => Boolean(item.src) && Boolean(item.alt))
        .slice(0, 120);

      const currentRes = await api.get("/api/admin/site-settings");
      const currentSettings = currentRes.data?.data || settings;

      await api.put("/api/admin/site-settings", {
        ...currentSettings,
        galleryDemoItems: payloadDemo,
      });
      await refreshSiteSettings();
    },
    [refreshSiteSettings, settings, user?.role]
  );

  const usingUploads = (uploadedImages?.length ?? 0) > 0;

  const categories = useMemo(() => {
    const source = [...demoImages, ...(uploadedImages || [])];
    if (!source.length) return ["all", "destinations", "nature", "landmarks", "travel"];
    const dynamic = Array.from(
      new Set(
        source
          .map((img) => (img.category || "").trim().toLowerCase())
          .filter(Boolean)
      )
    );
    return ["all", ...dynamic];
  }, [demoImages, uploadedImages]);

  useEffect(() => {
    if (!categories.includes(selectedCategory)) {
      setSelectedCategory("all");
    }
  }, [categories, selectedCategory]);

  const galleryItems: GalleryItem[] = useMemo(
    () => [...(uploadedImages || []), ...demoImages],
    [demoImages, uploadedImages]
  );

  const visibleGalleryItems = useMemo(
    () =>
      user?.role === "ADMIN"
        ? galleryItems
        : galleryItems.filter((item) => item.published !== false),
    [galleryItems, user?.role]
  );

  const filteredImages =
    selectedCategory === "all"
      ? visibleGalleryItems
      : visibleGalleryItems.filter((img) => img.category === selectedCategory);
  const selectedImageAlt = selectedImage ? getImageAltText(selectedImage) : "";
  const selectedImageCategory = selectedImage ? getCategoryLabel(selectedImage.category) : "";
  const galleryHeroBackground =
    !settings.galleryHeroImageUrl || settings.galleryHeroImageUrl === LEGACY_GALLERY_HERO_URL
      ? RECOMMENDED_GALLERY_HERO_URL
      : settings.galleryHeroImageUrl;
  const topicChipClass = (active: boolean) =>
    active
      ? "px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full"
      : "px-3 py-1 text-xs font-medium bg-secondary/70 text-muted-foreground rounded-full hover:bg-primary/5 hover:text-primary transition-colors";

  const handlePublishPhotos = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    setIsPublishing(true);
    try {
      const results = await Promise.all(
        Array.from(files).map(async (file) => {
          try {
            await uploadImage(file);
            return true;
          } catch {
            return false;
          }
        })
      );

      const successCount = results.filter(Boolean).length;
      if (successCount > 0) {
        toast.success(
          successCount > 1
            ? t("gallery.publishSuccessMany", {
                count: successCount,
                defaultValue: `Published ${successCount} photos`,
              })
            : t("gallery.publishSuccessOne", { defaultValue: "Published 1 photo" })
        );
      } else {
        toast.error(t("gallery.publishError", { defaultValue: "Failed to publish photos" }));
      }

      const mapped = await fetchGallery();
      setUploadedImages(mapped);
    } catch (error: any) {
      toast.error(error?.message || t("gallery.publishError", { defaultValue: "Failed to publish photos" }));
    } finally {
      setIsPublishing(false);
      event.target.value = "";
    }
  };

  const openEditDialog = (image: GalleryItem) => {
    if (user?.role !== "ADMIN") return;
    setEditingImage(image);
    setEditForm({
      title: image.title || image.alt || "",
      category: image.category || "general",
      tags: Array.isArray(image.tags) ? image.tags.join(", ") : "",
      description: image.description || "",
      published: image.published !== false,
    });
    setIsEditing(true);
  };

  const handleSaveMeta = async () => {
    if (!editingImage) return;
    setIsSavingMeta(true);
    try {
      if (editingImage.isDemo) {
        const normalizedTags = editForm.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
          .slice(0, 20);
        const previousDemoImages = [...demoImages];
        const nextDemoImages = previousDemoImages.map((item) =>
          item.id === editingImage.id
            ? {
                ...item,
                title: editForm.title || item.title,
                alt: editForm.title || item.alt,
                category: (editForm.category || item.category || "general").trim().toLowerCase(),
                tags: normalizedTags,
                description: editForm.description || "",
                published: editForm.published,
              }
            : item
        );
        setDemoImages(nextDemoImages);

        try {
          await saveDemoItemsToServer(nextDemoImages);
        } catch (error: any) {
          setDemoImages(previousDemoImages);
          throw error;
        }

        if (selectedImage?.id === editingImage.id) {
          const updatedImage = nextDemoImages.find((item) => item.id === editingImage.id);
          setSelectedImage((prev) =>
            updatedImage && prev ? { ...prev, ...updatedImage } : prev
          );
        }

        toast.success(t("gallery.metaSaved", { defaultValue: "Gallery image updated" }));
        setIsEditing(false);
        setEditingImage(null);
        return;
      }

      if (!editingImage.filename) return;

      const updated = await updateGalleryImageMeta(editingImage.filename, {
        title: editForm.title,
        category: editForm.category,
        tags: editForm.tags,
        description: editForm.description,
        published: editForm.published,
      });

      if (updated) {
        setUploadedImages((prev) =>
          (prev || []).map((item) =>
            item.filename === editingImage.filename
              ? {
                  ...item,
                  title: updated.title || item.title,
                  alt: updated.title || item.alt,
                  category: updated.category || item.category,
                  tags: Array.isArray(updated.tags) ? updated.tags : item.tags,
                  description: updated.description || "",
                  published: updated.published !== false,
                }
              : item
          )
        );
      } else {
        const mapped = await fetchGallery();
        setUploadedImages(mapped);
      }

      toast.success(t("gallery.metaSaved", { defaultValue: "Gallery image updated" }));
      setIsEditing(false);
      setEditingImage(null);
    } catch (error: any) {
      toast.error(error?.message || t("gallery.metaSaveError", { defaultValue: "Failed to save image details" }));
    } finally {
      setIsSavingMeta(false);
    }
  };

  const handleTogglePublish = async (image: GalleryItem) => {
    if (user?.role !== "ADMIN") return;
    const nextPublished = image.published === false;
    try {
      if (image.isDemo) {
        const previousDemoImages = [...demoImages];
        const nextDemoImages = previousDemoImages.map((item) =>
          item.id === image.id ? { ...item, published: nextPublished } : item
        );
        setDemoImages(nextDemoImages);

        try {
          await saveDemoItemsToServer(nextDemoImages);
        } catch (error: any) {
          setDemoImages(previousDemoImages);
          throw error;
        }

        if (selectedImage?.id === image.id) {
          setSelectedImage((prev) =>
            prev ? { ...prev, published: nextPublished } : prev
          );
        }
        toast.success(
          nextPublished
            ? t("gallery.nowPublished", { defaultValue: "Image published" })
            : t("gallery.nowDraft", { defaultValue: "Image moved to draft" })
        );
        return;
      }

      if (!image.filename) return;

      const updated = await setGalleryImagePublish(image.filename, nextPublished);
      if (updated) {
        setUploadedImages((prev) =>
          (prev || []).map((item) =>
            item.filename === image.filename
              ? { ...item, published: updated.published !== false }
              : item
          )
        );
      } else {
        const mapped = await fetchGallery();
        setUploadedImages(mapped);
      }
      toast.success(
        nextPublished
          ? t("gallery.nowPublished", { defaultValue: "Image published" })
          : t("gallery.nowDraft", { defaultValue: "Image moved to draft" })
      );
    } catch (error: any) {
      toast.error(error?.message || t("gallery.publishToggleError", { defaultValue: "Failed to update status" }));
    }
  };

  const handleDeleteImage = async (image: GalleryItem) => {
    if (user?.role !== "ADMIN") return;
    if (!window.confirm(t("gallery.deleteConfirm", { defaultValue: "Delete this image?" }))) return;
    try {
      if (image.isDemo) {
        const previousDemoImages = [...demoImages];
        const nextDemoImages = previousDemoImages.filter((item) => item.id !== image.id);
        setDemoImages(nextDemoImages);

        try {
          await saveDemoItemsToServer(nextDemoImages);
        } catch (error: any) {
          setDemoImages(previousDemoImages);
          throw error;
        }

        if (selectedImage?.id === image.id) {
          setSelectedImage(null);
        }
        toast.success(t("gallery.deleted", { defaultValue: "Image deleted" }));
        return;
      }

      if (!image.filename) return;

      await deleteImage(image.filename);
      setUploadedImages((prev) => (prev || []).filter((item) => item.filename !== image.filename));
      if (selectedImage?.filename === image.filename) {
        setSelectedImage(null);
      }
      toast.success(t("gallery.deleted", { defaultValue: "Image deleted" }));
    } catch (error: any) {
      toast.error(error?.message || t("gallery.deleteError", { defaultValue: "Failed to delete image" }));
    }
  };

  const triggerReplacePhoto = (image: GalleryItem) => {
    if (user?.role !== "ADMIN" || isReplacingPhoto) return;
    setReplacingImage(image);
    replaceInputRef.current?.click();
  };

  const handleReplacePhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || user?.role !== "ADMIN" || !replacingImage) {
      event.target.value = "";
      return;
    }

    setIsReplacingPhoto(true);

    try {
      const uploadResult = await uploadImage(file);
      const nextFilename = uploadResult?.data?.filename;
      const nextUrl = getFullImageUrl(uploadResult?.data?.url || "");
      if (!nextFilename) {
        throw new Error(t("gallery.replaceFailed", { defaultValue: "Failed to replace image" }));
      }

      if (replacingImage.isDemo) {
        const previousDemoImages = [...demoImages];
        const nextDemoImages = previousDemoImages.map((item) =>
          item.id === replacingImage.id
            ? {
                ...item,
                src: nextUrl || item.src,
                alt: replacingImage.title || replacingImage.alt,
                title: replacingImage.title || replacingImage.alt || item.title,
              }
            : item
        );
        setDemoImages(nextDemoImages);

        try {
          await saveDemoItemsToServer(nextDemoImages);
        } catch (error: any) {
          setDemoImages(previousDemoImages);
          throw error;
        }

        if (selectedImage?.id === replacingImage.id) {
          const updatedImage = nextDemoImages.find((item) => item.id === replacingImage.id);
          setSelectedImage((prev) =>
            updatedImage && prev ? { ...prev, ...updatedImage } : prev
          );
        }

        toast.success(t("gallery.replacedSuccess", { defaultValue: "Image replaced" }));
        return;
      }

      if (!replacingImage.filename) {
        throw new Error(t("gallery.replaceFailed", { defaultValue: "Failed to replace image" }));
      }

      await updateGalleryImageMeta(nextFilename, {
        title: replacingImage.title || replacingImage.alt,
        category: replacingImage.category,
        tags: replacingImage.tags,
        description: replacingImage.description,
        published: replacingImage.published !== false,
      });

      await deleteImage(replacingImage.filename);

      const mapped = await fetchGallery();
      setUploadedImages(mapped);

      if (selectedImage?.filename === replacingImage.filename) {
        const nextSelected = mapped.find((item) => item.filename === nextFilename);
        setSelectedImage(nextSelected || null);
      }

      toast.success(t("gallery.replacedSuccess", { defaultValue: "Image replaced" }));
    } catch (error: any) {
      toast.error(error?.message || t("gallery.replaceFailed", { defaultValue: "Failed to replace image" }));
    } finally {
      setReplacingImage(null);
      setIsReplacingPhoto(false);
      event.target.value = "";
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center opacity-[0.14]"
        style={{ backgroundImage: `url(${galleryHeroBackground})` }}
      />
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-background/70 via-background/90 to-background" />

      <PageHeader
        title={t("gallery.title", { defaultValue: "Travel Gallery" })}
        subtitle={t("gallery.subtitle", {
          defaultValue: "Discover the beauty of destinations awaiting your journey.",
        })}
        backgroundImageUrl={galleryHeroBackground}
        className="relative z-10 border-b-0"
        actions={
          user?.role === "ADMIN" ? (
            <>
              <input
                ref={uploadInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePublishPhotos}
                disabled={isPublishing}
              />
              <input
                ref={replaceInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleReplacePhoto}
                disabled={isReplacingPhoto}
              />
              <Button
                onClick={() => uploadInputRef.current?.click()}
                disabled={isPublishing}
                className="w-full sm:w-auto sm:min-w-[180px]"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("gallery.publishing", { defaultValue: "Publishing..." })}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {t("gallery.publishPhotos", { defaultValue: "Publish Photos" })}
                  </>
                )}
              </Button>
            </>
          ) : null
        }
      >
        {categories.length > 1 ? (
          <div className="flex flex-wrap items-center justify-start gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={topicChipClass(selectedCategory === category)}
              >
                {getCategoryLabel(category)}
              </button>
            ))}
            {usingUploads ? (
              <>
                <Badge variant="secondary" className="ml-auto">
                  {t("gallery.publishedCount", {
                    defaultValue: "Published: {{count}}",
                    count: (uploadedImages || []).filter((img) => img.published !== false).length,
                  })}
                </Badge>
                {user?.role === "ADMIN" ? (
                  <Badge variant="outline">
                    {t("gallery.draftCount", {
                      defaultValue: "Draft: {{count}}",
                      count: (uploadedImages || []).filter((img) => img.published === false).length,
                    })}
                  </Badge>
                ) : null}
              </>
            ) : null}
          </div>
        ) : null}
      </PageHeader>

      {/* Gallery Grid */}
      <section className="relative z-10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-2 min-[500px]:grid-cols-3 md:grid-cols-4 gap-2 md:gap-6">
                {filteredImages.map((image, index) => {
                  const localizedAlt = getImageAltText(image);
                  return (
                    <article key={image.id} className="group">
                      <div
                        className="block text-left w-full"
                        style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
                      >
                        <button
                          type="button"
                          className="block text-left w-full"
                          onClick={() => setSelectedImage(image)}
                        >
                    <div className="relative aspect-square overflow-hidden rounded-lg mb-2 md:mb-3">
                    <img
                      src={image.src}
                      alt={localizedAlt}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        const element = e.currentTarget as HTMLImageElement;
                        const fallback = getFallbackImageUrl(image.src);
                        if (element.dataset.fallbackApplied !== "1" && fallback && element.src !== fallback) {
                          element.dataset.fallbackApplied = "1";
                          element.src = fallback;
                          return;
                        }
                        element.style.display = "none";
                      }}
                    />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">
                          {image.category}
                        </span>
                        {image.published === false ? (
                          <span className="rounded-full bg-amber-500/80 px-2 py-0.5 text-[10px] text-black">
                            Draft
                          </span>
                        ) : null}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4">
                        <p className="text-xs md:text-sm font-medium text-white line-clamp-2 group-hover:text-gray-300 transition-colors">
                          {image.title || localizedAlt}
                        </p>
                      </div>
                    </div>
                        </button>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/80" />
                      {t("gallery.viewImage", { defaultValue: "View" })} 
                      {image.uploadedAt ? (
                        <span>
                          {new Date(image.uploadedAt).toLocaleDateString()}
                        </span>
                      ) : null}
                    </div>
                        {user?.role === "ADMIN" ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2"
                              onClick={() => openEditDialog(image)}
                            >
                              <Pencil className="w-3.5 h-3.5 mr-1" />
                              {t("common.edit", { defaultValue: "Edit" })}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2"
                              onClick={() => triggerReplacePhoto(image)}
                              disabled={isReplacingPhoto}
                            >
                              <RefreshCcw className="w-3.5 h-3.5 mr-1" />
                              {isReplacingPhoto && replacingImage?.id === image.id
                                ? t("gallery.replacing", { defaultValue: "Replacing..." })
                                : t("gallery.changePhoto", { defaultValue: "Change photo" })}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2"
                              onClick={() => handleTogglePublish(image)}
                            >
                              <Globe className="w-3.5 h-3.5 mr-1" />
                              {image.published === false
                                ? t("gallery.publish", { defaultValue: "Publish" })
                                : t("gallery.unpublish", { defaultValue: "Draft" })}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteImage(image)}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
                              {t("common.delete", { defaultValue: "Delete" })}
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>

          {/* Empty state */}
          {filteredImages.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                {t("gallery.noImages", "No images found in this category")}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setSelectedImage(null)}
            aria-label={t("common.close", { defaultValue: "Close" })}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={selectedImage.src}
            alt={selectedImageAlt}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onError={(e) => {
              const element = e.currentTarget as HTMLImageElement;
              const fallback = getFallbackImageUrl(selectedImage.src);
              if (element.dataset.fallbackApplied !== "1" && fallback && element.src !== fallback) {
                element.dataset.fallbackApplied = "1";
                element.src = fallback;
                return;
              }
              element.style.display = "none";
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-center">
            <p className="text-lg font-medium">{selectedImageAlt}</p>
            <p className="text-sm text-white/80 mt-1">{selectedImageCategory}</p>
            {user?.role === "ADMIN" ? (
              <div className="mt-3 flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditDialog(selectedImage);
                  }}
                >
                  <Pencil className="w-3.5 h-3.5 mr-1" />
                  {t("common.edit", { defaultValue: "Edit" })}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={isReplacingPhoto}
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerReplacePhoto(selectedImage);
                  }}
                >
                  <RefreshCcw className="w-3.5 h-3.5 mr-1" />
                  {isReplacingPhoto && replacingImage?.id === selectedImage.id
                    ? t("gallery.replacing", { defaultValue: "Replacing..." })
                    : t("gallery.changePhoto", { defaultValue: "Change photo" })}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleTogglePublish(selectedImage);
                  }}
                >
                  <Globe className="w-3.5 h-3.5 mr-1" />
                  {selectedImage.published === false
                    ? t("gallery.publish", { defaultValue: "Publish" })
                    : t("gallery.unpublish", { defaultValue: "Draft" })}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleDeleteImage(selectedImage);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  {t("common.delete", { defaultValue: "Delete" })}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      <Dialog
        open={isEditing}
        onOpenChange={(open) => {
          if (!open) setEditingImage(null);
          setIsEditing(open);
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("gallery.editImage", { defaultValue: "Edit Gallery Image" })}</DialogTitle>
            <DialogDescription>
              {t("gallery.editImageDescription", {
                defaultValue: "Update category, tags, and publish status for this image.",
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {t("gallery.titleField", { defaultValue: "Title" })}
              </p>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder={t("gallery.titlePlaceholder", { defaultValue: "Image title" })}
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {t("gallery.categoryField", { defaultValue: "Category" })}
              </p>
              <Input
                value={editForm.category}
                onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                placeholder={t("gallery.categoryPlaceholder", { defaultValue: "e.g. usa, japan, germany" })}
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {t("gallery.tagsField", { defaultValue: "Tags (comma separated)" })}
              </p>
              <Input
                value={editForm.tags}
                onChange={(e) => setEditForm((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder={t("gallery.tagsPlaceholder", { defaultValue: "visa, advice, embassy" })}
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {t("gallery.descriptionField", { defaultValue: "Description" })}
              </p>
              <Input
                value={editForm.description}
                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder={t("gallery.descriptionPlaceholder", { defaultValue: "Short context text" })}
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editForm.published}
                onChange={(e) => setEditForm((prev) => ({ ...prev, published: e.target.checked }))}
              />
              {t("gallery.publishedSwitch", { defaultValue: "Visible on public gallery" })}
            </label>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setEditingImage(null);
              }}
            >
              {t("common.cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button onClick={handleSaveMeta} disabled={isSavingMeta}>
              {isSavingMeta ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {t("common.save", { defaultValue: "Save" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;
