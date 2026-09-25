// ============================================================================
// iQuire — Public Courses Landing Page (Phase 10D.6)
// ============================================================================
// Reads courses from Supabase. Falls back gracefully on load/error/empty.
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '../../components/common/ScrollReveal';
import {
  fetchPublishedCourses,
  type Course,
} from '../../services/courses.service';
import styles from './Courses.module.css';

// ============================================================================
// Component
// ============================================================================

export const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // Load courses on mount
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      const result = await fetchPublishedCourses();
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

    return () => {
      isMounted = false;
    };
  }, []);

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.coursesPage}>
      {/* ================================================================
          HERO
          ================================================================ */}
      <section className={styles.hero}>
        <div className={styles.heroBgBlobOne} aria-hidden="true" />
        <div className={styles.heroBgBlobTwo} aria-hidden="true" />

        <div className="container">
          <ScrollReveal animation="up" className={styles.heroContent}>
            <span className={styles.badge}>Our Courses</span>
            <h1 className={styles.heroTitle}>
              Explore our{' '}
              <span className={styles.highlight}>courses.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Practical courses designed to help you build skills, gain
              experience, and prepare for your next opportunity — wherever you
              are in your career.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ================================================================
          COURSES GRID
          ================================================================ */}
      <section className={styles.listSection}>
        <div className="container">
          {isLoading ? (
            /* Loading — shimmer cards */
            <div className={styles.grid}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className={styles.skeletonCard} />
              ))}
            </div>
          ) : error ? (
            /* Error state */
            <div className={styles.errorBox}>
              <div className={styles.errorIcon}>⚠️</div>
              <h3 className={styles.errorTitle}>Couldn't load courses</h3>
              <p className={styles.errorText}>{error}</p>
            </div>
          ) : courses.length === 0 ? (
            /* Empty state */
            <div className={styles.emptyBox}>
              <div className={styles.emptyIcon}>📚</div>
              <h3 className={styles.emptyTitle}>No courses available yet</h3>
              <p className={styles.emptyText}>
                Our course catalogue is being prepared. Check back soon, or
                create an account to be notified.
              </p>
              <Link to="/register" className={styles.emptyCta}>
                Create Free Account →
              </Link>
            </div>
          ) : (
            /* Success — grid of course cards */
            <ScrollReveal animation="up" stagger className={styles.grid}>
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* ================================================================
          SCHOLARSHIP CALLOUT
          ================================================================ */}
      {!isLoading && !error && courses.length > 0 && (
        <section className={styles.scholarshipSection}>
          <div className="container">
            <ScrollReveal animation="zoom" className={styles.scholarshipCard}>
              <div className={styles.scholarshipIcon}>🎓</div>
              <div className={styles.scholarshipContent}>
                <h2 className={styles.scholarshipTitle}>
                  Scholarship opportunities available
                </h2>
                <p className={styles.scholarshipText}>
                  Eligible participants — including national-service members and
                  recent graduates in select regions — can apply for scholarship
                  support on qualifying courses.
                </p>
              </div>
              <Link to="/scholarships" className={styles.scholarshipCta}>
                Check eligibility →
              </Link>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ================================================================
          FINAL CTA
          ================================================================ */}
      <section className={styles.ctaSection}>
        <div className="container">
          <ScrollReveal animation="up" className={styles.ctaInner}>
            <h2 className={styles.ctaTitle}>
              Not sure which course is right for you?
            </h2>
            <p className={styles.ctaSubtitle}>
              Talk to our AI Career Counselor or create a free account to
              explore everything IQuire offers.
            </p>
            <div className={styles.ctaButtons}>
              <Link to="/register" className={styles.ctaPrimary}>
                Get Started Free
              </Link>
              <Link to="/ai-career-counselor" className={styles.ctaSecondary}>
                Meet Your AI Counselor →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// Sub-component: Course Card
// ============================================================================

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const accentClass = styles[`accent-${course.accent ?? 'blue'}`];
  const heroImage =
    course.hero_image_url ??
    course.thumbnail_url ??
    null;

  return (
    <article className={`${styles.card} ${accentClass}`}>
      {/* Image */}
      <div className={styles.cardImage}>
        {heroImage ? (
          <img src={heroImage} alt={course.title} loading="lazy" />
        ) : (
          <div className={styles.cardImagePlaceholder}>
            <span>{course.emoji ?? '📚'}</span>
          </div>
        )}
        <div className={styles.cardImageOverlay} />
        {course.duration && (
          <span className={styles.cardDuration}>{course.duration}</span>
        )}
      </div>

      {/* Body */}
      <div className={styles.cardBody}>
        {course.emoji && <div className={styles.cardEmoji}>{course.emoji}</div>}

        <h2 className={styles.cardTitle}>{course.title}</h2>

        {course.tagline && (
          <p className={styles.cardTagline}>{course.tagline}</p>
        )}

        {course.description && (
          <p className={styles.cardDescription}>{course.description}</p>
        )}

        {/* Meta */}
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
          {course.level && (
            <span className={styles.cardMetaItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {course.level}
            </span>
          )}
        </div>

        {/* Next cohort — note: on listing page we don't fetch next cohort for perf reasons */}
        {/* Fee (from pricing) */}
        {course.pricing?.fee && (
          <div className={styles.cardFee}>
            <span className={styles.cardFeeLabel}>Fee</span>
            <span className={styles.cardFeeValue}>{course.pricing.fee}</span>
          </div>
        )}

        {/* CTA */}
        <Link to={`/courses/${course.slug}`} className={styles.cardCta}>
          View Course
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12H19M19 12L12 5M19 12L12 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </article>
  );
};