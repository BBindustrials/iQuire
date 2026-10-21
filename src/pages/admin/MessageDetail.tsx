// ============================================================================
// iQuire — Admin: Message Detail (Phase 12D.4)
// ============================================================================

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchMessageById,
  updateMessage,
  markMessageAsReplied,
  archiveMessage,
  restoreMessage,
  deleteMessage,
  type ContactMessage,
} from '../../services/messages.service';
import styles from './MessageDetail.module.css';

// ============================================================================
// Component
// ============================================================================

export const AdminMessageDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [message, setMessage] = useState<ContactMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // --------------------------------------------------------------------------
  // Load
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      const res = await fetchMessageById(id);
      if (!isMounted) return;

      if (!res.success || !res.data) {
        setError(res.error ?? 'Message not found');
        setIsLoading(false);
        return;
      }

      setMessage(res.data);
      setNotes(res.data.admin_notes ?? '');

      // Auto-mark as read if new
      if (res.data.status === 'new') {
        const update = await updateMessage(id, {
          status: 'read',
          read_at: new Date().toISOString(),
        });
        if (isMounted && update.success && update.data) {
          setMessage(update.data);
        }
      }

      setIsLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // --------------------------------------------------------------------------
  // Actions
  // --------------------------------------------------------------------------
  const handleSaveNotes = async () => {
    if (!message) return;
    setIsSaving(true);
    setNotesSaved(false);

    const res = await updateMessage(message.id, {
      admin_notes: notes.trim() || null,
    });

    setIsSaving(false);

    if (!res.success) {
      setError(res.error ?? 'Failed to save notes');
      return;
    }

    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  const handleMarkReplied = async () => {
    if (!message) return;

    const res = await markMessageAsReplied(message.id, profile?.id ?? undefined);
    if (!res.success || !res.data) {
      setError(res.error ?? 'Failed to update');
      return;
    }
    setMessage(res.data);
  };

  const handleArchive = async () => {
    if (!message) return;

    const res = await archiveMessage(message.id);
    if (!res.success || !res.data) {
      setError(res.error ?? 'Failed to archive');
      return;
    }
    setMessage(res.data);
  };

  const handleRestore = async () => {
    if (!message) return;

    const res = await restoreMessage(message.id);
    if (!res.success || !res.data) {
      setError(res.error ?? 'Failed to restore');
      return;
    }
    setMessage(res.data);
  };

  const handleDelete = async () => {
    if (!message) return;

    const res = await deleteMessage(message.id);
    if (!res.success) {
      setError(res.error ?? 'Failed to delete');
      return;
    }
    navigate('/admin/messages');
  };

  // --------------------------------------------------------------------------
  // Render: loading / error
  // --------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading message…</p>
        </div>
      </div>
    );
  }

  if (error || !message) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <p>{error ?? 'Message not found'}</p>
          <Link to="/admin/messages" className={styles.backLink}>
            ← Back to Messages
          </Link>
        </div>
      </div>
    );
  }

  const initials = message.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const mailtoHref = `mailto:${message.email}?subject=${encodeURIComponent(
    `Re: ${message.subject}`
  )}`;

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <Link to="/admin/messages" className={styles.breadcrumb}>
            ← Back to Messages
          </Link>
          <h1 className={styles.pageTitle}>{message.subject}</h1>
          <p className={styles.pageSubtitle}>
            Received{' '}
            {new Date(message.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <span
          className={`${styles.statusBadge} ${styles[`status-${message.status}`]}`}
        >
          {message.status}
        </span>
      </div>

      {error && (
        <div className={styles.errorBanner} role="alert">
          {error}
        </div>
      )}

      <div className={styles.layout}>
        {/* Main column */}
        <div className={styles.mainColumn}>
          {/* Sender card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>From</h2>
            <div className={styles.senderRow}>
              <div className={styles.avatar}>{initials}</div>
              <div className={styles.senderInfo}>
                <div className={styles.senderName}>{message.name}</div>
                <a
                  href={`mailto:${message.email}`}
                  className={styles.senderContact}
                >
                  {message.email}
                </a>
                {message.phone && (
                  <a
                    href={`tel:${message.phone}`}
                    className={styles.senderContact}
                  >
                    {message.phone}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Message body */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Message</h2>
            <div className={styles.messageBody}>
              {message.message.split('\n').map((para, i) => (
                <p key={i}>{para || <br />}</p>
              ))}
            </div>
          </div>

          {/* Admin notes */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Admin notes (private)</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Add internal notes about this message…"
              className={styles.notesTextarea}
            />
            <div className={styles.notesFooter}>
              {notesSaved && (
                <span className={styles.savedIndicator}>✓ Saved</span>
              )}
              <button
                type="button"
                className={styles.saveNotesBtn}
                onClick={handleSaveNotes}
                disabled={isSaving}
              >
                {isSaving ? 'Saving…' : 'Save notes'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar — actions */}
        <aside className={styles.sideColumn}>
          <div className={styles.sideCard}>
            <h3 className={styles.sideCardTitle}>Actions</h3>

            <a
              href={mailtoHref}
              className={styles.primaryBtn}
              onClick={handleMarkReplied}
            >
              ✉️ Reply via email
            </a>

            {message.status !== 'replied' && (
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={handleMarkReplied}
              >
                ✓ Mark as replied
              </button>
            )}

            {message.status !== 'archived' ? (
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={handleArchive}
              >
                📥 Archive
              </button>
            ) : (
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={handleRestore}
              >
                ↺ Restore to new
              </button>
            )}

            <button
              type="button"
              className={styles.dangerBtn}
              onClick={() => setShowDeleteModal(true)}
            >
              🗑 Delete message
            </button>
          </div>

          <div className={styles.sideCard}>
            <h3 className={styles.sideCardTitle}>Timeline</h3>
            <div className={styles.timelineItem}>
              <span className={styles.timelineDot} />
              <div>
                <div className={styles.timelineLabel}>Received</div>
                <div className={styles.timelineValue}>
                  {new Date(message.created_at).toLocaleString()}
                </div>
              </div>
            </div>
            {message.read_at && (
              <div className={styles.timelineItem}>
                <span className={styles.timelineDot} />
                <div>
                  <div className={styles.timelineLabel}>Read</div>
                  <div className={styles.timelineValue}>
                    {new Date(message.read_at).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
            {message.replied_at && (
              <div className={styles.timelineItem}>
                <span className={styles.timelineDot} />
                <div>
                  <div className={styles.timelineLabel}>Replied</div>
                  <div className={styles.timelineValue}>
                    {new Date(message.replied_at).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowDeleteModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Delete this message?</h3>
            <p className={styles.modalText}>
              This will permanently remove the message from{' '}
              <strong>{message.name}</strong>. This cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalConfirm}
                onClick={handleDelete}
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