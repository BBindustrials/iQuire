/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '../../integrations/supabase/client';

export const fetchResources = async () => {
  const { data, error } = await supabase
    .from('resources' as any)
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
};

export const upsertResource = async (resource: any) => {
  const { data, error } = await supabase
    .from('resources' as any)
    .upsert(resource)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
};

export const deleteResource = async (id: string) => {
  const { error } = await supabase.from('resources' as any).delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
};