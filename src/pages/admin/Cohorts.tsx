// ============================================================================
// iQuire — Admin: Cohorts List (Phase 15.8)
// ============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchAllCohorts,
  deleteCohort,
  setAsNextCohort,
  formatCohortStatus,
  type CohortWithCourse,
  type CohortStatus,
} from '../../services/cohorts.service';
import {
  fetchCoursesForSelect,
} from '../../services/students.service';
import styles from './Cohorts.module.css';

// ============================================================================
// Types
// ============================================================================

interface CourseOption {
  id: string;
  title: string;
}

type StatusFilter = 'all' | CohortStatus;

// ============================================================================
// Component
// ============================================================================

export const AdminCohorts: React.FC = () => {
  const [cohorts, setCohorts] = useState<CohortWithCourse[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [nextOnly, setNextOnly] = useState(false);

  // Delete confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // Load
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      const [cohortsRes, coursesRes] = await Promise.all([
        fetchAllCohorts(),
        fetchCoursesForSelect(),
      ]);

      if (!isMounted) return;

      if (!cohortsRes.success) {
        setError(cohortsRes.error ?? 'Failed to load cohorts');
        setIsLoading(false);
        return;
      }

      setCohorts(cohortsRes.data ?? []);
      if (coursesRes.success && coursesRes.data) setCourses(coursesRes.data);
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
    let list = [...cohorts];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.course?.title.toLowerCase().includes(q)
      );
    }

    if (courseFilter !== 'all') {
      list = list.filter((c) => c.course_id === courseFilter);
    }

    if (statusFilter !== 'all') {
      list = list.filter((c) => c.status === statusFilter);
    }

    if (nextOnly) {
      list = list.filter((c) => c.is_next);
    }

    return list;
  }, [cohorts, search, courseFilter, statusFilter, nextOnly]);

  // --------------------------------------------------------------------------
  // Stats
  // --------------------------------------------------------------------------
  const stats = useMemo(
    () => ({
      total: cohorts.length,
      open: cohorts.filter((c) => c.status === 'open').length,
      closed: cohorts.filter((c) => c.status === 'closed').length,
      completed: cohorts.filter((c) => c.status === 'completed').length,
    }),
    [cohorts]
  );

  // --------------------------------------------------------------------------
  // Actions
  // --------------------------------------------------------------------------
  const handleSetAsNext = async (cohort: CohortWithCourse) => {
    if (cohort.is_next) return;
    setActionLoading(true);
    const res = await setAsNextCohort(cohort.id, cohort.course_id);
    setActionLoading(false);

    if (!res.success) {
      setError(res.error ?? 'Failed to set as next');
      return;
    }

    // Reload the list to reflect the change (other cohorts unset)
    const reload = await fetchAllCohorts();
    if (reload.success && reload.data) setCohorts(reload.data);
  };

  const handleDelete = async (id: string) => {
    setActionLoading(true);
    const res = await deleteCohort(id);
    setActionLoading(false);

    if (!res.success) {
      setError(res.error ?? 'Failed to delete cohort');
      setDeleteConfirmId(null);
      return;
    }

    setCohorts((prev) => prev.filter((c) => c.id !== id));
    setDeleteConfirmId(null);
  };

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------
  const formatDate = (iso: string | null): string => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Cohorts</h1>
          <p className={styles.pageSubtitle}>
            Manage every cohort across every course. Set the current "next"
            cohort, change status, and add new intakes.
          </p>
        </div>
        <Link to="/admin/cohorts/new" className={styles.addButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          New Cohort
        </Link>
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
        <StatPill label="Total" value={stats.total} accent="blue" />
        <StatPill label="Open" value={stats.open} accent="green" />
        <StatPill label="Closed" value={stats.closed} accent="gray" />
        <StatPill label="Completed" value={stats.completed} accent="purple" />
      </div>

      {/* Filters */}
      <div className={styles.filtersRow}>
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
            placeholder="Search by cohort name or course…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <select
          className={styles.filterSelect}
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
        >
          <option value="all">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
        >
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="completed">Completed</option>
        </select>

        <label className={styles.nextOnlyToggle}>
          <input
            type="checkbox"
            checked={nextOnly}
            onChange={(e) => setNextOnly(e.target.checked)}
            className={styles.checkbox}
          />
          <span>Next cohort only</span>
        </label>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className={styles.skeletonTable}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className={styles.skeletonRow} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasCohorts={cohorts.length > 0} />
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Course</th>
                <th>Cohort</th>
                <th>Dates</th>
                <th>Status</th>
                <th>Next</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className={styles.courseChip}>
                      {c.course?.title ?? '—'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.cohortCell}>
                      <span className={styles.cohortName}>{c.name}</span>
                      {c.cohort_token && (
                        <span className={styles.cohortToken}>
                          Token: {c.cohort_token}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={styles.datesCell}>
                      <span className={styles.dateRow}>
                        <strong>Start:</strong> {formatDate(c.start_date)}
                      </span>
                      <span className={styles.dateRow}>
                        <strong>End:</strong> {formatDate(c.end_date)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[`status-${c.status}`]
                      }`}
                    >
                      {formatCohortStatus(c.status)}
                    </span>
                  </td>
                  <td>
                    {c.is_next ? (
                      <span className={styles.nextBadge}>⭐ Next</span>
                    ) : (
                      <span className={styles.muted}>—</span>
                    )}
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <Link
                        to={`/admin/cohorts/${c.id}/edit`}
                        className={styles.rowActionBtn}
                        title="Edit"
                      >
                        ✏️ Edit
                      </Link>
                      {!c.is_next && (
                        <button
                          type="button"
                          className={styles.rowActionBtn}
                          onClick={() => handleSetAsNext(c)}
                          title="Set as the next cohort for this course"
                          disabled={actionLoading}
                        >
                          ⭐ Set as next
                        </button>
                      )}
                      <button
                        type="button"
                        className={`${styles.rowActionBtn} ${styles.rowActionDanger}`}
                        onClick={() => setDeleteConfirmId(c.id)}
                        title="Delete"
                        disabled={actionLoading}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirmId && (
        <div
          className={styles.modalOverlay}
          onClick={() => setDeleteConfirmId(null)}
        >
          <div className={styles.modal} onClick={(ev) => ev.stopPropagation()}>
            <h3 className={styles.modalTitle}>Delete this cohort?</h3>
            <p className={styles.modalText}>
              This will permanently remove the cohort. If any enrollments
              reference it, the delete will be blocked — set its status to{' '}
              <strong>Completed</strong> instead to archive it.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={() => setDeleteConfirmId(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalConfirm}
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting…' : 'Delete'}
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
  accent: 'blue' | 'green' | 'gray' | 'purple';
}

const StatPill: React.FC<StatPillProps> = ({ label, value, accent }) => (
  <div className={`${styles.statPill} ${styles[`stat-${accent}`]}`}>
    <span className={styles.statValue}>{value}</span>
    <span className={styles.statLabel}>{label}</span>
  </div>
);

const EmptyState: React.FC<{ hasCohorts: boolean }> = ({ hasCohorts }) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>📅</div>
    <h3 className={styles.emptyTitle}>
      {hasCohorts ? 'No cohorts match your filters' : 'No cohorts yet'}
    </h3>
    <p className={styles.emptyText}>
      {hasCohorts
        ? 'Try adjusting your search or filters.'
        : 'Create your first cohort to start enrolling students.'}
    </p>
    {!hasCohorts && (
      <Link to="/admin/cohorts/new" className={styles.emptyCta}>
        + New Cohort
      </Link>
    )}
  </div>
);