// ============================================================================
// iQuire — FAQ Section (Rebuilt)
// ============================================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '../common/ScrollReveal';
import styles from './FAQ.module.css';

interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: 1,
    category: 'General',
    question: 'What is IQuire?',
    answer:
      'IQuire is a global employability and career development platform. We help graduates, young professionals, students, and career changers build the practical skills, professional identity, and career confidence needed to compete for meaningful opportunities.',
  },
  {
    id: 2,
    category: 'Courses',
    question: 'What courses does IQuire offer?',
    answer:
      'We offer four flagship programs: Apprenticeship Preparation, Digital Work Readiness, Tech 360 (explore different tech paths), and AI for Everyone. Each is designed for a specific career stage.',
  },
  {
    id: 3,
    category: 'Job Seekers',
    question: 'How can I find opportunities?',
    answer:
      'Verified IQuire members get access to a curated talent marketplace: internships, apprenticeships, entry-level roles, freelance work, volunteer positions, and graduate trainee programs — all filtered to match your profile.',
  },
  {
    id: 4,
    category: 'Recruiters',
    question: 'How can I hire IQuire talent?',
    answer:
      'Recruiters can register to access our trained talent pool. Every candidate has completed work-readiness training — no resume padding, just verified, work-ready professionals.',
  },
  {
    id: 5,
    category: 'Eligibility',
    question: 'Who can join IQuire?',
    answer:
      'Anyone with the ambition to build a career — students, graduates, job seekers, career changers, professionals upskilling, and national service members. Whether you\'re just starting or pivoting, there\'s a path for you.',
  },
  {
    id: 6,
    category: 'Payment',
    question: 'Are IQuire programs free or paid?',
    answer:
      'We offer a mix. Foundational programs and AI workshops are affordably priced, and scholarship support is available for eligible participants in select courses.',
  },
  {
    id: 7,
    category: 'AI Counselor',
    question: 'What is the AI Career Counselor?',
    answer:
      'It\'s your personal career guide. It helps you understand your career direction, identify skill gaps, build your CV, prepare for interviews, and match with opportunities — all in one intelligent companion.',
  },
  {
    id: 8,
    category: 'Verification',
    question: 'How are candidates verified?',
    answer:
      'Verification involves program completion, skill assessments, and portfolio review. Only verified members appear in the talent directory — recruiters can trust every profile.',
  },
];

export const FAQ: React.FC = () => {
  const [openId, setOpenId] = useState<number | null>(1);

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

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
            FAQ ACCORDION
            ================================================================ */}
        <ScrollReveal animation="up" stagger className={styles.faqGrid}>
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`${styles.faqCard} ${isOpen ? styles.faqCardOpen : ''}`}
              >
                <button
                  className={styles.faqButton}
                  onClick={() => toggleFAQ(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                >
                  <span className={styles.faqCategory}>{faq.category}</span>
                  <span className={styles.faqQuestion}>{faq.question}</span>
                  <span
                    className={`${styles.faqIcon} ${isOpen ? styles.faqIconOpen : ''}`}
                    aria-hidden="true"
                  >
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                <div
                  id={`faq-answer-${faq.id}`}
                  className={`${styles.faqAnswer} ${isOpen ? styles.faqAnswerOpen : ''}`}
                >
                  <p>{faq.answer}</p>
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
        <div className={styles.demarcationLabel}>
        </div>
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