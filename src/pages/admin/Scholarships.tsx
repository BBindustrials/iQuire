// ============================================================================
// iQuire — Admin: Scholarships List (Phase 12D.7)
// ============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchAllScholarships,
  updateScholarship,
  deleteScholarship,
  type ScholarshipWithCourse,
} from '../../services/scholarships.service';
import styles from './Scholarships.module.css';

// ============================================================================
// Helpers
// ============================================================================

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

// ============================================================================
// Component
// ============================================================================

export const AdminScholarships: React.FC = () => {
  const [scholarships, setScholarships] = useState<ScholarshipWithCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'draft' | 'published' | 'closed' | 'archived'
  >('all');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // Load
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      const res = await fetchAllScholarships();
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
  // Filter
  // --------------------------------------------------------------------------
  const filtered = useMemo(() => {
    let list = [...scholarships];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.slug.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter((s) => s.status === statusFilter);
    }

    return list;
  }, [scholarships, search, statusFilter]);

  // --------------------------------------------------------------------------
  // Actions
  // --------------------------------------------------------------------------
  const handleToggleStatus = async (s: ScholarshipWithCourse) => {
    const nextStatus = s.status === 'published' ? 'draft' : 'published';

    setScholarships((prev) =>
      prev.map((item) =>
        item.id === s.id ? { ...item, status: nextStatus } : item
      )
    );

    const res = await updateScholarship(s.id, { status: nextStatus });
    if (!res.success) {
      setScholarships((prev) =>
        prev.map((item) =>
          item.id === s.id ? { ...item, status: s.status } : item
        )
      );
      setError(res.error ?? 'Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteScholarship(id);
    if (!res.success) {
      setError(res.error ?? 'Failed to delete');
      setDeleteConfirmId(null);
      return;
    }
    setScholarships((prev) => prev.filter((s) => s.id !== id));
    setDeleteConfirmId(null);
  };

  // --------------------------------------------------------------------------
  // Stats
  // --------------------------------------------------------------------------
  const stats = useMemo(
    () => ({
      total: scholarships.length,
      published: scholarships.filter((s) => s.status === 'published').length,
      draft: scholarships.filter((s) => s.status === 'draft').length,
      closed: scholarships.filter((s) => s.status === 'closed').length,
    }),
    [scholarships]
  );

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Scholarships</h1>
          <p className={styles.pageSubtitle}>
            Manage scholarship programmes — publish, edit, and organise.
          </p>
        </div>
        <Link to="/admin/scholarships/new" className={styles.addButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          New Scholarship
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
        <StatPill label="Published" value={stats.published} accent="green" />
        <StatPill label="Draft" value={stats.draft} accent="gray" />
        <StatPill label="Closed" value={stats.closed} accent="gold" />
      </div>

      {/* Filters */}
      <div className={styles.filtersRow}>
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
            placeholder="Search by title, slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value as
                | 'all'
                | 'draft'
                | 'published'
                | 'closed'
                | 'archived'
            )
          }
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="closed">Closed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className={styles.skeletonTable}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={styles.skeletonRow} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasItems={scholarships.length > 0} />
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Scholarship</th>
                <th>Course</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className={styles.titleCell}>
                      <div className={styles.iconBadge}>🎓</div>
                      <div>
                        <div className={styles.titleText}>{s.title}</div>
                        <div className={styles.slugText}>/{s.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {s.course ? (
                      <span className={styles.courseChip}>
                        {s.course.title}
                      </span>
                    ) : (
                      <span className={styles.muted}>—</span>
                    )}
                  </td>
                  <td>
                    <span className={styles.dateText}>
                      {formatDate(s.deadline)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[`status-${s.status}`]
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <span className={styles.dateText}>
                      {formatDate(s.updated_at)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <Link
                        to={`/admin/scholarships/${s.id}/edit`}
                        className={styles.rowActionBtn}
                        title="Edit"
                      >
                        ✏️ Edit
                      </Link>
                      <button
                        type="button"
                        className={styles.rowActionBtn}
                        onClick={() => handleToggleStatus(s)}
                        title={
                          s.status === 'published'
                            ? 'Unpublish'
                            : 'Publish'
                        }
                      >
                        {s.status === 'published' ? '👁 Draft' : '✓ Publish'}
                      </button>
                      <button
                        type="button"
                        className={`${styles.rowActionBtn} ${styles.rowActionDanger}`}
                        onClick={() => setDeleteConfirmId(s.id)}
                        title="Delete"
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
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Delete this scholarship?</h3>
            <p className={styles.modalText}>
              This will permanently remove the scholarship. This cannot be
              undone.
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

const EmptyState: React.FC<{ hasItems: boolean }> = ({ hasItems }) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>🎓</div>
    <h3 className={styles.emptyTitle}>
      {hasItems
        ? 'No scholarships match your filters'
        : 'No scholarships yet'}
    </h3>
    <p className={styles.emptyText}>
      {hasItems
        ? 'Try adjusting your search or filters.'
        : 'Create your first scholarship to get started.'}
    </p>
    {!hasItems && (
      <Link to="/admin/scholarships/new" className={styles.emptyCta}>
        + New Scholarship
      </Link>
    )}
  </div>
);