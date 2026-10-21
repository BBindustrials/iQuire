// ============================================================================
// iQuire — Admin: Admin Credential Display (Phase 16.4)
// ============================================================================
// Shown after successfully creating an admin account.
// Displays email + temp password with copy buttons.
// ============================================================================

import React, { useState } from 'react';
import type { CreateAdminResponse } from '../../services/users.service';
import styles from './AdminCredentialCard.module.css';

// ============================================================================
// Types
// ============================================================================

interface AdminCredentialCardProps {
  credentials: CreateAdminResponse;
  onClose: () => void;
  onCreateAnother: () => void;
}

// ============================================================================
// Component
// ============================================================================

export const AdminCredentialCard: React.FC<AdminCredentialCardProps> = ({
  credentials,
  onClose,
  onCreateAnother,
}) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // ignore
    }
  };

  const emailSent = credentials.email_status === 'sent';
  const emailSkipped = credentials.email_status === 'skipped';

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.checkIcon}>✓</div>
        <h2 className={styles.title}>Admin Account Created</h2>
        <p className={styles.subtitle}>
          <strong>{credentials.full_name}</strong> has been added to the
          IQuire admin team.
        </p>
      </div>

      {/* Email status */}
      {emailSent && (
        <div className={`${styles.statusBanner} ${styles.statusSuccess}`}>
          <strong>📧 Welcome email sent</strong>
          <span>Credentials were sent to {credentials.email}</span>
        </div>
      )}
      {emailSkipped && (
        <div className={`${styles.statusBanner} ${styles.statusInfo}`}>
          <strong>ℹ️ Email skipped</strong>
          <span>
            Share the credentials below with {credentials.email} manually.
          </span>
        </div>
      )}
      {!emailSent && !emailSkipped && (
        <div className={`${styles.statusBanner} ${styles.statusWarning}`}>
          <strong>⚠️ Email not sent</strong>
          <span>
            {credentials.email_error ?? 'Unknown error'}. Share the credentials
            below manually.
          </span>
        </div>
      )}

      {/* Credentials */}
      <div className={styles.credentialsBox}>
        <h3 className={styles.credentialsTitle}>Admin Login Credentials</h3>

        <div className={styles.credRow}>
          <div className={styles.credLabel}>Email</div>
          <div className={styles.credValue}>
            <code>{credentials.email}</code>
            <button
              type="button"
              className={styles.copyBtn}
              onClick={() => copy(credentials.email, 'email')}
            >
              {copied === 'email' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className={styles.credRow}>
          <div className={styles.credLabel}>Temporary Password</div>
          <div className={styles.credValue}>
            <code className={styles.credHighlight}>
              {credentials.temp_password}
            </code>
            <button
              type="button"
              className={styles.copyBtn}
              onClick={() => copy(credentials.temp_password, 'pwd')}
            >
              {copied === 'pwd' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className={styles.credRow}>
          <div className={styles.credLabel}>Admin Login URL</div>
          <div className={styles.credValue}>
            <code>{window.location.origin}/admin/login</code>
            <button
              type="button"
              className={styles.copyBtn}
              onClick={() =>
                copy(`${window.location.origin}/admin/login`, 'url')
              }
            >
              {copied === 'url' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className={styles.warningBox}>
        <strong>🔒 Important</strong>
        <p>
          This temporary password is shown <strong>only once</strong>. If you
          navigate away without sharing it, the admin will need to use the
          "Reset Password" button on the Admins list.
        </p>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={onCreateAnother}
        >
          + Create Another
        </button>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={onClose}
        >
          Done — Back to Admins
        </button>
      </div>
    </div>
  );
};