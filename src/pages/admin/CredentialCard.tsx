// ============================================================================
// iQuire — Admin: Credential Display (after student creation)
// ============================================================================

import React, { useState } from 'react';
import type { CreateStudentResponse } from '../../services/students.service';
import styles from './CredentialCard.module.css';

interface CredentialCardProps {
  credentials: CreateStudentResponse;
  onClose: () => void;
  onCreateAnother: () => void;
}

export const CredentialCard: React.FC<CredentialCardProps> = ({
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

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.checkIcon}>✓</div>
          <h2 className={styles.title}>Student Account Created</h2>
          <p className={styles.subtitle}>
            {credentials.full_name} has been added to the system.
          </p>
        </div>

        {/* Email status */}
        <div className={`${styles.statusBanner} ${emailSent ? styles.statusSuccess : styles.statusWarning}`}>
          {emailSent ? (
            <>
              <strong>📧 Welcome email sent</strong>
              <span>Credentials were sent to {credentials.email}</span>
            </>
          ) : (
            <>
              <strong>⚠️ Email not sent</strong>
              <span>
                {credentials.email_error ?? 'Unknown error'}. Please share the
                credentials below manually.
              </span>
            </>
          )}
        </div>

        {/* Credentials */}
        <div className={styles.credentialsBox}>
          <h3 className={styles.credentialsTitle}>Login Credentials</h3>

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
            <div className={styles.credLabel}>IQuire ID</div>
            <div className={styles.credValue}>
              <code className={styles.credHighlight}>{credentials.iq_id}</code>
              <button
                type="button"
                className={styles.copyBtn}
                onClick={() => copy(credentials.iq_id, 'iq_id')}
              >
                {copied === 'iq_id' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className={styles.credRow}>
            <div className={styles.credLabel}>Temp Password</div>
            <div className={styles.credValue}>
              <code className={styles.credHighlight}>{credentials.temp_password}</code>
              <button
                type="button"
                className={styles.copyBtn}
                onClick={() => copy(credentials.temp_password, 'pwd')}
              >
                {copied === 'pwd' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className={styles.warningBox}>
          <strong>⚠️ Important</strong>
          <p>
            This temporary password is shown <strong>only once</strong>. If you
            navigate away without sharing it, you'll need to reset the student's
            password.
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
            Done — Back to List
          </button>
        </div>
      </div>
    </div>
  );
};