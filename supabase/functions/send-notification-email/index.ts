// ============================================================================
// iQuire — Edge Function: send-notification-email
// ============================================================================
// Sends a simple notification email via Resend.
// Used by contact form, recruiter notifications, and other admin alerts.
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;

import { corsHeaders } from '../_shared/cors.ts';
import { errorResponse, successResponse } from '../_shared/response.ts';
import { sendEmail } from '../_shared/email.ts';

// ============================================================================
// Request shape
// ============================================================================

interface NotificationRequest {
  to: string | string[];
  subject: string;
  message: string;         // Plain text body
  replyTo?: string;
  // Optional structured data — rendered as a table above the message
  fields?: Record<string, string>;
}

// ============================================================================
// HTML builder
// ============================================================================

const buildHtml = (req: NotificationRequest): string => {
  const fieldsHtml = req.fields
    ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; margin-bottom: 24px; padding: 4px;">
        ${Object.entries(req.fields)
          .map(
            ([k, v]) => `
          <tr>
            <td style="padding: 10px 16px; font-family: -apple-system, sans-serif; font-size: 13px; font-weight: 600; color: #64748b; vertical-align: top; border-bottom: 1px solid #e5e7eb; width: 140px;">
              ${escapeHtml(k)}
            </td>
            <td style="padding: 10px 16px; font-family: -apple-system, sans-serif; font-size: 14px; color: #0f172a; vertical-align: top; border-bottom: 1px solid #e5e7eb;">
              ${escapeHtml(v)}
            </td>
          </tr>
        `
          )
          .join('')}
      </table>
    `
    : '';

  const messageHtml = escapeHtml(req.message)
    .split('\n')
    .map((line) => (line.trim() ? `<p style="margin: 0 0 12px; font-family: -apple-system, sans-serif; font-size: 15px; line-height: 1.65; color: #334155;">${line}</p>` : '<br />'))
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(req.subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">iQuire</h1>
              <p style="margin: 6px 0 0; color: #F9A825; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Notification</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px;">
              <h2 style="margin: 0 0 20px; font-family: -apple-system, sans-serif; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.01em;">
                ${escapeHtml(req.subject)}
              </h2>
              ${fieldsHtml}
              ${messageHtml}
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background-color: #f8fafc; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; font-family: -apple-system, sans-serif; font-size: 12px; color: #94a3b8;">
                © ${new Date().getFullYear()} iQuire. Confidential — for internal use only.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

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
    const body: NotificationRequest = await req.json();

    if (!body.to || !body.subject || !body.message) {
      return errorResponse('Missing required fields: to, subject, message', 400);
    }

    const recipients = Array.isArray(body.to) ? body.to : [body.to];

    if (recipients.length === 0) {
      return errorResponse('At least one recipient is required', 400);
    }

    // Validate each email
    for (const email of recipients) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return errorResponse(`Invalid recipient email: ${email}`, 400);
      }
    }

    const html = buildHtml(body);

    // Send to each recipient separately so replyTo works per-message
    const results = await Promise.all(
      recipients.map((to) =>
        sendEmail({
          to,
          subject: body.subject,
          html,
          replyTo: body.replyTo,
        })
      )
    );

    const failed = results.filter((r) => !r.success);

    if (failed.length > 0) {
      return errorResponse(
        `Email failed: ${failed.map((f) => f.error).join(', ')}`,
        500
      );
    }

    return successResponse({
      sent: recipients.length,
      message_ids: results.map((r) => r.messageId),
    });
  } catch (err) {
    console.error('[send-notification-email] Error:', err);
    return errorResponse(`Unexpected error: ${String(err)}`, 500);
  }
});