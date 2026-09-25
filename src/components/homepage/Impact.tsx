// ============================================================================
// iQuire — Impact Section (Phase 7C.11)
// ============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { ScrollReveal } from '../common/ScrollReveal';
import styles from './Impact.module.css';

// ============================================================================
// Metrics
// ============================================================================

interface Metric {
  id: string;
  value: string;
  label: string;
  description: string;
  emoji: string;
  accent: 'blue' | 'green' | 'gold' | 'purple';
}

const METRICS: Metric[] = [
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
// Partner / employer logos
// ============================================================================

interface Employer {
  id: string;
  name: string;
  initials: string;
  accent: 'blue' | 'green' | 'gold' | 'purple' | 'gray';
}

const EMPLOYERS: Employer[] = [
  { id: 'e1', name: 'TechHub Africa', initials: 'TH', accent: 'blue' },
  { id: 'e2', name: 'Fintech Innovations', initials: 'FI', accent: 'green' },
  { id: 'e3', name: 'GreenBuild Co.', initials: 'GB', accent: 'gold' },
  { id: 'e4', name: 'Brightline Media', initials: 'BM', accent: 'purple' },
  { id: 'e5', name: 'SkyWorks Ltd', initials: 'SW', accent: 'gray' },
  { id: 'e6', name: 'Nova Health', initials: 'NH', accent: 'blue' },
  { id: 'e7', name: 'Vertex Consulting', initials: 'VC', accent: 'green' },
  { id: 'e8', name: 'Pulse Retail', initials: 'PR', accent: 'gold' },
];

// ============================================================================
// Component
// ============================================================================

export const Impact: React.FC = () => {
  return (
    <section className={styles.impact}>
      {/* Background blobs */}
      <div className={styles.bgBlobOne} aria-hidden="true" />
      <div className={styles.bgBlobTwo} aria-hidden="true" />

      <div className="container">
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
        <ScrollReveal animation="up" stagger className={styles.metricsGrid}>
          {METRICS.map((metric) => (
            <div
              key={metric.id}
              className={`${styles.metricCard} ${styles[`accent-${metric.accent}`]}`}
            >
              <div className={styles.metricIcon}>{metric.emoji}</div>
              <div className={styles.metricValue}>{metric.value}</div>
              <div className={styles.metricLabel}>{metric.label}</div>
              <p className={styles.metricDesc}>{metric.description}</p>
            </div>
          ))}
        </ScrollReveal>

        {/* ================================================================
            EMPLOYERS STRIP
            ================================================================ */}
        <ScrollReveal animation="up" delay={1} className={styles.employersHeader}>
          <h3 className={styles.employersTitle}>
            Where our alumni work
          </h3>
          <p className={styles.employersSubtitle}>
            IQuire-trained professionals have gone on to join a growing list of
            employers across industries.
          </p>
        </ScrollReveal>

        <ScrollReveal animation="up" stagger className={styles.employersGrid}>
          {EMPLOYERS.map((employer) => (
            <div key={employer.id} className={styles.employerCard}>
              <div
                className={`${styles.employerLogo} ${styles[`logo-${employer.accent}`]}`}
              >
                {employer.initials}
              </div>
              <span className={styles.employerName}>{employer.name}</span>
            </div>
          ))}
        </ScrollReveal>

        {/* ================================================================
            CTA
            ================================================================ */}
        <ScrollReveal animation="zoom" delay={1} className={styles.ctaWrapper}>
          <Button variant="primary" color="green" size="lg" href="/about#impact">
            See Our Full Impact
          </Button>
          <Link to="/alumni" className={styles.secondaryLink}>
            Meet our alumni →
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