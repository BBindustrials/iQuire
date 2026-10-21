// ============================================================================
// iQuire — Admin: Students List (Phase 11B.5)
// ============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchStudents,
  toggleStudentStatus,
  type StudentListItem,
} from '../../services/students.service';
import styles from './Students.module.css';

// ============================================================================
// Component
// ============================================================================

export const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // --------------------------------------------------------------------------
  // Load
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      const res = await fetchStudents();
      if (!isMounted) return;

      if (!res.success) {
        setError(res.error ?? 'Failed to load students');
        setIsLoading(false);
        return;
      }

      setStudents(res.data ?? []);
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
    let list = [...students];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.first_name.toLowerCase().includes(q) ||
          s.last_name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.iq_id?.toLowerCase().includes(q) ||
          s.participant_id?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter((s) => s.account_status === statusFilter);
    }

    return list;
  }, [students, search, statusFilter]);

  // --------------------------------------------------------------------------
  // Toggle active/suspended
  // --------------------------------------------------------------------------
  const handleToggleStatus = async (student: StudentListItem) => {
    const nextStatus = student.account_status === 'active' ? 'suspended' : 'active';
    const confirmMsg =
      nextStatus === 'suspended'
        ? `Suspend ${student.first_name} ${student.last_name}? They will not be able to login.`
        : `Reactivate ${student.first_name} ${student.last_name}?`;

    if (!window.confirm(confirmMsg)) return;

    setStudents((prev) =>
      prev.map((s) =>
        s.id === student.id ? { ...s, account_status: nextStatus } : s
      )
    );

    const res = await toggleStudentStatus(student.id, nextStatus);
    if (!res.success) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === student.id ? { ...s, account_status: student.account_status } : s
        )
      );
      setError(res.error ?? 'Failed to update status');
    }
  };

  // --------------------------------------------------------------------------
  // Stats
  // --------------------------------------------------------------------------
  const stats = useMemo(
    () => ({
      total: students.length,
      active: students.filter((s) => s.account_status === 'active').length,
      suspended: students.filter((s) => s.account_status === 'suspended').length,
      mustChange: students.filter((s) => s.must_change_password).length,
    }),
    [students]
  );

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Students</h1>
          <p className={styles.pageSubtitle}>
            Manage student accounts, credentials, and course access.
          </p>
        </div>
        <Link to="/admin/students/new" className={styles.addButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Create Student
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
        <StatPill label="Active" value={stats.active} accent="green" />
        <StatPill label="Suspended" value={stats.suspended} accent="red" />
        <StatPill label="Must change password" value={stats.mustChange} accent="gold" />
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
            placeholder="Search by name, email, or IQuire ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as 'all' | 'active' | 'suspended')
          }
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
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
        <EmptyState hasStudents={students.length > 0} />
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>IQuire ID</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className={styles.studentCell}>
                      <div className={styles.avatar}>
                        {s.first_name[0]}
                        {s.last_name[0]}
                      </div>
                      <div>
                        <div className={styles.studentName}>
                          {s.first_name} {s.last_name}
                        </div>
                        {s.must_change_password && (
                          <span className={styles.changePasswordBadge}>
                            Password change pending
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    {s.iq_id ? (
                      <code className={styles.iqId}>{s.iq_id}</code>
                    ) : (
                      <span className={styles.muted}>—</span>
                    )}
                  </td>
                  <td>
                    <div className={styles.contactCell}>
                      <span>{s.email}</span>
                      {s.phone && <span className={styles.muted}>{s.phone}</span>}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${styles[`status-${s.account_status}`]}`}
                    >
                      {s.account_status}
                    </span>
                  </td>
                  <td>
                    <span className={styles.dateText}>
                      {new Date(s.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <Link
                        to={`/admin/students/${s.id}`}
                        className={styles.rowActionBtn}
                        title="View / Edit"
                      >
                        ✏️ Edit
                      </Link>
                      <button
                        type="button"
                        className={`${styles.rowActionBtn} ${
                          s.account_status === 'active' ? styles.rowActionDanger : ''
                        }`}
                        onClick={() => handleToggleStatus(s)}
                        title={s.account_status === 'active' ? 'Suspend' : 'Reactivate'}
                      >
                        {s.account_status === 'active' ? '⏸ Suspend' : '▶ Reactivate'}
                      </button>
                    </div>
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

const EmptyState: React.FC<{ hasStudents: boolean }> = ({ hasStudents }) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>🎓</div>
    <h3 className={styles.emptyTitle}>
      {hasStudents ? 'No students match your filters' : 'No students yet'}
    </h3>
    <p className={styles.emptyText}>
      {hasStudents
        ? 'Try adjusting your search or filters.'
        : 'Create your first student account to get started.'}
    </p>
    {!hasStudents && (
      <Link to="/admin/students/new" className={styles.emptyCta}>
        + Create Student
      </Link>
    )}
  </div>
);