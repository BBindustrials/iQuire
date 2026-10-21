// ============================================================================
// iQuire — Public AI Career Counselor Landing Page (Phase 14.10)
// ============================================================================
// FAQ section now reads from the faqs table (category = 'ai-counselor').
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '../../components/common/ScrollReveal';
import { Button } from '../../components/common/Button';
import {
  fetchPublishedFaqsByCategory,
  type Faq,
} from '../../services/faqs.service';
import styles from './AiCounselor.module.css';

// ============================================================================
// Static content (still hardcoded — informational strips)
// ============================================================================

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    id: 'direction',
    icon: '🧭',
    title: 'Career direction',
    description:
      'Understand what roles actually fit you — and why. Get a clear sense of where to go next.',
  },
  {
    id: 'skills',
    icon: '🎯',
    title: 'Skill-gap analysis',
    description:
      'See exactly what skills you have and what you need to reach your target role.',
  },
  {
    id: 'courses',
    icon: '📚',
    title: 'Course recommendations',
    description:
      'Get matched to the right IQuire courses to close the gap between where you are and where you want to be.',
  },
  {
    id: 'cv',
    icon: '📝',
    title: 'CV & profile review',
    description:
      'Build and improve your CV, LinkedIn, and professional profile with AI-guided feedback.',
  },
  {
    id: 'opportunities',
    icon: '💼',
    title: 'Opportunity matching',
    description:
      'Discover jobs, internships, and apprenticeships that match your actual profile and goals.',
  },
  {
    id: 'interviews',
    icon: '🎤',
    title: 'Interview preparation',
    description:
      'Practice with role-specific questions, get feedback, and walk into interviews with confidence.',
  },
];

interface Step {
  number: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: '01',
    title: 'Meet your counselor',
    description:
      'A quick, warm conversation to understand who you are and what you\u2019re aiming for.',
  },
  {
    number: '02',
    title: 'Build your career profile',
    description:
      'The AI learns your goals, skills, and interests \u2014 and remembers them for next time.',
  },
  {
    number: '03',
    title: 'Get personalized guidance',
    description:
      'Career direction, skill gaps, courses to take, CV improvements \u2014 all tailored to you.',
  },
  {
    number: '04',
    title: 'Take your next step',
    description:
      'From courses to opportunities to interviews \u2014 the AI walks you through every stage.',
  },
];


// ============================================================================
// Component
// ============================================================================

export const AiCounselor: React.FC = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [isFaqLoading, setIsFaqLoading] = useState(true);

  // --------------------------------------------------------------------------
  // Load FAQs
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const res = await fetchPublishedFaqsByCategory('ai-counselor');
      if (!isMounted) return;

      if (res.success && res.data) {
        setFaqs(res.data);
      }
      setIsFaqLoading(false);
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
    <div className={styles.page}>
      {/* ================================================================
          HERO
          ================================================================ */}
      <section className={styles.hero}>
        <div className={styles.heroBlobOne} aria-hidden="true" />
        <div className={styles.heroBlobTwo} aria-hidden="true" />

        <div className="container">
          <div className={styles.heroGrid}>
            {/* Left — copy */}
            <ScrollReveal animation="left" className={styles.heroContent}>
              <span className={styles.heroBadge}>
                <span className={styles.heroBadgeDot} />
                AI-Powered
              </span>

              <h1 className={styles.heroTitle}>
                Meet your{' '}
                <span className={styles.heroHighlight}>
                  AI Career Counselor.
                </span>
              </h1>

              <p className={styles.heroSubtitle}>
                A personal career guide that understands where you are — and
                tells you exactly what to do next. Available any time, in your
                dashboard.
              </p>

              <div className={styles.heroCtas}>
                <Button
                  variant="primary"
                  color="green"
                  size="lg"
                  href="/login"
                >
                  Sign In to Try It
                </Button>
                <Link to="/courses" className={styles.heroSecondary}>
                  Explore Courses →
                </Link>
              </div>

              <div className={styles.heroTrust}>
                <span className={styles.heroTrustItem}>
                  ✅ Free for IQuire students & alumni
                </span>
                <span className={styles.heroTrustDot}>·</span>
                <span className={styles.heroTrustItem}>
                  🔒 Private & secure
                </span>
              </div>
            </ScrollReveal>

            {/* Right — chat mockup */}
            <ScrollReveal
              animation="right"
              delay={1}
              className={styles.heroVisual}
            >
              <div className={styles.chatMockup}>
                <div className={styles.chatMockupHeader}>
                  <div className={styles.chatMockupAvatar}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20.02L12 16.77L7.09 20.02L8.45 13.97L4 9.27L9.91 8.26L12 2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className={styles.chatMockupHeaderText}>
                    <strong>IQuire AI Counselor</strong>
                    <span>
                      <span className={styles.onlineDot} />
                      Online
                    </span>
                  </div>
                </div>

                <div className={styles.chatMockupBody}>
                  <div className={`${styles.mockBubble} ${styles.mockBubbleAi}`}>
                    <p>
                      Hi! I&apos;m your IQuire Career Counselor. What kind of
                      role are you aiming for?
                    </p>
                  </div>

                  <div className={`${styles.mockBubble} ${styles.mockBubbleUser}`}>
                    <p>I want to become a data analyst.</p>
                  </div>

                  <div className={`${styles.mockBubble} ${styles.mockBubbleAi}`}>
                    <p>
                      Great choice. Let me ask a few questions to see where you
                      are today — then I&apos;ll map out your best path.
                    </p>
                  </div>

                  <div className={styles.chatMockupTyping}>
                    <span className={styles.typingDot} />
                    <span className={styles.typingDot} />
                    <span className={styles.typingDot} />
                  </div>
                </div>

                <div className={styles.chatMockupFooter}>
                  <div className={styles.mockInput}>
                    Ask me anything about your career…
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ================================================================
          FEATURES
          ================================================================ */}
      <section className={styles.featuresSection}>
        <div className="container">
          <ScrollReveal animation="up" className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>What it does</span>
            <h2 className={styles.sectionTitle}>
              Six ways your AI counselor{' '}
              <span className={styles.sectionHighlight}>
                helps you move forward.
              </span>
            </h2>
            <p className={styles.sectionSubtitle}>
              Every conversation is built around your goals, your skills, and
              what employers actually want.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="up" stagger className={styles.featuresGrid}>
            {FEATURES.map((f) => (
              <div key={f.id} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.description}</p>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* ================================================================
          HOW IT WORKS
          ================================================================ */}
      <section className={styles.howItWorks}>
        <div className="container">
          <ScrollReveal animation="up" className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>How it works</span>
            <h2 className={styles.sectionTitle}>
              From &ldquo;I don&apos;t know where to start&rdquo; to a{' '}
              <span className={styles.sectionHighlight}>
                clear next step.
              </span>
            </h2>
          </ScrollReveal>

          <div className={styles.stepsGrid}>
            {STEPS.map((step, i) => (
              <ScrollReveal
                key={step.number}
                animation="up"
                delay={(i < 4 ? i : 0) as 0 | 1 | 2 | 3 | 4}
                className={styles.stepCard}
              >
                <div className={styles.stepNumber}>{step.number}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.description}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          PREVIEW / EXPERIENCE SPLIT
          ================================================================ */}
      <section className={styles.previewSection}>
        <div className="container">
          <div className={styles.previewGrid}>
            <ScrollReveal animation="left" className={styles.previewContent}>
              <span className={styles.sectionBadge}>Inside the dashboard</span>
              <h2 className={styles.sectionTitle}>
                A career companion that{' '}
                <span className={styles.sectionHighlight}>
                  remembers you.
                </span>
              </h2>
              <p className={styles.previewText}>
                Unlike a one-off chatbot, your AI Career Counselor builds a
                picture of who you are over time. Every conversation, every
                skill, every goal — kept in your profile so the guidance gets
                sharper the more you use it.
              </p>

              <ul className={styles.previewList}>
                <li>
                  <span className={styles.checkIcon}>✓</span>
                  Your career profile builds automatically
                </li>
                <li>
                  <span className={styles.checkIcon}>✓</span>
                  Conversations are saved — pick up where you left off
                </li>
                <li>
                  <span className={styles.checkIcon}>✓</span>
                  Course suggestions match your actual gaps
                </li>
                <li>
                  <span className={styles.checkIcon}>✓</span>
                  Private — only you see your conversations
                </li>
                <li>
                  <span className={styles.checkIcon}>✓</span>
                  Available any time, no appointment needed
                </li>
              </ul>

              <div className={styles.previewCta}>
                <Button
                  variant="primary"
                  color="green"
                  size="lg"
                  href="/login"
                >
                  Try It in Your Dashboard
                </Button>
              </div>
            </ScrollReveal>

            <ScrollReveal
              animation="right"
              delay={1}
              className={styles.previewVisual}
            >
              <div className={styles.profileCard}>
                <div className={styles.profileCardHeader}>
                  <span className={styles.profileCardLabel}>
                    What the AI knows about you
                  </span>
                </div>
                <div className={styles.profileCardBody}>
                  <div className={styles.profileRow}>
                    <span className={styles.profileLabel}>Career goal</span>
                    <span className={styles.profileValue}>
                      Junior Data Analyst
                    </span>
                  </div>
                  <div className={styles.profileRow}>
                    <span className={styles.profileLabel}>Experience</span>
                    <span className={styles.profileValue}>Entry level</span>
                  </div>
                  <div className={styles.profileRow}>
                    <span className={styles.profileLabel}>Current skills</span>
                    <span className={styles.profileValue}>
                      Excel, SQL basics
                    </span>
                  </div>
                  <div className={styles.profileRow}>
                    <span className={styles.profileLabel}>
                      Developing now
                    </span>
                    <span className={styles.profileValue}>
                      Python, Power BI
                    </span>
                  </div>
                  <div className={styles.profileRow}>
                    <span className={styles.profileLabel}>Preferred work</span>
                    <span className={styles.profileValue}>
                      Remote · Full-time
                    </span>
                  </div>
                </div>
                <div className={styles.profileCardFooter}>
                  <span className={styles.profileProgressLabel}>
                    Profile completeness
                  </span>
                  <div className={styles.profileProgressBar}>
                    <div
                      className={styles.profileProgressFill}
                      style={{ width: '60%' }}
                    />
                  </div>
                  <span className={styles.profileProgressValue}>60%</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ================================================================
          FAQ — DB-driven (category = 'ai-counselor')
          ================================================================ */}
      {!isFaqLoading && faqs.length > 0 && (
        <section className={styles.faqSection}>
          <div className="container">
            <ScrollReveal animation="up" className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>Questions</span>
              <h2 className={styles.sectionTitle}>Frequently asked.</h2>
            </ScrollReveal>

            <ScrollReveal animation="up" className={styles.faqList}>
              {faqs.map((faq) => (
                <details key={faq.id} className={styles.faqItem}>
                  <summary className={styles.faqQuestion}>
                    {faq.question}
                    <span className={styles.faqIcon}>+</span>
                  </summary>
                  <div className={styles.faqAnswer}>
                    {faq.answer.split('\n').map((para, i) => (
                      <p key={i}>{para || <br />}</p>
                    ))}
                  </div>
                </details>
              ))}
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ================================================================
          FINAL CTA
          ================================================================ */}
      <section className={styles.finalCta}>
        <div className={styles.finalCtaBlob} aria-hidden="true" />
        <div className="container">
          <ScrollReveal animation="up" className={styles.finalCtaInner}>
            <h2 className={styles.finalCtaTitle}>
              Your career journey starts with one conversation.
            </h2>
            <p className={styles.finalCtaSubtitle}>
              Sign in to your IQuire dashboard and meet your AI Career
              Counselor today.
            </p>
            <div className={styles.finalCtaButtons}>
              <Button
                variant="primary"
                color="gold"
                size="lg"
                href="/login"
              >
                Sign In
              </Button>
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