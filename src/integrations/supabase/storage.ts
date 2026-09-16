// ============================================================================
// Supabase Storage Helpers
// ============================================================================
// Consistent upload/download/delete helpers for all buckets.
// ============================================================================

import { supabase } from './client';

// ============================================================================
// Types
// ============================================================================

export type BucketName = 'avatars' | 'logos' | 'documents';

export interface UploadResult {
  success: boolean;
  path?: string;
  publicUrl?: string;
  error?: string;
}

// ============================================================================
// Validation Constants (aligned with Supabase free-tier 50MB total storage)
// ============================================================================

const MAX_SIZES: Record<BucketName, number> = {
  avatars: 1 * 1024 * 1024,   // 1 MB
  logos: 1 * 1024 * 1024,     // 1 MB
  documents: 5 * 1024 * 1024, // 5 MB
};

const ALLOWED_TYPES: Record<BucketName, string[]> = {
  avatars: ['image/jpeg', 'image/png', 'image/webp'],
  logos: ['image/png', 'image/svg+xml', 'image/webp'],
  documents: ['application/pdf'],
};

// ============================================================================
// Helpers
// ============================================================================

/**
 * Validate a file before upload
 */
export const validateFile = (
  file: File,
  bucket: BucketName
): { valid: boolean; error?: string } => {
  // Size check
  if (file.size > MAX_SIZES[bucket]) {
    const maxMB = (MAX_SIZES[bucket] / 1024 / 1024).toFixed(0);
    return { valid: false, error: `File must be smaller than ${maxMB}MB` };
  }

  // Type check
  if (!ALLOWED_TYPES[bucket].includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Accepted: ${ALLOWED_TYPES[bucket].join(', ')}`,
    };
  }

  return { valid: true };
};

/**
 * Generate a safe filename
 */
const safeFilename = (originalName: string): string => {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'bin';
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `${timestamp}-${random}.${ext}`;
};

/**
 * Upload a file to a bucket under the current user's folder
 */
export const uploadFile = async (
  file: File,
  bucket: BucketName,
  filename?: string
): Promise<UploadResult> => {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Validate
  const validation = validateFile(file, bucket);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Build path: {user_id}/{filename}
  const finalName = filename || safeFilename(file.name);
  const filePath = `${user.id}/${finalName}`;

  // Upload
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { upsert: true });

  if (error) {
    return { success: false, error: error.message };
  }

  // Get public URL (only for public buckets)
  let publicUrl: string | undefined;
  if (bucket === 'avatars' || bucket === 'logos') {
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    publicUrl = urlData.publicUrl;
  }

  return {
    success: true,
    path: data.path,
    publicUrl,
  };
};

/**
 * Delete a file from a bucket
 */
export const deleteFile = async (
  bucket: BucketName,
  path: string
): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) return { success: false, error: error.message };
  return { success: true };
};

/**
 * Get a signed URL for private files (documents)
 */
export const getSignedUrl = async (
  bucket: BucketName,
  path: string,
  expiresIn = 3600
): Promise<{ success: boolean; url?: string; error?: string }> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) return { success: false, error: error.message };
  return { success: true, url: data.signedUrl };
};