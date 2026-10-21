/* eslint-disable react-hooks/purity */
// ============================================================================
// iQuire — Admin: Messages List (Phase 12D.4)
// ============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchAllMessages,
  markMessageAsRead,
  archiveMessage,
  deleteMessage,
  type ContactMessage,
  type ContactMessageStatus,
} from '../../services/messages.service';
import styles from './Messages.module.css';

// ============================================================================
// Component
// ============================================================================

export const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ContactMessageStatus>(
    'all'
  );

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // Load
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      const res = await fetchAllMessages();
      if (!isMounted) return;

      if (!res.success) {
        setError(res.error ?? 'Failed to load messages');
        setIsLoading(false);
        return;
      }

      setMessages(res.data ?? []);
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
    let list = [...messages];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.message.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter((m) => m.status === statusFilter);
    }

    return list;
  }, [messages, search, statusFilter]);

  // --------------------------------------------------------------------------
  // Actions
  // --------------------------------------------------------------------------
  const handleMarkRead = async (message: ContactMessage) => {
    if (message.status !== 'new') return;

    setMessages((prev) =>
      prev.map((m) => (m.id === message.id ? { ...m, status: 'read' } : m))
    );

    const res = await markMessageAsRead(message.id);
    if (!res.success) {
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, status: message.status } : m))
      );
      setError(res.error ?? 'Failed to mark as read');
    }
  };

  const handleArchive = async (message: ContactMessage) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === message.id ? { ...m, status: 'archived' } : m))
    );

    const res = await archiveMessage(message.id);
    if (!res.success) {
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, status: message.status } : m))
      );
      setError(res.error ?? 'Failed to archive');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteMessage(id);
    if (!res.success) {
      setError(res.error ?? 'Failed to delete');
      setDeleteConfirmId(null);
      return;
    }
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setDeleteConfirmId(null);
  };

  // --------------------------------------------------------------------------
  // Stats
  // --------------------------------------------------------------------------
  const stats = useMemo(
    () => ({
      total: messages.length,
      unread: messages.filter((m) => m.status === 'new').length,
      read: messages.filter((m) => m.status === 'read').length,
      replied: messages.filter((m) => m.status === 'replied').length,
    }),
    [messages]
  );

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatRelative = (iso: string) => {
    const d = new Date(iso).getTime();
    const now = Date.now();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(iso);
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Messages</h1>
          <p className={styles.pageSubtitle}>
            Contact form submissions from the public site.
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
        <StatPill label="Unread" value={stats.unread} accent="gold" />
        <StatPill label="Read" value={stats.read} accent="green" />
        <StatPill label="Replied" value={stats.replied} accent="purple" />
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
            placeholder="Search by name, email, subject…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as 'all' | ContactMessageStatus)
          }
        >
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="archived">Archived</option>
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
        <EmptyState hasMessages={messages.length > 0} />
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>From</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Status</th>
                <th>Received</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr
                  key={m.id}
                  className={m.status === 'new' ? styles.rowUnread : ''}
                >
                  <td>
                    <div className={styles.fromCell}>
                      <div className={styles.avatar}>
                        {m.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className={styles.fromName}>{m.name}</div>
                        <a
                          href={`mailto:${m.email}`}
                          className={styles.fromEmail}
                        >
                          {m.email}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.subjectText}>{m.subject}</span>
                  </td>
                  <td>
                    <span className={styles.previewText}>
                      {m.message.length > 80
                        ? `${m.message.slice(0, 80)}…`
                        : m.message}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[`status-${m.status}`]
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td>
                    <span className={styles.dateText} title={formatDate(m.created_at)}>
                      {formatRelative(m.created_at)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <Link
                        to={`/admin/messages/${m.id}`}
                        className={styles.rowActionBtn}
                        onClick={() => handleMarkRead(m)}
                        title="View message"
                      >
                        {m.status === 'new' ? '📩 Open' : '👁 View'}
                      </Link>
                      {m.status !== 'archived' && (
                        <button
                          type="button"
                          className={styles.rowActionBtn}
                          onClick={() => handleArchive(m)}
                          title="Archive"
                        >
                          📥 Archive
                        </button>
                      )}
                      <button
                        type="button"
                        className={`${styles.rowActionBtn} ${styles.rowActionDanger}`}
                        onClick={() => setDeleteConfirmId(m.id)}
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
            <h3 className={styles.modalTitle}>Delete this message?</h3>
            <p className={styles.modalText}>
              This will permanently remove the message. This cannot be undone.
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
  accent: 'blue' | 'green' | 'gold' | 'purple';
}

const StatPill: React.FC<StatPillProps> = ({ label, value, accent }) => (
  <div className={`${styles.statPill} ${styles[`stat-${accent}`]}`}>
    <span className={styles.statValue}>{value}</span>
    <span className={styles.statLabel}>{label}</span>
  </div>
);

const EmptyState: React.FC<{ hasMessages: boolean }> = ({ hasMessages }) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>📭</div>
    <h3 className={styles.emptyTitle}>
      {hasMessages ? 'No messages match your filters' : 'No messages yet'}
    </h3>
    <p className={styles.emptyText}>
      {hasMessages
        ? 'Try adjusting your search or filters.'
        : 'Messages from the public contact form will appear here.'}
    </p>
  </div>
);