/* eslint-disable @typescript-eslint/no-unused-vars */
// ============================================================================
// iQuire — Admin: Blog Editor (Phase 10E.4)
// ============================================================================

import React, { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Input } from '../../components/common/Input';
import { ImageUploader } from '../../components/common/ImageUploader';
import { FormSection } from '../../components/common/FormSection';
import {
  fetchPostById,
  createPost,
  updatePost,
  fetchCategories,
  uploadBlogImage,
  slugify,
  calculateReadTime,
  type BlogPostWithCategory,
  type BlogCategory,
  type BlogStatus,
} from '../../services/blog.service';
import styles from './BlogForm.module.css';

// ============================================================================
// Form state
// ============================================================================

interface FormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  category_id: string;
  tags: string; // comma-separated
  author_name: string;
  author_role: string;
  author_avatar_url: string;
  status: BlogStatus;
  featured: boolean;
  display_order: number;
}

const initialFormData: FormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featured_image_url: '',
  category_id: '',
  tags: '',
  author_name: '',
  author_role: '',
  author_avatar_url: '',
  status: 'draft',
  featured: false,
  display_order: 0,
};

// ============================================================================
// Component
// ============================================================================

export const AdminBlogForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id) && id !== 'new';

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // Load categories
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const res = await fetchCategories();
      if (!isMounted) return;
      if (res.success && res.data) setCategories(res.data);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // --------------------------------------------------------------------------
  // Load post for edit
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isEdit || !id) return;
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);

      const res = await fetchPostById(id);
      if (!isMounted) return;

      if (!res.success || !res.data) {
        setLoadError(res.error ?? 'Post not found');
        setIsLoading(false);
        return;
      }

      const p = res.data;
      setFormData({
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt ?? '',
        content: p.content ?? '',
        featured_image_url: p.featured_image_url ?? '',
        category_id: p.category_id ?? '',
        tags: p.tags.join(', '),
        author_name: p.author_name ?? '',
        author_role: p.author_role ?? '',
        author_avatar_url: p.author_avatar_url ?? '',
        status: p.status,
        featured: p.featured,
        display_order: p.display_order,
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

    if (error) setError(null);
  };

  const handleGenerateSlug = () => {
    const s = slugify(formData.title);
    setFormData((prev) => ({ ...prev, slug: s }));
  };

  const handleImageChange = (url: string) => {
    setFormData((prev) => ({ ...prev, featured_image_url: url }));
  };

  // Auto-read-time preview
  const autoReadTime = calculateReadTime(formData.content);

  // --------------------------------------------------------------------------
  // Validation
  // --------------------------------------------------------------------------
  const validate = (): string | null => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.slug.trim()) return 'Slug is required (click Generate)';
    if (!formData.excerpt.trim()) return 'Excerpt is required';
    return null;
  };

  // --------------------------------------------------------------------------
  // Submit
  // --------------------------------------------------------------------------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);
    setError(null);

    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      excerpt: formData.excerpt.trim(),
      content: formData.content,
      featured_image_url: formData.featured_image_url || null,
      category_id: formData.category_id || null,
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      author_name: formData.author_name.trim() || null,
      author_role: formData.author_role.trim() || null,
      author_avatar_url: formData.author_avatar_url || null,
      status: formData.status,
      featured: formData.featured,
      read_time_minutes: autoReadTime,
      display_order: formData.display_order,
    };

    const res = isEdit
      ? await updatePost(id!, payload)
      : await createPost(payload);

    setIsSaving(false);

    if (!res.success) {
      setError(res.error ?? 'Save failed');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    navigate('/admin/blog');
  };

  // --------------------------------------------------------------------------
  // Loading
  // --------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading post…</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <p className={styles.errorStateText}>{loadError}</p>
          <Link to="/admin/blog" className={styles.backLink}>
            ← Back to Blog
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
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <Link to="/admin/blog" className={styles.breadcrumb}>
            ← Back to Blog
          </Link>
          <h1 className={styles.pageTitle}>
            {isEdit ? 'Edit Post' : 'New Blog Post'}
          </h1>
          <p className={styles.pageSubtitle}>
            {isEdit
              ? 'Update your article.'
              : 'Create a new blog post to share with your audience.'}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className={styles.errorBanner} role="alert">
          {error}
        </div>
      )}

      {/* Two-column layout: main editor + sidebar */}
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.layout}>
          {/* ==============================================================
              MAIN COLUMN
              ============================================================== */}
          <div className={styles.mainColumn}>
            <FormSection title="Content">
              <Input
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., How to Prepare for Your First Interview"
              />

              <div className={styles.slugRow}>
                <Input
                  label="Slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  placeholder="prepare-first-interview"
                  helperText={`URL: /blog/${formData.slug || 'your-slug'}`}
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
                  Excerpt <span className={styles.requiredMark}>*</span>
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows={3}
                  maxLength={300}
                  className={styles.textarea}
                  placeholder="A one- or two-sentence summary shown on the blog listing."
                />
                <span className={styles.textareaHelper}>
                  {formData.excerpt.length}/300 characters
                </span>
              </div>

              <div className={styles.textareaWrapper}>
                <label className={styles.textareaLabel}>Content</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={20}
                  className={`${styles.textarea} ${styles.contentTextarea}`}
                  placeholder="Write your post here. Supports plain text or Markdown."
                />
                <span className={styles.textareaHelper}>
                  {autoReadTime} min read · {formData.content.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
            </FormSection>

            <FormSection title="Featured Image">
              <ImageUploader
                value={formData.featured_image_url || null}
                onChange={handleImageChange}
                upload={uploadBlogImage}
                label="Cover image"
                aspect="wide"
                maxSizeMB={1}
                helperText="JPEG, PNG, or WebP. Uploads are auto-compressed to ≤ 500 KB."
              />
            </FormSection>
          </div>

          {/* ==============================================================
              SIDEBAR
              ============================================================== */}
          <aside className={styles.sideColumn}>
            {/* Publish */}
            <div className={styles.sideCard}>
              <h3 className={styles.sideCardTitle}>Publish</h3>

              <div className={styles.selectWrapper}>
                <label className={styles.selectLabel}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="draft">Draft — not visible</option>
                  <option value="published">Published — visible</option>
                  <option value="archived">Archived</option>
                </select>
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
                  <span>
                    <strong>Featured post</strong>
                    <span>Highlighted on the blog landing page.</span>
                  </span>
                </label>
              </div>

              <Input
                label="Display order"
                name="display_order"
                type="number"
                value={String(formData.display_order)}
                onChange={handleChange}
                helperText="Lower numbers appear first."
              />

              <div className={styles.sideActions}>
                <Link to="/admin/blog" className={styles.cancelBtn}>
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
                    : 'Create Post'}
                </button>
              </div>
            </div>

            {/* Category & Tags */}
            <div className={styles.sideCard}>
              <h3 className={styles.sideCardTitle}>Organization</h3>

              <div className={styles.selectWrapper}>
                <label className={styles.selectLabel}>Category</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="interview, career, tips"
                helperText="Comma-separated."
              />
            </div>

            {/* Author */}
            <div className={styles.sideCard}>
              <h3 className={styles.sideCardTitle}>Author</h3>

              <Input
                label="Name"
                name="author_name"
                value={formData.author_name}
                onChange={handleChange}
                placeholder="Angel Oparajohnson"
              />

              <Input
                label="Role"
                name="author_role"
                value={formData.author_role}
                onChange={handleChange}
                placeholder="Founder, IQuire"
              />

              <Input
                label="Avatar URL"
                name="author_avatar_url"
                value={formData.author_avatar_url}
                onChange={handleChange}
                placeholder="https://…"
              />
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
};