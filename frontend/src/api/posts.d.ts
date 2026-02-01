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
export declare const getPosts: (params?: {
    category?: "blog" | "news";
    page?: number;
    limit?: number;
}) => Promise<PaginatedResponse<PostSummary>>;
export declare const getFeaturedContent: () => Promise<FeaturedContent>;
export declare const getPostBySlug: (slug: string) => Promise<{
    success: boolean;
    data: Post;
}>;
export declare const getAdminPosts: (params?: {
    category?: "blog" | "news";
    status?: "draft" | "published";
}) => Promise<{
    success: boolean;
    data: Post[];
}>;
export declare const createPost: (data: CreatePostInput) => Promise<{
    success: boolean;
    data: Post;
    message: string;
}>;
export declare const updatePost: (id: string, data: Partial<CreatePostInput>) => Promise<{
    success: boolean;
    data: Post;
    message: string;
}>;
export declare const deletePost: (id: string) => Promise<{
    success: boolean;
    message: string;
}>;
export declare const togglePostPublish: (id: string) => Promise<{
    success: boolean;
    data: Post;
    message: string;
}>;
export declare const formatPostDate: (dateString: string | null) => string;
export declare const calculateReadTime: (content: string) => string;
export declare const getDefaultImage: (category: "blog" | "news") => string;
