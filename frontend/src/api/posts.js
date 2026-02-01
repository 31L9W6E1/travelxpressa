import api from './client';
// ==================== PUBLIC API ====================
// Get published posts (public)
export const getPosts = async (params) => {
    const searchParams = new URLSearchParams();
    if (params?.category)
        searchParams.append('category', params.category);
    if (params?.page)
        searchParams.append('page', params.page.toString());
    if (params?.limit)
        searchParams.append('limit', params.limit.toString());
    const queryString = searchParams.toString();
    const url = queryString ? `/api/posts?${queryString}` : '/api/posts';
    const response = await api.get(url);
    return response.data;
};
// Get featured content for homepage (public)
export const getFeaturedContent = async () => {
    const response = await api.get('/api/posts/featured');
    return response.data.data;
};
// Get single post by slug (public)
export const getPostBySlug = async (slug) => {
    const response = await api.get(`/api/posts/${slug}`);
    return response.data;
};
// ==================== ADMIN API ====================
// Get all posts including drafts (admin only)
export const getAdminPosts = async (params) => {
    const token = localStorage.getItem('accessToken');
    const searchParams = new URLSearchParams();
    if (params?.category)
        searchParams.append('category', params.category);
    if (params?.status)
        searchParams.append('status', params.status);
    const queryString = searchParams.toString();
    const url = queryString ? `/api/posts/admin/all?${queryString}` : '/api/posts/admin/all';
    const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};
// Create new post (admin only)
export const createPost = async (data) => {
    const token = localStorage.getItem('accessToken');
    const response = await api.post('/api/posts/admin', data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};
// Update post (admin only)
export const updatePost = async (id, data) => {
    const token = localStorage.getItem('accessToken');
    const response = await api.put(`/api/posts/admin/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};
// Delete post (admin only)
export const deletePost = async (id) => {
    const token = localStorage.getItem('accessToken');
    const response = await api.delete(`/api/posts/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};
// Toggle publish status (admin only)
export const togglePostPublish = async (id) => {
    const token = localStorage.getItem('accessToken');
    const response = await api.patch(`/api/posts/admin/${id}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};
// ==================== UTILITY ====================
// Format date for display
export const formatPostDate = (dateString) => {
    if (!dateString)
        return 'Not published';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};
// Calculate read time
export const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
};
// Default images for posts without images
export const getDefaultImage = (category) => {
    const blogImages = [
        'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop&q=60',
    ];
    const newsImages = [
        'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60',
    ];
    const images = category === 'blog' ? blogImages : newsImages;
    return images[Math.floor(Math.random() * images.length)];
};
