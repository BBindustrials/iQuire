// ============================================================================
// iQuire — Problem Section (Animated)
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import styles from './Problem.module.css';

// Placeholder images — swap to local when ready
import problemImage from '../../assets/images/problem-section-image.png';

import avatar1 from '../../assets/images/avatar-1.jpeg';
import avatar2 from '../../assets/images/avatar-2.jpeg';
import avatar3 from '../../assets/images/avatar-3.jpeg';
import avatar4 from '../../assets/images/avatar-4.png';
import avatar5 from '../../assets/images/avatar-5.png';
import avatar6 from '../../assets/images/avatar-6.jpg';

interface Question {
  id: string;
  quote: string;
  persona: string;
  avatar: string;
}

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    quote:
      "I graduated six months ago. Everyone keeps asking what I'm doing next, and I have no idea.",
    persona: 'Recent graduate',
    avatar: avatar1,
  },
  {
    id: 'q2',
    quote:
      'Every entry level job wants 2 years of experience. How am I supposed to get experience if no one will give me a chance?',
    persona: 'Job seeker',
    avatar: avatar2,
  },
  {
    id: 'q3',
    quote:
      "I want to prepare for an apprenticeship, but I don't even know what skills I'm missing.",
    persona: 'Apprentice hopeful',
    avatar: avatar3,
  },
  {
    id: 'q4',
    quote:
      "I have the right degree. I just don't know how to talk about myself, or what employers actually want.",
    persona: 'Entry level professional',
    avatar: avatar4,
  },
  {
    id: 'q5',
    quote:
      "I'm not sure which career path is right for me, or how to find out.",
    persona: 'Career explorer',
    avatar: avatar5,
  },
  {
    id: 'q6',
    quote:
      "My CV isn't getting any replies. Is it actually strong enough?",
    persona: 'Active applicant',
    avatar: avatar6,
  },
];

interface Pillar {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
}

const ICONS = {
  train: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3L2 8L12 13L22 8L12 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M6 10V15C6 15 8.5 17 12 17C15.5 17 18 15 18 15V10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  prepare: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.35"
      />
      <path
        d="M8 12L11 15L16 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  hire: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect
        x="2"
        y="7"
        width="20"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 7V5C8 3.9 8.9 3 10 3H14C15.1 3 16 3.9 16 5V7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M2 13H22" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
};

const PILLARS: Pillar[] = [
  {
    id: 'train',
    title: 'Train',
    description: 'Build the real, work ready skills employers actually want.',
    icon: ICONS.train,
    accent: 'blue',
  },
  {
    id: 'prepare',
    title: 'Prepare',
    description: 'CVs, interviews, career clarity, and professional confidence.',
    icon: ICONS.prepare,
    accent: 'green',
  },
  {
    id: 'hire',
    title: 'Get Hired',
    description: 'Connect with opportunities, recruiters, and the path forward.',
    icon: ICONS.hire,
    accent: 'gold',
  },
];

export const Problem: React.FC = () => {
  const topSectionRef = useRef<HTMLDivElement>(null);
  const [topVisible, setTopVisible] = useState(false);

  const quotesGridRef = useRef<HTMLDivElement>(null);
  const [quotesVisible, setQuotesVisible] = useState(false);

  const solutionRef = useRef<HTMLDivElement>(null);
  const [solutionVisible, setSolutionVisible] = useState(false);

  // Top section slide-in observers
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTopVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (topSectionRef.current) observer.observe(topSectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Quote cards staggered observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setQuotesVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (quotesGridRef.current) observer.observe(quotesGridRef.current);
    return () => observer.disconnect();
  }, []);

  // Solution block observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSolutionVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (solutionRef.current) observer.observe(solutionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.problem}>
      {/* ====================================================================
          TOP SECTION: Text slides in from LEFT, image slides in from RIGHT
          Bottom edge is a concave white scoop
          ==================================================================== */}
      <div className={styles.topSection} ref={topSectionRef}>
        
        {/* SVG NET GRID BACKGROUND */}
        <svg
          className={styles.netGrid}
          aria-hidden="true"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 1440 900"
        >
          <defs>
            <pattern
              id="problemNetPattern"
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
          <rect width="100%" height="100%" fill="url(#problemNetPattern)" />
        </svg>

        <div className="container">
          <div className={styles.topGrid}>
            {/* TEXT — slides in from the LEFT */}
            <div
              className={`${styles.topContent} ${
                topVisible ? styles.slideInLeft : ''
              }`}
            >
              <span className={styles.badge}>The Challenge</span>

              <h2 className={styles.title}>
                You've got the degree.{' '}
                <br className={styles.desktopBreak} />
                <span className={styles.highlight}>
                  But what next, now?
                </span>
              </h2>

              <p className={styles.intro}>
                Millions of young people finish school every year, and hit the
                same wall. No one taught them how to transition from education
                into a real career. That's the gap <strong>iQuire</strong>{' '}
                closes.
              </p>

              <div className={styles.turningPoint}>
                <p className={styles.turningPointText}>
                  You're not the problem.{' '}
                  <em>The path was never built for you.</em>
                </p>
              </div>
            </div>

            {/* IMAGE — slides in from the RIGHT */}
            <div
              className={`${styles.topVisual} ${
                topVisible ? styles.slideInRight : ''
              }`}
            >
              <div className={styles.imageWrapper}>
                <img
                  src={problemImage}
                  alt="A young graduate celebrating"
                  className={styles.problemImage}
                  loading="lazy"
                />
                <div className={styles.imageShadow} aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          BOTTOM SECTION: White background
          Bottom edge is a CONVEX curve bulging downward
          ==================================================================== */}
      <div className={styles.bottomSection}>
        <div className="container">
          <div className={styles.questionsHeader}>
            <h3 className={styles.questionsTitle}>
              Does any of this sound familiar?
            </h3>
            <p className={styles.questionsSubtitle}>
              These are the questions we hear every single day.
            </p>
          </div>

          {/* Quote cards — staggered 4.0s slide-up */}
          <div className={styles.questionsGrid} ref={quotesGridRef}>
            {QUESTIONS.map((q, index) => (
              <div
                key={q.id}
                className={`${styles.bubbleCard} ${
                  quotesVisible ? styles.quoteVisible : ''
                }`}
                style={{ transitionDelay: `${index * 0.15}s` }}
              >
                <div className={styles.bubbleAvatar}>
                  <img src={q.avatar} alt={q.persona} loading="lazy" />
                </div>
                <div className={styles.bubbleBody}>
                  <div className={styles.bubbleQuote}>
                    <span className={styles.bubbleQuoteMark}>"</span>
                    <p className={styles.bubbleText}>{q.quote}</p>
                    <span className={styles.bubbleTail} aria-hidden="true" />
                  </div>
                  <span className={styles.bubblePersona}>{q.persona}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Solution block */}
          <div
            ref={solutionRef}
            className={`${styles.solution} ${
              solutionVisible ? styles.solutionVisible : ''
            }`}
          >
            <h3 className={styles.solutionTitle}>
              Here's how iQuire changes that.
            </h3>

            <div className={styles.pillars}>
              {PILLARS.map((p, index) => (
                <div key={p.id} className={styles.pillar}>
                  <div
                    className={`${styles.pillarIcon} ${
                      styles[`icon-${p.accent}`]
                    }`}
                  >
                    {p.icon}
                  </div>
                  <div className={styles.pillarTextContent}>
                    <h4 className={styles.pillarTitle}>{p.title}</h4>
                    <p className={styles.pillarDesc}>{p.description}</p>
                  </div>
                  {index < PILLARS.length - 1 && (
                    <span className={styles.pillarArrow} aria-hidden="true">
                      →
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.ctaGroup}>
              <Button
                variant="primary"
                color="gradient"
                size="lg"
                href="/about"
              >
                Discover How iQuire Works
              </Button>
              <Link to="/courses" className={styles.secondaryLink}>
                See our Courses →
              </Link>
            </div>
          </div>
        </div>

        {/* Convex end — curve side facing OUTSIDE (bulges downward) */}
        <div className={styles.convexBottom} aria-hidden="true" />
      </div>
    </section>
  );
};