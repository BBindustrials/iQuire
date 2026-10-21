// ============================================================================
// iQuire — Edge Function: admin-create-student (Phase 16.2)
// ============================================================================
// Creates a new account (member OR admin).
// - account_type = 'member' → student with IQ ID + optional enrollment + welcome email
// - account_type = 'admin'  → admin with email-only login, no IQ ID, optional welcome email
// Admin-only. Requires service role (auto-injected).
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;

import { verifyAdmin } from '../_shared/auth.ts';
import { generateTempPassword } from '../_shared/password.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { errorResponse, successResponse } from '../_shared/response.ts';

// ============================================================================
// Request shape
// ============================================================================

interface CreateAccountRequest {
  account_type?: 'member' | 'admin'; // default: 'member'

  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  country?: string;
  state?: string;
  lga?: string;

  // member-only fields
  course_id?: string;
  cohort_id?: string;
  cohort_token?: string; // required for members (generates IQ ID)

  // admin-only fields
  bio_title?: string; // optional display title

  // controls
  send_welcome_email?: boolean; // default: true for members, true for admins
}

// ============================================================================
// Main handler
// ============================================================================

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    // ---------------------------------------------------------------------
    // 1. Verify caller is admin
    // ---------------------------------------------------------------------
    const auth = await verifyAdmin(req);
    if (!auth) {
      return errorResponse('Unauthorized. Admin access required.', 401);
    }

    const { callerId, adminClient } = auth;

    // ---------------------------------------------------------------------
    // 2. Parse + validate input
    // ---------------------------------------------------------------------
    const body: CreateAccountRequest = await req.json();

    const accountType = body.account_type ?? 'member';
    if (accountType !== 'member' && accountType !== 'admin') {
      return errorResponse(
        'account_type must be "member" or "admin"',
        400
      );
    }

    if (!body.first_name?.trim()) return errorResponse('First name is required');
    if (!body.last_name?.trim()) return errorResponse('Last name is required');
    if (!body.email?.trim()) return errorResponse('Email is required');

    const email = body.email.trim().toLowerCase();
    const firstName = body.first_name.trim();
    const lastName = body.last_name.trim();
    const middleName = body.middle_name?.trim() || '';

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse('Enter a valid email address');
    }

    // Member-specific validation
    let cohortToken: string | null = null;
    if (accountType === 'member') {
      if (!body.cohort_token?.trim()) {
        return errorResponse(
          'cohort_token is required for member accounts (e.g., "26b")'
        );
      }
      cohortToken = body.cohort_token.trim().toLowerCase();
    }

    // ---------------------------------------------------------------------
    // 3. Check for existing email
    // ---------------------------------------------------------------------
    const { data: existing } = await adminClient
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return errorResponse(
        'An account with this email already exists.',
        409
      );
    }

    // ---------------------------------------------------------------------
    // 4. Generate temp password
    // ---------------------------------------------------------------------
    const tempPassword = generateTempPassword();

    // ---------------------------------------------------------------------
    // 5. Build user metadata (differs by account_type)
    // ---------------------------------------------------------------------
    const userMetadata: Record<string, unknown> = {
      account_type: accountType,
      tier: 'verified', // both types are admin-vouched
      role: accountType, // 'member' | 'admin'
      must_change_password: true,
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      phone: body.phone?.trim() || null,
      gender: body.gender || null,
      country: body.country || 'NG',
      state: body.state || null,
      lga: body.lga || null,
      bio_title: body.bio_title?.trim() || null,
    };

    // Member-only metadata
    if (accountType === 'member' && cohortToken) {
      userMetadata.cohort_token = cohortToken;
    }

    // ---------------------------------------------------------------------
    // 6. Create auth user (trigger creates the profile)
    // ---------------------------------------------------------------------
    const { data: authUser, error: createError } =
      await adminClient.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: userMetadata,
      });

    if (createError || !authUser.user) {
      return errorResponse(
        `Failed to create user: ${createError?.message ?? 'unknown'}`,
        500
      );
    }

    const userId = authUser.user.id;

    // ---------------------------------------------------------------------
    // 7. Wait for trigger → profile row should exist
    // ---------------------------------------------------------------------
    await new Promise((resolve) => setTimeout(resolve, 500));

    // ---------------------------------------------------------------------
    // 8. Fetch the freshly created profile
    // ---------------------------------------------------------------------
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select(
        'id, iq_id, participant_id, email, first_name, last_name, bio_title'
      )
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return errorResponse(
        `User created but profile not found: ${profileError?.message ?? 'unknown'}`,
        500
      );
    }

    // ---------------------------------------------------------------------
    // 9. Set created_by_admin (audit) + bio_title if provided
    // ---------------------------------------------------------------------
    await adminClient
      .from('profiles')
      .update({
        created_by_admin: callerId,
        ...(body.bio_title?.trim()
          ? { bio_title: body.bio_title.trim() }
          : {}),
      })
      .eq('id', userId);

    // ---------------------------------------------------------------------
    // 10. MEMBER ONLY — optional course enrollment
    // ---------------------------------------------------------------------
    let enrollmentId: string | null = null;

    if (
      accountType === 'member' &&
      body.course_id &&
      body.cohort_id
    ) {
      const { data: enrollment, error: enrollError } = await adminClient
        .from('enrollments')
        .insert({
          user_id: userId,
          course_id: body.course_id,
          cohort_id: body.cohort_id,
          status: 'active',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (enrollError) {
        console.error(
          '[admin-create-student] Enrollment failed:',
          enrollError
        );
      } else {
        enrollmentId = enrollment.id;
      }
    }

    // ---------------------------------------------------------------------
    // 11. MEMBER ONLY — log to student_invites
    // ---------------------------------------------------------------------
    let inviteId: string | null = null;

    if (accountType === 'member') {
      const { data: inviteLog } = await adminClient
        .from('student_invites')
        .insert({
          user_id: userId,
          iq_id: profile.iq_id ?? '',
          email: profile.email,
          full_name: `${firstName} ${lastName}`.trim(),
          created_by: callerId,
          email_status: 'pending',
        })
        .select()
        .single();

      inviteId = inviteLog?.id ?? null;
    }

    // ---------------------------------------------------------------------
    // 12. Send welcome email (both types support it, controlled by flag)
    // ---------------------------------------------------------------------
    const shouldSendEmail = body.send_welcome_email !== false;
    let emailStatus: 'sent' | 'failed' | 'skipped' = 'skipped';
    let emailError: string | null = null;

    if (shouldSendEmail) {
      try {
        const emailPayload: Record<string, unknown> = {
          account_type: accountType,
          email: profile.email,
          first_name: firstName,
          last_name: lastName,
          temp_password: tempPassword,
          bio_title: profile.bio_title,
        };

        // Members have IQ ID + invite log
        if (accountType === 'member') {
          emailPayload.invite_id = inviteId;
          emailPayload.iq_id = profile.iq_id;
        }

        const emailRes = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-welcome-email`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: req.headers.get('Authorization') ?? '',
            },
            body: JSON.stringify(emailPayload),
          }
        );

        const emailData = await emailRes.json();

        if (emailRes.ok && emailData.success) {
          emailStatus = 'sent';
        } else {
          emailStatus = 'failed';
          emailError = emailData.error ?? 'Unknown error';
        }
      } catch (err) {
        console.error('[admin-create-student] Email send failed:', err);
        emailStatus = 'failed';
        emailError = String(err);
      }
    }

    // ---------------------------------------------------------------------
    // 13. Return credentials
    // ---------------------------------------------------------------------
    return successResponse({
      user_id: userId,
      account_type: accountType,
      email: profile.email,
      iq_id: accountType === 'member' ? profile.iq_id : null,
      participant_id: profile.participant_id,
      temp_password: tempPassword,
      full_name: `${firstName} ${lastName}`.trim(),
      enrollment_id: enrollmentId,
      invite_id: inviteId,
      email_status: emailStatus,
      email_error: emailError,
    });
  } catch (err) {
    console.error('[admin-create-student] Error:', err);
    return errorResponse(`Unexpected error: ${String(err)}`, 500);
  }
});