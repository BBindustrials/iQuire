/* eslint-disable react-hooks/refs */
// ============================================================================
// iQuire — Final CTA Section (Rebuilt)
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './FinalCTA.module.css';

// Import image
import finalCTAImage from '../../assets/images/final-cta-image.png';

// ============================================================================
// Custom Hook for 4s Animation
// ============================================================================
const useSlideUp = (threshold = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
};

export const FinalCTA: React.FC = () => {
  const imageAnim = useSlideUp();
  const textAnim = useSlideUp();

  return (
    <section className={styles.finalCTA}>
      {/* ====================================================================
          SVG NET GRID BACKGROUND
          ==================================================================== */}
      <svg
        className={styles.netGrid}
        aria-hidden="true"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 900"
      >
        <defs>
          <pattern
            id="ctaNetPattern"
            x="0"
            y="0"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              stroke="#000000"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ctaNetPattern)" />
      </svg>

      {/* Background accents (Blur rings) */}
      <div className={styles.bgAccentOne} aria-hidden="true" />
      <div className={styles.bgAccentTwo} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.content}>
          {/* ================================================================
              IMAGE (Slides up)
              ================================================================ */}
          <div ref={imageAnim.ref} className={styles.imageWrapper}>
            <img
              src={finalCTAImage}
              alt="iQuire graduates ready for career opportunities"
              className={`${styles.ctaImage} ${styles.slideUpText} ${
                imageAnim.isVisible ? styles.isVisible : ''
              }`}
              loading="lazy"
            />
          </div>

          {/* ================================================================
              TEXT CONTENT (Slides up with delay)
              ================================================================ */}
          <div
            ref={textAnim.ref}
            className={`${styles.textContent} ${styles.slideUpText} ${
              textAnim.isVisible ? styles.isVisible : ''
            }`}
            style={{ transitionDelay: '0.2s' }}
          >
            <span className={styles.badge}>Ready When You Are</span>

            <h2 className={styles.title}>
              Your Career Starts With{' '}
              <span className={styles.highlight}>Being Ready.</span>
            </h2>

            <p className={styles.subtitle}>
              Learn the skills. Build your professional identity. Connect with
              opportunities. Launch the career you have been working toward.
            </p>

            <div className={styles.ctaGroup}>
              <Link to="/courses" className={styles.ctaPrimary}>
                Browse Courses
              </Link>

              <Link to="/hire-from-us" className={styles.ctaSecondary}>
                Hire Talent
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================
          BOTTOM demarcation (Brand Wave)
          ================================================================ */}
      <div className={styles.demarcationBottom} aria-hidden="true">
        <svg
          className={styles.demarcationWave}
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="ctaWaveStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2BBBAD" />
              <stop offset="100%" stopColor="#1E88E5" />
            </linearGradient>
          </defs>
          <path
            d="M0,60 C240,15 480,105 720,60 C960,15 1200,105 1440,60 L1440,120 L0,120 Z"
            fill="none"
            stroke="url(#ctaWaveStroke)"
            strokeWidth="3"
            opacity="0.6"
          />
          <path
            d="M0,60 C240,15 480,105 720,60 C960,15 1200,105 1440,60 L1440,120 L0,120 Z"
            fill="#0A192F"
          />
        </svg>
      </div>
    </section>
  );
};