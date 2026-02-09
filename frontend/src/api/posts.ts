import api, { handleApiError } from './client';

// Types
export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  imageUrl: string | null;
  category: 'blog' | 'news';
  tags: string | null;
  status: 'draft' | 'published';
  publishedAt: string | null;
  authorId: string | null;
  authorName: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  imageUrl: string | null;
  category: 'blog' | 'news';
  tags: string | null;
  authorName: string | null;
  publishedAt: string | null;
  createdAt: string;
}

export interface CreatePostInput {
  title: string;
  excerpt?: string;
  content: string;
  imageUrl?: string;
  category: 'blog' | 'news';
  tags?: string;
  status?: 'draft' | 'published';
}

export interface UpdatePostInput extends Partial<CreatePostInput> {
  id: string;
}

export interface FeaturedContent {
  blogPosts: PostSummary[];
  newsPosts: PostSummary[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ==================== PUBLIC API ====================

// Get published posts (public)
export const getPosts = async (params?: {
  category?: 'blog' | 'news';
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<PostSummary>> => {
  try {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const url = queryString ? `/api/posts?${queryString}` : '/api/posts';

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get featured content for homepage (public)
export const getFeaturedContent = async (): Promise<FeaturedContent> => {
  try {
    const response = await api.get('/api/posts/featured');
    return response.data.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get single post by slug (public)
export const getPostBySlug = async (slug: string): Promise<{ success: boolean; data: Post }> => {
  try {
    const response = await api.get(`/api/posts/${slug}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// ==================== ADMIN API ====================

// Get all posts including drafts (admin only)
export const getAdminPosts = async (params?: {
  category?: 'blog' | 'news';
  status?: 'draft' | 'published';
}): Promise<{ success: boolean; data: Post[] }> => {
  try {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.status) searchParams.append('status', params.status);

    const queryString = searchParams.toString();
    const url = queryString ? `/api/posts/admin/all?${queryString}` : '/api/posts/admin/all';

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Create new post (admin only)
export const createPost = async (data: CreatePostInput): Promise<{ success: boolean; data: Post; message: string }> => {
  try {
    const response = await api.post('/api/posts/admin', data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update post (admin only)
export const updatePost = async (id: string, data: Partial<CreatePostInput>): Promise<{ success: boolean; data: Post; message: string }> => {
  try {
    const response = await api.put(`/api/posts/admin/${id}`, data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Delete post (admin only)
export const deletePost = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/api/posts/admin/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Toggle publish status (admin only)
export const togglePostPublish = async (id: string): Promise<{ success: boolean; data: Post; message: string }> => {
  try {
    const response = await api.patch(`/api/posts/admin/${id}/publish`, {});
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// ==================== UTILITY ====================

// Format date for display
export const formatPostDate = (dateString: string | null): string => {
  if (!dateString) return 'Not published';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Calculate read time
export const calculateReadTime = (content: string): string => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
};

// Default images for posts without images
export const getDefaultImage = (category: 'blog' | 'news'): string => {
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
