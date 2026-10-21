// ============================================================================
// iQuire — Edge Function: ai-counselor-chat
// ============================================================================
// Streaming chat with the AI Career Counselor.
// Loads user profile + conversation history, streams AI response,
// persists both messages.
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { errorResponse } from '../_shared/response.ts';
import { streamChatCompletion, type ChatMessage } from '../_shared/openrouter.ts';
import { buildSystemPrompt, type CareerProfileContext } from '../_shared/ai-prompts.ts';

// ============================================================================
// Request shape
// ============================================================================

interface ChatRequestBody {
  conversation_id?: string;   // optional — new conversation if missing
  message: string;
}

// ============================================================================
// Max history to load (keeps token usage bounded)
// ============================================================================

const MAX_HISTORY_MESSAGES = 20;

// ============================================================================
// Main handler
// ============================================================================

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    // ---------------------------------------------------------------------
    // 1. Auth
    // ---------------------------------------------------------------------
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return errorResponse('Unauthorized', 401);
    }

    const token = authHeader.replace('Bearer ', '').trim();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Identify caller
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return errorResponse('Unauthorized', 401);
    }
    const userId = userData.user.id;

    // Service role client for DB writes (bypasses RLS safely here)
    const adminClient = createClient(supabaseUrl, serviceKey);

    // ---------------------------------------------------------------------
    // 2. Verify user is member (student/alumni)
    // ---------------------------------------------------------------------
    const { data: profile } = await adminClient
      .from('profiles')
      .select('id, first_name, last_name, account_type, account_status')
      .eq('id', userId)
      .single();

    if (!profile) {
      return errorResponse('Profile not found', 404);
    }
    if (profile.account_type !== 'member') {
      return errorResponse('Only IQuire students and alumni can use the AI Career Counselor', 403);
    }
    if (profile.account_status !== 'active') {
      return errorResponse('Your account is not active', 403);
    }

    // ---------------------------------------------------------------------
    // 3. Parse body
    // ---------------------------------------------------------------------
    const body: ChatRequestBody = await req.json();
    if (!body.message || !body.message.trim()) {
      return errorResponse('Message is required', 400);
    }
    const userMessage = body.message.trim();

    // ---------------------------------------------------------------------
    // 4. Get or create conversation
    // ---------------------------------------------------------------------
    let conversationId = body.conversation_id;
    let isNewConversation = false;

    if (!conversationId) {
      const { data: newConvo, error: newErr } = await adminClient
        .from('career_conversations')
        .insert({
          user_id: userId,
          title: 'New conversation',
        })
        .select('id')
        .single();

      if (newErr || !newConvo) {
        return errorResponse(`Failed to create conversation: ${newErr?.message}`, 500);
      }
      conversationId = newConvo.id;
      isNewConversation = true;
    } else {
      // Verify conversation belongs to user
      const { data: existing } = await adminClient
        .from('career_conversations')
        .select('id, user_id')
        .eq('id', conversationId)
        .maybeSingle();

      if (!existing || existing.user_id !== userId) {
        return errorResponse('Conversation not found', 404);
      }
    }

    // ---------------------------------------------------------------------
    // 5. Load career profile
    // ---------------------------------------------------------------------
    const { data: careerProfile } = await adminClient
      .from('career_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // ---------------------------------------------------------------------
    // 6. Load recent message history
    // ---------------------------------------------------------------------
    const { data: history } = await adminClient
      .from('career_messages')
      .select('role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(MAX_HISTORY_MESSAGES);

    // ---------------------------------------------------------------------
    // 7. Save the user's message
    // ---------------------------------------------------------------------
    const { error: saveUserMsgError } = await adminClient
      .from('career_messages')
      .insert({
        conversation_id: conversationId,
        user_id: userId,
        role: 'user',
        content: userMessage,
      });

    if (saveUserMsgError) {
      console.error('[ai-counselor-chat] Failed to save user message:', saveUserMsgError);
    }

    // ---------------------------------------------------------------------
    // 8. Build the AI context
    // ---------------------------------------------------------------------
    const profileCtx: CareerProfileContext = {
      first_name: profile.first_name,
      full_name: `${profile.first_name} ${profile.last_name}`.trim(),
      account_type: profile.account_type,
      career_goal: careerProfile?.career_goal,
      target_roles: careerProfile?.target_roles,
      target_industries: careerProfile?.target_industries,
      career_field: careerProfile?.career_field,
      current_skills: careerProfile?.current_skills,
      technical_skills: careerProfile?.technical_skills,
      professional_skills: careerProfile?.professional_skills,
      digital_skills: careerProfile?.digital_skills,
      areas_for_development: careerProfile?.areas_for_development,
      experience_level: careerProfile?.experience_level,
      years_of_experience: careerProfile?.years_of_experience,
      education_level: careerProfile?.education_level,
      field_of_study: careerProfile?.field_of_study,
      opportunity_types: careerProfile?.opportunity_types,
      work_arrangements: careerProfile?.work_arrangements,
      readiness_score: careerProfile?.readiness_score,
      profile_completed: careerProfile?.profile_completed ?? false,
    };

    const systemPrompt = buildSystemPrompt(profileCtx);

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...(history ?? []).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: userMessage },
    ];

    // ---------------------------------------------------------------------
    // 9. Call OpenRouter (streaming)
    // ---------------------------------------------------------------------
    const aiResponse = await streamChatCompletion({ messages });

    if (!aiResponse.body) {
      return errorResponse('AI service returned an empty response', 500);
    }

    // ---------------------------------------------------------------------
    // 10. Set up a TransformStream that saves the AI response once done
    // ---------------------------------------------------------------------
    let fullAssistantContent = '';
    let completionTokens = 0;

    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();

    const writer = writable.getWriter();
    const reader = aiResponse.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    let buffer = '';

    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE lines
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (trimmed.startsWith('data: ')) {
              const data = trimmed.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  fullAssistantContent += delta;
                  // Forward the raw SSE line to the client
                  await writer.write(encoder.encode(`${line}\n`));
                }

                if (parsed.usage?.completion_tokens) {
                  completionTokens = parsed.usage.completion_tokens;
                }
              } catch {
                // ignore unparseable lines
              }
            } else {
              // Forward other lines (e.g., comments)
              await writer.write(encoder.encode(`${line}\n`));
            }
          }
        }

        // Flush any remaining buffer
        if (buffer) {
          await writer.write(encoder.encode(`${buffer}\n`));
        }
      } catch (err) {
        console.error('[ai-counselor-chat] Stream error:', err);
      } finally {
        try {
          await writer.close();
        } catch {
          // ignore
        }

        // -----------------------------------------------------------------
        // 11. Save AI response after streaming completes
        // -----------------------------------------------------------------
        if (fullAssistantContent) {
          const { error: saveAiMsgError } = await adminClient
            .from('career_messages')
            .insert({
              conversation_id: conversationId,
              user_id: userId,
              role: 'assistant',
              content: fullAssistantContent,
              completion_tokens: completionTokens || null,
              model: Deno.env.get('AI_MODEL') || 'google/gemini-2.5-flash-lite',
            });

          if (saveAiMsgError) {
            console.error('[ai-counselor-chat] Failed to save AI message:', saveAiMsgError);
          }

          // Auto-title new conversation from first user message
          if (isNewConversation) {
            const title = userMessage.slice(0, 60) + (userMessage.length > 60 ? '…' : '');
            await adminClient
              .from('career_conversations')
              .update({ title })
              .eq('id', conversationId);
          }
        }
      }
    })();

    // ---------------------------------------------------------------------
    // 12. Return the streaming response
    // ---------------------------------------------------------------------
    return new Response(readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Conversation-Id': conversationId ?? '',
      },
    });
  } catch (err) {
    console.error('[ai-counselor-chat] Error:', err);
    return errorResponse(`Unexpected error: ${String(err)}`, 500);
  }
});