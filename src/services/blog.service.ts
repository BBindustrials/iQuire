// ============================================================================
// iQuire — Blog Service (Phase 10E.2)
// ============================================================================
// CRUD for blog posts + categories, image upload with 500 KB compression.
// ============================================================================

import { supabase } from '../integrations/supabase/client';

// ============================================================================
// Types
// ============================================================================

export type BlogStatus = 'draft' | 'published' | 'archived';

export interface BlogCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image_url: string | null;
  category_id: string | null;
  tags: string[];
  author_name: string | null;
  author_role: string | null;
  author_avatar_url: string | null;
  status: BlogStatus;
  featured: boolean;
  published_at: string | null;
  read_time_minutes: number | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPostWithCategory extends BlogPost {
  category: BlogCategory | null;
}

export interface BlogPostInput {
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  featured_image_url?: string | null;
  category_id?: string | null;
  tags?: string[];
  author_name?: string | null;
  author_role?: string | null;
  author_avatar_url?: string | null;
  status?: BlogStatus;
  featured?: boolean;
  published_at?: string | null;
  read_time_minutes?: number | null;
  display_order?: number;
}

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// CATEGORIES
// ============================================================================

export const fetchCategories = async (): Promise<
  ServiceResponse<BlogCategory[]>
> => {
  try {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data as BlogCategory[]) ?? [] };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// POSTS — Public
// ============================================================================

export const fetchPublishedPosts = async (): Promise<
  ServiceResponse<BlogPostWithCategory[]>
> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        category:blog_categories(*)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) return { success: false, error: error.message };

    const posts = (data ?? []) as unknown as BlogPostWithCategory[];
    return { success: true, data: posts };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const fetchPostBySlug = async (
  slug: string
): Promise<ServiceResponse<BlogPostWithCategory>> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        category:blog_categories(*)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Post not found' };

    return { success: true, data: data as unknown as BlogPostWithCategory };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const fetchRelatedPosts = async (
  categoryId: string | null,
  excludePostId: string,
  limit = 3
): Promise<ServiceResponse<BlogPostWithCategory[]>> => {
  try {
    let query = supabase
      .from('blog_posts')
      .select(`
        *,
        category:blog_categories(*)
      `)
      .eq('status', 'published')
      .neq('id', excludePostId)
      .limit(limit);

    if (categoryId) query = query.eq('category_id', categoryId);

    const { data, error } = await query;

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data as unknown as BlogPostWithCategory[]) ?? [] };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// POSTS — Admin
// ============================================================================

export const fetchAllPosts = async (): Promise<
  ServiceResponse<BlogPostWithCategory[]>
> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        category:blog_categories(*)
      `)
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data as unknown as BlogPostWithCategory[]) ?? [] };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const fetchPostById = async (
  id: string
): Promise<ServiceResponse<BlogPostWithCategory>> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        category:blog_categories(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Post not found' };

    return { success: true, data: data as unknown as BlogPostWithCategory };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const createPost = async (
  input: BlogPostInput
): Promise<ServiceResponse<BlogPost>> => {
  try {
    // If publishing without a published_at, set now
    const payload: BlogPostInput = { ...input };
    if (payload.status === 'published' && !payload.published_at) {
      payload.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .insert(payload as never)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as unknown as BlogPost };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const updatePost = async (
  id: string,
  input: Partial<BlogPostInput>
): Promise<ServiceResponse<BlogPost>> => {
  try {
    const payload: Partial<BlogPostInput> = { ...input };

    // Auto-set published_at when transitioning to published
    if (payload.status === 'published' && !payload.published_at) {
      // Only set if currently not published (checked by caller or always safe)
      payload.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .update(payload as never)
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as unknown as BlogPost };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const deletePost = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Fetch image first for cleanup
    const existing = (await supabase
      .from('blog_posts')
      .select('featured_image_url')
      .eq('id', id)
      .maybeSingle()) as unknown as {
      data: { featured_image_url: string | null } | null;
    };

    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) return { success: false, error: error.message };

    // Best-effort image cleanup
    if (existing?.data?.featured_image_url) {
      const path = extractPathFromUrl(existing.data.featured_image_url);
      if (path) {
        await supabase.storage.from('blog-images').remove([path]);
      }
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// IMAGE UPLOAD (compress to ≤ 500 KB)
// ============================================================================

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Compress an image to fit under 500 KB using canvas.
 * Progressively reduces quality and resolution.
 */
const compressImage = (
  file: File,
  maxSizeBytes = 500 * 1024 // 500 KB
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));

        // Constrain max dimensions to 1600px on the longest side
        let { width, height } = img;
        const MAX_DIMENSION = 1600;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Progressive quality reduction
        let quality = 0.85;
        const attemptCompression = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error('Compression failed'));
              if (blob.size <= maxSizeBytes || quality <= 0.3) {
                resolve(blob);
              } else {
                quality -= 0.1;
                attemptCompression();
              }
            },
            'image/jpeg',
            quality
          );
        };

        attemptCompression();
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
};

export const uploadBlogImage = async (file: File): Promise<UploadResult> => {
  try {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return {
        success: false,
        error: 'Only JPEG, PNG, or WebP images are supported.',
      };
    }

    // Compress to ≤ 500 KB
    const compressedBlob = await compressImage(file, 500 * 1024);

    const filename = `blog-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.jpg`;

    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload(filename, compressedBlob, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) return { success: false, error: error.message };

    const { data: urlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(data.path);

    return { success: true, url: urlData.publicUrl };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// HELPERS
// ============================================================================

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);

export const calculateReadTime = (content: string): number => {
  if (!content) return 0;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200)); // 200 words per minute
};

export const formatBlogDate = (iso: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const extractPathFromUrl = (url: string): string | null => {
  const marker = '/blog-images/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
};