import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import { Button } from '../common/Button';
import logo from '../../assets/logo/iquire-logo.png';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Programs', path: '/programs' },
    { label: 'Jobs', path: '/jobs' },
    { label: 'Blog', path: '/blog' },
    { label: 'Contact Us', path: '/contact' },
  ];

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

  // Handle mouse enter to show header
  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  // Handle mouse leave to hide header
  const handleMouseLeave = () => {
    if (window.scrollY > 0 && !isMenuOpen) {
      setTimeout(() => {
        if (window.scrollY > 0 && !isMenuOpen) {
          setIsVisible(false);
        }
      }, 500);
    }
  };

  return (
    <header 
      className={`${styles.header} ${isVisible ? styles.visible : styles.hidden}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="container">
        <nav className={styles.nav}>
          {/* Logo - Extreme Left */}
          <Link to="/" className={styles.logo} onClick={closeMenu}>
            <img src={logo} alt="IQuire Logo" className={styles.logoImage} />
          </Link>

          {/* Desktop Navigation - Centered */}
          <ul className={`${styles.navList} ${isMenuOpen ? styles.open : ''}`}>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link to={item.path} onClick={closeMenu}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions - Extreme Right */}
          <div className={styles.navActions}>
            <Button 
              variant="outline" 
              color="gold" 
              size="sm" 
              href="/login"
              className={styles.loginButton}
            >
              Login
            </Button>
            <Button 
              variant="primary" 
              color="green" 
              size="sm" 
              href="/get-started"
              className={styles.getStartedButton}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Toggle */}
          <button
            className={styles.mobileToggle}
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            <span className={styles.hamburger}></span>
          </button>
        </nav>
      </div>
    </header>
  );
};