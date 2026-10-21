// ============================================================================
// iQuire — Impact Metrics Service (Phase 14.2)
// ============================================================================

import { supabase } from '../integrations/supabase/client';
import type { ImpactMetric, ImpactMetricInput } from '../types/content.types';

// Re-export types for consumers of this service
export type { ImpactMetric, ImpactMetricInput };

// ============================================================================
// Types
// ============================================================================

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// PUBLIC — Fetch published impact metrics (ordered)
// ============================================================================

export const fetchPublishedImpactMetrics = async (): Promise<
  ServiceResponse<ImpactMetric[]>
> => {
  try {
    const { data, error } = await supabase
      .from('impact_metrics')
      .select('*')
      .eq('published', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data as ImpactMetric[]) ?? [] };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — Fetch all (including unpublished)
// ============================================================================

export const fetchAllImpactMetrics = async (): Promise<
  ServiceResponse<ImpactMetric[]>
> => {
  try {
    const { data, error } = await supabase
      .from('impact_metrics')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data as ImpactMetric[]) ?? [] };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — Get one by ID
// ============================================================================

export const fetchImpactMetricById = async (
  id: string
): Promise<ServiceResponse<ImpactMetric>> => {
  try {
    const { data, error } = await supabase
      .from('impact_metrics')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Impact metric not found' };

    return { success: true, data: data as ImpactMetric };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — Create
// ============================================================================

export const createImpactMetric = async (
  input: ImpactMetricInput
): Promise<ServiceResponse<ImpactMetric>> => {
  try {
    let displayOrder = input.display_order;
    if (displayOrder === undefined) {
      const { data: last } = await supabase
        .from('impact_metrics')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .maybeSingle();
      displayOrder = (last?.display_order ?? 0) + 1;
    }

    const { data, error } = await supabase
      .from('impact_metrics')
      .insert({ ...input, display_order: displayOrder })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as ImpactMetric };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — Update
// ============================================================================

export const updateImpactMetric = async (
  id: string,
  input: Partial<ImpactMetricInput>
): Promise<ServiceResponse<ImpactMetric>> => {
  try {
    const { data, error } = await supabase
      .from('impact_metrics')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as ImpactMetric };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — Delete
// ============================================================================

export const deleteImpactMetric = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('impact_metrics')
      .delete()
      .eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — Reorder (bulk update display_order)
// ============================================================================

export const reorderImpactMetrics = async (
  orderedIds: string[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    const updates = orderedIds.map((id, index) =>
      supabase
        .from('impact_metrics')
        .update({ display_order: index + 1 })
        .eq('id', id)
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

export const toggleImpactMetricPublished = async (
  id: string,
  published: boolean
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('impact_metrics')
      .update({ published })
      .eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};