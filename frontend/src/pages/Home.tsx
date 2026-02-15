import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Loader2,
  CheckCircle,
  Shield,
  Users,
  Zap,
  Download,
} from "lucide-react";
import {
  getPosts,
  formatPostDate,
  getDefaultImage,
} from "@/api/posts";
import type { PostSummary } from "@/api/posts";
import { normalizeImageUrl } from "@/api/upload";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import SiteFooter from "@/components/SiteFooter";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const HOME_GRID_LIMIT = 16;

// Fallback data for when API fails or is empty
const fallbackBlogPosts: PostSummary[] = [
  {
    id: "fallback-1",
    title: "Visa Interview Tips: How to Prepare with Confidence",
    excerpt:
      "Practical tips to prepare for common interview questions, required documents, and a clear travel purpose.",
    imageUrl:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop&q=60",
    tags: "Guide",
    publishedAt: new Date().toISOString(),
    slug: "visa-interview-tips",
    category: "blog" as const,
    authorName: "visamn",
    createdAt: new Date().toISOString(),
  },
];

const fallbackNewsItems: PostSummary[] = [
  {
    id: "fallback-news-1",
    title: "Stay tuned for the latest news and updates",
    excerpt:
      "Check back soon for visa policy updates from embassies, consulates, and immigration services.",
    imageUrl:
      "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&auto=format&fit=crop&q=60",
    publishedAt: new Date().toISOString(),
    slug: "welcome",
    category: "news" as const,
    tags: null,
    authorName: "visamn",
    createdAt: new Date().toISOString(),
  },
];

const Home = () => {
  const { t, i18n } = useTranslation();
  const [blogPosts, setBlogPosts] = useState<PostSummary[]>([]);
  const [newsItems, setNewsItems] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIosInstallable, setIsIosInstallable] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const [blogRes, newsRes] = await Promise.all([
          getPosts({ category: "blog", page: 1, limit: HOME_GRID_LIMIT, locale: i18n.language }),
          getPosts({ category: "news", page: 1, limit: HOME_GRID_LIMIT, locale: i18n.language }),
        ]);

        setBlogPosts(blogRes.data.length > 0 ? blogRes.data : fallbackBlogPosts);
        setNewsItems(newsRes.data.length > 0 ? newsRes.data : fallbackNewsItems);

      } catch (err) {
        console.error("Failed to fetch home content:", err);
        setBlogPosts(fallbackBlogPosts);
        setNewsItems(fallbackNewsItems);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [i18n.language]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsInstalled(standalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    setIsIosInstallable(isIos && !standalone);

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isInstalled) return;

    if (deferredInstallPrompt) {
      await deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredInstallPrompt(null);
        toast.success(
          t("home.install.success", {
            defaultValue: "App added. You can now open Visamn from your home screen.",
          })
        );
      }
      return;
    }

    if (isIosInstallable) {
      toast.message(
        t("home.install.iosTitle", { defaultValue: "Install on iPhone" }),
        {
          description: t("home.install.iosSteps", {
            defaultValue: "Tap Share in Safari, then choose 'Add to Home Screen'.",
          }),
        }
      );
      return;
    }

    toast.message(
      t("home.install.unavailableTitle", { defaultValue: "Install option not available" }),
      {
        description: t("home.install.unavailableDesc", {
          defaultValue:
            "Open this site in Safari or Chrome and use browser menu → Add to Home Screen.",
        }),
      }
    );
  };

  const features = [
    {
      icon: Shield,
      title: t("home.features.secure.title"),
      description: t("home.features.secure.description"),
    },
    {
      icon: Zap,
      title: t("home.features.fast.title"),
      description: t("home.features.fast.description"),
    },
    {
      icon: CheckCircle,
      title: t("home.features.errorPrevention.title"),
      description: t("home.features.errorPrevention.description"),
    },
    {
      icon: Users,
      title: t("home.features.support.title"),
      description: t("home.features.support.description"),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Hero */}
      <section className="py-8 md:py-10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-[1.1]">
              {t("home.hero.titleLine1")}
              <span className="block text-muted-foreground">
                {t("home.hero.titleLine2")}
              </span>
              {t("home.hero.titleLine3")}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed">
              {t("home.hero.subtitle")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="px-8 font-semibold">
                <Link to="/login" className="gap-2">
                  {t("home.hero.cta")}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              {!isInstalled && (
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="px-8 font-semibold"
                  onClick={() => void handleInstallClick()}
                >
                  <Download className="w-5 h-5 mr-2" />
                  {t("home.install.cta", { defaultValue: "Install App" })}
                </Button>
              )}
              <Button
                asChild
                variant="outline"
                size="lg"
                className="px-8 font-semibold"
              >
                <Link to="/learn-more">{t("home.hero.learnMore")}</Link>
              </Button>
            </div>
            {!isInstalled && (
              <p className="mt-3 text-sm text-muted-foreground">
                {t("home.install.pitch", {
                  defaultValue:
                    "Install for faster access, one-tap tracking, and instant support updates.",
                })}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Features Cards */}
      <section className="py-10 md:py-14 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-card border-border hover:bg-secondary/40 transition-colors duration-200 group"
              >
                <CardContent className="p-4 md:p-6">
                  <div className="w-9 h-9 md:w-10 md:h-10 bg-secondary rounded-lg flex items-center justify-center mb-3 md:mb-4">
                    <feature.icon className="w-4 h-4 md:w-5 md:h-5 text-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-base md:text-lg">
                    {feature.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      <section className="py-12 md:py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {t("home.featuredArticles.title")}
              </h2>
              <p className="text-muted-foreground">
                {t("home.featuredArticles.subtitle")}
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden md:flex">
              <Link to="/blog" className="gap-2">
                {t("common.viewAll")}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : blogPosts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-5">
              {blogPosts.slice(0, HOME_GRID_LIMIT).map((item) => (
                <article key={item.id} className="group">
                  <Link to={`/blog/${item.slug}`} className="block">
                    <div className="relative aspect-square overflow-hidden rounded-lg mb-2 md:mb-3">
                      <img
                        src={item.imageUrl ? normalizeImageUrl(item.imageUrl) : getDefaultImage("blog")}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4">
                        <h3 className="text-xs md:text-sm font-medium text-white line-clamp-2 group-hover:text-gray-300 transition-colors">
                          {item.title}
                        </h3>
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
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                {t("home.featuredArticles.noPosts")}
              </p>
            </Card>
          )}
        </div>
      </section>

      {/* News Grid Section */}
      <section className="py-12 md:py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {t("home.latestNews.title")}
              </h2>
              <p className="text-muted-foreground">
                {t("home.latestNews.subtitle")}
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden md:flex">
              <Link to="/news" className="gap-2">
                {t("common.viewAll")}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : newsItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-5">
              {newsItems.slice(0, HOME_GRID_LIMIT).map((item) => (
                <article key={item.id} className="group">
                  <Link to={`/news/${item.slug}`} className="block">
                    <div className="relative aspect-square overflow-hidden rounded-lg mb-2 md:mb-3">
                      <img
                        src={item.imageUrl ? normalizeImageUrl(item.imageUrl) : getDefaultImage("news")}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4">
                        <h3 className="text-xs md:text-sm font-medium text-white line-clamp-2 group-hover:text-gray-300 transition-colors">
                          {item.title}
                        </h3>
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
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                {t("home.latestNews.noNews")}
              </p>
            </Card>
          )}
        </div>
      </section>

      <SiteFooter
        links={[
          { to: "/about", label: t("footer.links.about") },
          { to: "/blog", label: t("nav.blog") },
          { to: "/news", label: t("home.news") },
          { to: "/learn-more", label: t("home.hero.learnMore") },
          { to: "/flight", label: t("nav.flight", { defaultValue: "Flight" }) },
          { to: "/insurance", label: t("nav.insurance", { defaultValue: "Insurance" }) },
          { to: "/help-center", label: t("nav.helpCenter", { defaultValue: "Help Center" }) },
          { to: "/q-and-a", label: t("nav.qAndA", { defaultValue: "Q&A" }) },
          { to: "/feedback", label: t("nav.feedback", { defaultValue: "Feedback" }) },
        ]}
      />
    </div>
  );
};

export default Home;
