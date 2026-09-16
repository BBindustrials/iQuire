import React from 'react';
import { Link } from 'react-router-dom';
import { AuthHeader } from './AuthHeader';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  children: React.ReactNode;
  image: string;
  imageAlt: string;
  showHeader?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  image,
  imageAlt,
  showHeader = true,
}) => {
  return (
    <div className={styles.page}>
      {showHeader && <AuthHeader />}
      <div className={styles.pageInner}>
        {/* Green-bordered container */}
        <div className={styles.container}>
          {/* Left panel - Trimmed portrait image */}
          <div className={styles.imagePanel}>
            <img src={image} alt={imageAlt} className={styles.image} />
          </div>

          {/* Right panel - Form */}
          <div className={styles.formPanel}>
            <div className={styles.formInner}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------
// Reusable sub-components
// ----------------------------------------------------------------------------

interface AuthFooterProps {
  text: string;
  linkText: string;
  linkTo: string;
}

export const AuthFooter: React.FC<AuthFooterProps> = ({ text, linkText, linkTo }) => {
  return (
    <p className={styles.authFooter}>
      {text}{' '}
      <Link to={linkTo} className={styles.authFooterLink}>
        {linkText}
      </Link>
    </p>
  );
};

interface WelcomeBannerProps {
  title: string;
  description?: string;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ title, description }) => {
  return (
    <div className={styles.welcomeBanner}>
      <h2 className={styles.welcomeTitle}>{title}</h2>
      {description && <p className={styles.welcomeDescription}>{description}</p>}
    </div>
  );
};

interface AuthPageTitleProps {
  title: string;
  subtitle?: string;
}

export const AuthPageTitle: React.FC<AuthPageTitleProps> = ({ title, subtitle }) => {
  return (
    <div className={styles.pageTitleWrapper}>
      <h1 className={styles.pageTitle}>{title}</h1>
      {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
    </div>
  );
};