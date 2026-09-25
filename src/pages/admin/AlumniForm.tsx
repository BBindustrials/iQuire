// ============================================================================
// iQuire — Admin: Alumni Create/Edit Form (Phase 9B.1a)
// ============================================================================

import React, { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Input } from '../../components/common/Input';
import { ImageUploader } from '../../components/common/ImageUploader';
import { FormSection } from '../../components/common/FormSection';
import {
  createAlumni,
  updateAlumni,
  fetchAlumniById,
  uploadAlumniPhoto,
  type AlumniInput,
  type AlumniStatus,
} from '../../services/alumni.service';
import styles from './AlumniForm.module.css';

// ============================================================================
// Types
// ============================================================================

interface FormData {
  full_name: string;
  professional_title: string;
  organization: string;
  photo_url: string;
  programme: string;
  cohort: string;
  short_summary: string;
  professional_summary: string;
  before_journey: string;
  after_journey: string;
  areas_of_expertise: string;
  key_skills: string;
  career_experience: string;
  feedback: string;
  trustpilot_url: string;
  linkedin_url: string;
  featured: boolean;
  display_order: number;
  status: AlumniStatus;
}

interface FormErrors {
  [key: string]: string;
}

// ============================================================================
// Initial state
// ============================================================================

const initialFormData: FormData = {
  full_name: '',
  professional_title: '',
  organization: '',
  photo_url: '',
  programme: '',
  cohort: '',
  short_summary: '',
  professional_summary: '',
  before_journey: '',
  after_journey: '',
  areas_of_expertise: '',
  key_skills: '',
  career_experience: '',
  feedback: '',
  trustpilot_url: '',
  linkedin_url: '',
  featured: false,
  display_order: 0,
  status: 'draft',
};

// ============================================================================
// Component
// ============================================================================

export const AdminAlumniForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // Load existing alumni for edit mode
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isEdit || !id) return;

    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      const result = await fetchAlumniById(id);
      if (!isMounted) return;

      if (!result.success || !result.data) {
        setLoadError(result.error ?? 'Alumni not found');
        setIsLoading(false);
        return;
      }

      const a = result.data;
      setFormData({
        full_name: a.full_name,
        professional_title: a.professional_title,
        organization: a.organization ?? '',
        photo_url: a.photo_url ?? '',
        programme: a.programme ?? '',
        cohort: a.cohort ?? '',
        short_summary: a.short_summary,
        professional_summary: a.professional_summary ?? '',
        before_journey: a.before_journey ?? '',
        after_journey: a.after_journey ?? '',
        areas_of_expertise: (a.areas_of_expertise ?? []).join(', '),
        key_skills: (a.key_skills ?? []).join(', '),
        career_experience: a.career_experience ?? '',
        feedback: a.feedback ?? '',
        trustpilot_url: a.trustpilot_url ?? '',
        linkedin_url: a.linkedin_url ?? '',
        featured: a.featured,
        display_order: a.display_order,
        status: a.status,
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

  const handlePhotoChange = (url: string) => {
    setFormData((prev) => ({ ...prev, photo_url: url }));
    if (errors.photo_url) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.photo_url;
        return next;
      });
    }
  };

  const parseList = (value: string): string[] =>
    value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

  // --------------------------------------------------------------------------
  // Validation
  // --------------------------------------------------------------------------
  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.professional_title.trim()) {
      newErrors.professional_title = 'Professional title is required';
    }

    if (!formData.short_summary.trim()) {
      newErrors.short_summary = 'Short summary is required';
    } else if (formData.short_summary.trim().length > 160) {
      newErrors.short_summary = 'Keep the short summary under 160 characters.';
    }

    if (
      formData.linkedin_url &&
      !/^https?:\/\/.+\..+/.test(formData.linkedin_url.trim())
    ) {
      newErrors.linkedin_url = 'Enter a valid URL.';
    }

    if (
      formData.trustpilot_url &&
      !/^https?:\/\/.+\..+/.test(formData.trustpilot_url.trim())
    ) {
      newErrors.trustpilot_url = 'Enter a valid URL.';
    }

    return newErrors;
  };

  // --------------------------------------------------------------------------
  // Submit
  // --------------------------------------------------------------------------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstKey = Object.keys(validationErrors)[0];
      const el = document.querySelector(`[name="${firstKey}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const payload: AlumniInput = {
      full_name: formData.full_name,
      professional_title: formData.professional_title,
      organization: formData.organization || null,
      photo_url: formData.photo_url || null,
      programme: formData.programme || null,
      cohort: formData.cohort || null,
      short_summary: formData.short_summary,
      professional_summary: formData.professional_summary || null,
      before_journey: formData.before_journey || null,
      after_journey: formData.after_journey || null,
      areas_of_expertise: parseList(formData.areas_of_expertise),
      key_skills: parseList(formData.key_skills),
      career_experience: formData.career_experience || null,
      feedback: formData.feedback || null,
      trustpilot_url: formData.trustpilot_url || null,
      linkedin_url: formData.linkedin_url || null,
      featured: formData.featured,
      display_order: formData.display_order,
      status: formData.status,
    };

    const result =
      isEdit && id
        ? await updateAlumni(id, payload)
        : await createAlumni(payload);

    setIsSubmitting(false);

    if (!result.success) {
      setErrors({ submit: result.error ?? 'Save failed.' });
      return;
    }

    navigate('/admin/alumni');
  };

  // --------------------------------------------------------------------------
  // Render: loading
  // --------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading alumni…</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Render: load error
  // --------------------------------------------------------------------------
  if (loadError) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <p className={styles.errorStateText}>{loadError}</p>
          <Link to="/admin/alumni" className={styles.backLink}>
            ← Back to alumni list
          </Link>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Render: form
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <Link to="/admin/alumni" className={styles.breadcrumb}>
            ← Back to Alumni
          </Link>
          <h1 className={styles.pageTitle}>
            {isEdit ? 'Edit Alumni' : 'Add Alumni'}
          </h1>
          <p className={styles.pageSubtitle}>
            {isEdit
              ? 'Update this alumni profile.'
              : 'Create a new alumni profile to showcase on the public site.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* ================================================================
            IDENTITY
            ================================================================ */}
        <FormSection title="Identity">
          <div className={styles.photoRow}>
            <ImageUploader
              value={formData.photo_url || null}
              onChange={handlePhotoChange}
              upload={uploadAlumniPhoto}
              label="Profile photo"
              aspect="square"
              maxSizeMB={1}
              helperText="JPEG, PNG, or WebP. Auto-compressed to ≤ 1 MB."
            />
          </div>

          <div className={styles.twoCol}>
            <Input
              label="Full name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              placeholder="e.g., Chidera Okafor"
              error={errors.full_name}
            />
            <Input
              label="Professional title"
              name="professional_title"
              value={formData.professional_title}
              onChange={handleChange}
              required
              placeholder="e.g., Junior Product Manager"
              error={errors.professional_title}
            />
          </div>

          <div className={styles.twoCol}>
            <Input
              label="Organization"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              placeholder="e.g., TechHub Africa"
              helperText="Company or organization they work at."
            />
          </div>
        </FormSection>

        {/* ================================================================
            PROGRAMME
            ================================================================ */}
        <FormSection title="Programme">
          <div className={styles.twoCol}>
            <Input
              label="Programme"
              name="programme"
              value={formData.programme}
              onChange={handleChange}
              placeholder="e.g., Tech 360"
              helperText="Optional."
            />
            <Input
              label="Cohort"
              name="cohort"
              value={formData.cohort}
              onChange={handleChange}
              placeholder="e.g., Cohort 4"
              helperText="Optional."
            />
          </div>
        </FormSection>

        {/* ================================================================
            SUMMARIES
            ================================================================ */}
        <FormSection title="Summaries">
          <Input
            label="Short summary"
            name="short_summary"
            value={formData.short_summary}
            onChange={handleChange}
            required
            placeholder="One-line intro shown on the alumni card"
            helperText={`${formData.short_summary.length}/160 characters`}
            error={errors.short_summary}
          />

          <div className={styles.textareaWrapper}>
            <label htmlFor="professional_summary" className={styles.textareaLabel}>
              Professional summary
            </label>
            <textarea
              id="professional_summary"
              name="professional_summary"
              value={formData.professional_summary}
              onChange={handleChange}
              rows={5}
              className={styles.textarea}
              placeholder="Detailed professional background, current role, areas of expertise, career journey…"
            />
            <span className={styles.textareaHelper}>
              Optional. Shown on the alumni's full profile page.
            </span>
          </div>
        </FormSection>

        {/* ================================================================
            JOURNEY (Before → After)
            ================================================================ */}
        <FormSection title="Journey">
          <p className={styles.sectionHint}>
            Optional — shown as a Before → After row on the featured card.
          </p>
          <div className={styles.twoCol}>
            <Input
              label="Before iQuire"
              name="before_journey"
              value={formData.before_journey}
              onChange={handleChange}
              placeholder="e.g., Business analyst with no tech exposure"
            />
            <Input
              label="After iQuire"
              name="after_journey"
              value={formData.after_journey}
              onChange={handleChange}
              placeholder="e.g., Junior Product Manager at a top tech company"
            />
          </div>
        </FormSection>

        {/* ================================================================
            SKILLS & EXPERIENCE
            ================================================================ */}
        <FormSection title="Skills & Experience">
          <div className={styles.twoCol}>
            <Input
              label="Areas of expertise"
              name="areas_of_expertise"
              value={formData.areas_of_expertise}
              onChange={handleChange}
              placeholder="Product, Analytics, Design"
              helperText="Comma-separated."
            />
            <Input
              label="Key skills"
              name="key_skills"
              value={formData.key_skills}
              onChange={handleChange}
              placeholder="Roadmapping, User Research, SQL"
              helperText="Comma-separated."
            />
          </div>

          <div className={styles.textareaWrapper}>
            <label htmlFor="career_experience" className={styles.textareaLabel}>
              Career experience
            </label>
            <textarea
              id="career_experience"
              name="career_experience"
              value={formData.career_experience}
              onChange={handleChange}
              rows={4}
              className={styles.textarea}
              placeholder="Relevant career history, previous roles, notable projects…"
            />
            <span className={styles.textareaHelper}>Optional.</span>
          </div>
        </FormSection>

        {/* ================================================================
            TESTIMONIAL
            ================================================================ */}
        <FormSection title="Testimonial">
          <div className={styles.textareaWrapper}>
            <label htmlFor="feedback" className={styles.textareaLabel}>
              Alumni feedback about IQuire
            </label>
            <textarea
              id="feedback"
              name="feedback"
              value={formData.feedback}
              onChange={handleChange}
              rows={5}
              className={styles.textarea}
              placeholder="What did they say about their experience with IQuire? Short or long — the card adapts."
            />
            <span className={styles.textareaHelper}>
              Shown as the main quote on the featured card. Short = big text. Long = smaller text.
            </span>
          </div>
        </FormSection>

        {/* ================================================================
            EXTERNAL LINKS
            ================================================================ */}
        <FormSection title="External Links">
          <div className={styles.twoCol}>
            <Input
              label="LinkedIn profile URL"
              name="linkedin_url"
              type="url"
              value={formData.linkedin_url}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
              error={errors.linkedin_url}
            />
            <Input
              label="Trustpilot review URL"
              name="trustpilot_url"
              type="url"
              value={formData.trustpilot_url}
              onChange={handleChange}
              placeholder="https://trustpilot.com/review/..."
              error={errors.trustpilot_url}
            />
          </div>
        </FormSection>

        {/* ================================================================
            VISIBILITY
            ================================================================ */}
        <FormSection title="Visibility">
          <div className={styles.twoCol}>
            <div className={styles.selectWrapper}>
              <label htmlFor="status" className={styles.selectLabel}>
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="draft">Draft — not visible to public</option>
                <option value="published">Published — visible to public</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <Input
              label="Display order"
              name="display_order"
              type="number"
              value={String(formData.display_order)}
              onChange={handleChange}
              helperText="Lower numbers appear first. Use 0 for default."
            />
          </div>

          <div className={styles.checkboxRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>
                <strong>Featured alumni</strong>
                <span>Featured alumni appear in the homepage section.</span>
              </span>
            </label>
          </div>
        </FormSection>

        {/* ================================================================
            Submit
            ================================================================ */}
        {errors.submit && (
          <div className={styles.submitError} role="alert">
            {errors.submit}
          </div>
        )}

        <div className={styles.actions}>
          <Link to="/admin/alumni" className={styles.cancelBtn}>
            Cancel
          </Link>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isEdit
                ? 'Saving…'
                : 'Creating…'
              : isEdit
              ? 'Save Changes'
              : 'Create Alumni'}
          </button>
        </div>
      </form>
    </div>
  );
};