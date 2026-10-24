// ============================================================================
// iQuire — Impact Section (Phase 14.5 — DB-driven)
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { ScrollReveal } from '../common/ScrollReveal';
import {
  fetchPublishedImpactMetrics,
  type ImpactMetric,
} from '../../services/impact.service';
import type { ImpactAccent } from '../../types/content.types';
import styles from './Impact.module.css';

// ============================================================================
// EMPLOYER LOGO IMPORTS
// ============================================================================
import bbAitechLogo from '../../assets/images/employers/bbAitech.png';
import firstBankLogo from '../../assets/images/employers/firstbank.jpg';
import mopsonLogo from '../../assets/images/employers/mopson.png';
import thbLogo from '../../assets/images/employers/thb.png';
import sundryLogo from '../../assets/images/employers/sundry.png';
import kwenuLogo from '../../assets/images/employers/kwenu.png';
import tantalizersLogo from '../../assets/images/employers/tantalizers.png';
import nrcLogo from '../../assets/images/employers/nrc.png';

// ============================================================================
// Fallback metrics (used only if the DB returns nothing)
// ============================================================================

interface FallbackMetric {
  id: string;
  value: string;
  label: string;
  description: string;
  emoji: string;
  accent: ImpactAccent;
}

const FALLBACK_METRICS: FallbackMetric[] = [
  {
    id: 'trained',
    value: '1,000+',
    label: 'Young people trained',
    description: 'Across work-readiness, tech, AI, and career programs since 2023.',
    emoji: '🎓',
    accent: 'blue',
  },
  {
    id: 'countries',
    value: '4',
    label: 'African countries',
    description: 'Reaching learners and alumni across the continent.',
    emoji: '🌍',
    accent: 'green',
  },
  {
    id: 'states',
    value: '5',
    label: 'Nigerian states',
    description: 'Physical and virtual training programs delivered.',
    emoji: '📍',
    accent: 'gold',
  },
  {
    id: 'programs',
    value: '10+',
    label: 'Programs delivered',
    description: 'Cohorts run across our four flagship course tracks.',
    emoji: '📚',
    accent: 'purple',
  },
  {
    id: 'sessions',
    value: '350+',
    label: 'Training sessions',
    description: 'Live classes, workshops, and mentoring sessions.',
    emoji: '🎤',
    accent: 'blue',
  },
  {
    id: 'hired',
    value: '70%',
    label: 'Career progression',
    description: 'Of alumni report new opportunities, roles, or promotions.',
    emoji: '🚀',
    accent: 'green',
  },
];

// ============================================================================
// Employers strip
// ============================================================================

interface Employer {
  id: string;
  name: string;
  logo: string;
  website?: string; // Added website field
}

const EMPLOYERS: Employer[] = [
  { id: 'bb-aitech', name: 'BB AiTech Solutions', logo: bbAitechLogo, website: 'https://www.bbaitech.com' },
  { id: 'firstbank', name: 'First Bank', logo: firstBankLogo, website: 'https://www.firstbanknigeria.com' },
  { id: 'mopson', name: 'Mopson Pharmaceutical', logo: mopsonLogo, website: 'https://www.mopsonpharma.com' },
  { id: 'thb', name: 'THB Enterprise', logo: thbLogo, website: '' },
  { id: 'sundry', name: 'Sundry Markets', logo: sundryLogo, website: 'https://www.sundrymarkets.com' },
  { id: 'kwenu', name: 'Kwenu 93.9FM', logo: kwenuLogo, website: 'https://kwenu939.com' },
  { id: 'tantalizers', name: 'Tantalizers PLC', logo: tantalizersLogo, website: 'https://www.tantalizersng.com' },
  { id: 'nrc', name: 'Nigerian Railway Corp', logo: nrcLogo, website: 'https://nrc.gov.ng' },
];

// ============================================================================
// Normalized metric shape for rendering
// ============================================================================

interface DisplayMetric {
  id: string;
  emoji: string;
  value: string;
  label: string;
  description: string;
  accent: ImpactAccent;
}

const toDisplayMetric = (m: ImpactMetric): DisplayMetric => ({
  id: m.id,
  emoji: m.emoji,
  value: m.value,
  label: m.label,
  description: m.description ?? '',
  accent: m.accent,
});

const fallbackToDisplay = (m: FallbackMetric): DisplayMetric => ({
  id: m.id,
  emoji: m.emoji,
  value: m.value,
  label: m.label,
  description: m.description,
  accent: m.accent,
});

// ============================================================================
// Component
// ============================================================================

export const Impact: React.FC = () => {
  const [metrics, setMetrics] = useState<DisplayMetric[]>(
    FALLBACK_METRICS.map(fallbackToDisplay)
  );
  const [isLoading, setIsLoading] = useState(true);

  // --------------------------------------------------------------------------
  // Load from DB
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const res = await fetchPublishedImpactMetrics();
      if (!isMounted) return;

      if (res.success && res.data && res.data.length > 0) {
        setMetrics(res.data.map(toDisplayMetric));
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
    <section className={styles.impact}>
      {/* ====================================================================
          BACKGROUND SVG DECORATIONS
          ==================================================================== */}
      <div className={styles.bgDecor} aria-hidden="true">
        <svg className={styles.dottedGridTL} viewBox="0 0 100 100" fill="none">
          {[...Array(4)].map((_, row) =>
            [...Array(4)].map((_, col) => (
              <circle key={`${row}-${col}`} cx={10 + col * 20} cy={10 + row * 20} r="2" fill="#ffffff" opacity="0.15" />
            ))
          )}
        </svg>
        <div className={styles.circleTR} />
        <svg className={styles.arcBL} viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="90" stroke="#F9A825" strokeWidth="2" opacity="0.15" strokeDasharray="10 10" />
        </svg>
        <svg className={styles.shapeBR} viewBox="0 0 300 300" fill="none">
          <path d="M 350 200 C 250 50, 100 0, 50 100 C 0 200, 150 300, 250 300 C 320 300, 400 280, 350 200 Z" fill="#ffffff" opacity="0.03" />
        </svg>
      </div>

      <div className={styles.bgBlobOne} aria-hidden="true" />
      <div className={styles.bgBlobTwo} aria-hidden="true" />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* ================================================================
            HEADER
            ================================================================ */}
        <ScrollReveal animation="up" className={styles.header}>
          <span className={styles.badge}>Our Impact</span>
          <h2 className={styles.title}>
            Real training.{' '}
            <span className={styles.highlight}>Real outcomes.</span>
          </h2>
          <p className={styles.subtitle}>
            Since 2023, IQuire has trained over 1,000 young people across
            Nigeria and Africa — moving them from learning to employability.
          </p>
        </ScrollReveal>

        {/* ================================================================
            METRICS GRID
            ================================================================ */}
        {isLoading ? (
          <div className={styles.metricsGrid}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        ) : (
          <ScrollReveal animation="up" stagger className={styles.metricsGrid}>
            {metrics.map((metric) => (
              <div
                key={metric.id}
                className={`${styles.metricCard} ${styles[`accent-${metric.accent}`]}`}
              >
                <div className={styles.metricIcon}>{metric.emoji}</div>
                <div className={styles.metricValue}>{metric.value}</div>
                <div className={styles.metricLabel}>{metric.label}</div>
                {metric.description && (
                  <p className={styles.metricDesc}>{metric.description}</p>
                )}
              </div>
            ))}
          </ScrollReveal>
        )}

        {/* ================================================================
            EMPLOYERS STRIP
            ================================================================ */}
        <ScrollReveal animation="up" delay={1} className={styles.employersHeader}>
          <h3 className={styles.employersTitle}>Where our alumni work</h3>
          <p className={styles.employersSubtitle}>
            IQuire-trained professionals have gone on to join a growing list of
            employers across industries.
          </p>
        </ScrollReveal>

        <ScrollReveal animation="up" stagger className={styles.employersGrid}>
          {EMPLOYERS.map((employer) => {
            const CardContent = (
              <>
                <div className={styles.employerLogo}>
                  <img src={employer.logo} alt={`${employer.name} logo`} loading="lazy" />
                </div>
                <span className={styles.employerName}>{employer.name}</span>
              </>
            );

            // If there is a website, render as a link. Otherwise, render a div.
            return employer.website ? (
              <a
                key={employer.id}
                href={employer.website}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.employerCard}
              >
                {CardContent}
              </a>
            ) : (
              <div key={employer.id} className={styles.employerCard}>
                {CardContent}
              </div>
            );
          })}
        </ScrollReveal>

        {/* ================================================================
            CTA
            ================================================================ */}
        <ScrollReveal animation="zoom" delay={1} className={styles.ctaWrapper}>
          <Button variant="primary" color="gradient" size="lg" href="/about#impact">
            See Our Full Impact
          </Button>
          <Link to="/alumni" className={styles.secondaryLink}>
            Meet our alumni →
          </Link>
        </ScrollReveal>
      </div>

      {/* BOTTOM demarcation */}
      <div className={styles.demarcationBottom} aria-hidden="true">
        <div className={styles.demarcationLabel}></div>
        <svg
          className={styles.demarcationWave}
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,60 C240,15 480,105 720,60 C960,15 1200,105 1440,60 L1440,120 L0,120 Z" fill="none" stroke="#F9A825" strokeWidth="3" opacity="0.6" />
          <path d="M0,60 C240,15 480,105 720,60 C960,15 1200,105 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
        </svg>
      </div>
    </section>
  );
};