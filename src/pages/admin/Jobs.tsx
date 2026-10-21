// ============================================================================
// iQuire — Admin: Jobs List (Phase 12D.9)
// ============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchAllJobs,
  updateJob,
  deleteJob,
  type JobWithCourse,
} from '../../services/jobs.service';
import {
  formatWorkMode,
  formatOpportunityType,
  formatExperienceLevel,
} from '../../types/content.types';
import styles from './Jobs.module.css';

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

export const AdminJobs: React.FC = () => {
  const [jobs, setJobs] = useState<JobWithCourse[]>([]);
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

      const res = await fetchAllJobs();
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

    if (statusFilter !== 'all') {
      list = list.filter((j) => j.status === statusFilter);
    }

    return list;
  }, [jobs, search, statusFilter]);

  // --------------------------------------------------------------------------
  // Actions
  // --------------------------------------------------------------------------
  const handleToggleStatus = async (job: JobWithCourse) => {
    const nextStatus = job.status === 'published' ? 'draft' : 'published';

    setJobs((prev) =>
      prev.map((item) =>
        item.id === job.id ? { ...item, status: nextStatus } : item
      )
    );

    const res = await updateJob(job.id, { status: nextStatus });
    if (!res.success) {
      setJobs((prev) =>
        prev.map((item) =>
          item.id === job.id ? { ...item, status: job.status } : item
        )
      );
      setError(res.error ?? 'Failed to update status');
    }
  };

  const handleToggleFeatured = async (job: JobWithCourse) => {
    const nextFeatured = !job.featured;

    setJobs((prev) =>
      prev.map((item) =>
        item.id === job.id ? { ...item, featured: nextFeatured } : item
      )
    );

    const res = await updateJob(job.id, { featured: nextFeatured });
    if (!res.success) {
      setJobs((prev) =>
        prev.map((item) =>
          item.id === job.id ? { ...item, featured: job.featured } : item
        )
      );
      setError(res.error ?? 'Failed to update featured');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteJob(id);
    if (!res.success) {
      setError(res.error ?? 'Failed to delete');
      setDeleteConfirmId(null);
      return;
    }
    setJobs((prev) => prev.filter((j) => j.id !== id));
    setDeleteConfirmId(null);
  };

  // --------------------------------------------------------------------------
  // Stats
  // --------------------------------------------------------------------------
  const stats = useMemo(
    () => ({
      total: jobs.length,
      published: jobs.filter((j) => j.status === 'published').length,
      draft: jobs.filter((j) => j.status === 'draft').length,
      featured: jobs.filter((j) => j.featured).length,
    }),
    [jobs]
  );

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Jobs</h1>
          <p className={styles.pageSubtitle}>
            Manage job listings visible on the public jobs page.
          </p>
        </div>
        <Link to="/admin/jobs/new" className={styles.addButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          New Job
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
        <StatPill label="Featured" value={stats.featured} accent="gold" />
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
            placeholder="Search by title, company, skill…"
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
        <EmptyState hasItems={jobs.length > 0} />
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Job</th>
                <th>Type</th>
                <th>Mode</th>
                <th>Level</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((j) => (
                <tr key={j.id}>
                  <td>
                    <div className={styles.titleCell}>
                      <div className={styles.companyLogo}>
                        {j.company_logo_url ? (
                          <img src={j.company_logo_url} alt={j.company} />
                        ) : (
                          j.company.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className={styles.titleText}>
                          {j.title}
                          {j.featured && (
                            <span className={styles.featuredStar}>⭐</span>
                          )}
                        </div>
                        <div className={styles.companyText}>
                          {j.company}
                          {j.location && ` · ${j.location}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.typeChip}>
                      {formatOpportunityType(j.opportunity_type)}
                    </span>
                  </td>
                  <td>
                    <span className={styles.modeChip}>
                      {formatWorkMode(j.work_mode)}
                    </span>
                  </td>
                  <td>
                    <span className={styles.levelChip}>
                      {formatExperienceLevel(j.experience_level)}
                    </span>
                  </td>
                  <td>
                    <span className={styles.dateText}>
                      {formatDate(j.deadline)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[`status-${j.status}`]
                      }`}
                    >
                      {j.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <Link
                        to={`/admin/jobs/${j.id}/edit`}
                        className={styles.rowActionBtn}
                        title="Edit"
                      >
                        ✏️ Edit
                      </Link>
                      <button
                        type="button"
                        className={styles.rowActionBtn}
                        onClick={() => handleToggleFeatured(j)}
                        title={j.featured ? 'Unfeature' : 'Feature'}
                      >
                        {j.featured ? '⭐ Unfeature' : '⭐ Feature'}
                      </button>
                      <button
                        type="button"
                        className={styles.rowActionBtn}
                        onClick={() => handleToggleStatus(j)}
                        title={j.status === 'published' ? 'Unpublish' : 'Publish'}
                      >
                        {j.status === 'published' ? '👁 Draft' : '✓ Publish'}
                      </button>
                      <button
                        type="button"
                        className={`${styles.rowActionBtn} ${styles.rowActionDanger}`}
                        onClick={() => setDeleteConfirmId(j.id)}
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
            <h3 className={styles.modalTitle}>Delete this job?</h3>
            <p className={styles.modalText}>
              This will permanently remove the job listing. This cannot be
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
    <div className={styles.emptyIcon}>💼</div>
    <h3 className={styles.emptyTitle}>
      {hasItems ? 'No jobs match your filters' : 'No jobs yet'}
    </h3>
    <p className={styles.emptyText}>
      {hasItems
        ? 'Try adjusting your search or filters.'
        : 'Create your first job listing to get started.'}
    </p>
    {!hasItems && (
      <Link to="/admin/jobs/new" className={styles.emptyCta}>
        + New Job
      </Link>
    )}
  </div>
);