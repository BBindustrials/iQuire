// ============================================================================
// iQuire — Alumni Service (Phase 9B.1a)
// ============================================================================
// CRUD operations + image upload with client-side compression.
// ============================================================================

import { supabase } from '../integrations/supabase/client';

// ============================================================================
// Types
// ============================================================================

export type AlumniStatus = 'draft' | 'published' | 'archived';

export interface Alumni {
  id: string;
  full_name: string;
  professional_title: string;
  organization: string | null;
  photo_url: string | null;
  programme: string | null;
  cohort: string | null;
  short_summary: string;
  professional_summary: string | null;
  before_journey: string | null;
  after_journey: string | null;
  areas_of_expertise: string[];
  key_skills: string[];
  career_experience: string | null;
  feedback: string | null;
  trustpilot_url: string | null;
  linkedin_url: string | null;
  featured: boolean;
  display_order: number;
  status: AlumniStatus;
  created_at: string;
  updated_at: string;
}

export interface AlumniInput {
  full_name: string;
  professional_title: string;
  organization?: string | null;
  photo_url?: string | null;
  programme?: string | null;
  cohort?: string | null;
  short_summary: string;
  professional_summary?: string | null;
  before_journey?: string | null;
  after_journey?: string | null;
  areas_of_expertise?: string[];
  key_skills?: string[];
  career_experience?: string | null;
  feedback?: string | null;
  trustpilot_url?: string | null;
  linkedin_url?: string | null;
  featured?: boolean;
  display_order?: number;
  status?: AlumniStatus;
}

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ----------------------------------------------------------------------------
// Typed table accessor
// ----------------------------------------------------------------------------
// The Supabase client is not generated with a `Database` generic, so
// `.from('alumni')` infers `never` for row shapes. This helper centralizes a
// single cast so the rest of the file stays clean. For full type safety,
// replace this with generated Supabase types:
//   npx supabase gen types typescript --project-id <id> --schema public \
//     > src/integrations/supabase/types.ts
// then pass `Database` into createClient<Database>(...).
// ----------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const alumniTable = (): any => supabase.from('alumni');

// ============================================================================
// LIST — Admin (all alumni)
// ============================================================================

export const fetchAllAlumni = async (): Promise<ServiceResponse<Alumni[]>> => {
  try {
    const { data, error } = await alumniTable()
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data as Alumni[]) ?? [] };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// LIST — Public (only published)
// ============================================================================

export const fetchPublishedAlumni = async (): Promise<ServiceResponse<Alumni[]>> => {
  try {
    const { data, error } = await alumniTable()
      .select('*')
      .eq('status', 'published')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data as Alumni[]) ?? [] };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// LIST — Public Featured (home section, max N)
// ============================================================================

export const fetchFeaturedAlumni = async (
  limit = 3
): Promise<ServiceResponse<Alumni[]>> => {
  try {
    const { data, error } = await alumniTable()
      .select('*')
      .eq('status', 'published')
      .eq('featured', true)
      .order('display_order', { ascending: true })
      .limit(limit);

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data as Alumni[]) ?? [] };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// GET BY ID
// ============================================================================

export const fetchAlumniById = async (
  id: string
): Promise<ServiceResponse<Alumni>> => {
  try {
    const { data, error } = await alumniTable()
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Alumni not found' };

    return { success: true, data: data as Alumni };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// CREATE
// ============================================================================

export const createAlumni = async (
  input: AlumniInput
): Promise<ServiceResponse<Alumni>> => {
  try {
    const { data, error } = await alumniTable()
      .insert({
        full_name: input.full_name.trim(),
        professional_title: input.professional_title.trim(),
        organization: input.organization?.trim() || null,
        photo_url: input.photo_url ?? null,
        programme: input.programme?.trim() || null,
        cohort: input.cohort?.trim() || null,
        short_summary: input.short_summary.trim(),
        professional_summary: input.professional_summary?.trim() || null,
        before_journey: input.before_journey?.trim() || null,
        after_journey: input.after_journey?.trim() || null,
        areas_of_expertise: input.areas_of_expertise ?? [],
        key_skills: input.key_skills ?? [],
        career_experience: input.career_experience?.trim() || null,
        feedback: input.feedback?.trim() || null,
        trustpilot_url: input.trustpilot_url?.trim() || null,
        linkedin_url: input.linkedin_url?.trim() || null,
        featured: input.featured ?? false,
        display_order: input.display_order ?? 0,
        status: input.status ?? 'draft',
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Alumni };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// UPDATE
// ============================================================================

export const updateAlumni = async (
  id: string,
  input: Partial<AlumniInput>
): Promise<ServiceResponse<Alumni>> => {
  try {
    const payload: Record<string, unknown> = {};

    if (input.full_name !== undefined) payload.full_name = input.full_name.trim();
    if (input.professional_title !== undefined)
      payload.professional_title = input.professional_title.trim();
    if (input.organization !== undefined)
      payload.organization = input.organization?.trim() || null;
    if (input.photo_url !== undefined) payload.photo_url = input.photo_url;
    if (input.programme !== undefined) payload.programme = input.programme?.trim() || null;
    if (input.cohort !== undefined) payload.cohort = input.cohort?.trim() || null;
    if (input.short_summary !== undefined) payload.short_summary = input.short_summary.trim();
    if (input.professional_summary !== undefined)
      payload.professional_summary = input.professional_summary?.trim() || null;
    if (input.before_journey !== undefined)
      payload.before_journey = input.before_journey?.trim() || null;
    if (input.after_journey !== undefined)
      payload.after_journey = input.after_journey?.trim() || null;
    if (input.areas_of_expertise !== undefined)
      payload.areas_of_expertise = input.areas_of_expertise;
    if (input.key_skills !== undefined) payload.key_skills = input.key_skills;
    if (input.career_experience !== undefined)
      payload.career_experience = input.career_experience?.trim() || null;
    if (input.feedback !== undefined) payload.feedback = input.feedback?.trim() || null;
    if (input.trustpilot_url !== undefined)
      payload.trustpilot_url = input.trustpilot_url?.trim() || null;
    if (input.linkedin_url !== undefined)
      payload.linkedin_url = input.linkedin_url?.trim() || null;
    if (input.featured !== undefined) payload.featured = input.featured;
    if (input.display_order !== undefined) payload.display_order = input.display_order;
    if (input.status !== undefined) payload.status = input.status;

    const { data, error } = await alumniTable()
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Alumni };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// DELETE
// ============================================================================

export const deleteAlumni = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: existing } = (await alumniTable()
      .select('photo_url')
      .eq('id', id)
      .maybeSingle()) as { data: { photo_url: string | null } | null };

    const { error } = await alumniTable().delete().eq('id', id);
    if (error) return { success: false, error: error.message };

    if (existing?.photo_url) {
      const path = extractPathFromUrl(existing.photo_url);
      if (path) {
        await supabase.storage.from('alumni-photos').remove([path]);
      }
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// QUICK ACTIONS
// ============================================================================

export const toggleFeatured = async (
  id: string,
  featured: boolean
): Promise<{ success: boolean; error?: string }> => {
  const { error } = await alumniTable()
    .update({ featured })
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  return { success: true };
};

export const toggleStatus = async (
  id: string,
  status: AlumniStatus
): Promise<{ success: boolean; error?: string }> => {
  const { error } = await alumniTable()
    .update({ status })
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  return { success: true };
};

// ============================================================================
// IMAGE UPLOAD (with client-side compression)
// ============================================================================

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

const compressImage = (
  file: File,
  maxSizeBytes = 1024 * 1024
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));

        let { width, height } = img;
        const MAX_DIMENSION = 1200;
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

        let quality = 0.9;
        const attemptCompression = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error('Compression failed'));
              if (blob.size <= maxSizeBytes || quality <= 0.4) {
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

export const uploadAlumniPhoto = async (
  file: File
): Promise<UploadResult> => {
  try {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return {
        success: false,
        error: 'Only JPEG, PNG, or WebP images are supported.',
      };
    }

    const compressedBlob = await compressImage(file, 1024 * 1024);

    const filename = `alumni-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.jpg`;

    const { data, error } = await supabase.storage
      .from('alumni-photos')
      .upload(filename, compressedBlob, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) return { success: false, error: error.message };

    const { data: urlData } = supabase.storage
      .from('alumni-photos')
      .getPublicUrl(data.path);

    return { success: true, url: urlData.publicUrl };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// HELPERS
// ============================================================================

const extractPathFromUrl = (url: string): string | null => {
  const marker = '/alumni-photos/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
};