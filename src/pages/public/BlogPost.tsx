// ============================================================================
// iQuire — Public Blog Post Detail (Phase 14.13.6)
// ============================================================================
// Renders rich HTML content (from Tiptap) with DOMPurify sanitization.
// Author resolves from linked profile when available, else manual fields.
// ============================================================================

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { ScrollReveal } from '../../components/common/ScrollReveal';
import {
  fetchPostBySlug,
  fetchRelatedPosts,
  formatBlogDate,
  resolvePostAuthor,
  type BlogPostWithCategory,
} from '../../services/blog.service';
import styles from './BlogPost.module.css';

// ============================================================================
// Component
// ============================================================================

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [post, setPost] = useState<BlogPostWithCategory | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // --------------------------------------------------------------------------
  // Load post
  // --------------------------------------------------------------------------
  useEffect(() => {
    // No slug in the URL — don't even try to fetch
    if (!slug) return;

    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      setNotFound(false);

      const result = await fetchPostBySlug(slug);
      if (!isMounted) return;

      if (!result.success || !result.data) {
        const msg = result.error ?? '';
        if (msg.toLowerCase().includes('not found')) {
          setNotFound(true);
        } else {
          setError(msg || 'Failed to load post');
        }
        setIsLoading(false);
        return;
      }

      setPost(result.data);

      const relatedRes = await fetchRelatedPosts(
        result.data.category_id,
        result.data.id,
        3
      );
      if (isMounted && relatedRes.success && relatedRes.data) {
        setRelatedPosts(relatedRes.data);
      }

      setIsLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // --------------------------------------------------------------------------
  // Scroll to top on slug change
  // --------------------------------------------------------------------------
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // --------------------------------------------------------------------------
  // Reset copied state after 2s
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  // --------------------------------------------------------------------------
  // Share handlers
  // --------------------------------------------------------------------------
  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return window.location.href;
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      const el = document.createElement('textarea');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
    }
  };

  // --------------------------------------------------------------------------
  // Sanitized content (memoized)
  // --------------------------------------------------------------------------
  const sanitizedContent = useMemo(() => {
    if (!post?.content) return '';
    return DOMPurify.sanitize(post.content, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'blockquote', 'pre', 'code',
        'a', 'img', 'hr',
      ],
      ALLOWED_ATTR: [
        'href', 'title', 'target', 'rel', 'src', 'alt', 'class', 'style',
      ],
      ALLOWED_URI_REGEXP:
        /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    });
  }, [post]);

  // --------------------------------------------------------------------------
  // Resolved author
  // --------------------------------------------------------------------------
  const author = useMemo(() => {
    if (!post) return null;
    return resolvePostAuthor(post);
  }, [post]);

  // --------------------------------------------------------------------------
  // No slug in URL → redirect to /blog
  // --------------------------------------------------------------------------
  if (!slug) {
    return <Navigate to="/blog" replace />;
  }

  // --------------------------------------------------------------------------
  // Loading
  // --------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className={styles.blogPostPage}>
        <div className="container">
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading article…</p>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Not found
  // --------------------------------------------------------------------------
  if (notFound || (!post && !error)) {
    return <Navigate to="/blog" replace />;
  }

  // --------------------------------------------------------------------------
  // Error
  // --------------------------------------------------------------------------
  if (error || !post) {
    return (
      <div className={styles.blogPostPage}>
        <div className="container">
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>⚠️</div>
            <h1 className={styles.errorTitle}>Something went wrong</h1>
            <p className={styles.errorText}>
              {error ?? 'We could not load this article.'}
            </p>
            <Link to="/blog" className={styles.errorCta}>
              ← Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.blogPostPage}>
      {/* BREADCRUMB */}
      <div className={styles.breadcrumb}>
        <div className="container">
          <Link to="/blog" className={styles.breadcrumbLink}>
            ← Back to Blog
          </Link>
        </div>
      </div>

      {/* ARTICLE HEADER */}
      <article className={styles.article}>
        <div className="container">
          <ScrollReveal animation="up" className={styles.articleHeader}>
            <div className={styles.articleMeta}>
              {post.category && (
                <Link to="/blog" className={styles.categoryChip}>
                  {post.category.name}
                </Link>
              )}
              {post.published_at && (
                <span className={styles.metaDate}>
                  {formatBlogDate(post.published_at)}
                </span>
              )}
              {post.read_time_minutes && (
                <>
                  <span className={styles.metaDot}>·</span>
                  <span className={styles.metaReadTime}>
                    {post.read_time_minutes} min read
                  </span>
                </>
              )}
            </div>

            <h1 className={styles.articleTitle}>{post.title}</h1>

            {post.excerpt && (
              <p className={styles.articleExcerpt}>{post.excerpt}</p>
            )}

            {author && author.name && (
              <div className={styles.authorCard}>
                <div className={styles.authorAvatar}>
                  {author.avatarUrl ? (
                    <img src={author.avatarUrl} alt={author.name} />
                  ) : (
                    <span>
                      {author.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  )}
                </div>
                <div className={styles.authorInfo}>
                  <span className={styles.authorName}>{author.name}</span>
                  {author.role && (
                    <span className={styles.authorRole}>{author.role}</span>
                  )}
                </div>
              </div>
            )}
          </ScrollReveal>
        </div>

        {post.featured_image_url && (
          <ScrollReveal
            animation="up"
            delay={1}
            className={styles.heroImageWrapper}
          >
            <div className="container">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className={styles.heroImage}
                loading="eager"
              />
            </div>
          </ScrollReveal>
        )}

        <div className="container">
          <div className={styles.articleBody}>
            <div className={styles.contentColumn}>
              <ScrollReveal animation="up" delay={2} className={styles.content}>
                {sanitizedContent ? (
                  <div
                    className={styles.contentHtml}
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                  />
                ) : (
                  <p className={styles.contentParagraph}>No content.</p>
                )}
              </ScrollReveal>

              {post.tags.length > 0 && (
                <ScrollReveal
                  animation="up"
                  delay={3}
                  className={styles.tagsSection}
                >
                  <span className={styles.tagsLabel}>Tags</span>
                  <div className={styles.tags}>
                    {post.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </ScrollReveal>
              )}

              <ScrollReveal
                animation="up"
                delay={4}
                className={styles.shareSection}
              >
                <span className={styles.shareLabel}>Share this article</span>
                <div className={styles.shareButtons}>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                      shareUrl
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.shareBtn} ${styles.shareLinkedIn}`}
                    aria-label="Share on LinkedIn"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    LinkedIn
                  </a>

                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                      shareUrl
                    )}&text=${encodeURIComponent(post.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.shareBtn} ${styles.shareX}`}
                    aria-label="Share on X"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    X
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`${styles.shareBtn} ${styles.shareCopy}`}
                    aria-label="Copy link"
                  >
                    {copied ? (
                      <>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M5 12L10 17L20 7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Copy Link
                      </>
                    )}
                  </button>
                </div>
              </ScrollReveal>
            </div>

            <aside className={styles.sideColumn}>
              {author && author.name && (
                <div className={styles.sideCard}>
                  <div className={styles.sideAvatar}>
                    {author.avatarUrl ? (
                      <img src={author.avatarUrl} alt={author.name} />
                    ) : (
                      <span>
                        {author.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>
                  <h3 className={styles.sideAuthorName}>{author.name}</h3>
                  {author.role && (
                    <p className={styles.sideAuthorRole}>{author.role}</p>
                  )}
                </div>
              )}

              <div className={styles.sideCardAccent}>
                <h3 className={styles.sideCardAccentTitle}>
                  Want to start your own journey?
                </h3>
                <p className={styles.sideCardAccentText}>
                  Join thousands of learners building their careers with IQuire.
                </p>
                <Link to="/courses" className={styles.sideCardAccentCta}>
                  Get Started Free →
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {/* RELATED POSTS */}
      {relatedPosts.length > 0 && (
        <section className={styles.relatedSection}>
          <div className="container">
            <ScrollReveal animation="up" className={styles.relatedHeader}>
              <h2 className={styles.relatedTitle}>Related articles</h2>
              <p className={styles.relatedSubtitle}>
                More from {post.category?.name ?? 'the IQuire blog'}
              </p>
            </ScrollReveal>

            <ScrollReveal animation="up" stagger className={styles.relatedGrid}>
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.id}
                  to={`/blog/${rp.slug}`}
                  className={styles.relatedCard}
                >
                  <div className={styles.relatedImage}>
                    {rp.featured_image_url ? (
                      <img
                        src={rp.featured_image_url}
                        alt={rp.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.relatedImagePlaceholder}>📝</div>
                    )}
                  </div>
                  <div className={styles.relatedBody}>
                    {rp.category && (
                      <span className={styles.relatedCategory}>
                        {rp.category.name}
                      </span>
                    )}
                    <h3 className={styles.relatedCardTitle}>{rp.title}</h3>
                    {rp.read_time_minutes && (
                      <span className={styles.relatedReadTime}>
                        ⏱ {rp.read_time_minutes} min read
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section className={styles.finalCta}>
        <div className={styles.finalCtaBgBlob} aria-hidden="true" />
        <div className="container">
          <ScrollReveal animation="up" className={styles.finalCtaInner}>
            <h2 className={styles.finalCtaTitle}>Found this useful?</h2>
            <p className={styles.finalCtaSubtitle}>
              Explore more insights, courses, and opportunities on IQuire.
            </p>
            <div className={styles.finalCtaButtons}>
              <Link to="/blog" className={styles.finalCtaPrimary}>
                Back to Blog
              </Link>
              <Link to="/courses" className={styles.finalCtaSecondary}>
                Explore Courses →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};