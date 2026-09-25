// ============================================================================
// iQuire — Individual Alumni Profile (Phase 9B.3)
// ============================================================================
// Follows the client's 4-stage progressive disclosure spec:
//   1. Profile Introduction
//   2. Professional Summary
//   3. Alumni Feedback
//   4. View More (Trustpilot + LinkedIn)
// ============================================================================

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ScrollReveal } from '../../components/common/ScrollReveal';
import {
  fetchAlumniById,
  fetchPublishedAlumni,
  type Alumni,
} from '../../services/alumni.service';
import styles from './AlumniProfile.module.css';

// ============================================================================
// Component
// ============================================================================

export const AlumniProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [alumni, setAlumni] = useState<Alumni | null>(null);
  const [otherAlumni, setOtherAlumni] = useState<Alumni[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // Load alumni by ID
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      // Fetch the profile
      const result = await fetchAlumniById(id);
      if (!isMounted) return;

      if (!result.success || !result.data) {
        setError(result.error ?? 'Alumni not found');
        setIsLoading(false);
        return;
      }

      // Public page: only show published alumni
      if (result.data.status !== 'published') {
        setError('Alumni not found');
        setIsLoading(false);
        return;
      }

      setAlumni(result.data);

      // Fetch other alumni for "More profiles" (exclude current)
      const allResult = await fetchPublishedAlumni();
      if (!isMounted) return;
      if (allResult.success && allResult.data) {
        setOtherAlumni(
          allResult.data.filter((a) => a.id !== id).slice(0, 3)
        );
      }

      setIsLoading(false);
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // --------------------------------------------------------------------------
  // Scroll to top on id change
  // --------------------------------------------------------------------------
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // --------------------------------------------------------------------------
  // Loading
  // --------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className={styles.profilePage}>
        <div className="container">
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading profile…</p>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Not found
  // --------------------------------------------------------------------------
  if (error || !alumni) {
    return (
      <div className={styles.profilePage}>
        <div className="container">
          <div className={styles.notFoundState}>
            <div className={styles.notFoundIcon}>🔍</div>
            <h1 className={styles.notFoundTitle}>Alumni not found</h1>
            <p className={styles.notFoundText}>
              This profile may have been removed or is no longer available.
            </p>
            <div className={styles.notFoundActions}>
              <Link to="/alumni" className={styles.notFoundPrimary}>
                ← Back to Alumni
              </Link>
              <Link to="/" className={styles.notFoundSecondary}>
                Go to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const initials = alumni.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.profilePage}>
      {/* ================================================================
          BREADCRUMB
          ================================================================ */}
      <div className={styles.breadcrumb}>
        <div className="container">
          <Link to="/alumni" className={styles.breadcrumbLink}>
            ← Back to Alumni
          </Link>
        </div>
      </div>

      {/* ================================================================
          STAGE 1 — PROFILE INTRODUCTION
          ================================================================ */}
      <section className={styles.hero}>
        <div className={styles.heroBgBlob} aria-hidden="true" />

        <div className="container">
          <ScrollReveal animation="up" className={styles.heroInner}>
            {/* Photo */}
            <div className={styles.heroPhotoWrapper}>
              <div className={styles.heroPhotoFrame}>
                {alumni.photo_url ? (
                  <img
                    src={alumni.photo_url}
                    alt={alumni.full_name}
                    className={styles.heroPhoto}
                  />
                ) : (
                  <div className={styles.heroPhotoPlaceholder}>
                    {initials}
                  </div>
                )}
              </div>
            </div>

            {/* Intro */}
            <div className={styles.heroContent}>
              <div className={styles.heroBadges}>
                {alumni.programme && (
                  <span className={styles.programmeBadge}>
                    {alumni.programme}
                  </span>
                )}
                {alumni.cohort && (
                  <span className={styles.cohortBadge}>{alumni.cohort}</span>
                )}
              </div>

              <h1 className={styles.heroName}>{alumni.full_name}</h1>
              <p className={styles.heroTitle}>{alumni.professional_title}</p>
              <p className={styles.heroSummary}>{alumni.short_summary}</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ================================================================
          STAGE 2 — PROFESSIONAL SUMMARY
          ================================================================ */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.contentLayout}>
            <div className={styles.mainColumn}>
              {/* Professional Summary */}
              {alumni.professional_summary && (
                <ScrollReveal animation="up">
                  <div className={styles.block}>
                    <h2 className={styles.blockTitle}>
                      Professional Summary
                    </h2>
                    <div className={styles.prose}>
                      {alumni.professional_summary
                        .split('\n')
                        .filter(Boolean)
                        .map((paragraph, i) => (
                          <p key={i}>{paragraph}</p>
                        ))}
                    </div>
                  </div>
                </ScrollReveal>
              )}

              {/* Career Experience */}
              {alumni.career_experience && (
                <ScrollReveal animation="up" delay={1}>
                  <div className={styles.block}>
                    <h2 className={styles.blockTitle}>Career Experience</h2>
                    <div className={styles.prose}>
                      {alumni.career_experience
                        .split('\n')
                        .filter(Boolean)
                        .map((paragraph, i) => (
                          <p key={i}>{paragraph}</p>
                        ))}
                    </div>
                  </div>
                </ScrollReveal>
              )}

              {/* Skills */}
              {((alumni.areas_of_expertise ?? []).length > 0 ||
                (alumni.key_skills ?? []).length > 0) && (
                <ScrollReveal animation="up" delay={2}>
                  <div className={styles.block}>
                    <h2 className={styles.blockTitle}>
                      Skills & Expertise
                    </h2>

                    {(alumni.areas_of_expertise ?? []).length > 0 && (
                      <div className={styles.skillsGroup}>
                        <h3 className={styles.skillsGroupLabel}>
                          Areas of Expertise
                        </h3>
                        <div className={styles.skillsTags}>
                          {alumni.areas_of_expertise.map((tag) => (
                            <span key={tag} className={styles.skillTagPrimary}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {(alumni.key_skills ?? []).length > 0 && (
                      <div className={styles.skillsGroup}>
                        <h3 className={styles.skillsGroupLabel}>
                          Key Skills
                        </h3>
                        <div className={styles.skillsTags}>
                          {alumni.key_skills.map((tag) => (
                            <span key={tag} className={styles.skillTag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              )}
            </div>

            {/* Sidebar */}
            <aside className={styles.sideColumn}>
              {/* Quick Info */}
              <ScrollReveal animation="up" delay={1}>
                <div className={styles.sideCard}>
                  <h3 className={styles.sideCardTitle}>Quick Info</h3>

                  <div className={styles.sideRow}>
                    <span className={styles.sideLabel}>Programme</span>
                    <span className={styles.sideValue}>
                      {alumni.programme ?? '—'}
                    </span>
                  </div>

                  <div className={styles.sideRow}>
                    <span className={styles.sideLabel}>Cohort</span>
                    <span className={styles.sideValue}>
                      {alumni.cohort ?? '—'}
                    </span>
                  </div>

                  <div className={styles.sideRow}>
                    <span className={styles.sideLabel}>Current Role</span>
                    <span className={styles.sideValue}>
                      {alumni.professional_title}
                    </span>
                  </div>
                </div>
              </ScrollReveal>

              {/* Contact CTA */}
              <ScrollReveal animation="up" delay={2}>
                <div className={styles.sideCardAccent}>
                  <h3 className={styles.sideCardTitleLight}>
                    Interested in hiring?
                  </h3>
                  <p className={styles.sideCardTextLight}>
                    Register as a recruiter to connect with IQuire-trained
                    talent like {alumni.full_name.split(' ')[0]}.
                  </p>
                  <Link to="/hire-from-us" className={styles.sideCardCtaLight}>
                    Hire From Us →
                  </Link>
                </div>
              </ScrollReveal>
            </aside>
          </div>
        </div>
      </section>

      {/* ================================================================
          STAGE 3 — ALUMNI FEEDBACK
          ================================================================ */}
      {alumni.feedback && (
        <section className={styles.feedbackSection}>
          <div className={styles.feedbackBgBlob} aria-hidden="true" />
          <div className="container">
            <ScrollReveal animation="zoom" className={styles.feedbackInner}>
              <div className={styles.feedbackQuoteMark}>"</div>
              <blockquote className={styles.feedbackQuote}>
                {alumni.feedback}
              </blockquote>
              <div className={styles.feedbackAttribution}>
                <span className={styles.feedbackDash}>—</span>
                <span className={styles.feedbackName}>{alumni.full_name}</span>
                {alumni.programme && (
                  <>
                    <span className={styles.feedbackDot}>·</span>
                    <span className={styles.feedbackProgramme}>
                      {alumni.programme}
                    </span>
                  </>
                )}
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ================================================================
          STAGE 4 — VIEW MORE (Trustpilot + LinkedIn)
          ================================================================ */}
      {(alumni.trustpilot_url || alumni.linkedin_url) && (
        <section className={styles.section}>
          <div className="container">
            <ScrollReveal animation="up" className={styles.viewMoreHeader}>
              <h2 className={styles.viewMoreTitle}>
                More about {alumni.full_name.split(' ')[0]}
              </h2>
              <p className={styles.viewMoreSubtitle}>
                Verify their professional profile and read reviews from the
                IQuire community.
              </p>
            </ScrollReveal>

            <ScrollReveal animation="up" stagger className={styles.viewMoreGrid}>
              {/* Trustpilot */}
              {alumni.trustpilot_url && (
                <a
                  href={alumni.trustpilot_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.viewMoreCard}
                >
                  <div className={styles.viewMoreIconWrapper}>
                    <span className={styles.viewMoreIcon}>⭐</span>
                  </div>
                  <div className={styles.viewMoreCardContent}>
                    <h3 className={styles.viewMoreCardTitle}>
                      Trustpilot Review
                    </h3>
                    <p className={styles.viewMoreCardText}>
                      Read {alumni.full_name.split(' ')[0]}'s review of their
                      IQuire experience.
                    </p>
                    <span className={styles.viewMoreCardLink}>
                      View Trustpilot Review →
                    </span>
                  </div>
                </a>
              )}

              {/* LinkedIn */}
              {alumni.linkedin_url && (
                <a
                  href={alumni.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.viewMoreCard}
                >
                  <div className={`${styles.viewMoreIconWrapper} ${styles.viewMoreIconLinkedIn}`}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </div>
                  <div className={styles.viewMoreCardContent}>
                    <h3 className={styles.viewMoreCardTitle}>
                      LinkedIn Profile
                    </h3>
                    <p className={styles.viewMoreCardText}>
                      View {alumni.full_name.split(' ')[0]}'s professional
                      profile and experience.
                    </p>
                    <span className={styles.viewMoreCardLink}>
                      View LinkedIn Profile →
                    </span>
                  </div>
                </a>
              )}
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ================================================================
          MORE PROFILES
          ================================================================ */}
      {otherAlumni.length > 0 && (
        <section className={styles.moreProfilesSection}>
          <div className="container">
            <ScrollReveal animation="up" className={styles.moreProfilesHeader}>
              <h2 className={styles.moreProfilesTitle}>More profiles</h2>
              <p className={styles.moreProfilesSubtitle}>
                Discover other IQuire alumni
              </p>
            </ScrollReveal>

            <ScrollReveal
              animation="up"
              stagger
              className={styles.moreProfilesGrid}
            >
              {otherAlumni.map((a) => (
                <Link
                  key={a.id}
                  to={`/alumni/${a.id}`}
                  className={styles.moreCard}
                >
                  <div className={styles.moreCardPhoto}>
                    {a.photo_url ? (
                      <img src={a.photo_url} alt={a.full_name} loading="lazy" />
                    ) : (
                      <div className={styles.moreCardPhotoPlaceholder}>
                        {a.full_name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className={styles.moreCardBody}>
                    <h3 className={styles.moreCardName}>{a.full_name}</h3>
                    <p className={styles.moreCardTitle}>
                      {a.professional_title}
                    </p>
                    {a.programme && (
                      <span className={styles.moreCardProgramme}>
                        {a.programme}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ================================================================
          FINAL CTA
          ================================================================ */}
      <section className={styles.finalCta}>
        <div className={styles.finalCtaBgBlob} aria-hidden="true" />
        <div className="container">
          <ScrollReveal animation="up" className={styles.finalCtaInner}>
            <h2 className={styles.finalCtaTitle}>
              Ready to write your own story?
            </h2>
            <p className={styles.finalCtaSubtitle}>
              Join thousands of learners building their careers with IQuire.
            </p>
            <div className={styles.finalCtaButtons}>
              <Link to="/register" className={styles.finalCtaPrimary}>
                Get Started Free
              </Link>
              <Link to="/alumni" className={styles.finalCtaSecondary}>
                Browse More Alumni →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};