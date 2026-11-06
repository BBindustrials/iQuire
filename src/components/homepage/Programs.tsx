// ============================================================================
// iQuire — Programs (Homepage Course Section) — Phase 17.20 (Full-Bleed)
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import {
  fetchFeaturedCourses,
  formatCourseDate,
  type Course,
} from '../../services/courses.service';
import styles from './Programs.module.css';

type FeaturedCourse = Course & {
  next_cohort: {
    schedule: string | null;
    start_date: string | null;
    fee: string | null;
  } | null;
};

// ============================================================================
// Component
// ============================================================================

export const Programs: React.FC = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  const [courses, setCourses] = useState<FeaturedCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const result = await fetchFeaturedCourses();
      if (!isMounted) return;

      if (!result.success) {
        setError(result.error ?? 'Failed to load courses');
      } else {
        setCourses((result.data ?? []) as FeaturedCourse[]);
      }
      setIsLoading(false);
    };
    load();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.programs}>
      {/* Net grid background */}
      <svg
        className={styles.netGrid}
        aria-hidden="true"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 900"
      >
        <defs>
          <pattern
            id="programsNetPattern"
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
        <rect width="100%" height="100%" fill="url(#programsNetPattern)" />
      </svg>

      <div className={styles.concaveTop} aria-hidden="true" />

      {/* HEADER */}
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div
          ref={headerRef}
          className={`${styles.header} ${headerVisible ? styles.headerVisible : ''}`}
        >
          <span className={styles.badge}>Our Courses</span>
          <h2 className={styles.title}>
            Build the skills.{' '}
            <span className={styles.highlight}>Land the job.</span>
          </h2>
          <p className={styles.subtitle}>
            Whether you're leaving school, starting your first job, pivoting into
            tech, or learning to use AI, there's a course built for exactly where
            you are.
          </p>
        </div>
      </div>

      {/* MARQUEE ROW — FULL BLEED */}
      {isLoading && (
        <div className={styles.loadingRowFull}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="container">
          <div className={styles.errorBox}>
            <p>Could not load courses. Please try again later.</p>
          </div>
        </div>
      )}

      {!isLoading && !error && courses.length === 0 && (
        <div className="container">
          <div className={styles.emptyBox}>
            <p>No courses available right now. Check back soon.</p>
          </div>
        </div>
      )}

      {!isLoading && !error && courses.length > 0 && (
        <div className={styles.marqueeWrapper}>
          <div className={styles.marqueeTrack}>
            {courses.map((course) => (
              <CourseCard key={`a-${course.id}`} course={course} />
            ))}
            {courses.map((course) => (
              <CourseCard key={`b-${course.id}`} course={course} />
            ))}
          </div>
        </div>
      )}

      {/* REST OF CONTENT */}
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className={styles.scholarshipNote}>
          <span className={styles.scholarshipIcon} aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L2 8L12 13L22 8L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M6 10V15C6 15 8.5 17 12 17C15.5 17 18 15 18 15V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <div className={styles.scholarshipText}>
            <strong>Scholarship opportunities available</strong>
            <span>
              For eligible participants in select programs, including national
              service members and African graduates.
            </span>
          </div>
          <Link to="/scholarships" className={styles.scholarshipLink}>
            Check eligibility →
          </Link>
        </div>

        <div className={styles.ctaWrapper}>
          <Button variant="primary" color="gradient" size="lg" href="/courses">
            Explore All Courses
          </Button>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// Course Card
// ============================================================================

interface CourseCardProps {
  course: FeaturedCourse;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const image = course.hero_image_url ?? course.thumbnail_url ?? null;
  const nextCohort = course.next_cohort;

  const cohortDate = nextCohort?.start_date
    ? formatCourseDate(nextCohort.start_date)
    : 'TBA';

  const fee = nextCohort?.fee ?? 'TBA';

  const shortDescription = course.description
    ? course.description.length > 100
      ? `${course.description.slice(0, 100)}...`
      : course.description
    : null;

  const forList = course.who_its_for ?? [];

  return (
    <article className={styles.card}>
      {/* LEFT: Image + For list */}
      <div className={styles.cardLeft}>
        {image && (
          <img
            src={image}
            alt={course.title}
            className={styles.cardLeftImage}
            loading="lazy"
          />
        )}

        {/* Glassmorphism overlay */}
        <div className={styles.cardLeftOverlay} />

        <div className={styles.cardLeftContent}>
          <div className={styles.cardLeftFor}>
            <span className={styles.cardLeftForLabel}>For</span>
            <ul className={styles.cardLeftForList}>
              {forList.slice(0, 3).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* RIGHT: Content */}
      <div className={styles.cardRight}>
        <h3 className={styles.cardName}>{course.title}</h3>

        {shortDescription && (
          <p className={styles.cardDescription}>{shortDescription}</p>
        )}

        <div className={styles.cardMetaStrip}>
          <div className={styles.cardMetaItem}>
            <span className={styles.cardMetaLabel}>Duration</span>
            <span className={styles.cardMetaValue}>{course.duration ?? 'TBA'}</span>
          </div>
          <div className={styles.cardMetaDivider} />
          <div className={styles.cardMetaItem}>
            <span className={styles.cardMetaLabel}>Format</span>
            <span className={styles.cardMetaValue}>Fully online</span>
          </div>
          <div className={styles.cardMetaDivider} />
          <div className={styles.cardMetaItem}>
            <span className={styles.cardMetaLabel}>Schedule</span>
            <span className={styles.cardMetaValue}>Evenings</span>
          </div>
        </div>

        <div className={styles.cardCohortStrip}>
          <span className={styles.cardCohortLabel}>Next cohort</span>
          <span className={styles.cardCohortValue}>{cohortDate}</span>
        </div>

        <div className={styles.cardBottomRow}>
          <div className={styles.cardTuitionBlock}>
            <span className={styles.cardTuitionLabel}>Tuition</span>
            <span className={styles.cardTuitionValue}>{fee}</span>
            <span className={styles.cardTuitionNote}>Payment plan available</span>
          </div>

          <Link to={`/courses/${course.slug}`} className={styles.cardCta}>
            View program
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 17L17 7M17 7H8M17 7V16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
};