import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  Clock,
  ChevronRight,
  Plane,
  Loader2,
  CheckCircle,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import {
  getFeaturedContent,
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
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

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
    authorName: "TravelXpressa",
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
    authorName: null,
    createdAt: new Date().toISOString(),
  },
];

const Home = () => {
  const { t, i18n } = useTranslation();
  const [blogPosts, setBlogPosts] = useState<PostSummary[]>([]);
  const [newsItems, setNewsItems] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const content = await getFeaturedContent();
        setBlogPosts(
          content.blogPosts.length > 0 ? content.blogPosts : fallbackBlogPosts,
        );
        setNewsItems(
          content.newsPosts.length > 0 ? content.newsPosts : fallbackNewsItems,
        );

      } catch (err) {
        console.error("Failed to fetch featured content:", err);
        setBlogPosts(fallbackBlogPosts);
        setNewsItems(fallbackNewsItems);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [i18n.language]);

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
      {/* Hero Section - Cloudflare inspired */}
      <section className="relative pt-24 pb-24 overflow-hidden border-b border-dashed border-border/60">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <CheckCircle className="w-4 h-4" />
                {t("home.hero.trusted")}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
                {t("home.hero.titleLine1")}
                <span className="block cf-text-gradient">
                  {t("home.hero.titleLine2")}
                </span>
                {t("home.hero.titleLine3")}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed">
                {t("home.hero.subtitle")}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="px-8 cf-shadow font-semibold">
                  <Link to="/login" className="gap-2">
                    {t("home.hero.cta")}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="px-8 font-semibold border-2">
                  <Link to="/learn-more">{t("home.hero.learnMore")}</Link>
                </Button>
              </div>
            </div>

            {/* Stats Card - Cloudflare style */}
            <Card className="bg-card border-border shadow-xl animate-fade-in-up animation-delay-200">
              <CardContent className="p-8 md:p-10">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-5 rounded-xl bg-secondary/50">
                    <div className="text-4xl md:text-5xl font-bold cf-text-gradient mb-2">
                      1,000+
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      {t("home.stats.applicationsCompleted")}
                    </div>
                  </div>
                  <div className="text-center p-5 rounded-xl bg-secondary/50">
                    <div className="text-4xl md:text-5xl font-bold cf-text-gradient mb-2">
                      98%
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      {t("home.stats.successRate")}
                    </div>
                  </div>
                  <div className="text-center p-5 rounded-xl bg-secondary/50">
                    <div className="text-4xl md:text-5xl font-bold cf-text-gradient mb-2">
                      24/7
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      {t("home.stats.supportAvailable")}
                    </div>
                  </div>
                  <div className="text-center p-5 rounded-xl bg-secondary/50">
                    <div className="text-4xl md:text-5xl font-bold cf-text-gradient mb-2">
                      4.9
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      {t("home.stats.customerRating")}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Cards */}
      <section className="py-14 border-b border-dashed border-border/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-secondary/30 hover:bg-secondary/50 transition-all duration-200 hover-lift group"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      <section className="py-20 border-b border-dashed border-border/60">
        <div className="max-w-7xl mx-auto px-6">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {blogPosts.slice(0, 8).map((item) => (
                <Card key={item.id} className="overflow-hidden group">
                  <Link to={`/blog/${item.slug}`} className="block">
                    <div className="relative aspect-square overflow-hidden m-[1.5px] rounded-md">
                      <img
                        src={item.imageUrl ? normalizeImageUrl(item.imageUrl) : getDefaultImage("blog")}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1">
                        <h3 className="text-sm font-medium text-white line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-white/85">
                          {formatPostDate(
                            item.publishedAt || item.createdAt,
                            i18n.language,
                          )}
                        </p>
                      </div>
                    </div>
                  </Link>
                </Card>
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
      <section className="py-20 border-b border-dashed border-border/60">
        <div className="max-w-7xl mx-auto px-6">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {newsItems.slice(0, 8).map((item) => (
                <Card key={item.id} className="overflow-hidden group">
                  <Link to={`/news/${item.slug}`} className="block">
                    <div className="relative aspect-square overflow-hidden m-[1.5px] rounded-md">
                      <img
                        src={item.imageUrl ? normalizeImageUrl(item.imageUrl) : getDefaultImage("news")}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1">
                        <h3 className="text-sm font-medium text-white line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-white/85">
                          {formatPostDate(
                            item.publishedAt || item.createdAt,
                            i18n.language,
                          )}
                        </p>
                      </div>
                    </div>
                  </Link>
                </Card>
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

      {/* Footer */}
      <footer className="border-t border-dashed border-border/60 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Plane className="w-6 h-6" />
              <span className="text-xl font-bold">{t("footer.company")}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <Link
                to="/about"
                className="hover:text-foreground transition-colors"
              >
                {t("footer.links.about")}
              </Link>
              <Link
                to="/blog"
                className="hover:text-foreground transition-colors"
              >
                {t("nav.blog")}
              </Link>
              <Link
                to="/news"
                className="hover:text-foreground transition-colors"
              >
                {t("home.news")}
              </Link>
              <Link
                to="/learn-more"
                className="hover:text-foreground transition-colors"
              >
                {t("home.hero.learnMore")}
              </Link>
              <Link
                to="/flight"
                className="hover:text-foreground transition-colors"
              >
                {t("nav.flight", { defaultValue: "Flight" })}
              </Link>
              <Link
                to="/insurance"
                className="hover:text-foreground transition-colors"
              >
                {t("nav.insurance", { defaultValue: "Insurance" })}
              </Link>
              <Link
                to="/help-center"
                className="hover:text-foreground transition-colors"
              >
                {t("nav.helpCenter", { defaultValue: "Help Center" })}
              </Link>
              <Link
                to="/q-and-a"
                className="hover:text-foreground transition-colors"
              >
                {t("nav.qAndA", { defaultValue: "Q&A" })}
              </Link>
              <Link
                to="/feedback"
                className="hover:text-foreground transition-colors"
              >
                {t("nav.feedback", { defaultValue: "Feedback" })}
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2024 {t("footer.company")}. {t("footer.copyright")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
