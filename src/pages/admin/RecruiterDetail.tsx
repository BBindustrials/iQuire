// ============================================================================
// iQuire — Admin: Recruiter Detail (Phase 12C.3b)
// ============================================================================
// Now sends emails to admin inbox on approve/reject (admin forwards to recruiter).
// ============================================================================

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchRecruiterById,
  verifyRecruiter,
  rejectRecruiter,
  suspendRecruiter,
  resetRecruiterToPending,
  type RecruiterListItem,
} from '../../services/recruiters.service';
import {
  sendRecruiterApprovedEmail,
  sendRecruiterRejectedEmail,
} from '../../services/email.service';
import styles from './RecruiterDetail.module.css';

// ============================================================================
// Component
// ============================================================================

export const AdminRecruiterDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [recruiter, setRecruiter] = useState<RecruiterListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [reason, setReason] = useState('');

  // --------------------------------------------------------------------------
  // Load
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      const res = await fetchRecruiterById(id);
      if (!isMounted) return;

      if (!res.success || !res.data) {
        setError(res.error ?? 'Recruiter not found');
        setIsLoading(false);
        return;
      }

      setRecruiter(res.data);
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
  const handleVerify = async () => {
    if (!recruiter || !profile) return;
    setActionLoading(true);

    const res = await verifyRecruiter(recruiter.id, profile.id);
    setActionLoading(false);

    if (!res.success) {
      setError(res.error ?? 'Failed to verify');
      return;
    }

    // Send approval email (non-blocking)
    sendRecruiterApprovedEmail({
      email: recruiter.email,
      firstName: recruiter.first_name,
      companyName: recruiter.company_name,
    }).catch((err) => console.error('[RecruiterDetail] Approve email failed:', err));

    setShowVerifyModal(false);
    navigate('/admin/recruiters');
  };

  const handleReject = async () => {
    if (!recruiter || !profile) return;
    if (!reason.trim()) {
      setError('Please provide a reason');
      return;
    }
    setActionLoading(true);

    const res = await rejectRecruiter(recruiter.id, profile.id, reason.trim());
    setActionLoading(false);

    if (!res.success) {
      setError(res.error ?? 'Failed to reject');
      return;
    }

    // Send rejection email (non-blocking)
    sendRecruiterRejectedEmail({
      email: recruiter.email,
      firstName: recruiter.first_name,
      companyName: recruiter.company_name,
      reason: reason.trim(),
    }).catch((err) => console.error('[RecruiterDetail] Reject email failed:', err));

    setShowRejectModal(false);
    setReason('');
    navigate('/admin/recruiters');
  };

  const handleSuspend = async () => {
    if (!recruiter || !profile) return;
    setActionLoading(true);

    const res = await suspendRecruiter(recruiter.id, profile.id, reason.trim() || undefined);
    setActionLoading(false);

    if (!res.success) {
      setError(res.error ?? 'Failed to suspend');
      return;
    }

    setShowSuspendModal(false);
    setReason('');
    navigate('/admin/recruiters');
  };

  const handleResetToPending = async () => {
    if (!recruiter) return;
    if (!window.confirm('Reset this recruiter back to pending review?')) return;

    setActionLoading(true);
    const res = await resetRecruiterToPending(recruiter.id);
    setActionLoading(false);

    if (!res.success) {
      setError(res.error ?? 'Failed to reset');
      return;
    }

    navigate('/admin/recruiters');
  };

  // --------------------------------------------------------------------------
  // Render: loading
  // --------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading recruiter…</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Render: error
  // --------------------------------------------------------------------------
  if (!recruiter || error) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <p>{error ?? 'Recruiter not found'}</p>
          <Link to="/admin/recruiters" className={styles.backLink}>
            ← Back to Recruiters
          </Link>
        </div>
      </div>
    );
  }

  const displayName = `${recruiter.first_name} ${recruiter.last_name}`.trim();
  const initials = `${recruiter.first_name[0] ?? ''}${recruiter.last_name[0] ?? ''}`.toUpperCase();

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <Link to="/admin/recruiters" className={styles.breadcrumb}>
            ← Back to Recruiters
          </Link>
          <h1 className={styles.pageTitle}>{recruiter.company_name}</h1>
          <p className={styles.pageSubtitle}>
            Registered by {displayName} · {recruiter.position}
          </p>
        </div>
        <span
          className={`${styles.statusBadge} ${
            styles[`status-${recruiter.verification_status}`]
          }`}
        >
          {recruiter.verification_status}
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
          {/* Contact card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Contact</h2>
            <div className={styles.contactRow}>
              <div className={styles.avatar}>{initials}</div>
              <div>
                <div className={styles.contactName}>{displayName}</div>
                <div className={styles.contactMeta}>{recruiter.position}</div>
              </div>
            </div>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Email</span>
                <a href={`mailto:${recruiter.email}`} className={styles.detailValue}>
                  {recruiter.email}
                </a>
              </div>
              {recruiter.phone && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Phone</span>
                  <a href={`tel:${recruiter.phone}`} className={styles.detailValue}>
                    {recruiter.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Company card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Company</h2>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Name</span>
                <span className={styles.detailValue}>{recruiter.company_name}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Industry</span>
                <span className={styles.detailValue}>{recruiter.industry}</span>
              </div>
              {recruiter.company_size && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Size</span>
                  <span className={styles.detailValue}>{recruiter.company_size}</span>
                </div>
              )}
              {recruiter.company_website && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Website</span>
                  <a
                    href={recruiter.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.detailValueLink}
                  >
                    {recruiter.company_website.replace(/^https?:\/\//, '')} ↗
                  </a>
                </div>
              )}
              {recruiter.company_linkedin_url && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Company LinkedIn</span>
                  <a
                    href={recruiter.company_linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.detailValueLink}
                  >
                    View ↗
                  </a>
                </div>
              )}
              {recruiter.linkedin_url && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Personal LinkedIn</span>
                  <a
                    href={recruiter.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.detailValueLink}
                  >
                    View ↗
                  </a>
                </div>
              )}
            </div>

            {recruiter.company_description && (
              <div className={styles.textBlock}>
                <span className={styles.detailLabel}>About</span>
                <p className={styles.textValue}>{recruiter.company_description}</p>
              </div>
            )}

            {recruiter.hiring_needs && (
              <div className={styles.textBlock}>
                <span className={styles.detailLabel}>Hiring needs</span>
                <p className={styles.textValue}>{recruiter.hiring_needs}</p>
              </div>
            )}
          </div>

          {/* Verification history */}
          {(recruiter.verified_at ||
            recruiter.rejected_at ||
            recruiter.rejection_reason) && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Verification history</h2>
              {recruiter.verified_at && (
                <div className={styles.historyItem}>
                  <span className={styles.historyIconGreen}>✓</span>
                  <span>
                    Verified on{' '}
                    {new Date(recruiter.verified_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
              {recruiter.rejected_at && (
                <div className={styles.historyItem}>
                  <span className={styles.historyIconRed}>×</span>
                  <span>
                    Rejected on{' '}
                    {new Date(recruiter.rejected_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
              {recruiter.rejection_reason && (
                <div className={styles.historyReason}>
                  <strong>Reason:</strong> {recruiter.rejection_reason}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar — actions */}
        <aside className={styles.sideColumn}>
          <div className={styles.sideCard}>
            <h3 className={styles.sideCardTitle}>Actions</h3>

            {recruiter.verification_status === 'pending' && (
              <>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={() => setShowVerifyModal(true)}
                  disabled={actionLoading}
                >
                  ✓ Approve Recruiter
                </button>
                <button
                  type="button"
                  className={styles.dangerBtn}
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                >
                  × Reject
                </button>
              </>
            )}

            {recruiter.verification_status === 'verified' && (
              <>
                <div className={styles.verifiedBadge}>
                  <span className={styles.verifiedIcon}>✓</span>
                  <span>
                    This recruiter is verified and can access the talent pool.
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.dangerBtn}
                  onClick={() => setShowSuspendModal(true)}
                  disabled={actionLoading}
                >
                  ⏸ Suspend Access
                </button>
              </>
            )}

            {recruiter.verification_status === 'rejected' && (
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={handleResetToPending}
                disabled={actionLoading}
              >
                ↩ Reset to Pending
              </button>
            )}

            {recruiter.verification_status === 'suspended' && (
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => setShowVerifyModal(true)}
                disabled={actionLoading}
              >
                ✓ Reinstate
              </button>
            )}
          </div>

          <div className={styles.sideCard}>
            <h3 className={styles.sideCardTitle}>Account Info</h3>
            <div className={styles.sideInfo}>
              <span className={styles.sideInfoLabel}>Profile ID</span>
              <code className={styles.sideInfoCode}>
                {recruiter.profile_id.slice(0, 8)}…
              </code>
            </div>
            <div className={styles.sideInfo}>
              <span className={styles.sideInfoLabel}>Registered</span>
              <span>{new Date(recruiter.created_at).toLocaleDateString()}</span>
            </div>
            <div className={styles.sideInfo}>
              <span className={styles.sideInfoLabel}>Account status</span>
              <span>{recruiter.account_status}</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Verify modal */}
      {showVerifyModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowVerifyModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Approve this recruiter?</h3>
            <p className={styles.modalText}>
              {recruiter.company_name} will get full access to the IQuire talent
              directory. An approval email will be sent to the admin inbox for
              forwarding.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={() => setShowVerifyModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalConfirm}
                onClick={handleVerify}
                disabled={actionLoading}
              >
                {actionLoading ? 'Approving…' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {showRejectModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowRejectModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Reject this recruiter?</h3>
            <p className={styles.modalText}>
              Provide a reason. A rejection email will be sent to the admin
              inbox for forwarding.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="e.g., Unable to verify company information."
              className={styles.modalTextarea}
            />
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalConfirmDanger}
                onClick={handleReject}
                disabled={actionLoading || !reason.trim()}
              >
                {actionLoading ? 'Rejecting…' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend modal */}
      {showSuspendModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowSuspendModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Suspend this recruiter?</h3>
            <p className={styles.modalText}>
              They will lose access to the talent pool until reinstated.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Optional reason…"
              className={styles.modalTextarea}
            />
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={() => setShowSuspendModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalConfirmDanger}
                onClick={handleSuspend}
                disabled={actionLoading}
              >
                {actionLoading ? 'Suspending…' : 'Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};