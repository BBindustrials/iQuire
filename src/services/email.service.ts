// ============================================================================
// iQuire — Email Service (FormSubmit)
// ============================================================================
// MVP: All emails go to the admin inbox. Admin forwards to intended recipient.
// Later: Swap to Resend when domain is verified (single file change).
// ============================================================================

// ============================================================================
// Config
// ============================================================================

/** Where ALL emails route for now (admin inbox) */
const ADMIN_EMAIL = 'bbaitechofficial@gmail.com';

/** FormSubmit AJAX endpoint */
const FORMSUBMIT_URL = (email: string) =>
  `https://formsubmit.co/ajax/${email}`;

/** Where the future branded emails will come from */
export const PUBLIC_SITE_URL = 'https://iquire.vercel.app';

// ============================================================================
// Types
// ============================================================================

interface SendEmailOptions {
  subject: string;
  message: string;
  /** Intended recipient — shown in the subject line */
  intendedFor?: string;
  replyTo?: string;
  fields?: Record<string, string>;
}

interface SendEmailResult {
  success: boolean;
  error?: string;
}

// ============================================================================
// Base sender
// ============================================================================

const sendEmail = async (options: SendEmailOptions): Promise<SendEmailResult> => {
  try {
    const fullSubject = options.intendedFor
      ? `[For: ${options.intendedFor}] ${options.subject}`
      : options.subject;

    const payload: Record<string, string> = {
      _subject: fullSubject,
      _template: 'table',
      _captcha: 'false',
      message: options.message,
      ...(options.replyTo ? { _replyto: options.replyTo } : {}),
      ...(options.fields ?? {}),
    };

    const response = await fetch(FORMSUBMIT_URL(ADMIN_EMAIL), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('[email] FormSubmit error:', text);
      return { success: false, error: `HTTP ${response.status}` };
    }

    return { success: true };
  } catch (err) {
    console.error('[email] Fetch error:', err);
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// 1. New recruiter signup — admin notification
// ============================================================================

export const notifyAdminNewRecruiter = async (data: {
  fullName: string;
  email: string;
  position: string;
  companyName: string;
  industry: string;
  companyWebsite?: string;
  companySize?: string;
}): Promise<SendEmailResult> => {
  return sendEmail({
    subject: `New Recruiter Signup — ${data.companyName}`,
    replyTo: data.email,
    message: `A new recruiter has registered on IQuire and is awaiting verification.

COMPANY
- Name: ${data.companyName}
- Industry: ${data.industry}
${data.companyWebsite ? `- Website: ${data.companyWebsite}` : ''}
${data.companySize ? `- Size: ${data.companySize}` : ''}

CONTACT
- Name: ${data.fullName}
- Position: ${data.position}
- Email: ${data.email}

ACTION
Review and verify in the admin dashboard:
${PUBLIC_SITE_URL}/admin/recruiters`,
    fields: {
      Type: 'New Recruiter Signup',
      Company: data.companyName,
      Contact: `${data.fullName} (${data.position})`,
      Email: data.email,
      Industry: data.industry,
    },
  });
};

// ============================================================================
// 2. Recruiter signup — confirmation to recruiter (via admin inbox)
// ============================================================================

export const sendRecruiterSignupConfirmation = async (data: {
  email: string;
  firstName: string;
  companyName: string;
}): Promise<SendEmailResult> => {
  return sendEmail({
    intendedFor: data.email,
    subject: `Welcome to IQuire — Verification in progress`,
    replyTo: ADMIN_EMAIL,
    message: `Hi ${data.firstName},

Thank you for registering ${data.companyName} with IQuire.

Your account has been created and is currently under review. Our team will verify your organisation details within 24–48 hours.

WHAT HAPPENS NEXT
1. Our team reviews your organisation info
2. You'll receive an email once your account is verified
3. You'll then have full access to the IQuire talent directory

You can log in at any time to check your verification status:
${PUBLIC_SITE_URL}/login/recruiter

If you have any questions, reply to this email.

— The IQuire Team

─────────────────────────────
NOTE TO ADMIN: Forward this email to ${data.email}
`,
    fields: {
      Type: 'Recruiter Confirmation',
      'Intended Recipient': data.email,
      Company: data.companyName,
    },
  });
};

// ============================================================================
// 3. Recruiter approved
// ============================================================================

export const sendRecruiterApprovedEmail = async (data: {
  email: string;
  firstName: string;
  companyName: string;
}): Promise<SendEmailResult> => {
  return sendEmail({
    intendedFor: data.email,
    subject: `Your IQuire account is verified`,
    replyTo: ADMIN_EMAIL,
    message: `Hi ${data.firstName},

Great news — your account for ${data.companyName} has been verified!

You now have full access to the IQuire talent directory. Log in to start discovering work-ready African talent:

${PUBLIC_SITE_URL}/login/recruiter

Welcome aboard.

— The IQuire Team

─────────────────────────────
NOTE TO ADMIN: Forward this email to ${data.email}
`,
    fields: {
      Type: 'Recruiter Approved',
      'Intended Recipient': data.email,
      Company: data.companyName,
    },
  });
};

// ============================================================================
// 4. Recruiter rejected
// ============================================================================

export const sendRecruiterRejectedEmail = async (data: {
  email: string;
  firstName: string;
  companyName: string;
  reason: string;
}): Promise<SendEmailResult> => {
  return sendEmail({
    intendedFor: data.email,
    subject: `Update on your IQuire registration`,
    replyTo: ADMIN_EMAIL,
    message: `Hi ${data.firstName},

Thank you for your interest in hiring IQuire talent.

After reviewing your registration for ${data.companyName}, our team was unable to approve your account at this time.

REASON
${data.reason}

If you believe this was a mistake or would like to discuss further, please reply to this email.

— The IQuire Team

─────────────────────────────
NOTE TO ADMIN: Forward this email to ${data.email}
`,
    fields: {
      Type: 'Recruiter Rejected',
      'Intended Recipient': data.email,
      Company: data.companyName,
      Reason: data.reason,
    },
  });
};

// ============================================================================
// 5. Contact form submission — admin notification
// ============================================================================

export const notifyAdminContactSubmission = async (data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<SendEmailResult> => {
  return sendEmail({
    subject: `New contact form: ${data.subject}`,
    replyTo: data.email,
    message: `A new message was submitted through the contact form.

CONTACT
- Name: ${data.name}
- Email: ${data.email}
${data.phone ? `- Phone: ${data.phone}` : ''}
- Subject: ${data.subject}

MESSAGE
${data.message}`,
    fields: {
      Type: 'Contact Form Submission',
      Name: data.name,
      Email: data.email,
      Subject: data.subject,
    },
  });
};

// ============================================================================
// 6. New job application (if/when needed)
// ============================================================================

export const notifyAdminJobApplication = async (data: {
  applicantName: string;
  applicantEmail: string;
  jobTitle: string;
  companyName: string;
  message?: string;
}): Promise<SendEmailResult> => {
  return sendEmail({
    subject: `New application — ${data.jobTitle} at ${data.companyName}`,
    replyTo: data.applicantEmail,
    message: `A new application was submitted.

APPLICANT
- Name: ${data.applicantName}
- Email: ${data.applicantEmail}

POSITION
- Role: ${data.jobTitle}
- Company: ${data.companyName}

${data.message ? `MESSAGE\n${data.message}` : ''}`,
    fields: {
      Type: 'Job Application',
      Applicant: data.applicantName,
      Role: data.jobTitle,
      Company: data.companyName,
    },
  });
};