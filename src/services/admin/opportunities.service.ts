import { supabase } from '../../integrations/supabase/client';

export const fetchOpportunities = async () => {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
};

export const upsertOpportunity = async (opportunity: any) => {
  const { data, error } = await supabase
    .from('opportunities')
    .upsert(opportunity)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
};

export const deleteOpportunity = async (id: string) => {
  const { error } = await supabase.from('opportunities').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
};