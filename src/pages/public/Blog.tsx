// ============================================================================
// iQuire — Public Blog Listing (Phase 10E.5)
// ============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '../../components/common/ScrollReveal';
import {
  fetchPublishedPosts,
  fetchCategories,
  formatBlogDate,
  type BlogPostWithCategory,
  type BlogCategory,
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

    // Exclude featured post from the grid
    if (featuredPost) {
      list = list.filter((p) => p.id !== featuredPost.id);
    }

    // Category filter
    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category_id === activeCategory);
    }

    // Search
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

  // Is the featured post currently visible in the layout?
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
      {/* ================================================================
          HERO
          ================================================================ */}
      <section className={styles.hero}>
        <div className={styles.heroBgBlobOne} aria-hidden="true" />
        <div className={styles.heroBgBlobTwo} aria-hidden="true" />

        <div className="container">
          <ScrollReveal animation="up" className={styles.heroContent}>
            <span className={styles.badge}>Insights</span>
            <h1 className={styles.heroTitle}>
              Insights for the{' '}
              <span className={styles.highlight}>
                modern African workforce.
              </span>
            </h1>
            <p className={styles.heroSubtitle}>
              Career tips, employability insights, industry trends, AI
              developments, and stories from the IQuire community.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ================================================================
          MAIN CONTENT
          ================================================================ */}
      <section className={styles.contentSection}>
        <div className="container">
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorBox message={error} />
          ) : posts.length === 0 ? (
            <EmptyState type="no-posts" />
          ) : (
            <>
              {/* FEATURED POST */}
              {isFeaturedVisible && featuredPost && (
                <ScrollReveal animation="up" className={styles.featuredWrapper}>
                  <FeaturedPostCard post={featuredPost} />
                </ScrollReveal>
              )}

              {/* FILTERS */}
              <ScrollReveal
                animation="up"
                delay={1}
                className={styles.filtersWrapper}
              >
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
                      (p) =>
                        p.category_id === cat.id && p.id !== featuredPost?.id
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
                    <circle
                      cx="11"
                      cy="11"
                      r="8"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M21 21L16.65 16.65"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search posts…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>
              </ScrollReveal>

              {/* GRID */}
              {filteredPosts.length === 0 ? (
                hasActiveFilters ? (
                  <EmptyState type="no-match" onClear={clearFilters} />
                ) : isFeaturedVisible ? (
                  // Featured post is already showing — grid emptiness is expected.
                  null
                ) : (
                  <EmptyState type="no-posts" />
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
                            {
                              categories.find((c) => c.id === activeCategory)
                                ?.name
                            }
                          </strong>
                        </>
                      )}
                    </p>
                  )}

                  <ScrollReveal animation="up" stagger className={styles.grid}>
                    {filteredPosts.map((post) => (
                      <BlogCard key={post.id} post={post} />
                    ))}
                  </ScrollReveal>
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* ================================================================
          FINAL CTA
          ================================================================ */}
      <section className={styles.ctaSection}>
        <div className="container">
          <ScrollReveal animation="up" className={styles.ctaInner}>
            <h2 className={styles.ctaTitle}>
              Ready to write your own success story?
            </h2>
            <p className={styles.ctaSubtitle}>
              Create a free account and start building your career with IQuire.
            </p>
            <div className={styles.ctaButtons}>
              <Link to="/register" className={styles.ctaPrimary}>
                Get Started Free
              </Link>
              <Link to="/courses" className={styles.ctaSecondary}>
                Explore Courses →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// Sub-components
// ============================================================================

interface FeaturedPostCardProps {
  post: BlogPostWithCategory;
}

const FeaturedPostCard: React.FC<FeaturedPostCardProps> = ({ post }) => (
  <Link to={`/blog/${post.slug}`} className={styles.featuredCard}>
    <div className={styles.featuredImage}>
      {post.featured_image_url ? (
        <img src={post.featured_image_url} alt={post.title} loading="eager" />
      ) : (
        <div className={styles.featuredImagePlaceholder}>📝</div>
      )}
      <span className={styles.featuredBadge}>Featured</span>
    </div>

    <div className={styles.featuredContent}>
      <div className={styles.featuredMeta}>
        {post.category && (
          <span className={styles.featuredCategory}>{post.category.name}</span>
        )}
        {post.published_at && (
          <span className={styles.featuredDate}>
            {formatBlogDate(post.published_at)}
          </span>
        )}
      </div>

      <h2 className={styles.featuredTitle}>{post.title}</h2>

      {post.excerpt && (
        <p className={styles.featuredExcerpt}>{post.excerpt}</p>
      )}

      <div className={styles.featuredFooter}>
        {post.author_name && (
          <div className={styles.featuredAuthor}>
            <div className={styles.featuredAuthorAvatar}>
              {post.author_avatar_url ? (
                <img src={post.author_avatar_url} alt={post.author_name} />
              ) : (
                <span>
                  {post.author_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              )}
            </div>
            <div className={styles.featuredAuthorInfo}>
              <span className={styles.featuredAuthorName}>
                {post.author_name}
              </span>
              {post.author_role && (
                <span className={styles.featuredAuthorRole}>
                  {post.author_role}
                </span>
              )}
            </div>
          </div>
        )}

        <span className={styles.featuredReadMore}>
          Read article
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12H19M19 12L12 5M19 12L12 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </div>
  </Link>
);

interface BlogCardProps {
  post: BlogPostWithCategory;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => (
  <Link to={`/blog/${post.slug}`} className={styles.card}>
    <div className={styles.cardImage}>
      {post.featured_image_url ? (
        <img src={post.featured_image_url} alt={post.title} loading="lazy" />
      ) : (
        <div className={styles.cardImagePlaceholder}>📝</div>
      )}
    </div>

    <div className={styles.cardBody}>
      <div className={styles.cardMeta}>
        {post.category && (
          <span className={styles.cardCategory}>{post.category.name}</span>
        )}
        {post.published_at && (
          <span className={styles.cardDate}>
            {formatBlogDate(post.published_at)}
          </span>
        )}
      </div>

      <h3 className={styles.cardTitle}>{post.title}</h3>

      {post.excerpt && <p className={styles.cardExcerpt}>{post.excerpt}</p>}

      <div className={styles.cardFooter}>
        {post.read_time_minutes && (
          <span className={styles.cardReadTime}>
            ⏱ {post.read_time_minutes} min
          </span>
        )}
        <span className={styles.cardArrow}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12H19M19 12L12 5M19 12L12 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </div>
  </Link>
);

// ----------------------------------------------------------------------------
// Loading / error / empty states
// ----------------------------------------------------------------------------

const LoadingSkeleton: React.FC = () => (
  <>
    {/* Featured skeleton */}
    <div className={styles.skeletonFeatured} />
    {/* Pills skeleton */}
    <div className={styles.skeletonPills}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className={styles.skeletonPill} />
      ))}
    </div>
    {/* Grid skeleton */}
    <div className={styles.grid}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className={styles.skeletonCard} />
      ))}
    </div>
  </>
);

const ErrorBox: React.FC<{ message: string }> = ({ message }) => (
  <div className={styles.errorBox}>
    <div className={styles.errorIcon}>⚠️</div>
    <h3 className={styles.errorTitle}>Couldn't load blog posts</h3>
    <p className={styles.errorText}>{message}</p>
  </div>
);

interface EmptyStateProps {
  type: 'no-posts' | 'no-match';
  onClear?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, onClear }) => (
  <div className={styles.emptyBox}>
    <div className={styles.emptyIcon}>{type === 'no-match' ? '🔍' : '📝'}</div>
    <h3 className={styles.emptyTitle}>
      {type === 'no-match'
        ? 'No posts match your filters'
        : 'No blog posts yet'}
    </h3>
    <p className={styles.emptyText}>
      {type === 'no-match'
        ? 'Try adjusting your search or clearing the filters.'
        : 'Our blog is coming soon. Check back for insights and stories from the IQuire community.'}
    </p>
    {type === 'no-match' && onClear && (
      <button type="button" className={styles.emptyCta} onClick={onClear}>
        Clear filters
      </button>
    )}
  </div>
);