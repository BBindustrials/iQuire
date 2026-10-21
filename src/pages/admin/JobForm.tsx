// ============================================================================
// iQuire — Admin: Create/Edit Job (Phase 12D.9)
// ============================================================================

import React, { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Input } from '../../components/common/Input';
import { SelectInput } from '../../components/common/SelectInput';
import { FormSection } from '../../components/common/FormSection';
import {
  createJob,
  updateJob,
  fetchJobById,
  type JobWithCourse,
} from '../../services/jobs.service';
import { fetchCoursesForSelect } from '../../services/students.service';
import { slugify } from '../../services/blog.service';
import {
  JOB_WORK_MODE_OPTIONS,
  JOB_OPPORTUNITY_TYPE_OPTIONS,
  JOB_EXPERIENCE_LEVEL_OPTIONS,
  type JobWorkMode,
  type JobOpportunityType,
  type JobExperienceLevel,
} from '../../types/content.types';
import styles from './JobForm.module.css';

// ============================================================================
// Types
// ============================================================================

interface FormData {
  title: string;
  slug: string;
  company: string;
  company_logo_url: string;
  description: string;
  location: string;
  work_mode: JobWorkMode;
  opportunity_type: JobOpportunityType;
  experience_level: JobExperienceLevel;
  salary_range: string;
  required_skills: string[];
  apply_url: string;
  deadline: string;
  course_id: string;
  status: 'draft' | 'published' | 'closed' | 'archived';
  featured: boolean;
  display_order: number;
}

interface FormErrors {
  [key: string]: string;
}

const initialFormData: FormData = {
  title: '',
  slug: '',
  company: '',
  company_logo_url: '',
  description: '',
  location: '',
  work_mode: 'on-site',
  opportunity_type: 'full-time',
  experience_level: 'any',
  salary_range: '',
  required_skills: [],
  apply_url: '',
  deadline: '',
  course_id: '',
  status: 'draft',
  featured: false,
  display_order: 0,
};

// ============================================================================
// Component
// ============================================================================

export const AdminJobForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [skillInput, setSkillInput] = useState('');

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
  // Load job for edit
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isEdit || !id) return;
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      const res = await fetchJobById(id);

      if (!isMounted) return;

      if (!res.success || !res.data) {
        setLoadError(res.error ?? 'Job not found');
        setIsLoading(false);
        return;
      }

      const j: JobWithCourse = res.data;
      setFormData({
        title: j.title,
        slug: j.slug,
        company: j.company,
        company_logo_url: j.company_logo_url ?? '',
        description: j.description,
        location: j.location ?? '',
        work_mode: j.work_mode,
        opportunity_type: j.opportunity_type,
        experience_level: j.experience_level,
        salary_range: j.salary_range ?? '',
        required_skills: j.required_skills ?? [],
        apply_url: j.apply_url ?? '',
        deadline: j.deadline ?? '',
        course_id: j.course_id ?? '',
        status: j.status,
        featured: j.featured,
        display_order: j.display_order,
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
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : name === 'display_order'
          ? Number(value)
          : value,
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
  // Skills array management
  // --------------------------------------------------------------------------
  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (formData.required_skills.includes(trimmed)) {
      setSkillInput('');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      required_skills: [...prev.required_skills, trimmed],
    }));
    setSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      required_skills: prev.required_skills.filter((s) => s !== skill),
    }));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // --------------------------------------------------------------------------
  // Validation
  // --------------------------------------------------------------------------
  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!formData.title.trim()) e.title = 'Title is required';
    if (!formData.slug.trim()) e.slug = 'Slug is required';
    if (!formData.company.trim()) e.company = 'Company is required';
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
      company: formData.company.trim(),
      company_logo_url: formData.company_logo_url.trim() || null,
      description: formData.description.trim(),
      location: formData.location.trim() || null,
      work_mode: formData.work_mode,
      opportunity_type: formData.opportunity_type,
      experience_level: formData.experience_level,
      salary_range: formData.salary_range.trim() || null,
      required_skills: formData.required_skills,
      apply_url: formData.apply_url.trim() || null,
      deadline: formData.deadline || null,
      course_id: formData.course_id || null,
      status: formData.status,
      featured: formData.featured,
      display_order: formData.display_order,
    };

    const res = isEdit
      ? await updateJob(id!, payload)
      : await createJob(payload);

    setIsSaving(false);

    if (!res.success) {
      setErrors({ submit: res.error ?? 'Save failed' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    navigate('/admin/jobs');
  };

  // --------------------------------------------------------------------------
  // Render: loading / error
  // --------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading job…</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <p>{loadError}</p>
          <Link to="/admin/jobs" className={styles.backLink}>
            ← Back to Jobs
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
          <Link to="/admin/jobs" className={styles.breadcrumb}>
            ← Back to Jobs
          </Link>
          <h1 className={styles.pageTitle}>
            {isEdit ? 'Edit Job' : 'New Job'}
          </h1>
          <p className={styles.pageSubtitle}>
            {isEdit
              ? 'Update details for this job listing.'
              : 'Create a new job listing to appear on the public jobs page.'}
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
            label="Job Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g., Junior Data Analyst"
            error={errors.title}
          />

          <div className={styles.slugRow}>
            <Input
              label="Slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              placeholder="junior-data-analyst"
              helperText={`URL: /jobs/${formData.slug || 'your-slug'}`}
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

          <div className={styles.twoCol}>
            <Input
              label="Company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
              placeholder="e.g., TechHub Africa"
              error={errors.company}
            />
            <Input
              label="Company Logo URL"
              name="company_logo_url"
              type="url"
              value={formData.company_logo_url}
              onChange={handleChange}
              placeholder="https://..."
              helperText="Optional. Falls back to initials."
            />
          </div>

          <div className={styles.textareaWrapper}>
            <label className={styles.textareaLabel}>
              Description <span className={styles.requiredMark}>*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              className={`${styles.textarea} ${
                errors.description ? styles.textareaError : ''
              }`}
              placeholder="Describe the role, responsibilities, and what a successful candidate looks like."
            />
            {errors.description && (
              <span className={styles.errorText}>{errors.description}</span>
            )}
          </div>
        </FormSection>

        <FormSection title="Classification">
          <div className={styles.threeCol}>
            <SelectInput
              label="Work Mode"
              name="work_mode"
              value={formData.work_mode}
              onChange={handleChange}
              options={JOB_WORK_MODE_OPTIONS}
            />
            <SelectInput
              label="Opportunity Type"
              name="opportunity_type"
              value={formData.opportunity_type}
              onChange={handleChange}
              options={JOB_OPPORTUNITY_TYPE_OPTIONS}
            />
            <SelectInput
              label="Experience Level"
              name="experience_level"
              value={formData.experience_level}
              onChange={handleChange}
              options={JOB_EXPERIENCE_LEVEL_OPTIONS}
            />
          </div>

          <div className={styles.twoCol}>
            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Lagos, Nigeria"
            />
            <Input
              label="Salary Range"
              name="salary_range"
              value={formData.salary_range}
              onChange={handleChange}
              placeholder="e.g., ₦250,000 – ₦350,000 / month"
            />
          </div>
        </FormSection>

        <FormSection title="Required Skills">
          <div className={styles.skillInputRow}>
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKeyDown}
              placeholder="Type a skill and press Enter (e.g., SQL)"
              className={styles.skillInput}
            />
            <button
              type="button"
              className={styles.addSkillBtn}
              onClick={handleAddSkill}
              disabled={!skillInput.trim()}
            >
              + Add
            </button>
          </div>

          {formData.required_skills.length > 0 ? (
            <div className={styles.skillTags}>
              {formData.required_skills.map((skill) => (
                <span key={skill} className={styles.skillTag}>
                  {skill}
                  <button
                    type="button"
                    className={styles.skillRemove}
                    onClick={() => handleRemoveSkill(skill)}
                    aria-label={`Remove ${skill}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className={styles.skillHint}>
              No skills added yet. Press Enter or click Add to include a
              skill.
            </p>
          )}
        </FormSection>

        <FormSection title="Application">
          <div className={styles.twoCol}>
            <Input
              label="Deadline"
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleChange}
              helperText="When applications close."
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
              helperText="Optional. Show a prep-course link on the job card."
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

          <div className={styles.checkboxRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className={styles.checkbox}
              />
              <span>
                <strong>Featured job</strong>
                <span>
                  Featured jobs appear first on the public jobs page.
                </span>
              </span>
            </label>
          </div>
        </FormSection>

        <div className={styles.actions}>
          <Link to="/admin/jobs" className={styles.cancelBtn}>
            Cancel
          </Link>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSaving}
          >
            {isSaving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Job'}
          </button>
        </div>
      </form>
    </div>
  );
};