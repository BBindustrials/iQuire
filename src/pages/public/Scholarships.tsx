// ============================================================================
// iQuire — Public Scholarships Page (Phase 12D.6)
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '../../components/common/ScrollReveal';
import { Button } from '../../components/common/Button';
import {
  fetchPublishedScholarships,
  type ScholarshipWithCourse,
} from '../../services/scholarships.service';
import styles from './Scholarships.module.css';

// ============================================================================
// Helpers
// ============================================================================

interface DeadlineInfo {
  label: string;
  variant: 'neutral' | 'soon' | 'urgent' | 'closed';
  daysLeft: number | null;
}

const getDeadlineInfo = (deadline: string | null): DeadlineInfo | null => {
  if (!deadline) return null;

  const d = new Date(deadline);
  if (isNaN(d.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil(
    (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) {
    return { label: 'Closed', variant: 'closed', daysLeft: diffDays };
  }
  if (diffDays === 0) {
    return { label: 'Closes today', variant: 'urgent', daysLeft: 0 };
  }
  if (diffDays === 1) {
    return { label: 'Closes tomorrow', variant: 'urgent', daysLeft: 1 };
  }
  if (diffDays <= 7) {
    return {
      label: `Closes in ${diffDays} days`,
      variant: 'urgent',
      daysLeft: diffDays,
    };
  }
  if (diffDays <= 14) {
    return {
      label: `Closes in ${diffDays} days`,
      variant: 'soon',
      daysLeft: diffDays,
    };
  }

  return {
    label: `Closes ${d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`,
    variant: 'neutral',
    daysLeft: diffDays,
  };
};

const formatDeadlineDate = (deadline: string | null): string => {
  if (!deadline) return 'Rolling';
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return 'Rolling';
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const splitLines = (text: string | null): string[] => {
  if (!text) return [];
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
};

// ============================================================================
// Component
// ============================================================================

export const Scholarships: React.FC = () => {
  const [scholarships, setScholarships] = useState<ScholarshipWithCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // Load
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      const res = await fetchPublishedScholarships();
      if (!isMounted) return;

      if (!res.success) {
        setError(res.error ?? 'Failed to load scholarships');
        setIsLoading(false);
        return;
      }

      setScholarships(res.data ?? []);
      setIsLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // --------------------------------------------------------------------------
  // Stats
  // --------------------------------------------------------------------------
  const activeCount = scholarships.filter((s) => {
    const info = getDeadlineInfo(s.deadline);
    return !info || info.variant !== 'closed';
  }).length;

  const closingSoonCount = scholarships.filter((s) => {
    const info = getDeadlineInfo(s.deadline);
    return info && (info.variant === 'urgent' || info.variant === 'soon');
  }).length;

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      {/* ================================================================
          HERO
          ================================================================ */}
      <section className={styles.hero}>
        <div className={styles.heroBlobOne} aria-hidden="true" />
        <div className={styles.heroBlobTwo} aria-hidden="true" />

        <div className="container">
          <ScrollReveal animation="up" className={styles.heroContent}>
            <span className={styles.heroBadge}>Scholarships</span>
            <h1 className={styles.heroTitle}>
              Scholarships that{' '}
              <span className={styles.heroHighlight}>open doors.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Financial support for IQuire programmes. Whether you're a
              career switcher, a recent graduate, or an NYSC corps member —
              there may be a scholarship for you.
            </p>

            {!isLoading && scholarships.length > 0 && (
              <div className={styles.heroStats}>
                <div className={styles.heroStat}>
                  <span className={styles.heroStatValue}>{activeCount}</span>
                  <span className={styles.heroStatLabel}>
                    Active {activeCount === 1 ? 'scholarship' : 'scholarships'}
                  </span>
                </div>
                {closingSoonCount > 0 && (
                  <>
                    <span className={styles.heroStatDivider} />
                    <div className={styles.heroStat}>
                      <span className={styles.heroStatValueAlert}>
                        {closingSoonCount}
                      </span>
                      <span className={styles.heroStatLabel}>
                        Closing soon
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </ScrollReveal>
        </div>
      </section>

      {/* ================================================================
          MAIN CONTENT
          ================================================================ */}
      <section className={styles.contentSection}>
        <div className="container">
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorBox message={error} />
          ) : scholarships.length === 0 ? (
            <EmptyState />
          ) : (
            <ScrollReveal animation="up" stagger className={styles.list}>
              {scholarships.map((scholarship) => (
                <ScholarshipCard
                  key={scholarship.id}
                  scholarship={scholarship}
                />
              ))}
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* ================================================================
          HOW TO APPLY
          ================================================================ */}
      {scholarships.length > 0 && (
        <section className={styles.howToApply}>
          <div className="container">
            <ScrollReveal animation="up" className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>How to Apply</span>
              <h2 className={styles.sectionTitle}>
                Three steps to your scholarship.
              </h2>
            </ScrollReveal>

            <ScrollReveal animation="up" stagger className={styles.stepsGrid}>
              <StepCard
                number="01"
                title="Pick your scholarship"
                description="Review eligibility and coverage. Make sure you meet the requirements before applying."
              />
              <StepCard
                number="02"
                title="Complete the application"
                description="Click 'Apply Now' — most scholarships use a short Google Form. It takes 5–10 minutes."
              />
              <StepCard
                number="03"
                title="Wait for approval"
                description="We review applications within 7–14 days. Approved candidates receive a scholarship offer by email."
              />
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ================================================================
          FINAL CTA
          ================================================================ */}
      <section className={styles.finalCta}>
        <div className={styles.finalCtaBlob} aria-hidden="true" />
        <div className="container">
          <ScrollReveal animation="up" className={styles.finalCtaInner}>
            <h2 className={styles.finalCtaTitle}>
              Not sure which programme fits you?
            </h2>
            <p className={styles.finalCtaSubtitle}>
              Explore our courses or talk to our team about the right path for
              your career.
            </p>
            <div className={styles.finalCtaButtons}>
              <Button
                variant="primary"
                color="green"
                size="lg"
                href="/courses"
              >
                Explore Courses
              </Button>
              <Link to="/contact" className={styles.finalCtaSecondary}>
                Contact Us →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// Sub-components
// ============================================================================

interface ScholarshipCardProps {
  scholarship: ScholarshipWithCourse;
}

const ScholarshipCard: React.FC<ScholarshipCardProps> = ({ scholarship }) => {
  const deadlineInfo = getDeadlineInfo(scholarship.deadline);
  const eligibilityLines = splitLines(scholarship.eligibility);
  const isClosed = deadlineInfo?.variant === 'closed';
  const applyUrl = scholarship.apply_url;
  const canApply = !isClosed && !!applyUrl;

  return (
    <article className={styles.card}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderLeft}>
          <div className={styles.cardIcon}>🎓</div>
          <div>
            <h3 className={styles.cardTitle}>{scholarship.title}</h3>
            {scholarship.course && (
              <Link
                to={`/courses/${scholarship.course.slug}`}
                className={styles.cardCourse}
              >
                For: {scholarship.course.title} →
              </Link>
            )}
          </div>
        </div>

        {deadlineInfo && (
          <span
            className={`${styles.deadlineBadge} ${
              styles[`deadline-${deadlineInfo.variant}`]
            }`}
          >
            {deadlineInfo.label}
          </span>
        )}
      </div>

      {/* Body */}
      <div className={styles.cardBody}>
        <p className={styles.cardDescription}>{scholarship.description}</p>

        <div className={styles.cardGrid}>
          {/* Coverage */}
          {scholarship.coverage && (
            <div className={styles.cardColumn}>
              <h4 className={styles.cardColumnTitle}>What it covers</h4>
              <div className={styles.coverageBox}>
                <span className={styles.coverageIcon}>💰</span>
                <span className={styles.coverageText}>
                  {scholarship.coverage}
                </span>
              </div>
            </div>
          )}

          {/* Eligibility */}
          {eligibilityLines.length > 0 && (
            <div className={styles.cardColumn}>
              <h4 className={styles.cardColumnTitle}>Eligibility</h4>
              <ul className={styles.eligibilityList}>
                {eligibilityLines.map((line, i) => (
                  <li key={i}>
                    <span className={styles.eligibilityCheck}>✓</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className={styles.cardFooter}>
        <div className={styles.cardMeta}>
          <span className={styles.cardMetaLabel}>Deadline</span>
          <span className={styles.cardMetaValue}>
            {formatDeadlineDate(scholarship.deadline)}
          </span>
        </div>

        {canApply ? (
          <a
            href={applyUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.applyBtn}
          >
            Apply Now →
          </a>
        ) : isClosed ? (
          <button
            type="button"
            className={styles.applyBtnDisabled}
            disabled
          >
            Applications Closed
          </button>
        ) : (
          <Link to="/contact" className={styles.applyBtn}>
            Contact Us →
          </Link>
        )}
      </div>
    </article>
  );
};

interface StepCardProps {
  number: string;
  title: string;
  description: string;
}

const StepCard: React.FC<StepCardProps> = ({ number, title, description }) => (
  <div className={styles.stepCard}>
    <div className={styles.stepNumber}>{number}</div>
    <h3 className={styles.stepTitle}>{title}</h3>
    <p className={styles.stepDesc}>{description}</p>
  </div>
);

// ----------------------------------------------------------------------------
// States
// ----------------------------------------------------------------------------

const LoadingSkeleton: React.FC = () => (
  <div className={styles.list}>
    {[...Array(2)].map((_, i) => (
      <div key={i} className={styles.skeletonCard} />
    ))}
  </div>
);

const ErrorBox: React.FC<{ message: string }> = ({ message }) => (
  <div className={styles.errorBox}>
    <div className={styles.errorIcon}>⚠️</div>
    <h3 className={styles.errorTitle}>Couldn't load scholarships</h3>
    <p className={styles.errorText}>{message}</p>
  </div>
);

const EmptyState: React.FC = () => (
  <div className={styles.emptyBox}>
    <div className={styles.emptyIcon}>🎓</div>
    <h3 className={styles.emptyTitle}>
      No scholarships are open right now
    </h3>
    <p className={styles.emptyText}>
      New scholarships are announced regularly. Check back soon, or explore
      our courses to see which programme fits you best.
    </p>
    <Link to="/courses" className={styles.emptyCta}>
      Explore Courses →
    </Link>
  </div>
);