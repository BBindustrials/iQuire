// ============================================================================
// iQuire — Admin: Create/Edit Scholarship (Phase 12D.7)
// ============================================================================

import React, { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Input } from '../../components/common/Input';
import { SelectInput } from '../../components/common/SelectInput';
import { FormSection } from '../../components/common/FormSection';
import {
  createScholarship,
  updateScholarship,
  fetchScholarshipById,
  type ScholarshipWithCourse,
} from '../../services/scholarships.service';
import {
  fetchCoursesForSelect,
} from '../../services/students.service';
import { slugify } from '../../services/blog.service';
import styles from './ScholarshipForm.module.css';

// ============================================================================
// Types
// ============================================================================

interface FormData {
  title: string;
  slug: string;
  description: string;
  eligibility: string;
  coverage: string;
  deadline: string;
  apply_url: string;
  course_id: string;
  status: 'draft' | 'published' | 'closed' | 'archived';
  display_order: number;
}

interface FormErrors {
  [key: string]: string;
}

const initialFormData: FormData = {
  title: '',
  slug: '',
  description: '',
  eligibility: '',
  coverage: '',
  deadline: '',
  apply_url: '',
  course_id: '',
  status: 'draft',
  display_order: 0,
};

// ============================================================================
// Component
// ============================================================================

export const AdminScholarshipForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);

  // --------------------------------------------------------------------------
  // Load courses on mount
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
  // Load scholarship for edit
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isEdit || !id) return;
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      const res = await fetchScholarshipById(id);

      if (!isMounted) return;

      if (!res.success || !res.data) {
        setLoadError(res.error ?? 'Scholarship not found');
        setIsLoading(false);
        return;
      }

      const s: ScholarshipWithCourse = res.data;
      setFormData({
        title: s.title,
        slug: s.slug,
        description: s.description,
        eligibility: s.eligibility ?? '',
        coverage: s.coverage ?? '',
        deadline: s.deadline ?? '',
        apply_url: s.apply_url ?? '',
        course_id: s.course_id ?? '',
        status: s.status,
        display_order: s.display_order,
      });
      setIsLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [id, isEdit]);

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'display_order' ? Number(value) : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleGenerateSlug = () => {
    setFormData((prev) => ({ ...prev, slug: slugify(prev.title) }));
  };

  // --------------------------------------------------------------------------
  // Validation
  // --------------------------------------------------------------------------
  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!formData.title.trim()) e.title = 'Title is required';
    if (!formData.slug.trim()) e.slug = 'Slug is required';
    if (!formData.description.trim()) e.description = 'Description is required';
    return e;
  };

  // --------------------------------------------------------------------------
  // Submit
  // --------------------------------------------------------------------------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);
    setErrors({});

    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      description: formData.description.trim(),
      eligibility: formData.eligibility.trim() || null,
      coverage: formData.coverage.trim() || null,
      deadline: formData.deadline || null,
      apply_url: formData.apply_url.trim() || null,
      course_id: formData.course_id || null,
      status: formData.status,
      display_order: formData.display_order,
    };

    const res = isEdit
      ? await updateScholarship(id!, payload)
      : await createScholarship(payload);

    setIsSaving(false);

    if (!res.success) {
      setErrors({ submit: res.error ?? 'Save failed' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    navigate('/admin/scholarships');
  };

  // --------------------------------------------------------------------------
  // Render: loading
  // --------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading scholarship…</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <p>{loadError}</p>
          <Link to="/admin/scholarships" className={styles.backLink}>
            ← Back to Scholarships
          </Link>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <Link to="/admin/scholarships" className={styles.breadcrumb}>
            ← Back to Scholarships
          </Link>
          <h1 className={styles.pageTitle}>
            {isEdit ? 'Edit Scholarship' : 'New Scholarship'}
          </h1>
          <p className={styles.pageSubtitle}>
            {isEdit
              ? 'Update details for this scholarship.'
              : 'Create a new scholarship to appear on the public page.'}
          </p>
        </div>
      </div>

      {errors.submit && (
        <div className={styles.errorBanner} role="alert">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <FormSection title="Basic Details">
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g., NYSC Digital Work Readiness Scholarship"
            error={errors.title}
          />

          <div className={styles.slugRow}>
            <Input
              label="Slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              placeholder="nysc-digital-work-readiness-scholarship"
              helperText={`URL: /scholarships/${formData.slug || 'your-slug'}`}
              error={errors.slug}
            />
            <button
              type="button"
              className={styles.slugButton}
              onClick={handleGenerateSlug}
              disabled={!formData.title.trim()}
            >
              Generate
            </button>
          </div>

          <div className={styles.textareaWrapper}>
            <label className={styles.textareaLabel}>
              Description <span className={styles.requiredMark}>*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`${styles.textarea} ${
                errors.description ? styles.textareaError : ''
              }`}
              placeholder="A short paragraph describing what this scholarship is for."
            />
            {errors.description && (
              <span className={styles.errorText}>{errors.description}</span>
            )}
          </div>
        </FormSection>

        <FormSection title="Eligibility & Coverage">
          <div className={styles.textareaWrapper}>
            <label className={styles.textareaLabel}>Eligibility</label>
            <textarea
              name="eligibility"
              value={formData.eligibility}
              onChange={handleChange}
              rows={4}
              className={styles.textarea}
              placeholder="One requirement per line, e.g.:&#10;Serving NYSC corps member&#10;Currently deployed in Nigeria"
            />
            <span className={styles.textareaHelper}>
              Each line becomes a bullet point on the public page.
            </span>
          </div>

          <Input
            label="Coverage"
            name="coverage"
            value={formData.coverage}
            onChange={handleChange}
            placeholder="e.g., Course fee (₦50,000) fully covered"
            helperText="A short summary of what's covered."
          />
        </FormSection>

        <FormSection title="Application">
          <div className={styles.twoCol}>
            <Input
              label="Deadline"
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleChange}
            />
            <Input
              label="Apply URL"
              name="apply_url"
              type="url"
              value={formData.apply_url}
              onChange={handleChange}
              placeholder="https://forms.gle/..."
              helperText="External form or application link."
            />
          </div>

          <div className={styles.twoCol}>
            <SelectInput
              label="Related Course"
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
              options={[
                { label: '— None —', value: '' },
                ...courses.map((c) => ({ label: c.title, value: c.id })),
              ]}
              placeholder="Select course"
              helperText="Optional. Link this scholarship to a specific course."
            />
            <Input
              label="Display Order"
              name="display_order"
              type="number"
              value={String(formData.display_order)}
              onChange={handleChange}
              helperText="Lower numbers appear first."
            />
          </div>
        </FormSection>

        <FormSection title="Publishing">
          <SelectInput
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={[
              { label: 'Draft — not visible', value: 'draft' },
              { label: 'Published — visible', value: 'published' },
              { label: 'Closed — no longer accepting', value: 'closed' },
              { label: 'Archived', value: 'archived' },
            ]}
          />
        </FormSection>

        <div className={styles.actions}>
          <Link to="/admin/scholarships" className={styles.cancelBtn}>
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
              : 'Create Scholarship'}
          </button>
        </div>
      </form>
    </div>
  );
};