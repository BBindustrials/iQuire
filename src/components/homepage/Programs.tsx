// ============================================================================
// iQuire — Courses Section (Phase 7C.3)
// Export name kept as `Programs` for backward compatibility.
// ============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import styles from './Programs.module.css';

// ============================================================================
// IMAGE SOURCES (placeholders — swap to local imports when ready)
// ============================================================================

const course1Img =
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=600&fit=crop';

const course2Img =
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop';

const course3Img =
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop';

const course4Img =
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=600&fit=crop';

// ============================================================================
// Course data — 4 courses per client doc (Section 11)
// ============================================================================

interface Course {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  audience: string[];
  duration: string;
  image: string;
  accent: 'blue' | 'green' | 'purple' | 'orange';
  ctaTo: string;
}

const COURSES: Course[] = [
  {
    id: 'apprenticeship',
    slug: 'apprenticeship-preparation',
    name: 'Apprenticeship Preparation',
    tagline: 'Get apprenticeship-ready.',
    description:
      'Practical training for students and fresh graduates preparing to step into paid apprenticeships. Build the skills, confidence, and readiness employers expect.',
    audience: ['Students', 'Fresh graduates', 'School leavers'],
    duration: 'Self-paced · 6 weeks',
    image: course1Img,
    accent: 'blue',
    ctaTo: '/courses/apprenticeship-preparation',
  },
  {
    id: 'digital-work',
    slug: 'digital-work-readiness',
    name: 'Digital Work Readiness',
    tagline: 'Ready for your first real job.',
    description:
      'Everything you need to function effectively in a modern workplace — from digital tools to professional communication and workplace etiquette.',
    audience: ['Entry-level job seekers', 'Interns', 'Graduates'],
    duration: 'Self-paced · 8 weeks',
    image: course2Img,
    accent: 'green',
    ctaTo: '/courses/digital-work-readiness',
  },
  {
    id: 'tech360',
    slug: 'tech-360',
    name: 'Tech 360',
    tagline: 'Break into tech — without a CS degree.',
    description:
      'Comprehensive no-code technology training covering product management, project management, and modern digital tools. Your entry point into a tech career.',
    audience: ['Career switchers', 'Students', 'Non-tech professionals'],
    duration: 'Live cohorts · 12 weeks',
    image: course3Img,
    accent: 'purple',
    ctaTo: '/courses/tech-360',
  },
  {
    id: 'ai-everyone',
    slug: 'ai-for-everyone',
    name: 'AI for Everyone',
    tagline: 'Learn to work with AI — not fear it.',
    description:
      'Practical AI training for professionals at any stage. Understand and apply AI tools in your daily work — whether you\'re an employee, entrepreneur, or student.',
    audience: ['Professionals', 'Employees', 'Entrepreneurs', 'Students'],
    duration: 'Self-paced · 4 weeks',
    image: course4Img,
    accent: 'orange',
    ctaTo: '/courses/ai-for-everyone',
  },
];

// ============================================================================
// Component
// ============================================================================

export const Programs: React.FC = () => {
  return (
    <section className={styles.programs}>
      <div className="container">
        {/* ================================================================
            Header
            ================================================================ */}
        <div className={styles.header}>
          <span className={styles.badge}>Our Courses</span>
          <h2 className={styles.title}>
            Four paths. One clear goal —{' '}
            <span className={styles.highlight}>get you hired.</span>
          </h2>
          <p className={styles.subtitle}>
            Whether you're leaving school, starting your first job, pivoting into
            tech, or learning to use AI — there's a course built for exactly where
            you are.
          </p>
        </div>

        {/* ================================================================
            Course grid
            ================================================================ */}
        <div className={styles.grid}>
          {COURSES.map((course) => (
            <article
              key={course.id}
              className={`${styles.card} ${styles[`accent-${course.accent}`]}`}
            >
              <div className={styles.cardImage}>
                <img src={course.image} alt={course.name} loading="lazy" />
                <span className={styles.durationBadge}>{course.duration}</span>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.cardName}>{course.name}</h3>
                <p className={styles.cardTagline}>{course.tagline}</p>
                <p className={styles.cardDescription}>{course.description}</p>

                <div className={styles.audienceRow}>
                  {course.audience.map((group) => (
                    <span key={group} className={styles.audiencePill}>
                      {group}
                    </span>
                  ))}
                </div>

                <Link to={course.ctaTo} className={styles.readMore}>
                  Read More
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 12H19M19 12L12 5M19 12L12 19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* ================================================================
            Scholarship note
            ================================================================ */}
        <div className={styles.scholarshipNote}>
          <span className={styles.scholarshipIcon}>🎓</span>
          <div className={styles.scholarshipText}>
            <strong>Scholarship opportunities available</strong>
            <span>
              For eligible participants in select programs — including national
              service members and African graduates.
            </span>
          </div>
          <Link to="/scholarships" className={styles.scholarshipLink}>
            Check eligibility →
          </Link>
        </div>

        {/* ================================================================
            Section CTA
            ================================================================ */}
        <div className={styles.ctaWrapper}>
          <Button variant="primary" color="green" size="lg" href="/courses">
            Explore All Courses
          </Button>
        </div>
      </div>

      {/* ================================================================
          BOTTOM demarcation only (no top wave)
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
          <path
            d="M0,60 C240,15 480,105 720,60 C960,15 1200,105 1440,60 L1440,120 L0,120 Z"
            fill="#f1f5f9"
          />
        </svg>
      </div>
    </section>
  );
};