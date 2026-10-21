// ============================================================================
// iQuire — Recruiter: Rejected (Phase 12C.3c)
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../integrations/supabase/client';
import styles from './Pending.module.css';

const CONTACT_EMAIL = 'bbaitechofficial@gmail.com';

export const RecruiterRejected: React.FC = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [rejectedAt, setRejectedAt] = useState<string>('');

  useEffect(() => {
    if (!profile?.id) return;
    let isMounted = true;

    const load = async () => {
      const { data } = await supabase
        .from('recruiter_profiles')
        .select('company_name, rejection_reason, rejected_at, verification_status')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (!isMounted || !data) return;

      // Safety redirect — if admin flipped them back to verified, don't show this page
      if (data.verification_status === 'verified') {
        navigate('/recruiter/dashboard', { replace: true });
        return;
      }
      if (data.verification_status === 'pending') {
        navigate('/recruiter/pending', { replace: true });
        return;
      }

      setCompanyName(data.company_name);
      setReason(data.rejection_reason ?? '');
      setRejectedAt(data.rejected_at ?? '');
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [profile?.id, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login/recruiter', { replace: true });
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <div className={`${styles.icon} ${styles.iconRed}`}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path
                d="M9 9L15 15M15 9L9 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <span className={`${styles.badge} ${styles.badgeRed}`}>
          Not Approved
        </span>

        <h1 className={styles.title}>We couldn&apos;t approve your account</h1>

        <p className={styles.subtitle}>
          Hi {profile?.first_name}. After reviewing your registration
          {companyName && (
            <>
              {' '}
              for <strong>{companyName}</strong>
            </>
          )}
          , our team was unable to approve your account at this time.
        </p>

        {reason && (
          <div className={styles.reasonBox}>
            <div className={styles.reasonLabel}>Reason from our team</div>
            <p className={styles.reasonText}>{reason}</p>
          </div>
        )}

        {rejectedAt && (
          <p className={styles.metaText}>
            Reviewed on{' '}
            {new Date(rejectedAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        )}

        <div className={styles.infoBox}>
          <div className={styles.infoIcon}>🤝</div>
          <div>
            <strong>Think this was a mistake?</strong>
            <p>
              If you believe this decision was incorrect, or if you have new
              information to share, please reach out to us directly. We&apos;re
              happy to review again.
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Recruiter Appeal — ${companyName}`}
            className={styles.primaryBtn}
          >
            Contact our team
          </a>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.signOutLink}
            onClick={handleSignOut}
          >
            Sign out
          </button>
          <span className={styles.footerDot}>·</span>
          <Link to="/" className={styles.footerLink}>
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
};