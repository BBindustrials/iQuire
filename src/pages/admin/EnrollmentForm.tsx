/* eslint-disable react-hooks/set-state-in-effect */
// ============================================================================
// iQuire — Admin: Create Enrollment (Phase 15.7)
// ============================================================================
// Enroll an existing student in a course + cohort. Supports historical
// completions (for legacy alumni registration).
// Supports ?student_id=<id> query param for deep-linking from the
// student detail page (Enroll in Another Course button).
// ============================================================================

import React, { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { SelectInput } from '../../components/common/SelectInput';
import { FormSection } from '../../components/common/FormSection';
import { StudentPicker } from '../../components/common/StudentPicker';
import {
  createEnrollment,
  checkDuplicateEnrollment,
  applyStatusTimestamps,
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
import styles from './EnrollmentForm.module.css';

// ============================================================================
// Types
// ============================================================================

interface FormData {
  user_id: string;
  course_id: string;
  cohort_id: string;
  status: EnrollmentStatus;
  completed_at: string; // yyyy-mm-dd (empty when not completed)
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

const initialFormData: FormData = {
  user_id: '',
  course_id: '',
  cohort_id: '',
  status: 'active',
  completed_at: '',
  notes: '',
};

// ============================================================================
// Component
// ============================================================================

export const AdminEnrollmentForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetStudentId = searchParams.get('student_id');

  const [formData, setFormData] = useState<FormData>({
    ...initialFormData,
    user_id: presetStudentId ?? '',
  });
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Course / cohort selectors
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [cohorts, setCohorts] = useState<{ id: string; name: string }[]>([]);

  // Duplicate check
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // Resolve preset student from query param (?student_id=...)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!presetStudentId) return;

    let isMounted = true;

    (async () => {
      // Fetch a decent sample and find the matching user
      const res = await searchUsers('', 100);
      if (!isMounted) return;

      if (res.success && res.data) {
        const match = res.data.find((u) => u.id === presetStudentId);
        if (match) {
          setSelectedUser(match);
          // Ensure form's user_id is set (in case presetStudentId was
          // passed but something else reset it)
          setFormData((prev) => ({ ...prev, user_id: match.id }));
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [presetStudentId]);

  // --------------------------------------------------------------------------
  // Load courses
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const res = await fetchCoursesForSelect();
      if (isMounted && res.success && res.data) setCourses(res.data);
    })();
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
  // Duplicate check when user + course + cohort all set
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!formData.user_id || !formData.course_id) {
      setDuplicateWarning(null);
      return;
    }

    let isMounted = true;
    (async () => {
      const res = await checkDuplicateEnrollment(
        formData.user_id,
        formData.course_id,
        formData.cohort_id || null
      );
      if (!isMounted) return;

      if (res.exists) {
        setDuplicateWarning(
          `This student is already enrolled in this course${
            formData.cohort_id ? ' + cohort' : ''
          } with status "${res.status}". You can still create another enrollment if needed.`
        );
      } else {
        setDuplicateWarning(null);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [formData.user_id, formData.course_id, formData.cohort_id]);

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset cohort when course changes
      ...(name === 'course_id' ? { cohort_id: '' } : {}),
      // Clear completed_at when status changes away from completed
      ...(name === 'status' && value !== 'completed'
        ? { completed_at: '' }
        : {}),
      // Default completed_at to today when switching to completed
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

  const handleUserChange = (user: UserSearchResult | null) => {
    setSelectedUser(user);
    setFormData((prev) => ({ ...prev, user_id: user?.id ?? '' }));
    if (errors.user_id) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.user_id;
        return next;
      });
    }
  };

  // --------------------------------------------------------------------------
  // Validation
  // --------------------------------------------------------------------------
  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!formData.user_id) e.user_id = 'Please select a student';
    if (!formData.course_id) e.course_id = 'Please select a course';
    return e;
  };

  // --------------------------------------------------------------------------
  // Preview of auto-timestamps
  // --------------------------------------------------------------------------
  const autoTimestamps = useMemo(
    () => applyStatusTimestamps(formData.status),
    [formData.status]
  );

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
      user_id: formData.user_id,
      course_id: formData.course_id,
      cohort_id: formData.cohort_id || null,
      status: formData.status,
      notes: formData.notes.trim() || null,
      completed_at:
        formData.status === 'completed' && formData.completed_at
          ? new Date(formData.completed_at).toISOString()
          : undefined,
    };

    const res = await createEnrollment(payload);

    setIsSaving(false);

    if (!res.success) {
      setError(res.error ?? 'Failed to create enrollment');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // If we came from a student detail page, return there so the admin
    // immediately sees the new enrollment in the panel.
    if (presetStudentId) {
      navigate(`/admin/students/${presetStudentId}`);
    } else {
      navigate('/admin/enrollments');
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
          <Link
            to={presetStudentId ? `/admin/students/${presetStudentId}` : '/admin/enrollments'}
            className={styles.breadcrumb}
          >
            {presetStudentId ? '← Back to Student' : '← Back to Enrollments'}
          </Link>
          <h1 className={styles.pageTitle}>Enroll Student</h1>
          <p className={styles.pageSubtitle}>
            Add a student to a course. Use this to enrol existing students in
            additional courses, or register legacy alumni with completed
            courses.
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
            STUDENT
            ================================================================ */}
        <FormSection title="Student">
          <div className={styles.fieldWrapper}>
            <label className={styles.fieldLabel}>
              Select student <span className={styles.requiredMark}>*</span>
            </label>
            <StudentPicker
              selectedUserId={formData.user_id || null}
              onChange={handleUserChange}
              disabled={isSaving || Boolean(presetStudentId)}
            />
            {errors.user_id && (
              <span className={styles.errorText}>{errors.user_id}</span>
            )}
            {presetStudentId && !errors.user_id && (
              <span className={styles.helperText}>
                This student was pre-selected from their profile page.
              </span>
            )}
            {!presetStudentId && !selectedUser && !errors.user_id && (
              <span className={styles.helperText}>
                Start typing a name, email, or IQuire ID to search.
              </span>
            )}
          </div>
        </FormSection>

        {/* ================================================================
            COURSE + COHORT
            ================================================================ */}
        <FormSection title="Course">
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
              helperText={
                formData.course_id && cohorts.length === 0
                  ? 'No cohorts available for this course yet.'
                  : undefined
              }
            />
          </div>
        </FormSection>

        {/* ================================================================
            STATUS + COMPLETED DATE
            ================================================================ */}
        <FormSection title="Status">
          <SelectInput
            label="Enrollment status"
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
              { label: 'Dropped — left the programme', value: 'dropped' },
            ]}
          />

          {formData.status === 'completed' && (
            <div className={styles.fieldWrapper}>
              <label className={styles.fieldLabel}>
                Completion date
                <span className={styles.optionalMark}>
                  {' '}
                  (editable for legacy alumni)
                </span>
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
                Defaults to today. Set a historical date when registering
                alumni who graduated earlier.
              </span>
            </div>
          )}

          {Object.keys(autoTimestamps).length > 0 && (
            <div className={styles.previewBox}>
              <span className={styles.previewLabel}>Auto-set on save:</span>
              {autoTimestamps.applied_at && (
                <span className={styles.previewChip}>Applied: now</span>
              )}
              {autoTimestamps.started_at && (
                <span className={styles.previewChip}>Started: now</span>
              )}
              {autoTimestamps.completed_at && !formData.completed_at && (
                <span className={styles.previewChip}>Completed: now</span>
              )}
              {autoTimestamps.dropped_at && (
                <span className={styles.previewChip}>Dropped: now</span>
              )}
            </div>
          )}
        </FormSection>

        {/* ================================================================
            NOTES
            ================================================================ */}
        <FormSection title="Notes (optional)">
          <div className={styles.fieldWrapper}>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className={styles.textarea}
              rows={3}
              placeholder="Internal admin notes about this enrollment…"
              maxLength={500}
            />
            <span className={styles.helperText}>
              {formData.notes.length}/500 characters
            </span>
          </div>
        </FormSection>

        {/* ================================================================
            DUPLICATE WARNING
            ================================================================ */}
        {duplicateWarning && (
          <div className={styles.warningBanner} role="alert">
            <span className={styles.warningIcon}>⚠️</span>
            <div className={styles.warningContent}>
              <strong>Possible duplicate</strong>
              <p>{duplicateWarning}</p>
            </div>
          </div>
        )}

        {/* ================================================================
            ACTIONS
            ================================================================ */}
        <div className={styles.actions}>
          <Link
            to={presetStudentId ? `/admin/students/${presetStudentId}` : '/admin/enrollments'}
            className={styles.cancelBtn}
          >
            Cancel
          </Link>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSaving}
          >
            {isSaving ? 'Enrolling…' : 'Create Enrollment'}
          </button>
        </div>
      </form>
    </div>
  );
};