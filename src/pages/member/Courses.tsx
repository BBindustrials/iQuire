// ============================================================================
// iQuire — Member: My Courses (Phase 17.3 + Hero Image Fix)
// ============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchMyCourses,
  formatEnrollmentStatus,
  type MyCourse,
} from '../../services/student.service';
import styles from './Courses.module.css';

// ============================================================================
// Types
// ============================================================================

type FilterTab = 'all' | 'active' | 'completed';

// ============================================================================
// Component
// ============================================================================

export const MemberCourses: React.FC = () => {
  const [courses, setCourses] = useState<MyCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');

  // --------------------------------------------------------------------------
  // Load
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      const res = await fetchMyCourses();
      if (!isMounted) return;

      if (!res.success) {
        setError(res.error ?? 'Failed to load courses');
        setIsLoading(false);
        return;
      }

      setCourses(res.data ?? []);
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
  const stats = useMemo(
    () => ({
      total: courses.length,
      active: courses.filter((c) => c.status === 'active').length,
      completed: courses.filter((c) => c.status === 'completed').length,
    }),
    [courses]
  );

  // --------------------------------------------------------------------------
  // Filtered
  // --------------------------------------------------------------------------
  const filtered = useMemo(() => {
    let list = [...courses];

    if (activeTab === 'active') {
      list = list.filter((c) => c.status === 'active');
    } else if (activeTab === 'completed') {
      list = list.filter((c) => c.status === 'completed');
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.cohort_name?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [courses, activeTab, search]);

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>My Courses</h1>
          <p className={styles.pageSubtitle}>
            Track your progress, access lessons, and continue where you left
            off.
          </p>
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner} role="alert">
          <span>{error}</span>
          <button
            type="button"
            className={styles.errorClose}
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Stats */}
      <div className={styles.statsRow}>
        <StatPill label="Total Enrolled" value={stats.total} accent="navy" />
        <StatPill label="In Progress" value={stats.active} accent="gold" />
        <StatPill label="Completed" value={stats.completed} accent="green" />
      </div>

      {/* Filters */}
      <div className={styles.filtersRow}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${
              activeTab === 'all' ? styles.tabActive : ''
            }`}
            onClick={() => setActiveTab('all')}
          >
            All Courses
            <span className={styles.tabCount}>{stats.total}</span>
          </button>
          <button
            type="button"
            className={`${styles.tab} ${
              activeTab === 'active' ? styles.tabActive : ''
            }`}
            onClick={() => setActiveTab('active')}
          >
            In Progress
            <span className={styles.tabCount}>{stats.active}</span>
          </button>
          <button
            type="button"
            className={`${styles.tab} ${
              activeTab === 'completed' ? styles.tabActive : ''
            }`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
            <span className={styles.tabCount}>{stats.completed}</span>
          </button>
        </div>

        <div className={styles.searchBox}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle
              cx="11"
              cy="11"
              r="8"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M21 21L16.65 16.65"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            placeholder="Search courses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className={styles.grid}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          hasCourses={courses.length > 0}
          activeTab={activeTab}
          hasSearch={search.trim().length > 0}
        />
      ) : (
        <div className={styles.grid}>
          {filtered.map((course) => (
            <CourseCard key={course.enrollment_id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Sub-components
// ============================================================================

interface StatPillProps {
  label: string;
  value: number;
  accent: 'navy' | 'gold' | 'green';
}

const StatPill: React.FC<StatPillProps> = ({ label, value, accent }) => (
  <div className={`${styles.statPill} ${styles[`stat-${accent}`]}`}>
    <span className={styles.statValue}>{value}</span>
    <span className={styles.statLabel}>{label}</span>
  </div>
);

// ----------------------------------------------------------------------------

interface CourseCardProps {
  course: MyCourse;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const isCompleted = course.status === 'completed';
  const isActive = course.status === 'active';

  return (
    <article className={styles.card}>
      {/* Image */}
      <div className={styles.cardImage}>
        {course.hero_image_url || course.thumbnail_url ? (
          <img
            src={course.hero_image_url ?? course.thumbnail_url ?? ''}
            alt={course.title}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className={styles.cardImagePlaceholder}>
            {course.emoji ?? '🎓'}
          </div>
        )}

        <span
          className={`${styles.statusBadge} ${
            isCompleted ? styles.statusCompleted : styles.statusActive
          }`}
        >
          {formatEnrollmentStatus(course.status)}
        </span>
      </div>

      {/* Body */}
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{course.title}</h3>

        {course.cohort_name && (
          <p className={styles.cardCohort}>
            <span className={styles.cardCohortLabel}>Cohort</span>
            {course.cohort_name}
          </p>
        )}

        {/* Progress */}
        <div className={styles.progressBlock}>
          <div className={styles.progressLabel}>
            <span>Progress</span>
            <span className={styles.progressValue}>
              {course.progress_percent}%
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={`${styles.progressFill} ${
                isCompleted ? styles.progressFillComplete : ''
              }`}
              style={{ width: `${course.progress_percent}%` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className={styles.metaRow}>
          <span className={styles.metaItem}>
            <span className={styles.metaIcon}>📖</span>
            {course.total_lessons} lessons
          </span>
          <span className={styles.metaItem}>
            <span className={styles.metaIcon}>📅</span>
            {course.upcoming_sessions > 0
              ? `${course.upcoming_sessions} upcoming`
              : `${course.total_sessions} sessions`}
          </span>
          <span className={styles.metaItem}>
            <span className={styles.metaIcon}>📝</span>
            {course.pending_assignments > 0
              ? `${course.pending_assignments} pending`
              : 'All done'}
          </span>
        </div>

        {/* CTA */}
        <Link
          to={`/dashboard/courses/${course.course_id}`}
          className={`${styles.cta} ${
            isCompleted ? styles.ctaSecondary : ''
          }`}
        >
          {isCompleted
            ? 'Review Course →'
            : isActive
            ? 'Continue Learning →'
            : 'View Course →'}
        </Link>
      </div>
    </article>
  );
};

// ----------------------------------------------------------------------------

interface EmptyStateProps {
  hasCourses: boolean;
  activeTab: FilterTab;
  hasSearch: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  hasCourses,
  activeTab,
  hasSearch,
}) => {
  if (hasSearch) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🔍</div>
        <h3 className={styles.emptyTitle}>No courses match your search</h3>
        <p className={styles.emptyText}>
          Try a different term, or clear the search to see all your courses.
        </p>
      </div>
    );
  }

  if (hasCourses && activeTab === 'active') {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>✅</div>
        <h3 className={styles.emptyTitle}>No courses in progress</h3>
        <p className={styles.emptyText}>
          Every course you've enrolled in has been completed. Great work!
        </p>
      </div>
    );
  }

  if (hasCourses && activeTab === 'completed') {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🎓</div>
        <h3 className={styles.emptyTitle}>No completed courses yet</h3>
        <p className={styles.emptyText}>
          Keep learning — completed courses will show up here.
        </p>
      </div>
    );
  }

  // No courses at all
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>📚</div>
      <h3 className={styles.emptyTitle}>You're not enrolled in any course yet</h3>
      <p className={styles.emptyText}>
        Once you're enrolled in an iQuire programme, your courses will appear
        here with everything you need — lessons, sessions, and assignments.
      </p>
      <Link to="/courses" className={styles.emptyCta}>
        Explore Courses →
      </Link>
    </div>
  );
};