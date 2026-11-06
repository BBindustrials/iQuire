/* eslint-disable react-hooks/refs */
// ============================================================================
// iQuire — Public Courses Landing Page (Phase 17.16 — Cohort Fee Master)
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchPublishedCoursesWithFees,
  type Course,
} from '../../services/courses.service';
import styles from './Courses.module.css';

// Extend Course locally to include cohort fee
type CourseWithCohortFee = Course & { next_cohort_fee: string | null };

// ============================================================================
// Custom Hook for 4s Animation
// ============================================================================
const useSlideUp = (threshold = 0.1, dependency: any = null) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, dependency]);

  return { ref, isVisible };
};

// ============================================================================
// Component
// ============================================================================

export const Courses: React.FC = () => {
  const [courses, setCourses] = useState<CourseWithCohortFee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const heroAnim = useSlideUp();
  const gridAnim = useSlideUp(0.1, courses.length); 
  const scholarAnim = useSlideUp();
  const ctaAnim = useSlideUp();

  // --------------------------------------------------------------------------
  // Load
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      const result = await fetchPublishedCoursesWithFees();
      if (!isMounted) return;

      if (!result.success) {
        setError(result.error ?? 'Failed to load courses');
        setCourses([]);
        setIsLoading(false);
        return;
      }

      setCourses(result.data ?? []);
      setIsLoading(false);
    };

    load();
    return () => { isMounted = false; };
  }, []);

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.coursesPage}>
      {/* HERO (Netted Blue) */}
      <section className={styles.hero}>
        <svg className={styles.netGrid} aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900">
          <defs>
            <pattern id="coursesHeroNet" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#000000" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#coursesHeroNet)" />
        </svg>

        <div className={styles.heroBgBlobOne} aria-hidden="true" />
        <div className={styles.heroBgBlobTwo} aria-hidden="true" />

        <div className="container">
          <div ref={heroAnim.ref} className={styles.heroContent}>
            <div className={`${styles.slideUpText} ${heroAnim.isVisible ? styles.isVisible : ''}`}>
              <span className={styles.badge}>Our Courses</span>
              <h1 className={styles.heroTitle}>
                Explore our <span className={styles.highlight}>courses.</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Practical courses designed to help you build skills, gain
                experience, and prepare for your next opportunity wherever you
                are in your career.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* COURSES GRID */}
      <section className={styles.listSection}>
        <div className="container">
          {isLoading ? (
            <div className={styles.grid}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.skeletonCard} />
              ))}
            </div>
          ) : error ? (
            <div className={styles.errorBox}>
              <div className={styles.errorIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 className={styles.errorTitle}>Couldn't load courses</h3>
              <p className={styles.errorText}>{error}</p>
            </div>
          ) : courses.length === 0 ? (
            <div className={styles.emptyBox}>
              <div className={styles.emptyIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <h3 className={styles.emptyTitle}>No courses available yet</h3>
              <p className={styles.emptyText}>
                Our course catalogue is being prepared. Check back soon, or
                create an account to be notified.
              </p>
              <Link to="/contact" className={styles.emptyCta}>
                Create Free Account →
              </Link>
            </div>
          ) : (
            <div ref={gridAnim.ref}>
              <div 
                className={`${styles.grid} ${styles.slideUpText} ${gridAnim.isVisible ? styles.isVisible : ''}`} 
                style={{ 
                  transitionDelay: '0.15s',
                  // Perfect 2x2 for 4 items, 3x2 for 6 items, etc.
                  gridTemplateColumns: courses.length === 4 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'
                }}
              >
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SCHOLARSHIP CALLOUT */}
      {!isLoading && !error && courses.length > 0 && (
        <section className={styles.scholarshipSection}>
          <div className="container">
            <div ref={scholarAnim.ref}>
              <div className={`${styles.scholarshipCard} ${styles.slideUpText} ${scholarAnim.isVisible ? styles.isVisible : ''}`} style={{ transitionDelay: '0.2s' }}>
                <div className={styles.scholarshipIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
                <div className={styles.scholarshipContent}>
                  <h2 className={styles.scholarshipTitle}>
                    Scholarship opportunities available
                  </h2>
                  <p className={styles.scholarshipText}>
                    Eligible participants including national service members and
                    recent graduates in select regions can apply for scholarship
                    support on qualifying courses.
                  </p>
                </div>
                <Link to="/scholarships" className={styles.scholarshipCta}>
                  Check eligibility →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FINAL CTA (Netted Blue) */}
      <section className={styles.ctaSection}>
        <svg className={styles.netGrid} aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900">
          <defs>
            <pattern id="coursesCtaNet" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#000000" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#coursesCtaNet)" />
        </svg>

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div ref={ctaAnim.ref}>
            <div className={`${styles.ctaInner} ${styles.slideUpText} ${ctaAnim.isVisible ? styles.isVisible : ''}`} style={{ transitionDelay: '0.3s' }}>
              <h2 className={styles.ctaTitle}>
                Not sure which course is right for you?
              </h2>
              <p className={styles.ctaSubtitle}>
                Talk to our AI Career Counselor or create a free account to explore everything iQuire offers.
              </p>
              <div className={styles.ctaButtons}>
                <Link to="/courses" className={styles.ctaPrimary}>
                  Get Started Free
                </Link>
                <Link to="/ai-career-counselor" className={styles.ctaSecondary}>
                  Meet Your AI Counselor →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// Course Card
// ============================================================================

interface CourseCardProps {
  course: CourseWithCohortFee;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const accentMap: Record<string, string> = {
    blue: 'accent-blue',
    green: 'accent-teal',
    purple: 'accent-gradient',
    orange: 'accent-cyan',
  };
  const accentClass = styles[accentMap[course.accent ?? 'blue'] || 'accent-blue'];
  const heroImage = course.hero_image_url ?? course.thumbnail_url ?? null;
  const displayFee = course.next_cohort_fee ?? course.pricing?.fee;

  return (
    <article className={`${styles.card} ${accentClass}`}>
      <div className={styles.cardImage}>
        {heroImage ? (
          <img src={heroImage} alt={course.title} loading="lazy" />
        ) : (
          <div className={styles.cardImagePlaceholder}>
            <span>{course.title.charAt(0)}</span>
          </div>
        )}
        <div className={styles.cardImageOverlay} />
        {course.duration && (
          <span className={styles.cardDuration}>{course.duration}</span>
        )}
      </div>

      <div className={styles.cardBody}>
        <h2 className={styles.cardTitle}>{course.title}</h2>

        {course.tagline && (
          <p className={styles.cardTagline}>{course.tagline}</p>
        )}

        {course.description && (
          <p className={styles.cardDescription}>{course.description}</p>
        )}

        <div className={styles.cardMeta}>
          {course.duration && (
            <span className={styles.cardMetaItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {course.duration}
            </span>
          )}
          {course.format && (
            <span className={styles.cardMetaItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M2 12H22M12 2V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {course.format}
            </span>
          )}
        </div>

        {displayFee && (
          <div className={styles.cardFee}>
            <span className={styles.cardFeeLabel}>Fee</span>
            <span className={styles.cardFeeValue}>{displayFee}</span>
          </div>
        )}

        <Link to={`/courses/${course.slug}`} className={styles.cardCta}>
          View Course
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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
    </article>
  );
};