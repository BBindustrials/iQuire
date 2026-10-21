/* eslint-disable @typescript-eslint/no-unused-vars */
// ============================================================================
// iQuire — Admin: FAQs Manager (Phase 14.4)
// ============================================================================

import React, { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  fetchAllFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  reorderFaqs,
  toggleFaqPublished,
  type Faq,
} from '../../services/faqs.service';
import {
  FAQ_CATEGORIES,
  formatFaqCategory,
} from '../../types/content.types';
import styles from './Faqs.module.css';

// ============================================================================
// Form types
// ============================================================================

interface FormData {
  question: string;
  answer: string;
  category: string;
  published: boolean;
}

const emptyForm: FormData = {
  question: '',
  answer: '',
  category: 'homepage',
  published: true,
};

interface FormErrors {
  [key: string]: string;
}

// ============================================================================
// Component
// ============================================================================

export const AdminFaqs: React.FC = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Category filter — 'all' or specific category
  const [activeCategory, setActiveCategory] = useState<string>('all');

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

      const res = await fetchAllFaqs();
      if (!isMounted) return;

      if (!res.success) {
        setError(res.error ?? 'Failed to load FAQs');
        setIsLoading(false);
        return;
      }

      setFaqs(res.data ?? []);
      setIsLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // --------------------------------------------------------------------------
  // Category counts (for tabs)
  // --------------------------------------------------------------------------
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: faqs.length };
    faqs.forEach((f) => {
      counts[f.category] = (counts[f.category] ?? 0) + 1;
    });
    return counts;
  }, [faqs]);

  // List of categories that actually have FAQs (plus known empty ones)
  const visibleCategories = useMemo(() => {
    const withFaqs = new Set(faqs.map((f) => f.category));
    const known = FAQ_CATEGORIES.map((c) => c.value);
    // Show known categories + any custom category that has FAQs
    const all = new Set([...known, ...Array.from(withFaqs)]);
    return Array.from(all);
  }, [faqs]);

  // --------------------------------------------------------------------------
  // Filtered list
  // --------------------------------------------------------------------------
  const filtered = useMemo(() => {
    let list = [...faqs];

    if (activeCategory !== 'all') {
      list = list.filter((f) => f.category === activeCategory);
    }

    // Sort: by category (alpha), then display_order
    list.sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.display_order - b.display_order;
    });

    return list;
  }, [faqs, activeCategory]);

  // --------------------------------------------------------------------------
  // Stats
  // --------------------------------------------------------------------------
  const stats = useMemo(
    () => ({
      total: faqs.length,
      published: faqs.filter((f) => f.published).length,
      hidden: faqs.filter((f) => !f.published).length,
    }),
    [faqs]
  );

  // --------------------------------------------------------------------------
  // Modal handlers
  // --------------------------------------------------------------------------
  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      ...emptyForm,
      category: activeCategory === 'all' ? 'homepage' : activeCategory,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (faq: Faq) => {
    setEditingId(faq.id);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      published: faq.published,
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
    if (!formData.question.trim()) e.question = 'Question is required';
    if (!formData.answer.trim()) e.answer = 'Answer is required';
    if (!formData.category.trim()) e.category = 'Category is required';
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
      question: formData.question.trim(),
      answer: formData.answer.trim(),
      category: formData.category.trim(),
      published: formData.published,
    };

    const res = editingId
      ? await updateFaq(editingId, payload)
      : await createFaq(payload);

    setActionLoading(false);

    if (!res.success || !res.data) {
      setFormErrors({ submit: res.error ?? 'Save failed' });
      return;
    }

    if (editingId) {
      setFaqs((prev) => prev.map((f) => (f.id === editingId ? res.data! : f)));
    } else {
      setFaqs((prev) => [...prev, res.data!]);
    }

    // If we created a FAQ and we're on "all" or the matching category, the
    // list will show it. If we're on a different category, jump to the right one.
    if (!editingId && activeCategory !== 'all' && activeCategory !== payload.category) {
      setActiveCategory(payload.category);
    }

    closeModal();
  };

  // --------------------------------------------------------------------------
  // Delete
  // --------------------------------------------------------------------------
  const handleDelete = async (id: string) => {
    setActionLoading(true);
    const res = await deleteFaq(id);
    setActionLoading(false);

    if (!res.success) {
      setError(res.error ?? 'Failed to delete');
      setDeleteConfirmId(null);
      return;
    }

    setFaqs((prev) => prev.filter((f) => f.id !== id));
    setDeleteConfirmId(null);
  };

  // --------------------------------------------------------------------------
  // Toggle published
  // --------------------------------------------------------------------------
  const handleTogglePublished = async (faq: Faq) => {
    const next = !faq.published;

    setFaqs((prev) =>
      prev.map((f) => (f.id === faq.id ? { ...f, published: next } : f))
    );

    const res = await toggleFaqPublished(faq.id, next);
    if (!res.success) {
      setFaqs((prev) =>
        prev.map((f) =>
          f.id === faq.id ? { ...f, published: faq.published } : f
        )
      );
      setError(res.error ?? 'Failed to toggle visibility');
    }
  };

  // --------------------------------------------------------------------------
  // Reorder within the current category
  // --------------------------------------------------------------------------
  const moveFaq = async (faq: Faq, direction: -1 | 1) => {
    // Get all FAQs in the same category sorted by display_order
    const categoryFaqs = faqs
      .filter((f) => f.category === faq.category)
      .sort((a, b) => a.display_order - b.display_order);

    const currentIndex = categoryFaqs.findIndex((f) => f.id === faq.id);
    const targetIndex = currentIndex + direction;

    if (targetIndex < 0 || targetIndex >= categoryFaqs.length) return;

    // Swap in the local ordered array
    const reordered = [...categoryFaqs];
    [reordered[currentIndex], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[currentIndex],
    ];

    // Apply new display_order values
    const withOrder = reordered.map((f, i) => ({ ...f, display_order: i + 1 }));

    // Merge back into the master list
    const orderMap = new Map(withOrder.map((f) => [f.id, f.display_order]));
    const mergedList = faqs.map((f) =>
      orderMap.has(f.id) ? { ...f, display_order: orderMap.get(f.id)! } : f
    );
    setFaqs(mergedList);

    // Persist
    const res = await reorderFaqs(withOrder.map((f) => f.id));
    if (!res.success) {
      setError(res.error ?? 'Failed to save new order');
      const reload = await fetchAllFaqs();
      if (reload.success && reload.data) setFaqs(reload.data);
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
          <h1 className={styles.pageTitle}>FAQs</h1>
          <p className={styles.pageSubtitle}>
            Manage FAQs across the public site. Each category feeds a
            different page — homepage, hire-from-us, AI counselor, and more.
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
          New FAQ
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

      {/* Category tabs */}
      <div className={styles.tabsRow}>
        <button
          type="button"
          className={`${styles.tab} ${
            activeCategory === 'all' ? styles.tabActive : ''
          }`}
          onClick={() => setActiveCategory('all')}
        >
          All
          <span className={styles.tabCount}>{categoryCounts.all ?? 0}</span>
        </button>

        {visibleCategories.map((cat) => {
          const count = categoryCounts[cat] ?? 0;
          return (
            <button
              key={cat}
              type="button"
              className={`${styles.tab} ${
                activeCategory === cat ? styles.tabActive : ''
              }`}
              onClick={() => setActiveCategory(cat)}
            >
              {formatFaqCategory(cat)}
              <span className={styles.tabCount}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className={styles.skeletonList}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={styles.skeletonRow} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          activeCategory={activeCategory}
          onCreate={openCreateModal}
        />
      ) : (
        <div className={styles.faqList}>
          {filtered.map((faq, _index) => {
            // Only allow reorder within the same category
            const sameCategoryList = filtered.filter(
              (f) => f.category === faq.category
            );
            const indexInCategory = sameCategoryList.findIndex(
              (f) => f.id === faq.id
            );

            return (
              <div
                key={faq.id}
                className={`${styles.faqCard} ${
                  !faq.published ? styles.faqHidden : ''
                }`}
              >
                {/* Header */}
                <div className={styles.faqHeader}>
                  <div className={styles.faqHeaderLeft}>
                    <span
                      className={`${styles.categoryChip} ${styles[`cat-${faq.category}`]}`}
                    >
                      {formatFaqCategory(faq.category)}
                    </span>
                    <span className={styles.orderBadge}>
                      #{faq.display_order}
                    </span>
                    {!faq.published && (
                      <span className={styles.hiddenBadge}>Hidden</span>
                    )}
                  </div>

                  <div className={styles.reorderControls}>
                    <button
                      type="button"
                      className={styles.reorderBtn}
                      onClick={() => moveFaq(faq, -1)}
                      disabled={indexInCategory === 0}
                      aria-label="Move up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      className={styles.reorderBtn}
                      onClick={() => moveFaq(faq, 1)}
                      disabled={
                        indexInCategory === sameCategoryList.length - 1
                      }
                      aria-label="Move down"
                    >
                      ▼
                    </button>
                  </div>
                </div>

                {/* Question + answer */}
                <h3 className={styles.faqQuestion}>{faq.question}</h3>
                <p className={styles.faqAnswer}>{faq.answer}</p>

                {/* Actions */}
                <div className={styles.faqActions}>
                  <button
                    type="button"
                    className={styles.rowActionBtn}
                    onClick={() => openEditModal(faq)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    className={styles.rowActionBtn}
                    onClick={() => handleTogglePublished(faq)}
                  >
                    {faq.published ? '🙈 Hide' : '👁 Show'}
                  </button>
                  <button
                    type="button"
                    className={`${styles.rowActionBtn} ${styles.rowActionDanger}`}
                    onClick={() => setDeleteConfirmId(faq.id)}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              {editingId ? 'Edit FAQ' : 'New FAQ'}
            </h3>

            {formErrors.submit && (
              <div className={styles.modalError}>{formErrors.submit}</div>
            )}

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>
                  Category <span className={styles.requiredMark}>*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={styles.modalSelect}
                >
                  {FAQ_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <span className={styles.fieldHint}>
                  Which page this FAQ appears on.
                </span>
              </div>

              <div className={styles.modalField}>
                <label className={styles.modalLabel}>
                  Question <span className={styles.requiredMark}>*</span>
                </label>
                <input
                  type="text"
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  className={`${styles.modalInput} ${
                    formErrors.question ? styles.modalInputError : ''
                  }`}
                  placeholder="e.g., Is there a cost to access the talent pool?"
                />
                {formErrors.question && (
                  <span className={styles.modalErrorText}>
                    {formErrors.question}
                  </span>
                )}
              </div>

              <div className={styles.modalField}>
                <label className={styles.modalLabel}>
                  Answer <span className={styles.requiredMark}>*</span>
                </label>
                <textarea
                  name="answer"
                  value={formData.answer}
                  onChange={handleChange}
                  className={`${styles.modalTextarea} ${
                    formErrors.answer ? styles.modalInputError : ''
                  }`}
                  rows={5}
                  placeholder="A clear, helpful answer — 2–4 sentences is ideal."
                />
                {formErrors.answer && (
                  <span className={styles.modalErrorText}>
                    {formErrors.answer}
                  </span>
                )}
              </div>

              <div className={styles.modalField}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="published"
                    checked={formData.published}
                    onChange={handleChange}
                    className={styles.checkbox}
                  />
                  <span>Publish on the public site</span>
                </label>
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
                    : 'Create FAQ'}
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
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Delete this FAQ?</h3>
            <p className={styles.modalText}>
              This will permanently remove the FAQ. This cannot be undone.
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

interface EmptyStateProps {
  activeCategory: string;
  onCreate: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  activeCategory,
  onCreate,
}) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>💬</div>
    <h3 className={styles.emptyTitle}>
      {activeCategory === 'all'
        ? 'No FAQs yet'
        : `No FAQs in ${formatFaqCategory(activeCategory)}`}
    </h3>
    <p className={styles.emptyText}>
      {activeCategory === 'all'
        ? 'Add your first FAQ — it will appear on the matching public page.'
        : 'Add a FAQ for this category, or switch to another category.'}
    </p>
    <button type="button" className={styles.emptyCta} onClick={onCreate}>
      + New FAQ
    </button>
  </div>
);