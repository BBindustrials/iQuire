// ============================================================================
// iQuire — Public Blog Post Detail (Phase 10E.6)
// ============================================================================

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ScrollReveal } from '../../components/common/ScrollReveal';
import {
  fetchPostBySlug,
  fetchRelatedPosts,
  formatBlogDate,
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
    if (!slug) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

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

      // Fetch related posts (same category)
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
    } catch (err) {
      // Fallback
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
      {/* ================================================================
          BREADCRUMB
          ================================================================ */}
      <div className={styles.breadcrumb}>
        <div className="container">
          <Link to="/blog" className={styles.breadcrumbLink}>
            ← Back to Blog
          </Link>
        </div>
      </div>

      {/* ================================================================
          ARTICLE HEADER
          ================================================================ */}
      <article className={styles.article}>
        <div className="container">
          <ScrollReveal animation="up" className={styles.articleHeader}>
            {/* Meta */}
            <div className={styles.articleMeta}>
              {post.category && (
                <Link
                  to="/blog"
                  className={styles.categoryChip}
                >
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

            {/* Title */}
            <h1 className={styles.articleTitle}>{post.title}</h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className={styles.articleExcerpt}>{post.excerpt}</p>
            )}

            {/* Author */}
            {post.author_name && (
              <div className={styles.authorCard}>
                <div className={styles.authorAvatar}>
                  {post.author_avatar_url ? (
                    <img
                      src={post.author_avatar_url}
                      alt={post.author_name}
                    />
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
                <div className={styles.authorInfo}>
                  <span className={styles.authorName}>{post.author_name}</span>
                  {post.author_role && (
                    <span className={styles.authorRole}>
                      {post.author_role}
                    </span>
                  )}
                </div>
              </div>
            )}
          </ScrollReveal>
        </div>

        {/* Hero image — full-width */}
        {post.featured_image_url && (
          <ScrollReveal animation="up" delay={1} className={styles.heroImageWrapper}>
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

        {/* Content body */}
        <div className="container">
          <div className={styles.articleBody}>
            {/* Main content */}
            <div className={styles.contentColumn}>
              <ScrollReveal animation="up" delay={2} className={styles.content}>
                <ArticleContent content={post.content ?? ''} />
              </ScrollReveal>

              {/* Tags */}
              {post.tags.length > 0 && (
                <ScrollReveal animation="up" delay={3} className={styles.tagsSection}>
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

              {/* Share */}
              <ScrollReveal animation="up" delay={4} className={styles.shareSection}>
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12L10 17L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Copy Link
                      </>
                    )}
                  </button>
                </div>
              </ScrollReveal>
            </div>

            {/* Sidebar: Author card sticky */}
            <aside className={styles.sideColumn}>
              {post.author_name && (
                <div className={styles.sideCard}>
                  <div className={styles.sideAvatar}>
                    {post.author_avatar_url ? (
                      <img
                        src={post.author_avatar_url}
                        alt={post.author_name}
                      />
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
                  <h3 className={styles.sideAuthorName}>{post.author_name}</h3>
                  {post.author_role && (
                    <p className={styles.sideAuthorRole}>{post.author_role}</p>
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
                <Link
                  to="/register"
                  className={styles.sideCardAccentCta}
                >
                  Get Started Free →
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {/* ================================================================
          RELATED POSTS
          ================================================================ */}
      {relatedPosts.length > 0 && (
        <section className={styles.relatedSection}>
          <div className="container">
            <ScrollReveal animation="up" className={styles.relatedHeader}>
              <h2 className={styles.relatedTitle}>Related articles</h2>
              <p className={styles.relatedSubtitle}>
                More from {post.category?.name ?? 'the IQuire blog'}
              </p>
            </ScrollReveal>

            <ScrollReveal
              animation="up"
              stagger
              className={styles.relatedGrid}
            >
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

      {/* ================================================================
          FINAL CTA
          ================================================================ */}
      <section className={styles.finalCta}>
        <div className={styles.finalCtaBgBlob} aria-hidden="true" />
        <div className="container">
          <ScrollReveal animation="up" className={styles.finalCtaInner}>
            <h2 className={styles.finalCtaTitle}>
              Found this useful?
            </h2>
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

// ============================================================================
// Article content renderer
// ============================================================================
// Minimal Markdown-ish renderer: paragraphs, headers (#, ##, ###),
// lists (- or 1.), bold (**text**), italic (*text*), links ([text](url)),
// blockquotes (> text), and code (`text`).

interface ArticleContentProps {
  content: string;
}

const ArticleContent: React.FC<ArticleContentProps> = ({ content }) => {
  if (!content || !content.trim()) {
    return <p className={styles.contentParagraph}>No content.</p>;
  }

  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = (key: number) => {
    if (listBuffer.length === 0) return;
    const Tag = listType === 'ol' ? 'ol' : 'ul';
    blocks.push(
      <Tag key={`list-${key}`} className={styles.contentList}>
        {listBuffer.map((item, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
        ))}
      </Tag>
    );
    listBuffer = [];
    listType = null;
  };

  lines.forEach((raw, idx) => {
    const line = raw.trim();

    if (!line) {
      flushList(idx);
      return;
    }

    // Headers
    if (line.startsWith('### ')) {
      flushList(idx);
      blocks.push(
        <h3
          key={idx}
          className={styles.contentH3}
          dangerouslySetInnerHTML={{ __html: inlineFormat(line.slice(4)) }}
        />
      );
      return;
    }
    if (line.startsWith('## ')) {
      flushList(idx);
      blocks.push(
        <h2
          key={idx}
          className={styles.contentH2}
          dangerouslySetInnerHTML={{ __html: inlineFormat(line.slice(3)) }}
        />
      );
      return;
    }
    if (line.startsWith('# ')) {
      flushList(idx);
      blocks.push(
        <h2
          key={idx}
          className={styles.contentH2}
          dangerouslySetInnerHTML={{ __html: inlineFormat(line.slice(2)) }}
        />
      );
      return;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      flushList(idx);
      blocks.push(
        <blockquote
          key={idx}
          className={styles.contentQuote}
          dangerouslySetInnerHTML={{ __html: inlineFormat(line.slice(2)) }}
        />
      );
      return;
    }

    // Unordered list
    if (/^[-*] /.test(line)) {
      if (listType !== 'ul') {
        flushList(idx);
        listType = 'ul';
      }
      listBuffer.push(line.slice(2));
      return;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      if (listType !== 'ol') {
        flushList(idx);
        listType = 'ol';
      }
      listBuffer.push(line.replace(/^\d+\.\s/, ''));
      return;
    }

    // Paragraph
    flushList(idx);
    blocks.push(
      <p
        key={idx}
        className={styles.contentParagraph}
        dangerouslySetInnerHTML={{ __html: inlineFormat(line) }}
      />
    );
  });

  flushList(lines.length);

  return <>{blocks}</>;
};

/**
 * Very minimal inline formatter: bold, italic, inline code, links.
 * Note: This is intentionally simple — production apps should use a proper
 * markdown parser + sanitizer.
 */
const inlineFormat = (text: string): string => {
  // Escape HTML first
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Links: [text](url)
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Bold: **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  html = html.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Inline code: `text`
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="inline-code">$1</code>'
  );

  return html;
};