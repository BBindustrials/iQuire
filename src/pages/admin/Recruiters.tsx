// ============================================================================
// iQuire — Admin: Recruiters List (Phase 12C.2)
// ============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchAllRecruiters,
  type RecruiterListItem,
  type RecruiterVerificationStatus,
} from '../../services/recruiters.service';
import styles from './Recruiters.module.css';

// ============================================================================
// Component
// ============================================================================

export const AdminRecruiters: React.FC = () => {
  const [recruiters, setRecruiters] = useState<RecruiterListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RecruiterVerificationStatus>('all');

  // --------------------------------------------------------------------------
  // Load
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      const res = await fetchAllRecruiters();
      if (!isMounted) return;

      if (!res.success) {
        setError(res.error ?? 'Failed to load recruiters');
        setIsLoading(false);
        return;
      }

      setRecruiters(res.data ?? []);
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
    let list = [...recruiters];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.first_name.toLowerCase().includes(q) ||
          r.last_name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.company_name.toLowerCase().includes(q) ||
          r.industry.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter((r) => r.verification_status === statusFilter);
    }

    return list;
  }, [recruiters, search, statusFilter]);

  // --------------------------------------------------------------------------
  // Stats
  // --------------------------------------------------------------------------
  const stats = useMemo(
    () => ({
      total: recruiters.length,
      pending: recruiters.filter((r) => r.verification_status === 'pending').length,
      verified: recruiters.filter((r) => r.verification_status === 'verified').length,
      rejected: recruiters.filter((r) => r.verification_status === 'rejected').length,
    }),
    [recruiters]
  );

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Recruiters</h1>
          <p className={styles.pageSubtitle}>
            Review and verify companies looking to hire IQuire talent.
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
        <StatPill label="Total" value={stats.total} accent="blue" />
        <StatPill label="Pending" value={stats.pending} accent="gold" />
        <StatPill label="Verified" value={stats.verified} accent="green" />
        <StatPill label="Rejected" value={stats.rejected} accent="red" />
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
            placeholder="Search by name, company, or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as 'all' | RecruiterVerificationStatus)
          }
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className={styles.skeletonTable}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className={styles.skeletonRow} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasRecruiters={recruiters.length > 0} />
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Recruiter</th>
                <th>Company</th>
                <th>Industry</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className={styles.recruiterCell}>
                      <div className={styles.avatar}>
                        {r.first_name[0]}
                        {r.last_name[0]}
                      </div>
                      <div>
                        <div className={styles.recruiterName}>
                          {r.first_name} {r.last_name}
                        </div>
                        <div className={styles.recruiterEmail}>{r.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.companyCell}>
                      <strong>{r.company_name}</strong>
                      {r.company_website && (
                        <a
                          href={r.company_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.companyLink}
                        >
                          {r.company_website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={styles.industryTag}>{r.industry}</span>
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[`status-${r.verification_status}`]
                      }`}
                    >
                      {r.verification_status}
                    </span>
                  </td>
                  <td>
                    <span className={styles.dateText}>
                      {new Date(r.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </td>
                  <td>
                    <Link
                      to={`/admin/recruiters/${r.id}`}
                      className={styles.rowActionBtn}
                    >
                      {r.verification_status === 'pending'
                        ? '🔍 Review'
                        : '👁 View'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
  accent: 'blue' | 'green' | 'gold' | 'red';
}

const StatPill: React.FC<StatPillProps> = ({ label, value, accent }) => (
  <div className={`${styles.statPill} ${styles[`stat-${accent}`]}`}>
    <span className={styles.statValue}>{value}</span>
    <span className={styles.statLabel}>{label}</span>
  </div>
);

const EmptyState: React.FC<{ hasRecruiters: boolean }> = ({ hasRecruiters }) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>🏢</div>
    <h3 className={styles.emptyTitle}>
      {hasRecruiters ? 'No recruiters match your filters' : 'No recruiters yet'}
    </h3>
    <p className={styles.emptyText}>
      {hasRecruiters
        ? 'Try adjusting your search or filters.'
        : 'Recruiters will appear here once they sign up on /register/recruiter.'}
    </p>
  </div>
);