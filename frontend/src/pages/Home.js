import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, ChevronRight, Plane, Loader2, Shield, CheckCircle, Users, Zap, Bell } from "lucide-react";
import { getFeaturedContent, formatPostDate, calculateReadTime, getDefaultImage } from '@/api/posts';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
// News ticker items - can be fetched from API or managed via CMS
const tickerItems = [
    "🇺🇸 US Embassy Ulaanbaatar: Visa interview appointments now available for March 2025",
    "📋 DS-160 Processing: Average processing time reduced to 3 business days",
    "🎉 New Feature: Track your application status in real-time through our dashboard",
    "⚡ Express Processing: Priority visa services now available for business travelers",
    "📅 Reminder: Check your passport validity - must be valid for 6 months beyond travel date",
    "🌍 Travel Advisory: Updated visa requirements for B1/B2 applicants - check our blog for details",
];
// Fallback data for when API fails or is empty
const fallbackBlogPosts = [
    {
        id: 'fallback-1',
        title: "US Visa Interview Tips: What You Need to Know",
        excerpt: "Essential tips for acing your US visa interview. Learn about common questions, required documents, and how to make a strong impression.",
        imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop&q=60",
        tags: "Guide",
        publishedAt: new Date().toISOString(),
        slug: 'visa-interview-tips',
        category: 'blog',
        authorName: 'TravelXpressa',
        createdAt: new Date().toISOString(),
    },
];
const fallbackNewsItems = [
    {
        id: 'fallback-news-1',
        title: "Stay tuned for the latest news and updates",
        excerpt: "Check back soon for news from the US Embassy and immigration services.",
        imageUrl: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&auto=format&fit=crop&q=60",
        publishedAt: new Date().toISOString(),
        slug: 'welcome',
        category: 'news',
        tags: null,
        authorName: null,
        createdAt: new Date().toISOString(),
    },
];
const Home = () => {
    const { t } = useTranslation();
    const [blogPosts, setBlogPosts] = useState([]);
    const [newsItems, setNewsItems] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchContent = async () => {
            try {
                const content = await getFeaturedContent();
                setBlogPosts(content.blogPosts.length > 0 ? content.blogPosts : fallbackBlogPosts);
                setNewsItems(content.newsPosts.length > 0 ? content.newsPosts : fallbackNewsItems);
            }
            catch (err) {
                console.error('Failed to fetch featured content:', err);
                setBlogPosts(fallbackBlogPosts);
                setNewsItems(fallbackNewsItems);
            }
            finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);
    const features = [
        {
            icon: Shield,
            title: t('home.features.secure.title'),
            description: t('home.features.secure.description')
        },
        {
            icon: Zap,
            title: t('home.features.fast.title'),
            description: t('home.features.fast.description')
        },
        {
            icon: CheckCircle,
            title: t('home.features.errorPrevention.title'),
            description: t('home.features.errorPrevention.description')
        },
        {
            icon: Users,
            title: t('home.features.support.title'),
            description: t('home.features.support.description')
        }
    ];
    return (_jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [_jsx("div", { className: "fixed top-20 right-4 z-50", children: _jsx(LanguageSwitcher, {}) }), _jsx("div", { className: "fixed top-16 left-0 right-0 z-40 bg-primary text-primary-foreground overflow-hidden", children: _jsxs("div", { className: "flex items-center h-10", children: [_jsxs("div", { className: "flex-shrink-0 px-4 bg-primary-foreground/10 h-full flex items-center gap-2", children: [_jsx(Bell, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm font-semibold", children: t('home.news') })] }), _jsx("div", { className: "flex-1 overflow-hidden", children: _jsx("div", { className: "animate-ticker whitespace-nowrap flex", children: [...tickerItems, ...tickerItems].map((item, index) => (_jsx("span", { className: "inline-block px-8 text-sm", children: item }, index))) }) })] }) }), _jsx("section", { className: "relative pt-32 pb-16 border-b border-border", children: _jsx("div", { className: "max-w-7xl mx-auto px-6", children: _jsxs("div", { className: "grid lg:grid-cols-2 gap-12 items-center", children: [_jsxs("div", { children: [_jsx(Badge, { variant: "secondary", className: "mb-6", children: t('home.hero.trusted') }), _jsxs("h1", { className: "text-4xl md:text-6xl font-bold tracking-tight mb-6", children: [t('home.hero.titleLine1'), _jsx("span", { className: "block text-muted-foreground", children: t('home.hero.titleLine2') }), t('home.hero.titleLine3')] }), _jsx("p", { className: "text-xl text-muted-foreground mb-8 max-w-xl", children: t('home.hero.subtitle') }), _jsxs("div", { className: "flex flex-wrap gap-4", children: [_jsx(Button, { asChild: true, size: "lg", children: _jsxs(Link, { to: "/login", className: "gap-2", children: [t('home.hero.cta'), _jsx(ArrowRight, { className: "w-5 h-5" })] }) }), _jsx(Button, { asChild: true, variant: "outline", size: "lg", children: _jsx(Link, { to: "/learn-more", children: t('home.hero.learnMore') }) })] })] }), _jsx(Card, { className: "bg-secondary/50", children: _jsx(CardContent, { className: "p-8", children: _jsxs("div", { className: "grid grid-cols-2 gap-6", children: [_jsxs("div", { className: "text-center p-4", children: [_jsx("div", { className: "text-4xl font-bold text-foreground mb-1", children: "50K+" }), _jsx("div", { className: "text-sm text-muted-foreground", children: t('home.stats.applicationsCompleted') })] }), _jsxs("div", { className: "text-center p-4", children: [_jsx("div", { className: "text-4xl font-bold text-foreground mb-1", children: "98%" }), _jsx("div", { className: "text-sm text-muted-foreground", children: t('home.stats.successRate') })] }), _jsxs("div", { className: "text-center p-4", children: [_jsx("div", { className: "text-4xl font-bold text-foreground mb-1", children: "24/7" }), _jsx("div", { className: "text-sm text-muted-foreground", children: t('home.stats.supportAvailable') })] }), _jsxs("div", { className: "text-center p-4", children: [_jsx("div", { className: "text-4xl font-bold text-foreground mb-1", children: "4.9" }), _jsx("div", { className: "text-sm text-muted-foreground", children: t('home.stats.customerRating') })] })] }) }) })] }) }) }), _jsx("section", { className: "py-16 border-b border-border", children: _jsxs("div", { className: "max-w-7xl mx-auto px-6", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h2", { className: "text-3xl font-bold mb-4", children: t('home.features.title') }), _jsx("p", { className: "text-muted-foreground max-w-2xl mx-auto", children: t('home.features.subtitle') })] }), _jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-4 gap-6", children: features.map((feature, index) => (_jsx(Card, { className: "bg-secondary/30 hover:bg-secondary/50 transition-colors", children: _jsxs(CardContent, { className: "p-6", children: [_jsx("div", { className: "w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center mb-4", children: _jsx(feature.icon, { className: "w-6 h-6" }) }), _jsx("h3", { className: "font-semibold text-foreground mb-2", children: feature.title }), _jsx("p", { className: "text-sm text-muted-foreground", children: feature.description })] }) }, index))) })] }) }), _jsx("section", { className: "py-16 border-b border-border", children: _jsxs("div", { className: "max-w-7xl mx-auto px-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-bold mb-2", children: t('home.featuredArticles.title') }), _jsx("p", { className: "text-muted-foreground", children: t('home.featuredArticles.subtitle') })] }), _jsx(Button, { asChild: true, variant: "ghost", className: "hidden md:flex", children: _jsxs(Link, { to: "/blog", className: "gap-2", children: [t('common.viewAll'), _jsx(ChevronRight, { className: "w-4 h-4" })] }) })] }), loading ? (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx(Loader2, { className: "w-8 h-8 animate-spin text-muted-foreground" }) })) : blogPosts.length > 0 ? (_jsxs("div", { className: "grid md:grid-cols-2 gap-8", children: [_jsx(Card, { className: "overflow-hidden group", children: _jsxs(Link, { to: `/blog/${blogPosts[0].slug}`, className: "block", children: [_jsxs("div", { className: "relative aspect-[4/3] overflow-hidden", children: [_jsx("img", { src: blogPosts[0].imageUrl || getDefaultImage('blog'), alt: blogPosts[0].title, className: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" }), blogPosts[0].tags && (_jsx(Badge, { className: "absolute top-4 left-4", children: blogPosts[0].tags.split(',')[0] }))] }), _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-4 text-sm text-muted-foreground mb-3", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Calendar, { className: "w-4 h-4" }), formatPostDate(blogPosts[0].publishedAt || blogPosts[0].createdAt)] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "w-4 h-4" }), calculateReadTime(blogPosts[0].excerpt || '')] })] }), _jsx("h3", { className: "text-xl font-bold mb-2 group-hover:text-muted-foreground transition-colors", children: blogPosts[0].title }), _jsx("p", { className: "text-muted-foreground line-clamp-2", children: blogPosts[0].excerpt })] })] }) }), _jsxs("div", { className: "space-y-4", children: [blogPosts.slice(1, 4).map((post) => (_jsx(Card, { className: "overflow-hidden group", children: _jsxs(Link, { to: `/blog/${post.slug}`, className: "flex gap-4 p-4", children: [_jsx("div", { className: "relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg", children: _jsx("img", { src: post.imageUrl || getDefaultImage('blog'), alt: post.title, className: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [post.tags && (_jsx(Badge, { variant: "secondary", className: "mb-2 text-xs", children: post.tags.split(',')[0] })), _jsx("h3", { className: "font-semibold group-hover:text-muted-foreground transition-colors line-clamp-2", children: post.title }), _jsx("p", { className: "text-sm text-muted-foreground mt-1", children: formatPostDate(post.publishedAt || post.createdAt) })] })] }) }, post.id))), blogPosts.length === 1 && (_jsxs(Card, { className: "p-8 text-center", children: [_jsx("p", { className: "text-muted-foreground mb-4", children: t('home.featuredArticles.moreComingSoon') }), _jsx(Button, { asChild: true, variant: "outline", children: _jsx(Link, { to: "/blog", children: t('home.featuredArticles.browseAll') }) })] }))] })] })) : (_jsx(Card, { className: "p-12 text-center", children: _jsx("p", { className: "text-muted-foreground", children: t('home.featuredArticles.noPosts') }) }))] }) }), _jsx("section", { className: "py-16 border-b border-border", children: _jsxs("div", { className: "max-w-7xl mx-auto px-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-bold mb-2", children: t('home.latestNews.title') }), _jsx("p", { className: "text-muted-foreground", children: t('home.latestNews.subtitle') })] }), _jsx(Button, { asChild: true, variant: "ghost", className: "hidden md:flex", children: _jsxs(Link, { to: "/news", className: "gap-2", children: [t('common.viewAll'), _jsx(ChevronRight, { className: "w-4 h-4" })] }) })] }), loading ? (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx(Loader2, { className: "w-8 h-8 animate-spin text-muted-foreground" }) })) : newsItems.length > 0 ? (_jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: newsItems.slice(0, 8).map((item) => (_jsx(Card, { className: "overflow-hidden group", children: _jsxs(Link, { to: `/news/${item.slug}`, className: "block", children: [_jsxs("div", { className: "relative aspect-square overflow-hidden", children: [_jsx("img", { src: item.imageUrl || getDefaultImage('news'), alt: item.title, className: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" }), _jsx("div", { className: "absolute bottom-0 left-0 right-0 p-4", children: _jsx("h3", { className: "text-sm font-medium text-white line-clamp-2", children: item.title }) })] }), _jsx(CardContent, { className: "p-3", children: _jsx("p", { className: "text-xs text-muted-foreground", children: formatPostDate(item.publishedAt || item.createdAt) }) })] }) }, item.id))) })) : (_jsx(Card, { className: "p-12 text-center", children: _jsx("p", { className: "text-muted-foreground", children: t('home.latestNews.noNews') }) }))] }) }), _jsx("section", { className: "py-16", children: _jsx("div", { className: "max-w-7xl mx-auto px-6", children: _jsx(Card, { className: "bg-secondary", children: _jsxs(CardContent, { className: "p-12 text-center", children: [_jsx("h2", { className: "text-3xl md:text-4xl font-bold mb-4", children: t('home.cta.title') }), _jsx("p", { className: "text-xl text-muted-foreground mb-8 max-w-2xl mx-auto", children: t('home.cta.subtitle') }), _jsx(Button, { asChild: true, size: "lg", children: _jsxs(Link, { to: "/login", className: "gap-2", children: [t('home.cta.button'), _jsx(ArrowRight, { className: "w-5 h-5" })] }) })] }) }) }) }), _jsx("footer", { className: "border-t border-border py-12", children: _jsx("div", { className: "max-w-7xl mx-auto px-6", children: _jsxs("div", { className: "flex flex-col md:flex-row justify-between items-center gap-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Plane, { className: "w-6 h-6" }), _jsx("span", { className: "text-xl font-bold", children: t('footer.company') })] }), _jsxs("div", { className: "flex flex-wrap justify-center gap-6 text-sm text-muted-foreground", children: [_jsx(Link, { to: "/about", className: "hover:text-foreground transition-colors", children: t('footer.links.about') }), _jsx(Link, { to: "/blog", className: "hover:text-foreground transition-colors", children: t('nav.blog') }), _jsx(Link, { to: "/news", className: "hover:text-foreground transition-colors", children: t('home.news') }), _jsx(Link, { to: "/learn-more", className: "hover:text-foreground transition-colors", children: t('home.hero.learnMore') }), _jsx(Link, { to: "/privacy", className: "hover:text-foreground transition-colors", children: t('footer.links.privacy') }), _jsx(Link, { to: "/terms", className: "hover:text-foreground transition-colors", children: t('footer.links.terms') })] }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["\u00A9 2024 ", t('footer.company'), ". ", t('footer.copyright')] })] }) }) })] }));
};
export default Home;
