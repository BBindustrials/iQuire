// ============================================================================
// iQuire — Public Jobs Page (Phase 12D.8)
// ============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '../../components/common/ScrollReveal';
import { Button } from '../../components/common/Button';
import {
  fetchPublishedJobs,
  formatJobDeadline,
  isJobDeadlinePassed,
  type JobWithCourse,
} from '../../services/jobs.service';
import {
  formatWorkMode,
  formatOpportunityType,
  formatExperienceLevel,
  JOB_WORK_MODE_OPTIONS,
  JOB_OPPORTUNITY_TYPE_OPTIONS,
  JOB_EXPERIENCE_LEVEL_OPTIONS,
  type JobWorkMode,
  type JobOpportunityType,
  type JobExperienceLevel,
} from '../../types/content.types';
import styles from './Jobs.module.css';

// ============================================================================
// Component
// ============================================================================

export const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<JobWithCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [workMode, setWorkMode] = useState<JobWorkMode | 'all'>('all');
  const [opportunityType, setOpportunityType] = useState<
    JobOpportunityType | 'all'
  >('all');
  const [experienceLevel, setExperienceLevel] = useState<
    JobExperienceLevel | 'all'
  >('all');

  // --------------------------------------------------------------------------
  // Load
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      const res = await fetchPublishedJobs();
      if (!isMounted) return;

      if (!res.success) {
        setError(res.error ?? 'Failed to load jobs');
        setIsLoading(false);
        return;
      }

      setJobs(res.data ?? []);
      setIsLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // --------------------------------------------------------------------------
  // Filter
  // --------------------------------------------------------------------------
  const filtered = useMemo(() => {
    let list = [...jobs];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.location?.toLowerCase().includes(q) ||
          j.required_skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Work mode
    if (workMode !== 'all') {
      list = list.filter((j) => j.work_mode === workMode);
    }

    // Opportunity type
    if (opportunityType !== 'all') {
      list = list.filter((j) => j.opportunity_type === opportunityType);
    }

    // Experience level
    if (experienceLevel !== 'all') {
      list = list.filter((j) => j.experience_level === experienceLevel);
    }

    return list;
  }, [jobs, search, workMode, opportunityType, experienceLevel]);

  const hasActiveFilters =
    search.trim() !== '' ||
    workMode !== 'all' ||
    opportunityType !== 'all' ||
    experienceLevel !== 'all';

  const clearFilters = () => {
    setSearch('');
    setWorkMode('all');
    setOpportunityType('all');
    setExperienceLevel('all');
  };

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
            <span className={styles.heroBadge}>Opportunities</span>
            <h1 className={styles.heroTitle}>
              Find work that{' '}
              <span className={styles.heroHighlight}>fits you.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Real openings from verified employers across Africa — internships,
              graduate roles, apprenticeships, and full-time positions. All
              curated for early-career talent.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ================================================================
          FILTERS + MAIN CONTENT
          ================================================================ */}
      <section className={styles.contentSection}>
        <div className="container">
          {/* Filters bar */}
          <ScrollReveal animation="up" className={styles.filtersWrapper}>
            <div className={styles.searchBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M21 21L16.65 16.65"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="text"
                placeholder="Search jobs by title, company, or skill…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <select
              className={styles.filterSelect}
              value={workMode}
              onChange={(e) =>
                setWorkMode(e.target.value as JobWorkMode | 'all')
              }
            >
              <option value="all">Any work mode</option>
              {JOB_WORK_MODE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <select
              className={styles.filterSelect}
              value={opportunityType}
              onChange={(e) =>
                setOpportunityType(e.target.value as JobOpportunityType | 'all')
              }
            >
              <option value="all">Any type</option>
              {JOB_OPPORTUNITY_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <select
              className={styles.filterSelect}
              value={experienceLevel}
              onChange={(e) =>
                setExperienceLevel(
                  e.target.value as JobExperienceLevel | 'all'
                )
              }
            >
              <option value="all">Any level</option>
              {JOB_EXPERIENCE_LEVEL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </ScrollReveal>

          {/* Content */}
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorBox message={error} />
          ) : jobs.length === 0 ? (
            <EmptyState type="no-jobs" />
          ) : filtered.length === 0 ? (
            <EmptyState type="no-match" onClear={clearFilters} />
          ) : (
            <>
              {/* Result count */}
              <div className={styles.resultRow}>
                <p className={styles.resultCount}>
                  <strong>{filtered.length}</strong>{' '}
                  {filtered.length === 1 ? 'job' : 'jobs'}
                  {hasActiveFilters && (
                    <>
                      {' '}
                      ·{' '}
                      <button
                        type="button"
                        onClick={clearFilters}
                        className={styles.clearLink}
                      >
                        Clear filters
                      </button>
                    </>
                  )}
                </p>
              </div>

              {/* Grid */}
              <ScrollReveal animation="up" stagger className={styles.grid}>
                {filtered.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </ScrollReveal>
            </>
          )}
        </div>
      </section>

      {/* ================================================================
          FINAL CTA
          ================================================================ */}
      <section className={styles.finalCta}>
        <div className={styles.finalCtaBlob} aria-hidden="true" />
        <div className="container">
          <ScrollReveal animation="up" className={styles.finalCtaInner}>
            <h2 className={styles.finalCtaTitle}>
              Ready to be the candidate they hire?
            </h2>
            <p className={styles.finalCtaSubtitle}>
              Join an IQuire programme and become work-ready for the roles you
              actually want.
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
              <Link to="/hire-from-us" className={styles.finalCtaSecondary}>
                Hire From Us →
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

interface JobCardProps {
  job: JobWithCourse;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const deadlineText = formatJobDeadline(job.deadline);
  const isClosed = isJobDeadlinePassed(job.deadline);
  const canApply = !isClosed && !!job.apply_url;

  // Determine deadline variant for badge color
  const deadlineVariant = (() => {
    if (!job.deadline || isClosed) return 'closed';
    const d = new Date(job.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.ceil(
      (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (days <= 7) return 'urgent';
    if (days <= 14) return 'soon';
    return 'neutral';
  })();

  return (
    <article
      className={`${styles.card} ${job.featured ? styles.cardFeatured : ''}`}
    >
      {job.featured && (
        <span className={styles.featuredBadge}>⭐ Featured</span>
      )}

      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.companyLogo}>
          {job.company_logo_url ? (
            <img src={job.company_logo_url} alt={job.company} />
          ) : (
            job.company.slice(0, 2).toUpperCase()
          )}
        </div>
        <div className={styles.cardHeaderText}>
          <h3 className={styles.cardTitle}>{job.title}</h3>
          <p className={styles.cardCompany}>
            {job.company}
            {job.location && (
              <>
                <span className={styles.cardCompanyDot}>·</span>
                {job.location}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Tags row */}
      <div className={styles.tagsRow}>
        <span className={`${styles.tag} ${styles.tagWorkMode}`}>
          {formatWorkMode(job.work_mode)}
        </span>
        <span className={`${styles.tag} ${styles.tagType}`}>
          {formatOpportunityType(job.opportunity_type)}
        </span>
        <span className={`${styles.tag} ${styles.tagLevel}`}>
          {formatExperienceLevel(job.experience_level)}
        </span>
      </div>

      {/* Description preview */}
      <p className={styles.cardDescription}>
        {job.description.length > 160
          ? `${job.description.slice(0, 160).trim()}…`
          : job.description}
      </p>

      {/* Salary */}
      {job.salary_range && (
        <div className={styles.salaryRow}>
          <span className={styles.salaryIcon}>💰</span>
          <span className={styles.salaryText}>{job.salary_range}</span>
        </div>
      )}

      {/* Skills */}
      {job.required_skills.length > 0 && (
        <div className={styles.skillsRow}>
          {job.required_skills.slice(0, 4).map((skill) => (
            <span key={skill} className={styles.skillTag}>
              {skill}
            </span>
          ))}
          {job.required_skills.length > 4 && (
            <span className={styles.skillMore}>
              +{job.required_skills.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Optional course link */}
      {job.course && (
        <Link
          to={`/courses/${job.course.slug}`}
          className={styles.courseLink}
        >
          🎓 Prep course: {job.course.title} →
        </Link>
      )}

      {/* Footer */}
      <div className={styles.cardFooter}>
        {deadlineText && (
          <span
            className={`${styles.deadlineBadge} ${
              styles[`deadline-${deadlineVariant}`]
            }`}
          >
            {deadlineText}
          </span>
        )}

        {canApply ? (
          <a
            href={job.apply_url!}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.applyBtn}
          >
            View & Apply →
          </a>
        ) : isClosed ? (
          <button
            type="button"
            className={styles.applyBtnDisabled}
            disabled
          >
            Closed
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

// ============================================================================
// States
// ============================================================================

const LoadingSkeleton: React.FC = () => (
  <div className={styles.grid}>
    {[...Array(4)].map((_, i) => (
      <div key={i} className={styles.skeletonCard} />
    ))}
  </div>
);

const ErrorBox: React.FC<{ message: string }> = ({ message }) => (
  <div className={styles.errorBox}>
    <div className={styles.errorIcon}>⚠️</div>
    <h3 className={styles.errorTitle}>Couldn't load jobs</h3>
    <p className={styles.errorText}>{message}</p>
  </div>
);

interface EmptyStateProps {
  type: 'no-jobs' | 'no-match';
  onClear?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, onClear }) => (
  <div className={styles.emptyBox}>
    <div className={styles.emptyIcon}>
      {type === 'no-match' ? '🔍' : '💼'}
    </div>
    <h3 className={styles.emptyTitle}>
      {type === 'no-match'
        ? 'No jobs match your filters'
        : 'No jobs are open right now'}
    </h3>
    <p className={styles.emptyText}>
      {type === 'no-match'
        ? 'Try adjusting your search or clearing the filters.'
        : 'New opportunities are posted regularly. Check back soon, or explore our courses to become work-ready.'}
    </p>
    {type === 'no-match' && onClear ? (
      <button type="button" onClick={onClear} className={styles.emptyCta}>
        Clear filters
      </button>
    ) : (
      <Link to="/courses" className={styles.emptyCta}>
        Explore Courses →
      </Link>
    )}
  </div>
);