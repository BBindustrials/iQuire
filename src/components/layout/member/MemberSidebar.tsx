import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './MemberSidebar.module.css';

// ============================================================================
// Navigation structure (from client User Flow Document)
// ============================================================================

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// --- Icons ------------------------------------------------------------------

const Icons = {
  overview: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  learning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 3L2 8L12 13L22 8L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M6 10V15C6 15 8.5 17 12 17C15.5 17 18 15 18 15V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  career: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 7H21V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  profile: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M4 21C4 17 7.5 14 12 14C16.5 14 20 17 20 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  resources: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 4H20V20H4V4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M4 9H20" stroke="currentColor" strokeWidth="2" />
      <path d="M9 4V20" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  community: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path d="M2.5 20C2.5 16.5 5.5 14 9 14C12.5 14 15.5 16.5 15.5 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M14.5 20C14.5 17.5 15.8 15.7 17.5 15.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M19.4 15C19.2 15.6 19.3 16.2 19.6 16.7L19.7 16.9C19.9 17.1 20 17.3 20 17.6C20 17.8 19.9 18 19.7 18.2L18.2 19.7C18 19.9 17.8 20 17.6 20C17.3 20 17.1 19.9 16.9 19.7L16.7 19.6C16.2 19.3 15.6 19.2 15 19.4C14.4 19.6 14 20.1 14 20.7V21C14 21.6 13.6 22 13 22H11C10.4 22 10 21.6 10 21V20.7C10 20.1 9.6 19.6 9 19.4C8.4 19.2 7.8 19.3 7.3 19.6L7.1 19.7C6.9 19.9 6.7 20 6.4 20C6.2 20 6 19.9 5.8 19.7L4.3 18.2C4.1 18 4 17.8 4 17.6C4 17.3 4.1 17.1 4.3 16.9L4.4 16.7C4.7 16.2 4.8 15.6 4.6 15C4.4 14.4 3.9 14 3.3 14H3C2.4 14 2 13.6 2 13V11C2 10.4 2.4 10 3 10H3.3C3.9 10 4.4 9.6 4.6 9C4.8 8.4 4.7 7.8 4.4 7.3L4.3 7.1C4.1 6.9 4 6.7 4 6.4C4 6.2 4.1 6 4.3 5.8L5.8 4.3C6 4.1 6.2 4 6.4 4C6.7 4 6.9 4.1 7.1 4.3L7.3 4.4C7.8 4.7 8.4 4.8 9 4.6C9.6 4.4 10 3.9 10 3.3V3C10 2.4 10.4 2 11 2H13C13.6 2 14 2.4 14 3V3.3C14 3.9 14.4 4.4 15 4.6C15.6 4.8 16.2 4.7 16.7 4.4L16.9 4.3C17.1 4.1 17.3 4 17.6 4C17.8 4 18 4.1 18.2 4.3L19.7 5.8C19.9 6 20 6.2 20 6.4C20 6.7 19.9 6.9 19.7 7.1L19.6 7.3C19.3 7.8 19.2 8.4 19.4 9C19.6 9.6 20.1 10 20.7 10H21C21.6 10 22 10.4 22 11V13C22 13.6 21.6 14 21 14H20.7C20.1 14 19.6 14.4 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
  ai: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20.02L12 16.77L7.09 20.02L8.45 13.97L4 9.27L9.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
};

// --- Nav structure ---------------------------------------------------------

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { label: 'Overview', path: '/dashboard', icon: Icons.overview },
      { label: 'AI Career Counselor', path: '/dashboard/ai-counselor', icon: Icons.ai, badge: 'New' },
    ],
  },
  {
    label: 'My Learning',
    items: [
      { label: 'My Courses', path: '/dashboard/courses', icon: Icons.learning },
      { label: 'Classes & Live', path: '/dashboard/classes', icon: Icons.learning },
      { label: 'Calendar', path: '/dashboard/calendar', icon: Icons.learning },
      { label: 'Certificates', path: '/dashboard/certificates', icon: Icons.learning },
    ],
  },
  {
    label: 'Career',
    items: [
      { label: 'Career Journey', path: '/dashboard/career', icon: Icons.career },
      { label: 'Job Readiness', path: '/dashboard/readiness', icon: Icons.career },
      { label: 'Opportunities', path: '/dashboard/opportunities', icon: Icons.career },
    ],
  },
  {
    label: 'Professional Profile',
    items: [
      { label: 'My Profile', path: '/dashboard/profile', icon: Icons.profile },
      { label: 'CV Builder', path: '/dashboard/cv', icon: Icons.profile },
      { label: 'Portfolio', path: '/dashboard/portfolio', icon: Icons.profile },
      { label: 'LinkedIn', path: '/dashboard/linkedin', icon: Icons.profile },
    ],
  },
  {
    label: 'Resources',
    items: [
      { label: 'Career Resources', path: '/dashboard/resources', icon: Icons.resources },
    ],
  },
  {
    label: 'Community',
    items: [
      { label: 'Alumni', path: '/dashboard/alumni', icon: Icons.community },
      { label: 'Announcements', path: '/dashboard/announcements', icon: Icons.community },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Settings', path: '/dashboard/settings', icon: Icons.settings },
    ],
  },
];

// ============================================================================
// Component
// ============================================================================

interface MemberSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MemberSidebar: React.FC<MemberSidebarProps> = ({ isOpen, onClose }) => {
  const { profile, tier, roles } = useAuth();

  const displayName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : 'Member';

  const initials = profile
    ? `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase()
    : 'M';

  // Role label
  const roleLabel =
    roles.includes('alumni') && roles.includes('student')
      ? 'Student · Alumni'
      : roles.includes('alumni')
      ? 'Alumni'
      : roles.includes('student')
      ? 'Student'
      : 'Member';

  return (
    <>
      {isOpen && (
        <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}
        aria-label="Member navigation"
      >
        {/* Brand + user */}
        <Link to="/" className={styles.brand}>
          <div className={styles.brandMark}>iQ</div>
          <div className={styles.brandText}>
            <span className={styles.brandName}>iQuire</span>
            <span className={styles.brandRole}>Member</span>
          </div>
        </Link>

        {/* User card */}
        <div className={styles.userCard}>
          <div className={styles.userAvatar}>{initials}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{displayName}</span>
            <span className={styles.userRole}>{roleLabel}</span>
          </div>
        </div>

        {/* Tier warning (guest) */}
        {tier === 'guest' && (
          <div className={styles.tierWarning}>
            <span className={styles.tierWarningIcon}>⏳</span>
            <div>
              <strong>Guest account</strong>
              <br />
              <span>Some features unlock after admin verification.</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className={styles.nav}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className={styles.navGroup}>
              <div className={styles.navGroupLabel}>{group.label}</div>
              <ul className={styles.navList}>
                {group.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.path === '/dashboard'}
                      className={({ isActive }) =>
                        `${styles.navItem} ${isActive ? styles.active : ''}`
                      }
                      onClick={onClose}
                    >
                      <span className={styles.navIcon}>{item.icon}</span>
                      <span className={styles.navLabel}>{item.label}</span>
                      {item.badge && (
                        <span className={styles.navBadge}>{item.badge}</span>
                      )}
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