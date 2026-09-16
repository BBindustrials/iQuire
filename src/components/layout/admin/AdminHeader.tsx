import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './AdminHeader.module.css';

// ============================================================================
// Component Props
// ============================================================================

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

// ============================================================================
// Component
// ============================================================================

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuToggle }) => {
  const { profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
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
    : 'Admin';

  const initials = profile
    ? `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase()
    : 'AD';

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
  };

  return (
    <header className={styles.header}>
      {/* Left: mobile menu toggle */}
      <button
        className={styles.menuToggle}
        onClick={onMenuToggle}
        aria-label="Toggle sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Center: title area */}
      <div className={styles.headerTitle}>
        <span className={styles.headerLabel}>IQuire Admin</span>
      </div>

      {/* Right: actions + user menu */}
      <div className={styles.headerActions}>
        <Link to="/" target="_blank" className={styles.viewSiteBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 13V19C18 20.1 17.1 21 16 21H5C3.9 21 3 20.1 3 19V8C3 6.9 3.9 6 5 6H11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path d="M15 3H21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>View Site</span>
        </Link>

        {/* User menu */}
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
              <span className={styles.userRole}>Administrator</span>
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
                to="/admin/settings"
                className={styles.dropdownItem}
                onClick={() => setMenuOpen(false)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M19.4 15C19.2 15.6 19.3 16.2 19.6 16.7L19.7 16.9C19.9 17.1 20 17.3 20 17.6C20 17.8 19.9 18 19.7 18.2L18.2 19.7C18 19.9 17.8 20 17.6 20C17.3 20 17.1 19.9 16.9 19.7L16.7 19.6C16.2 19.3 15.6 19.2 15 19.4C14.4 19.6 14 20.1 14 20.7V21C14 21.6 13.6 22 13 22H11C10.4 22 10 21.6 10 21V20.7C10 20.1 9.6 19.6 9 19.4C8.4 19.2 7.8 19.3 7.3 19.6L7.1 19.7C6.9 19.9 6.7 20 6.4 20C6.2 20 6 19.9 5.8 19.7L4.3 18.2C4.1 18 4 17.8 4 17.6C4 17.3 4.1 17.1 4.3 16.9L4.4 16.7C4.7 16.2 4.8 15.6 4.6 15C4.4 14.4 3.9 14 3.3 14H3C2.4 14 2 13.6 2 13V11C2 10.4 2.4 10 3 10H3.3C3.9 10 4.4 9.6 4.6 9C4.8 8.4 4.7 7.8 4.4 7.3L4.3 7.1C4.1 6.9 4 6.7 4 6.4C4 6.2 4.1 6 4.3 5.8L5.8 4.3C6 4.1 6.2 4 6.4 4C6.7 4 6.9 4.1 7.1 4.3L7.3 4.4C7.8 4.7 8.4 4.8 9 4.6C9.6 4.4 10 3.9 10 3.3V3C10 2.4 10.4 2 11 2H13C13.6 2 14 2.4 14 3V3.3C14 3.9 14.4 4.4 15 4.6C15.6 4.8 16.2 4.7 16.7 4.4L16.9 4.3C17.1 4.1 17.3 4 17.6 4C17.8 4 18 4.1 18.2 4.3L19.7 5.8C19.9 6 20 6.2 20 6.4C20 6.7 19.9 6.9 19.7 7.1L19.6 7.3C19.3 7.8 19.2 8.4 19.4 9C19.6 9.6 20.1 10 20.7 10H21C21.6 10 22 10.4 22 11V13C22 13.6 21.6 14 21 14H20.7C20.1 14 19.6 14.4 19.4 15Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
                Settings
              </Link>
              <button
                onClick={handleSignOut}
                className={styles.dropdownItem}
                role="menuitem"
              >
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