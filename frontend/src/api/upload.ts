import api, { handleApiError, getApiBaseUrl } from './client';

export interface UploadResponse {
  success: boolean;
  data: {
    url: string;
    filename: string;
  };
  message: string;
}

/**
 * Upload an image file to the server
 * @param file - The image file to upload
 * @returns Promise with the uploaded image URL and filename
 */
export const uploadImage = async (file: File): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/api/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Delete an image from the server
 * @param filename - The filename of the image to delete
 */
export const deleteImage = async (filename: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/api/upload/image/${encodeURIComponent(filename)}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get the full URL for an uploaded image
 * @param url - The relative or absolute URL
 * @returns Full URL to the image
 */
export const getFullImageUrl = (url: string): string => {
  if (!url) return '';

  // If it's already a full URL, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return normalizeImageUrl(url);
  }

  // If it's a relative URL (starts with /uploads), prepend the API base URL
  if (url.startsWith('/uploads')) {
    return `${getApiBaseUrl()}${url}`;
  }

  return url;
};

/**
 * Convert Unsplash page URL to direct image URL
 * @param url - The Unsplash URL (can be page URL or direct URL)
 * @returns Direct image URL
 */
export const normalizeImageUrl = (url: string): string => {
  if (!url) return '';

  // If it's a local upload URL, return full URL
  if (url.startsWith('/uploads')) {
    return getFullImageUrl(url);
  }

  // If it's already a direct image URL, return as-is
  if (url.includes('images.unsplash.com')) {
    return url;
  }

  // Convert Unsplash page URL to direct image URL
  // https://unsplash.com/photos/two-women-discuss-over-a-laptop-ZP_ApHZuK58
  // -> https://images.unsplash.com/photo-ZP_ApHZuK58?w=800&auto=format&fit=crop&q=60
  const unsplashPageMatch = url.match(/unsplash\.com\/photos\/[^\/]+-([a-zA-Z0-9_-]+)$/);
  if (unsplashPageMatch) {
    const photoId = unsplashPageMatch[1];
    return `https://images.unsplash.com/photo-${photoId}?w=800&auto=format&fit=crop&q=60`;
  }

  // Alternative format: https://unsplash.com/photos/ZP_ApHZuK58
  const unsplashSimpleMatch = url.match(/unsplash\.com\/photos\/([a-zA-Z0-9_-]+)$/);
  if (unsplashSimpleMatch) {
    const photoId = unsplashSimpleMatch[1];
    return `https://images.unsplash.com/photo-${photoId}?w=800&auto=format&fit=crop&q=60`;
  }

  // Return original URL if no conversion needed
  return url;
};

/**
 * Check if a URL is a valid image URL
 * @param url - The URL to check
 * @returns Promise<boolean>
 */
export const isValidImageUrl = async (url: string): Promise<boolean> => {
  if (!url) return false;

  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return response.ok && contentType ? contentType.startsWith('image/') : false;
  } catch {
    return false;
  }
};
