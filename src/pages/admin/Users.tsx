// ============================================================================
// iQuire — Admin: Unified Users List (Phase 16.5)
// ============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchAllUsers,
  toggleUserStatus,
  formatAccountType,
  formatUserStatus,
  getInitials,
  type UnifiedUser,
  type AccountType,
  type UserStatus,
} from '../../services/users.service';
import styles from './Users.module.css';

// ============================================================================
// Types
// ============================================================================

type AccountTypeFilter = 'all' | AccountType;
type StatusFilter = 'all' | UserStatus;

// ============================================================================
// Component
// ============================================================================

export const AdminUsers: React.FC = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState<UnifiedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<AccountTypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // --------------------------------------------------------------------------
  // Load
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      const res = await fetchAllUsers();
      if (!isMounted) return;

      if (!res.success) {
        setError(res.error ?? 'Failed to load users');
        setIsLoading(false);
        return;
      }

      setUsers(res.data ?? []);
      setIsLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --------------------------------------------------------------------------
  // Filter
  // --------------------------------------------------------------------------
  const filtered = useMemo(() => {
    let list = [...users];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (u) =>
          u.first_name.toLowerCase().includes(q) ||
          u.last_name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.iq_id?.toLowerCase().includes(q) ||
          u.participant_id?.toLowerCase().includes(q)
      );
    }

    if (typeFilter !== 'all') {
      list = list.filter((u) => u.account_type === typeFilter);
    }

    if (statusFilter !== 'all') {
      list = list.filter((u) => u.account_status === statusFilter);
    }

    return list;
  }, [users, search, typeFilter, statusFilter]);

  // --------------------------------------------------------------------------
  // Stats
  // --------------------------------------------------------------------------
  const stats = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((u) => u.account_type === 'admin').length,
      recruiters: users.filter((u) => u.account_type === 'recruiter').length,
      members: users.filter((u) => u.account_type === 'member').length,
    }),
    [users]
  );

  // --------------------------------------------------------------------------
  // Actions
  // --------------------------------------------------------------------------
  const handleToggleStatus = async (user: UnifiedUser) => {
    const nextStatus: UserStatus =
      user.account_status === 'active' ? 'suspended' : 'active';

    const confirmMsg =
      nextStatus === 'suspended'
        ? `Suspend ${user.first_name} ${user.last_name}? They will not be able to log in.`
        : `Reactivate ${user.first_name} ${user.last_name}?`;

    if (!window.confirm(confirmMsg)) return;

    setActionLoading(user.id);

    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, account_status: nextStatus } : u
      )
    );

    const res = await toggleUserStatus(user.id, nextStatus);
    setActionLoading(null);

    if (!res.success) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, account_status: user.account_status } : u
        )
      );
      showToast(res.error ?? 'Failed to update status', 'error');
    } else {
      showToast(nextStatus === 'suspended' ? 'User suspended' : 'User reactivated');
    }
  };

  const handleViewUser = (user: UnifiedUser) => {
    switch (user.account_type) {
      case 'admin':
        navigate('/admin/users/admins');
        break;
      case 'recruiter':
        navigate('/admin/recruiters');
        break;
      case 'member':
      default:
        navigate(`/admin/students/${user.id}`);
        break;
    }
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

  const getTypeContext = (user: UnifiedUser): string => {
    if (user.account_type === 'admin') {
      return user.bio_title ?? 'Administrator';
    }
    if (user.account_type === 'recruiter') {
      return user.recruiter_company ?? 'Recruiter';
    }
    // member
    if (user.enrollment_count > 0) {
      return `${user.enrollment_count} course${
        user.enrollment_count === 1 ? '' : 's'
      }`;
    }
    return 'Not enrolled';
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>All Users</h1>
          <p className={styles.pageSubtitle}>
            Every account across the platform — students, alumni, recruiters,
            and admins.
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
        <StatPill label="Admins" value={stats.admins} accent="gold" />
        <StatPill label="Recruiters" value={stats.recruiters} accent="purple" />
        <StatPill label="Students / Alumni" value={stats.members} accent="green" />
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
            placeholder="Search by name, email, or IQ ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <select
          className={styles.filterSelect}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as AccountTypeFilter)}
        >
          <option value="all">All types</option>
          <option value="member">Students / Alumni</option>
          <option value="recruiter">Recruiters</option>
          <option value="admin">Admins</option>
        </select>

        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className={styles.skeletonTable}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.skeletonRow} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasUsers={users.length > 0} />
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Type</th>
                <th>Context</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const fullName = `${user.first_name} ${user.last_name}`.trim();
                const initials = getInitials(user.first_name, user.last_name);
                const isActionLoading = actionLoading === user.id;

                return (
                  <tr key={user.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div
                          className={`${styles.avatar} ${
                            styles[`avatar-${user.account_type}`]
                          }`}
                        >
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={fullName} />
                          ) : (
                            <span>{initials}</span>
                          )}
                        </div>
                        <div>
                          <div className={styles.userName}>{fullName}</div>
                          <div className={styles.userEmail}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`${styles.typeChip} ${
                          styles[`type-${user.account_type}`]
                        }`}
                      >
                        {formatAccountType(user.account_type)}
                      </span>
                    </td>
                    <td>
                      <span className={styles.contextText}>
                        {getTypeContext(user)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[`status-${user.account_status}`]
                        }`}
                      >
                        {formatUserStatus(user.account_status)}
                      </span>
                    </td>
                    <td>
                      <span className={styles.dateText}>
                        {formatDate(user.created_at)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.rowActionBtn}
                          onClick={() => handleViewUser(user)}
                          title="View details"
                        >
                          👁 View
                        </button>
                        <button
                          type="button"
                          className={`${styles.rowActionBtn} ${
                            user.account_status === 'active'
                              ? styles.rowActionDanger
                              : ''
                          }`}
                          onClick={() => handleToggleStatus(user)}
                          disabled={isActionLoading}
                          title={
                            user.account_status === 'active'
                              ? 'Suspend'
                              : 'Reactivate'
                          }
                        >
                          {user.account_status === 'active'
                            ? '⏸ Suspend'
                            : '▶ Reactivate'}
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

      {/* Toast */}
      {toast && (
        <div
          className={`${styles.toast} ${
            toast.type === 'error' ? styles.toastError : styles.toastSuccess
          }`}
        >
          <span className={styles.toastIcon}>
            {toast.type === 'error' ? '⚠️' : '✓'}
          </span>
          <span>{toast.message}</span>
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
  accent: 'blue' | 'gold' | 'purple' | 'green';
}

const StatPill: React.FC<StatPillProps> = ({ label, value, accent }) => (
  <div className={`${styles.statPill} ${styles[`stat-${accent}`]}`}>
    <span className={styles.statValue}>{value}</span>
    <span className={styles.statLabel}>{label}</span>
  </div>
);

const EmptyState: React.FC<{ hasUsers: boolean }> = ({ hasUsers }) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>👥</div>
    <h3 className={styles.emptyTitle}>
      {hasUsers ? 'No users match your filters' : 'No users yet'}
    </h3>
    <p className={styles.emptyText}>
      {hasUsers
        ? 'Try adjusting your search or filters.'
        : 'Users will appear here once they sign up or are created by an admin.'}
    </p>
  </div>
);