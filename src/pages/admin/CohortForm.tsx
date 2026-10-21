// ============================================================================
// iQuire — Admin: Create/Edit Cohort (Phase 15.8)
// ============================================================================

import React, { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Input } from '../../components/common/Input';
import { SelectInput } from '../../components/common/SelectInput';
import { FormSection } from '../../components/common/FormSection';
import {
  createCohort,
  updateCohort,
  fetchCohortById,
  type CohortWithCourse,
  type CohortStatus,
} from '../../services/cohorts.service';
import { fetchCoursesForSelect } from '../../services/students.service';
import styles from './CohortForm.module.css';

// ============================================================================
// Types
// ============================================================================

interface FormData {
  course_id: string;
  name: string;
  start_date: string;
  end_date: string;
  schedule: string;
  format: string;
  fee: string;
  capacity: string;
  spots_left: string;
  status: CohortStatus;
  is_next: boolean;
  cohort_token: string;
  registration_url: string;
}

interface FormErrors {
  [key: string]: string;
}

const initialFormData: FormData = {
  course_id: '',
  name: '',
  start_date: '',
  end_date: '',
  schedule: '',
  format: 'Virtual',
  fee: '',
  capacity: '',
  spots_left: '',
  status: 'open',
  is_next: false,
  cohort_token: '',
  registration_url: '',
};

// ============================================================================
// Component
// ============================================================================

export const AdminCohortForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);

  // Load courses
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

  // Load cohort for edit
  useEffect(() => {
    if (!isEdit || !id) return;
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      const res = await fetchCohortById(id);

      if (!isMounted) return;

      if (!res.success || !res.data) {
        setLoadError(res.error ?? 'Cohort not found');
        setIsLoading(false);
        return;
      }

      const c: CohortWithCourse = res.data;
      setFormData({
        course_id: c.course_id,
        name: c.name,
        start_date: c.start_date ?? '',
        end_date: c.end_date ?? '',
        schedule: c.schedule ?? '',
        format: c.format ?? '',
        fee: c.fee ?? '',
        capacity: c.capacity?.toString() ?? '',
        spots_left: c.spots_left?.toString() ?? '',
        status: c.status,
        is_next: c.is_next,
        cohort_token: c.cohort_token ?? '',
        registration_url: c.registration_url ?? '',
      });
      setIsLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [id, isEdit]);

  // Handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Validation
  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!formData.course_id) e.course_id = 'Course is required';
    if (!formData.name.trim()) e.name = 'Cohort name is required';
    return e;
  };

  // Submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);
    setErrors({});

    const payload = {
      course_id: formData.course_id,
      name: formData.name.trim(),
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      schedule: formData.schedule.trim() || null,
      format: formData.format.trim() || null,
      fee: formData.fee.trim() || null,
      capacity: formData.capacity ? Number(formData.capacity) : null,
      spots_left: formData.spots_left ? Number(formData.spots_left) : null,
      status: formData.status,
      is_next: formData.is_next,
      cohort_token: formData.cohort_token.trim() || null,
      registration_url: formData.registration_url.trim() || null,
    };

    const res = isEdit
      ? await updateCohort(id!, payload)
      : await createCohort(payload);

    setIsSaving(false);

    if (!res.success) {
      setErrors({ submit: res.error ?? 'Save failed' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    navigate('/admin/cohorts');
  };

  // Render: loading
  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading cohort…</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <p>{loadError}</p>
          <Link to="/admin/cohorts" className={styles.backLink}>
            ← Back to Cohorts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <Link to="/admin/cohorts" className={styles.breadcrumb}>
            ← Back to Cohorts
          </Link>
          <h1 className={styles.pageTitle}>
            {isEdit ? 'Edit Cohort' : 'New Cohort'}
          </h1>
          <p className={styles.pageSubtitle}>
            {isEdit
              ? 'Update cohort details.'
              : 'Add a new cohort to a course.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {errors.submit && (
          <div className={styles.errorBanner} role="alert">
            {errors.submit}
          </div>
        )}

        <FormSection title="Course & Name">
          <SelectInput
            label="Course"
            name="course_id"
            value={formData.course_id}
            onChange={handleChange}
            required
            disabled={isEdit}
            options={[
              { label: '— Select course —', value: '' },
              ...courses.map((c) => ({ label: c.title, value: c.id })),
            ]}
            placeholder="Select a course"
            helperText={
              isEdit
                ? 'Course cannot be changed. Create a new cohort instead.'
                : undefined
            }
            error={errors.course_id}
          />

          <Input
            label="Cohort name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Cohort 7, April 2026 Intake"
            error={errors.name}
          />

          <Input
            label="Cohort token"
            name="cohort_token"
            value={formData.cohort_token}
            onChange={handleChange}
            placeholder="e.g., 26b, 25a, tech4"
            helperText="Used in IQuire ID generation: IQ-{token}-{4 digits}"
          />
        </FormSection>

        <FormSection title="Dates & Format">
          <div className={styles.twoCol}>
            <Input
              label="Start date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
            />
            <Input
              label="End date"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleChange}
            />
          </div>

          <div className={styles.twoCol}>
            <Input
              label="Schedule"
              name="schedule"
              value={formData.schedule}
              onChange={handleChange}
              placeholder="e.g., Mon & Wed · 6pm – 8pm"
            />
            <Input
              label="Format"
              name="format"
              value={formData.format}
              onChange={handleChange}
              placeholder="e.g., Virtual, Hybrid, In-person"
            />
          </div>
        </FormSection>

        <FormSection title="Capacity & Fees">
          <div className={styles.twoCol}>
            <Input
              label="Fee"
              name="fee"
              value={formData.fee}
              onChange={handleChange}
              placeholder="e.g., ₦50,000"
            />
            <Input
              label="Capacity"
              name="capacity"
              type="number"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="e.g., 30"
            />
          </div>

          <div className={styles.twoCol}>
            <Input
              label="Spots left"
              name="spots_left"
              type="number"
              value={formData.spots_left}
              onChange={handleChange}
              placeholder="e.g., 12"
              helperText="Shown on the course page for urgency."
            />
            <Input
              label="Registration URL"
              name="registration_url"
              type="url"
              value={formData.registration_url}
              onChange={handleChange}
              placeholder="https://forms.gle/…"
              helperText="External form. Shown when cohort is open."
            />
          </div>
        </FormSection>

        <FormSection title="Status & Flags">
          <SelectInput
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={[
              { label: 'Open — accepting registrations', value: 'open' },
              { label: 'Closed — not accepting', value: 'closed' },
              { label: 'Completed — past cohort', value: 'completed' },
            ]}
          />

          <div className={styles.checkboxRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="is_next"
                checked={formData.is_next}
                onChange={handleChange}
                className={styles.checkbox}
              />
              <span>
                <strong>Mark as next cohort</strong>
                <span>
                  The course's public page will show this cohort as the
                  upcoming one. Only one cohort per course can be "next".
                </span>
              </span>
            </label>
          </div>
        </FormSection>

        <div className={styles.actions}>
          <Link to="/admin/cohorts" className={styles.cancelBtn}>
            Cancel
          </Link>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSaving}
          >
            {isSaving
              ? 'Saving…'
              : isEdit
              ? 'Save Changes'
              : 'Create Cohort'}
          </button>
        </div>
      </form>
    </div>
  );
};