import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, Loader2 } from 'lucide-react';
import { getPosts, formatPostDate, calculateReadTime, getDefaultImage } from '@/api/posts';
const Blog = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const response = await getPosts({ category: 'blog', limit: 9, page });
                setPosts(response.data);
                setTotalPages(response.pagination.totalPages);
                setError(null);
            }
            catch (err) {
                setError('Failed to load blog posts');
                console.error(err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [page]);
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-background text-foreground", children: _jsx("div", { className: "max-w-7xl mx-auto px-6 py-20", children: _jsx("div", { className: "flex items-center justify-center py-20", children: _jsx(Loader2, { className: "w-8 h-8 animate-spin text-muted-foreground" }) }) }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [_jsx("section", { className: "pt-16 pb-12 border-b border-border", children: _jsxs("div", { className: "max-w-7xl mx-auto px-6", children: [_jsxs(Link, { to: "/", className: "inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), "Back to Home"] }), _jsx("h1", { className: "text-4xl md:text-5xl font-bold mb-4", children: "Blog" }), _jsx("p", { className: "text-xl text-muted-foreground max-w-2xl", children: "Visa guides, travel tips, and expert advice to help you navigate your journey to the United States." })] }) }), _jsx("section", { className: "py-16", children: _jsx("div", { className: "max-w-7xl mx-auto px-6", children: error ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("p", { className: "text-destructive mb-4", children: error }), _jsx("button", { onClick: () => setPage(1), className: "text-primary hover:underline", children: "Try again" })] })) : posts.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("p", { className: "text-muted-foreground text-lg", children: "No blog posts published yet." }), _jsx("p", { className: "text-muted-foreground mt-2", children: "Check back soon for visa guides and travel tips!" })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-8", children: posts.map((post) => (_jsx("article", { className: "group", children: _jsxs(Link, { to: `/blog/${post.slug}`, className: "block", children: [_jsxs("div", { className: "relative aspect-[16/10] overflow-hidden rounded-xl mb-4", children: [_jsx("img", { src: post.imageUrl || getDefaultImage('blog'), alt: post.title, className: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" }), post.tags && (_jsx("span", { className: "absolute top-4 left-4 px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full", children: post.tags.split(',')[0] }))] }), _jsxs("div", { className: "flex items-center gap-4 text-sm text-muted-foreground mb-3", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Calendar, { className: "w-4 h-4" }), formatPostDate(post.publishedAt || post.createdAt)] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "w-4 h-4" }), calculateReadTime(post.excerpt || '')] })] }), _jsx("h2", { className: "text-xl font-bold mb-2 group-hover:text-muted-foreground transition-colors line-clamp-2", children: post.title }), _jsx("p", { className: "text-muted-foreground line-clamp-2", children: post.excerpt }), post.authorName && (_jsxs("p", { className: "text-sm text-muted-foreground mt-3", children: ["By ", post.authorName] }))] }) }, post.id))) }), totalPages > 1 && (_jsxs("div", { className: "flex items-center justify-center gap-2 mt-12", children: [_jsx("button", { onClick: () => setPage(p => Math.max(1, p - 1)), disabled: page === 1, className: "px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: "Previous" }), _jsxs("span", { className: "px-4 py-2 text-muted-foreground", children: ["Page ", page, " of ", totalPages] }), _jsx("button", { onClick: () => setPage(p => Math.min(totalPages, p + 1)), disabled: page === totalPages, className: "px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: "Next" })] }))] })) }) })] }));
};
export default Blog;
