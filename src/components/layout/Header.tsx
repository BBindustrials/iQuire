import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import { Button } from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo/iquire-logo.png';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, accountType, profile, signOut } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const loginRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // ==========================================================================
  // Navigation items (per client spec)
  // ==========================================================================
  const navItems = [
    { label: 'About Us', path: '/about' },
    { label: 'Courses', path: '/courses' },
    { label: 'Alumni', path: '/alumni' },
    { label: 'Jobs', path: '/jobs' },
    { label: 'Hire From Us', path: '/hire-from-us' },
    { label: 'AI Career Counselor', path: '/ai-career-counselor' },
    { label: 'Blog', path: '/blog' },
  ];

  // ==========================================================================
  // Scroll-hide behavior (preserved)
  // ==========================================================================
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY === 0) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleMouseEnter = () => setIsVisible(true);
  const handleMouseLeave = () => {
    if (window.scrollY > 0 && !isMenuOpen) {
      setTimeout(() => {
        if (window.scrollY > 0 && !isMenuOpen) {
          setIsVisible(false);
        }
      }, 500);
    }
  };

  // ==========================================================================
  // Close dropdowns on outside click
  // ==========================================================================
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) {
        setLoginOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ==========================================================================
  // Dashboard path for logged-in users
  // ==========================================================================
  const dashboardPath =
    accountType === 'admin'
      ? '/admin/dashboard'
      : accountType === 'recruiter'
      ? '/recruiter/dashboard'
      : '/dashboard';

  const initials = profile
    ? `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase()
    : 'U';

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut();
    navigate('/');
  };

  return (
    <header
      className={`${styles.header} ${isVisible ? styles.visible : styles.hidden}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.headerInner}>
        {/* Logo — far left */}
        <Link to="/" className={styles.logo} onClick={closeMenu}>
          <img src={logo} alt="IQuire" className={styles.logoImage} />
        </Link>

        {/* Navigation — centered */}
        <ul className={`${styles.navList} ${isMenuOpen ? styles.open : ''}`}>
          {navItems.map((item) => (
            <li key={item.path}>
              <Link to={item.path} onClick={closeMenu}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions — far right */}
        <div className={styles.navActions}>
          {isAuthenticated ? (
            /* -------- Logged in: user menu -------- */
            <div className={styles.userMenu} ref={userMenuRef}>
              <button
                className={styles.userButton}
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
              >
                <span className={styles.avatar}>{initials}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {userMenuOpen && (
                <div className={styles.dropdown} role="menu">
                  <div className={styles.dropdownHeader}>
                    <span className={styles.dropdownName}>
                      {profile?.first_name} {profile?.last_name}
                    </span>
                    <span className={styles.dropdownEmail}>{profile?.email}</span>
                  </div>
                  <div className={styles.dropdownDivider} />
                  <Link
                    to={dashboardPath}
                    className={styles.dropdownItem}
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    className={styles.dropdownItem}
                    onClick={handleSignOut}
                    role="menuitem"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* -------- Logged out: Login dropdown + Create Account -------- */
            <>
              <div className={styles.loginWrapper} ref={loginRef}>
                <button
                  className={styles.loginButton}
                  onClick={() => setLoginOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={loginOpen}
                >
                  Login
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {loginOpen && (
                  <div className={styles.dropdown} role="menu">
                    <div className={styles.dropdownGroup}>
                      <div className={styles.dropdownGroupLabel}>Sign in as</div>
                      <Link
                        to="/login"
                        className={styles.dropdownItem}
                        onClick={() => setLoginOpen(false)}
                      >
                        <span className={styles.dropdownIcon}>🎓</span>
                        <span>
                          <strong>Student / Member</strong>
                          <span className={styles.dropdownHint}>
                            Students, alumni, AI users
                          </span>
                        </span>
                      </Link>
                      <Link
                        to="/login/recruiter"
                        className={styles.dropdownItem}
                        onClick={() => setLoginOpen(false)}
                      >
                        <span className={styles.dropdownIcon}>🏢</span>
                        <span>
                          <strong>Recruiter</strong>
                          <span className={styles.dropdownHint}>
                            Hiring organisations
                          </span>
                        </span>
                      </Link>
                    </div>
                    <div className={styles.dropdownDivider} />
                    <div className={styles.dropdownFooter}>
                      New to IQuire?{' '}
                      <Link
                        to="/register"
                        onClick={() => setLoginOpen(false)}
                        className={styles.dropdownFooterLink}
                      >
                        Create an account
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Button
                variant="primary"
                color="green"
                size="sm"
                href="/register"
                className={styles.createAccountButton}
              >
                Create Account
              </Button>
            </>
          )}

          {/* Mobile toggle */}
          <button
            className={styles.mobileToggle}
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            <span className={styles.hamburger}></span>
          </button>
        </div>
      </div>
    </header>
  );
};