import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AuthHeader.module.css';
import logo from '../../assets/logo/iquire-logo.png';

export const AuthHeader: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        {/* Left: Logo */}
        <Link to="/" className={styles.logo}>
          <img src={logo} alt="IQuire Logo" className={styles.logoImage} />
        </Link>

        {/* Center: Categories badge + Nav links */}
        <div className={styles.navCenter}>
          <Link to="/programs" className={styles.categoriesBadge}>
            <span className={styles.categoriesIcon}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="1"
                  y="1"
                  width="6"
                  height="6"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <rect
                  x="9"
                  y="1"
                  width="6"
                  height="6"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <rect
                  x="1"
                  y="9"
                  width="6"
                  height="6"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <rect
                  x="9"
                  y="9"
                  width="6"
                  height="6"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </span>
            <span>Categories</span>
          </Link>

          <nav className={styles.navLinks}>
            <Link to="/" className={styles.navLink}>
              Home
            </Link>
            <Link to="/programs" className={styles.navLink}>
              Courses
            </Link>
            <Link to="/contact" className={styles.navLink}>
              Contact us
            </Link>
          </nav>
        </div>

        {/* Right: CTA */}
        <div className={styles.headerRight}>
          <Link to="/get-started" className={styles.startButton}>
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
};