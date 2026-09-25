// ============================================================================
// iQuire — Admin: Blog List (Phase 10E.3)
// ============================================================================

import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchAllPosts,
  fetchCategories,
  deletePost,
  updatePost,
  formatBlogDate,
  type BlogPostWithCategory,
  type BlogCategory,
  type BlogStatus,
} from '../../services/blog.service';
import styles from './Blog.module.css';

// ============================================================================
// Component
// ============================================================================

export const AdminBlog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPostWithCategory[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BlogStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Delete confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // Load
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      const [postsRes, catsRes] = await Promise.all([
        fetchAllPosts(),
        fetchCategories(),
      ]);

      if (!isMounted) return;

      if (!postsRes.success) {
        setError(postsRes.error ?? 'Failed to load posts');
      } else {
        setPosts(postsRes.data ?? []);
      }

      if (catsRes.success) setCategories(catsRes.data ?? []);

      setIsLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // --------------------------------------------------------------------------
  // Filter
  // --------------------------------------------------------------------------
  const filtered = useMemo(() => {
    let list = [...posts];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt?.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter((p) => p.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      list = list.filter((p) => p.category_id === categoryFilter);
    }

    return list;
  }, [posts, search, statusFilter, categoryFilter]);

  // --------------------------------------------------------------------------
  // Actions
  // --------------------------------------------------------------------------
  const handleToggleStatus = async (post: BlogPostWithCategory) => {
    const nextStatus: BlogStatus =
      post.status === 'published' ? 'draft' : 'published';

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, status: nextStatus } : p))
    );

    const res = await updatePost(post.id, { status: nextStatus });
    if (!res.success) {
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, status: post.status } : p))
      );
      setError(res.error ?? 'Failed to update post');
    }
  };

  const handleToggleFeatured = async (post: BlogPostWithCategory) => {
    const nextFeatured = !post.featured;
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, featured: nextFeatured } : p))
    );

    const res = await updatePost(post.id, { featured: nextFeatured });
    if (!res.success) {
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, featured: post.featured } : p))
      );
      setError(res.error ?? 'Failed to update post');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deletePost(id);
    if (!res.success) {
      setError(res.error ?? 'Failed to delete post');
      setDeleteConfirmId(null);
      return;
    }
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirmId(null);
  };

  // --------------------------------------------------------------------------
  // Stats
  // --------------------------------------------------------------------------
  const stats = useMemo(
    () => ({
      total: posts.length,
      published: posts.filter((p) => p.status === 'published').length,
      draft: posts.filter((p) => p.status === 'draft').length,
      featured: posts.filter((p) => p.featured).length,
    }),
    [posts]
  );

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Blog</h1>
          <p className={styles.pageSubtitle}>
            Manage articles, publish updates, and share insights.
          </p>
        </div>
        <Link to="/admin/blog/new" className={styles.addButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          New Post
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className={styles.errorBanner} role="alert">
          <span>{error}</span>
          <button
            type="button"
            className={styles.errorClose}
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Stats */}
      <div className={styles.statsRow}>
        <StatPill label="Total" value={stats.total} accent="blue" />
        <StatPill label="Published" value={stats.published} accent="green" />
        <StatPill label="Drafts" value={stats.draft} accent="gray" />
        <StatPill label="Featured" value={stats.featured} accent="gold" />
      </div>

      {/* Filters */}
      <div className={styles.filtersRow}>
        <div className={styles.searchBox}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search posts by title, tag, or excerpt…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | BlogStatus)}
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>

        <select
          className={styles.filterSelect}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className={styles.grid}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasPosts={posts.length > 0} />
      ) : (
        <div className={styles.grid}>
          {filtered.map((post) => (
            <article key={post.id} className={styles.card}>
              {/* Image */}
              <div className={styles.cardImage}>
                {post.featured_image_url ? (
                  <img
                    src={post.featured_image_url}
                    alt={post.title}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.cardImagePlaceholder}>📝</div>
                )}

                <span
                  className={`${styles.statusBadge} ${styles[`status-${post.status}`]}`}
                >
                  {post.status}
                </span>

                {post.featured && (
                  <span className={styles.featuredStar} title="Featured">
                    ★
                  </span>
                )}
              </div>

              {/* Body */}
              <div className={styles.cardBody}>
                <div className={styles.cardMeta}>
                  {post.category && (
                    <span className={styles.categoryBadge}>
                      {post.category.name}
                    </span>
                  )}
                  {post.published_at && (
                    <span className={styles.dateText}>
                      {formatBlogDate(post.published_at)}
                    </span>
                  )}
                </div>

                <h3 className={styles.cardTitle}>{post.title}</h3>

                {post.excerpt && (
                  <p className={styles.cardExcerpt}>{post.excerpt}</p>
                )}

                <div className={styles.cardFooter}>
                  {post.read_time_minutes && (
                    <span className={styles.readTime}>
                      ⏱ {post.read_time_minutes} min read
                    </span>
                  )}
                  {post.tags.length > 0 && (
                    <div className={styles.tagRow}>
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className={styles.cardActions}>
                <Link
                  to={`/admin/blog/${post.id}`}
                  className={styles.actionBtn}
                  title="Edit post"
                >
                  ✏️ Edit
                </Link>

                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => handleToggleFeatured(post)}
                  title="Toggle featured"
                >
                  {post.featured ? '★ Unfeature' : '☆ Feature'}
                </button>

                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => handleToggleStatus(post)}
                  title="Toggle publish/draft"
                >
                  {post.status === 'published' ? '⏸ Unpublish' : '▶ Publish'}
                </button>

                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionBtn}
                  title="View public page"
                >
                  👁 View
                </a>

                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.actionDanger}`}
                  onClick={() => setDeleteConfirmId(post.id)}
                  title="Delete post"
                >
                  🗑
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirmId && (
        <div
          className={styles.modalOverlay}
          onClick={() => setDeleteConfirmId(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Delete this post?</h3>
            <p className={styles.modalText}>
              This will permanently remove the post and its image. This cannot
              be undone.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalConfirm}
                onClick={() => handleDelete(deleteConfirmId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Sub-components
// ============================================================================

interface StatPillProps {
  label: string;
  value: number;
  accent: 'blue' | 'green' | 'gold' | 'gray';
}

const StatPill: React.FC<StatPillProps> = ({ label, value, accent }) => (
  <div className={`${styles.statPill} ${styles[`stat-${accent}`]}`}>
    <span className={styles.statValue}>{value}</span>
    <span className={styles.statLabel}>{label}</span>
  </div>
);

const EmptyState: React.FC<{ hasPosts: boolean }> = ({ hasPosts }) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>📝</div>
    <h3 className={styles.emptyTitle}>
      {hasPosts ? 'No posts match your filters' : 'No posts yet'}
    </h3>
    <p className={styles.emptyText}>
      {hasPosts
        ? 'Try adjusting your search or filters.'
        : 'Write your first blog post to share insights with your audience.'}
    </p>
    {!hasPosts && (
      <Link to="/admin/blog/new" className={styles.emptyCta}>
        + New Post
      </Link>
    )}
  </div>
);