/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/refs */
/* eslint-disable react-hooks/set-state-in-effect */
// ============================================================================
// iQuire Public — Course Detail Page (Phase 11A.4)
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  fetchCourseBySlug,
  formatCourseDate,
  isRegistrationOpen,
  type CourseWithRelations,
} from '../../services/courses.service';
import styles from './CourseDetail.module.css';

// ============================================================================
// Custom Hook for 4s Animation (Fixed for async data)
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

export const CourseDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // State
  const [course, setCourse] = useState<CourseWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // Animation Hooks — Pass course?.id as dependency
  // --------------------------------------------------------------------------
  const heroTextAnim = useSlideUp(0.1, course?.id);
  const heroVisualAnim = useSlideUp(0.1, course?.id);
  const whyAnim = useSlideUp(0.1, course?.id);
  const learnAnim = useSlideUp(0.1, course?.id);
  const outcomesAnim = useSlideUp(0.1, course?.id);
  const faqAnim = useSlideUp(0.1, course?.id);
  const finalCtaAnim = useSlideUp(0.1, course?.id);

  // --------------------------------------------------------------------------
  // Load course
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      setNotFound(false);

      const result = await fetchCourseBySlug(slug);
      if (!isMounted) return;

      if (!result.success || !result.data) {
        const msg = result.error ?? '';
        if (msg.toLowerCase().includes('not found')) {
          setNotFound(true);
        } else {
          setError(msg || 'Failed to load course');
        }
        setIsLoading(false);
        return;
      }

      setCourse(result.data);
      setIsLoading(false);
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // --------------------------------------------------------------------------
  // Scroll to top on slug change
  // --------------------------------------------------------------------------
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // --------------------------------------------------------------------------
  // Loading State
  // --------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className={styles.courseDetail}>
        <div className="container">
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading course...</p>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Not Found State
  // --------------------------------------------------------------------------
  if (notFound || (!course && !error)) {
    return <Navigate to="/courses" replace />;
  }

  // --------------------------------------------------------------------------
  // Error State
  // --------------------------------------------------------------------------
  if (error || !course) {
    return (
      <div className={styles.courseDetail}>
        <div className="container">
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 className={styles.errorTitle}>Something went wrong</h1>
            <p className={styles.errorText}>
              {error ?? 'We could not load this course right now.'}
            </p>
            <Link to="/courses" className={styles.errorCta}>
              Back to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Safe Data Destructuring
  // --------------------------------------------------------------------------
  const nextCohort = course.next_cohort || null;
  const challenges = course.challenges || [];
  const whatYouLearn = course.what_you_learn || [];
  const outcomes = course.outcomes || [];
  const faqs = course.faqs || [];

  const canRegister = isRegistrationOpen(nextCohort);
  const registrationUrl = canRegister ? nextCohort!.registration_url! : null;

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.courseDetail}>
      {/* ================================================================
          BREADCRUMB
          ================================================================ */}
      <div className={styles.breadcrumb}>
        <div className="container">
          <Link to="/courses" className={styles.breadcrumbLink}>
            ← Back to Courses
          </Link>
        </div>
      </div>

      {/* ================================================================
          HERO
          ================================================================ */}
      <section className={styles.hero}>
        <svg className={styles.netGrid} aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900">
          <defs>
            <pattern id="heroNet" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#000000" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#heroNet)" />
        </svg>

        <div className={styles.heroBgBlob} aria-hidden="true" />
        
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className={styles.heroGrid}>
            <div ref={heroTextAnim.ref} className={styles.heroContent}>
              <div className={`${styles.slideUpText} ${heroTextAnim.isVisible ? styles.isVisible : ''}`}>
                <span className={styles.heroBadge}>
                  {[course.duration, course.format, course.level]
                    .filter(Boolean)
                    .join(' · ')}
                  {course.certificate_included && ' · Certificate'}
                </span>

                <h1 className={styles.heroTitle}>{course.title}</h1>

                {course.tagline && (
                  <p className={styles.heroTagline}>{course.tagline}</p>
                )}

                {course.description && (
                  <p className={styles.heroDescription}>{course.description}</p>
                )}

                <div className={styles.heroMeta}>
                  {course.duration && (
                    <span className={styles.metaPill}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      {course.duration}
                    </span>
                  )}
                  {course.format && (
                    <span className={styles.metaPill}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M2 12H22M12 2V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      {course.format}
                    </span>
                  )}
                  {course.certificate_included && (
                    <span className={styles.metaPill}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20.02L12 16.77L7.09 20.02L8.45 13.97L4 9.27L9.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                      </svg>
                      Certificate
                    </span>
                  )}
                </div>

                {canRegister && registrationUrl ? (
                  <div className={styles.heroCtas}>
                    <a href={registrationUrl} target="_blank" rel="noopener noreferrer" className={styles.ctaPrimary}>
                      Apply for This Cohort
                    </a>
                    <a href="#cohort" className={styles.ctaSecondary}>
                      View Cohort Details →
                    </a>
                  </div>
                ) : (
                  <div className={styles.heroCtas}>
                    <Link to="/contact" className={styles.ctaPrimary}>
                      Contact Us
                    </Link>
                    {nextCohort && (
                      <a href="#cohort" className={styles.ctaSecondary}>
                        View Cohort Details →
                      </a>
                    )}
                  </div>
                )}

                {!canRegister && (
                  <p className={styles.registrationHint}>
                    Registration isn't open right now. Contact us to be notified
                    when the next cohort opens.
                  </p>
                )}
              </div>
            </div>

            <div ref={heroVisualAnim.ref} className={styles.heroVisual}>
              <div className={`${styles.slideUpText} ${heroVisualAnim.isVisible ? styles.isVisible : ''}`} style={{ transitionDelay: '0.15s' }}>
                {course.hero_image_url && (
                  <div className={styles.heroImageFrame}>
                    <img src={course.hero_image_url} alt={course.title} className={styles.heroImage} loading="eager" />
                  </div>
                )}

                {nextCohort && (
                  <div className={styles.cohortPreviewCard} id="cohort">
                    <div className={styles.cohortPreviewHeader}>
                      <span className={styles.cohortPreviewLabel}>Next Cohort</span>
                      {nextCohort.spots_left !== null && nextCohort.spots_left !== undefined && (
                        <span className={styles.cohortSpots}>{nextCohort.spots_left} spots left</span>
                      )}
                    </div>

                    <div className={styles.cohortPreviewName}>{nextCohort.name}</div>

                    <div className={styles.cohortPreviewDetails}>
                      <div className={styles.cohortPreviewRow}>
                        <span className={styles.cohortPreviewRowLabel}>Start</span>
                        <span className={styles.cohortPreviewRowValue}>{formatCourseDate(nextCohort.start_date)}</span>
                      </div>
                      <div className={styles.cohortPreviewRow}>
                        <span className={styles.cohortPreviewRowLabel}>End</span>
                        <span className={styles.cohortPreviewRowValue}>{formatCourseDate(nextCohort.end_date)}</span>
                      </div>
                      {nextCohort.fee && (
                        <div className={styles.cohortPreviewRow}>
                          <span className={styles.cohortPreviewRowLabel}>Fee</span>
                          <span className={styles.cohortPreviewRowValueHighlight}>{nextCohort.fee}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          WHY THIS PROGRAMME
          ================================================================ */}
      {course.why_this_program && (
        <section className={styles.section}>
          <div className="container">
            <div ref={whyAnim.ref} className={styles.sectionHeader}>
              <div className={`${styles.slideUpText} ${whyAnim.isVisible ? styles.isVisible : ''}`}>
                <span className={styles.sectionBadge}>Why {course.title}?</span>
                <h2 className={styles.sectionTitle}>The problems this programme solves.</h2>
                <p className={styles.sectionText}>{course.why_this_program}</p>
              </div>
            </div>

            {challenges.length > 0 && (
              <div className={styles.challengesGrid}>
                {challenges.map((challenge, i) => (
                  <div key={i} className={styles.challengeCard}>
                    <span className={styles.challengeNumber}>0{i + 1}</span>
                    <h3 className={styles.challengeTitle}>{challenge.title}</h3>
                    <p className={styles.challengeDesc}>{challenge.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ================================================================
          WHAT YOU'LL LEARN
          ================================================================ */}
      {whatYouLearn.length > 0 && (
        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className="container">
            <div ref={learnAnim.ref} className={styles.sectionHeader}>
              <div className={`${styles.slideUpText} ${learnAnim.isVisible ? styles.isVisible : ''}`}>
                <span className={styles.sectionBadge}>What You'll Learn</span>
                <h2 className={styles.sectionTitle}>Build the skills that matter.</h2>
              </div>
            </div>

            <div className={styles.learnGrid}>
              {whatYouLearn.map((module) => (
                <div key={module.number} className={styles.learnCard}>
                  <div className={styles.learnNumber}>{module.number}</div>
                  <h3 className={styles.learnTitle}>{module.title}</h3>
                  {module.description && <p className={styles.learnDesc}>{module.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          OUTCOMES
          ================================================================ */}
      {outcomes.length > 0 && (
        <section className={styles.outcomes}>
          <svg className={styles.netGrid} aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900">
            <defs>
              <pattern id="outcomesNet" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#000000" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#outcomesNet)" />
          </svg>

          <div className={styles.outcomesBgBlob} aria-hidden="true" />
          
          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <div ref={outcomesAnim.ref} className={styles.outcomesHeader}>
              <div className={`${styles.slideUpText} ${outcomesAnim.isVisible ? styles.isVisible : ''}`}>
                <span className={styles.outcomesBadge}>By the End</span>
                <h2 className={styles.outcomesTitle}>What you'll walk away with.</h2>
              </div>
            </div>

            <div className={styles.outcomesGrid}>
              {outcomes.map((outcome, i) => (
                <div key={i} className={styles.outcomeItem}>
                  <span className={styles.outcomeCheck}>✓</span>
                  <span className={styles.outcomeText}>{outcome}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          FAQ
          ================================================================ */}
      {faqs.length > 0 && (
        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className="container">
            <div ref={faqAnim.ref} className={styles.sectionHeader}>
              <div className={`${styles.slideUpText} ${faqAnim.isVisible ? styles.isVisible : ''}`}>
                <span className={styles.sectionBadge}>FAQ</span>
                <h2 className={styles.sectionTitle}>Frequently asked questions.</h2>
              </div>
            </div>

            <div className={styles.faqList}>
              {faqs.map((faq) => (
                <details key={faq.id} className={styles.faqItem}>
                  <summary className={styles.faqQuestion}>
                    {faq.question}
                    <span className={styles.faqIcon}>+</span>
                  </summary>
                  <div className={styles.faqAnswer}>
                    <p>{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          FINAL CTA
          ================================================================ */}
      {course.final_cta?.headline && (
        <section className={styles.finalCta}>
          <svg className={styles.netGrid} aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900">
            <defs>
              <pattern id="ctaNet" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#000000" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ctaNet)" />
          </svg>

          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <div ref={finalCtaAnim.ref}>
              <div className={`${styles.finalCtaInner} ${styles.slideUpText} ${finalCtaAnim.isVisible ? styles.isVisible : ''}`}>
                <h2 className={styles.finalCtaTitle}>{course.final_cta.headline}</h2>
                {course.final_cta.subheadline && (
                  <p className={styles.finalCtaSubtitle}>{course.final_cta.subheadline}</p>
                )}
                <div className={styles.finalCtaButtons}>
                  {canRegister && registrationUrl ? (
                    <>
                      <a href={registrationUrl} target="_blank" rel="noopener noreferrer" className={styles.finalCtaPrimary}>
                        Apply for the Course
                      </a>
                      <a href="#upcoming-cohort" className={styles.finalCtaSecondary}>
                        View Upcoming Cohorts →
                      </a>
                    </>
                  ) : (
                    <Link to="/contact" className={styles.finalCtaPrimary}>
                      Contact Us
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};