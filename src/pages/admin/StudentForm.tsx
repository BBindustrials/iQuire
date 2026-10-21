// ============================================================================
// iQuire — Admin: Create/Edit Student (Phase 15.7)
// ============================================================================
// Create mode: minimal form.
// Edit mode: basic info + enrollments panel below.
// ============================================================================

/* eslint-disable react-hooks/set-state-in-effect */

import React, { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Input } from '../../components/common/Input';
import { SelectInput } from '../../components/common/SelectInput';
import { FormSection } from '../../components/common/FormSection';
import {
  createStudent,
  fetchStudentById,
  updateStudent,
  fetchCoursesForSelect,
  fetchCohortsForCourse,
  type StudentListItem,
  type CreateStudentResponse,
} from '../../services/students.service';
import {
  fetchEnrollmentsByStudent,
  updateEnrollment,
  deleteEnrollment,
  formatEnrollmentStatus,
  type EnrollmentWithRelations,
  type EnrollmentStatus,
} from '../../services/enrollments.service';
import { CredentialCard } from './CredentialCard';
import styles from './StudentForm.module.css';

// ============================================================================
// Types
// ============================================================================

interface FormData {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  country: string;
  state: string;
  lga: string;
  cohort_token: string;
  course_id: string;
  cohort_id: string;
}

interface FormErrors {
  [key: string]: string;
}

const initialFormData: FormData = {
  first_name: '',
  middle_name: '',
  last_name: '',
  email: '',
  phone: '',
  gender: '',
  country: 'NG',
  state: '',
  lga: '',
  cohort_token: '',
  course_id: '',
  cohort_id: '',
};

// ============================================================================
// Component
// ============================================================================

export const AdminStudentForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [credentialResult, setCredentialResult] =
    useState<CreateStudentResponse | null>(null);

  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [cohorts, setCohorts] = useState<{ id: string; name: string }[]>([]);

  // Enrollments (edit mode only)
  const [enrollments, setEnrollments] = useState<EnrollmentWithRelations[]>([]);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(false);
  const [enrollmentActionLoading, setEnrollmentActionLoading] =
    useState(false);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);
  const [deleteEnrollmentConfirm, setDeleteEnrollmentConfirm] = useState<
    string | null
  >(null);

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
  // Load cohorts when course changes (create mode)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!formData.course_id) {
      setCohorts([]);
      return;
    }

    let isMounted = true;
    (async () => {
      const res = await fetchCohortsForCourse(formData.course_id, { includeAll: false });
      if (isMounted && res.success && res.data) setCohorts(res.data);
    })();
    return () => {
      isMounted = false;
    };
  }, [formData.course_id]);

  // --------------------------------------------------------------------------
  // Load student for edit
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isEdit || !id) return;
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      const res = await fetchStudentById(id);

      if (!isMounted) return;

      if (!res.success || !res.data) {
        setLoadError(res.error ?? 'Student not found');
        setIsLoading(false);
        return;
      }

      const s: StudentListItem = res.data;
      setFormData({
        first_name: s.first_name,
        middle_name: '',
        last_name: s.last_name,
        email: s.email,
        phone: s.phone ?? '',
        gender: '',
        country: 'NG',
        state: '',
        lga: '',
        cohort_token: '',
        course_id: '',
        cohort_id: '',
      });
      setIsLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [id, isEdit]);

  // --------------------------------------------------------------------------
  // Load enrollments (edit mode)
  // --------------------------------------------------------------------------
  const loadEnrollments = useCallback(async () => {
    if (!isEdit || !id) return;
    setIsLoadingEnrollments(true);
    const res = await fetchEnrollmentsByStudent(id);
    setIsLoadingEnrollments(false);

    if (res.success && res.data) {
      setEnrollments(res.data);
    } else {
      setEnrollmentError(res.error ?? 'Failed to load enrollments');
    }
  }, [id, isEdit]);

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'course_id' ? { cohort_id: '' } : {}),
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
  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!formData.first_name.trim()) e.first_name = 'First name is required';
    if (!formData.last_name.trim()) e.last_name = 'Last name is required';

    if (!isEdit) {
      if (!formData.email.trim()) e.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
        e.email = 'Enter a valid email';
      if (!formData.cohort_token.trim())
        e.cohort_token = 'Cohort token is required (e.g., "26b")';
    }

    return e;
  };

  // --------------------------------------------------------------------------
  // Submit (create or update student)
  // --------------------------------------------------------------------------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);
    setErrors({});

    if (isEdit && id) {
      const res = await updateStudent(id, {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim(),
      });

      setIsSaving(false);
      if (!res.success) {
        setErrors({ submit: res.error ?? 'Failed to update' });
        return;
      }
      navigate('/admin/students');
      return;
    }

    const res = await createStudent({
      first_name: formData.first_name.trim(),
      middle_name: formData.middle_name.trim() || undefined,
      last_name: formData.last_name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim() || undefined,
      gender:
        (formData.gender as
          | 'male'
          | 'female'
          | 'other'
          | 'prefer-not-to-say') || undefined,
      country: formData.country || undefined,
      state: formData.state || undefined,
      lga: formData.lga || undefined,
      cohort_token: formData.cohort_token.trim(),
      course_id: formData.course_id || undefined,
      cohort_id: formData.cohort_id || undefined,
    });

    setIsSaving(false);

    if (!res.success || !res.data) {
      setErrors({ submit: res.error ?? 'Failed to create student' });
      return;
    }

    setCredentialResult(res.data);
  };

  // --------------------------------------------------------------------------
  // Enrollments actions
  // --------------------------------------------------------------------------
  const handleEnrollmentStatusChange = async (
    enrollment: EnrollmentWithRelations,
    nextStatus: EnrollmentStatus
  ) => {
    if (nextStatus === enrollment.status) return;

    if (nextStatus === 'completed') {
      const confirmed = window.confirm(
        `Mark this enrollment as COMPLETED? This will grant the student the alumni role.`
      );
      if (!confirmed) return;
    }

    setEnrollmentActionLoading(true);
    const previous = enrollment.status;

    setEnrollments((prev) =>
      prev.map((e) => (e.id === enrollment.id ? { ...e, status: nextStatus } : e))
    );

    const res = await updateEnrollment(enrollment.id, { status: nextStatus });
    setEnrollmentActionLoading(false);

    if (!res.success) {
      setEnrollments((prev) =>
        prev.map((e) =>
          e.id === enrollment.id ? { ...e, status: previous } : e
        )
      );
      setEnrollmentError(res.error ?? 'Failed to update enrollment');
    }
  };

  const handleDeleteEnrollment = async (enrollmentId: string) => {
    setEnrollmentActionLoading(true);
    const res = await deleteEnrollment(enrollmentId);
    setEnrollmentActionLoading(false);

    if (!res.success) {
      setEnrollmentError(res.error ?? 'Failed to delete enrollment');
      setDeleteEnrollmentConfirm(null);
      return;
    }

    setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
    setDeleteEnrollmentConfirm(null);
  };

  // --------------------------------------------------------------------------
  // Formatting helpers
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
  // Render: loading / load error / credential result
  // --------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading student…</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <p>{loadError}</p>
          <Link to="/admin/students" className={styles.backLink}>
            ← Back to Students
          </Link>
        </div>
      </div>
    );
  }

  if (credentialResult) {
    return (
      <CredentialCard
        credentials={credentialResult}
        onClose={() => navigate('/admin/students')}
        onCreateAnother={() => {
          setCredentialResult(null);
          setFormData(initialFormData);
        }}
      />
    );
  }

  // --------------------------------------------------------------------------
  // Render: form
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <Link to="/admin/students" className={styles.breadcrumb}>
            ← Back to Students
          </Link>
          <h1 className={styles.pageTitle}>
            {isEdit ? 'Edit Student' : 'Create Student'}
          </h1>
          <p className={styles.pageSubtitle}>
            {isEdit
              ? 'Update basic profile info. Credentials cannot be changed here.'
              : 'Create a student account. Credentials will be emailed automatically.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {errors.submit && (
          <div className={styles.errorBanner} role="alert">
            {errors.submit}
          </div>
        )}

        {/* PERSONAL */}
        <FormSection title="Personal Details">
          <div className={styles.twoCol}>
            <Input
              label="First name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              error={errors.first_name}
            />
            <Input
              label="Middle name"
              name="middle_name"
              value={formData.middle_name}
              onChange={handleChange}
              helperText="Optional"
            />
          </div>
          <div className={styles.twoCol}>
            <Input
              label="Last name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              error={errors.last_name}
            />
            <SelectInput
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              options={[
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
                { label: 'Other', value: 'other' },
                { label: 'Prefer not to say', value: 'prefer-not-to-say' },
              ]}
              placeholder="Select gender"
            />
          </div>
        </FormSection>

        {/* CONTACT */}
        <FormSection title="Contact">
          <div className={styles.twoCol}>
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required={!isEdit}
              disabled={isEdit}
              helperText={
                isEdit
                  ? 'Email cannot be changed.'
                  : 'Login credentials will be sent here.'
              }
              error={errors.email}
            />
            <Input
              label="Phone"
              name="phone"
              type="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="08012345678"
            />
          </div>
        </FormSection>

        {/* COHORT TOKEN (create only) */}
        {!isEdit && (
          <FormSection title="IQuire ID">
            <Input
              label="Cohort token"
              name="cohort_token"
              value={formData.cohort_token}
              onChange={handleChange}
              required
              placeholder="e.g., 26b, 25a, tech4"
              helperText="Used to generate the IQuire ID: IQ-{token}-{4 digits}"
              error={errors.cohort_token}
            />
          </FormSection>
        )}

        {/* OPTIONAL COURSE (create only) */}
        {!isEdit && (
          <FormSection title="Course Enrollment (Optional)">
            <div className={styles.infoHint}>
              <span className={styles.infoHintIcon}>ℹ️</span>
              <span>
                Optional — creates the account and enrolls them in one step.
                To add more courses to an existing student, or to register a
                legacy alumnus with completed courses, use{' '}
                <strong>Enrollments</strong> instead.
              </span>
            </div>

            <div className={styles.twoCol}>
              <SelectInput
                label="Course"
                name="course_id"
                value={formData.course_id}
                onChange={handleChange}
                options={[
                  { label: '— Skip —', value: '' },
                  ...courses.map((c) => ({ label: c.title, value: c.id })),
                ]}
                placeholder="Select course"
                helperText="Leave blank to enroll later from /admin/enrollments"
              />
              <SelectInput
                label="Cohort"
                name="cohort_id"
                value={formData.cohort_id}
                onChange={handleChange}
                options={[
                  { label: '— Skip —', value: '' },
                  ...cohorts.map((c) => ({ label: c.name, value: c.id })),
                ]}
                placeholder="Select cohort"
                disabled={!formData.course_id || cohorts.length === 0}
              />
            </div>
          </FormSection>
        )}

        {/* ACTIONS */}
        <div className={styles.actions}>
          <Link to="/admin/students" className={styles.cancelBtn}>
            Cancel
          </Link>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSaving}
          >
            {isSaving
              ? isEdit
                ? 'Saving…'
                : 'Creating…'
              : isEdit
              ? 'Save Changes'
              : 'Create Student'}
          </button>
        </div>
      </form>

      {/* ================================================================
          ENROLLMENTS PANEL (edit mode only)
          ================================================================ */}
      {isEdit && (
        <section className={styles.enrollmentsPanel}>
          <div className={styles.enrollmentsHeader}>
            <div>
              <h2 className={styles.enrollmentsTitle}>Enrollments</h2>
              <p className={styles.enrollmentsSubtitle}>
                Courses this student is enrolled in. Manage course access here.
              </p>
            </div>
            <Link
              to={`/admin/enrollments/new?student_id=${id}`}
              className={styles.enrollButton}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5V19M5 12H19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Enroll in Another Course
            </Link>
          </div>

          {enrollmentError && (
            <div className={styles.enrollmentError} role="alert">
              {enrollmentError}
              <button
                type="button"
                className={styles.errorClose}
                onClick={() => setEnrollmentError(null)}
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          )}

          {isLoadingEnrollments ? (
            <div className={styles.enrollmentsSkeleton}>
              {[...Array(2)].map((_, i) => (
                <div key={i} className={styles.enrollmentSkeletonRow} />
              ))}
            </div>
          ) : enrollments.length === 0 ? (
            <div className={styles.enrollmentsEmpty}>
              <div className={styles.enrollmentsEmptyIcon}>🎓</div>
              <h3 className={styles.enrollmentsEmptyTitle}>
                Not enrolled in any course yet
              </h3>
              <p className={styles.enrollmentsEmptyText}>
                Use the button above to add this student to a course.
              </p>
            </div>
          ) : (
            <div className={styles.enrollmentsTableWrapper}>
              <table className={styles.enrollmentsTable}>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Cohort</th>
                    <th>Status</th>
                    <th>Started</th>
                    <th>Completed</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((e) => (
                    <tr key={e.id}>
                      <td>
                        <span className={styles.courseChip}>
                          {e.course?.title ?? '—'}
                        </span>
                      </td>
                      <td>
                        {e.cohort ? (
                          <div className={styles.cohortCell}>
                            <span className={styles.cohortName}>
                              {e.cohort.name}
                            </span>
                            {e.cohort.start_date && (
                              <span className={styles.cohortDate}>
                                {formatDate(e.cohort.start_date)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className={styles.muted}>—</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            styles[`status-${e.status}`]
                          }`}
                        >
                          {formatEnrollmentStatus(e.status)}
                        </span>
                      </td>
                      <td>
                        <span className={styles.dateText}>
                          {formatDate(e.started_at)}
                        </span>
                      </td>
                      <td>
                        <span className={styles.dateText}>
                          {formatDate(e.completed_at)}
                        </span>
                      </td>
                      <td>
                        <div className={styles.rowActions}>
                          <select
                            className={styles.statusSelect}
                            value={e.status}
                            onChange={(ev) =>
                              handleEnrollmentStatusChange(
                                e,
                                ev.target.value as EnrollmentStatus
                              )
                            }
                            disabled={enrollmentActionLoading}
                            title="Change status"
                          >
                            <option value="applied">Applied</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="dropped">Dropped</option>
                          </select>
                          <button
                            type="button"
                            className={`${styles.rowActionBtn} ${styles.rowActionDanger}`}
                            onClick={() => setDeleteEnrollmentConfirm(e.id)}
                            title="Delete enrollment"
                            disabled={enrollmentActionLoading}
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
        </section>
      )}

      {/* Delete enrollment confirmation */}
      {deleteEnrollmentConfirm && (
        <div
          className={styles.modalOverlay}
          onClick={() => setDeleteEnrollmentConfirm(null)}
        >
          <div className={styles.modal} onClick={(ev) => ev.stopPropagation()}>
            <h3 className={styles.modalTitle}>Delete this enrollment?</h3>
            <p className={styles.modalText}>
              The student will no longer be enrolled in this course. Their
              account and any historical role assignments stay intact.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={() => setDeleteEnrollmentConfirm(null)}
                disabled={enrollmentActionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalConfirm}
                onClick={() =>
                  handleDeleteEnrollment(deleteEnrollmentConfirm)
                }
                disabled={enrollmentActionLoading}
              >
                {enrollmentActionLoading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};