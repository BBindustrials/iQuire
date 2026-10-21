// ============================================================================
// iQuire — FAQs Service (Phase 14.2)
// ============================================================================

import { supabase } from '../integrations/supabase/client';
import type { Faq, FaqInput } from '../types/content.types';

// Re-export types for consumers of this service
export type { Faq, FaqInput };

// ============================================================================
// Types
// ============================================================================

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// PUBLIC — Fetch published FAQs by category (ordered)
// ============================================================================

export const fetchPublishedFaqsByCategory = async (
  category: string
): Promise<ServiceResponse<Faq[]>> => {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('category', category)
      .eq('published', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data as Faq[]) ?? [] };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// PUBLIC — Fetch published FAQs across multiple categories
// ============================================================================

export const fetchPublishedFaqsByCategories = async (
  categories: string[]
): Promise<ServiceResponse<Faq[]>> => {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .in('category', categories)
      .eq('published', true)
      .order('category', { ascending: true })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data as Faq[]) ?? [] };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — Fetch all FAQs (optional category filter)
// ============================================================================

export const fetchAllFaqs = async (
  category?: string
): Promise<ServiceResponse<Faq[]>> => {
  try {
    let query = supabase
      .from('faqs')
      .select('*')
      .order('category', { ascending: true })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data as Faq[]) ?? [] };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — Get one by ID
// ============================================================================

export const fetchFaqById = async (
  id: string
): Promise<ServiceResponse<Faq>> => {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'FAQ not found' };

    return { success: true, data: data as Faq };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — Create
// ============================================================================

export const createFaq = async (
  input: FaqInput
): Promise<ServiceResponse<Faq>> => {
  try {
    // Auto-order within the category if not provided
    let displayOrder = input.display_order;
    if (displayOrder === undefined) {
      const { data: last } = await supabase
        .from('faqs')
        .select('display_order')
        .eq('category', input.category ?? 'general')
        .order('display_order', { ascending: false })
        .limit(1)
        .maybeSingle();
      displayOrder = (last?.display_order ?? 0) + 1;
    }

    const { data, error } = await supabase
      .from('faqs')
      .insert({ ...input, display_order: displayOrder })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Faq };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — Update
// ============================================================================

export const updateFaq = async (
  id: string,
  input: Partial<FaqInput>
): Promise<ServiceResponse<Faq>> => {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Faq };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — Delete
// ============================================================================

export const deleteFaq = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('faqs').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — Reorder within a category
// ============================================================================

export const reorderFaqs = async (
  orderedIds: string[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    const updates = orderedIds.map((id, index) =>
      supabase.from('faqs').update({ display_order: index + 1 }).eq('id', id)
    );

    const results = await Promise.all(updates);
    const failed = results.find((r) => r.error);
    if (failed?.error) {
      return { success: false, error: failed.error.message };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — Toggle published
// ============================================================================

export const toggleFaqPublished = async (
  id: string,
  published: boolean
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('faqs')
      .update({ published })
      .eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — Count by category (for sidebar badges etc.)
// ============================================================================

export const fetchFaqCounts = async (): Promise<Record<string, number>> => {
  try {
    const { data, error } = await supabase.from('faqs').select('category');
    if (error || !data) return {};

    return data.reduce<Record<string, number>>((acc, row) => {
      const cat = (row as { category: string }).category;
      acc[cat] = (acc[cat] ?? 0) + 1;
      return acc;
    }, {});
  } catch {
    return {};
  }
};