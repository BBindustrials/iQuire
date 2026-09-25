/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================================
// iQuire — Admin: Course Edit/Create Form (Phase 10D.5)
// ============================================================================

import React, { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Input } from '../../components/common/Input';
import { FormSection } from '../../components/common/FormSection';
import { JsonArrayEditor } from '../../components/admin/JsonArrayEditor';
import {
  fetchCourseById,
  createCourse,
  updateCourse,
  fetchCohortsByCourse,
  createCohort,
  updateCohort,
  deleteCohort,
  createPreviousCohort,
  deletePreviousCohort,
  type Course,
  type CourseInput,
  type CourseWithRelations,
  type Cohort,
  type PreviousCohort,
  type CourseAccent,
  type CourseStatus,
  type CohortStatus,
} from '../../services/courses.service';
import styles from './CourseForm.module.css';

// ============================================================================
// Types
// ============================================================================

type TabKey = 'basics' | 'content' | 'curriculum' | 'cohort' | 'previous' | 'faq';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'basics', label: 'Basics' },
  { key: 'content', label: 'Content' },
  { key: 'curriculum', label: 'Curriculum' },
  { key: 'cohort', label: 'Next Cohort' },
  { key: 'previous', label: 'Previous Cohorts' },
  { key: 'faq', label: 'FAQ' },
];

const ACCENT_OPTIONS: { value: CourseAccent; label: string }[] = [
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'purple', label: 'Purple' },
  { value: 'orange', label: 'Orange' },
];

const STATUS_OPTIONS: { value: CourseStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

// ============================================================================
// Component
// ============================================================================

export const AdminCourseForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id) && id !== 'new';

  const [activeTab, setActiveTab] = useState<TabKey>('basics');
  const [course, setCourse] = useState<CourseWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Cohorts
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [previousCohorts, setPreviousCohorts] = useState<PreviousCohort[]>([]);

  // --------------------------------------------------------------------------
  // Load course for edit
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isEdit || !id) return;
    let isMounted = true;

    const load = async () => {
      const result = await fetchCourseById(id);
      if (!isMounted) return;

      if (!result.success || !result.data) {
        setError(result.error ?? 'Course not found');
        setIsLoading(false);
        return;
      }

      setCourse(result.data);
      setPreviousCohorts(result.data.previous_cohorts);

      const cohortsRes = await fetchCohortsByCourse(id);
      if (isMounted && cohortsRes.success) {
        setCohorts(cohortsRes.data ?? []);
      }

      setIsLoading(false);
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, [id, isEdit]);

  // --------------------------------------------------------------------------
  // Handle course field changes
  // --------------------------------------------------------------------------
  const updateField = <K extends keyof Course>(field: K, value: Course[K]) => {
    if (!course) return;
    setCourse({ ...course, [field]: value });
  };

  // --------------------------------------------------------------------------
  // Save course
  // --------------------------------------------------------------------------
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!course) return;

    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);

    const input: Partial<CourseInput> = {
      slug: course.slug,
      title: course.title,
      tagline: course.tagline,
      description: course.description,
      duration: course.duration,
      format: course.format,
      level: course.level,
      accent: course.accent,
      emoji: course.emoji,
      hero_image_url: course.hero_image_url,
      certificate_included: course.certificate_included,
      status: course.status,
      display_order: course.display_order,
      why_this_program: course.why_this_program,
      challenges: course.challenges,
      what_you_learn: course.what_you_learn,
      week_journey: course.week_journey,
      experience: course.experience,
      outcomes: course.outcomes,
      who_its_for: course.who_its_for,
      prerequisites: course.prerequisites,
      skills_professional: course.skills_professional,
      skills_digital: course.skills_digital,
      skills_career: course.skills_career,
      curriculum: course.curriculum,
      whats_included: course.whats_included,
      pricing: course.pricing,
      faqs: course.faqs,
      final_cta: course.final_cta,
    };

    const result = isEdit
      ? await updateCourse(course.id, input)
      : await createCourse(input as CourseInput);

    setIsSaving(false);

    if (!result.success) {
      setError(result.error ?? 'Save failed');
      return;
    }

    setSuccessMsg('Saved successfully');
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  // --------------------------------------------------------------------------
  // Loading
  // --------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading course…</p>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <p className={styles.errorStateText}>{error}</p>
          <Link to="/admin/courses" className={styles.backLink}>
            ← Back to courses
          </Link>
        </div>
      </div>
    );
  }

  if (!course) return null;

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <Link to="/admin/courses" className={styles.breadcrumb}>
            ← Back to Courses
          </Link>
          <h1 className={styles.pageTitle}>
            {isEdit ? `Edit: ${course.title}` : 'Create Course'}
          </h1>
          <p className={styles.pageSubtitle}>
            Manage course content, cohorts, and FAQ.
          </p>
        </div>
        {isEdit && (
          <a
            href={`/courses/${course.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.viewBtn}
          >
            👁 View Public Page
          </a>
        )}
      </div>

      {/* Tabs */}
      <div className={styles.tabs} role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`${styles.tab} ${
              activeTab === tab.key ? styles.tabActive : ''
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Status messages */}
      {error && (
        <div className={styles.errorBanner} role="alert">
          {error}
        </div>
      )}
      {successMsg && (
        <div className={styles.successBanner} role="status">
          ✓ {successMsg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className={styles.form} noValidate>
        {/* ====================================================================
            TAB: BASICS
            ==================================================================== */}
        {activeTab === 'basics' && (
          <>
            <FormSection title="Course Identity">
              <div className={styles.twoCol}>
                <Input
                  label="Title"
                  name="title"
                  value={course.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  required
                />
                <Input
                  label="Slug"
                  name="slug"
                  value={course.slug}
                  onChange={(e) =>
                    updateField(
                      'slug',
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                    )
                  }
                  required
                  helperText="URL: /courses/{slug}"
                />
              </div>

              <Input
                label="Tagline"
                name="tagline"
                value={course.tagline ?? ''}
                onChange={(e) => updateField('tagline', e.target.value)}
                placeholder="Short italic tagline for the card"
              />

              <div className={styles.textareaWrapper}>
                <label className={styles.textareaLabel}>Description</label>
                <textarea
                  value={course.description ?? ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                  className={styles.textarea}
                  placeholder="One-paragraph summary shown on the course card and hero"
                />
              </div>
            </FormSection>

            <FormSection title="Metadata">
              <div className={styles.threeCol}>
                <Input
                  label="Duration"
                  name="duration"
                  value={course.duration ?? ''}
                  onChange={(e) => updateField('duration', e.target.value)}
                  placeholder="6 weeks"
                />
                <Input
                  label="Format"
                  name="format"
                  value={course.format ?? ''}
                  onChange={(e) => updateField('format', e.target.value)}
                  placeholder="Virtual"
                />
                <Input
                  label="Level"
                  name="level"
                  value={course.level ?? ''}
                  onChange={(e) => updateField('level', e.target.value)}
                  placeholder="Beginner"
                />
              </div>

              <div className={styles.threeCol}>
                <div className={styles.selectWrapper}>
                  <label className={styles.selectLabel}>Accent Color</label>
                  <select
                    value={course.accent ?? 'blue'}
                    onChange={(e) =>
                      updateField('accent', e.target.value as CourseAccent)
                    }
                    className={styles.select}
                  >
                    {ACCENT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Emoji"
                  name="emoji"
                  value={course.emoji ?? ''}
                  onChange={(e) => updateField('emoji', e.target.value)}
                  placeholder="🛠️"
                />
                <Input
                  label="Display Order"
                  name="display_order"
                  type="number"
                  value={String(course.display_order)}
                  onChange={(e) =>
                    updateField('display_order', Number(e.target.value) || 0)
                  }
                />
              </div>
            </FormSection>

            <FormSection title="Hero Image">
              <Input
                label="Hero Image URL"
                name="hero_image_url"
                value={course.hero_image_url ?? ''}
                onChange={(e) => updateField('hero_image_url', e.target.value)}
                placeholder="https://…"
                helperText="Paste an image URL. Uploads coming in a later phase."
              />
              {course.hero_image_url && (
                <div className={styles.heroPreview}>
                  <img src={course.hero_image_url} alt="Preview" />
                </div>
              )}
            </FormSection>

            <FormSection title="Visibility">
              <div className={styles.twoCol}>
                <div className={styles.selectWrapper}>
                  <label className={styles.selectLabel}>Status</label>
                  <select
                    value={course.status}
                    onChange={(e) =>
                      updateField('status', e.target.value as CourseStatus)
                    }
                    className={styles.select}
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.checkboxWrapper}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={course.certificate_included}
                      onChange={(e) =>
                        updateField('certificate_included', e.target.checked)
                      }
                      className={styles.checkbox}
                    />
                    <span>Certificate included</span>
                  </label>
                </div>
              </div>
            </FormSection>
          </>
        )}

        {/* ====================================================================
            TAB: CONTENT
            ==================================================================== */}
        {activeTab === 'content' && (
          <>
            <FormSection title="Why This Programme">
              <div className={styles.textareaWrapper}>
                <label className={styles.textareaLabel}>
                  Intro paragraph
                </label>
                <textarea
                  value={course.why_this_program ?? ''}
                  onChange={(e) => updateField('why_this_program', e.target.value)}
                  rows={3}
                  className={styles.textarea}
                />
              </div>

              <JsonArrayEditor
                label="Challenge cards (title | description)"
                value={course.challenges.map(
                  (c) => `${c.title} | ${c.description}`
                )}
                onChange={(next: any[]) =>
                  updateField(
                    'challenges',
                    next.map((line) => {
                      const [title, ...rest] = line.split('|');
                      return {
                        title: title.trim(),
                        description: rest.join('|').trim(),
                      };
                    })
                  )
                }
                placeholder="e.g., Interview confidence | Anxiety about interviews."
                helperText="Format: Title | Description"
              />
            </FormSection>

            <FormSection title="What You'll Learn">
              <JsonArrayEditor
                label="Modules (number | title | description)"
                value={course.what_you_learn.map(
                  (m) => `${m.number} | ${m.title} | ${m.description ?? ''}`
                )}
                onChange={(next: any[]) =>
                  updateField(
                    'what_you_learn',
                    next.map((line: { split: (arg0: string) => [any, any, ...any[]]; }) => {
                      const [number, title, ...rest] = line.split('|');
                      return {
                        number: number.trim(),
                        title: title.trim(),
                        description: rest.join('|').trim(),
                      };
                    })
                  )
                }
                placeholder="01 | Foundations | Learn the basics."
                helperText="Format: Number | Title | Description"
              />
            </FormSection>

            <FormSection title="Week Journey">
              <JsonArrayEditor
                label="Weeks (week | title)"
                value={course.week_journey.map((w) => `${w.week} | ${w.title}`)}
                onChange={(next: any[]) =>
                  updateField(
                    'week_journey',
                    next.map((line: { split: (arg0: string) => [any, ...any[]]; }) => {
                      const [week, ...rest] = line.split('|');
                      return { week: week.trim(), title: rest.join('|').trim() };
                    })
                  )
                }
                placeholder="Week 1 | Foundations"
                helperText="Format: Week | Title"
              />
            </FormSection>

            <FormSection title="Experience">
              <JsonArrayEditor
                label="What participants experience"
                value={course.experience}
                onChange={(next: string[]) => updateField('experience', next)}
              />
            </FormSection>

            <FormSection title="Outcomes">
              <JsonArrayEditor
                label="What participants walk away with"
                value={course.outcomes}
                onChange={(next: string[]) => updateField('outcomes', next)}
              />
            </FormSection>

            <FormSection title="Who It's For">
              <JsonArrayEditor
                label="Audience"
                value={course.who_its_for}
                onChange={(next: string[]) => updateField('who_its_for', next)}
              />

              <Input
                label="Prerequisites"
                name="prerequisites"
                value={course.prerequisites ?? ''}
                onChange={(e) => updateField('prerequisites', e.target.value)}
                placeholder="No prior experience required."
              />
            </FormSection>

            <FormSection title="Skills You'll Build">
              <JsonArrayEditor
                label="Professional Skills"
                value={course.skills_professional}
                onChange={(next: string[]) => updateField('skills_professional', next)}
              />
              <JsonArrayEditor
                label="Digital Skills"
                value={course.skills_digital}
                onChange={(next: string[]) => updateField('skills_digital', next)}
              />
              <JsonArrayEditor
                label="Career Skills"
                value={course.skills_career}
                onChange={(next: string[]) => updateField('skills_career', next)}
              />
            </FormSection>

            <FormSection title="What's Included">
              <JsonArrayEditor
                label="Inclusions"
                value={course.whats_included}
                onChange={(next: string[]) => updateField('whats_included', next)}
              />
            </FormSection>

            <FormSection title="Pricing">
              <Input
                label="Fee"
                name="pricing.fee"
                value={course.pricing.fee}
                onChange={(e) =>
                  updateField('pricing', {
                    ...course.pricing,
                    fee: e.target.value,
                  })
                }
                placeholder="₦45,000"
              />

              <JsonArrayEditor
                label="What's included in the fee"
                value={course.pricing.includes}
                onChange={(next: any) =>
                  updateField('pricing', {
                    ...course.pricing,
                    includes: next,
                  })
                }
              />

              <Input
                label="Payment options"
                name="pricing.paymentOptions"
                value={course.pricing.paymentOptions ?? ''}
                onChange={(e) =>
                  updateField('pricing', {
                    ...course.pricing,
                    paymentOptions: e.target.value,
                  })
                }
                placeholder="Full payment or 2-installment plan."
              />

              <Input
                label="Financial support"
                name="pricing.financialSupport"
                value={course.pricing.financialSupport ?? ''}
                onChange={(e) =>
                  updateField('pricing', {
                    ...course.pricing,
                    financialSupport: e.target.value,
                  })
                }
                placeholder="Scholarship available for eligible applicants."
              />
            </FormSection>

            <FormSection title="Final CTA">
              <Input
                label="Headline"
                name="final_cta.headline"
                value={course.final_cta?.headline ?? ''}
                onChange={(e) =>
                  updateField('final_cta', {
                    headline: e.target.value,
                    subheadline: course.final_cta?.subheadline ?? '',
                  })
                }
              />

              <div className={styles.textareaWrapper}>
                <label className={styles.textareaLabel}>Subheadline</label>
                <textarea
                  value={course.final_cta?.subheadline ?? ''}
                  onChange={(e) =>
                    updateField('final_cta', {
                      headline: course.final_cta?.headline ?? '',
                      subheadline: e.target.value,
                    })
                  }
                  rows={2}
                  className={styles.textarea}
                />
              </div>
            </FormSection>
          </>
        )}

        {/* ====================================================================
            TAB: CURRICULUM
            ==================================================================== */}
        {activeTab === 'curriculum' && (
          <FormSection title="Curriculum (Accordion)">
            <JsonArrayEditor
              label="Modules (number | title | description)"
              value={course.curriculum.map(
                (m) => `${m.number} | ${m.title} | ${m.description ?? ''}`
              )}
              onChange={(next: any[]) =>
                updateField(
                  'curriculum',
                  next.map((line: { split: (arg0: string) => [any, any, ...any[]]; }) => {
                    const [number, title, ...rest] = line.split('|');
                    return {
                      number: number.trim(),
                      title: title.trim(),
                      description: rest.join('|').trim(),
                    };
                  })
                )
              }
              placeholder="01 | Understanding Apprenticeships"
              helperText="Format: Number | Title | Description (description optional)"
            />
          </FormSection>
        )}

        {/* ====================================================================
            TAB: NEXT COHORT
            ==================================================================== */}
        {activeTab === 'cohort' && (
          <CohortTab
            courseId={course.id}
            cohorts={cohorts}
            setCohorts={setCohorts}
            onError={setError}
          />
        )}

        {/* ====================================================================
            TAB: PREVIOUS COHORTS
            ==================================================================== */}
        {activeTab === 'previous' && (
          <PreviousCohortsTab
            courseId={course.id}
            previousCohorts={previousCohorts}
            setPreviousCohorts={setPreviousCohorts}
            onError={setError}
          />
        )}

        {/* ====================================================================
            TAB: FAQ
            ==================================================================== */}
        {activeTab === 'faq' && (
          <FormSection title="Frequently Asked Questions">
            <JsonArrayEditor
              label="FAQs (question | answer)"
              value={course.faqs.map((f) => `${f.question} | ${f.answer}`)}
              onChange={(next: any[]) =>
                updateField(
                  'faqs',
                  next.map((line: { split: (arg0: string) => [any, ...any[]]; }, i: number) => {
                    const [question, ...rest] = line.split('|');
                    return {
                      id: `f${i + 1}`,
                      question: question.trim(),
                      answer: rest.join('|').trim(),
                    };
                  })
                )
              }
              placeholder="Who can apply? | Anyone 18+."
              helperText="Format: Question | Answer"
            />
          </FormSection>
        )}

        {/* ====================================================================
            Save bar
            ==================================================================== */}
        {activeTab !== 'cohort' && activeTab !== 'previous' && (
          <div className={styles.actions}>
            <Link to="/admin/courses" className={styles.cancelBtn}>
              Cancel
            </Link>
            <button type="submit" className={styles.submitBtn} disabled={isSaving}>
              {isSaving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

// ============================================================================
// Sub-tab: Cohort (next cohort)
// ============================================================================

interface CohortTabProps {
  courseId: string;
  cohorts: Cohort[];
  setCohorts: (next: Cohort[]) => void;
  onError: (msg: string) => void;
}

const EMPTY_COHORT_FORM: Partial<Cohort> = {
  name: '',
  start_date: '',
  end_date: '',
  schedule: '',
  format: 'Virtual',
  fee: '',
  capacity: null,
  spots_left: null,
  status: 'open',
  is_next: true,
};

const CohortTab: React.FC<CohortTabProps> = ({
  courseId,
  cohorts,
  setCohorts,
  onError,
}) => {
  const nextCohort = cohorts.find((c) => c.is_next) ?? null;
  const [form, setForm] = useState<Partial<Cohort>>(
    nextCohort ?? EMPTY_COHORT_FORM
  );
  const [isSaving, setIsSaving] = useState(false);

  // Sync the form when the *identity* of the next cohort changes.
  // Keyed on nextCohort?.id so editing fields doesn't wipe the form.
  useEffect(() => {
    setForm(nextCohort ?? EMPTY_COHORT_FORM);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextCohort?.id]);

  const setField = <K extends keyof Cohort>(field: K, value: Cohort[K]) =>
    setForm((prev: Partial<Cohort>) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.name?.trim()) {
      onError('Cohort name is required');
      return;
    }

    setIsSaving(true);

    if (nextCohort) {
      const res = await updateCohort(nextCohort.id, {
        ...form,
        course_id: courseId,
      });
      setIsSaving(false);
      if (!res.success || !res.data)
        return onError(res.error ?? 'Failed to update cohort');
      setCohorts(cohorts.map((c) => (c.id === nextCohort.id ? res.data! : c)));
    } else {
      const res = await createCohort({
        ...form,
        course_id: courseId,
        is_next: true,
      } as any);
      setIsSaving(false);
      if (!res.success || !res.data)
        return onError(res.error ?? 'Failed to create cohort');
      setCohorts([...cohorts, res.data]);
    }
  };

  const handleDelete = async () => {
    if (!nextCohort) return;
    const res = await deleteCohort(nextCohort.id);
    if (!res.success) return onError(res.error ?? 'Failed to delete cohort');
    setCohorts(cohorts.filter((c) => c.id !== nextCohort.id));
    setForm(EMPTY_COHORT_FORM);
  };

  return (
    <div className={styles.cohortTab}>
      <div className={styles.cohortHeader}>
        <div>
          <h3 className={styles.cohortTitle}>
            {nextCohort ? `Next Cohort: ${nextCohort.name}` : 'Set Next Cohort'}
          </h3>
          <p className={styles.cohortSubtitle}>
            The "next cohort" appears on the public course page with dates, fee, and Apply CTA.
          </p>
        </div>
        {nextCohort && (
          <button
            type="button"
            className={styles.deleteCohortBtn}
            onClick={handleDelete}
          >
            🗑 Remove
          </button>
        )}
      </div>

      <div className={styles.twoCol}>
        <Input
          label="Cohort name"
          value={form.name ?? ''}
          onChange={(e) => setField('name', e.target.value)}
          placeholder="e.g., Cohort 5"
          required
        />
        <div className={styles.selectWrapper}>
          <label className={styles.selectLabel}>Status</label>
          <select
            value={form.status ?? 'open'}
            onChange={(e) => setField('status', e.target.value as CohortStatus)}
            className={styles.select}
          >
            <option value="open">Open — accepting applications</option>
            <option value="closed">Closed</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className={styles.twoCol}>
        <Input
          label="Start date"
          type="date"
          value={form.start_date ?? ''}
          onChange={(e) => setField('start_date', e.target.value)}
        />
        <Input
          label="End date"
          type="date"
          value={form.end_date ?? ''}
          onChange={(e) => setField('end_date', e.target.value)}
        />
      </div>

      <div className={styles.twoCol}>
        <Input
          label="Schedule"
          value={form.schedule ?? ''}
          onChange={(e) => setField('schedule', e.target.value)}
          placeholder="Mon & Wed · 6:00pm – 8:00pm"
        />
        <Input
          label="Format"
          value={form.format ?? ''}
          onChange={(e) => setField('format', e.target.value)}
          placeholder="Virtual"
        />
      </div>

      <div className={styles.threeCol}>
        <Input
          label="Fee"
          value={form.fee ?? ''}
          onChange={(e) => setField('fee', e.target.value)}
          placeholder="₦45,000"
        />
        <Input
          label="Capacity"
          type="number"
          value={String(form.capacity ?? '')}
          onChange={(e) =>
            setField('capacity', e.target.value ? Number(e.target.value) : null)
          }
          placeholder="40"
        />
        <Input
          label="Spots left"
          type="number"
          value={String(form.spots_left ?? '')}
          onChange={(e) =>
            setField('spots_left', e.target.value ? Number(e.target.value) : null)
          }
          placeholder="12"
        />
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.submitBtn}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving
            ? 'Saving…'
            : nextCohort
            ? 'Save Cohort Changes'
            : 'Create Next Cohort'}
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Sub-tab: Previous Cohorts
// ============================================================================

interface PreviousCohortsTabProps {
  courseId: string;
  previousCohorts: PreviousCohort[];
  setPreviousCohorts: (next: PreviousCohort[]) => void;
  onError: (msg: string) => void;
}

interface PreviousCohortDraft {
  name: string;
  date_range: string;
  format: string;
  participants: string;
  outcome: string;
  display_order: number;
}

const EMPTY_PREVIOUS_DRAFT: PreviousCohortDraft = {
  name: '',
  date_range: '',
  format: 'Virtual',
  participants: '',
  outcome: '',
  display_order: 0,
};

const PreviousCohortsTab: React.FC<PreviousCohortsTabProps> = ({
  courseId,
  previousCohorts,
  setPreviousCohorts,
  onError,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState<PreviousCohortDraft>(EMPTY_PREVIOUS_DRAFT);

  const handleAdd = async () => {
    if (!draft.name.trim() || !draft.date_range.trim()) {
      onError('Name and date range are required');
      return;
    }

    const res = await createPreviousCohort({
      course_id: courseId,
      name: draft.name.trim(),
      date_range: draft.date_range.trim(),
      format: draft.format || null,
      participants: draft.participants ? Number(draft.participants) : null,
      outcome: draft.outcome || null,
      display_order: draft.display_order,
    } as any);

    if (!res.success || !res.data) {
      onError(res.error ?? 'Failed to add cohort');
      return;
    }

    setPreviousCohorts(
      [...previousCohorts, res.data].sort(
        (a, b) => a.display_order - b.display_order
      )
    );
    setDraft(EMPTY_PREVIOUS_DRAFT);
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    const res = await deletePreviousCohort(id);
    if (!res.success) {
      onError(res.error ?? 'Failed to delete');
      return;
    }
    setPreviousCohorts(previousCohorts.filter((c) => c.id !== id));
  };

  return (
    <div className={styles.previousTab}>
      <div className={styles.cohortHeader}>
        <div>
          <h3 className={styles.cohortTitle}>Previous Cohorts</h3>
          <p className={styles.cohortSubtitle}>
            Shown on the course page as "programme history" — proof that this course has run before.
          </p>
        </div>
        {!isAdding && (
          <button
            type="button"
            className={styles.addCohortBtn}
            onClick={() => setIsAdding(true)}
          >
            + Add Cohort
          </button>
        )}
      </div>

      {previousCohorts.length === 0 && !isAdding && (
        <p className={styles.emptyCohorts}>
          No previous cohorts yet. Add one to show programme history.
        </p>
      )}

      {previousCohorts.map((pc) => (
        <div key={pc.id} className={styles.previousRow}>
          <div className={styles.previousInfo}>
            <strong>{pc.name}</strong>
            <span>{pc.date_range}</span>
            {pc.format && <span>· {pc.format}</span>}
            {pc.participants !== null && (
              <span>· {pc.participants} participants</span>
            )}
          </div>
          {pc.outcome && <p className={styles.previousOutcome}>{pc.outcome}</p>}
          <button
            type="button"
            className={styles.deleteRowBtn}
            onClick={() => handleDelete(pc.id)}
            aria-label="Remove"
          >
            ×
          </button>
        </div>
      ))}

      {isAdding && (
        <div className={styles.addCohortForm}>
          <div className={styles.twoCol}>
            <Input
              label="Name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Cohort 4"
            />
            <Input
              label="Date range"
              value={draft.date_range}
              onChange={(e) =>
                setDraft({ ...draft, date_range: e.target.value })
              }
              placeholder="Jan – Feb 2026"
            />
          </div>
          <div className={styles.threeCol}>
            <Input
              label="Format"
              value={draft.format}
              onChange={(e) => setDraft({ ...draft, format: e.target.value })}
            />
            <Input
              label="Participants"
              type="number"
              value={draft.participants}
              onChange={(e) =>
                setDraft({ ...draft, participants: e.target.value })
              }
            />
            <Input
              label="Display order"
              type="number"
              value={String(draft.display_order)}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  display_order: Number(e.target.value) || 0,
                })
              }
            />
          </div>
          <Input
            label="Outcome (optional)"
            value={draft.outcome}
            onChange={(e) => setDraft({ ...draft, outcome: e.target.value })}
            placeholder="82% completed with a portfolio project"
          />

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.submitBtn}
              onClick={handleAdd}
            >
              Add Cohort
            </button>
          </div>
        </div>
      )}
    </div>
  );
};