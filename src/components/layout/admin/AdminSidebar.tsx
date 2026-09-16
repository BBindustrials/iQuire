import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './AdminSidebar.module.css';

// ============================================================================
// Navigation Structure
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

// --- Icons (inline SVG, lightweight) ----------------------------------------

const Icons = {
  overview: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  content: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 4H20V20H4V4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M4 9H20" stroke="currentColor" strokeWidth="2" />
      <path d="M9 4V20" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path d="M2.5 20C2.5 16.5 5.5 14 9 14C12.5 14 15.5 16.5 15.5 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M14.5 20C14.5 17.5 15.8 15.7 17.5 15.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  learning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 3L2 8L12 13L22 8L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M6 10V15C6 15 8.5 17 12 17C15.5 17 18 15 18 15V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
  career: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 7H21V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  services: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  payments: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M2 10H22" stroke="currentColor" strokeWidth="2" />
      <circle cx="6" cy="15" r="1" fill="currentColor" />
    </svg>
  ),
  community: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M17 11C17 8.24 14.76 6 12 6C9.24 6 7 8.24 7 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="7" cy="17" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="17" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  reports: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 20V10M10 20V4M16 20V14M22 20H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M19.4 15C19.2 15.6 19.3 16.2 19.6 16.7L19.7 16.9C19.9 17.1 20 17.3 20 17.6C20 17.8 19.9 18 19.7 18.2L18.2 19.7C18 19.9 17.8 20 17.6 20C17.3 20 17.1 19.9 16.9 19.7L16.7 19.6C16.2 19.3 15.6 19.2 15 19.4C14.4 19.6 14 20.1 14 20.7V21C14 21.6 13.6 22 13 22H11C10.4 22 10 21.6 10 21V20.7C10 20.1 9.6 19.6 9 19.4C8.4 19.2 7.8 19.3 7.3 19.6L7.1 19.7C6.9 19.9 6.7 20 6.4 20C6.2 20 6 19.9 5.8 19.7L4.3 18.2C4.1 18 4 17.8 4 17.6C4 17.3 4.1 17.1 4.3 16.9L4.4 16.7C4.7 16.2 4.8 15.6 4.6 15C4.4 14.4 3.9 14 3.3 14H3C2.4 14 2 13.6 2 13V11C2 10.4 2.4 10 3 10H3.3C3.9 10 4.4 9.6 4.6 9C4.8 8.4 4.7 7.8 4.4 7.3L4.3 7.1C4.1 6.9 4 6.7 4 6.4C4 6.2 4.1 6 4.3 5.8L5.8 4.3C6 4.1 6.2 4 6.4 4C6.7 4 6.9 4.1 7.1 4.3L7.3 4.4C7.8 4.7 8.4 4.8 9 4.6C9.6 4.4 10 3.9 10 3.3V3C10 2.4 10.4 2 11 2H13C13.6 2 14 2.4 14 3V3.3C14 3.9 14.4 4.4 15 4.6C15.6 4.8 16.2 4.7 16.7 4.4L16.9 4.3C17.1 4.1 17.3 4 17.6 4C17.8 4 18 4.1 18.2 4.3L19.7 5.8C19.9 6 20 6.2 20 6.4C20 6.7 19.9 6.9 19.7 7.1L19.6 7.3C19.3 7.8 19.2 8.4 19.4 9C19.6 9.6 20.1 10 20.7 10H21C21.6 10 22 10.4 22 11V13C22 13.6 21.6 14 21 14H20.7C20.1 14 19.6 14.4 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
};

// --- Navigation groups ------------------------------------------------------

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { label: 'Overview', path: '/admin/dashboard', icon: Icons.overview },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Homepage', path: '/admin/homepage', icon: Icons.content },
      { label: 'About Us', path: '/admin/about', icon: Icons.content },
      { label: 'Programs', path: '/admin/programs', icon: Icons.content },
      { label: 'Blog', path: '/admin/blog', icon: Icons.content },
      { label: 'Events', path: '/admin/events', icon: Icons.content },
      { label: 'FAQs', path: '/admin/faqs', icon: Icons.content },
      { label: 'Testimonials', path: '/admin/testimonials', icon: Icons.content },
    ],
  },
  {
    label: 'Users',
    items: [
      { label: 'Students', path: '/admin/users/students', icon: Icons.users },
      { label: 'Recruiters', path: '/admin/users/recruiters', icon: Icons.users },
      { label: 'Admins', path: '/admin/users/admins', icon: Icons.users },
    ],
  },
  {
    label: 'Learning',
    items: [
      { label: 'Courses', path: '/admin/courses', icon: Icons.learning },
      { label: 'Enrollments', path: '/admin/enrollments', icon: Icons.learning },
      { label: 'Certificates', path: '/admin/certificates', icon: Icons.learning },
    ],
  },
  {
    label: 'Talent',
    items: [
      { label: 'Talent Pool', path: '/admin/talent', icon: Icons.talent },
      { label: 'Requests', path: '/admin/talent/requests', icon: Icons.talent },
    ],
  },
  {
    label: 'Jobs',
    items: [
      { label: 'Job Listings', path: '/admin/jobs', icon: Icons.jobs },
      { label: 'Applications', path: '/admin/jobs/applications', icon: Icons.jobs },
    ],
  },
  {
    label: 'Career',
    items: [
      { label: 'Job Readiness', path: '/admin/career/readiness', icon: Icons.career },
      { label: 'Assessments', path: '/admin/career/assessments', icon: Icons.career },
    ],
  },
  {
    label: 'Services',
    items: [
      { label: 'CV Reviews', path: '/admin/services/cv-reviews', icon: Icons.services },
      { label: 'CV Builder', path: '/admin/services/cv-builder', icon: Icons.services },
    ],
  },
  {
    label: 'Payments',
    items: [
      { label: 'Transactions', path: '/admin/payments/transactions', icon: Icons.payments },
      { label: 'Revenue', path: '/admin/payments/revenue', icon: Icons.payments },
    ],
  },
  {
    label: 'Community',
    items: [
      { label: 'Alumni', path: '/admin/community/alumni', icon: Icons.community },
      { label: 'Announcements', path: '/admin/community/announcements', icon: Icons.community },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Reports', path: '/admin/reports', icon: Icons.reports },
      { label: 'Settings', path: '/admin/settings', icon: Icons.settings },
    ],
  },
];

// ============================================================================
// Component Props
// ============================================================================

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// ============================================================================
// Component
// ============================================================================

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}
        aria-label="Admin navigation"
      >
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.brandMark}>iQ</div>
          <div className={styles.brandText}>
            <span className={styles.brandName}>iQuire</span>
            <span className={styles.brandRole}>Admin</span>
          </div>
        </div>

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
                      end={item.path === '/admin/dashboard'}
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