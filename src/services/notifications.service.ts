// ============================================================================
// iQuire — Notifications Service (Phase 17.4)
// ============================================================================
// Sends email notifications via the send-notification-email Edge Function.
// ============================================================================

import { supabase } from '../integrations/supabase/client';

// ============================================================================
// Config
// ============================================================================

/** Where admin notifications go */
export const ADMIN_EMAIL = 'hello@iquire.io';

// ============================================================================
// Types
// ============================================================================

export interface SendNotificationInput {
  to: string | string[];
  subject: string;
  message: string;
  replyTo?: string;
  fields?: Record<string, string>;
}

interface SendNotificationResponse {
  success: boolean;
  sent?: number;
  error?: string;
}

// ============================================================================
// Base sender — calls the Edge Function
// ============================================================================

const sendNotification = async (
  input: SendNotificationInput
): Promise<SendNotificationResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke<
      SendNotificationResponse
    >('send-notification-email', {
      body: input,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return data ?? { success: false, error: 'Unknown error' };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// Contact form — admin notification
// ============================================================================

export const notifyAdminContactSubmission = async (data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<SendNotificationResponse> => {
  return sendNotification({
    to: ADMIN_EMAIL,
    subject: `New contact form: ${data.subject}`,
    replyTo: data.email,
    message: data.message,
    fields: {
      'Name': data.name,
      'Email': data.email,
      ...(data.phone ? { 'Phone': data.phone } : {}),
      'Subject': data.subject,
    },
  });
};

// ============================================================================
// Recruiter signup — admin notification
// ============================================================================

export const notifyAdminNewRecruiter = async (data: {
  fullName: string;
  email: string;
  position: string;
  companyName: string;
  industry: string;
  companyWebsite?: string;
  companySize?: string;
}): Promise<SendNotificationResponse> => {
  return sendNotification({
    to: ADMIN_EMAIL,
    subject: `New Recruiter Signup — ${data.companyName}`,
    replyTo: data.email,
    message: `A new recruiter has signed up and is awaiting verification.\n\nReview and verify in the admin dashboard:\n${typeof window !== 'undefined' ? window.location.origin : ''}/admin/recruiters`,
    fields: {
      'Company': data.companyName,
      'Industry': data.industry,
      'Contact': `${data.fullName} (${data.position})`,
      'Email': data.email,
      ...(data.companyWebsite ? { 'Website': data.companyWebsite } : {}),
      ...(data.companySize ? { 'Size': data.companySize } : {}),
    },
  });
};

// ============================================================================
// Recruiter approved — notify admin (forward to recruiter)
// ============================================================================

export const sendRecruiterApprovedEmail = async (data: {
  email: string;
  firstName: string;
  companyName: string;
}): Promise<SendNotificationResponse> => {
  return sendNotification({
    to: ADMIN_EMAIL,
    subject: `[For: ${data.email}] Recruiter Approved — ${data.companyName}`,
    message: `Hi ${data.firstName},

Great news — your account for ${data.companyName} has been verified!

You now have full access to the iQuire talent directory.

Login at: ${typeof window !== 'undefined' ? window.location.origin : ''}/login/recruiter

-----------------------------
NOTE TO ADMIN: Forward this email to ${data.email}
`,
    fields: {
      'Intended Recipient': data.email,
      'Company': data.companyName,
    },
  });
};

// ============================================================================
// Recruiter rejected — notify admin (forward to recruiter)
// ============================================================================

export const sendRecruiterRejectedEmail = async (data: {
  email: string;
  firstName: string;
  companyName: string;
  reason: string;
}): Promise<SendNotificationResponse> => {
  return sendNotification({
    to: ADMIN_EMAIL,
    subject: `[For: ${data.email}] Recruiter Rejected — ${data.companyName}`,
    message: `Hi ${data.firstName},

After reviewing your registration for ${data.companyName}, our team was unable to approve your account at this time.

Reason:
${data.reason}

If you believe this was a mistake, please reply to this email.

-----------------------------
NOTE TO ADMIN: Forward this email to ${data.email}
`,
    fields: {
      'Intended Recipient': data.email,
      'Company': data.companyName,
      'Reason': data.reason,
    },
  });
};