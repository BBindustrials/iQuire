// ============================================================================
// iQuire — How It Works (Phase 7C.6 — Fixed connectors + logo hub)
// ============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { ScrollReveal } from '../common/ScrollReveal';
import styles from './HowItWorks.module.css';

// ============================================================================
// IMAGE SOURCES
// ============================================================================

import logo from '../../assets/logo/iquire-logo.png';

const stepImages = {
  join:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face',
  learn:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
  build:
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
  hired:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
};

// ============================================================================
// Step data (Reduced to 4 steps)
// ============================================================================

interface Step {
  id: string;
  number: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

const STEPS: Step[] = [
  {
    id: 'join',
    number: '01',
    title: 'Join',
    description: 'Create your IQuire profile based on your career goals.',
    image: stepImages.join,
    imageAlt: 'Young person creating their IQuire profile',
  },
  {
    id: 'learn',
    number: '02',
    title: 'Learn',
    description: 'Develop practical, digital, and workplace skills.',
    image: stepImages.learn,
    imageAlt: 'Person learning practical skills',
  },
  {
    id: 'build',
    number: '03',
    title: 'Build',
    description: 'Improve your CV, portfolio, and professional identity.',
    image: stepImages.build,
    imageAlt: 'Person building their CV and portfolio',
  },
  {
    id: 'hired',
    number: '04',
    title: 'Get Hired',
    description: 'Connect with employers looking for work-ready talent.',
    image: stepImages.hired,
    imageAlt: 'Person celebrating getting hired',
  },
];

// ============================================================================
// Radial helpers
// ============================================================================

// 4 evenly spaced angles, starting at top (12 o'clock)
const NODE_ANGLES_DEG = [0, 90, 180, 270];

const angleToPosition = (angleDeg: number, radiusPercent = 42) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  const x = 50 + Math.cos(rad) * radiusPercent;
  const y = 50 + Math.sin(rad) * radiusPercent;
  return { x, y };
};

// ============================================================================
// Component
// ============================================================================

export const HowItWorks: React.FC = () => {
  // Position of each node as percentage (0-100) inside the circle
  const nodePositions = NODE_ANGLES_DEG.map((deg) => angleToPosition(deg, 42));

  // Build a single continuous circle path with SVG arcs connecting all 4 nodes
  const radius = 42; // must match angleToPosition's radiusPercent
  const circumferencePath = `M 50 ${50 - radius} ` +
    NODE_ANGLES_DEG.slice(1).map((_, idx) => {
      // Draw an arc to the next node position
      const nextPos = nodePositions[(idx + 1) % nodePositions.length];
      return `A ${radius} ${radius} 0 0 1 ${nextPos.x} ${nextPos.y}`;
    }).join(' ') +
    ' A 42 42 0 0 1 50 8 Z'; // close the circle back to top

  return (
    <section className={styles.howItWorks}>
      {/* ====================================================================
          BACKGROUND SVG DECORATIONS
          ==================================================================== */}
      <div className={styles.bgDecor} aria-hidden="true">
        {/* Top-Left: Dotted Grid & Floating Cross */}
        <svg className={styles.dottedGridLeft} viewBox="0 0 100 100" fill="none">
          {[...Array(4)].map((_, row) =>
            [...Array(4)].map((_, col) => (
              <circle key={`${row}-${col}`} cx={10 + col * 20} cy={10 + row * 20} r="2" fill="#94a3b8" />
            ))
          )}
        </svg>
        <svg className={styles.crossTopLeft} viewBox="0 0 24 24" fill="none">
          <path d="M12 4V20M4 12H20" stroke="#F9A825" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        </svg>

        {/* Top-Right: Abstract Leaf & Sweeping Ring */}
        <svg className={styles.sweepingRing} viewBox="0 0 200 200" fill="none">
          <ellipse cx="100" cy="100" rx="90" ry="60" transform="rotate(-30 100 100)" stroke="#00A878" strokeWidth="2" opacity="0.2" strokeDasharray="8 8" />
        </svg>

        {/* Bottom-Left: Green Leaf */}
        <svg className={styles.leafBottomLeft} viewBox="0 0 300 300" fill="none">
          <path d="M -50 200 C 50 50, 200 0, 250 100 C 300 200, 150 300, 50 300 C -20 300, -100 280, -50 200 Z" fill="#D1FAE5" opacity="0.5" />
        </svg>
        
        {/* Bottom-Right: Floating Circle & Dotted Grid */}
        <div className={styles.circleBottomRight} />
        <svg className={styles.dottedGridRight} viewBox="0 0 100 100" fill="none">
          {[...Array(3)].map((_, row) =>
            [...Array(3)].map((_, col) => (
              <circle key={`${row}-${col}`} cx={10 + col * 20} cy={10 + row * 20} r="2" fill="#94a3b8" />
            ))
          )}
        </svg>
      </div>

      <div className={styles.container}>
        {/* ================================================================
            HEADER
            ================================================================ */}
        <ScrollReveal animation="up" className={styles.header}>
          <span className={styles.badge}>How It Works</span>
          <h2 className={styles.title}>
            Four clear paths.{' '}
            <span className={styles.highlight}>One destination.</span>
          </h2>
          <p className={styles.description}>
            Your journey from learning to landing meaningful opportunities —
            in four simple steps.
          </p>
        </ScrollReveal>

        {/* ================================================================
            RADIAL CIRCLE
            ================================================================ */}
        <ScrollReveal animation="zoom" className={styles.circleWrapper}>
          <div className={styles.circle}>
            {/* Decorative rings */}
            <div className={`${styles.ring} ${styles.ringOuter}`} aria-hidden="true" />
            <div className={`${styles.ring} ${styles.ringInner}`} aria-hidden="true" />

            {/* Single continuous gold dashed circle path */}
            <svg
              className={styles.connectors}
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#F9A825" />
                  <stop offset="50%" stopColor="#F57F17" />
                  <stop offset="100%" stopColor="#F9A825" />
                </linearGradient>
              </defs>

              {/* One continuous dashed path — connects all 4 nodes in order */}
              <path
                d={circumferencePath}
                fill="none"
                stroke="url(#goldGradient)"
                strokeWidth="0.6"
                strokeDasharray="2 1.5"
                strokeLinecap="round"
              />
            </svg>

            {/* Center hub with logo */}
            <div className={styles.hub}>
              <div className={styles.hubInner}>
                <img
                  src={logo}
                  alt="IQuire"
                  className={styles.hubLogo}
                />
              </div>
            </div>

            {/* 4 Step nodes */}
            {STEPS.map((step, idx) => {
              const pos = nodePositions[idx];
              return (
                <div
                  key={step.id}
                  className={`${styles.node} ${styles[`node-${step.id}`]}`}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    animationDelay: `${idx * 0.15}s`,
                  }}
                >
                  <div className={styles.nodeNumber}>{step.number}</div>

                  <div className={styles.nodeAvatar}>
                    <img src={step.image} alt={step.imageAlt} loading="lazy" />
                  </div>

                  <h3 className={styles.nodeTitle}>{step.title}</h3>
                  <p className={styles.nodeDescription}>{step.description}</p>
                </div>
              );
            })}
          </div>
        </ScrollReveal>

        {/* ================================================================
            MOBILE TIMELINE
            ================================================================ */}
        <div className={styles.mobileTimeline}>
          {STEPS.map((step, idx) => (
            <div key={step.id} className={styles.mobileStep}>
              <div className={styles.mobileStepLeft}>
                <div className={styles.mobileStepNumber}>{step.number}</div>
                {idx < STEPS.length - 1 && (
                  <div className={styles.mobileConnector} aria-hidden="true" />
                )}
              </div>
              <div className={styles.mobileStepBody}>
                <div className={styles.mobileStepAvatar}>
                  <img src={step.image} alt={step.imageAlt} loading="lazy" />
                </div>
                <div>
                  <h3 className={styles.mobileStepTitle}>{step.title}</h3>
                  <p className={styles.mobileStepDesc}>{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ================================================================
            CTA
            ================================================================ */}
        <ScrollReveal animation="up" delay={3} className={styles.ctaWrapper}>
        <Button variant="primary" color="gradient" size="lg" href="/courses">
            Start Your Journey
          </Button>
          <Link to="/courses" className={styles.secondaryLink}>
            Explore Courses →
          </Link>
        </ScrollReveal>
      </div>

      {/* ================================================================
          BOTTOM demarcation — wave + gold outline only (Fill unchanged)
          ================================================================ */}
      <div className={styles.demarcationBottom} aria-hidden="true">
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
          {/* Fill kept as #0f172a */}
          <path
            d="M0,60 C240,15 480,105 720,60 C960,15 1200,105 1440,60 L1440,120 L0,120 Z"
            fill="#0f172a"
          />
        </svg>
      </div>
    </section>
  );
};