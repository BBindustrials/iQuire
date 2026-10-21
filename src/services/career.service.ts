// ============================================================================
// iQuire — Career Counselor Service (Phase 12A.4)
// ============================================================================

import { supabase } from '../integrations/supabase/client';

// ============================================================================
// Types
// ============================================================================

export interface CareerConversation {
  id: string;
  user_id: string;
  title: string;
  summary: string | null;
  message_count: number;
  last_message_at: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface CareerMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface CareerProfile {
  id: string;
  user_id: string;
  career_goal: string | null;
  target_roles: string[] | null;
  target_industries: string[] | null;
  career_field: string | null;
  current_skills: string[] | null;
  technical_skills: string[] | null;
  professional_skills: string[] | null;
  digital_skills: string[] | null;
  areas_for_development: string[] | null;
  experience_level: string | null;
  years_of_experience: number | null;
  education_level: string | null;
  field_of_study: string | null;
  opportunity_types: string[] | null;
  work_arrangements: string[] | null;
  readiness_score: number | null;
  profile_completed: boolean;
}

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// CONVERSATIONS
// ============================================================================

export const fetchConversations = async (): Promise<ServiceResponse<CareerConversation[]>> => {
  try {
    const { data, error } = await supabase
      .from('career_conversations')
      .select('*')
      .eq('archived', false)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data as CareerConversation[]) ?? [] };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const fetchConversation = async (
  id: string
): Promise<ServiceResponse<CareerConversation>> => {
  try {
    const { data, error } = await supabase
      .from('career_conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as CareerConversation };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const deleteConversation = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('career_conversations')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const renameConversation = async (
  id: string,
  title: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('career_conversations')
      .update({ title })
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// MESSAGES
// ============================================================================

export const fetchMessages = async (
  conversationId: string
): Promise<ServiceResponse<CareerMessage[]>> => {
  try {
    const { data, error } = await supabase
      .from('career_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data as CareerMessage[]) ?? [] };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// PROFILE
// ============================================================================

export const fetchCareerProfile = async (): Promise<ServiceResponse<CareerProfile>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('career_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Profile not found' };
    return { success: true, data: data as CareerProfile };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// STREAMING CHAT
// ============================================================================

export interface StreamChatOptions {
  message: string;
  conversationId?: string;
  onChunk: (text: string) => void;
  onComplete: (fullText: string, conversationId: string) => void;
  onError: (error: string) => void;
  signal?: AbortSignal;
}

/**
 * Send a message to the AI Career Counselor and stream the response.
 * Returns the resolved conversation ID.
 */
export const streamChat = async (
  options: StreamChatOptions
): Promise<{ conversationId?: string; error?: string }> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    options.onError('Not authenticated');
    return { error: 'Not authenticated' };
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const endpoint = `${supabaseUrl}/functions/v1/ai-counselor-chat`;

  let resolvedConversationId = options.conversationId;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        conversation_id: options.conversationId,
        message: options.message,
      }),
      signal: options.signal,
    });

    // Capture conversation ID from header
    const headerConvId = response.headers.get('X-Conversation-Id');
    if (headerConvId) {
      resolvedConversationId = headerConvId;
    }

    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}`;
      try {
        const errBody = await response.json();
        errorMsg = errBody.error ?? errorMsg;
      } catch {
        // ignore
      }
      options.onError(errorMsg);
      return { conversationId: resolvedConversationId, error: errorMsg };
    }

    if (!response.body) {
      const err = 'No response body';
      options.onError(err);
      return { conversationId: resolvedConversationId, error: err };
    }

    // Parse SSE stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            fullText += delta;
            options.onChunk(delta);
          }
        } catch {
          // ignore
        }
      }
    }

    options.onComplete(fullText, resolvedConversationId ?? '');
    return { conversationId: resolvedConversationId };
  } catch (err) {
    // Abort errors are silent
    if (err instanceof Error && err.name === 'AbortError') {
      return { conversationId: resolvedConversationId };
    }
    const msg = String(err);
    options.onError(msg);
    return { conversationId: resolvedConversationId, error: msg };
  }
};