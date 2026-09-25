import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './MemberHeader.module.css';

interface MemberHeaderProps {
  onMenuToggle: () => void;
}

export const MemberHeader: React.FC<MemberHeaderProps> = ({ onMenuToggle }) => {
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
    : 'Member';

  const initials = profile
    ? `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase()
    : 'M';

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
              {profile?.participant_id && (
                <span className={styles.userId}>{profile.participant_id}</span>
              )}
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
                {profile?.participant_id && (
                  <span className={styles.dropdownId}>
                    IQuire ID: <strong>{profile.participant_id}</strong>
                  </span>
                )}
              </div>
              <div className={styles.dropdownDivider} />
              <Link
                to="/dashboard/profile"
                className={styles.dropdownItem}
                onClick={() => setMenuOpen(false)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                  <path d="M4 21C4 17 7.5 14 12 14C16.5 14 20 17 20 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                My Profile
              </Link>
              <Link
                to="/dashboard/settings"
                className={styles.dropdownItem}
                onClick={() => setMenuOpen(false)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                </svg>
                Settings
              </Link>
              <button onClick={handleSignOut} className={styles.dropdownItem} role="menuitem">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};