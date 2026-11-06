/* eslint-disable react-hooks/refs */
// ============================================================================
// iQuire — Hire From Us Section (Phase 14.7 — DB-driven)
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import {
  fetchFeaturedAlumni,
  type Alumni,
} from '../../services/alumni.service';
import styles from './RecruiterSection.module.css';

// ============================================================================
// Talent categories
// ============================================================================

interface TalentNeed {
  id: string;
  label: string;
}

const TALENT_NEEDS: TalentNeed[] = [
  { id: 'interns', label: 'Interns' },
  { id: 'apprentices', label: 'Apprentices' },
  { id: 'entry-level', label: 'Entry Level' },
  { id: 'full-time', label: 'Full Time' },
  { id: 'part-time', label: 'Part Time' },
  { id: 'volunteers', label: 'Volunteers' },
  { id: 'freelancers', label: 'Freelancers' },
  { id: 'tech', label: 'Tech Talent' },
];

// ============================================================================
// Fallback candidate
// ============================================================================

interface DisplayCandidate {
  id: string;
  name: string;
  headline: string;
  careerArea: string;
  skills: string[];
  summary: string;
  iQuireTraining: string;
  linkedin: string;
  photoUrl: string | null;
}

const FALLBACK_CANDIDATE: DisplayCandidate = {
  id: 'fallback',
  name: 'Chidera Okafor',
  headline: 'Junior Product Manager',
  careerArea: 'Product & Technology',
  skills: ['Product Management', 'Agile', 'User Research', 'Data Analysis'],
  summary:
    'Tech 360 graduate with a background in business analysis. Built 3 real product case studies during training. Looking for entry level PM roles.',
  iQuireTraining: 'Tech 360 · Cohort 4',
  linkedin: '#',
  photoUrl: null,
};

// ============================================================================
// Helpers
// ============================================================================

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
};

const alumniToDisplay = (a: Alumni): DisplayCandidate => ({
  id: a.id,
  name: a.full_name,
  headline: a.professional_title,
  careerArea: a.areas_of_expertise?.[0] ?? 'Professional',
  skills: (a.key_skills ?? []).slice(0, 4),
  summary: a.short_summary ?? '',
  iQuireTraining: a.programme
    ? `${a.programme}${a.cohort ? ` · ${a.cohort}` : ''}`
    : 'iQuire Programme',
  linkedin: a.linkedin_url ?? '#',
  photoUrl: a.photo_url,
});

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
// Component
// ============================================================================

export const RecruiterSection: React.FC = () => {
  const [candidate, setCandidate] = useState<DisplayCandidate>(FALLBACK_CANDIDATE);
  const [isLoading, setIsLoading] = useState(true);

  const contentAnim = useSlideUp();
  const cardAnim = useSlideUp();
  const stripAnim = useSlideUp();

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const res = await fetchFeaturedAlumni(1);
      if (!isMounted) return;

      if (res.success && res.data && res.data.length > 0) {
        setCandidate(alumniToDisplay(res.data[0]));
      }

      setIsLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className={styles.hireFromUs}>
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
            id="recruiterNetPattern"
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
        <rect width="100%" height="100%" fill="url(#recruiterNetPattern)" />
      </svg>

      {/* Background blobs */}
      <div className={styles.bgBlobOne} aria-hidden="true" />
      <div className={styles.bgBlobTwo} aria-hidden="true" />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className={styles.grid}>
          {/* ==============================================================
              LEFT — Copy
              ============================================================== */}
          <div ref={contentAnim.ref} className={`${styles.contentColumn} ${styles.slideUpText} ${contentAnim.isVisible ? styles.isVisible : ''}`}>
            <span className={styles.badge}>For Recruiters</span>
            <h2 className={styles.title}>
              Hire talent that&apos;s{' '}
              <span className={styles.highlight}>ready to work.</span>
            </h2>
            <p className={styles.subtitle}>
              Access a growing pool of young professionals trained and
              verified by iQuire. Every candidate has gone through real
              work readiness programs not just certificates.
            </p>

            <div className={styles.valueProps}>
              <div className={styles.valueProp}>
                <div className={styles.valuePropIcon}>✓</div>
                <div>
                  <strong>Pre-trained candidates</strong>
                  <span>
                    Every iQuire member completes work readiness training
                    before appearing in the talent pool.
                  </span>
                </div>
              </div>
              <div className={styles.valueProp}>
                <div className={styles.valuePropIcon}>✓</div>
                <div>
                  <strong>Verified profiles</strong>
                  <span>
                    Skills, education, and readiness are checked. No resume
                    padding.
                  </span>
                </div>
              </div>
              <div className={styles.valueProp}>
                <div className={styles.valuePropIcon}>✓</div>
                <div>
                  <strong>Global ready talent</strong>
                  <span>
                    Diverse candidates across Africa, Europe, and beyond 
                    trained for modern work.
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.talentNeeds}>
              <h3 className={styles.talentNeedsLabel}>Who you can hire:</h3>
              <div className={styles.talentChips}>
                {TALENT_NEEDS.map((need) => (
                  <span key={need.id} className={styles.talentChip}>
                    {need.label}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.ctaGroup}>
              <Button
                variant="primary"
                color="gradient"
                size="lg"
                href="/hire-from-us"
              >
                Hire From Us
              </Button>
              <Link
                to="/register/recruiter"
                className={styles.secondaryLink}
              >
                Register as Recruiter →
              </Link>
            </div>
          </div>

          {/* ==============================================================
              RIGHT — Featured candidate preview
              ============================================================== */}
          <div ref={cardAnim.ref} className={`${styles.visualColumn} ${styles.slideUpText} ${cardAnim.isVisible ? styles.isVisible : ''}`}>
            {isLoading ? (
              <div className={styles.candidateSkeleton} />
            ) : (
              <div className={styles.candidateCard}>
                <div className={styles.candidateHeader}>
                  <div className={styles.candidateAvatar}>
                    {candidate.photoUrl ? (
                      <img src={candidate.photoUrl} alt={candidate.name} />
                    ) : (
                      <span>{getInitials(candidate.name)}</span>
                    )}
                  </div>
                  <div className={styles.candidateHeaderText}>
                    <strong className={styles.candidateName}>
                      {candidate.name}
                    </strong>
                    <span className={styles.candidateHeadline}>
                      {candidate.headline}
                    </span>
                    {candidate.careerArea && (
                      <span className={styles.candidateCareer}>
                        {candidate.careerArea}
                      </span>
                    )}
                  </div>
                  <div className={styles.verifiedBadge}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2L4 6V12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12V6L12 2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 12L11 14L15 10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Verified
                  </div>
                </div>

                <div className={styles.candidateBody}>
                  {candidate.summary && (
                    <p className={styles.candidateSummary}>
                      {candidate.summary}
                    </p>
                  )}

                  {candidate.skills.length > 0 && (
                    <div className={styles.candidateSection}>
                      <h4 className={styles.candidateSectionLabel}>
                        Key skills
                      </h4>
                      <div className={styles.skillsRow}>
                        {candidate.skills.map((skill) => (
                          <span key={skill} className={styles.skillPill}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.candidateSection}>
                    <h4 className={styles.candidateSectionLabel}>
                      iQuire Training
                    </h4>
                    <span className={styles.trainingPill}>
                      {candidate.iQuireTraining}
                    </span>
                  </div>
                </div>

                <div className={styles.candidateFooter}>
                  {candidate.linkedin && candidate.linkedin !== '#' ? (
                    <a
                      href={candidate.linkedin}
                      className={styles.linkedinButton}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      View on LinkedIn
                    </a>
                  ) : (
                    <Link
                      to="/alumni"
                      className={styles.linkedinButton}
                    >
                      View full profile →
                    </Link>
                  )}
                  <span className={styles.candidateNote}>
                    Preview only full profile available after recruiter
                    verification.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ==============================================================
            Bottom CTA strip
            ============================================================== */}
        <div ref={stripAnim.ref} className={`${styles.slideUpText} ${stripAnim.isVisible ? styles.isVisible : ''}`}>
          <div className={styles.bottomStrip}>
            <div className={styles.bottomStripContent}>
              <h3 className={styles.bottomStripTitle}>
                Ready to discover work ready talent?
              </h3>
              <p className={styles.bottomStripText}>
                Register your organisation to access the full iQuire talent
                directory, filter by role, skills, and location.
              </p>
            </div>
            <Button
              variant="primary"
              color="gradient"
              size="lg"
              href="/hire-from-us"
            >
              Browse Talent
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};