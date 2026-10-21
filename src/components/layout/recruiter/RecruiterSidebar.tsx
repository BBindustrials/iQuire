// ============================================================================
// iQuire — Recruiter Sidebar (Phase 12C.4)
// ============================================================================

import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './RecruiterSidebar.module.css';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const Icons = {
  overview: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  talent: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
  jobs: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 7V5C8 3.9 8.9 3 10 3H14C15.1 3 16 3.9 16 5V7" stroke="currentColor" strokeWidth="2" />
      <path d="M2 13H22" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  profile: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 4H20V20H4V4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M4 9H20" stroke="currentColor" strokeWidth="2" />
      <path d="M9 4V20" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M19.4 15C19.2 15.6 19.3 16.2 19.6 16.7L19.7 16.9C19.9 17.1 20 17.3 20 17.6C20 17.8 19.9 18 19.7 18.2L18.2 19.7C18 19.9 17.8 20 17.6 20C17.3 20 17.1 19.9 16.9 19.7L16.7 19.6C16.2 19.3 15.6 19.2 15 19.4C14.4 19.6 14 20.1 14 20.7V21C14 21.6 13.6 22 13 22H11C10.4 22 10 21.6 10 21V20.7C10 20.1 9.6 19.6 9 19.4C8.4 19.2 7.8 19.3 7.3 19.6L7.1 19.7C6.9 19.9 6.7 20 6.4 20C6.2 20 6 19.9 5.8 19.7L4.3 18.2C4.1 18 4 17.8 4 17.6C4 17.3 4.1 17.1 4.3 16.9L4.4 16.7C4.7 16.2 4.8 15.6 4.6 15C4.4 14.4 3.9 14 3.3 14H3C2.4 14 2 13.6 2 13V11C2 10.4 2.4 10 3 10H3.3C3.9 10 4.4 9.6 4.6 9C4.8 8.4 4.7 7.8 4.4 7.3L4.3 7.1C4.1 6.9 4 6.7 4 6.4C4 6.2 4.1 6 4.3 5.8L5.8 4.3C6 4.1 6.2 4 6.4 4C6.7 4 6.9 4.1 7.1 4.3L7.3 4.4C7.8 4.7 8.4 4.8 9 4.6C9.6 4.4 10 3.9 10 3.3V3C10 2.4 10.4 2 11 2H13C13.6 2 14 2.4 14 3V3.3C14 3.9 14.4 4.4 15 4.6C15.6 4.8 16.2 4.7 16.7 4.4L16.9 4.3C17.1 4.1 17.3 4 17.6 4C17.8 4 18 4.1 18.2 4.3L19.7 5.8C19.9 6 20 6.2 20 6.4C20 6.7 19.9 6.9 19.7 7.1L19.6 7.3C19.3 7.8 19.2 8.4 19.4 9C19.6 9.6 20.1 10 20.7 10H21C21.6 10 22 10.4 22 11V13C22 13.6 21.6 14 21 14H20.7C20.1 14 19.6 14.4 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { label: 'Overview', path: '/recruiter/dashboard', icon: Icons.overview },
    ],
  },
  {
    label: 'Talent',
    items: [
      { label: 'Find Talent', path: '/recruiter/dashboard/talent', icon: Icons.talent },
      { label: 'Shortlisted', path: '/recruiter/dashboard/shortlisted', icon: Icons.talent },
    ],
  },
  {
    label: 'Jobs',
    items: [
      { label: 'My Jobs', path: '/recruiter/dashboard/jobs', icon: Icons.jobs },
      { label: 'Post a Job', path: '/recruiter/dashboard/jobs/new', icon: Icons.jobs },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Company Profile', path: '/recruiter/dashboard/profile', icon: Icons.profile },
      { label: 'Settings', path: '/recruiter/dashboard/settings', icon: Icons.settings },
    ],
  },
];

interface RecruiterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecruiterSidebar: React.FC<RecruiterSidebarProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile } = useAuth();

  const displayName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : 'Recruiter';

  const initials = profile
    ? `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase()
    : 'R';

  return (
    <>
      {isOpen && (
        <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <Link to="/recruiter/dashboard" className={styles.brand}>
          <div className={styles.brandMark}>iQ</div>
          <div className={styles.brandText}>
            <span className={styles.brandName}>iQuire</span>
            <span className={styles.brandRole}>Recruiter</span>
          </div>
        </Link>

        <div className={styles.userCard}>
          <div className={styles.userAvatar}>{initials}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{displayName}</span>
            <span className={styles.userRole}>Verified Recruiter</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className={styles.navGroup}>
              <div className={styles.navGroupLabel}>{group.label}</div>
              <ul className={styles.navList}>
                {group.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.path === '/recruiter/dashboard'}
                      className={({ isActive }) =>
                        `${styles.navItem} ${isActive ? styles.active : ''}`
                      }
                      onClick={onClose}
                    >
                      <span className={styles.navIcon}>{item.icon}</span>
                      <span className={styles.navLabel}>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};