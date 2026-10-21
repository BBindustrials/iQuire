// ============================================================================
// iQuire — Public Hire From Us Page (Phase 14.9 — fully DB-driven)
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '../../components/common/ScrollReveal';
import { Button } from '../../components/common/Button';
import {
  fetchPublishedFaqsByCategory,
  type Faq,
} from '../../services/faqs.service';
import {
  fetchFeaturedAlumni,
} from '../../services/alumni.service';
import {
  fetchPublishedImpactMetrics,
  type ImpactMetric,
} from '../../services/impact.service';
import type { Alumni } from '../../types/alumni.types';
import styles from './HireFromUs.module.css';

// ============================================================================
// Static content (still hardcoded — informational strips)
// ============================================================================

interface ValueCard {
  icon: string;
  title: string;
  description: string;
}

const VALUE_CARDS: ValueCard[] = [
  {
    icon: '✅',
    title: 'Work-ready, not just qualified',
    description:
      'Every IQuire graduate completes hands-on work-readiness training — communication, teamwork, professional conduct, and digital fluency. You get candidates who can start contributing from week one.',
  },
  {
    icon: '🎯',
    title: 'Pre-vetted skills',
    description:
      'We train across Apprenticeship Preparation, Digital Work Readiness, Tech 360, and AI for Everyone. Every alumni profile shows verified skills and programme outcomes.',
  },
  {
    icon: '🌍',
    title: 'Pan-African talent',
    description:
      'Access a diverse, ambitious talent pool across Nigeria, Ghana, Kenya, and the wider African continent — pre-screened for work ethic and coachability.',
  },
  {
    icon: '⚡',
    title: 'Zero cost to hire',
    description:
      'Access the IQuire talent directory and candidate profiles at no cost. Post opportunities, shortlist candidates, and connect directly — we do not charge placement fees.',
  },
];

interface Step {
  number: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: '01',
    title: 'Create your recruiter account',
    description:
      'Sign up in under 2 minutes with your work email and company details. Our team verifies your organisation within 24–48 hours.',
  },
  {
    number: '02',
    title: 'Browse verified talent',
    description:
      'Once verified, you get full access to the IQuire talent directory — filter by skills, industry, programme, and location.',
  },
  {
    number: '03',
    title: 'Shortlist & connect',
    description:
      'Save candidates to your shortlist and reach out directly. Every profile shows verified skills, work-readiness, and programme history.',
  },
  {
    number: '04',
    title: 'Hire with confidence',
    description:
      'Walk into every interview knowing the candidate has already been trained on the work-readiness fundamentals. No resume padding, no surprises.',
  },
];

// ============================================================================
// Fallback data (used only if DB is empty)
// ============================================================================

interface DisplayStat {
  id: string;
  value: string;
  label: string;
}

const FALLBACK_STATS: DisplayStat[] = [
  { id: 's1', value: '500+', label: 'Trained graduates' },
  { id: 's2', value: '4', label: 'Flagship programmes' },
  { id: 's3', value: '90%', label: 'Work-readiness rate' },
  { id: 's4', value: '48h', label: 'Verification window' },
];

interface DisplayMiniProfile {
  initials: string;
  name: string;
  role: string;
  programme: string;
  skills: string[];
}

const FALLBACK_MINI_PROFILE: DisplayMiniProfile = {
  initials: 'AO',
  name: 'Adaeze O.',
  role: 'Junior Data Analyst',
  programme: 'Tech 360',
  skills: ['SQL', 'Excel', 'Python'],
};

interface DisplayProfile {
  id: string;
  initials: string;
  name: string;
  role: string;
  programme: string;
  skills: string[];
  photoUrl: string | null;
}

const FALLBACK_PROFILES: DisplayProfile[] = [
  {
    id: 'sample-1',
    initials: 'AO',
    name: 'Adaeze O.',
    role: 'Junior Data Analyst',
    programme: 'Tech 360 · Cohort 4',
    skills: ['SQL', 'Excel', 'Python'],
    photoUrl: null,
  },
  {
    id: 'sample-2',
    initials: 'TB',
    name: 'Tunde B.',
    role: 'Product Intern',
    programme: 'Digital Work Readiness · Cohort 12',
    skills: ['Communication', 'Research', 'Figma'],
    photoUrl: null,
  },
  {
    id: 'sample-3',
    initials: 'NK',
    name: 'Ngozi K.',
    role: 'AI Support Specialist',
    programme: 'AI for Everyone · Cohort 2',
    skills: ['Prompt Engineering', 'Customer Support'],
    photoUrl: null,
  },
];

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

const alumniToDisplay = (a: Alumni): DisplayProfile => ({
  id: a.id,
  initials: getInitials(a.full_name),
  name: a.full_name,
  role: a.professional_title,
  programme: a.programme
    ? `${a.programme}${a.cohort ? ` · ${a.cohort}` : ''}`
    : 'IQuire Programme',
  skills: (a.key_skills ?? []).slice(0, 3),
  photoUrl: a.photo_url,
});

const alumniToMiniProfile = (a: Alumni): DisplayMiniProfile => ({
  initials: getInitials(a.full_name),
  name: a.full_name,
  role: a.professional_title,
  programme: a.programme ?? 'IQuire Programme',
  skills: (a.key_skills ?? []).slice(0, 3),
});

// ============================================================================
// Component
// ============================================================================

export const HireFromUs: React.FC = () => {
  // FAQs
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [isFaqLoading, setIsFaqLoading] = useState(true);

  // Featured profiles grid
  const [profiles, setProfiles] = useState<DisplayProfile[]>(FALLBACK_PROFILES);
  const [isProfilesLoading, setIsProfilesLoading] = useState(true);

  // Hero stats (from impact_metrics — top 4 by display_order)
  const [stats, setStats] = useState<DisplayStat[]>(FALLBACK_STATS);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // Hero mini profile (top featured alumnus)
  const [miniProfile, setMiniProfile] = useState<DisplayMiniProfile>(
    FALLBACK_MINI_PROFILE
  );
  const [isMiniLoading, setIsMiniLoading] = useState(true);

  // --------------------------------------------------------------------------
  // Load FAQs
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const res = await fetchPublishedFaqsByCategory('hire-from-us');
      if (!isMounted) return;
      if (res.success && res.data) setFaqs(res.data);
      setIsFaqLoading(false);
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // --------------------------------------------------------------------------
  // Load featured alumni (for grid + mini profile, single fetch)
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      // Fetch 4: 1 for mini + 3 for grid (dedup happens by taking slices)
      const res = await fetchFeaturedAlumni(4);
      if (!isMounted) return;

      if (res.success && res.data && res.data.length > 0) {
        const list = res.data;

        // Mini profile = top featured alumnus
        setMiniProfile(alumniToMiniProfile(list[0]));

        // Grid = up to 3 (skip the first one — it's already in the mini profile)
        const forGrid = list.slice(1, 4);
        if (forGrid.length > 0) {
          setProfiles(forGrid.map(alumniToDisplay));
        } else if (list.length === 1) {
          // Edge case: only 1 featured alumnus exists.
          // Show them in the grid too so it isn't empty.
          setProfiles([alumniToDisplay(list[0])]);
        }
        // else: keep fallback profiles
      }
      // else: keep fallbacks

      setIsProfilesLoading(false);
      setIsMiniLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // --------------------------------------------------------------------------
  // Load hero stats (from impact_metrics — top 4)
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const res = await fetchPublishedImpactMetrics();
      if (!isMounted) return;

      if (res.success && res.data && res.data.length >= 4) {
        // Take first 4 published metrics by display_order
        const top4: DisplayStat[] = res.data.slice(0, 4).map((m: ImpactMetric) => ({
          id: m.id,
          value: m.value,
          label: m.label,
        }));
        setStats(top4);
      } else if (res.success && res.data && res.data.length > 0) {
        // Fewer than 4 metrics exist — use what's available
        const available: DisplayStat[] = res.data.map((m: ImpactMetric) => ({
          id: m.id,
          value: m.value,
          label: m.label,
        }));
        // Pad with fallbacks so the 2×2 layout still looks complete
        const padded = [...available];
        for (let i = available.length; i < 4; i++) {
          padded.push(FALLBACK_STATS[i]);
        }
        setStats(padded.slice(0, 4));
      }
      // else: keep fallback stats

      setIsStatsLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      {/* ================================================================
          HERO
          ================================================================ */}
      <section className={styles.hero}>
        <div className={styles.heroBlobOne} aria-hidden="true" />
        <div className={styles.heroBlobTwo} aria-hidden="true" />

        <div className="container">
          <div className={styles.heroGrid}>
            {/* Left — copy */}
            <ScrollReveal animation="left" className={styles.heroContent}>
              <span className={styles.heroBadge}>
                <span className={styles.heroBadgeDot} />
                For Recruiters
              </span>

              <h1 className={styles.heroTitle}>
                Hire work-ready talent —{' '}
                <span className={styles.heroHighlight}>not risky hires.</span>
              </h1>

              <p className={styles.heroSubtitle}>
                IQuire trains young African professionals on the skills
                employers actually need — communication, teamwork, digital
                fluency, and role-specific expertise. Access the talent
                directory at no cost.
              </p>

              <div className={styles.heroCtas}>
                <Button
                  variant="primary"
                  color="green"
                  size="lg"
                  href="/register/recruiter"
                >
                  Register as Recruiter
                </Button>
                <Link to="/alumni" className={styles.heroSecondary}>
                  Browse Public Alumni →
                </Link>
              </div>

              <div className={styles.heroTrust}>
                <span className={styles.heroTrustItem}>
                  ✅ Free for verified recruiters
                </span>
                <span className={styles.heroTrustDot}>·</span>
                <span className={styles.heroTrustItem}>
                  🔒 Verified organisations only
                </span>
              </div>
            </ScrollReveal>

            {/* Right — stat cards + mini profile */}
            <ScrollReveal
              animation="right"
              delay={1}
              className={styles.heroVisual}
            >
              <div className={styles.statsCard}>
                <div className={styles.statRow}>
                  <div className={styles.statBlock}>
                    <span className={styles.statNumber}>
                      {isStatsLoading ? '—' : stats[0]?.value ?? '—'}
                    </span>
                    <span className={styles.statLabel}>
                      {isStatsLoading ? 'Loading…' : stats[0]?.label ?? ''}
                    </span>
                  </div>
                  <div className={styles.statBlock}>
                    <span className={styles.statNumber}>
                      {isStatsLoading ? '—' : stats[1]?.value ?? '—'}
                    </span>
                    <span className={styles.statLabel}>
                      {isStatsLoading ? 'Loading…' : stats[1]?.label ?? ''}
                    </span>
                  </div>
                </div>
                <div className={styles.statRow}>
                  <div className={styles.statBlock}>
                    <span className={styles.statNumber}>
                      {isStatsLoading ? '—' : stats[2]?.value ?? '—'}
                    </span>
                    <span className={styles.statLabel}>
                      {isStatsLoading ? 'Loading…' : stats[2]?.label ?? ''}
                    </span>
                  </div>
                  <div className={styles.statBlock}>
                    <span className={styles.statNumber}>
                      {isStatsLoading ? '—' : stats[3]?.value ?? '—'}
                    </span>
                    <span className={styles.statLabel}>
                      {isStatsLoading ? 'Loading…' : stats[3]?.label ?? ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mini profile — top featured alumnus */}
              <div className={styles.miniProfile}>
                <div className={styles.miniAvatar}>
                  {isMiniLoading ? '—' : miniProfile.initials}
                </div>
                <div className={styles.miniInfo}>
                  <div className={styles.miniName}>
                    {isMiniLoading ? 'Loading…' : miniProfile.name}
                  </div>
                  <div className={styles.miniRole}>
                    {isMiniLoading
                      ? '—'
                      : `${miniProfile.role}${
                          miniProfile.programme
                            ? ` · ${miniProfile.programme}`
                            : ''
                        }`}
                  </div>
                  {!isMiniLoading && miniProfile.skills.length > 0 && (
                    <div className={styles.miniSkills}>
                      {miniProfile.skills.map((skill) => (
                        <span key={skill} className={styles.miniSkill}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ================================================================
          WHY IQUIRE TALENT
          ================================================================ */}
      <section className={styles.section}>
        <div className="container">
          <ScrollReveal animation="up" className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Why IQuire Talent</span>
            <h2 className={styles.sectionTitle}>
              The candidates you wish you could find.
            </h2>
            <p className={styles.sectionSubtitle}>
              Most entry-level candidates look the same on paper. IQuire
              graduates bring what employers actually need.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="up" stagger className={styles.valuesGrid}>
            {VALUE_CARDS.map((card) => (
              <div key={card.title} className={styles.valueCard}>
                <div className={styles.valueIcon}>{card.icon}</div>
                <h3 className={styles.valueTitle}>{card.title}</h3>
                <p className={styles.valueDesc}>{card.description}</p>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* ================================================================
          HOW IT WORKS
          ================================================================ */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className="container">
          <ScrollReveal animation="up" className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>How It Works</span>
            <h2 className={styles.sectionTitle}>
              From sign-up to shortlist in 4 steps.
            </h2>
          </ScrollReveal>

          <div className={styles.stepsGrid}>
            {STEPS.map((step, i) => (
              <ScrollReveal
                key={step.number}
                animation="up"
                delay={(i < 4 ? i : 0) as 0 | 1 | 2 | 3 | 4}
                className={styles.stepCard}
              >
                <div className={styles.stepNumber}>{step.number}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.description}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          TALENT PREVIEW — DB-driven featured alumni
          ================================================================ */}
      <section className={styles.section}>
        <div className="container">
          <ScrollReveal animation="up" className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Preview Talent</span>
            <h2 className={styles.sectionTitle}>
              See who is already in the directory.
            </h2>
            <p className={styles.sectionSubtitle}>
              A snapshot of IQuire alumni across programmes. Full profiles
              (contact details, CVs, extended work history) are available to
              verified recruiters only.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="up" className={styles.previewCtaRow}>
            <Link to="/alumni" className={styles.previewCta}>
              Browse Public Alumni Profiles →
            </Link>
          </ScrollReveal>

          {isProfilesLoading ? (
            <div className={styles.previewGrid}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className={styles.previewSkeleton} />
              ))}
            </div>
          ) : (
            <ScrollReveal animation="up" stagger className={styles.previewGrid}>
              {profiles.map((profile) => (
                <div key={profile.id} className={styles.previewCard}>
                  <div className={styles.previewAvatar}>
                    {profile.photoUrl ? (
                      <img src={profile.photoUrl} alt={profile.name} />
                    ) : (
                      profile.initials
                    )}
                  </div>
                  <div className={styles.previewName}>{profile.name}</div>
                  <div className={styles.previewRole}>{profile.role}</div>
                  {profile.programme && (
                    <div className={styles.previewProgramme}>
                      {profile.programme}
                    </div>
                  )}
                  {profile.skills.length > 0 && (
                    <div className={styles.previewSkills}>
                      {profile.skills.map((s) => (
                        <span key={s} className={styles.previewSkill}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* ================================================================
          VERIFICATION PROMISE
          ================================================================ */}
      <section className={styles.promiseSection}>
        <div className="container">
          <ScrollReveal animation="up" className={styles.promiseCard}>
            <div className={styles.promiseIcon}>🛡️</div>
            <h2 className={styles.promiseTitle}>
              Verified recruiters, protected talent.
            </h2>
            <p className={styles.promiseText}>
              We verify every recruiter before granting access to the talent
              directory. In return, our alumni opt in to visibility — so you
              only see candidates who want to be contacted. No spam, no cold
              outreach, no wasted effort on either side.
            </p>
            <div className={styles.promiseStats}>
              <div className={styles.promiseStat}>
                <strong>100%</strong>
                <span>Recruiters verified</span>
              </div>
              <div className={styles.promiseStat}>
                <strong>24–48h</strong>
                <span>Typical verification</span>
              </div>
              <div className={styles.promiseStat}>
                <strong>0%</strong>
                <span>Placement fees</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ================================================================
          FAQ — DB-driven (category = 'hire-from-us')
          ================================================================ */}
      {!isFaqLoading && faqs.length > 0 && (
        <section className={styles.section}>
          <div className="container">
            <ScrollReveal animation="up" className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>FAQ</span>
              <h2 className={styles.sectionTitle}>
                Questions from recruiters.
              </h2>
            </ScrollReveal>

            <ScrollReveal animation="up" className={styles.faqList}>
              {faqs.map((faq) => (
                <details key={faq.id} className={styles.faqItem}>
                  <summary className={styles.faqQuestion}>
                    {faq.question}
                    <span className={styles.faqIcon}>+</span>
                  </summary>
                  <div className={styles.faqAnswer}>
                    {faq.answer.split('\n').map((para, i) => (
                      <p key={i}>{para || <br />}</p>
                    ))}
                  </div>
                </details>
              ))}
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ================================================================
          FINAL CTA
          ================================================================ */}
      <section className={styles.finalCta}>
        <div className={styles.finalCtaBlob} aria-hidden="true" />
        <div className="container">
          <ScrollReveal animation="up" className={styles.finalCtaInner}>
            <h2 className={styles.finalCtaTitle}>
              Ready to meet your next hire?
            </h2>
            <p className={styles.finalCtaSubtitle}>
              Join the recruiters already accessing IQuire's work-ready talent
              pool.
            </p>
            <div className={styles.finalCtaButtons}>
              <Button
                variant="primary"
                color="gold"
                size="lg"
                href="/register/recruiter"
              >
                Register as Recruiter
              </Button>
              <Link to="/alumni" className={styles.finalCtaSecondary}>
                Browse Talent →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};