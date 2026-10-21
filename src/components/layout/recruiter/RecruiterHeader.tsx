// ============================================================================
// iQuire — Recruiter Header (Phase 12C.4)
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './RecruiterHeader.module.css';

interface RecruiterHeaderProps {
  onMenuToggle: () => void;
}

export const RecruiterHeader: React.FC<RecruiterHeaderProps> = ({ onMenuToggle }) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const displayName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : 'Recruiter';

  const initials = profile
    ? `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase()
    : 'R';

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    navigate('/login/recruiter', { replace: true });
  };

  return (
    <header className={styles.header}>
      <button
        className={styles.menuToggle}
        onClick={onMenuToggle}
        aria-label="Toggle sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <div className={styles.headerTitle}>
        <span className={styles.headerLabel}>Recruiter Dashboard</span>
      </div>

      <div className={styles.headerActions}>
        <Link to="/" className={styles.viewSiteBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M18 13V19C18 20.1 17.1 21 16 21H5C3.9 21 3 20.1 3 19V8C3 6.9 3.9 6 5 6H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M15 3H21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>View Site</span>
        </Link>

        <div className={styles.userMenu} ref={menuRef}>
          <button
            className={styles.userButton}
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <span className={styles.avatar}>{initials}</span>
            <span className={styles.userMeta}>
              <span className={styles.userName}>{displayName}</span>
              <span className={styles.userRole}>Recruiter</span>
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {menuOpen && (
            <div className={styles.dropdown} role="menu">
              <div className={styles.dropdownHeader}>
                <span className={styles.dropdownName}>{displayName}</span>
                <span className={styles.dropdownEmail}>{profile?.email}</span>
              </div>
              <div className={styles.dropdownDivider} />
              <Link
                to="/recruiter/dashboard/profile"
                className={styles.dropdownItem}
                onClick={() => setMenuOpen(false)}
              >
                Company Profile
              </Link>
              <Link
                to="/recruiter/dashboard/settings"
                className={styles.dropdownItem}
                onClick={() => setMenuOpen(false)}
              >
                Settings
              </Link>
              <button
                onClick={handleSignOut}
                className={styles.dropdownItem}
                role="menuitem"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};