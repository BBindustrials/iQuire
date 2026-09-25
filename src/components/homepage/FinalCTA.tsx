// ============================================================================
// iQuire — Final CTA Section (Rebuilt)
// ============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '../common/ScrollReveal';
import styles from './FinalCTA.module.css';

// Import image
import finalCTAImage from '../../assets/images/final-cta-image.png';

export const FinalCTA: React.FC = () => {
  return (
    <section className={styles.finalCTA}>
      {/* Background accents */}
      <div className={styles.bgAccentOne} aria-hidden="true" />
      <div className={styles.bgAccentTwo} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.content}>
          {/* ================================================================
              IMAGE
              ================================================================ */}
          <ScrollReveal animation="left" className={styles.imageWrapper}>
            <img
              src={finalCTAImage}
              alt="IQuire graduates ready for career opportunities"
              className={styles.ctaImage}
              loading="lazy"
            />
          </ScrollReveal>

          {/* ================================================================
              TEXT CONTENT
              ================================================================ */}
          <ScrollReveal animation="right" delay={1} className={styles.textContent}>
            <span className={styles.badge}>Ready When You Are</span>

            <h2 className={styles.title}>
              Your Career Starts With{' '}
              <span className={styles.highlight}>Being Ready.</span>
            </h2>

            <p className={styles.subtitle}>
              Learn the skills. Build your professional identity. Connect with
              opportunities. Launch the career you've been working toward.
            </p>

            <div className={styles.ctaGroup}>
              <Link to="/courses" className={styles.ctaPrimary}>
                Browse Courses
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5 12H19M19 12L12 5M19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>

              <Link to="/hire-from-us" className={styles.ctaSecondary}>
                Hire Talent
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5 12H19M19 12L12 5M19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* ================================================================
          BOTTOM demarcation
          ================================================================ */}
      <div className={styles.demarcationBottom} aria-hidden="true">
        <div className={styles.demarcationLabel}>
        </div>
        <svg
          className={styles.demarcationWave}
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,60 C240,15 480,105 720,60 C960,15 1200,105 1440,60 L1440,120 L0,120 Z"
            fill="none"
            stroke="#F9A825"
            strokeWidth="3"
            opacity="0.6"
          />
          <path
            d="M0,60 C240,15 480,105 720,60 C960,15 1200,105 1440,60 L1440,120 L0,120 Z"
            fill="#000000"
          />
        </svg>
      </div>
    </section>
  );
};