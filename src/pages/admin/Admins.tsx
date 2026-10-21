// ============================================================================
// iQuire — Admin: Admins List (Phase 16.3)
// ============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchAdminUsers,
  toggleUserStatus,
  sendPasswordResetEmail,
  formatUserStatus,
  getInitials,
  type UnifiedUser,
  type UserStatus,
} from '../../services/users.service';
import styles from './Admins.module.css';

// ============================================================================
// Types
// ============================================================================

type StatusFilter = 'all' | UserStatus;

// ============================================================================
// Component
// ============================================================================

export const AdminAdmins: React.FC = () => {
  const [admins, setAdmins] = useState<UnifiedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Reset email confirmation
  const [resetConfirmId, setResetConfirmId] = useState<string | null>(null);

  // Toast
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

      const res = await fetchAdminUsers();
      if (!isMounted) return;

      if (!res.success) {
        setError(res.error ?? 'Failed to load admins');
        setIsLoading(false);
        return;
      }

      setAdmins(res.data ?? []);
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
    let list = [...admins];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (u) =>
          u.first_name.toLowerCase().includes(q) ||
          u.last_name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.bio_title?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter((u) => u.account_status === statusFilter);
    }

    return list;
  }, [admins, search, statusFilter]);

  // --------------------------------------------------------------------------
  // Stats
  // --------------------------------------------------------------------------
  const stats = useMemo(
    () => ({
      total: admins.length,
      active: admins.filter((u) => u.account_status === 'active').length,
      suspended: admins.filter((u) => u.account_status === 'suspended').length,
    }),
    [admins]
  );

  // --------------------------------------------------------------------------
  // Actions
  // --------------------------------------------------------------------------
  const handleToggleStatus = async (admin: UnifiedUser) => {
    const nextStatus: UserStatus =
      admin.account_status === 'active' ? 'suspended' : 'active';

    const confirmMsg =
      nextStatus === 'suspended'
        ? `Suspend ${admin.first_name} ${admin.last_name}? They will not be able to log in.`
        : `Reactivate ${admin.first_name} ${admin.last_name}?`;

    if (!window.confirm(confirmMsg)) return;

    setActionLoading(admin.id);

    // Optimistic
    setAdmins((prev) =>
      prev.map((u) =>
        u.id === admin.id ? { ...u, account_status: nextStatus } : u
      )
    );

    const res = await toggleUserStatus(admin.id, nextStatus);
    setActionLoading(null);

    if (!res.success) {
      setAdmins((prev) =>
        prev.map((u) =>
          u.id === admin.id
            ? { ...u, account_status: admin.account_status }
            : u
        )
      );
      showToast(res.error ?? 'Failed to update status', 'error');
    } else {
      showToast(
        nextStatus === 'suspended'
          ? 'Admin suspended'
          : 'Admin reactivated'
      );
    }
  };

  const handleSendReset = async (admin: UnifiedUser) => {
    setResetConfirmId(null);
    setActionLoading(admin.id);

    const res = await sendPasswordResetEmail(admin.email);
    setActionLoading(null);

    if (!res.success) {
      showToast(res.error ?? 'Failed to send password reset', 'error');
    } else {
      showToast(`Password reset email sent to ${admin.email}`);
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

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Admins</h1>
          <p className={styles.pageSubtitle}>
            Manage IQuire administrator accounts. Admins have full access to
            the platform.
          </p>
        </div>
        <Link to="/admin/users/admins/new" className={styles.addButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Create Admin
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
            placeholder="Search by name, email, or role…"
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
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
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
        <EmptyState hasAdmins={admins.length > 0} />
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Admin</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((admin) => {
                const fullName = `${admin.first_name} ${admin.last_name}`.trim();
                const initials = getInitials(admin.first_name, admin.last_name);
                const isActionLoading = actionLoading === admin.id;

                return (
                  <tr key={admin.id}>
                    <td>
                      <div className={styles.adminCell}>
                        <div className={styles.avatar}>
                          {admin.avatar_url ? (
                            <img src={admin.avatar_url} alt={fullName} />
                          ) : (
                            <span>{initials}</span>
                          )}
                        </div>
                        <div>
                          <div className={styles.adminName}>{fullName}</div>
                          <div className={styles.adminEmail}>
                            {admin.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {admin.bio_title ? (
                        <span className={styles.roleChip}>
                          {admin.bio_title}
                        </span>
                      ) : (
                        <span className={styles.muted}>—</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[`status-${admin.account_status}`]
                        }`}
                      >
                        {formatUserStatus(admin.account_status)}
                      </span>
                    </td>
                    <td>
                      <span className={styles.dateText}>
                        {formatDate(admin.created_at)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.rowActionBtn}
                          onClick={() => setResetConfirmId(admin.id)}
                          disabled={isActionLoading}
                          title="Send password reset email"
                        >
                          🔑 Reset Password
                        </button>
                        <button
                          type="button"
                          className={`${styles.rowActionBtn} ${
                            admin.account_status === 'active'
                              ? styles.rowActionDanger
                              : ''
                          }`}
                          onClick={() => handleToggleStatus(admin)}
                          disabled={isActionLoading}
                        >
                          {admin.account_status === 'active'
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

      {/* Reset password confirmation */}
      {resetConfirmId &&
        (() => {
          const admin = admins.find((a) => a.id === resetConfirmId);
          if (!admin) return null;

          return (
            <div
              className={styles.modalOverlay}
              onClick={() => setResetConfirmId(null)}
            >
              <div
                className={styles.modal}
                onClick={(ev) => ev.stopPropagation()}
              >
                <h3 className={styles.modalTitle}>Send password reset?</h3>
                <p className={styles.modalText}>
                  An email with a password reset link will be sent to{' '}
                  <strong>{admin.email}</strong>. The link expires in 1 hour.
                </p>
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.modalCancel}
                    onClick={() => setResetConfirmId(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={styles.modalConfirm}
                    onClick={() => handleSendReset(admin)}
                  >
                    Send Reset Email
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

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
  accent: 'blue' | 'green' | 'red';
}

const StatPill: React.FC<StatPillProps> = ({ label, value, accent }) => (
  <div className={`${styles.statPill} ${styles[`stat-${accent}`]}`}>
    <span className={styles.statValue}>{value}</span>
    <span className={styles.statLabel}>{label}</span>
  </div>
);

const EmptyState: React.FC<{ hasAdmins: boolean }> = ({ hasAdmins }) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>🛡️</div>
    <h3 className={styles.emptyTitle}>
      {hasAdmins ? 'No admins match your filters' : 'No admins yet'}
    </h3>
    <p className={styles.emptyText}>
      {hasAdmins
        ? 'Try adjusting your search or filters.'
        : 'Create your first admin account to add a teammate to the IQuire admin team.'}
    </p>
    {!hasAdmins && (
      <Link to="/admin/users/admins/new" className={styles.emptyCta}>
        + Create Admin
      </Link>
    )}
  </div>
);