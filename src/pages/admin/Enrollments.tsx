// ============================================================================
// iQuire — Admin: Enrollments List (Phase 15.6 — polished bulk actions)
// ============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchAllEnrollments,
  updateEnrollment,
  deleteEnrollment,
  bulkUpdateEnrollmentStatus,
  bulkDeleteEnrollments,
  formatEnrollmentStatus,
  getInitials,
  type EnrollmentWithRelations,
  type EnrollmentStatus,
} from '../../services/enrollments.service';
import {
  fetchCoursesForSelect,
} from '../../services/students.service';
import styles from './Enrollments.module.css';

// ============================================================================
// Types
// ============================================================================

interface CourseOption {
  id: string;
  title: string;
}

type StatusFilter = 'all' | EnrollmentStatus;

interface BulkStatusModal {
  status: EnrollmentStatus;
  // Only used when status = 'completed'
  completed_at: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

// ============================================================================
// Component
// ============================================================================

export const AdminEnrollments: React.FC = () => {
  const [enrollments, setEnrollments] = useState<EnrollmentWithRelations[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkStatusModal, setBulkStatusModal] =
    useState<BulkStatusModal | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // --------------------------------------------------------------------------
  // Load
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      const [enrollRes, coursesRes] = await Promise.all([
        fetchAllEnrollments(),
        fetchCoursesForSelect(),
      ]);

      if (!isMounted) return;

      if (!enrollRes.success) {
        setError(enrollRes.error ?? 'Failed to load enrollments');
        setIsLoading(false);
        return;
      }

      setEnrollments(enrollRes.data ?? []);
      if (coursesRes.success && coursesRes.data) setCourses(coursesRes.data);
      setIsLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // --------------------------------------------------------------------------
  // Toast helper
  // --------------------------------------------------------------------------
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // --------------------------------------------------------------------------
  // Filter
  // --------------------------------------------------------------------------
  const filtered = useMemo(() => {
    let list = [...enrollments];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((e) => {
        const student = e.student;
        if (!student) return false;
        return (
          student.first_name.toLowerCase().includes(q) ||
          student.last_name.toLowerCase().includes(q) ||
          student.email.toLowerCase().includes(q) ||
          student.iq_id?.toLowerCase().includes(q) ||
          student.participant_id?.toLowerCase().includes(q)
        );
      });
    }

    if (statusFilter !== 'all') {
      list = list.filter((e) => e.status === statusFilter);
    }

    if (courseFilter !== 'all') {
      list = list.filter((e) => e.course_id === courseFilter);
    }

    return list;
  }, [enrollments, search, statusFilter, courseFilter]);

  // --------------------------------------------------------------------------
  // Stats
  // --------------------------------------------------------------------------
  const stats = useMemo(
    () => ({
      total: enrollments.length,
      active: enrollments.filter((e) => e.status === 'active').length,
      completed: enrollments.filter((e) => e.status === 'completed').length,
      dropped: enrollments.filter((e) => e.status === 'dropped').length,
    }),
    [enrollments]
  );

  // --------------------------------------------------------------------------
  // Selection
  // --------------------------------------------------------------------------
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((e) => e.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const allSelected =
    filtered.length > 0 && selectedIds.size === filtered.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  // --------------------------------------------------------------------------
  // Single actions
  // --------------------------------------------------------------------------
  const handleStatusChange = async (
    enrollment: EnrollmentWithRelations,
    nextStatus: EnrollmentStatus
  ) => {
    if (nextStatus === enrollment.status) return;

    if (nextStatus === 'completed') {
      const confirmed = window.confirm(
        `Mark ${enrollment.student?.first_name ?? 'this student'}'s enrollment in ${
          enrollment.course?.title ?? 'this course'
        } as COMPLETED? This will grant them the alumni role.`
      );
      if (!confirmed) return;
    }

    setActionLoading(true);
    const previous = enrollment.status;

    setEnrollments((prev) =>
      prev.map((e) => (e.id === enrollment.id ? { ...e, status: nextStatus } : e))
    );

    const res = await updateEnrollment(enrollment.id, { status: nextStatus });
    setActionLoading(false);

    if (!res.success) {
      setEnrollments((prev) =>
        prev.map((e) => (e.id === enrollment.id ? { ...e, status: previous } : e))
      );
      setError(res.error ?? 'Failed to update status');
      showToast('Failed to update status', 'error');
    } else {
      showToast(`Status updated to ${formatEnrollmentStatus(nextStatus)}`);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(true);
    const res = await deleteEnrollment(id);
    setActionLoading(false);

    if (!res.success) {
      setError(res.error ?? 'Failed to delete');
      setDeleteConfirmId(null);
      showToast('Failed to delete enrollment', 'error');
      return;
    }

    setEnrollments((prev) => prev.filter((e) => e.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setDeleteConfirmId(null);
    showToast('Enrollment deleted');
  };

  // --------------------------------------------------------------------------
  // Bulk actions
  // --------------------------------------------------------------------------
  const openBulkStatusModal = (status: EnrollmentStatus) => {
    if (status === 'completed') {
      // Show modal with optional date
      setBulkStatusModal({
        status,
        completed_at: new Date().toISOString().slice(0, 10),
      });
    } else {
      // No confirmation needed for other statuses — just do it
      handleBulkStatusCommit(status, undefined);
    }
  };

  const handleBulkStatusCommit = async (
    status: EnrollmentStatus,
    completedAt: string | undefined
  ) => {
    setActionLoading(true);
    const ids = Array.from(selectedIds);
    const count = ids.length;

    const res = await bulkUpdateEnrollmentStatus(ids, status, {
      completed_at: completedAt
        ? new Date(completedAt).toISOString()
        : undefined,
    });
    setActionLoading(false);

    if (!res.success) {
      setError(res.error ?? 'Bulk update failed');
      setBulkStatusModal(null);
      showToast('Bulk update failed', 'error');
      return;
    }

    setEnrollments((prev) =>
      prev.map((e) => (selectedIds.has(e.id) ? { ...e, status } : e))
    );

    showToast(
      `${count} enrollment${count === 1 ? '' : 's'} marked as ${formatEnrollmentStatus(status)}`
    );
    clearSelection();
    setBulkStatusModal(null);
  };

  const handleBulkDelete = async () => {
    setActionLoading(true);
    const ids = Array.from(selectedIds);
    const count = ids.length;

    const res = await bulkDeleteEnrollments(ids);
    setActionLoading(false);

    if (!res.success) {
      setError(res.error ?? 'Bulk delete failed');
      setBulkDeleteConfirm(false);
      showToast('Bulk delete failed', 'error');
      return;
    }

    setEnrollments((prev) => prev.filter((e) => !selectedIds.has(e.id)));
    clearSelection();
    setBulkDeleteConfirm(false);
    showToast(`${count} enrollment${count === 1 ? '' : 's'} deleted`);
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
          <h1 className={styles.pageTitle}>Enrollments</h1>
          <p className={styles.pageSubtitle}>
            Manage which students are enrolled in which courses and cohorts.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link
            to="/admin/enrollments/bulk"
            className={styles.bulkButton}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M17 21V19C17 17.9 16.1 17 15 17H5C3.9 17 3 17.9 3 19V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
              <path
                d="M23 21V19C23 17.9 22.1 17 21 17H18.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 3.13C16.9 3.44 17.6 4.4 17.6 5.5C17.6 6.6 16.9 7.56 16 7.87"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Bulk Enroll
          </Link>
          <Link to="/admin/enrollments/new" className={styles.addButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5V19M5 12H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Enroll Student
          </Link>
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
        <StatPill label="Total" value={stats.total} accent="blue" />
        <StatPill label="Active" value={stats.active} accent="green" />
        <StatPill label="Completed" value={stats.completed} accent="purple" />
        <StatPill label="Dropped" value={stats.dropped} accent="red" />
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
            placeholder="Search by student name, email, or IQ ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
        >
          <option value="all">All statuses</option>
          <option value="applied">Applied</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="dropped">Dropped</option>
        </select>

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
      </div>

      {/* Bulk action bar */}
      {someSelected || allSelected ? (
        <div className={styles.bulkBar}>
          <div className={styles.bulkInfo}>
            <strong>{selectedIds.size}</strong>{' '}
            {selectedIds.size === 1 ? 'enrollment' : 'enrollments'} selected
          </div>

          <div className={styles.bulkActions}>
            <select
              className={styles.bulkSelect}
              value=""
              onChange={(e) => {
                const val = e.target.value as EnrollmentStatus | '';
                if (val) openBulkStatusModal(val);
              }}
              disabled={actionLoading}
            >
              <option value="">Change status…</option>
              <option value="applied">Applied</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="dropped">Dropped</option>
            </select>

            <button
              type="button"
              className={styles.bulkDangerBtn}
              onClick={() => setBulkDeleteConfirm(true)}
              disabled={actionLoading}
            >
              🗑 Delete
            </button>

            <button
              type="button"
              className={styles.bulkClearBtn}
              onClick={clearSelection}
              disabled={actionLoading}
            >
              Clear
            </button>
          </div>
        </div>
      ) : null}

      {/* Content */}
      {isLoading ? (
        <div className={styles.skeletonTable}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className={styles.skeletonRow} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasEnrollments={enrollments.length > 0} />
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.checkboxCell}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleSelectAll}
                    className={styles.checkbox}
                    aria-label="Select all"
                  />
                </th>
                <th>Student</th>
                <th>Course</th>
                <th>Cohort</th>
                <th>Status</th>
                <th>Enrolled</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const student = e.student;
                const studentName = student
                  ? `${student.first_name} ${student.last_name}`.trim()
                  : 'Unknown';
                const initials = student ? getInitials(studentName) : '??';

                return (
                  <tr
                    key={e.id}
                    className={selectedIds.has(e.id) ? styles.rowSelected : ''}
                  >
                    <td className={styles.checkboxCell}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(e.id)}
                        onChange={() => toggleSelect(e.id)}
                        className={styles.checkbox}
                        aria-label={`Select ${studentName}`}
                      />
                    </td>
                    <td>
                      <div className={styles.studentCell}>
                        <div className={styles.avatar}>{initials}</div>
                        <div>
                          <div className={styles.studentName}>
                            {studentName}
                          </div>
                          <div className={styles.studentMeta}>
                            {student?.iq_id ?? student?.email ?? '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={styles.courseChip}>
                        {e.course?.title ?? '—'}
                      </span>
                    </td>
                    <td>
                      {e.cohort ? (
                        <div className={styles.cohortCell}>
                          <span className={styles.cohortName}>
                            {e.cohort.name}
                          </span>
                          {e.cohort.start_date && (
                            <span className={styles.cohortDate}>
                              {formatDate(e.cohort.start_date)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className={styles.muted}>—</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[`status-${e.status}`]
                        }`}
                      >
                        {formatEnrollmentStatus(e.status)}
                      </span>
                    </td>
                    <td>
                      <span className={styles.dateText}>
                        {formatDate(e.applied_at)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <select
                          className={styles.statusSelect}
                          value={e.status}
                          onChange={(ev) =>
                            handleStatusChange(
                              e,
                              ev.target.value as EnrollmentStatus
                            )
                          }
                          disabled={actionLoading}
                          title="Change status"
                        >
                          <option value="applied">Applied</option>
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="dropped">Dropped</option>
                        </select>
                        <button
                          type="button"
                          className={`${styles.rowActionBtn} ${styles.rowActionDanger}`}
                          onClick={() => setDeleteConfirmId(e.id)}
                          title="Delete enrollment"
                          disabled={actionLoading}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ================================================================
          MODALS
          ================================================================ */}

      {/* Single delete confirmation */}
      {deleteConfirmId && (
        <div
          className={styles.modalOverlay}
          onClick={() => setDeleteConfirmId(null)}
        >
          <div className={styles.modal} onClick={(ev) => ev.stopPropagation()}>
            <h3 className={styles.modalTitle}>Delete this enrollment?</h3>
            <p className={styles.modalText}>
              The student will no longer be enrolled in this course. Their
              account and any historical role assignments stay intact.
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

      {/* Bulk delete confirmation */}
      {bulkDeleteConfirm && (
        <div
          className={styles.modalOverlay}
          onClick={() => setBulkDeleteConfirm(false)}
        >
          <div className={styles.modal} onClick={(ev) => ev.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              Delete {selectedIds.size} enrollments?
            </h3>
            <p className={styles.modalText}>
              This will permanently remove{' '}
              <strong>
                {selectedIds.size} enrollment
                {selectedIds.size === 1 ? '' : 's'}
              </strong>
              . Student accounts remain intact. This cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={() => setBulkDeleteConfirm(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalConfirm}
                onClick={handleBulkDelete}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting…' : 'Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk status → completed modal (with date) */}
      {bulkStatusModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setBulkStatusModal(null)}
        >
          <div className={styles.modal} onClick={(ev) => ev.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              Mark {selectedIds.size}{' '}
              {selectedIds.size === 1 ? 'enrollment' : 'enrollments'} as{' '}
              <span style={{ color: '#5b21b6' }}>
                {formatEnrollmentStatus(bulkStatusModal.status)}
              </span>
              ?
            </h3>
            <p className={styles.modalText}>
              This will grant the <strong>alumni role</strong> to each student
              for their respective course + cohort.
            </p>

            <div className={styles.modalField}>
              <label className={styles.modalLabel}>
                Completion date (applies to all)
              </label>
              <input
                type="date"
                value={bulkStatusModal.completed_at}
                onChange={(ev) =>
                  setBulkStatusModal({
                    ...bulkStatusModal,
                    completed_at: ev.target.value,
                  })
                }
                className={styles.modalDateInput}
                max={new Date().toISOString().slice(0, 10)}
              />
              <span className={styles.modalHelper}>
                Defaults to today. Use a historical date for legacy alumni
                batches.
              </span>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={() => setBulkStatusModal(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalConfirmPurple}
                onClick={() =>
                  handleBulkStatusCommit(
                    bulkStatusModal.status,
                    bulkStatusModal.completed_at
                  )
                }
                disabled={actionLoading}
              >
                {actionLoading
                  ? 'Updating…'
                  : `Mark ${selectedIds.size} as Completed`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className={styles.toastContainer}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${styles.toast} ${
              t.type === 'error' ? styles.toastError : styles.toastSuccess
            }`}
          >
            <span className={styles.toastIcon}>
              {t.type === 'error' ? '⚠️' : '✓'}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Sub-components
// ============================================================================

interface StatPillProps {
  label: string;
  value: number;
  accent: 'blue' | 'green' | 'purple' | 'red';
}

const StatPill: React.FC<StatPillProps> = ({ label, value, accent }) => (
  <div className={`${styles.statPill} ${styles[`stat-${accent}`]}`}>
    <span className={styles.statValue}>{value}</span>
    <span className={styles.statLabel}>{label}</span>
  </div>
);

const EmptyState: React.FC<{ hasEnrollments: boolean }> = ({
  hasEnrollments,
}) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>🎓</div>
    <h3 className={styles.emptyTitle}>
      {hasEnrollments
        ? 'No enrollments match your filters'
        : 'No enrollments yet'}
    </h3>
    <p className={styles.emptyText}>
      {hasEnrollments
        ? 'Try adjusting your search or filters.'
        : 'Enroll your first student in a course to get started.'}
    </p>
    {!hasEnrollments && (
      <Link to="/admin/enrollments/new" className={styles.emptyCta}>
        + Enroll Student
      </Link>
    )}
  </div>
);