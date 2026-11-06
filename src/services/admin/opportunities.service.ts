/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '../../integrations/supabase/client';

export const fetchOpportunities = async () => {
  const { data, error } = await supabase
  .from('opportunities' as any)
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
};

export const upsertOpportunity = async (opportunity: any) => {
  const { data, error } = await supabase
    .from('opportunities' as any)
    .upsert(opportunity as any)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
};

export const deleteOpportunity = async (id: string) => {
  const { error } = await supabase.from('opportunities' as any).delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
};