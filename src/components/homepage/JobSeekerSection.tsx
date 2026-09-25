// ============================================================================
// iQuire — Opportunities / Job Seekers Section (Phase 7C.8)
// ============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { ScrollReveal } from '../common/ScrollReveal';
import styles from './JobSeekerSection.module.css';

// ============================================================================
// Opportunity types (chips)
// ============================================================================

interface OpportunityType {
  id: string;
  emoji: string;
  label: string;
  description: string;
  accent: 'blue' | 'green' | 'gold' | 'purple';
}

const OPPORTUNITY_TYPES: OpportunityType[] = [
  {
    id: 'apprenticeships',
    emoji: '🛠️',
    label: 'Apprenticeships',
    description: 'Earn while you learn in structured programs.',
    accent: 'blue',
  },
  {
    id: 'internships',
    emoji: '💼',
    label: 'Internships',
    description: 'Real-world experience with real teams.',
    accent: 'green',
  },
  {
    id: 'entry-level',
    emoji: '🚀',
    label: 'Entry-Level Roles',
    description: 'Your first step into a real career.',
    accent: 'gold',
  },
  {
    id: 'full-time',
    emoji: '⏱️',
    label: 'Full-Time',
    description: 'Long-term positions with growth potential.',
    accent: 'blue',
  },
  {
    id: 'part-time',
    emoji: '📅',
    label: 'Part-Time',
    description: 'Flexible roles that fit around your life.',
    accent: 'green',
  },
  {
    id: 'volunteering',
    emoji: '🤝',
    label: 'Volunteering',
    description: 'Build experience and give back.',
    accent: 'gold',
  },
  {
    id: 'freelance',
    emoji: '💻',
    label: 'Freelance',
    description: 'Project-based work you control.',
    accent: 'purple',
  },
];

// ============================================================================
// Sample opportunity cards (preview)
// ============================================================================

interface SampleOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  level: string;
  remote: boolean;
  exclusive: boolean;
}

const SAMPLE_OPPORTUNITIES: SampleOpportunity[] = [
  {
    id: '1',
    title: 'Junior Data Analyst',
    company: 'TechHub Africa',
    location: 'Lagos, Nigeria',
    type: 'Full-Time',
    level: 'Entry Level',
    remote: false,
    exclusive: true,
  },
  {
    id: '2',
    title: 'Product Intern',
    company: 'Fintech Innovations',
    location: 'Remote',
    type: 'Internship',
    level: 'Entry Level',
    remote: true,
    exclusive: false,
  },
  {
    id: '3',
    title: 'Project Assistant',
    company: 'GreenBuild Co.',
    location: 'Abuja, Nigeria',
    type: 'Contract',
    level: 'Junior',
    remote: false,
    exclusive: true,
  },
];

// ============================================================================
// Component
// ============================================================================

export const Opportunities: React.FC = () => {
  return (
    <section className={styles.opportunities}>
      {/* 
        FIX: Added styles.contentWrapper here. 
        This lifts the content above the demarcation waves.
      */}
      <div className={`container ${styles.contentWrapper}`}>
        
        {/* ================================================================
            HEADER
            ================================================================ */}
        <ScrollReveal animation="up" className={styles.header}>
          <span className={styles.badge}>Opportunities</span>
          <h2 className={styles.title}>
            Your next opportunity{' '}
            <span className={styles.highlight}>starts here.</span>
          </h2>
          <p className={styles.subtitle}>
            Discover jobs, internships, apprenticeships, and career programs —
            all curated and matched to where you are in your journey.
          </p>
        </ScrollReveal>

        {/* ================================================================
            OPPORTUNITY TYPE CHIPS
            ================================================================ */}
        <ScrollReveal animation="up" stagger className={styles.typesGrid}>
          {OPPORTUNITY_TYPES.map((type) => (
            <div
              key={type.id}
              className={`${styles.typeCard} ${styles[`accent-${type.accent}`]}`}
            >
              <div className={styles.typeIcon}>{type.emoji}</div>
              <h3 className={styles.typeLabel}>{type.label}</h3>
              <p className={styles.typeDesc}>{type.description}</p>
            </div>
          ))}
        </ScrollReveal>

        {/* ================================================================
            SAMPLE OPPORTUNITY CARDS
            ================================================================ */}
        <ScrollReveal animation="up" delay={1} className={styles.samplesHeader}>
          <h3 className={styles.samplesTitle}>Featured opportunities</h3>
          <p className={styles.samplesSubtitle}>
            A preview of what's available inside IQuire.
          </p>
        </ScrollReveal>

        <ScrollReveal animation="up" stagger className={styles.samplesGrid}>
          {SAMPLE_OPPORTUNITIES.map((opp) => (
            <article key={opp.id} className={styles.sampleCard}>
              <div className={styles.sampleTop}>
                <span className={styles.sampleType}>{opp.type}</span>
                {opp.exclusive && (
                  <span className={styles.exclusiveBadge}>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M12 2L4 6V12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12V6L12 2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    </svg>
                    IQuire Exclusive
                  </span>
                )}
              </div>

              <h4 className={styles.sampleTitle}>{opp.title}</h4>
              <p className={styles.sampleCompany}>{opp.company}</p>

              <div className={styles.sampleMeta}>
                <span className={styles.sampleMetaItem}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M12 7V12L15 15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  {opp.remote ? 'Remote' : opp.location}
                </span>
                <span className={styles.sampleMetaItem}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 17L9 11L13 15L21 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 7H21V14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {opp.level}
                </span>
              </div>

              <Link to="/jobs" className={styles.sampleLink}>
                View opportunity →
              </Link>
            </article>
          ))}
        </ScrollReveal>

        {/* ================================================================
            EXCLUSIVITY NOTE
            ================================================================ */}
        <ScrollReveal animation="up" delay={2}>
          <div className={styles.exclusiveNote}>
            <div className={styles.exclusiveIcon}>🔒</div>
            <div className={styles.exclusiveText}>
              <strong>Verified IQuire members get exclusive access</strong>
              <span>
                Some opportunities — especially those from our hiring partners
                — are reserved for verified IQuire participants and alumni.
                Complete a course to unlock them.
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* ================================================================
            CTA
            ================================================================ */}
        <ScrollReveal animation="zoom" delay={1} className={styles.ctaWrapper}>
          <Button variant="primary" color="green" size="lg" href="/jobs">
            Explore Opportunities
          </Button>
          <Link to="/register" className={styles.secondaryLink}>
            Build Your Profile →
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
            fill="#0A192F"
          />
        </svg>
      </div>
    </section>
  );
};