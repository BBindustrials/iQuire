// ============================================================================
// iQuire — Contact Service (Phase 12D.2)
// ============================================================================

import { supabase } from '../integrations/supabase/client';
import type {
  ContactMessage,
  ContactMessageInput,
  ContactMessageStatus,
} from '../types/content.types';

// ============================================================================
// Types
// ============================================================================

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// PUBLIC — Submit a contact message
// ============================================================================

export const submitContactMessage = async (
  input: ContactMessageInput
): Promise<ServiceResponse<ContactMessage>> => {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone?.trim() || null,
        subject: input.subject.trim(),
        message: input.message.trim(),
        status: 'new',
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as ContactMessage };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — List messages
// ============================================================================

export const fetchAllContactMessages = async (): Promise<
  ServiceResponse<ContactMessage[]>
> => {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data as ContactMessage[]) ?? [] };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — Get one
// ============================================================================

export const fetchContactMessageById = async (
  id: string
): Promise<ServiceResponse<ContactMessage>> => {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Message not found' };

    return { success: true, data: data as ContactMessage };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — Update status / notes
// ============================================================================

export const updateContactMessage = async (
  id: string,
  updates: Partial<{
    status: ContactMessageStatus;
    admin_notes: string | null;
    read_at: string | null;
    replied_at: string | null;
    replied_by: string | null;
  }>
): Promise<ServiceResponse<ContactMessage>> => {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as ContactMessage };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — Delete
// ============================================================================

export const deleteContactMessage = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — Mark as read (convenience)
// ============================================================================

export const markContactMessageAsRead = async (
  id: string
): Promise<ServiceResponse<ContactMessage>> => {
  return updateContactMessage(id, {
    status: 'read',
    read_at: new Date().toISOString(),
  });
};