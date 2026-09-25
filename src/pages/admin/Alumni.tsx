// ============================================================================
// iQuire — Admin: Alumni Management (Phase 9A.2)
// ============================================================================

import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchAllAlumni,
  deleteAlumni,
  toggleFeatured,
  toggleStatus,
  type Alumni,
  type AlumniStatus,
} from '../../services/alumni.service';
import styles from './Alumni.module.css';

// ============================================================================
// Component
// ============================================================================

export const AdminAlumni: React.FC = () => {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AlumniStatus>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'not-featured'>(
    'all'
  );

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // Load alumni
  // --------------------------------------------------------------------------
  const load = async () => {
    setIsLoading(true);
    setError(null);
    const result = await fetchAllAlumni();
    if (!result.success) {
      setError(result.error ?? 'Failed to load alumni');
      setIsLoading(false);
      return;
    }
    setAlumni(result.data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, []);

  // --------------------------------------------------------------------------
  // Derived: filtered list
  // --------------------------------------------------------------------------
  const filtered = useMemo(() => {
    let list = [...alumni];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.full_name.toLowerCase().includes(q) ||
          a.professional_title.toLowerCase().includes(q) ||
          a.programme?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter((a) => a.status === statusFilter);
    }

    if (featuredFilter === 'featured') {
      list = list.filter((a) => a.featured);
    } else if (featuredFilter === 'not-featured') {
      list = list.filter((a) => !a.featured);
    }

    return list;
  }, [alumni, search, statusFilter, featuredFilter]);

  // --------------------------------------------------------------------------
  // Quick actions
  // --------------------------------------------------------------------------
  const handleToggleFeatured = async (a: Alumni) => {
    const next = !a.featured;
    setAlumni((prev) =>
      prev.map((x) => (x.id === a.id ? { ...x, featured: next } : x))
    );
    const res = await toggleFeatured(a.id, next);
    if (!res.success) {
      // Revert on failure
      setAlumni((prev) =>
        prev.map((x) => (x.id === a.id ? { ...x, featured: !next } : x))
      );
      setError(res.error ?? 'Failed to update');
    }
  };

  const handleToggleStatus = async (a: Alumni) => {
    const nextStatus: AlumniStatus =
      a.status === 'published' ? 'draft' : 'published';
    setAlumni((prev) =>
      prev.map((x) => (x.id === a.id ? { ...x, status: nextStatus } : x))
    );
    const res = await toggleStatus(a.id, nextStatus);
    if (!res.success) {
      setAlumni((prev) =>
        prev.map((x) => (x.id === a.id ? { ...x, status: a.status } : x))
      );
      setError(res.error ?? 'Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteAlumni(id);
    if (!res.success) {
      setError(res.error ?? 'Failed to delete');
      return;
    }
    setAlumni((prev) => prev.filter((x) => x.id !== id));
    setDeleteConfirmId(null);
  };

  // --------------------------------------------------------------------------
  // Stats
  // --------------------------------------------------------------------------
  const stats = useMemo(
    () => ({
      total: alumni.length,
      published: alumni.filter((a) => a.status === 'published').length,
      draft: alumni.filter((a) => a.status === 'draft').length,
      featured: alumni.filter((a) => a.featured).length,
    }),
    [alumni]
  );

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Alumni</h1>
          <p className={styles.pageSubtitle}>
            Manage alumni profiles shown on the public site.
          </p>
        </div>
        <Link to="/admin/alumni/new" className={styles.addButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add Alumni
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
        <StatPill label="Featured" value={stats.featured} accent="gold" />
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
            placeholder="Search by name, title, or programme…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | AlumniStatus)}
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>

        <select
          className={styles.filterSelect}
          value={featuredFilter}
          onChange={(e) =>
            setFeaturedFilter(e.target.value as 'all' | 'featured' | 'not-featured')
          }
        >
          <option value="all">All</option>
          <option value="featured">Featured only</option>
          <option value="not-featured">Not featured</option>
        </select>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className={styles.skeletonGrid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasAlumni={alumni.length > 0} />
      ) : (
        <div className={styles.grid}>
          {filtered.map((a) => (
            <article key={a.id} className={styles.card}>
              {/* Photo */}
              <div className={styles.cardPhoto}>
                {a.photo_url ? (
                  <img src={a.photo_url} alt={a.full_name} loading="lazy" />
                ) : (
                  <div className={styles.cardPhotoPlaceholder}>
                    {a.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}

                {/* Status badge */}
                <span className={`${styles.statusBadge} ${styles[`status-${a.status}`]}`}>
                  {a.status}
                </span>

                {/* Featured star */}
                {a.featured && <span className={styles.featuredStar}>★</span>}
              </div>

              {/* Body */}
              <div className={styles.cardBody}>
                <h3 className={styles.cardName}>{a.full_name}</h3>
                <p className={styles.cardTitle}>{a.professional_title}</p>
                {(a.programme || a.cohort) && (
                  <p className={styles.cardProgramme}>
                    {[a.programme, a.cohort].filter(Boolean).join(' · ')}
                  </p>
                )}
                <p className={styles.cardSummary}>{a.short_summary}</p>
              </div>

              {/* Actions */}
              <div className={styles.cardActions}>
                <Link
                  to={`/admin/alumni/${a.id}/edit`}
                  className={styles.actionBtn}
                  title="Edit"
                >
                  ✏️ Edit
                </Link>

                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => handleToggleFeatured(a)}
                  title="Toggle featured"
                >
                  {a.featured ? '★ Unfeature' : '☆ Feature'}
                </button>

                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => handleToggleStatus(a)}
                  title="Toggle published/draft"
                >
                  {a.status === 'published' ? '⏸ Unpublish' : '▶ Publish'}
                </button>

                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.actionDanger}`}
                  onClick={() => setDeleteConfirmId(a.id)}
                  title="Delete"
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
            <h3 className={styles.modalTitle}>Delete this alumni profile?</h3>
            <p className={styles.modalText}>
              This will permanently remove the profile and its photo. This
              cannot be undone.
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

const EmptyState: React.FC<{ hasAlumni: boolean }> = ({ hasAlumni }) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>👥</div>
    <h3 className={styles.emptyTitle}>
      {hasAlumni ? 'No alumni match your filters' : 'No alumni yet'}
    </h3>
    <p className={styles.emptyText}>
      {hasAlumni
        ? 'Try adjusting your search or filters.'
        : 'Add your first alumni profile to showcase them on the public site.'}
    </p>
    {!hasAlumni && (
      <Link to="/admin/alumni/new" className={styles.emptyCta}>
        + Add Alumni
      </Link>
    )}
  </div>
);