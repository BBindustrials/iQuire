// ============================================================================
// Standardized JSON response helpers
// ============================================================================

import { corsHeaders } from './cors.ts';

export const jsonResponse = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });

export const errorResponse = (message: string, status = 400): Response =>
  jsonResponse({ success: false, error: message }, status);

export const successResponse = (data: Record<string, unknown>): Response =>
  jsonResponse({ success: true, ...data });