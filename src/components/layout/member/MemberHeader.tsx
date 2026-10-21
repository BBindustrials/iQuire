import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './MemberHeader.module.css';

// ============================================================================
// Component
// ============================================================================

interface MemberHeaderProps {
  onMenuToggle: () => void;
}

export const MemberHeader: React.FC<MemberHeaderProps> = ({ onMenuToggle }) => {
  const { profile, roles, signOut } = useAuth();
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
    : '';

  const initials = profile
    ? `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase()
    : 'U';

  // Contextual role label
  const roleLabel = (() => {
    const isStudent = roles.includes('student');
    const isAlumni = roles.includes('alumni');

    if (isStudent && isAlumni) return 'Student · Alumni';
    if (isAlumni) return 'Alumni';
    return 'Student';
  })();

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    navigate('/login', { replace: true });
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
        <span className={styles.headerLabel}>My Dashboard</span>
      </div>

      <div className={styles.headerActions}>
        <Link to="/courses" className={styles.browseBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 3L2 8L12 13L22 8L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M6 10V15C6 15 8.5 17 12 17C15.5 17 18 15 18 15V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>Browse Courses</span>
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
              <span className={styles.userRole}>{roleLabel}</span>
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
                {profile?.iq_id && (
                  <span className={styles.dropdownId}>
                    IQuire ID: <strong>{profile.iq_id}</strong>
                  </span>
                )}
              </div>
              <div className={styles.dropdownDivider} />
              <Link
                to="/dashboard/profile"
                className={styles.dropdownItem}
                onClick={() => setMenuOpen(false)}
              >
                My Profile
              </Link>
              <Link
                to="/dashboard/settings"
                className={styles.dropdownItem}
                onClick={() => setMenuOpen(false)}
              >
                Settings
              </Link>
              <button onClick={handleSignOut} className={styles.dropdownItem} role="menuitem">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};