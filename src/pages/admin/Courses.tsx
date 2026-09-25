/* eslint-disable react-hooks/set-state-in-effect */
// ============================================================================
// iQuire — Admin: Courses List (Phase 10D.4)
// ============================================================================

import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchAllCourses,
  updateCourse,
  deleteCourse,
  type Course,
  type CourseStatus,
} from '../../services/courses.service';
import styles from './Courses.module.css';

// ============================================================================
// Component
// ============================================================================

export const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CourseStatus>('all');

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // Load courses
  // --------------------------------------------------------------------------
  const load = async () => {
    setIsLoading(true);
    setError(null);
    const result = await fetchAllCourses();
    if (!result.success) {
      setError(result.error ?? 'Failed to load courses');
      setIsLoading(false);
      return;
    }
    setCourses(result.data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // --------------------------------------------------------------------------
  // Filtered list
  // --------------------------------------------------------------------------
  const filtered = useMemo(() => {
    let list = [...courses];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          c.tagline?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter((c) => c.status === statusFilter);
    }

    return list;
  }, [courses, search, statusFilter]);

  // --------------------------------------------------------------------------
  // Quick actions
  // --------------------------------------------------------------------------
  const handleToggleStatus = async (course: Course) => {
    const nextStatus: CourseStatus =
      course.status === 'published' ? 'draft' : 'published';

    // Optimistic update
    setCourses((prev) =>
      prev.map((c) => (c.id === course.id ? { ...c, status: nextStatus } : c))
    );

    const res = await updateCourse(course.id, { status: nextStatus });
    if (!res.success) {
      // Revert
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, status: course.status } : c))
      );
      setError(res.error ?? 'Failed to update course');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteCourse(id);
    if (!res.success) {
      setError(res.error ?? 'Failed to delete course');
      setDeleteConfirmId(null);
      return;
    }
    setCourses((prev) => prev.filter((c) => c.id !== id));
    setDeleteConfirmId(null);
  };

  // --------------------------------------------------------------------------
  // Stats
  // --------------------------------------------------------------------------
  const stats = useMemo(
    () => ({
      total: courses.length,
      published: courses.filter((c) => c.status === 'published').length,
      draft: courses.filter((c) => c.status === 'draft').length,
    }),
    [courses]
  );

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Courses</h1>
          <p className={styles.pageSubtitle}>
            Manage your courses, cohorts, and programme content.
          </p>
        </div>
        <Link to="/admin/courses/new" className={styles.addButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add Course
        </Link>
      </div>

      {/* Error banner */}
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
        <StatPill label="Total" value={stats.total} accent="blue" />
        <StatPill label="Published" value={stats.published} accent="green" />
        <StatPill label="Drafts" value={stats.draft} accent="gray" />
      </div>

      {/* Filters */}
      <div className={styles.filtersRow}>
        <div className={styles.searchBox}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search courses by title, slug, or tagline…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | CourseStatus)}
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className={styles.grid}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasCourses={courses.length > 0} />
      ) : (
        <div className={styles.grid}>
          {filtered.map((course) => (
            <article key={course.id} className={styles.card}>
              {/* Image */}
              <div className={styles.cardImage}>
                {course.hero_image_url ? (
                  <img
                    src={course.hero_image_url}
                    alt={course.title}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.cardImagePlaceholder}>
                    {course.emoji ?? '📚'}
                  </div>
                )}

                {/* Status badge */}
                <span
                  className={`${styles.statusBadge} ${styles[`status-${course.status}`]}`}
                >
                  {course.status}
                </span>
              </div>

              {/* Body */}
              <div className={styles.cardBody}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardEmoji}>{course.emoji ?? '📚'}</span>
                  <h3 className={styles.cardTitle}>{course.title}</h3>
                </div>

                {course.tagline && (
                  <p className={styles.cardTagline}>{course.tagline}</p>
                )}

                <div className={styles.cardMeta}>
                  {course.duration && (
                    <span className={styles.metaPill}>
                      ⏱ {course.duration}
                    </span>
                  )}
                  {course.format && (
                    <span className={styles.metaPill}>
                      🌐 {course.format}
                    </span>
                  )}
                  {course.level && (
                    <span className={styles.metaPill}>
                      📊 {course.level}
                    </span>
                  )}
                </div>

                {course.pricing?.fee && (
                  <div className={styles.cardFee}>
                    <span className={styles.cardFeeLabel}>Fee</span>
                    <span className={styles.cardFeeValue}>
                      {course.pricing.fee}
                    </span>
                  </div>
                )}

                <p className={styles.cardSlug}>/{course.slug}</p>
              </div>

              {/* Actions */}
              <div className={styles.cardActions}>
                <Link
                  to={`/admin/courses/${course.id}`}
                  className={styles.actionBtn}
                  title="Edit course"
                >
                  ✏️ Edit
                </Link>

                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => handleToggleStatus(course)}
                  title="Toggle published/draft"
                >
                  {course.status === 'published' ? '⏸ Unpublish' : '▶ Publish'}
                </button>

                <a
                  href={`/courses/${course.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionBtn}
                  title="View public page"
                >
                  👁 View
                </a>

                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.actionDanger}`}
                  onClick={() => setDeleteConfirmId(course.id)}
                  title="Delete course"
                >
                  🗑
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <div
          className={styles.modalOverlay}
          onClick={() => setDeleteConfirmId(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Delete this course?</h3>
            <p className={styles.modalText}>
              This will permanently remove the course, its cohorts, and all
              associated data. This cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalConfirm}
                onClick={() => handleDelete(deleteConfirmId)}
              >
                Delete
              </button>
            </div>
          </div>
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
  accent: 'blue' | 'green' | 'gold' | 'gray';
}

const StatPill: React.FC<StatPillProps> = ({ label, value, accent }) => (
  <div className={`${styles.statPill} ${styles[`stat-${accent}`]}`}>
    <span className={styles.statValue}>{value}</span>
    <span className={styles.statLabel}>{label}</span>
  </div>
);

const EmptyState: React.FC<{ hasCourses: boolean }> = ({ hasCourses }) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>📚</div>
    <h3 className={styles.emptyTitle}>
      {hasCourses ? 'No courses match your filters' : 'No courses yet'}
    </h3>
    <p className={styles.emptyText}>
      {hasCourses
        ? 'Try adjusting your search or filters.'
        : 'Add your first course to start building your programme catalogue.'}
    </p>
    {!hasCourses && (
      <Link to="/admin/courses/new" className={styles.emptyCta}>
        + Add Course
      </Link>
    )}
  </div>
);