// ============================================================================
// iQuire — Blog Section (Phase 14.6 — DB-driven)
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '../common/ScrollReveal';
import {
  fetchPublishedPosts,
  formatBlogDate,
  type BlogPostWithCategory,
} from '../../services/blog.service';
import styles from './BlogSection.module.css';

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
    title: '5 Skills Every Entry-Level Professional Needs in 2026',
    excerpt:
      "Discover the essential skills that employers are actively looking for in today's competitive global job market — and how to build them.",
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
      'Explore how artificial intelligence is creating new opportunities — and changing how we work, learn, and grow professionally.',
    category: 'AI & Work',
    date: 'March 10, 2026',
    readTime: '7 min read',
    image:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop',
    accent: 'purple',
  },
  {
    id: 3,
    title: 'From Graduate to Professional: My IQuire Journey',
    excerpt:
      'A real graduate shares how the IQuire Entry-Level Employability Skills Program transformed their career trajectory.',
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

        // 1. Featured posts first (up to 3)
        const featured = allPosts.filter((p) => p.featured).slice(0, 3);

        // 2. If we don't have 3 featured yet, top up with most recent
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
      // else: keep the fallback already in state

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
      {/* Background accents */}
      <div className={styles.bgAccentOne} aria-hidden="true" />
      <div className={styles.bgAccentTwo} aria-hidden="true" />

      <div className={styles.container}>
        {/* ================================================================
            HEADER
            ================================================================ */}
        <ScrollReveal animation="up" className={styles.header}>
          <span className={styles.badge}>Insights</span>
          <h2 className={styles.title}>
            Insights for the{' '}
            <span className={styles.highlight}>Modern Workforce</span>
          </h2>
          <p className={styles.description}>
            Career tips, industry insights, and real stories from the IQuire
            community — helping you stay ahead.
          </p>
        </ScrollReveal>

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
          <ScrollReveal animation="up" stagger className={styles.grid}>
            {posts.map((post) => {
              // If we have a slug, link to the real post; else non-clickable
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
          </ScrollReveal>
        )}

        {/* ================================================================
            FOOTER CTA
            ================================================================ */}
        <ScrollReveal animation="zoom" delay={2} className={styles.footerCta}>
          <Link to="/blog" className={styles.footerCtaButton}>
            Read More Insights
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12H19M19 12L12 5M19 12L12 19"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </ScrollReveal>
      </div>

      {/* ================================================================
          BOTTOM demarcation
          ================================================================ */}
      <div className={styles.demarcationBottom} aria-hidden="true">
        <div className={styles.demarcationLabel}></div>
        <svg
          className={styles.demarcationWave}
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,60 C240,15 480,105 720,60 C960,15 1200,105 1440,60 L1440,120 L0,120 Z"
            fill="none"
            stroke="#F9A825"
            strokeWidth="3"
            opacity="0.6"
          />
          <path
            d="M0,60 C240,15 480,105 720,60 C960,15 1200,105 1440,60 L1440,120 L0,120 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    </section>
  );
};