// ============================================================================
// iQuire — Edge Function: send-welcome-email (Phase 16.2)
// ============================================================================
// Sends welcome email for BOTH member and admin accounts.
// Branches on account_type.
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;

import { verifyAdmin } from '../_shared/auth.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { errorResponse, successResponse } from '../_shared/response.ts';
import { sendEmail } from '../_shared/email.ts';
import {
  welcomeEmailHtml,
  adminWelcomeEmailHtml,
} from '../_shared/email-templates.ts';

// ============================================================================
// Request shape
// ============================================================================

interface SendWelcomeRequest {
  account_type?: 'member' | 'admin'; // default: 'member'

  email: string;
  first_name: string;
  last_name: string;
  temp_password: string;

  // member-specific
  invite_id?: string;
  iq_id?: string;

  // admin-specific
  bio_title?: string | null;
}

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
    // 1. Verify admin
    // ---------------------------------------------------------------------
    const auth = await verifyAdmin(req);
    if (!auth) {
      return errorResponse('Unauthorized. Admin access required.', 401);
    }
    const { adminClient } = auth;

    // ---------------------------------------------------------------------
    // 2. Parse
    // ---------------------------------------------------------------------
    const body: SendWelcomeRequest = await req.json();

    const accountType = body.account_type ?? 'member';

    if (!body.email || !body.temp_password) {
      return errorResponse('Missing required fields', 400);
    }

    const appUrl = Deno.env.get('APP_URL') || 'https://iquire.vercel.app';

    // ---------------------------------------------------------------------
    // 3. Branch by account_type
    // ---------------------------------------------------------------------
    let html: string;
    let subject: string;

    if (accountType === 'admin') {
      // -------- ADMIN --------
      html = adminWelcomeEmailHtml({
        firstName: body.first_name,
        lastName: body.last_name,
        email: body.email,
        tempPassword: body.temp_password,
        bioTitle: body.bio_title,
        loginUrl: appUrl,
      });
      subject = `Welcome to the IQuire Admin Team — Your login credentials`;
    } else {
      // -------- MEMBER --------
      if (!body.iq_id) {
        return errorResponse(
          'iq_id is required for member welcome emails',
          400
        );
      }

      html = welcomeEmailHtml({
        firstName: body.first_name,
        lastName: body.last_name,
        email: body.email,
        iqId: body.iq_id,
        tempPassword: body.temp_password,
        loginUrl: `${appUrl}/login`,
      });
      subject = `Welcome to IQuire — Your login credentials`;
    }

    // ---------------------------------------------------------------------
    // 4. Send via Resend
    // ---------------------------------------------------------------------
    const result = await sendEmail({
      to: body.email,
      subject,
      html,
    });

    // ---------------------------------------------------------------------
    // 5. Update student_invites log (only for members)
    // ---------------------------------------------------------------------
    if (accountType === 'member' && body.invite_id) {
      await adminClient
        .from('student_invites')
        .update({
          email_status: result.success ? 'sent' : 'failed',
          email_sent_at: result.success ? new Date().toISOString() : null,
          email_error: result.success ? null : result.error,
        })
        .eq('id', body.invite_id);
    }

    if (!result.success) {
      return errorResponse(`Email failed: ${result.error}`, 500);
    }

    return successResponse({
      message_id: result.messageId,
      sent_to: body.email,
      account_type: accountType,
    });
  } catch (err) {
    console.error('[send-welcome-email] Error:', err);
    return errorResponse(`Unexpected error: ${String(err)}`, 500);
  }
});