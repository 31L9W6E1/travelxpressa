import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, ChevronRight, Plane, Loader2, Shield, CheckCircle, Users, Zap } from "lucide-react";
import { getFeaturedContent, formatPostDate, calculateReadTime, getDefaultImage } from '@/api/posts';
import type { PostSummary } from '@/api/posts';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Fallback data for when API fails or is empty
const fallbackBlogPosts: PostSummary[] = [
  {
    id: 'fallback-1',
    title: "US Visa Interview Tips: What You Need to Know",
    excerpt: "Essential tips for acing your US visa interview. Learn about common questions, required documents, and how to make a strong impression.",
    imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop&q=60",
    tags: "Guide",
    publishedAt: new Date().toISOString(),
    slug: 'visa-interview-tips',
    category: 'blog' as const,
    authorName: 'TravelXpressa',
    createdAt: new Date().toISOString(),
  },
];

const fallbackNewsItems: PostSummary[] = [
  {
    id: 'fallback-news-1',
    title: "Stay tuned for the latest news and updates",
    excerpt: "Check back soon for news from the US Embassy and immigration services.",
    imageUrl: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&auto=format&fit=crop&q=60",
    publishedAt: new Date().toISOString(),
    slug: 'welcome',
    category: 'news' as const,
    tags: null,
    authorName: null,
    createdAt: new Date().toISOString(),
  },
];

const Home = () => {
  const [blogPosts, setBlogPosts] = useState<PostSummary[]>([]);
  const [newsItems, setNewsItems] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const content = await getFeaturedContent();
        setBlogPosts(content.blogPosts.length > 0 ? content.blogPosts : fallbackBlogPosts);
        setNewsItems(content.newsPosts.length > 0 ? content.newsPosts : fallbackNewsItems);
      } catch (err) {
        console.error('Failed to fetch featured content:', err);
        setBlogPosts(fallbackBlogPosts);
        setNewsItems(fallbackNewsItems);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is encrypted and never shared with third parties"
    },
    {
      icon: Zap,
      title: "Fast Processing",
      description: "Complete your DS-160 form in under 30 minutes"
    },
    {
      icon: CheckCircle,
      title: "Error Prevention",
      description: "Built-in validation catches mistakes before submission"
    },
    {
      icon: Users,
      title: "Expert Support",
      description: "24/7 assistance from visa application specialists"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-6">
                Trusted by 10,000+ Travelers
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Your Journey to the
                <span className="block text-muted-foreground">United States</span>
                Starts Here
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-xl">
                TravelXpressa simplifies the DS-160 visa application process. Expert guidance,
                real-time support, and a seamless experience from start to finish.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link to="/login" className="gap-2">
                    Start Your Application
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/learn-more">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stats Card */}
            <Card className="bg-secondary/50">
              <CardContent className="p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4">
                    <div className="text-4xl font-bold text-foreground mb-1">50K+</div>
                    <div className="text-sm text-muted-foreground">Applications Completed</div>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-4xl font-bold text-foreground mb-1">98%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-4xl font-bold text-foreground mb-1">24/7</div>
                    <div className="text-sm text-muted-foreground">Support Available</div>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-4xl font-bold text-foreground mb-1">4.9</div>
                    <div className="text-sm text-muted-foreground">Customer Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose TravelXpressa</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've helped thousands of travelers successfully complete their visa applications
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      <section className="py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Articles</h2>
              <p className="text-muted-foreground">Stay informed with our latest visa guides and updates</p>
            </div>
            <Button asChild variant="ghost" className="hidden md:flex">
              <Link to="/blog" className="gap-2">
                View All
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
                      src={blogPosts[0].imageUrl || getDefaultImage('blog')}
                      alt={blogPosts[0].title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {blogPosts[0].tags && (
                      <Badge className="absolute top-4 left-4">
                        {blogPosts[0].tags.split(',')[0]}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatPostDate(blogPosts[0].publishedAt || blogPosts[0].createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {calculateReadTime(blogPosts[0].excerpt || '')}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-muted-foreground transition-colors">
                      {blogPosts[0].title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2">{blogPosts[0].excerpt}</p>
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
                          src={post.imageUrl || getDefaultImage('blog')}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        {post.tags && (
                          <Badge variant="secondary" className="mb-2 text-xs">
                            {post.tags.split(',')[0]}
                          </Badge>
                        )}
                        <h3 className="font-semibold group-hover:text-muted-foreground transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatPostDate(post.publishedAt || post.createdAt)}
                        </p>
                      </div>
                    </Link>
                  </Card>
                ))}
                {blogPosts.length === 1 && (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">More articles coming soon</p>
                    <Button asChild variant="outline">
                      <Link to="/blog">Browse All Articles</Link>
                    </Button>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No blog posts available yet. Check back soon!</p>
            </Card>
          )}
        </div>
      </section>

      {/* News Grid Section */}
      <section className="py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Latest News</h2>
              <p className="text-muted-foreground">Updates from the US Embassy and immigration services</p>
            </div>
            <Button asChild variant="ghost" className="hidden md:flex">
              <Link to="/news" className="gap-2">
                View All
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
                        src={item.imageUrl || getDefaultImage('news')}
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
                        {formatPostDate(item.publishedAt || item.createdAt)}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No news available yet. Check back soon!</p>
            </Card>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <Card className="bg-secondary">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Visa Journey?</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of satisfied travelers who have successfully obtained their US visa through TravelXpressa.
              </p>
              <Button asChild size="lg">
                <Link to="/login" className="gap-2">
                  Get Started Today
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Plane className="w-6 h-6" />
              <span className="text-xl font-bold">TravelXpressa</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
              <Link to="/news" className="hover:text-foreground transition-colors">News</Link>
              <Link to="/learn-more" className="hover:text-foreground transition-colors">Learn More</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2024 TravelXpressa. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
