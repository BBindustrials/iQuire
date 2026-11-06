/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================================
// iQuire — Storage Service (File Uploads)
// ============================================================================

import { supabase } from '../integrations/supabase/client';

/**
 * Uploads an image to the 'course-images' Supabase Storage bucket.
 * Returns the public URL of the uploaded image.
 */
export const uploadCourseImage = async (
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    // 1. Validate file type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Please upload an image file (JPG, PNG, etc.).' };
    }

    // 2. Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'Image must be less than 5MB.' };
    }

    // 3. Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // 4. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('course-images')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (uploadError) throw uploadError;

    // 5. Get public URL
    const { data } = supabase.storage
      .from('course-images')
      .getPublicUrl(filePath);

    return { success: true, url: data.publicUrl };
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload image. Please try again.',
    };
  }
};