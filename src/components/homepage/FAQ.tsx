/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/refs */
// ============================================================================
// iQuire — Homepage FAQ Section (Phase 14.8 — polished)
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchPublishedFaqsByCategory,
  type Faq,
} from '../../services/faqs.service';
import styles from './FAQ.module.css';

// ============================================================================
// Custom Hook for 4s Animation (Fixed for async data)
// ============================================================================
const useSlideUp = (threshold = 0.1, dependency: any = null) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If the element isn't in the DOM yet, skip observing
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
  }, [threshold, dependency]); // Re-runs when the dependency (data) changes

  return { ref, isVisible };
};

// ============================================================================
// Component
// ============================================================================

export const FAQ: React.FC = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const headerAnim = useSlideUp();
  const gridAnim = useSlideUp(0.1, faqs.length); // Watch faqs.length
  const ctaAnim = useSlideUp();

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
  // Render
  // --------------------------------------------------------------------------
  if (!isLoading && faqs.length === 0) {
    return null;
  }

  return (
    <section className={styles.faq}>
      {/* ====================================================================
          BACKGROUND SVG DECORATIONS
          ==================================================================== */}
      <div className={styles.bgDecor} aria-hidden="true">
        <svg className={styles.dottedGridLeft} viewBox="0 0 100 100" fill="none">
          {[...Array(4)].map((_, row) =>
            [...Array(4)].map((_, col) => (
              <circle key={`${row}-${col}`} cx={10 + col * 20} cy={10 + row * 20} r="2" fill="#2BBBAD" />
            ))
          )}
        </svg>

        <div className={styles.ringRight} />

        <svg className={styles.leafLeft} viewBox="0 0 300 300" fill="none">
          <defs>
            <linearGradient id="faqLeafGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2BBBAD" />
              <stop offset="100%" stopColor="#1E88E5" />
            </linearGradient>
          </defs>
          <path d="M -50 200 C 50 50, 200 0, 250 100 C 300 200, 150 300, 50 300 C -20 300, -100 280, -50 200 Z" fill="url(#faqLeafGrad)" opacity="0.12" />
        </svg>
      </div>

      {/* Background accents */}
      <div className={styles.bgAccentOne} aria-hidden="true" />
      <div className={styles.bgAccentTwo} aria-hidden="true" />

      <div className={styles.container}>
        {/* ================================================================
            HEADER
            ================================================================ */}
        <div ref={headerAnim.ref} className={styles.header}>
          <div className={`${styles.slideUpText} ${headerAnim.isVisible ? styles.isVisible : ''}`}>
            <span className={styles.badge}>FAQ</span>
            <h2 className={styles.title}>
              Frequently Asked{' '}
              <span className={styles.highlight}>Questions</span>
            </h2>
            <p className={styles.description}>
              Everything you need to know about iQuire from how our programs
              work to how we verify talent.
            </p>
          </div>
        </div>

        {/* ================================================================
            FAQ ACCORDION
            ================================================================ */}
        {!isLoading && (
          <div ref={gridAnim.ref}>
            <div className={`${styles.faqGrid} ${styles.slideUpText} ${gridAnim.isVisible ? styles.isVisible : ''}`} style={{ transitionDelay: '0.15s' }}>
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
            </div>
          </div>
        )}

        {/* ================================================================
            FOOTER CTA
            ================================================================ */}
        <div ref={ctaAnim.ref}>
          <div className={`${styles.footerCta} ${styles.slideUpText} ${ctaAnim.isVisible ? styles.isVisible : ''}`} style={{ transitionDelay: '0.3s' }}>
            <div className={styles.footerCtaText}>
              <strong>Still have questions?</strong>
              <span>Our team is here to help.</span>
            </div>
            <Link to="/contact" className={styles.footerCtaLink}>
              Contact Us
            </Link>
          </div>
        </div>
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
          <defs>
            <linearGradient id="faqWaveStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2BBBAD" />
              <stop offset="100%" stopColor="#1E88E5" />
            </linearGradient>
          </defs>
          <path
            d="M0,60 C240,15 480,105 720,60 C960,15 1200,105 1440,60 L1440,120 L0,120 Z"
            fill="none"
            stroke="url(#faqWaveStroke)"
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