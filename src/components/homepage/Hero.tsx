// ============================================================================
// iQuire — Hero Section (Phase 7B.8 — Bold wave demarcation)
// ============================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import styles from './Hero.module.css';

import heroFrameBg from '../../assets/images/hero/hero-frame-bg.png';
import hero1 from '../../assets/images/hero/hero-1-education.png';
import hero2 from '../../assets/images/hero/hero-2-professionals.png';
import hero3 from '../../assets/images/hero/hero-3-recruiters.png';
import hero4 from '../../assets/images/hero/hero-4-ai.png';

// ============================================================================
// Config
// ============================================================================

/** Auto-rotate interval in milliseconds (7 seconds) */
const AUTO_ROTATE_MS = 7000;

// ============================================================================
// Slide data
// ============================================================================

interface HeroSlide {
  id: string;
  badge: string;
  badgeIcon: string;
  headline: string;
  headlineHighlight: string;
  subheadline: string;
  ctaPrimary: { label: string; to: string };
  ctaSecondary?: { label: string; to: string };
  image: string;
  imageAlt: string;
  imageSide: 'left' | 'right';
}

const SLIDES: HeroSlide[] = [
  {
    id: 'education',
    badge: 'Just Graduated? Start Here.',
    badgeIcon: '🎓',
    headline: 'You finished school.',
    headlineHighlight: 'Now what?',
    subheadline:
      'Turn your education into a real career. Learn practical skills, prepare for apprenticeships and internships, and become work-ready — wherever you are in the world.',
    ctaPrimary: { label: 'Start Learning Free', to: '/register' },
    ctaSecondary: { label: 'Explore Courses', to: '/courses' },
    image: hero1,
    imageAlt: 'Diverse young graduates celebrating with diplomas and laptops',
    imageSide: 'left',
  },
  {
    id: 'professionals',
    badge: 'Already Working? Level Up.',
    badgeIcon: '💼',
    headline: 'You started your career.',
    headlineHighlight: 'Now grow it.',
    subheadline:
      "Sharpen your skills, transition into new fields, and unlock opportunities for advancement — whether you're in tech, healthcare, engineering, or something else entirely.",
    ctaPrimary: { label: 'Upskill Now', to: '/register' },
    ctaSecondary: { label: 'See Courses', to: '/courses' },
    image: hero2,
    imageAlt: 'Young professionals across engineering, healthcare, and technology',
    imageSide: 'right',
  },
  {
    id: 'recruiters',
    badge: 'For Recruiters & Hiring Teams',
    badgeIcon: '🏢',
    headline: 'Hire trained,',
    headlineHighlight: 'work-ready talent.',
    subheadline:
      'Discover motivated young professionals trained in digital skills, workplace readiness, and modern tools. Every candidate is verified by IQuire.',
    ctaPrimary: { label: 'Hire From Us', to: '/hire-from-us' },
    ctaSecondary: { label: 'Browse Talent', to: '/hire-from-us' },
    image: hero3,
    imageAlt: 'Diverse recruiting team reviewing candidates',
    imageSide: 'left',
  },
  {
    id: 'ai-counselor',
    badge: 'Meet Your AI Career Guide',
    badgeIcon: '🤖',
    headline: 'Your personal',
    headlineHighlight: 'AI career counselor.',
    subheadline:
      'Get career direction, identify skill gaps, build your CV, match with opportunities, and prepare for interviews — all with one intelligent companion.',
    ctaPrimary: { label: 'Meet Your AI Counselor', to: '/ai-career-counselor' },
    ctaSecondary: { label: 'Try It Free', to: '/register' },
    image: hero4,
    imageAlt: 'Young professional using an AI career assistant on a tablet',
    imageSide: 'right',
  },
];

// ============================================================================
// Component
// ============================================================================

export const Hero: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

  // Ref holds the current slide index → avoids stale closures
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = currentIndex;
  }, [currentIndex]);

  const slideCount = SLIDES.length;

  const advance = useCallback(() => {
    const next = (indexRef.current + 1) % slideCount;
    setCurrentIndex(next);
    setAnimationKey((k) => k + 1);
  }, [slideCount]);

  const goToSlide = useCallback(
    (index: number) => {
      const next = ((index % slideCount) + slideCount) % slideCount;
      setCurrentIndex(next);
      setAnimationKey((k) => k + 1);
    },
    [slideCount]
  );

  const goNext = useCallback(
    () => goToSlide(currentIndex + 1),
    [currentIndex, goToSlide]
  );
  const goPrev = useCallback(
    () => goToSlide(currentIndex - 1),
    [currentIndex, goToSlide]
  );

  useEffect(() => {
    const timer = window.setInterval(advance, AUTO_ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [advance]);

  return (
    <section
      className={styles.hero}
      aria-roledescription="carousel"
      aria-label="IQuire visual story"
    >
      <div className={styles.bgAccentOne} aria-hidden="true" />
      <div className={styles.bgAccentTwo} aria-hidden="true" />

      <div className={styles.heroContainer}>
        <div className={styles.slideStage}>
          {SLIDES.map((slide, index) => {
            const isActive = index === currentIndex;
            const isReverse = slide.imageSide === 'right';

            return (
              <div
                key={slide.id}
                className={`${styles.slide} ${
                  isActive ? styles.slideActive : ''
                } ${isReverse ? styles.slideReverse : ''}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${index + 1} of ${slideCount}`}
                aria-hidden={!isActive}
              >
                {/* -------- IMAGE COLUMN -------- */}
                <div className={styles.imageColumn}>
                  <div className={styles.imageFrame}>
                    <div
                      className={styles.imageCard}
                      style={{ backgroundImage: `url(${heroFrameBg})` }}
                    >
                      <img
                        key={`img-${slide.id}-${
                          isActive ? animationKey : 'idle'
                        }`}
                        src={slide.image}
                        alt={slide.imageAlt}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        className={`${styles.imagePersona} ${
                          isActive ? styles.imageAnimate : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* -------- TEXT COLUMN -------- */}
                <div className={styles.textColumn}>
                  <div
                    className={`${styles.badge} ${
                      isActive ? styles.animateFadeUp : ''
                    }`}
                    style={{ animationDelay: '0.05s' }}
                  >
                    <span className={styles.badgeIcon}>{slide.badgeIcon}</span>
                    <span className={styles.badgeText}>{slide.badge}</span>
                  </div>

                  <h1 className={styles.headline}>
                    <span
                      className={`${styles.headlineLine} ${
                        isActive ? styles.animateFadeUp : ''
                      }`}
                      style={{ animationDelay: '0.15s' }}
                    >
                      {slide.headline}
                    </span>
                    <span
                      className={`${styles.headlineLine} ${
                        styles.headlineHighlight
                      } ${isActive ? styles.animateFadeUp : ''}`}
                      style={{ animationDelay: '0.28s' }}
                    >
                      {slide.headlineHighlight}
                    </span>
                  </h1>

                  <p
                    className={`${styles.subheadline} ${
                      isActive ? styles.animateFadeUp : ''
                    }`}
                    style={{ animationDelay: '0.42s' }}
                  >
                    {slide.subheadline}
                  </p>

                  <div
                    className={`${styles.ctaGroup} ${
                      isActive ? styles.animateFadeUp : ''
                    }`}
                    style={{ animationDelay: '0.55s' }}
                  >
                    <Button
                      variant="primary"
                      color="green"
                      size="lg"
                      href={slide.ctaPrimary.to}
                    >
                      {slide.ctaPrimary.label}
                    </Button>
                    {slide.ctaSecondary && (
                      <Link
                        to={slide.ctaSecondary.to}
                        className={styles.secondaryLink}
                      >
                        {slide.ctaSecondary.label} →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.navButton}
            onClick={goPrev}
            aria-label="Previous slide"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div
            className={styles.dots}
            role="tablist"
            aria-label="Slide navigation"
          >
            {SLIDES.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className={`${styles.dot} ${
                  index === currentIndex ? styles.dotActive : ''
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}: ${slide.badge}`}
                aria-selected={index === currentIndex}
                role="tab"
              />
            ))}
          </div>

          <button
            type="button"
            className={styles.navButton}
            onClick={goNext}
            aria-label="Next slide"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 6L15 12L9 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className={styles.srOnly} aria-live="polite" aria-atomic="true">
          {`Slide ${currentIndex + 1} of ${slideCount}: ${
            SLIDES[currentIndex].badge
          }`}
        </div>
      </div>

      {/* ==========================================================================
          SECTION DEMARCATION — bold wave into next section
          ========================================================================== */}
      <div className={styles.demarcation} aria-hidden="true">
        <div className={styles.demarcationLabel}>
          <span className={styles.demarcationLabelText}>
            Discover what's next
          </span>
        </div>

        <div className={styles.demarcationDotWrapper}>
        </div>

        <svg
          className={styles.demarcationWave}
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,60 C240,10 480,110 720,60 C960,10 1200,110 1440,60 L1440,120 L0,120 Z"
            fill="none"
            stroke="#F9A825"
            strokeWidth="3"
            opacity="0.6"
          />
          <path
            d="M0,60 C240,10 480,110 720,60 C960,10 1200,110 1440,60 L1440,120 L0,120 Z"
            fill="#f8fafc"
          />
        </svg>
      </div>
    </section>
  );
};