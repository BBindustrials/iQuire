// ============================================================================
// iQuire — Alumni / Testimonials Section (Phase 9B.1a)
// ============================================================================
// Fetches featured alumni from Supabase. Adaptive card renders long or short
// testimonials. Falls back to hardcoded examples when DB has none.
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { ScrollReveal } from '../common/ScrollReveal';
import {
  fetchFeaturedAlumni,
  type Alumni as AlumniRecord,
} from '../../services/alumni.service';
import styles from './Alumni.module.css';

// ============================================================================
// Types
// ============================================================================

interface DisplayAlumni {
  id: string;
  name: string;
  photo: string;
  course: string;
  cohort: string;
  quote: string;
  currentRole: string;
  currentOrg: string;
  linkedin: string;
  trustpilot?: string;
  before?: string;
  after?: string;
  accent: 'blue' | 'green' | 'gold' | 'purple';
}

const ACCENT_CYCLE: DisplayAlumni['accent'][] = [
  'blue',
  'green',
  'gold',
  'purple',
];

/** Feedback longer than this many characters renders with a smaller font. */
const LONG_QUOTE_THRESHOLD = 200;

// ============================================================================
// Fallback (shown when DB has no featured alumni yet)
// ============================================================================

const FALLBACK_ALUMNI: DisplayAlumni[] = [
  {
    id: 't1',
    name: 'Chidera Okafor',
    photo:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    course: 'Tech 360',
    cohort: 'Cohort 4',
    quote:
      'I went from being unsure about my career to landing a product role in three months. The training was practical — not just theory.',
    currentRole: 'Junior Product Manager',
    currentOrg: 'TechHub Africa',
    linkedin: 'https://linkedin.com',
    before: 'Business analyst with no tech exposure',
    after: 'Junior Product Manager at a top tech company',
    accent: 'blue',
  },
  {
    id: 't2',
    name: 'Ahmed Ibrahim',
    photo:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    course: 'Digital Work Readiness',
    cohort: 'Cohort 7',
    quote:
      'The workplace skills I learned here made the difference in my first job interview. I felt prepared for the first time.',
    currentRole: 'Operations Associate',
    currentOrg: 'GreenBuild Co.',
    linkedin: 'https://linkedin.com',
    before: 'Fresh graduate applying with no direction',
    after: 'Full-time operations role within 6 weeks',
    accent: 'green',
  },
  {
    id: 't3',
    name: 'Fatima Hassan',
    photo:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    course: 'AI for Everyone',
    cohort: 'Cohort 2',
    quote:
      'I was worried AI would replace my job. Now I am the one training my team on how to use it.',
    currentRole: 'Digital Marketing Lead',
    currentOrg: 'Brightline Media',
    linkedin: 'https://linkedin.com',
    before: 'Marketer struggling with new tools',
    after: 'Leading AI adoption for her team',
    accent: 'gold',
  },
  {
    id: 't4',
    name: 'Kwame Mensah',
    photo:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    course: 'Apprenticeship Preparation',
    cohort: 'Cohort 3',
    quote:
      'The interview prep and CV reviews gave me confidence I never had before. I got two offers in one week.',
    currentRole: 'Junior Engineer',
    currentOrg: 'SkyWorks Ltd',
    linkedin: 'https://linkedin.com',
    before: 'Graduate with 50+ unanswered applications',
    after: 'Hired as a Junior Engineer within 2 months',
    accent: 'purple',
  },
];

// ============================================================================
// Map DB → Display
// ============================================================================

const mapRecordToDisplay = (rec: AlumniRecord, index: number): DisplayAlumni => ({
  id: rec.id,
  name: rec.full_name,
  photo: rec.photo_url || '',
  course: rec.programme || '',
  cohort: rec.cohort || '',
  quote: rec.feedback || rec.short_summary,
  currentRole: rec.professional_title,
  currentOrg: rec.organization || '',
  linkedin: rec.linkedin_url || '',
  trustpilot: rec.trustpilot_url || undefined,
  before: rec.before_journey || undefined,
  after: rec.after_journey || undefined,
  accent: ACCENT_CYCLE[index % ACCENT_CYCLE.length],
});

// ============================================================================
// Helpers
// ============================================================================

const initialsOf = (name: string): string =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

// ============================================================================
// Component
// ============================================================================

export const Alumni: React.FC = () => {
  const [alumni, setAlumni] = useState<DisplayAlumni[]>(FALLBACK_ALUMNI);
  const [activeIndex, setActiveIndex] = useState(0);

  // --------------------------------------------------------------------------
  // Load featured alumni from DB
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const result = await fetchFeaturedAlumni(4);
      if (!isMounted) return;

      if (result.success && result.data && result.data.length > 0) {
        setAlumni(result.data.map(mapRecordToDisplay));
      }
      // else: keep fallback
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const safeIndex = Math.min(activeIndex, alumni.length - 1);
  const active = alumni[safeIndex];
  if (!active) return null;

  const isLongQuote = active.quote.length > LONG_QUOTE_THRESHOLD;

  return (
    <section className={styles.alumni}>
      <div className="container">
        {/* ================================================================
            HEADER
            ================================================================ */}
        <ScrollReveal animation="up" className={styles.header}>
          <span className={styles.badge}>Alumni Stories</span>
          <h2 className={styles.title}>
            Hear from our <span className={styles.highlight}>alumni.</span>
          </h2>
          <p className={styles.subtitle}>
            Real people. Real careers. Verified profiles you can find on
            LinkedIn.
          </p>
        </ScrollReveal>

        {/* ================================================================
            FEATURED TESTIMONIAL
            ================================================================ */}
        <ScrollReveal animation="up" delay={1}>
          <div className={styles.featured}>
            {/* Left — Photo */}
            <div className={styles.featuredImage}>
              {active.photo ? (
                <img
                  src={active.photo}
                  alt={active.name}
                  className={styles.photo}
                />
              ) : (
                <div className={styles.photoPlaceholder}>
                  {initialsOf(active.name)}
                </div>
              )}

              {(active.course || active.cohort) && (
                <div className={styles.photoBadge}>
                  {active.course && (
                    <span className={styles.photoBadgeCourse}>
                      {active.course}
                    </span>
                  )}
                  {active.cohort && (
                    <span className={styles.photoBadgeCohort}>
                      {active.cohort}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Right — Content */}
            <div className={styles.featuredContent}>
              <div className={styles.quoteMark}>"</div>

              <p
                className={`${styles.quote} ${
                  isLongQuote ? styles.quoteLong : styles.quoteShort
                }`}
              >
                {active.quote}
              </p>

              {(active.before || active.after) && (
                <div className={styles.journeyRow}>
                  <div className={styles.journeyItem}>
                    <span className={styles.journeyLabel}>Before</span>
                    <span className={styles.journeyText}>
                      {active.before ?? '—'}
                    </span>
                  </div>
                  <div className={styles.journeyArrow}>→</div>
                  <div className={styles.journeyItem}>
                    <span className={styles.journeyLabel}>After</span>
                    <span className={styles.journeyText}>
                      {active.after ?? '—'}
                    </span>
                  </div>
                </div>
              )}

              <div className={styles.featuredFooter}>
                <div className={styles.featuredMeta}>
                  <strong className={styles.featuredName}>{active.name}</strong>
                  <span className={styles.featuredRole}>
                    {active.currentRole}
                    {active.currentOrg ? ` · ${active.currentOrg}` : ''}
                  </span>
                </div>

                {active.linkedin && (
                  <a
                    href={active.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.linkedinBtn}
                    aria-label={`${active.name} on LinkedIn`}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    Verify on LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ================================================================
            AVATAR SWITCHER
            ================================================================ */}
        <ScrollReveal animation="up" delay={2}>
          <div className={styles.switcher} role="tablist">
            {alumni.map((t, index) => (
              <button
                key={t.id}
                type="button"
                className={`${styles.switcherItem} ${
                  index === safeIndex ? styles.switcherItemActive : ''
                }`}
                onClick={() => setActiveIndex(index)}
                aria-label={`View ${t.name}'s story`}
                aria-selected={index === safeIndex}
                role="tab"
              >
                {t.photo ? (
                  <img src={t.photo} alt={t.name} />
                ) : (
                  <div className={styles.switcherAvatarPlaceholder}>
                    {initialsOf(t.name)}
                  </div>
                )}
                <span className={styles.switcherName}>{t.name}</span>
                {t.course && (
                  <span className={styles.switcherCourse}>{t.course}</span>
                )}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* ================================================================
            CTA
            ================================================================ */}
        <ScrollReveal animation="zoom" delay={1} className={styles.ctaWrapper}>
          <Button variant="primary" color="green" size="lg" href="/alumni">
            Meet More of Our Alumni
          </Button>
          <Link to="/hire-from-us" className={styles.secondaryLink}>
            Hire our alumni →
          </Link>
        </ScrollReveal>
      </div>

      {/* BOTTOM demarcation */}
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