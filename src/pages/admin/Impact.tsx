// ============================================================================
// iQuire — Admin: Impact Metrics Manager (Phase 14.3)
// ============================================================================

import React, { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  fetchAllImpactMetrics,
  createImpactMetric,
  updateImpactMetric,
  deleteImpactMetric,
  reorderImpactMetrics,
  toggleImpactMetricPublished,
  type ImpactMetric,
} from '../../services/impact.service';
import {
  IMPACT_ACCENT_OPTIONS,
  type ImpactAccent,
} from '../../types/content.types';
import styles from './Impact.module.css';

// ============================================================================
// Form types
// ============================================================================

interface FormData {
  emoji: string;
  value: string;
  label: string;
  description: string;
  accent: ImpactAccent;
  published: boolean;
}

const emptyForm: FormData = {
  emoji: '🎯',
  value: '',
  label: '',
  description: '',
  accent: 'blue',
  published: true,
};

interface FormErrors {
  [key: string]: string;
}

// ============================================================================
// Component
// ============================================================================

export const AdminImpact: React.FC = () => {
  const [metrics, setMetrics] = useState<ImpactMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Delete confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // Load
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      const res = await fetchAllImpactMetrics();
      if (!isMounted) return;

      if (!res.success) {
        setError(res.error ?? 'Failed to load impact metrics');
        setIsLoading(false);
        return;
      }

      setMetrics(res.data ?? []);
      setIsLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // --------------------------------------------------------------------------
  // Stats
  // --------------------------------------------------------------------------
  const stats = useMemo(
    () => ({
      total: metrics.length,
      published: metrics.filter((m) => m.published).length,
      hidden: metrics.filter((m) => !m.published).length,
    }),
    [metrics]
  );

  // --------------------------------------------------------------------------
  // Modal handlers
  // --------------------------------------------------------------------------
  const openCreateModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (metric: ImpactMetric) => {
    setEditingId(metric.id);
    setFormData({
      emoji: metric.emoji,
      value: metric.value,
      label: metric.label,
      description: metric.description ?? '',
      accent: metric.accent,
      published: metric.published,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
    setFormErrors({});
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!formData.emoji.trim()) e.emoji = 'Emoji is required';
    if (!formData.value.trim()) e.value = 'Value is required';
    if (!formData.label.trim()) e.label = 'Label is required';
    return e;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) {
      setFormErrors(v);
      return;
    }

    setActionLoading(true);

    const payload = {
      emoji: formData.emoji.trim(),
      value: formData.value.trim(),
      label: formData.label.trim(),
      description: formData.description.trim() || null,
      accent: formData.accent,
      published: formData.published,
    };

    const res = editingId
      ? await updateImpactMetric(editingId, payload)
      : await createImpactMetric(payload);

    setActionLoading(false);

    if (!res.success || !res.data) {
      setFormErrors({ submit: res.error ?? 'Save failed' });
      return;
    }

    if (editingId) {
      setMetrics((prev) =>
        prev.map((m) => (m.id === editingId ? res.data! : m))
      );
    } else {
      setMetrics((prev) => [...prev, res.data!]);
    }

    closeModal();
  };

  // --------------------------------------------------------------------------
  // Delete
  // --------------------------------------------------------------------------
  const handleDelete = async (id: string) => {
    setActionLoading(true);
    const res = await deleteImpactMetric(id);
    setActionLoading(false);

    if (!res.success) {
      setError(res.error ?? 'Failed to delete');
      setDeleteConfirmId(null);
      return;
    }

    setMetrics((prev) => prev.filter((m) => m.id !== id));
    setDeleteConfirmId(null);
  };

  // --------------------------------------------------------------------------
  // Toggle published
  // --------------------------------------------------------------------------
  const handleTogglePublished = async (metric: ImpactMetric) => {
    const next = !metric.published;

    setMetrics((prev) =>
      prev.map((m) => (m.id === metric.id ? { ...m, published: next } : m))
    );

    const res = await toggleImpactMetricPublished(metric.id, next);
    if (!res.success) {
      setMetrics((prev) =>
        prev.map((m) =>
          m.id === metric.id ? { ...m, published: metric.published } : m
        )
      );
      setError(res.error ?? 'Failed to toggle visibility');
    }
  };

  // --------------------------------------------------------------------------
  // Reorder
  // --------------------------------------------------------------------------
  const moveMetric = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= metrics.length) return;

    const next = [...metrics];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    // Reset display_order locally so it's consistent
    const withOrder = next.map((m, i) => ({ ...m, display_order: i + 1 }));
    setMetrics(withOrder);

    const res = await reorderImpactMetrics(withOrder.map((m) => m.id));
    if (!res.success) {
      setError(res.error ?? 'Failed to save new order');
      // Reload from server to reset
      const reload = await fetchAllImpactMetrics();
      if (reload.success && reload.data) setMetrics(reload.data);
    }
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Impact Metrics</h1>
          <p className={styles.pageSubtitle}>
            The numbers that tell your story — shown on the homepage and about
            page. Add, reorder, or hide any metric.
          </p>
        </div>
        <button
          type="button"
          className={styles.addButton}
          onClick={openCreateModal}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Add Metric
        </button>
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
        <StatPill label="Visible" value={stats.published} accent="green" />
        <StatPill label="Hidden" value={stats.hidden} accent="gray" />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className={styles.skeletonList}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={styles.skeletonRow} />
          ))}
        </div>
      ) : metrics.length === 0 ? (
        <EmptyState onAdd={openCreateModal} />
      ) : (
        <div className={styles.metricsList}>
          {metrics.map((metric, index) => (
            <div
              key={metric.id}
              className={`${styles.metricRow} ${
                !metric.published ? styles.metricHidden : ''
              }`}
            >
              {/* Reorder controls */}
              <div className={styles.reorderControls}>
                <button
                  type="button"
                  className={styles.reorderBtn}
                  onClick={() => moveMetric(index, -1)}
                  disabled={index === 0}
                  aria-label="Move up"
                >
                  ▲
                </button>
                <button
                  type="button"
                  className={styles.reorderBtn}
                  onClick={() => moveMetric(index, 1)}
                  disabled={index === metrics.length - 1}
                  aria-label="Move down"
                >
                  ▼
                </button>
              </div>

              {/* Preview */}
              <div
                className={`${styles.previewBox} ${
                  styles[`accent-${metric.accent}`]
                }`}
              >
                <div className={styles.previewEmoji}>{metric.emoji}</div>
                <div className={styles.previewValue}>{metric.value}</div>
                <div className={styles.previewLabel}>{metric.label}</div>
                {metric.description && (
                  <div className={styles.previewDesc}>{metric.description}</div>
                )}
              </div>

              {/* Meta */}
              <div className={styles.metaColumn}>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Accent</span>
                  <span
                    className={`${styles.accentChip} ${
                      styles[`accent-${metric.accent}`]
                    }`}
                  >
                    {metric.accent}
                  </span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Order</span>
                  <span className={styles.metaValue}>#{metric.display_order}</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Status</span>
                  <span
                    className={`${styles.statusBadge} ${
                      metric.published ? styles.statusVisible : styles.statusHidden
                    }`}
                  >
                    {metric.published ? 'Visible' : 'Hidden'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className={styles.rowActions}>
                <button
                  type="button"
                  className={styles.rowActionBtn}
                  onClick={() => openEditModal(metric)}
                >
                  ✏️ Edit
                </button>
                <button
                  type="button"
                  className={styles.rowActionBtn}
                  onClick={() => handleTogglePublished(metric)}
                >
                  {metric.published ? '🙈 Hide' : '👁 Show'}
                </button>
                <button
                  type="button"
                  className={`${styles.rowActionBtn} ${styles.rowActionDanger}`}
                  onClick={() => setDeleteConfirmId(metric.id)}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.modalTitle}>
              {editingId ? 'Edit Impact Metric' : 'Add Impact Metric'}
            </h3>

            {formErrors.submit && (
              <div className={styles.modalError}>{formErrors.submit}</div>
            )}

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.modalTwoCol}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>
                    Emoji <span className={styles.requiredMark}>*</span>
                  </label>
                  <input
                    type="text"
                    name="emoji"
                    value={formData.emoji}
                    onChange={handleChange}
                    className={`${styles.modalInput} ${
                      formErrors.emoji ? styles.modalInputError : ''
                    }`}
                    placeholder="🎓"
                    maxLength={4}
                  />
                  {formErrors.emoji && (
                    <span className={styles.modalErrorText}>
                      {formErrors.emoji}
                    </span>
                  )}
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>
                    Value <span className={styles.requiredMark}>*</span>
                  </label>
                  <input
                    type="text"
                    name="value"
                    value={formData.value}
                    onChange={handleChange}
                    className={`${styles.modalInput} ${
                      formErrors.value ? styles.modalInputError : ''
                    }`}
                    placeholder="1,000+ or 70%"
                  />
                  {formErrors.value && (
                    <span className={styles.modalErrorText}>
                      {formErrors.value}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.modalField}>
                <label className={styles.modalLabel}>
                  Label <span className={styles.requiredMark}>*</span>
                </label>
                <input
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  className={`${styles.modalInput} ${
                    formErrors.label ? styles.modalInputError : ''
                  }`}
                  placeholder="Young people trained"
                />
                {formErrors.label && (
                  <span className={styles.modalErrorText}>
                    {formErrors.label}
                  </span>
                )}
              </div>

              <div className={styles.modalField}>
                <label className={styles.modalLabel}>
                  Description <span className={styles.optionalMark}>(optional)</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={styles.modalTextarea}
                  rows={3}
                  placeholder="Across work-readiness, tech, AI, and career programs since 2023."
                />
              </div>

              <div className={styles.modalTwoCol}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Accent color</label>
                  <select
                    name="accent"
                    value={formData.accent}
                    onChange={handleChange}
                    className={styles.modalSelect}
                  >
                    {IMPACT_ACCENT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Visibility</label>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="published"
                      checked={formData.published}
                      onChange={handleChange}
                      className={styles.checkbox}
                    />
                    <span>Show on public pages</span>
                  </label>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.modalCancel}
                  onClick={closeModal}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.modalConfirm}
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? 'Saving…'
                    : editingId
                    ? 'Save Changes'
                    : 'Add Metric'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirmId && (
        <div
          className={styles.modalOverlay}
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.modalTitle}>Delete this metric?</h3>
            <p className={styles.modalText}>
              This will permanently remove it from the homepage and about page.
              This cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={() => setDeleteConfirmId(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalConfirmDanger}
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting…' : 'Delete'}
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
  accent: 'blue' | 'green' | 'gray';
}

const StatPill: React.FC<StatPillProps> = ({ label, value, accent }) => (
  <div className={`${styles.statPill} ${styles[`stat-${accent}`]}`}>
    <span className={styles.statValue}>{value}</span>
    <span className={styles.statLabel}>{label}</span>
  </div>
);

const EmptyState: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>📊</div>
    <h3 className={styles.emptyTitle}>No impact metrics yet</h3>
    <p className={styles.emptyText}>
      Add your first metric — a number, a label, and an emoji. It will appear
      on the homepage immediately.
    </p>
    <button type="button" className={styles.emptyCta} onClick={onAdd}>
      + Add Your First Metric
    </button>
  </div>
);