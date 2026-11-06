/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================================
// iQuire — Admin: Content Modal Forms (Phase 17.11 - Opportunities Added)
// ============================================================================

import React, { useState, useEffect } from 'react';
import styles from './ContentModal.module.css';

// Added 'opportunities' to the type
export type ContentType = 
  | 'sessions' 
  | 'lessons' 
  | 'materials' 
  | 'assignments' 
  | 'resources' 
  | 'opportunities';

interface ContentModalProps {
  type: ContentType;
  cohortId: string;
  courseId: string;
  editingItem?: any | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export const ContentModal: React.FC<ContentModalProps> = ({
  type,
  cohortId,
  courseId,
  editingItem,
  onClose,
  onSave,
}) => {
  const isEditing = !!editingItem;
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Initialize form
  useEffect(() => {
    if (editingItem) {
      const formatted = { ...editingItem };
      if (formatted.session_date) {
        formatted.session_date = new Date(formatted.session_date).toISOString().slice(0, 16);
      }
      if (formatted.due_date) {
        formatted.due_date = new Date(formatted.due_date).toISOString().slice(0, 16);
      }
      if (formatted.deadline) {
        formatted.deadline = new Date(formatted.deadline).toISOString().slice(0, 16);
      }
      setFormData(formatted);
    } else {
      const defaults: any = {
        cohort_id: cohortId,
        course_id: courseId,
        display_order: 0,
      };

      // Only add published if the table supports it
      if (['lessons', 'materials', 'assignments', 'resources', 'opportunities'].includes(type)) {
        defaults.published = true;
      }

      if (type === 'sessions') {
        defaults.duration_minutes = 90;
        defaults.status = 'scheduled';
        defaults.session_date = new Date().toISOString().slice(0, 16);
      }
      if (type === 'lessons') defaults.content_type = 'video';
      if (type === 'materials') defaults.material_type = 'pdf';
      if (type === 'assignments') defaults.submission_type = 'link';
      if (type === 'resources') {
        defaults.type = 'guide';
        defaults.icon = '📄';
        defaults.category = 'General';
      }
      if (type === 'opportunities') {
        defaults.type = 'job';
        defaults.location = 'Remote';
        defaults.experience_level = 'entry';
      }

      setFormData(defaults);
    }
  }, [type, cohortId, courseId, editingItem]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type: inputType, checked } = e.target as HTMLInputElement;
    let finalValue: any = value;
    if (inputType === 'checkbox') finalValue = checked;
    if (inputType === 'number') finalValue = Number(value);
    setFormData((prev: any) => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save. Please try again.');
      setIsSaving(false);
    }
  };

  // Title Helper
  const getSingular = (t: string) => {
    if (t === 'resources') return 'Resource';
    if (t === 'opportunities') return 'Opportunity';
    return t.slice(0, -1).charAt(0).toUpperCase() + t.slice(1, -1);
  };
  const title = isEditing ? `Edit ${getSingular(type)}` : `Add New ${getSingular(type)}`;

  // ==========================================================================
  // Render Forms
  // ==========================================================================

  const renderForm = () => {
    switch (type) {
      case 'sessions':
        return (
          <>
            <div className={styles.formRowFull}>
              <label>Session Title *</label>
              <input name="title" value={formData.title || ''} onChange={handleChange} required placeholder="e.g. Week 1: Introduction" />
            </div>
            <div className={styles.formRowFull}>
              <label>Description</label>
              <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} placeholder="What will be covered..." />
            </div>
            <div className={styles.formRow}>
              <label>Date & Time *</label>
              <input type="datetime-local" name="session_date" value={formData.session_date || ''} onChange={handleChange} required />
            </div>
            <div className={styles.formRow}>
              <label>Duration (minutes)</label>
              <input type="number" name="duration_minutes" value={formData.duration_minutes || 90} onChange={handleChange} />
            </div>
            <div className={styles.formRowFull}>
              <label>Meeting URL (Google Meet, Zoom)</label>
              <input name="meeting_url" value={formData.meeting_url || ''} onChange={handleChange} placeholder="https://meet.google.com/..." />
            </div>
            <div className={styles.formRowFull}>
              <label>Recording URL (if past)</label>
              <input name="recording_url" value={formData.recording_url || ''} onChange={handleChange} placeholder="https://youtube.com/..." />
            </div>
            <div className={styles.formRow}>
              <label>Status</label>
              <select name="status" value={formData.status || 'scheduled'} onChange={handleChange}>
                <option value="scheduled">Scheduled</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </>
        );

      case 'lessons':
        return (
          <>
            <div className={styles.formRowFull}>
              <label>Lesson Title *</label>
              <input name="title" value={formData.title || ''} onChange={handleChange} required placeholder="e.g. Understanding the basics" />
            </div>
            <div className={styles.formRowFull}>
              <label>Description</label>
              <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={2} />
            </div>
            <div className={styles.formRow}>
              <label>Content Type</label>
              <select name="content_type" value={formData.content_type || 'video'} onChange={handleChange}>
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
                <option value="text">Text</option>
                <option value="link">Link</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            <div className={styles.formRow}>
              <label>Module Number</label>
              <input type="number" name="module_number" value={formData.module_number || ''} onChange={handleChange} placeholder="e.g. 1" />
            </div>
            <div className={styles.formRowFull}>
              <label>Video URL</label>
              <input name="video_url" value={formData.video_url || ''} onChange={handleChange} placeholder="https://..." />
            </div>
            <div className={styles.formRowFull}>
              <label>PDF URL</label>
              <input name="pdf_url" value={formData.pdf_url || ''} onChange={handleChange} placeholder="https://..." />
            </div>
            <div className={styles.formRowFull}>
              <label>Text Content</label>
              <textarea name="body" value={formData.body || ''} onChange={handleChange} rows={4} placeholder="Write lesson content here..." />
            </div>
          </>
        );

      case 'materials':
        return (
          <>
            <div className={styles.formRowFull}>
              <label>Material Title *</label>
              <input name="title" value={formData.title || ''} onChange={handleChange} required placeholder="e.g. Course Syllabus" />
            </div>
            <div className={styles.formRowFull}>
              <label>Description</label>
              <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={2} />
            </div>
            <div className={styles.formRow}>
              <label>Type</label>
              <select name="material_type" value={formData.material_type || 'pdf'} onChange={handleChange}>
                <option value="pdf">PDF</option>
                <option value="doc">Document</option>
                <option value="link">Link</option>
                <option value="video">Video</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className={styles.formRow}>
              <label>Display Order</label>
              <input type="number" name="display_order" value={formData.display_order || 0} onChange={handleChange} />
            </div>
            <div className={styles.formRowFull}>
              <label>File URL (if uploaded)</label>
              <input name="file_url" value={formData.file_url || ''} onChange={handleChange} placeholder="https://..." />
            </div>
            <div className={styles.formRowFull}>
              <label>External URL (if link)</label>
              <input name="external_url" value={formData.external_url || ''} onChange={handleChange} placeholder="https://..." />
            </div>
          </>
        );

      case 'assignments':
        return (
          <>
            <div className={styles.formRowFull}>
              <label>Assignment Title *</label>
              <input name="title" value={formData.title || ''} onChange={handleChange} required placeholder="e.g. Final Project Proposal" />
            </div>
            <div className={styles.formRowFull}>
              <label>Description</label>
              <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={2} />
            </div>
            <div className={styles.formRowFull}>
              <label>Instructions</label>
              <textarea name="instructions" value={formData.instructions || ''} onChange={handleChange} rows={4} placeholder="What exactly should the student do?" />
            </div>
            <div className={styles.formRow}>
              <label>Submission Type</label>
              <select name="submission_type" value={formData.submission_type || 'link'} onChange={handleChange}>
                <option value="link">Link (Google Drive, etc.)</option>
                <option value="text">Text Entry</option>
                <option value="file">File Upload</option>
              </select>
            </div>
            <div className={styles.formRow}>
              <label>Due Date</label>
              <input type="datetime-local" name="due_date" value={formData.due_date || ''} onChange={handleChange} />
            </div>
            <div className={styles.formRow}>
              <label>Max Score (optional)</label>
              <input type="number" name="max_score" value={formData.max_score || ''} onChange={handleChange} placeholder="e.g. 100" />
            </div>
          </>
        );

      case 'resources':
        return (
          <>
            <div className={styles.formRowFull}>
              <label>Resource Title *</label>
              <input name="title" value={formData.title || ''} onChange={handleChange} required placeholder="e.g. Professional CV Template" />
            </div>
            <div className={styles.formRowFull}>
              <label>Description</label>
              <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} placeholder="Brief description of the resource..." />
            </div>
            <div className={styles.formRow}>
              <label>Resource Type</label>
              <select name="type" value={formData.type || 'guide'} onChange={handleChange}>
                <option value="template">Template</option>
                <option value="guide">Guide</option>
                <option value="video">Video</option>
                <option value="external">External Link</option>
              </select>
            </div>
            <div className={styles.formRow}>
              <label>Category</label>
              <select name="category" value={formData.category || 'General'} onChange={handleChange}>
                <option value="General">General</option>
                <option value="CV & Applications">CV & Applications</option>
                <option value="Interview Preparation">Interview Preparation</option>
                <option value="Career Exploration">Career Exploration</option>
                <option value="Digital Skills">Digital Skills</option>
                <option value="External Opportunities">External Opportunities</option>
              </select>
            </div>
            <div className={styles.formRow}>
              <label>Icon (Emoji)</label>
              <input name="icon" value={formData.icon || '📄'} onChange={handleChange} placeholder="e.g. 📄" />
            </div>
            <div className={styles.formRowFull}>
              <label>URL (optional)</label>
              <input name="url" value={formData.url || ''} onChange={handleChange} placeholder="https://..." />
            </div>
          </>
        );

      // NEW CASE: OPPORTUNITIES
      case 'opportunities':
        return (
          <>
            <div className={styles.formRowFull}>
              <label>Job Title *</label>
              <input name="title" value={formData.title || ''} onChange={handleChange} required placeholder="e.g. Junior Product Manager" />
            </div>
            <div className={styles.formRowFull}>
              <label>Company Name *</label>
              <input name="company" value={formData.company || ''} onChange={handleChange} required placeholder="e.g. Tech Corp" />
            </div>
            <div className={styles.formRowFull}>
              <label>Description *</label>
              <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} required placeholder="Describe the role..." />
            </div>
            <div className={styles.formRow}>
              <label>Type</label>
              <select name="type" value={formData.type || 'job'} onChange={handleChange}>
                <option value="job">Full-time Job</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
                <option value="apprenticeship">Apprenticeship</option>
                <option value="volunteer">Volunteer</option>
              </select>
            </div>
            <div className={styles.formRow}>
              <label>Experience Level</label>
              <select name="experience_level" value={formData.experience_level || 'entry'} onChange={handleChange}>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
              </select>
            </div>
            <div className={styles.formRow}>
              <label>Location *</label>
              <input name="location" value={formData.location || ''} onChange={handleChange} required placeholder="e.g. Remote / Lagos" />
            </div>
            <div className={styles.formRow}>
              <label>Salary Range</label>
              <input name="salary_range" value={formData.salary_range || ''} onChange={handleChange} placeholder="e.g. ₦150k - ₦200k" />
            </div>
            <div className={styles.formRowFull}>
              <label>Skills Required (comma separated)</label>
              <input 
                name="skills_required" 
                value={Array.isArray(formData.skills_required) ? formData.skills_required.join(', ') : formData.skills_required || ''} 
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev: any) => ({ ...prev, skills_required: val.split(',').map(s => s.trim()).filter(Boolean) }));
                }} 
                placeholder="e.g. Communication, Excel, Figma" 
              />
            </div>
            <div className={styles.formRowFull}>
              <label>Apply URL *</label>
              <input name="apply_url" value={formData.apply_url || ''} onChange={handleChange} required placeholder="https://..." />
            </div>
            <div className={styles.formRow}>
              <label>Application Deadline</label>
              <input type="datetime-local" name="deadline" value={formData.deadline || ''} onChange={handleChange} />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formBody}>
            {renderForm()}
            
            {/* Published toggle */}
            {['lessons', 'materials', 'assignments', 'resources', 'opportunities'].includes(type) && (
              <div className={styles.formRowFull} style={{ marginTop: '0.5rem' }}>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    name="published" 
                    checked={formData.published || false} 
                    onChange={handleChange} 
                  />
                  Publish immediately (visible to students)
                </label>
              </div>
            )}
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={isSaving}>
              {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};