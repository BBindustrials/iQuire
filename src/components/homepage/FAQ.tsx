// ============================================================================
// iQuire — Homepage FAQ Section (Phase 14.8 — polished)
// ============================================================================
// Reads FAQs from the faqs table where category = 'homepage'.
// Renders nothing if there are no published FAQs in that category.
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '../common/ScrollReveal';
import {
  fetchPublishedFaqsByCategory,
  type Faq,
} from '../../services/faqs.service';
import styles from './FAQ.module.css';

// ============================================================================
// Component
// ============================================================================

export const FAQ: React.FC = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --------------------------------------------------------------------------
  // Load FAQs
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const res = await fetchPublishedFaqsByCategory('homepage');
      if (!isMounted) return;

      if (res.success && res.data) {
        setFaqs(res.data);
        // Auto-open the first FAQ
        if (res.data.length > 0) {
          setOpenId(res.data[0].id);
        }
      }
      setIsLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleFAQ = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  // --------------------------------------------------------------------------
  // Loading or empty → don't render the section
  // --------------------------------------------------------------------------
  if (isLoading || faqs.length === 0) {
    return null;
  }

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <section className={styles.faq}>
      {/* Background accents */}
      <div className={styles.bgAccentOne} aria-hidden="true" />
      <div className={styles.bgAccentTwo} aria-hidden="true" />

      <div className={styles.container}>
        {/* ================================================================
            HEADER
            ================================================================ */}
        <ScrollReveal animation="up" className={styles.header}>
          <span className={styles.badge}>FAQ</span>
          <h2 className={styles.title}>
            Frequently Asked{' '}
            <span className={styles.highlight}>Questions</span>
          </h2>
          <p className={styles.description}>
            Everything you need to know about IQuire — from how our programs
            work to how we verify talent.
          </p>
        </ScrollReveal>

        {/* ================================================================
            FAQ ACCORDION (2-col grid on desktop)
            ================================================================ */}
        <ScrollReveal animation="up" stagger className={styles.faqGrid}>
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`${styles.faqCard} ${
                  isOpen ? styles.faqCardOpen : ''
                }`}
              >
                <button
                  className={styles.faqButton}
                  onClick={() => toggleFAQ(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  type="button"
                >
                  <span className={styles.faqCategory}>
                    {formatCategoryLabel(faq.category)}
                  </span>
                  <span className={styles.faqQuestion}>{faq.question}</span>
                  <span
                    className={`${styles.faqIcon} ${
                      isOpen ? styles.faqIconOpen : ''
                    }`}
                    aria-hidden="true"
                  >
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                <div
                  id={`faq-answer-${faq.id}`}
                  className={`${styles.faqAnswer} ${
                    isOpen ? styles.faqAnswerOpen : ''
                  }`}
                >
                  {faq.answer.split('\n').map((para, i) => (
                    <p key={i}>{para || <br />}</p>
                  ))}
                </div>
              </div>
            );
          })}
        </ScrollReveal>

        {/* ================================================================
            FOOTER CTA
            ================================================================ */}
        <ScrollReveal animation="up" delay={2} className={styles.footerCta}>
          <div className={styles.footerCtaText}>
            <strong>Still have questions?</strong>
            <span>Our team is here to help.</span>
          </div>
          <Link to="/contact" className={styles.footerCtaLink}>
            Contact Us →
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

// ============================================================================
// Helpers
// ============================================================================

/**
 * Turn a category slug into a readable label.
 * Currently all homepage FAQs use 'homepage' — but if admin adds
 * sub-categories later (e.g., 'homepage-courses'), this keeps the
 * display clean.
 */
const formatCategoryLabel = (category: string): string => {
  if (category === 'homepage') return 'General';
  return category
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};