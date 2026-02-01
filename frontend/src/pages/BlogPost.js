import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, User, Loader2 } from 'lucide-react';
import { getPostBySlug, formatPostDate, calculateReadTime, getDefaultImage } from '@/api/posts';
import { Button } from '@/components/ui/button';
const BlogPost = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchPost = async () => {
            if (!slug) {
                setError('Post not found');
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const response = await getPostBySlug(slug);
                setPost(response.data);
                setError(null);
            }
            catch (err) {
                if (err.response?.status === 404) {
                    setError('Post not found');
                }
                else {
                    setError('Failed to load post');
                }
                console.error(err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [slug]);
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-background text-foreground", children: _jsx("div", { className: "max-w-4xl mx-auto px-6 py-20", children: _jsx("div", { className: "flex items-center justify-center py-20", children: _jsx(Loader2, { className: "w-8 h-8 animate-spin text-muted-foreground" }) }) }) }));
    }
    if (error || !post) {
        return (_jsx("div", { className: "min-h-screen bg-background text-foreground", children: _jsx("div", { className: "max-w-4xl mx-auto px-6 py-20", children: _jsxs("div", { className: "text-center py-20", children: [_jsx("h1", { className: "text-4xl font-bold mb-4", children: "Post Not Found" }), _jsx("p", { className: "text-muted-foreground mb-8", children: error || 'The post you are looking for does not exist.' }), _jsx(Button, { asChild: true, children: _jsxs(Link, { to: "/blog", children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-2" }), "Back to Blog"] }) })] }) }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [_jsxs("div", { className: "relative", children: [post.imageUrl && (_jsxs("div", { className: "absolute inset-0 h-[400px]", children: [_jsx("img", { src: post.imageUrl || getDefaultImage('blog'), alt: post.title, className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" })] })), _jsxs("div", { className: "relative max-w-4xl mx-auto px-6 pt-24 pb-12", children: [_jsxs(Link, { to: "/blog", className: "inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), "Back to Blog"] }), post.tags && (_jsx("div", { className: "flex flex-wrap gap-2 mb-4", children: post.tags.split(',').map((tag, i) => (_jsx("span", { className: "px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full", children: tag.trim() }, i))) })), _jsx("h1", { className: "text-4xl md:text-5xl font-bold mb-6", children: post.title }), _jsxs("div", { className: "flex flex-wrap items-center gap-6 text-sm text-muted-foreground", children: [post.authorName && (_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(User, { className: "w-4 h-4" }), post.authorName] })), _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4" }), formatPostDate(post.publishedAt || post.createdAt)] }), _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-4 h-4" }), calculateReadTime(post.content)] })] })] })] }), _jsxs("article", { className: "max-w-4xl mx-auto px-6 py-12", children: [post.excerpt && (_jsx("p", { className: "text-xl text-muted-foreground mb-8 border-l-4 border-primary pl-6", children: post.excerpt })), _jsx("div", { className: "prose prose-lg dark:prose-invert max-w-none", children: post.content.split('\n').map((paragraph, i) => (paragraph.trim() && (_jsx("p", { className: "mb-4 text-foreground leading-relaxed", children: paragraph }, i)))) })] }), _jsx("div", { className: "max-w-4xl mx-auto px-6 py-12 border-t border-border", children: _jsxs("div", { className: "bg-secondary rounded-xl p-8 text-center", children: [_jsx("h3", { className: "text-2xl font-bold mb-4", children: "Ready to Start Your Visa Journey?" }), _jsx("p", { className: "text-muted-foreground mb-6", children: "Let TravelXpressa guide you through the DS-160 application process." }), _jsx(Button, { asChild: true, size: "lg", children: _jsx(Link, { to: "/login", children: "Get Started" }) })] }) })] }));
};
export default BlogPost;
