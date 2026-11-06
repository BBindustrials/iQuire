// ============================================================================
// iQuire — Member: Settings (Phase 17.9)
// ============================================================================

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../integrations/supabase/client';
import styles from './Settings.module.css';

export const MemberSettings: React.FC = () => {
  const { signOut } = useAuth();
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordReset = async () => {
    setIsResetting(true);
    setMessage(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      setMessage({ type: 'error', text: 'Could not find your email.' });
      setIsResetting(false);
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Password reset link sent to your email.' });
    }
    setIsResetting(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageSubtitle}>Manage your account preferences.</p>
        </div>
      </div>

      {message && (
        <div className={message.type === 'error' ? styles.errorBanner : styles.successBanner}>
          {message.text}
        </div>
      )}

      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>Security</h3>
        <div className={styles.settingItem}>
          <div>
            <span className={styles.settingLabel}>Password</span>
            <p className={styles.settingDesc}>Send a reset link to your email.</p>
          </div>
          <button
            onClick={handlePasswordReset}
            disabled={isResetting}
            className={styles.actionBtn}
          >
            {isResetting ? 'Sending…' : 'Reset Password'}
          </button>
        </div>
      </div>

      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>Account</h3>
        <div className={styles.settingItem}>
          <div>
            <span className={styles.settingLabel}>Sign Out</span>
            <p className={styles.settingDesc}>Log out of your iQuire account.</p>
          </div>
          <button onClick={signOut} className={styles.dangerBtn}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};