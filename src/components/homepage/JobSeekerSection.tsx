/* eslint-disable react-hooks/refs */
// ============================================================================
// iQuire — Opportunities / Job Seekers Section
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import styles from './JobSeekerSection.module.css';

// ============================================================================
// Custom Hook for 4s Animation
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
// Opportunity types (chips)
// ============================================================================

interface OpportunityType {
  id: string;
  label: string;
  description: string;
  accent: 'blue' | 'gradient' | 'teal' | 'purple';
}

const OPPORTUNITY_TYPES: OpportunityType[] = [
  {
    id: 'apprenticeships',
    label: 'Apprenticeships',
    description: 'Earn while you learn in structured programs.',
    accent: 'blue',
  },
  {
    id: 'internships',
    label: 'Internships',
    description: 'Real world experience with real teams.',
    accent: 'gradient',
  },
  {
    id: 'entry-level',
    label: 'Entry Level Roles',
    description: 'Your first step into a real career.',
    accent: 'teal',
  },
  {
    id: 'full-time',
    label: 'Full Time',
    description: 'Long term positions with growth potential.',
    accent: 'blue',
  },
  {
    id: 'part-time',
    label: 'Part Time',
    description: 'Flexible roles that fit around your life.',
    accent: 'gradient',
  },
  {
    id: 'volunteering',
    label: 'Volunteering',
    description: 'Build experience and give back.',
    accent: 'teal',
  },
  {
    id: 'freelance',
    label: 'Freelance',
    description: 'Project based work you control.',
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
    type: 'Full Time',
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
  const headerAnim = useSlideUp();
  const typesAnim = useSlideUp();
  const samplesHeaderAnim = useSlideUp();
  const samplesAnim = useSlideUp();
  const noteAnim = useSlideUp();
  const ctaAnim = useSlideUp();

  return (
    <section className={styles.opportunities}>
      
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
            id="oppNetPattern"
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
        <rect width="100%" height="100%" fill="url(#oppNetPattern)" />
      </svg>

      <div className={`container ${styles.contentWrapper}`}>
        
        {/* ================================================================
            HEADER
            ================================================================ */}
        <div ref={headerAnim.ref} className={styles.header}>
          <div className={`${styles.slideUpText} ${headerAnim.isVisible ? styles.isVisible : ''}`}>
            <span className={styles.badge}>Opportunities</span>
            <h2 className={styles.title}>
              Your next opportunity{' '}
              <span className={styles.highlight}>starts here.</span>
            </h2>
            <p className={styles.subtitle}>
              Discover jobs, internships, apprenticeships, and career programs 
              all curated and matched to where you are in your journey.
            </p>
          </div>
        </div>

        {/* ================================================================
            OPPORTUNITY TYPE CHIPS
            ================================================================ */}
        <div ref={typesAnim.ref}>
          <div className={`${styles.typesGrid} ${styles.slideUpText} ${typesAnim.isVisible ? styles.isVisible : ''}`} style={{ transitionDelay: '0.15s' }}>
            {OPPORTUNITY_TYPES.map((type) => (
              <div
                key={type.id}
                className={`${styles.typeCard} ${styles[`accent-${type.accent}`]}`}
              >
                <div className={styles.typeAccentBar} />
                <h3 className={styles.typeLabel}>{type.label}</h3>
                <p className={styles.typeDesc}>{type.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ================================================================
            SAMPLE OPPORTUNITY CARDS
            ================================================================ */}
        <div ref={samplesHeaderAnim.ref}>
          <div className={`${styles.samplesHeader} ${styles.slideUpText} ${samplesHeaderAnim.isVisible ? styles.isVisible : ''}`} style={{ transitionDelay: '0.3s' }}>
            <h3 className={styles.samplesTitle}>Featured opportunities</h3>
            <p className={styles.samplesSubtitle}>
              A preview of what's available inside iQuire.
            </p>
          </div>
        </div>

        <div ref={samplesAnim.ref}>
          <div className={`${styles.samplesGrid} ${styles.slideUpText} ${samplesAnim.isVisible ? styles.isVisible : ''}`} style={{ transitionDelay: '0.4s' }}>
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
                      Exclusive
                    </span>
                  )}
                </div>

                <div className={styles.sampleBody}>
                  <h4 className={styles.sampleTitle}>{opp.title}</h4>
                  <p className={styles.sampleCompany}>{opp.company}</p>
                </div>

                <div className={styles.sampleFooter}>
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
                  </div>
                  
                  <Link to="/jobs" className={styles.sampleLink}>
                    View →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* ================================================================
            EXCLUSIVITY NOTE
            ================================================================ */}
        <div ref={noteAnim.ref}>
          <div className={`${styles.slideUpText} ${noteAnim.isVisible ? styles.isVisible : ''}`} style={{ transitionDelay: '0.5s' }}>
            <div className={styles.exclusiveNote}>
              <div className={styles.exclusiveIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.exclusiveText}>
                <strong>Verified iQuire members get exclusive access</strong>
                <span>
                  Some opportunities especially those from our hiring partners
                  are reserved for verified iQuire participants and alumni.
                  Complete a course to unlock them.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================
            CTA
            ================================================================ */}
        <div ref={ctaAnim.ref} className={styles.ctaWrapper}>
          <div className={`${styles.slideUpText} ${ctaAnim.isVisible ? styles.isVisible : ''}`} style={{ transitionDelay: '0.6s' }}>
            <Button variant="primary" color="gradient" size="lg" href="/jobs">
              Explore Opportunities
            </Button>
            <Link to="/courses" className={styles.secondaryLink}>
              Build Your Profile →
            </Link>
          </div>
        </div>
      </div>

      {/* BOTTOM demarcation */}
      <div className={styles.demarcationBottom} aria-hidden="true">
        <svg
          className={styles.demarcationWave}
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="oppWaveStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2BBBAD" />
              <stop offset="100%" stopColor="#1E88E5" />
            </linearGradient>
          </defs>
          <path
            d="M0,60 C240,15 480,105 720,60 C960,15 1200,105 1440,60 L1440,120 L0,120 Z"
            fill="none"
            stroke="url(#oppWaveStroke)"
            strokeWidth="3"
            opacity="0.6"
          />
          <path
            d="M0,60 C240,15 480,105 720,60 C960,15 1200,105 1440,60 L1440,120 L0,120 Z"
            fill="#d6eaff"
          />
        </svg>
      </div>
    </section>
  );
};