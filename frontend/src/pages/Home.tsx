import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  Clock,
  ChevronRight,
  Plane,
  Loader2,
  Shield,
  CheckCircle,
  Users,
  Zap,
  Bell,
} from "lucide-react";
import {
  getFeaturedContent,
  formatPostDate,
  calculateReadTime,
  getDefaultImage,
} from "@/api/posts";
import type { PostSummary } from "@/api/posts";
import { normalizeImageUrl } from "@/api/upload";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

// Default ticker items (shown while loading or if no news available)
const defaultTickerItems = [
  "🌍 Travel Advisory: Updated visa requirements for B1/B2 applicants - check our blog for details",
  "📋 DS-160 Processing: Average processing time reduced to 3 business days",
  "🇺🇸 US Embassy Ulaanbaatar: Visa interview appointments now available for March 2025",
  "🎉 New Feature: Track your application status in real-time through our dashboard",
  "⚡ Express Processing: Priority visa services now available for business travelers",
  "📅 Reminder: Check your passport validity - must be valid for 6 months beyond travel date",
];

// Fallback data for when API fails or is empty
const fallbackBlogPosts: PostSummary[] = [
  {
    id: "fallback-1",
    title: "US Visa Interview Tips: What You Need to Know",
    excerpt:
      "Essential tips for acing your US visa interview. Learn about common questions, required documents, and how to make a strong impression.",
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
      "Check back soon for news from the US Embassy and immigration services.",
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
  const [tickerItems, setTickerItems] = useState<string[]>(defaultTickerItems);
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

        // Build ticker from latest news posts
        if (content.newsPosts.length > 0) {
          const newsTickerItems = content.newsPosts.slice(0, 10).map((post) => {
            // Add emoji based on tags or default
            const emoji = getNewsEmoji(post.tags);
            return `${emoji} ${post.title}`;
          });
          // Only use news items if we have at least 3, otherwise mix with defaults
          if (newsTickerItems.length >= 3) {
            setTickerItems(newsTickerItems);
          } else {
            setTickerItems([...newsTickerItems, ...defaultTickerItems.slice(0, 6 - newsTickerItems.length)]);
          }
        }
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

  // Get emoji based on news tags
  const getNewsEmoji = (tags: string | null): string => {
    if (!tags) return "📰";
    const tagLower = tags.toLowerCase();
    if (tagLower.includes("travel") || tagLower.includes("advisory")) return "🌍";
    if (tagLower.includes("embassy") || tagLower.includes("consulate")) return "🏛️";
    if (tagLower.includes("visa")) return "🇺🇸";
    if (tagLower.includes("interview")) return "💼";
    if (tagLower.includes("urgent") || tagLower.includes("alert")) return "🚨";
    if (tagLower.includes("update") || tagLower.includes("new")) return "🎉";
    if (tagLower.includes("reminder") || tagLower.includes("deadline")) return "📅";
    if (tagLower.includes("processing") || tagLower.includes("status")) return "📋";
    if (tagLower.includes("express") || tagLower.includes("fast")) return "⚡";
    return "📰";
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
      {/* News Ticker - Glass morphism style */}
      <div className="fixed top-16 left-0 right-0 z-40 ticker-bar text-gray-300 overflow-hidden">
        <div className="flex items-center h-10">
          <div className="flex-shrink-0 px-4 bg-primary/20 backdrop-blur-sm h-full flex items-center gap-2 z-10 text-gray-300">
            <Bell className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-300">
              {t("home.news")}
            </span>
          </div>
          <div className="ticker-wrapper flex-1">
            <div className="animate-ticker">
              {/* First set of items */}
              {tickerItems.map((item, index) => (
                <span key={`a-${index}`} className="inline-flex items-center px-8 text-sm whitespace-nowrap text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-3"></span>
                  {item}
                </span>
              ))}
              {/* Duplicate set for seamless loop */}
              {tickerItems.map((item, index) => (
                <span key={`b-${index}`} className="inline-flex items-center px-8 text-sm whitespace-nowrap text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-3"></span>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section - Cloudflare inspired */}
      <section className="relative pt-32 pb-24 overflow-hidden">
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
                      1000K
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

      {/* Features Section */}
      <section className="py-20 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("home.features.title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("home.features.subtitle")}
            </p>
          </div>
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
      <section className="py-20 border-b border-border/50">
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
            <div className="grid md:grid-cols-2 gap-8">
              {/* Main Featured Post */}
              <Card className="overflow-hidden group">
                <Link to={`/blog/${blogPosts[0].slug}`} className="block">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={blogPosts[0].imageUrl ? normalizeImageUrl(blogPosts[0].imageUrl) : getDefaultImage("blog")}
                      alt={blogPosts[0].title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {blogPosts[0].tags && (
                      <Badge className="absolute top-4 left-4">
                        {blogPosts[0].tags.split(",")[0]}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatPostDate(
                          blogPosts[0].publishedAt || blogPosts[0].createdAt,
                          i18n.language,
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {t("content.readTime", {
                          defaultValue: "{{minutes}} min read",
                          minutes: calculateReadTime(blogPosts[0].excerpt || ""),
                        })}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-muted-foreground transition-colors">
                      {blogPosts[0].title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2">
                      {blogPosts[0].excerpt}
                    </p>
                  </CardContent>
                </Link>
              </Card>

              {/* Secondary Featured Posts */}
              <div className="space-y-4">
                {blogPosts.slice(1, 4).map((post) => (
                  <Card key={post.id} className="overflow-hidden group">
                    <Link to={`/blog/${post.slug}`} className="flex gap-4 p-4">
                      <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                        <img
                          src={post.imageUrl ? normalizeImageUrl(post.imageUrl) : getDefaultImage("blog")}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        {post.tags && (
                          <Badge variant="secondary" className="mb-2 text-xs">
                            {post.tags.split(",")[0]}
                          </Badge>
                        )}
                        <h3 className="font-semibold group-hover:text-muted-foreground transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatPostDate(
                            post.publishedAt || post.createdAt,
                            i18n.language,
                          )}
                        </p>
                      </div>
                    </Link>
                  </Card>
                ))}
                {blogPosts.length === 1 && (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">
                      {t("home.featuredArticles.moreComingSoon")}
                    </p>
                    <Button asChild variant="outline">
                      <Link to="/blog">
                        {t("home.featuredArticles.browseAll")}
                      </Link>
                    </Button>
                  </Card>
                )}
              </div>
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
      <section className="py-20 border-b border-border/50">
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
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={item.imageUrl ? normalizeImageUrl(item.imageUrl) : getDefaultImage("news")}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-sm font-medium text-white line-clamp-2">
                          {item.title}
                        </h3>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground">
                        {formatPostDate(
                          item.publishedAt || item.createdAt,
                          i18n.language,
                        )}
                      </p>
                    </CardContent>
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
      <footer className="border-t border-border py-12">
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
                to="/privacy"
                className="hover:text-foreground transition-colors"
              >
                {t("footer.links.privacy")}
              </Link>
              <Link
                to="/terms"
                className="hover:text-foreground transition-colors"
              >
                {t("footer.links.terms")}
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
