// ============================================================================
// iQuire — Recruiter: Suspended (Phase 12C.3c)
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../integrations/supabase/client';
import styles from './Pending.module.css';

const CONTACT_EMAIL = 'bbaitechofficial@gmail.com';

export const RecruiterSuspended: React.FC = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState<string>('');

  useEffect(() => {
    if (!profile?.id) return;
    let isMounted = true;

    const load = async () => {
      const { data } = await supabase
        .from('recruiter_profiles')
        .select('company_name, verification_status')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (!isMounted || !data) return;

      if (data.verification_status === 'verified') {
        navigate('/recruiter/dashboard', { replace: true });
        return;
      }
      if (data.verification_status === 'pending') {
        navigate('/recruiter/pending', { replace: true });
        return;
      }

      setCompanyName(data.company_name);
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
          <div className={`${styles.icon} ${styles.iconGray}`}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path
                d="M9 12H15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <span className={`${styles.badge} ${styles.badgeGray}`}>
          Access Suspended
        </span>

        <h1 className={styles.title}>Your access has been suspended</h1>

        <p className={styles.subtitle}>
          Hi {profile?.first_name}. Access to your recruiter dashboard
          {companyName && (
            <>
              {' '}
              for <strong>{companyName}</strong>
            </>
          )}{' '}
          has been temporarily suspended.
        </p>

        <div className={styles.infoBox}>
          <div className={styles.infoIcon}>📩</div>
          <div>
            <strong>Need to discuss this?</strong>
            <p>
              Please contact our team directly to understand the reason and
              discuss next steps.
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Recruiter Account Suspended — ${companyName}`}
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