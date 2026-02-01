import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import { getPostBySlug, formatPostDate, getDefaultImage } from '@/api/posts';
import { Button } from '@/components/ui/button';
const NewsArticle = () => {
    const { slug } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchArticle = async () => {
            if (!slug) {
                setError('Article not found');
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const response = await getPostBySlug(slug);
                setArticle(response.data);
                setError(null);
            }
            catch (err) {
                if (err.response?.status === 404) {
                    setError('Article not found');
                }
                else {
                    setError('Failed to load article');
                }
                console.error(err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [slug]);
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-background text-foreground", children: _jsx("div", { className: "max-w-4xl mx-auto px-6 py-20", children: _jsx("div", { className: "flex items-center justify-center py-20", children: _jsx(Loader2, { className: "w-8 h-8 animate-spin text-muted-foreground" }) }) }) }));
    }
    if (error || !article) {
        return (_jsx("div", { className: "min-h-screen bg-background text-foreground", children: _jsx("div", { className: "max-w-4xl mx-auto px-6 py-20", children: _jsxs("div", { className: "text-center py-20", children: [_jsx("h1", { className: "text-4xl font-bold mb-4", children: "Article Not Found" }), _jsx("p", { className: "text-muted-foreground mb-8", children: error || 'The article you are looking for does not exist.' }), _jsx(Button, { asChild: true, children: _jsxs(Link, { to: "/news", children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-2" }), "Back to News"] }) })] }) }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [_jsx("section", { className: "pt-20 pb-12 border-b border-border", children: _jsxs("div", { className: "max-w-4xl mx-auto px-6", children: [_jsxs(Link, { to: "/news", className: "inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), "Back to News"] }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground mb-4", children: [_jsx(Calendar, { className: "w-4 h-4" }), formatPostDate(article.publishedAt || article.createdAt)] }), _jsx("h1", { className: "text-4xl md:text-5xl font-bold mb-6", children: article.title }), article.excerpt && (_jsx("p", { className: "text-xl text-muted-foreground", children: article.excerpt }))] }) }), article.imageUrl && (_jsx("div", { className: "max-w-4xl mx-auto px-6 py-8", children: _jsx("div", { className: "aspect-video rounded-xl overflow-hidden", children: _jsx("img", { src: article.imageUrl || getDefaultImage('news'), alt: article.title, className: "w-full h-full object-cover" }) }) })), _jsx("article", { className: "max-w-4xl mx-auto px-6 py-8", children: _jsx("div", { className: "prose prose-lg dark:prose-invert max-w-none", children: article.content.split('\n').map((paragraph, i) => (paragraph.trim() && (_jsx("p", { className: "mb-4 text-foreground leading-relaxed", children: paragraph }, i)))) }) }), _jsx("div", { className: "max-w-4xl mx-auto px-6 py-12 border-t border-border", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-1", children: "Stay Updated" }), _jsx("p", { className: "text-muted-foreground", children: "Check out more news and announcements." })] }), _jsx(Button, { asChild: true, variant: "outline", children: _jsx(Link, { to: "/news", children: "View All News" }) })] }) })] }));
};
export default NewsArticle;
