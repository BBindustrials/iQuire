// ============================================================================
// iQuire — Hire From Us Section (Phase 7C.9)
// ============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { ScrollReveal } from '../common/ScrollReveal';
import styles from './RecruiterSection.module.css';

// ============================================================================
// Talent categories
// ============================================================================

interface TalentNeed {
  id: string;
  emoji: string;
  label: string;
}

const TALENT_NEEDS: TalentNeed[] = [
  { id: 'interns', emoji: '🎓', label: 'Interns' },
  { id: 'apprentices', emoji: '🛠️', label: 'Apprentices' },
  { id: 'entry-level', emoji: '🚀', label: 'Entry-Level' },
  { id: 'full-time', emoji: '⏱️', label: 'Full-Time' },
  { id: 'part-time', emoji: '📅', label: 'Part-Time' },
  { id: 'volunteers', emoji: '🤝', label: 'Volunteers' },
  { id: 'freelancers', emoji: '💻', label: 'Freelancers' },
  { id: 'tech', emoji: '⚡', label: 'Tech Talent' },
];

// ============================================================================
// Sample candidate card
// ============================================================================

const SAMPLE_CANDIDATE = {
  name: 'Chidera Okafor',
  headline: 'Junior Product Manager',
  careerArea: 'Product & Technology',
  skills: ['Product Management', 'Agile', 'User Research', 'Data Analysis'],
  summary:
    'Tech 360 graduate with a background in business analysis. Built 3 real product case studies during training. Looking for entry-level PM roles.',
  iquireTraining: 'Tech 360 · Cohort 4',
  linkedin: '#',
};

// ============================================================================
// Component
// ============================================================================

export const RecruiterSection: React.FC = () => {
  return (
    <section className={styles.hireFromUs}>
      {/* Background blobs */}
      <div className={styles.bgBlobOne} aria-hidden="true" />
      <div className={styles.bgBlobTwo} aria-hidden="true" />

      <div className="container">
        <div className={styles.grid}>
          {/* ==============================================================
              LEFT — Copy
              ============================================================== */}
          <div className={styles.contentColumn}>
            <ScrollReveal animation="left">
              <span className={styles.badge}>For Recruiters</span>
              <h2 className={styles.title}>
                Hire talent that's{' '}
                <span className={styles.highlight}>ready to work.</span>
              </h2>
              <p className={styles.subtitle}>
                Access a growing pool of young professionals trained and
                verified by IQuire. Every candidate has gone through real
                work-readiness programs — not just certificates.
              </p>
            </ScrollReveal>

            <ScrollReveal animation="left" delay={1}>
              <div className={styles.valueProps}>
                <div className={styles.valueProp}>
                  <div className={styles.valuePropIcon}>✓</div>
                  <div>
                    <strong>Pre-trained candidates</strong>
                    <span>Every IQuire member completes work-readiness training before appearing in the talent pool.</span>
                  </div>
                </div>
                <div className={styles.valueProp}>
                  <div className={styles.valuePropIcon}>✓</div>
                  <div>
                    <strong>Verified profiles</strong>
                    <span>Skills, education, and readiness are checked — no resume padding.</span>
                  </div>
                </div>
                <div className={styles.valueProp}>
                  <div className={styles.valuePropIcon}>✓</div>
                  <div>
                    <strong>Global-ready talent</strong>
                    <span>Diverse candidates across Africa, Europe, and beyond — trained for modern work.</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="left" delay={2}>
              <div className={styles.talentNeeds}>
                <h3 className={styles.talentNeedsLabel}>Who you can hire:</h3>
                <div className={styles.talentChips}>
                  {TALENT_NEEDS.map((need) => (
                    <span key={need.id} className={styles.talentChip}>
                      <span className={styles.talentChipEmoji}>{need.emoji}</span>
                      {need.label}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="up" delay={3}>
              <div className={styles.ctaGroup}>
                <Button
                  variant="primary"
                  color="green"
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
            </ScrollReveal>
          </div>

          {/* ==============================================================
              RIGHT — Candidate preview card
              ============================================================== */}
          <ScrollReveal animation="right" delay={1} className={styles.visualColumn}>
            <div className={styles.candidateCard}>
              <div className={styles.candidateHeader}>
                <div className={styles.candidateAvatar}>
                  <span>CO</span>
                </div>
                <div className={styles.candidateHeaderText}>
                  <strong className={styles.candidateName}>
                    {SAMPLE_CANDIDATE.name}
                  </strong>
                  <span className={styles.candidateHeadline}>
                    {SAMPLE_CANDIDATE.headline}
                  </span>
                  <span className={styles.candidateCareer}>
                    {SAMPLE_CANDIDATE.careerArea}
                  </span>
                </div>
                <div className={styles.verifiedBadge}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
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
                <p className={styles.candidateSummary}>
                  {SAMPLE_CANDIDATE.summary}
                </p>

                <div className={styles.candidateSection}>
                  <h4 className={styles.candidateSectionLabel}>Key skills</h4>
                  <div className={styles.skillsRow}>
                    {SAMPLE_CANDIDATE.skills.map((skill) => (
                      <span key={skill} className={styles.skillPill}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={styles.candidateSection}>
                  <h4 className={styles.candidateSectionLabel}>
                    IQuire Training
                  </h4>
                  <span className={styles.trainingPill}>
                    🎓 {SAMPLE_CANDIDATE.iquireTraining}
                  </span>
                </div>
              </div>

              <div className={styles.candidateFooter}>
                <a
                  href={SAMPLE_CANDIDATE.linkedin}
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
                <span className={styles.candidateNote}>
                  Preview only — full profile available after recruiter
                  verification.
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* ==============================================================
            Bottom CTA strip
            ============================================================== */}
        <ScrollReveal animation="up" delay={2}>
          <div className={styles.bottomStrip}>
            <div className={styles.bottomStripContent}>
              <h3 className={styles.bottomStripTitle}>
                Ready to discover work-ready talent?
              </h3>
              <p className={styles.bottomStripText}>
                Register your organisation to access the full IQuire talent
                directory, filter by role, skills, and location.
              </p>
            </div>
            <Button variant="primary" color="green" size="lg" href="/hire-from-us">
              Browse Talent
            </Button>
          </div>
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
            fill="#f8fafc"
          />
        </svg>
      </div>
    </section>
  );
};