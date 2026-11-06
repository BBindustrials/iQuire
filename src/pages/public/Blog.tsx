// ============================================================================
// iQuire — Public Blog Listing (Phase 14.13.7)
// ============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchPublishedPosts,
  fetchCategories,
  formatBlogDate,
  resolvePostAuthor,
  type BlogPostWithCategory,
  type BlogCategory,
  type ResolvedAuthor,
} from '../../services/blog.service';
import styles from './Blog.module.css';

// ============================================================================
// Component
// ============================================================================

export const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPostWithCategory[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // --------------------------------------------------------------------------
  // Load
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      const [postsRes, catsRes] = await Promise.all([
        fetchPublishedPosts(),
        fetchCategories(),
      ]);

      if (!isMounted) return;

      if (!postsRes.success) {
        setError(postsRes.error ?? 'Failed to load posts');
        setIsLoading(false);
        return;
      }

      setPosts(postsRes.data ?? []);
      if (catsRes.success) setCategories(catsRes.data ?? []);
      setIsLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // --------------------------------------------------------------------------
  // Featured post = first featured in list, else most recent
  // --------------------------------------------------------------------------
  const featuredPost = useMemo(() => {
    const featured = posts.find((p) => p.featured);
    return featured ?? (posts.length > 0 ? posts[0] : null);
  }, [posts]);

  // --------------------------------------------------------------------------
  // Filtered posts (exclude featured from grid)
  // --------------------------------------------------------------------------
  const filteredPosts = useMemo(() => {
    let list = [...posts];

    if (featuredPost) {
      list = list.filter((p) => p.id !== featuredPost.id);
    }

    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category_id === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt?.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.category?.name.toLowerCase().includes(q)
      );
    }

    return list;
  }, [posts, featuredPost, activeCategory, search]);

  const hasActiveFilters = search.trim() !== '' || activeCategory !== 'all';

  const isFeaturedVisible =
    !!featuredPost && activeCategory === 'all' && !search.trim();

  const clearFilters = () => {
    setSearch('');
    setActiveCategory('all');
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.blogPage}>
      {/* HERO (Netted Blue) */}
      <section className={styles.hero}>
        <svg className={styles.netGrid} aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900">
          <defs>
            <pattern id="blogHeroNet" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#000000" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blogHeroNet)" />
        </svg>

        <div className={styles.heroBgBlobOne} aria-hidden="true" />
        <div className={styles.heroBgBlobTwo} aria-hidden="true" />

        <div className="container">
          <div className={`${styles.heroContent} ${styles.slideUpText}`}>
            <span className={styles.badge}>Insights</span>
            <h1 className={styles.heroTitle}>
              Insights for the{' '}
              <span className={styles.highlight}>
                modern African workforce.
              </span>
            </h1>
            <p className={styles.heroSubtitle}>
              Career tips, employability insights, industry trends, AI
              developments, and stories from the iQuire community.
            </p>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className={styles.contentSection}>
        <div className="container">
          {isLoading ? (
            <div className={styles.skeletonWrapper}>
              <div className={styles.skeletonFeatured} />
              <div className={styles.skeletonPills}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={styles.skeletonPill} />
                ))}
              </div>
              <div className={styles.grid}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={styles.skeletonCard} />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className={styles.errorBox}>
              <div className={styles.errorIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 className={styles.errorTitle}>Couldn't load blog posts</h3>
              <p className={styles.errorText}>{error}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className={styles.emptyBox}>
              <div className={styles.emptyIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h3 className={styles.emptyTitle}>No blog posts yet</h3>
              <p className={styles.emptyText}>
                Our blog is coming soon. Check back for insights and stories from the iQuire community.
              </p>
            </div>
          ) : (
            <>
              {/* FEATURED POST */}
              {isFeaturedVisible && featuredPost && (
                <div className={`${styles.featuredWrapper} ${styles.slideUpText} ${styles['delay-1']}`}>
                  <FeaturedPostCard post={featuredPost} />
                </div>
              )}

              {/* FILTERS */}
              <div className={`${styles.filtersWrapper} ${styles.slideUpText} ${styles['delay-2']}`}>
                <div className={styles.categoryPills}>
                  <button
                    type="button"
                    className={`${styles.pill} ${
                      activeCategory === 'all' ? styles.pillActive : ''
                    }`}
                    onClick={() => setActiveCategory('all')}
                  >
                    All Posts
                  </button>
                  {categories.map((cat) => {
                    const count = posts.filter(
                      (p) => p.category_id === cat.id && p.id !== featuredPost?.id
                    ).length;
                    if (count === 0) return null;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        className={`${styles.pill} ${
                          activeCategory === cat.id ? styles.pillActive : ''
                        }`}
                        onClick={() => setActiveCategory(cat.id)}
                      >
                        {cat.name}
                        <span className={styles.pillCount}>{count}</span>
                      </button>
                    );
                  })}
                </div>

                <div className={styles.searchBox}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>
              </div>

              {/* GRID */}
              {filteredPosts.length === 0 ? (
                hasActiveFilters ? (
                  <div className={styles.emptyBox}>
                    <div className={styles.emptyIcon}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </div>
                    <h3 className={styles.emptyTitle}>No posts match your filters</h3>
                    <p className={styles.emptyText}>Try adjusting your search or clearing the filters.</p>
                    <button type="button" className={styles.emptyCta} onClick={clearFilters}>
                      Clear filters
                    </button>
                  </div>
                ) : isFeaturedVisible ? (
                  null
                ) : (
                  <div className={styles.emptyBox}>
                    <div className={styles.emptyIcon}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                    </div>
                    <h3 className={styles.emptyTitle}>No blog posts yet</h3>
                    <p className={styles.emptyText}>Our blog is coming soon.</p>
                  </div>
                )
              ) : (
                <>
                  {hasActiveFilters && (
                    <p className={styles.resultCount}>
                      {filteredPosts.length}{' '}
                      {filteredPosts.length === 1 ? 'post' : 'posts'}
                      {activeCategory !== 'all' && (
                        <>
                          {' '}
                          in{' '}
                          <strong>
                            {categories.find((c) => c.id === activeCategory)?.name}
                          </strong>
                        </>
                      )}
                    </p>
                  )}

                  <div className={`${styles.grid} ${styles.slideUpText} ${styles['delay-3']}`}>
                    {filteredPosts.map((post) => (
                      <BlogCard key={post.id} post={post} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* FINAL CTA (Netted Blue) */}
      <section className={styles.ctaSection}>
        <svg className={styles.netGrid} aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900">
          <defs>
            <pattern id="blogCtaNet" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#000000" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blogCtaNet)" />
        </svg>

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className={`${styles.ctaInner} ${styles.slideUpText} ${styles['delay-4']}`}>
            <h2 className={styles.ctaTitle}>
              Ready to write your own success story?
            </h2>
            <p className={styles.ctaSubtitle}>
              Create a free account and start building your career with iQuire.
            </p>
            <div className={styles.ctaButtons}>
              <Link to="/courses" className={styles.ctaPrimary}>
                Explore Courses
              </Link>
              <Link to="/courses" className={styles.ctaSecondary}>
                Explore Courses →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// Sub-components
// ============================================================================

const AuthorChip: React.FC<{ author: ResolvedAuthor; size?: 'sm' | 'md' }> = ({ author, size = 'sm' }) => {
  const initials = author.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`${styles.authorChip} ${size === 'md' ? styles.authorChipMd : ''}`}>
      <div className={`${styles.authorChipAvatar} ${size === 'md' ? styles.authorChipAvatarMd : ''}`}>
        {author.avatarUrl ? (
          <img src={author.avatarUrl} alt={author.name} loading="lazy" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      <div className={styles.authorChipInfo}>
        <span className={styles.authorChipName}>{author.name}</span>
        {author.role && size === 'md' && (
          <span className={styles.authorChipRole}>{author.role}</span>
        )}
      </div>
    </div>
  );
};

const FeaturedPostCard: React.FC<{ post: BlogPostWithCategory }> = ({ post }) => {
  const author = resolvePostAuthor(post);

  return (
    <Link to={`/blog/${post.slug}`} className={styles.featuredCard}>
      <div className={styles.featuredImage}>
        {post.featured_image_url ? (
          <img src={post.featured_image_url} alt={post.title} loading="eager" />
        ) : (
          <div className={styles.featuredImagePlaceholder}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
        )}
        <span className={styles.featuredBadge}>Featured</span>
      </div>

      <div className={styles.featuredContent}>
        <div className={styles.featuredMeta}>
          {post.category && (
            <span className={styles.featuredCategory}>{post.category.name}</span>
          )}
          {post.published_at && (
            <span className={styles.featuredDate}>{formatBlogDate(post.published_at)}</span>
          )}
        </div>

        <h2 className={styles.featuredTitle}>{post.title}</h2>

        {post.excerpt && <p className={styles.featuredExcerpt}>{post.excerpt}</p>}

        <div className={styles.featuredFooter}>
          <AuthorChip author={author} size="md" />
          <span className={styles.featuredReadMore}>
            Read article
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
};

const BlogCard: React.FC<{ post: BlogPostWithCategory }> = ({ post }) => {
  const author = resolvePostAuthor(post);

  return (
    <Link to={`/blog/${post.slug}`} className={styles.card}>
      <div className={styles.cardImage}>
        {post.featured_image_url ? (
          <img src={post.featured_image_url} alt={post.title} loading="lazy" />
        ) : (
          <div className={styles.cardImagePlaceholder}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
        )}
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          {post.category && (
            <span className={styles.cardCategory}>{post.category.name}</span>
          )}
          {post.published_at && (
            <span className={styles.cardDate}>{formatBlogDate(post.published_at)}</span>
          )}
        </div>

        <h3 className={styles.cardTitle}>{post.title}</h3>

        {post.excerpt && <p className={styles.cardExcerpt}>{post.excerpt}</p>}

        <div className={styles.cardFooter}>
          <AuthorChip author={author} />
          <span className={styles.cardArrow}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
};