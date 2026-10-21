// ============================================================================
// HTML email templates
// ============================================================================

interface WelcomeEmailData {
  firstName: string;
  lastName: string;
  email: string;
  iqId: string;
  tempPassword: string;
  loginUrl: string;
}

/**
 * Branded welcome email for newly created student accounts.
 */
export const welcomeEmailHtml = (data: WelcomeEmailData): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to IQuire</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1565C0 0%, #0D47A1 100%); padding: 40px 40px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.02em;">iQuire</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">From Skills to Opportunity</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #0f172a; font-size: 22px; font-weight: 800; letter-spacing: -0.01em;">
                Welcome to IQuire, ${data.firstName}!
              </h2>
              <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
                Your IQuire account has been created. Below are your login credentials. Please keep them safe — you'll use them to access your student dashboard.
              </p>

              <!-- Credentials box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 2px solid #e5e7eb; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px; color: #0f172a; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em;">
                      Your Login Credentials
                    </p>

                    <!-- Email -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                      <tr>
                        <td width="130" style="font-size: 13px; color: #64748b; font-weight: 600; vertical-align: top;">Email</td>
                        <td style="font-size: 15px; color: #0f172a; font-weight: 700; font-family: 'Courier New', monospace; word-break: break-all;">${data.email}</td>
                      </tr>
                    </table>

                    <!-- IQuire ID -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                      <tr>
                        <td width="130" style="font-size: 13px; color: #64748b; font-weight: 600; vertical-align: top;">IQuire ID</td>
                        <td style="font-size: 15px; color: #F57F17; font-weight: 800; font-family: 'Courier New', monospace;">${data.iqId}</td>
                      </tr>
                    </table>

                    <!-- Password -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="130" style="font-size: 13px; color: #64748b; font-weight: 600; vertical-align: top;">Temp Password</td>
                        <td style="font-size: 15px; color: #0f172a; font-weight: 700; font-family: 'Courier New', monospace;">${data.tempPassword}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fffbf0; border-left: 4px solid #F9A825; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; color: #713f12; font-size: 14px; line-height: 1.6;">
                      <strong>💡 Important:</strong> We recommend changing your password on your first login for security.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${data.loginUrl}" style="display: inline-block; padding: 14px 40px; background-color: #2E7D32; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 50px;">
                      Login to Your Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                You can log in with either your <strong>email</strong> or your <strong>IQuire ID</strong>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 8px; color: #64748b; font-size: 13px; line-height: 1.6;">
                Need help? Reply to this email or contact us at
                <a href="mailto:hello@iquire.co" style="color: #1565C0; text-decoration: none; font-weight: 600;">hello@iquire.co</a>
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                © ${new Date().getFullYear()} IQuire. All rights reserved.
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

// ============================================================================
// Admin welcome email (Phase 16.2)
// ============================================================================

interface AdminWelcomeEmailData {
  firstName: string;
  lastName: string;
  email: string;
  tempPassword: string;
  bioTitle?: string | null;
  loginUrl: string;
}

export const adminWelcomeEmailHtml = (data: AdminWelcomeEmailData): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to the IQuire Admin Team</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 40px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.02em;">iQuire Admin</h1>
              <p style="margin: 8px 0 0; color: #F9A825; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Administrator Access</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #0f172a; font-size: 22px; font-weight: 800; letter-spacing: -0.01em;">
                Welcome to the IQuire team, ${data.firstName}!
              </h2>
              <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
                Your admin account has been created. You now have full access to the IQuire admin dashboard, where you can manage students, courses, alumni, blog posts, and more.
              </p>

              ${data.bioTitle ? `<p style="margin: 0 0 24px; color: #475569; font-size: 15px; line-height: 1.6;">Your role: <strong>${data.bioTitle}</strong></p>` : ''}

              <!-- Credentials box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px; color: #991b1b; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em;">
                      ⚠️ Admin Login Credentials
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                      <tr>
                        <td width="130" style="font-size: 13px; color: #64748b; font-weight: 600; vertical-align: top;">Email</td>
                        <td style="font-size: 15px; color: #0f172a; font-weight: 700; font-family: 'Courier New', monospace; word-break: break-all;">${data.email}</td>
                      </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="130" style="font-size: 13px; color: #64748b; font-weight: 600; vertical-align: top;">Temp Password</td>
                        <td style="font-size: 15px; color: #0f172a; font-weight: 700; font-family: 'Courier New', monospace;">${data.tempPassword}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fffbf0; border-left: 4px solid #F9A825; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; color: #713f12; font-size: 14px; line-height: 1.6;">
                      <strong>🔒 Security:</strong> Change your password immediately on first login. This is a privileged account — keep your credentials safe and never share them.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${data.loginUrl}/admin/login" style="display: inline-block; padding: 14px 40px; background-color: #0f172a; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 50px;">
                      Login to Admin Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                Admin login is at <code style="background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 13px;">${data.loginUrl}/admin/login</code> — separate from the student/alumni login.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                © ${new Date().getFullYear()} IQuire. Confidential — for internal use only.
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