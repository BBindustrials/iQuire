/* eslint-disable react-hooks/set-state-in-effect */
// ============================================================================
// iQuire — Public: Alumni Profile (Phase 17.21 — Slug + CV/Portfolio)
// ============================================================================

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  fetchAlumniBySlug,
  fetchPublishedAlumni,
  type Alumni,
} from '../../services/alumni.service';
import styles from './AlumniProfile.module.css';

// ============================================================================
// Component
// ============================================================================

export const AlumniProfile: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [alumni, setAlumni] = useState<Alumni | null>(null);
  const [otherAlumni, setOtherAlumni] = useState<Alumni[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // Load alumni by slug
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!slug) return;
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      const result = await fetchAlumniBySlug(slug);
      if (!isMounted) return;

      if (!result.success || !result.data) {
        setError(result.error ?? 'Alumni not found');
        setIsLoading(false);
        return;
      }

      if (result.data.status !== 'published') {
        setError('Alumni not found');
        setIsLoading(false);
        return;
      }

      // ✓ Store current alumni
      const currentAlumni = result.data;
      setAlumni(currentAlumni);

      const allResult = await fetchPublishedAlumni();
      if (!isMounted) return;
      if (allResult.success && allResult.data) {
        setOtherAlumni(
          allResult.data
            .filter((a) => a.id !== currentAlumni.id)
            .slice(0, 3)
        );
      }

      setIsLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // --------------------------------------------------------------------------
  // Loading State
  // --------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className={styles.profilePage}>
        <div className="container">
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Not Found State
  // --------------------------------------------------------------------------
  if (error || !alumni) {
    return (
      <div className={styles.profilePage}>
        <div className="container">
          <div className={styles.notFoundState}>
            <div className={styles.notFoundIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
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

  // Helper for "More profiles" links — prefer slug, fallback to id
  const getAlumniLink = (a: Alumni) => `/alumni/${a.slug ?? a.id}`;

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.profilePage}>
      {/* BREADCRUMB */}
      <div className={styles.breadcrumb}>
        <div className="container">
          <Link to="/alumni" className={styles.breadcrumbLink}>
            ← Back to Alumni
          </Link>
        </div>
      </div>

      {/* STAGE 1 — PROFILE INTRODUCTION */}
      <section className={styles.hero}>
        <svg className={styles.netGrid} aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900">
          <defs>
            <pattern id="profileHeroNet" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#000000" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#profileHeroNet)" />
        </svg>

        <div className={styles.heroBgBlob} aria-hidden="true" />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className={`${styles.heroInner} ${styles.slideUpText}`}>
            <div className={styles.heroPhotoWrapper}>
              <div className={styles.heroPhotoFrame}>
                {alumni.photo_url ? (
                  <img src={alumni.photo_url} alt={alumni.full_name} className={styles.heroPhoto} />
                ) : (
                  <div className={styles.heroPhotoPlaceholder}>{initials}</div>
                )}
              </div>
            </div>

            <div className={styles.heroContent}>
              <div className={styles.heroBadges}>
                {alumni.programme && <span className={styles.programmeBadge}>{alumni.programme}</span>}
                {alumni.cohort && <span className={styles.cohortBadge}>{alumni.cohort}</span>}
              </div>

              <h1 className={styles.heroName}>{alumni.full_name}</h1>
              <p className={styles.heroTitle}>{alumni.professional_title}</p>
              <p className={styles.heroSummary}>{alumni.short_summary}</p>
            </div>
          </div>
        </div>
      </section>

      {/* STAGE 2 — PROFESSIONAL SUMMARY */}
      <section className={styles.section}>
        <div className="container">
          <div className={`${styles.contentLayout} ${styles.slideUpText} ${styles['delay-1']}`}>
            <div className={styles.mainColumn}>
              {alumni.professional_summary && (
                <div className={styles.block}>
                  <h2 className={styles.blockTitle}>Professional Summary</h2>
                  <div className={styles.prose}>
                    {alumni.professional_summary.split('\n').filter(Boolean).map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}

              {alumni.career_experience && (
                <div className={styles.block}>
                  <h2 className={styles.blockTitle}>Career Experience</h2>
                  <div className={styles.prose}>
                    {alumni.career_experience.split('\n').filter(Boolean).map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}

              {((alumni.areas_of_expertise ?? []).length > 0 || (alumni.key_skills ?? []).length > 0) && (
                <div className={styles.block}>
                  <h2 className={styles.blockTitle}>Skills & Expertise</h2>
                  {(alumni.areas_of_expertise ?? []).length > 0 && (
                    <div className={styles.skillsGroup}>
                      <h3 className={styles.skillsGroupLabel}>Areas of Expertise</h3>
                      <div className={styles.skillsTags}>
                        {alumni.areas_of_expertise?.map((tag) => (
                          <span key={tag} className={styles.skillTagPrimary}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(alumni.key_skills ?? []).length > 0 && (
                    <div className={styles.skillsGroup}>
                      <h3 className={styles.skillsGroupLabel}>Key Skills</h3>
                      <div className={styles.skillsTags}>
                        {alumni.key_skills?.map((tag) => (
                          <span key={tag} className={styles.skillTag}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <aside className={styles.sideColumn}>
              <div className={styles.sideCard}>
                <h3 className={styles.sideCardTitle}>Quick Info</h3>
                <div className={styles.sideRow}>
                  <span className={styles.sideLabel}>Programme</span>
                  <span className={styles.sideValue}>{alumni.programme ?? '—'}</span>
                </div>
                <div className={styles.sideRow}>
                  <span className={styles.sideLabel}>Cohort</span>
                  <span className={styles.sideValue}>{alumni.cohort ?? '—'}</span>
                </div>
                <div className={styles.sideRow}>
                  <span className={styles.sideLabel}>Current Role</span>
                  <span className={styles.sideValue}>{alumni.professional_title}</span>
                </div>
              </div>

              <div className={styles.sideCardAccent}>
                <h3 className={styles.sideCardTitleLight}>Interested in hiring?</h3>
                <p className={styles.sideCardTextLight}>
                  Register as a recruiter to connect with iQuire-trained talent like {alumni.full_name.split(' ')[0]}.
                </p>
                <Link to="/hire-from-us" className={styles.sideCardCtaLight}>Hire From Us →</Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* STAGE 3 — ALUMNI FEEDBACK */}
      {alumni.feedback && (
        <section className={styles.feedbackSection}>
          <svg className={styles.netGrid} aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900">
            <defs>
              <pattern id="feedbackNet" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#ffffff" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#feedbackNet)" />
          </svg>

          <div className={styles.feedbackBgBlob} aria-hidden="true" />
          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <div className={`${styles.feedbackInner} ${styles.slideUpText} ${styles['delay-2']}`}>
              <div className={styles.feedbackQuoteMark}>"</div>
              <blockquote className={styles.feedbackQuote}>{alumni.feedback}</blockquote>
              <div className={styles.feedbackAttribution}>
                <span className={styles.feedbackDash}>—</span>
                <span className={styles.feedbackName}>{alumni.full_name}</span>
                {alumni.programme && (
                  <>
                    <span className={styles.feedbackDot}>·</span>
                    <span className={styles.feedbackProgramme}>{alumni.programme}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* STAGE 4 — VIEW MORE (CV, Portfolio, LinkedIn, Trustpilot) */}
      {(alumni.trustpilot_url || alumni.linkedin_url || alumni.cv_url || alumni.portfolio_url) && (
        <section className={styles.section}>
          <div className="container">
            <div className={`${styles.slideUpText} ${styles['delay-3']}`}>
              <div className={styles.viewMoreHeader}>
                <h2 className={styles.viewMoreTitle}>More about {alumni.full_name.split(' ')[0]}</h2>
                <p className={styles.viewMoreSubtitle}>
                  Verify their professional profile and see their work.
                </p>
              </div>

              <div className={styles.viewMoreGrid}>
                {/* CV */}
                {alumni.cv_url && (
                  <a href={alumni.cv_url} target="_blank" rel="noopener noreferrer" className={styles.viewMoreCard}>
                    <div className={styles.viewMoreIconWrapper}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                    </div>
                    <div className={styles.viewMoreCardContent}>
                      <h3 className={styles.viewMoreCardTitle}>CV</h3>
                      <p className={styles.viewMoreCardText}>
                        View {alumni.full_name.split(' ')[0]}'s curriculum vitae.
                      </p>
                      <span className={styles.viewMoreCardLink}>Open CV →</span>
                    </div>
                  </a>
                )}

                {/* Portfolio */}
                {alumni.portfolio_url && (
                  <a href={alumni.portfolio_url} target="_blank" rel="noopener noreferrer" className={styles.viewMoreCard}>
                    <div className={styles.viewMoreIconWrapper}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                    </div>
                    <div className={styles.viewMoreCardContent}>
                      <h3 className={styles.viewMoreCardTitle}>Portfolio</h3>
                      <p className={styles.viewMoreCardText}>
                        Explore {alumni.full_name.split(' ')[0]}'s projects and work.
                      </p>
                      <span className={styles.viewMoreCardLink}>View Portfolio →</span>
                    </div>
                  </a>
                )}

                {/* LinkedIn */}
                {alumni.linkedin_url && (
                  <a href={alumni.linkedin_url} target="_blank" rel="noopener noreferrer" className={styles.viewMoreCard}>
                    <div className={`${styles.viewMoreIconWrapper} ${styles.viewMoreIconLinkedIn}`}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </div>
                    <div className={styles.viewMoreCardContent}>
                      <h3 className={styles.viewMoreCardTitle}>LinkedIn Profile</h3>
                      <p className={styles.viewMoreCardText}>
                        View {alumni.full_name.split(' ')[0]}'s professional profile and experience.
                      </p>
                      <span className={styles.viewMoreCardLink}>View LinkedIn Profile →</span>
                    </div>
                  </a>
                )}

                {/* Trustpilot */}
                {alumni.trustpilot_url && (
                  <a href={alumni.trustpilot_url} target="_blank" rel="noopener noreferrer" className={styles.viewMoreCard}>
                    <div className={styles.viewMoreIconWrapper}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </div>
                    <div className={styles.viewMoreCardContent}>
                      <h3 className={styles.viewMoreCardTitle}>Trustpilot Review</h3>
                      <p className={styles.viewMoreCardText}>
                        Read {alumni.full_name.split(' ')[0]}'s review of their iQuire experience.
                      </p>
                      <span className={styles.viewMoreCardLink}>View Trustpilot Review →</span>
                    </div>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* MORE PROFILES */}
      {otherAlumni.length > 0 && (
        <section className={styles.moreProfilesSection}>
          <div className="container">
            <div className={`${styles.slideUpText} ${styles['delay-4']}`}>
              <div className={styles.moreProfilesHeader}>
                <h2 className={styles.moreProfilesTitle}>More profiles</h2>
                <p className={styles.moreProfilesSubtitle}>Discover other iQuire alumni</p>
              </div>

              <div className={styles.moreProfilesGrid}>
                {otherAlumni.map((a) => (
                  <Link key={a.id} to={getAlumniLink(a)} className={styles.moreCard}>
                    <div className={styles.moreCardPhoto}>
                      {a.photo_url ? (
                        <img src={a.photo_url} alt={a.full_name} loading="lazy" />
                      ) : (
                        <div className={styles.moreCardPhotoPlaceholder}>
                          {a.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className={styles.moreCardBody}>
                      <h3 className={styles.moreCardName}>{a.full_name}</h3>
                      <p className={styles.moreCardTitle}>{a.professional_title}</p>
                      {a.programme && <span className={styles.moreCardProgramme}>{a.programme}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section className={styles.finalCta}>
        <svg className={styles.netGrid} aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900">
          <defs>
            <pattern id="ctaNet" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#000000" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ctaNet)" />
        </svg>

        <div className={styles.finalCtaBgBlob} aria-hidden="true" />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className={`${styles.finalCtaInner} ${styles.slideUpText} ${styles['delay-5']}`}>
            <h2 className={styles.finalCtaTitle}>Ready to write your own story?</h2>
            <p className={styles.finalCtaSubtitle}>Join thousands of learners building their careers with iQuire.</p>
            <div className={styles.finalCtaButtons}>
              <Link to="/courses" className={styles.finalCtaPrimary}>Get Started Free</Link>
              <Link to="/alumni" className={styles.finalCtaSecondary}>Browse More Alumni →</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};