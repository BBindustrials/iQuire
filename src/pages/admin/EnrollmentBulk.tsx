// ============================================================================
// iQuire — Admin: Bulk Enroll (Phase 15.5)
// ============================================================================

import React, { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SelectInput } from '../../components/common/SelectInput';
import { FormSection } from '../../components/common/FormSection';
import {
  bulkCreateEnrollments,
  getInitials,
  type EnrollmentStatus,
} from '../../services/enrollments.service';
import {
  fetchCoursesForSelect,
  fetchCohortsForCourse,
} from '../../services/students.service';
import {
  searchUsers,
  type UserSearchResult,
} from '../../services/users.service';
import styles from './EnrollmentBulk.module.css';

// ============================================================================
// Types
// ============================================================================

interface FormData {
  course_id: string;
  cohort_id: string;
  status: EnrollmentStatus;
  completed_at: string;
  notes: string;
}

const initialFormData: FormData = {
  course_id: '',
  cohort_id: '',
  status: 'active',
  completed_at: '',
  notes: '',
};

interface SubmitResult {
  enrolled: number;
  skipped: number;
  errors: number;
}

// ============================================================================
// Component
// ============================================================================

export const AdminEnrollmentBulk: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);

  // Course + cohort data
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [cohorts, setCohorts] = useState<{ id: string; name: string }[]>([]);

  // Students list
  const [students, setStudents] = useState<UserSearchResult[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [studentSearch, setStudentSearch] = useState('');

  // Selected student IDs
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // --------------------------------------------------------------------------
  // Load courses + initial student list
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const [coursesRes, studentsRes] = await Promise.all([
        fetchCoursesForSelect(),
        searchUsers('', 100),
      ]);

      if (!isMounted) return;

      if (coursesRes.success && coursesRes.data) setCourses(coursesRes.data);

      if (studentsRes.success && studentsRes.data) {
        // Only students/alumni
        const onlyMembers = studentsRes.data.filter(
          (u) => u.account_type === 'member'
        );
        setStudents(onlyMembers);
      }

      setIsLoadingStudents(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // --------------------------------------------------------------------------
  // Load cohorts when course changes
  // --------------------------------------------------------------------------
  useEffect(() => {
    // If no course selected, use the async callback to clear (satisfies lint)
    if (!formData.course_id) {
      Promise.resolve().then(() => setCohorts([]));
      return;
    }
  
    let isMounted = true;
    (async () => {
      const res = await fetchCohortsForCourse(formData.course_id, {
        includeAll: true,
      });
      if (isMounted && res.success && res.data) setCohorts(res.data);
    })();
    return () => {
      isMounted = false;
    };
  }, [formData.course_id]);

  // --------------------------------------------------------------------------
  // Filter students by search
  // --------------------------------------------------------------------------
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students;
    const q = studentSearch.toLowerCase().trim();
    return students.filter(
      (s) =>
        s.first_name.toLowerCase().includes(q) ||
        s.last_name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.iq_id?.toLowerCase().includes(q) ||
        s.participant_id?.toLowerCase().includes(q)
    );
  }, [students, studentSearch]);

  // --------------------------------------------------------------------------
  // Selection helpers
  // --------------------------------------------------------------------------
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    const visibleIds = filteredStudents.map((s) => s.id);
    const allVisibleSelected = visibleIds.every((id) => selectedIds.has(id));

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const allVisibleSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => selectedIds.has(s.id));
  const someVisibleSelected =
    filteredStudents.some((s) => selectedIds.has(s.id)) && !allVisibleSelected;

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'course_id' ? { cohort_id: '' } : {}),
      ...(name === 'status' && value !== 'completed'
        ? { completed_at: '' }
        : {}),
      ...(name === 'status' &&
      value === 'completed' &&
      !prev.completed_at
        ? { completed_at: new Date().toISOString().slice(0, 10) }
        : {}),
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // --------------------------------------------------------------------------
  // Validation
  // --------------------------------------------------------------------------
  const validate = (): { [k: string]: string } => {
    const e: { [k: string]: string } = {};
    if (!formData.course_id) e.course_id = 'Please select a course';
    if (selectedIds.size === 0)
      e.selected = 'Please select at least one student';
    return e;
  };

  // --------------------------------------------------------------------------
  // Submit
  // --------------------------------------------------------------------------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);
    setError(null);

    const payload = {
      course_id: formData.course_id,
      cohort_id: formData.cohort_id || null,
      status: formData.status,
      completed_at:
        formData.status === 'completed' && formData.completed_at
          ? new Date(formData.completed_at).toISOString()
          : null,
      notes: formData.notes.trim() || null,
    };

    const res = await bulkCreateEnrollments(
      Array.from(selectedIds),
      payload.course_id,
      payload.cohort_id,
      payload.status,
      {
        completed_at: payload.completed_at,
        notes: payload.notes,
      }
    );

    setIsSaving(false);

    if (!res.success || !res.data) {
      setError(res.error ?? 'Bulk enroll failed');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitResult({
      enrolled: res.data.enrolled,
      skipped: res.data.skipped,
      errors: res.data.errors,
    });

    // Remove enrolled students from the local list (so re-submit only
    // affects the remaining ones)
    setStudents((prev) => prev.filter((s) => !selectedIds.has(s.id)));
    clearSelection();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --------------------------------------------------------------------------
  // Render — success screen
  // --------------------------------------------------------------------------
  if (submitResult) {
    return (
      <div className={styles.page}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✓</div>
          <h1 className={styles.successTitle}>Bulk enroll complete</h1>

          <div className={styles.successStats}>
            <div className={styles.successStat}>
              <strong>{submitResult.enrolled}</strong>
              <span>Enrolled</span>
            </div>
            <div className={styles.successStat}>
              <strong>{submitResult.skipped}</strong>
              <span>Skipped (already enrolled)</span>
            </div>
            {submitResult.errors > 0 && (
              <div className={styles.successStat}>
                <strong>{submitResult.errors}</strong>
                <span>Errors</span>
              </div>
            )}
          </div>

          <div className={styles.successActions}>
            <button
              type="button"
              className={styles.successSecondary}
              onClick={() => {
                setSubmitResult(null);
                setFormData(initialFormData);
              }}
            >
              Enroll More Students
            </button>
            <button
              type="button"
              className={styles.successPrimary}
              onClick={() => navigate('/admin/enrollments')}
            >
              View All Enrollments
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Render — form
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <Link to="/admin/enrollments" className={styles.breadcrumb}>
            ← Back to Enrollments
          </Link>
          <h1 className={styles.pageTitle}>Bulk Enroll</h1>
          <p className={styles.pageSubtitle}>
            Enroll multiple students in the same course + cohort at once.
            Perfect for onboarding a new cohort.
          </p>
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner} role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* ================================================================
            COURSE + COHORT + STATUS
            ================================================================ */}
        <FormSection title="Enrollment Details">
          <div className={styles.twoCol}>
            <SelectInput
              label="Course"
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
              required
              options={[
                { label: '— Select course —', value: '' },
                ...courses.map((c) => ({ label: c.title, value: c.id })),
              ]}
              placeholder="Select a course"
              error={errors.course_id}
            />

            <SelectInput
              label="Cohort"
              name="cohort_id"
              value={formData.cohort_id}
              onChange={handleChange}
              options={[
                { label: '— No specific cohort —', value: '' },
                ...cohorts.map((c) => ({ label: c.name, value: c.id })),
              ]}
              placeholder="Select a cohort (optional)"
              disabled={!formData.course_id || cohorts.length === 0}
            />
          </div>

          <div className={styles.twoCol}>
            <SelectInput
              label="Initial status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { label: 'Applied — awaiting acceptance', value: 'applied' },
                { label: 'Active — currently in progress', value: 'active' },
                {
                  label: 'Completed — finished (grants alumni role)',
                  value: 'completed',
                },
              ]}
            />

            {formData.status === 'completed' && (
              <div className={styles.fieldWrapper}>
                <label className={styles.fieldLabel}>
                  Completion date
                </label>
                <input
                  type="date"
                  name="completed_at"
                  value={formData.completed_at}
                  onChange={handleChange}
                  className={styles.dateInput}
                  max={new Date().toISOString().slice(0, 10)}
                />
                <span className={styles.helperText}>
                  Applies to all enrolled students. Use a historical date for
                  legacy alumni batches.
                </span>
              </div>
            )}
          </div>

          <div className={styles.fieldWrapper}>
            <label className={styles.fieldLabel}>
              Notes (optional, applies to all)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className={styles.textarea}
              rows={2}
              placeholder="e.g., 'Cohort 6 onboarding batch, May 2026'"
            />
          </div>
        </FormSection>

        {/* ================================================================
            STUDENTS — MULTI-SELECT
            ================================================================ */}
        <FormSection title="Students">
          <div className={styles.studentControls}>
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
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.selectionActions}>
              <span className={styles.selectionCount}>
                <strong>{selectedIds.size}</strong> selected
              </span>
              <button
                type="button"
                className={styles.selectAllBtn}
                onClick={toggleSelectAllVisible}
              >
                {allVisibleSelected ? 'Deselect all' : 'Select all visible'}
              </button>
              {selectedIds.size > 0 && (
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={clearSelection}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {errors.selected && (
            <div className={styles.fieldError}>{errors.selected}</div>
          )}

          {isLoadingStudents ? (
            <div className={styles.skeletonList}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className={styles.skeletonRow} />
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <h3 className={styles.emptyTitle}>
                {studentSearch
                  ? 'No students match your search'
                  : 'No students available'}
              </h3>
              <p className={styles.emptyText}>
                {studentSearch
                  ? 'Try a different name, email, or IQ ID.'
                  : 'All students may already be enrolled, or none exist yet.'}
              </p>
            </div>
          ) : (
            <div className={styles.studentList}>
              {/* Select-all header */}
              <div className={styles.studentListHeader}>
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someVisibleSelected;
                  }}
                  onChange={toggleSelectAllVisible}
                  className={styles.checkbox}
                  aria-label="Select all visible"
                />
                <span>
                  {filteredStudents.length}{' '}
                  {filteredStudents.length === 1 ? 'student' : 'students'}
                </span>
              </div>

              {filteredStudents.map((s) => {
                const fullName = `${s.first_name} ${s.last_name}`.trim();
                const initials = getInitials(fullName);
                const isSelected = selectedIds.has(s.id);

                return (
                  <label
                    key={s.id}
                    className={`${styles.studentRow} ${
                      isSelected ? styles.studentRowSelected : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(s.id)}
                      className={styles.checkbox}
                    />
                    <div className={styles.studentAvatar}>
                      {s.avatar_url ? (
                        <img src={s.avatar_url} alt={fullName} />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <div className={styles.studentInfo}>
                      <div className={styles.studentNameRow}>
                        <span className={styles.studentName}>
                          {fullName}
                        </span>
                        {s.iq_id && (
                          <span className={styles.iqIdChip}>{s.iq_id}</span>
                        )}
                      </div>
                      <span className={styles.studentEmail}>{s.email}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </FormSection>

        {/* ================================================================
            ACTIONS
            ================================================================ */}
        <div className={styles.actions}>
          <Link to="/admin/enrollments" className={styles.cancelBtn}>
            Cancel
          </Link>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSaving || selectedIds.size === 0}
          >
            {isSaving
              ? 'Enrolling…'
              : `Enroll ${selectedIds.size} Student${
                  selectedIds.size === 1 ? '' : 's'
                }`}
          </button>
        </div>
      </form>
    </div>
  );
};