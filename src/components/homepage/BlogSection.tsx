/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/refs */
// ============================================================================
// iQuire — Blog Section (Phase 14.6 — DB-driven)
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchPublishedPosts,
  formatBlogDate,
  type BlogPostWithCategory,
} from '../../services/blog.service';
import styles from './BlogSection.module.css';

// ============================================================================
// Custom Hook for 4s Animation
// ============================================================================
const useSlideUp = (threshold = 0.1, dependency: any = null) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, dependency]);

  return { ref, isVisible };
};

// ============================================================================
// Fallback posts (used only if DB has zero published posts)
// ============================================================================

interface FallbackPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  accent: 'blue' | 'green' | 'gold' | 'purple';
}

const FALLBACK_POSTS: FallbackPost[] = [
  {
    id: 1,
    title: '5 Skills Every Entry Level Professional Needs in 2026',
    excerpt:
      "Discover the essential skills that employers are actively looking for in today's competitive global job market and how to build them.",
    category: 'Career Tips',
    date: 'March 15, 2026',
    readTime: '5 min read',
    image:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=500&fit=crop',
    accent: 'blue',
  },
  {
    id: 2,
    title: 'How AI is Transforming the Global Workplace',
    excerpt:
      'Explore how artificial intelligence is creating new opportunities and changing how we work, learn, and grow professionally.',
    category: 'AI & Work',
    date: 'March 10, 2026',
    readTime: '7 min read',
    image:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop',
    accent: 'purple',
  },
  {
    id: 3,
    title: 'From Graduate to Professional: My iQuire Journey',
    excerpt:
      'A real graduate shares how the iQuire Entry Level Employability Skills Program transformed their career trajectory.',
    category: 'Alumni Stories',
    date: 'March 5, 2026',
    readTime: '4 min read',
    image:
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=500&fit=crop',
    accent: 'green',
  },
];

// ============================================================================
// Normalized shape for rendering
// ============================================================================

interface DisplayPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string | null;
  accent: 'blue' | 'green' | 'gold' | 'purple';
}

const ACCENTS: Array<'blue' | 'green' | 'gold' | 'purple'> = [
  'blue',
  'purple',
  'green',
];

const fallbackToDisplay = (p: FallbackPost): DisplayPost => ({
  id: String(p.id),
  slug: '',
  title: p.title,
  excerpt: p.excerpt,
  category: p.category,
  date: p.date,
  readTime: p.readTime,
  image: p.image,
  accent: p.accent,
});

const dbPostToDisplay = (
  p: BlogPostWithCategory,
  index: number
): DisplayPost => ({
  id: p.id,
  slug: p.slug,
  title: p.title,
  excerpt: p.excerpt ?? '',
  category: p.category?.name ?? 'Insights',
  date: formatBlogDate(p.published_at),
  readTime: p.read_time_minutes
    ? `${p.read_time_minutes} min read`
    : '3 min read',
  image: p.featured_image_url,
  accent: ACCENTS[index % ACCENTS.length],
});

// ============================================================================
// Component
// ============================================================================

export const BlogSection: React.FC = () => {
  const [posts, setPosts] = useState<DisplayPost[]>(
    FALLBACK_POSTS.map(fallbackToDisplay)
  );
  const [isLoading, setIsLoading] = useState(true);

  const headerAnim = useSlideUp();
  const gridAnim = useSlideUp(0.1, posts.length);
  const ctaAnim = useSlideUp();

  // --------------------------------------------------------------------------
  // Load posts
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const res = await fetchPublishedPosts();
      if (!isMounted) return;

      if (res.success && res.data && res.data.length > 0) {
        const allPosts = res.data;
        const featured = allPosts.filter((p) => p.featured).slice(0, 3);

        let selected = featured;
        if (selected.length < 3) {
          const featuredIds = new Set(featured.map((p) => p.id));
          const remaining = allPosts.filter((p) => !featuredIds.has(p.id));
          const needed = 3 - featured.length;
          selected = [...featured, ...remaining.slice(0, needed)];
        }

        if (selected.length > 0) {
          setPosts(selected.map((p, i) => dbPostToDisplay(p, i)));
        }
      }

      setIsLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <section className={styles.blog}>
      {/* ====================================================================
          SVG NET GRID BACKGROUND
          ==================================================================== */}
      <svg
        className={styles.netGrid}
        aria-hidden="true"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 900"
      >
        <defs>
          <pattern
            id="blogNetPattern"
            x="0"
            y="0"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              stroke="#000000"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#blogNetPattern)" />
      </svg>

      <div className={styles.container}>
        {/* ================================================================
            HEADER
            ================================================================ */}
        <div ref={headerAnim.ref} className={styles.header}>
          <div className={`${styles.slideUpText} ${headerAnim.isVisible ? styles.isVisible : ''}`}>
            <span className={styles.badge}>Blogs</span>
            <h2 className={styles.title}>
              Insights for the{' '}
              <span className={styles.highlight}>Modern Workforce</span>
            </h2>
            <p className={styles.description}>
              Career tips, industry insights, and real stories from the iQuire
              community helping you stay ahead.
            </p>
          </div>
        </div>

        {/* ================================================================
            POSTS GRID
            ================================================================ */}
        {isLoading ? (
          <div className={styles.grid}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        ) : (
          <div ref={gridAnim.ref}>
            <div className={`${styles.grid} ${styles.slideUpText} ${gridAnim.isVisible ? styles.isVisible : ''}`} style={{ transitionDelay: '0.15s' }}>
              {posts.map((post) => {
                const postHref = post.slug ? `/blog/${post.slug}` : '/blog';

                return (
                  <article
                    key={post.id}
                    className={`${styles.postCard} ${
                      styles[`accent-${post.accent}`]
                    }`}
                  >
                    <Link to={postHref} className={styles.postLink}>
                      {/* Image */}
                      <div className={styles.postImage}>
                        {post.image ? (
                          <img
                            src={post.image}
                            alt={post.title}
                            loading="lazy"
                          />
                        ) : (
                          <div className={styles.postImagePlaceholder}>📝</div>
                        )}
                        <span className={styles.postCategory}>
                          {post.category}
                        </span>
                      </div>

                      {/* Content */}
                      <div className={styles.postContent}>
                        <div className={styles.postMeta}>
                          <span>{post.date}</span>
                          <span className={styles.postMetaDot}>·</span>
                          <span>{post.readTime}</span>
                        </div>

                        <h3 className={styles.postTitle}>{post.title}</h3>

                        {post.excerpt && (
                          <p className={styles.postExcerpt}>{post.excerpt}</p>
                        )}

                        <span className={styles.postCta}>
                          Read more
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M5 12H19M19 12L12 5M19 12L12 19"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================
            FOOTER CTA
            ================================================================ */}
        <div ref={ctaAnim.ref} className={styles.footerCta}>
          <div className={`${styles.slideUpText} ${ctaAnim.isVisible ? styles.isVisible : ''}`} style={{ transitionDelay: '0.3s' }}>
            <Link to="/blog" className={styles.footerCtaButton}>
              Read More Insights

            </Link>
          </div>
        </div>
      </div>

      {/* ================================================================
          BOTTOM demarcation (Fill unchanged)
          ================================================================ */}
      <div className={styles.demarcationBottom} aria-hidden="true">
        <div className={styles.demarcationLabel}></div>
        <svg
          className={styles.demarcationWave}
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="blogWaveStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2BBBAD" />
              <stop offset="100%" stopColor="#1E88E5" />
            </linearGradient>
          </defs>
          <path
            d="M0,60 C240,15 480,105 720,60 C960,15 1200,105 1440,60 L1440,120 L0,120 Z"
            fill="none"
            stroke="url(#blogWaveStroke)"
            strokeWidth="3"
            opacity="0.6"
          />
          <path
            d="M0,60 C240,15 480,105 720,60 C960,15 1200,105 1440,60 L1440,120 L0,120 Z"
            fill="#d6eaff"
          />
        </svg>
      </div>
    </section>
  );
};