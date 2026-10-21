// ============================================================================
// iQuire — Messages Service (Phase 12D.4)
// ============================================================================
// Admin-side service for contact_messages.
// ============================================================================

import { supabase } from '../integrations/supabase/client';
import type {
  ContactMessage,
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
// LIST — All messages (admin only)
// ============================================================================

export const fetchAllMessages = async (): Promise<
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
// GET ONE — Message by ID
// ============================================================================

export const fetchMessageById = async (
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
// UPDATE — Status, notes, timestamps
// ============================================================================

export const updateMessage = async (
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
// CONVENIENCE ACTIONS
// ============================================================================

export const markMessageAsRead = async (
  id: string
): Promise<ServiceResponse<ContactMessage>> => {
  return updateMessage(id, {
    status: 'read',
    read_at: new Date().toISOString(),
  });
};

export const markMessageAsReplied = async (
  id: string,
  adminId?: string
): Promise<ServiceResponse<ContactMessage>> => {
  return updateMessage(id, {
    status: 'replied',
    replied_at: new Date().toISOString(),
    replied_by: adminId ?? null,
  });
};

export const archiveMessage = async (
  id: string
): Promise<ServiceResponse<ContactMessage>> => {
  return updateMessage(id, { status: 'archived' });
};

export const restoreMessage = async (
  id: string
): Promise<ServiceResponse<ContactMessage>> => {
  return updateMessage(id, { status: 'new', read_at: null });
};

// ============================================================================
// DELETE
// ============================================================================

export const deleteMessage = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// COUNT — Unread (status = 'new')
// ============================================================================

export const fetchUnreadMessageCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new');

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
};

// ============================================================================
// Re-export types for convenience
// ============================================================================
// This lets consumers do:
//   import { type ContactMessage } from '../../services/messages.service';
// instead of reaching into content.types directly.

export type { ContactMessage, ContactMessageStatus };