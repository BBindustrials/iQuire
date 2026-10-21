// ============================================================================
// iQuire — Recruiter Dashboard: Overview (Phase 12C.4)
// ============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Dashboard.module.css';

export const RecruiterDashboard: React.FC = () => {
  const { profile } = useAuth();
  const firstName = profile?.first_name ?? 'there';

  return (
    <div className={styles.page}>
      {/* Welcome */}
      <div className={styles.welcomeBanner}>
        <div className={styles.welcomeContent}>
          <div className={styles.verifiedBadge}>
            <span className={styles.verifiedIcon}>✓</span>
            Verified Recruiter
          </div>
          <h1 className={styles.welcomeTitle}>Welcome back, {firstName}</h1>
          <p className={styles.welcomeText}>
            Your account is verified. You now have full access to the IQuire
            talent directory.
          </p>
        </div>
      </div>

      {/* Coming next */}
      <div className={styles.comingSoonCard}>
        <div className={styles.comingSoonIcon}>🎯</div>
        <h2 className={styles.comingSoonTitle}>
          Your recruiter tools are on the way
        </h2>
        <p className={styles.comingSoonText}>
          We&apos;re building out the recruiter experience — talent search,
          shortlisting, job posting, and candidate messaging. In the meantime,
          explore what&apos;s available.
        </p>

        <div className={styles.quickLinks}>
          <Link to="/alumni" className={styles.quickLink}>
            <span className={styles.quickIcon}>👥</span>
            <span className={styles.quickLabel}>Browse Public Alumni</span>
          </Link>
          <Link to="/recruiter/dashboard/profile" className={styles.quickLink}>
            <span className={styles.quickIcon}>🏢</span>
            <span className={styles.quickLabel}>Update Company Profile</span>
          </Link>
          <Link to="/contact" className={styles.quickLink}>
            <span className={styles.quickIcon}>💬</span>
            <span className={styles.quickLabel}>Contact IQuire Team</span>
          </Link>
        </div>
      </div>
    </div>
  );
};