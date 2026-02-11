import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X } from "lucide-react";
import api from "@/api/client";
import { getFallbackImageUrl, getFullImageUrl, uploadImage } from "@/api/upload";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Placeholder images - will be replaced with API/CMS data later
const galleryImages = [
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
  src: string;
  alt: string;
  category: string;
};

const Gallery = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [uploadedImages, setUploadedImages] = useState<GalleryItem[] | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const fetchPublicGallery = useCallback(async () => {
    const res = await api.get("/api/upload/public-gallery");
    const images = res.data?.data?.images;
    if (!Array.isArray(images)) return [];

    return images.map((img: any) => {
      const filename = String(img?.filename || "");
      const url = String(img?.url || "");
      return {
        id: filename || url || crypto.randomUUID(),
        src: getFullImageUrl(url),
        alt: filename || t("gallery.uploadedImage", "Uploaded image"),
        category: "uploads",
      } satisfies GalleryItem;
    });
  }, [t]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const mapped = await fetchPublicGallery();
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
  }, [fetchPublicGallery]);

  const usingUploads = (uploadedImages?.length ?? 0) > 0;

  useEffect(() => {
    if (usingUploads) {
      setSelectedCategory("all");
    }
  }, [usingUploads]);

  const categories = useMemo(() => {
    return usingUploads ? ["all"] : ["all", "destinations", "nature", "landmarks", "travel"];
  }, [usingUploads]);

  const galleryItems: GalleryItem[] = usingUploads
    ? uploadedImages || []
    : (galleryImages as unknown as GalleryItem[]);

  const filteredImages =
    selectedCategory === "all"
      ? galleryItems
      : galleryItems.filter((img) => img.category === selectedCategory);

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
        toast.success(`Published ${successCount} photo${successCount > 1 ? "s" : ""}`);
      } else {
        toast.error("Failed to publish photos");
      }

      const mapped = await fetchPublicGallery();
      setUploadedImages(mapped);
    } catch (error: any) {
      toast.error(error?.message || "Failed to publish photos");
    } finally {
      setIsPublishing(false);
      event.target.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      {/* Header Section */}
      <section className="py-12 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center animate-fade-in-up">
            <Badge variant="secondary" className="mb-4">
              {t("gallery.badge", "Explore")}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t("gallery.title", "Travel Gallery")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t(
                "gallery.subtitle",
                "Discover the beauty of destinations awaiting your journey to the United States"
              )}
            </p>

            {user?.role === "ADMIN" && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <input
                  ref={uploadInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePublishPhotos}
                  disabled={isPublishing}
                />
                <Button
                  onClick={() => uploadInputRef.current?.click()}
                  disabled={isPublishing}
                  className="min-w-[180px]"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Publish Photos
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {t(
                    `gallery.categories.${category}`,
                    category.charAt(0).toUpperCase() + category.slice(1)
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image, index) => (
              <Card
                key={image.id}
                className={`overflow-hidden cursor-pointer group hover-lift animate-fade-in-up`}
                style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
                onClick={() => setSelectedImage(image)}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium">
                      {t("gallery.viewImage", "View")}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground truncate">
                    {image.alt}
                  </p>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {image.category === "uploads"
                      ? t("gallery.categories.uploads", "Uploads")
                      : image.category}
                  </Badge>
                </div>
              </Card>
            ))}
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
            aria-label="Close"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={selectedImage.src}
            alt={selectedImage.alt}
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
            <p className="text-lg font-medium">{selectedImage.alt}</p>
            <Badge variant="secondary" className="mt-2">
              {selectedImage.category}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
