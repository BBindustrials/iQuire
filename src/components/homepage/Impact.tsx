/* eslint-disable react-hooks/refs */
// ============================================================================
// iQuire — Impact Section (Phase 17.18 — Net Grid, Marquee, Pills)
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import {
  fetchPublishedImpactMetrics,
  type ImpactMetric,
} from '../../services/impact.service';
import type { ImpactAccent } from '../../types/content.types';
import styles from './Impact.module.css';

// ============================================================================
// Employer logos
// ============================================================================

import bbAitechLogo from '../../assets/images/employers/bbAitech.png';
import firstBankLogo from '../../assets/images/employers/firstbank.jpg';
import mopsonLogo from '../../assets/images/employers/mopson.png';
import thbLogo from '../../assets/images/employers/thb.png';
import sundryLogo from '../../assets/images/employers/sundry.png';
import kwenuLogo from '../../assets/images/employers/kwenu.png';
import tantalizersLogo from '../../assets/images/employers/tantalizers.png';
import nrcLogo from '../../assets/images/employers/nrc.png';

interface Employer {
  id: string;
  name: string;
  logo: string;
}

const ROW_ONE: Employer[] = [
  { id: 'bb-aitech', name: 'BB AiTech Solutions', logo: bbAitechLogo },
  { id: 'firstbank', name: 'First Bank', logo: firstBankLogo },
  { id: 'mopson', name: 'Mopson Pharmaceutical', logo: mopsonLogo },
  { id: 'thb', name: 'THB Enterprise', logo: thbLogo },
];

const ROW_TWO: Employer[] = [
  { id: 'sundry', name: 'Sundry Markets', logo: sundryLogo },
  { id: 'kwenu', name: 'Kwenu 93.9FM', logo: kwenuLogo },
  { id: 'tantalizers', name: 'Tantalizers PLC', logo: tantalizersLogo },
  { id: 'nrc', name: 'Nigerian Railway Corp', logo: nrcLogo },
];

// ============================================================================
// Display shape
// ============================================================================

interface DisplayMetric {
  id: string;
  value: string;
  label: string;
  description: string;
  accent: ImpactAccent;
}

const toDisplayMetric = (m: ImpactMetric): DisplayMetric => ({
  id: m.id,
  value: m.value,
  label: m.label,
  description: m.description ?? '',
  accent: m.accent,
});

// ============================================================================
// Custom Hook for 4s Slide-Up
// ============================================================================
const useSlideUp = (threshold = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
};

// ============================================================================
// Component
// ============================================================================

export const Impact: React.FC = () => {
  const [metrics, setMetrics] = useState<DisplayMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const headerAnim = useSlideUp();
  const pillsAnim = useSlideUp();
  const marqueeAnim = useSlideUp();

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const res = await fetchPublishedImpactMetrics();
      if (!isMounted) return;
      if (res.success && res.data) setMetrics(res.data.map(toDisplayMetric));
      setIsLoading(false);
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className={styles.impact}>
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
            id="netPattern"
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
        <rect width="100%" height="100%" fill="url(#netPattern)" />
      </svg>

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        
        {/* ================================================================
            HEADER (Centered) — 4s Slide Up
            ================================================================ */}
        <div ref={headerAnim.ref} className={styles.headerCentered}>
          <div className={`${styles.slideUpText} ${headerAnim.isVisible ? styles.isVisible : ''}`}>
            <span className={styles.badge}>Our Impact</span>
            <h2 className={styles.title}>
              Real training.{' '}
              <span className={styles.highlight}>Measurable outcomes.</span>
            </h2>
            <p className={styles.subtitle}>
              Since 2023, iQuire has trained thousands of young people across
              Nigeria and Africa moving them from learning to real opportunity.
            </p>
          </div>
        </div>

        {/* ================================================================
            ACHIEVEMENT PILLS — 4s Slide Up
            ================================================================ */}
        <div ref={pillsAnim.ref} className={styles.pillsSection}>
          <div className={`${styles.slideUpText} ${pillsAnim.isVisible ? styles.isVisible : ''}`}>
            <h3 className={styles.sectionTitle}>
              The numbers{' '}
              <span className={styles.highlight}>behind the mission.</span>
            </h3>
            <p className={styles.sectionSubtitle}>
              Every metric reflects a real outcome from our community.
            </p>
          </div>

          {isLoading ? (
            <div className={styles.pillsGrid}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.skeletonPill} />
              ))}
            </div>
          ) : (
            <div className={styles.pillsGrid}>
              {metrics.map((metric) => (
                <div
                  key={metric.id}
                  className={`${styles.pill} ${
                    styles[`pill-${metric.accent}`]
                  }`}
                >
                  <span className={styles.pillValue}>{metric.value}</span>
                  <span className={styles.pillLabel}>{metric.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================================================================
            MARQUEE — 4s Slide Up
            ================================================================ */}
        <div ref={marqueeAnim.ref} className={styles.marqueeSection}>
          <div className={`${styles.slideUpText} ${marqueeAnim.isVisible ? styles.isVisible : ''}`}>
            <span className={styles.sectionEyebrow}>Trusted By Employers</span>
            <h3 className={styles.sectionTitle}>
              Our talent works with{' '}
              <span className={styles.highlight}>leading companies.</span>
            </h3>
          </div>

          <div className={styles.marqueeWrap}>
            {/* Row 1: slides left */}
            <div className={styles.marqueeRow}>
              <div className={`${styles.marqueeTrack} ${styles.slideLeft}`}>
                {[...ROW_ONE, ...ROW_ONE, ...ROW_ONE].map((emp, i) => (
                  <div key={`r1-${i}`} className={styles.employerChip}>
                    <div className={styles.employerLogo}>
                      <img src={emp.logo} alt={emp.name} loading="lazy" />
                    </div>
                    <span>{emp.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2: slides right */}
            <div className={styles.marqueeRow}>
              <div className={`${styles.marqueeTrack} ${styles.slideRight}`}>
                {[...ROW_TWO, ...ROW_TWO, ...ROW_TWO].map((emp, i) => (
                  <div key={`r2-${i}`} className={styles.employerChip}>
                    <div className={styles.employerLogo}>
                      <img src={emp.logo} alt={emp.name} loading="lazy" />
                    </div>
                    <span>{emp.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================
            CTA — 4s Slide Up
            ================================================================ */}
        <div className={`${styles.ctaWrapper} ${styles.slideUpText} ${marqueeAnim.isVisible ? styles.isVisible : ''}`}>
          <Button
            variant="primary"
            color="gradient"
            size="lg"
            href="/about#impact"
          >
            See Our Full Impact
          </Button>
          <Link to="/alumni" className={styles.secondaryLink}>
            Meet our alumni →
          </Link>
        </div>
      </div>
    </section>
  );
};