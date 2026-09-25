/* eslint-disable react-hooks/set-state-in-effect */
// ============================================================================
// iQuire — Course Detail Page (Phase 10D.7)
// ============================================================================
// Reads course + next cohort + previous cohorts from Supabase.
// Handles loading, error, not-found, and empty-cohort states.
// ============================================================================

import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ScrollReveal } from '../../components/common/ScrollReveal';
import {
  fetchCourseBySlug,
  formatCourseDate,
  type CourseWithRelations,
} from '../../services/courses.service';
import styles from './CourseDetail.module.css';

// ============================================================================
// Component
// ============================================================================

export const CourseDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [course, setCourse] = useState<CourseWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openModule, setOpenModule] = useState<string | null>(null);

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
        // Distinguish "not found" from other errors
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
  // Loading
  // --------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className={styles.courseDetail}>
        <div className="container">
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading course…</p>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Not found
  // --------------------------------------------------------------------------
  if (notFound || (!course && !error)) {
    return <Navigate to="/courses" replace />;
  }

  // --------------------------------------------------------------------------
  // Error
  // --------------------------------------------------------------------------
  if (error || !course) {
    return (
      <div className={styles.courseDetail}>
        <div className="container">
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>⚠️</div>
            <h1 className={styles.errorTitle}>Something went wrong</h1>
            <p className={styles.errorText}>
              {error ?? 'We could not load this course right now.'}
            </p>
            <Link to="/courses" className={styles.errorCta}>
              ← Back to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Safe defaults
  // --------------------------------------------------------------------------
  const nextCohort = course.next_cohort;
  const previousCohorts = course.previous_cohorts;
  const accentClass = styles[`accent-${course.accent ?? 'blue'}`];

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={`${styles.courseDetail} ${accentClass}`}>
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
        <div className={styles.heroBgBlob} aria-hidden="true" />
        <div className="container">
          <div className={styles.heroGrid}>
            <ScrollReveal animation="left" className={styles.heroContent}>
              {course.emoji && <div className={styles.heroEmoji}>{course.emoji}</div>}

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
                {course.level && (
                  <span className={styles.metaPill}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {course.level}
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

              {/* Hero CTAs */}
              {nextCohort ? (
                <div className={styles.heroCtas}>
                  <Link to={`/apply/${course.slug}`} className={styles.ctaPrimary}>
                    Apply for This Cohort
                  </Link>
                  <a href="#cohort" className={styles.ctaSecondary}>
                    View Cohort Details →
                  </a>
                </div>
              ) : (
                <div className={styles.heroCtas}>
                  <Link
                    to={`/register-interest/${course.slug}`}
                    className={styles.ctaPrimary}
                  >
                    Register Your Interest
                  </Link>
                </div>
              )}
            </ScrollReveal>

            <ScrollReveal animation="right" delay={1} className={styles.heroVisual}>
              {course.hero_image_url && (
                <div className={styles.heroImageFrame}>
                  <img
                    src={course.hero_image_url}
                    alt={course.title}
                    className={styles.heroImage}
                    loading="eager"
                  />
                </div>
              )}

              {/* Next Cohort Preview Card */}
              {nextCohort && (
                <div className={styles.cohortPreviewCard} id="cohort">
                  <div className={styles.cohortPreviewHeader}>
                    <span className={styles.cohortPreviewLabel}>Next Cohort</span>
                    {nextCohort.spots_left !== null &&
                      nextCohort.spots_left !== undefined && (
                        <span className={styles.cohortSpots}>
                          {nextCohort.spots_left} spots left
                        </span>
                      )}
                  </div>

                  <div className={styles.cohortPreviewName}>{nextCohort.name}</div>

                  <div className={styles.cohortPreviewDetails}>
                    <div className={styles.cohortPreviewRow}>
                      <span className={styles.cohortPreviewRowLabel}>Start</span>
                      <span className={styles.cohortPreviewRowValue}>
                        {formatCourseDate(nextCohort.start_date)}
                      </span>
                    </div>
                    <div className={styles.cohortPreviewRow}>
                      <span className={styles.cohortPreviewRowLabel}>End</span>
                      <span className={styles.cohortPreviewRowValue}>
                        {formatCourseDate(nextCohort.end_date)}
                      </span>
                    </div>
                    {nextCohort.schedule && (
                      <div className={styles.cohortPreviewRow}>
                        <span className={styles.cohortPreviewRowLabel}>Schedule</span>
                        <span className={styles.cohortPreviewRowValue}>
                          {nextCohort.schedule}
                        </span>
                      </div>
                    )}
                    {nextCohort.fee && (
                      <div className={styles.cohortPreviewRow}>
                        <span className={styles.cohortPreviewRowLabel}>Fee</span>
                        <span className={styles.cohortPreviewRowValueHighlight}>
                          {nextCohort.fee}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ================================================================
          WHY THIS PROGRAMME
          ================================================================ */}
      {course.why_this_program && (
        <section className={styles.section}>
          <div className="container">
            <ScrollReveal animation="up" className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>Why {course.title}?</span>
              <h2 className={styles.sectionTitle}>
                The problems this programme solves.
              </h2>
              <p className={styles.sectionText}>{course.why_this_program}</p>
            </ScrollReveal>

            {course.challenges.length > 0 && (
              <ScrollReveal animation="up" stagger className={styles.challengesGrid}>
                {course.challenges.map((challenge, i) => (
                  <div key={i} className={styles.challengeCard}>
                    <span className={styles.challengeNumber}>0{i + 1}</span>
                    <h3 className={styles.challengeTitle}>{challenge.title}</h3>
                    <p className={styles.challengeDesc}>{challenge.description}</p>
                  </div>
                ))}
              </ScrollReveal>
            )}
          </div>
        </section>
      )}

      {/* ================================================================
          WHAT YOU'LL LEARN
          ================================================================ */}
      {course.what_you_learn.length > 0 && (
        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className="container">
            <ScrollReveal animation="up" className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>What You'll Learn</span>
              <h2 className={styles.sectionTitle}>Build the skills that matter.</h2>
            </ScrollReveal>

            <ScrollReveal animation="up" stagger className={styles.learnGrid}>
              {course.what_you_learn.map((module) => (
                <div key={module.number} className={styles.learnCard}>
                  <div className={styles.learnNumber}>{module.number}</div>
                  <h3 className={styles.learnTitle}>{module.title}</h3>
                  {module.description && (
                    <p className={styles.learnDesc}>{module.description}</p>
                  )}
                </div>
              ))}
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ================================================================
          WEEK JOURNEY
          ================================================================ */}
      {course.week_journey.length > 0 && (
        <section className={styles.section}>
          <div className="container">
            <ScrollReveal animation="up" className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>Your Journey</span>
              <h2 className={styles.sectionTitle}>
                What the {course.duration ?? 'programme'} looks like.
              </h2>
            </ScrollReveal>

            <ScrollReveal animation="up" stagger className={styles.timeline}>
              {course.week_journey.map((week, i) => (
                <div key={i} className={styles.timelineItem}>
                  <div className={styles.timelineNode}>
                    <span className={styles.timelineNumber}>{i + 1}</span>
                  </div>
                  <div className={styles.timelineContent}>
                    <span className={styles.timelineWeek}>{week.week}</span>
                    <h3 className={styles.timelineTitle}>{week.title}</h3>
                  </div>
                </div>
              ))}
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ================================================================
          EXPERIENCE
          ================================================================ */}
      {course.experience.length > 0 && (
        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className="container">
            <ScrollReveal animation="up" className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>Experience</span>
              <h2 className={styles.sectionTitle}>What you'll experience inside.</h2>
            </ScrollReveal>

            <ScrollReveal animation="up" stagger className={styles.experienceGrid}>
              {course.experience.map((item, i) => (
                <div key={i} className={styles.experienceItem}>
                  <span className={styles.experienceCheck}>✓</span>
                  <span className={styles.experienceText}>{item}</span>
                </div>
              ))}
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ================================================================
          OUTCOMES
          ================================================================ */}
      {course.outcomes.length > 0 && (
        <section className={styles.outcomes}>
          <div className={styles.outcomesBgBlob} aria-hidden="true" />
          <div className="container">
            <ScrollReveal animation="up" className={styles.outcomesHeader}>
              <span className={styles.outcomesBadge}>By the End</span>
              <h2 className={styles.outcomesTitle}>What you'll walk away with.</h2>
            </ScrollReveal>

            <ScrollReveal animation="up" stagger className={styles.outcomesGrid}>
              {course.outcomes.map((outcome, i) => (
                <div key={i} className={styles.outcomeItem}>
                  <span className={styles.outcomeCheck}>✓</span>
                  <span className={styles.outcomeText}>{outcome}</span>
                </div>
              ))}
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ================================================================
          WHO IT'S FOR + CAREER VALUE
          ================================================================ */}
      {(course.who_its_for.length > 0 ||
        course.skills_professional.length > 0 ||
        course.skills_digital.length > 0 ||
        course.skills_career.length > 0) && (
        <section className={styles.section}>
          <div className="container">
            <div className={styles.twoColGrid}>
              {/* Who it's for */}
              {course.who_its_for.length > 0 && (
                <ScrollReveal animation="left" className={styles.infoBlock}>
                  <span className={styles.sectionBadge}>Who It's For</span>
                  <h2 className={styles.sectionTitle}>This programme is for…</h2>

                  <ul className={styles.whoList}>
                    {course.who_its_for.map((who, i) => (
                      <li key={i} className={styles.whoItem}>
                        <span className={styles.whoCheck}>✓</span>
                        <span>{who}</span>
                      </li>
                    ))}
                  </ul>

                  {course.prerequisites && (
                    <div className={styles.prereqBox}>
                      <strong>Prerequisites:</strong> {course.prerequisites}
                    </div>
                  )}
                </ScrollReveal>
              )}

              {/* Career value */}
              {(course.skills_professional.length > 0 ||
                course.skills_digital.length > 0 ||
                course.skills_career.length > 0) && (
                <ScrollReveal animation="right" delay={1} className={styles.infoBlock}>
                  <span className={styles.sectionBadge}>Career Value</span>
                  <h2 className={styles.sectionTitle}>Skills you'll build.</h2>

                  <div className={styles.skillsBlock}>
                    {course.skills_professional.length > 0 && (
                      <div className={styles.skillsGroup}>
                        <h4 className={styles.skillsLabel}>Professional</h4>
                        <div className={styles.skillsTags}>
                          {course.skills_professional.map((skill, i) => (
                            <span key={i} className={styles.skillTag}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {course.skills_digital.length > 0 && (
                      <div className={styles.skillsGroup}>
                        <h4 className={styles.skillsLabel}>Digital</h4>
                        <div className={styles.skillsTags}>
                          {course.skills_digital.map((skill, i) => (
                            <span key={i} className={styles.skillTag}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {course.skills_career.length > 0 && (
                      <div className={styles.skillsGroup}>
                        <h4 className={styles.skillsLabel}>Career</h4>
                        <div className={styles.skillsTags}>
                          {course.skills_career.map((skill, i) => (
                            <span key={i} className={styles.skillTag}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          CURRICULUM (Accordion)
          ================================================================ */}
      {course.curriculum.length > 0 && (
        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className="container">
            <ScrollReveal animation="up" className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>Curriculum</span>
              <h2 className={styles.sectionTitle}>Course content.</h2>
            </ScrollReveal>

            <ScrollReveal animation="up" className={styles.accordion}>
              {course.curriculum.map((module) => {
                const isOpen = openModule === module.number;
                return (
                  <div
                    key={module.number}
                    className={`${styles.accordionItem} ${
                      isOpen ? styles.accordionItemOpen : ''
                    }`}
                  >
                    <button
                      type="button"
                      className={styles.accordionButton}
                      onClick={() => setOpenModule(isOpen ? null : module.number)}
                      aria-expanded={isOpen}
                    >
                      <span className={styles.accordionNumber}>{module.number}</span>
                      <span className={styles.accordionTitle}>{module.title}</span>
                      <span
                        className={`${styles.accordionIcon} ${
                          isOpen ? styles.accordionIconOpen : ''
                        }`}
                      >
                        +
                      </span>
                    </button>
                    {isOpen && (
                      <div className={styles.accordionBody}>
                        <p>
                          {module.description ??
                            'Detailed topics for this module will be shared with enrolled participants.'}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ================================================================
          WHAT'S INCLUDED
          ================================================================ */}
      {course.whats_included.length > 0 && (
        <section className={styles.section}>
          <div className="container">
            <ScrollReveal animation="up" className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>What's Included</span>
              <h2 className={styles.sectionTitle}>Everything you get.</h2>
            </ScrollReveal>

            <ScrollReveal animation="up" stagger className={styles.includedGrid}>
              {course.whats_included.map((item, i) => (
                <div key={i} className={styles.includedItem}>
                  <span className={styles.includedCheck}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ================================================================
          UPCOMING COHORT
          ================================================================ */}
      <section className={styles.cohortSection} id="upcoming-cohort">
        <div className="container">
          <ScrollReveal animation="up" className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Upcoming Cohort</span>
            <h2 className={styles.sectionTitle}>
              {nextCohort
                ? 'The next cohort is opening soon.'
                : 'No upcoming cohort right now.'}
            </h2>
          </ScrollReveal>

          {nextCohort ? (
            <ScrollReveal animation="zoom" className={styles.cohortCard}>
              <div className={styles.cohortCardTop}>
                <span className={styles.cohortCardLabel}>Next Cohort</span>
                <span className={styles.cohortCardStatus}>
                  {nextCohort.status === 'open'
                    ? '● Applications Open'
                    : 'Applications Closed'}
                </span>
              </div>

              <h3 className={styles.cohortCardName}>{nextCohort.name}</h3>

              <div className={styles.cohortCardGrid}>
                <div className={styles.cohortCardRow}>
                  <span className={styles.cohortCardRowLabel}>Start</span>
                  <span className={styles.cohortCardRowValue}>
                    {formatCourseDate(nextCohort.start_date)}
                  </span>
                </div>
                <div className={styles.cohortCardRow}>
                  <span className={styles.cohortCardRowLabel}>End</span>
                  <span className={styles.cohortCardRowValue}>
                    {formatCourseDate(nextCohort.end_date)}
                  </span>
                </div>
                {nextCohort.schedule && (
                  <div className={styles.cohortCardRow}>
                    <span className={styles.cohortCardRowLabel}>Schedule</span>
                    <span className={styles.cohortCardRowValue}>
                      {nextCohort.schedule}
                    </span>
                  </div>
                )}
                {nextCohort.format && (
                  <div className={styles.cohortCardRow}>
                    <span className={styles.cohortCardRowLabel}>Format</span>
                    <span className={styles.cohortCardRowValue}>
                      {nextCohort.format}
                    </span>
                  </div>
                )}
                {nextCohort.fee && (
                  <div className={styles.cohortCardRow}>
                    <span className={styles.cohortCardRowLabel}>Fee</span>
                    <span className={styles.cohortCardRowValueHighlight}>
                      {nextCohort.fee}
                    </span>
                  </div>
                )}
                {nextCohort.spots_left !== null &&
                  nextCohort.spots_left !== undefined &&
                  nextCohort.capacity !== null && (
                    <div className={styles.cohortCardRow}>
                      <span className={styles.cohortCardRowLabel}>Places</span>
                      <span className={styles.cohortCardRowValue}>
                        {nextCohort.spots_left} of {nextCohort.capacity} available
                      </span>
                    </div>
                  )}
              </div>

              <Link to={`/apply/${course.slug}`} className={styles.cohortCardCta}>
                Apply for This Cohort
              </Link>
            </ScrollReveal>
          ) : (
            <ScrollReveal animation="up" className={styles.noCohortBox}>
              <div className={styles.noCohortIcon}>📅</div>
              <p className={styles.noCohortText}>
                No upcoming cohort is currently available. Register your
                interest and we'll notify you when the next cohort opens.
              </p>
              <Link
                to={`/register-interest/${course.slug}`}
                className={styles.noCohortCta}
              >
                Register Your Interest
              </Link>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* ================================================================
          PREVIOUS COHORTS
          ================================================================ */}
      {previousCohorts.length > 0 && (
        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className="container">
            <ScrollReveal animation="up" className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>Previous Cohorts</span>
              <h2 className={styles.sectionTitle}>Programme history.</h2>
            </ScrollReveal>

            <ScrollReveal animation="up" stagger className={styles.previousGrid}>
              {previousCohorts.map((cohort) => (
                <div key={cohort.id} className={styles.previousCard}>
                  <div className={styles.previousHeader}>
                    <span className={styles.previousName}>{cohort.name}</span>
                    <span className={styles.previousDate}>{cohort.date_range}</span>
                  </div>
                  <div className={styles.previousMeta}>
                    {cohort.format && <span>{cohort.format}</span>}
                    {cohort.format && cohort.participants !== null && (
                      <span>·</span>
                    )}
                    {cohort.participants !== null && (
                      <span>{cohort.participants} participants</span>
                    )}
                  </div>
                  {cohort.outcome && (
                    <p className={styles.previousOutcome}>{cohort.outcome}</p>
                  )}
                </div>
              ))}
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ================================================================
          PRICING
          ================================================================ */}
      {course.pricing?.fee && (
        <section className={styles.section}>
          <div className="container">
            <ScrollReveal animation="up" className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>Pricing</span>
              <h2 className={styles.sectionTitle}>Programme fee.</h2>
            </ScrollReveal>

            <ScrollReveal animation="zoom" className={styles.pricingCard}>
              <div className={styles.pricingFee}>
                <span className={styles.pricingFeeLabel}>Programme Fee</span>
                <span className={styles.pricingFeeValue}>{course.pricing.fee}</span>
              </div>

              {course.pricing.includes.length > 0 && (
                <div className={styles.pricingIncludes}>
                  <span className={styles.pricingIncludesLabel}>Includes:</span>
                  <ul className={styles.pricingIncludesList}>
                    {course.pricing.includes.map((item, i) => (
                      <li key={i}>
                        <span className={styles.pricingCheck}>✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {course.pricing.paymentOptions && (
                <div className={styles.pricingRow}>
                  <strong>Payment options:</strong> {course.pricing.paymentOptions}
                </div>
              )}

              {course.pricing.financialSupport && (
                <div className={styles.pricingRow}>
                  <strong>Financial support:</strong>{' '}
                  {course.pricing.financialSupport}
                </div>
              )}

              <Link to={`/apply/${course.slug}`} className={styles.pricingCta}>
                Apply Now
              </Link>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ================================================================
          FAQ
          ================================================================ */}
      {course.faqs.length > 0 && (
        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className="container">
            <ScrollReveal animation="up" className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>FAQ</span>
              <h2 className={styles.sectionTitle}>
                Frequently asked questions.
              </h2>
            </ScrollReveal>

            <ScrollReveal animation="up" className={styles.faqList}>
              {course.faqs.map((faq) => (
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
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ================================================================
          FINAL CTA
          ================================================================ */}
      {course.final_cta?.headline && (
        <section className={styles.finalCta}>
          <div className={styles.finalCtaBgBlob} aria-hidden="true" />
          <div className="container">
            <ScrollReveal animation="up" className={styles.finalCtaInner}>
              <h2 className={styles.finalCtaTitle}>
                {course.final_cta.headline}
              </h2>
              {course.final_cta.subheadline && (
                <p className={styles.finalCtaSubtitle}>
                  {course.final_cta.subheadline}
                </p>
              )}
              <div className={styles.finalCtaButtons}>
                {nextCohort ? (
                  <>
                    <Link
                      to={`/apply/${course.slug}`}
                      className={styles.finalCtaPrimary}
                    >
                      Apply for the Course
                    </Link>
                    <a href="#upcoming-cohort" className={styles.finalCtaSecondary}>
                      View Upcoming Cohorts →
                    </a>
                  </>
                ) : (
                  <Link
                    to={`/register-interest/${course.slug}`}
                    className={styles.finalCtaPrimary}
                  >
                    Register Your Interest
                  </Link>
                )}
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}
    </div>
  );
};