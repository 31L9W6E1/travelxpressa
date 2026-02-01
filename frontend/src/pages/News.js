import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import { getPosts, formatPostDate, getDefaultImage } from '@/api/posts';
const News = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            try {
                const response = await getPosts({ category: 'news', limit: 12, page });
                setNews(response.data);
                setTotalPages(response.pagination.totalPages);
                setError(null);
            }
            catch (err) {
                setError('Failed to load news');
                console.error(err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, [page]);
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-background text-foreground", children: _jsx("div", { className: "max-w-7xl mx-auto px-6 py-20", children: _jsx("div", { className: "flex items-center justify-center py-20", children: _jsx(Loader2, { className: "w-8 h-8 animate-spin text-muted-foreground" }) }) }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [_jsx("section", { className: "pt-16 pb-12 border-b border-border", children: _jsxs("div", { className: "max-w-7xl mx-auto px-6", children: [_jsxs(Link, { to: "/", className: "inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), "Back to Home"] }), _jsx("h1", { className: "text-4xl md:text-5xl font-bold mb-4", children: "News" }), _jsx("p", { className: "text-xl text-muted-foreground max-w-2xl", children: "Latest updates from the US Embassy and immigration services." })] }) }), _jsx("section", { className: "py-16", children: _jsx("div", { className: "max-w-7xl mx-auto px-6", children: error ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("p", { className: "text-destructive mb-4", children: error }), _jsx("button", { onClick: () => setPage(1), className: "text-primary hover:underline", children: "Try again" })] })) : news.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("p", { className: "text-muted-foreground text-lg", children: "No news articles published yet." }), _jsx("p", { className: "text-muted-foreground mt-2", children: "Check back soon for the latest updates!" })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6", children: news.map((item) => (_jsx("article", { className: "group", children: _jsxs(Link, { to: `/news/${item.slug}`, className: "block", children: [_jsxs("div", { className: "relative aspect-square overflow-hidden rounded-lg mb-3", children: [_jsx("img", { src: item.imageUrl || getDefaultImage('news'), alt: item.title, className: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" }), _jsx("div", { className: "absolute bottom-0 left-0 right-0 p-4", children: _jsx("h2", { className: "text-sm font-medium text-white line-clamp-2 group-hover:text-gray-300 transition-colors", children: item.title }) })] }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [_jsx(Calendar, { className: "w-3 h-3" }), formatPostDate(item.publishedAt || item.createdAt)] }), item.excerpt && (_jsx("p", { className: "text-sm text-muted-foreground mt-2 line-clamp-2", children: item.excerpt }))] }) }, item.id))) }), totalPages > 1 && (_jsxs("div", { className: "flex items-center justify-center gap-2 mt-12", children: [_jsx("button", { onClick: () => setPage(p => Math.max(1, p - 1)), disabled: page === 1, className: "px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: "Previous" }), _jsxs("span", { className: "px-4 py-2 text-muted-foreground", children: ["Page ", page, " of ", totalPages] }), _jsx("button", { onClick: () => setPage(p => Math.min(totalPages, p + 1)), disabled: page === totalPages, className: "px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: "Next" })] }))] })) }) })] }));
};
export default News;
