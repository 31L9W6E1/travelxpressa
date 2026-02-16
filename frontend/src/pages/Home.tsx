import { useEffect, useMemo, useState } from "react";
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
import { Calendar as AppointmentCalendar } from "@/components/ui/calendar";

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
  const isMongolian = i18n.resolvedLanguage?.toLowerCase().startsWith("mn") ?? false;
  const [blogPosts, setBlogPosts] = useState<PostSummary[]>([]);
  const [newsItems, setNewsItems] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIosInstallable, setIsIosInstallable] = useState(false);
  const appointmentCandidates = useMemo(() => {
    const now = new Date();
    const day = Math.min(now.getDate(), 26);
    const candidateDates = [
      new Date(now.getFullYear(), now.getMonth() + 2, day),
      new Date(now.getFullYear(), now.getMonth() + 2, Math.min(day + 10, 28)),
      new Date(now.getFullYear(), now.getMonth() + 3, day),
      new Date(now.getFullYear(), now.getMonth() + 3, Math.min(day + 10, 28)),
    ];

    return Array.from(new Map(candidateDates.map((item) => [item.toDateString(), item])).values());
  }, []);
  const [selectedAppointmentDate, setSelectedAppointmentDate] = useState<Date | undefined>(
    appointmentCandidates[0]
  );

  const formatAppointmentDate = (date: Date) =>
    new Intl.DateTimeFormat(i18n.language, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);

  const monthFormatter = new Intl.DateTimeFormat(i18n.language, { month: "long" });
  const appointmentMonthRange =
    appointmentCandidates.length >= 2
      ? `${monthFormatter.format(appointmentCandidates[0])} - ${monthFormatter.format(
          appointmentCandidates[appointmentCandidates.length - 1]
        )}`
      : "";

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
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(320px,390px)] items-start">
            <div className="max-w-3xl">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-[1.1]">
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
                <Button asChild variant="ghost" size="lg" className="px-6 font-semibold">
                  <Link to="/guide">{t("nav.guide", { defaultValue: "Step-by-step Guide" })}</Link>
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

            <div className="w-full lg:justify-self-end">
              <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/15 via-background to-background p-4 md:p-5 shadow-sm">
                <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-primary/20 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-primary/15 blur-2xl" />
                <div className="relative">
                  <div className="mb-3 md:mb-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
                      {isMongolian ? "АНУ-ЫН ЯРИЛЦЛАГЫН ЦАГ" : "U.S. APPOINTMENT OUTLOOK"}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <h3 className="text-base md:text-lg font-semibold text-foreground">
                        {isMongolian ? "Боломжит ярилцлагын цонх" : "Likely interview windows"}
                      </h3>
                      <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                        {appointmentMonthRange}
                      </span>
                    </div>
                  </div>

                  <AppointmentCalendar
                    mode="single"
                    selected={selectedAppointmentDate}
                    onSelect={setSelectedAppointmentDate}
                    defaultMonth={appointmentCandidates[0]}
                    captionLayout="dropdown"
                    className="mx-auto w-full max-w-[320px] rounded-xl border border-border bg-background/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] [--cell-size:2rem] sm:[--cell-size:2.2rem]"
                    classNames={{
                      root: "w-full",
                      month: "w-full",
                      table: "w-full",
                      dropdowns: "h-8 text-xs sm:text-sm",
                      caption_label: "text-xs sm:text-sm",
                      weekday: "text-[0.7rem] sm:text-[0.8rem]",
                    }}
                    modifiers={{ appointment: appointmentCandidates }}
                    modifiersClassNames={{
                      appointment:
                        "bg-primary/20 text-primary font-semibold rounded-md border border-primary/30",
                    }}
                  />

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {appointmentCandidates.map((date, index) => {
                      const active = selectedAppointmentDate?.toDateString() === date.toDateString();
                      return (
                        <button
                          key={date.toISOString()}
                          type="button"
                          onClick={() => setSelectedAppointmentDate(date)}
                          className={`rounded-lg border px-2.5 py-2 text-left transition-colors ${
                            active
                              ? "border-primary/50 bg-primary/15"
                              : "border-border bg-background/80 hover:border-primary/35 hover:bg-primary/5"
                          }`}
                        >
                          <p className="text-[11px] font-medium text-muted-foreground">
                            {isMongolian ? `Боломжит цонх ${index + 1}` : `Possible slot ${index + 1}`}
                          </p>
                          <p className="text-xs font-semibold text-foreground mt-0.5">
                            {formatAppointmentDate(date)}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                    {isMongolian
                      ? "Өнөөдрийн огноонд тулгуурлан АНУ-ын ярилцлагын боломжит 2-3 сарын цонхыг онцолж харууллаа. Бодит цаг нээлтийн өөрчлөлтийг баг маань өдөр бүр шалгаж, шуурхай захиалга хийж өгнө."
                      : "Based on today's date, this shows a likely 2-3 month U.S. interview window. Our team tracks real-time slot releases and books quickly when openings appear."}
                  </p>
                </div>
              </div>
            </div>
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
                className="group relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/15 via-background to-background shadow-sm transition-colors duration-200 hover:border-primary/45"
              >
                <CardContent className="p-4 md:p-6">
                  <div className="pointer-events-none absolute -top-7 -right-7 h-16 w-16 rounded-full bg-primary/15 blur-xl" />
                  <div className="pointer-events-none absolute -bottom-8 -left-8 h-16 w-16 rounded-full bg-primary/10 blur-xl" />
                  <div className="relative">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 md:mb-4">
                      <feature.icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 text-base md:text-lg">
                      {feature.title}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
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
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
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
            <div className="grid grid-cols-2 min-[500px]:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-5">
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
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
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
            <div className="grid grid-cols-2 min-[500px]:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-5">
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
