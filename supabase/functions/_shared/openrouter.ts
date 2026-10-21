// ============================================================================
// iQuire — OpenRouter API wrapper
// ============================================================================

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StreamChatOptions {
  messages: ChatMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  signal?: AbortSignal;
}

// ============================================================================
// Streaming chat completion — returns a ReadableStream of text chunks
// ============================================================================

export const streamChatCompletion = async (
  options: StreamChatOptions
): Promise<Response> => {
  const apiKey = Deno.env.get('OPENROUTER_API_KEY');
  const defaultModel = Deno.env.get('AI_MODEL') || 'google/gemini-2.5-flash-lite';
  const defaultMaxTokens = parseInt(Deno.env.get('AI_MAX_TOKENS') || '2000', 10);
  const defaultTemperature = parseFloat(Deno.env.get('AI_TEMPERATURE') || '0.7');
  const siteUrl = Deno.env.get('AI_SITE_URL') || 'https://iquire.vercel.app';
  const siteName = Deno.env.get('AI_SITE_NAME') || 'iQuire';

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': siteUrl,
      'X-Title': siteName,
    },
    body: JSON.stringify({
      model: options.model || defaultModel,
      messages: options.messages,
      max_tokens: options.maxTokens ?? defaultMaxTokens,
      temperature: options.temperature ?? defaultTemperature,
      stream: true,
    }),
    signal: options.signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} — ${errorText}`);
  }

  return response;
};

// ============================================================================
// Non-streaming chat completion (for utility calls — e.g., title generation)
// ============================================================================

export interface ChatCompletionResult {
  content: string;
  promptTokens: number;
  completionTokens: number;
  model: string;
}

export const chatCompletion = async (
  messages: ChatMessage[],
  options?: { model?: string; maxTokens?: number; temperature?: number }
): Promise<ChatCompletionResult> => {
  const apiKey = Deno.env.get('OPENROUTER_API_KEY');
  const defaultModel = Deno.env.get('AI_MODEL') || 'google/gemini-2.5-flash-lite';
  const siteUrl = Deno.env.get('AI_SITE_URL') || 'https://iquire.vercel.app';
  const siteName = Deno.env.get('AI_SITE_NAME') || 'iQuire';

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': siteUrl,
      'X-Title': siteName,
    },
    body: JSON.stringify({
      model: options?.model || defaultModel,
      messages,
      max_tokens: options?.maxTokens ?? 200,
      temperature: options?.temperature ?? 0.7,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} — ${errorText}`);
  }

  const data = await response.json();

  return {
    content: data.choices?.[0]?.message?.content ?? '',
    promptTokens: data.usage?.prompt_tokens ?? 0,
    completionTokens: data.usage?.completion_tokens ?? 0,
    model: data.model ?? 'unknown',
  };
};