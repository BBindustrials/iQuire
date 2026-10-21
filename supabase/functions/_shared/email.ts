// ============================================================================
// Resend email wrapper
// ============================================================================

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Sends an email via Resend API.
 */
export const sendEmail = async (
  params: SendEmailParams
): Promise<SendEmailResult> => {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const fromEmail = Deno.env.get('EMAIL_FROM') || 'onboarding@resend.dev';
  const fromName = Deno.env.get('EMAIL_FROM_NAME') || 'iQuire';

  if (!apiKey) {
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        reply_to: params.replyTo,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[sendEmail] Resend error:', data);
      return {
        success: false,
        error: data.message || `HTTP ${response.status}`,
      };
    }

    return { success: true, messageId: data.id };
  } catch (err) {
    console.error('[sendEmail] Fetch error:', err);
    return { success: false, error: String(err) };
  }
};