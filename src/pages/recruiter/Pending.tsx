// ============================================================================
// iQuire — Recruiter: Pending Verification (Phase 12C.3c)
// ============================================================================
// Shown to recruiters whose accounts are awaiting admin approval.
// Auto-polls every 30s; auto-redirects when status changes.
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../integrations/supabase/client';
import styles from './Pending.module.css';

// ============================================================================
// Config
// ============================================================================

const POLL_INTERVAL_MS = 30_000;
const CONTACT_EMAIL = 'bbaitechofficial@gmail.com';

// ============================================================================
// Component
// ============================================================================

export const RecruiterPending: React.FC = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState<string>('');
  const [position, setPosition] = useState<string>('');
  const [submittedAt, setSubmittedAt] = useState<string>('');
  const [isPolling, setIsPolling] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  // --------------------------------------------------------------------------
  // Load recruiter_profiles details
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!profile?.id) return;
    let isMounted = true;

    const load = async () => {
      const { data } = await supabase
        .from('recruiter_profiles')
        .select('company_name, position, created_at, verification_status')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (!isMounted || !data) return;

      setCompanyName(data.company_name);
      setPosition(data.position);
      setSubmittedAt(data.created_at);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [profile?.id]);

  // --------------------------------------------------------------------------
  // Poll for status changes
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!profile?.id) return;

    const check = async (silent = false) => {
      if (!silent) setIsPolling(true);
      try {
        const { data } = await supabase
          .from('recruiter_profiles')
          .select('verification_status')
          .eq('profile_id', profile.id)
          .maybeSingle();

        setLastChecked(new Date());

        if (data?.verification_status === 'verified') {
          navigate('/recruiter/dashboard', { replace: true });
        } else if (data?.verification_status === 'rejected') {
          navigate('/recruiter/rejected', { replace: true });
        } else if (data?.verification_status === 'suspended') {
          navigate('/recruiter/suspended', { replace: true });
        }
      } finally {
        if (!silent) setIsPolling(false);
      }
    };

    const interval = setInterval(() => check(true), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [profile?.id, navigate]);

  // --------------------------------------------------------------------------
  // Manual "check now"
  // --------------------------------------------------------------------------
  const handleManualCheck = async () => {
    if (!profile?.id) return;
    setIsPolling(true);

    const { data } = await supabase
      .from('recruiter_profiles')
      .select('verification_status')
      .eq('profile_id', profile.id)
      .maybeSingle();

    setLastChecked(new Date());
    setIsPolling(false);

    if (data?.verification_status === 'verified') {
      navigate('/recruiter/dashboard', { replace: true });
    } else if (data?.verification_status === 'rejected') {
      navigate('/recruiter/rejected', { replace: true });
    } else if (data?.verification_status === 'suspended') {
      navigate('/recruiter/suspended', { replace: true });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login/recruiter', { replace: true });
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Icon */}
        <div className={styles.iconWrapper}>
          <div className={styles.iconPulse} aria-hidden="true" />
          <div className={styles.icon}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path
                d="M12 7V12L15 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <span className={styles.badge}>Pending Verification</span>

        <h1 className={styles.title}>Your account is under review</h1>

        <p className={styles.subtitle}>
          Welcome to IQuire, {profile?.first_name}. We&apos;ve received your
          registration
          {companyName && (
            <>
              {' '}
              for <strong>{companyName}</strong>
            </>
          )}
          . Our team will verify your organisation details within{' '}
          <strong>24–48 hours</strong>.
        </p>

        {/* Timeline */}
        <div className={styles.timeline}>
          <TimelineStep
            icon="✓"
            label="Account created"
            description="Your registration was submitted successfully"
            status="complete"
          />
          <TimelineStep
            icon="⏳"
            label="Under review"
            description="Our team is verifying your organisation details"
            status="current"
          />
          <TimelineStep
            icon="🚀"
            label="Full access"
            description="Access the IQuire talent directory"
            status="pending"
          />
        </div>

        {/* Details summary */}
        {(companyName || position) && (
          <div className={styles.detailsBox}>
            <h3 className={styles.detailsTitle}>Your submission</h3>
            {companyName && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Company</span>
                <span className={styles.detailValue}>{companyName}</span>
              </div>
            )}
            {position && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Your position</span>
                <span className={styles.detailValue}>{position}</span>
              </div>
            )}
            {submittedAt && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Submitted</span>
                <span className={styles.detailValue}>
                  {new Date(submittedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Info banner */}
        <div className={styles.infoBox}>
          <div className={styles.infoIcon}>💡</div>
          <div>
            <strong>You can log in anytime</strong>
            <p>
              This page checks your status automatically every 30 seconds. Once
              verified, you&apos;ll be redirected to your dashboard
              automatically.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={handleManualCheck}
            disabled={isPolling}
          >
            {isPolling ? 'Checking…' : 'Check status now'}
          </button>

          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Recruiter Verification — ${companyName}`}
            className={styles.contactBtn}
          >
            Contact us
          </a>
        </div>

        <p className={styles.lastCheckedText}>
          Last checked: {lastChecked.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </p>

        {/* Footer */}
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

// ============================================================================
// Timeline step sub-component
// ============================================================================

interface TimelineStepProps {
  icon: string;
  label: string;
  description: string;
  status: 'complete' | 'current' | 'pending';
}

const TimelineStep: React.FC<TimelineStepProps> = ({ icon, label, description, status }) => (
  <div className={`${styles.timelineStep} ${styles[`timeline-${status}`]}`}>
    <div className={styles.timelineMarker}>
      <span className={styles.timelineIcon}>{icon}</span>
    </div>
    <div className={styles.timelineContent}>
      <div className={styles.timelineLabel}>{label}</div>
      <div className={styles.timelineDesc}>{description}</div>
    </div>
  </div>
);