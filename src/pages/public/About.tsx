/* eslint-disable react-hooks/refs */
// ============================================================================
// iQuire — About Us Page (Phase 14.11 — DB-driven, robust image handling)
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import {
  fetchAboutContent,
  type AboutHeroContent,
  type AboutStoryContent,
  type AboutMissionVisionContent,
  type AboutCommitmentContent,
  type AboutFounderContent,
} from '../../services/about.service';
import {
  fetchPublishedImpactMetrics,
  type ImpactMetric,
} from '../../services/impact.service';
import styles from './About.module.css';

// ============================================================================
// Custom Hook for 4s Animation
// ============================================================================
const useSlideUp = (threshold = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
};

// ============================================================================
// Fallback content
// ============================================================================

const FALLBACK_HERO: AboutHeroContent = {
  badge: 'About IQuire',
  title_prefix: 'Bridging the gap between ',
  title_highlight: 'potential and achievement.',
  subtitle:
    'IQuire is a global platform built to help individuals everywhere access quality training and meaningful career opportunities no matter where they start.',
};

const FALLBACK_STORY: AboutStoryContent = {
  badge: 'Our Story',
  title: "We exist to unlock what's already there.",
  paragraphs: [
    'Driven by the aspirations of individuals worldwide striving to access quality training and meaningful career opportunities, we founded IQuire. Inspired by their resilience and determination to succeed, we made it our mission to empower people with practical, in demand skills.',
    "IQuire is more than a learning platform it is a movement to help individuals excel and stand out in today's competitive global job market.",
    'We provide affordable, interactive, and impactful live classes designed to equip fresh graduates, entry level professionals, and career changers with relevant digital and life skills for job creation, career growth, and long term success.',
    'Whether you are starting your career, upskilling, or transitioning into a new path, IQuire is your trusted partner in growth, success, and unlocking your true potential.',
  ],
  image_url:
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=800&fit=crop',
};

const FALLBACK_MISSION_VISION: AboutMissionVisionContent = {
  badge: 'What Drives Us',
  title_prefix: 'Our Mission & ',
  title_highlight: 'Vision',
  cards: [
    {
      icon: 'target',
      title: 'Our Mission',
      paragraphs: [
        "To equip you with the entrepreneurial, soft, and technical skills you need to thrive in today's competitive global job market and become a leader in your field.",
        'We are dedicated to providing you with an accessible, inclusive, and highly practical learning environment designed to prepare you for real world opportunities and empower your career growth, no matter where you are in the world.',
      ],
    },
    {
      icon: 'bulb',
      title: 'Why We Care',
      paragraphs: [
        'Because your potential is limitless, and we see it.',
        'We understand the challenges on your path to success, and we are committed to clearing the way for you. Our vision is a world where every individual has the skills, confidence, and opportunity not only to thrive, but to become a source of inspiration in their community.',
      ],
    },
  ],
};

const FALLBACK_COMMITMENT: AboutCommitmentContent = {
  badge: 'Our Commitment',
  title: 'Three promises we keep.',
  cards: [
    {
      number: '01',
      title: 'Real Skills for Real Careers',
      text: 'We focus on what truly matters to your career. We equip you with practical, in demand skills in entrepreneurship, technology, and personal development that help you stand out and succeed in the global job market.',
    },
    {
      number: '02',
      title: 'Access for All',
      text: 'We believe education should never be a barrier to your success. That is why we keep our courses affordable and provide free resources to ensure financial limitations never stand in the way of your growth.',
    },
    {
      number: '03',
      title: 'A Thriving Global Community',
      text: 'Success is stronger when built together. At IQuire, you are part of a dynamic global community of learners, mentors, and professionals dedicated to supporting you, guiding your journey, and connecting you to real career opportunities.',
    },
  ],
};

const FALLBACK_FOUNDER: AboutFounderContent = {
  badge: 'Meet the Founder',
  name: 'Angel Oparajohnson',
  credentials: 'PMP · PRINCE2 · AgilePM · PSPO II · ITIL',
  roles:
    'Products · Projects · Collaborative Leader · Result Oriented Analyst',
  bio_paragraphs: [
    'Angel is a career driven product and project leader with over a decade of experience delivering complex, high value initiatives across tech, banking, and construction. She founded IQuire after seeing how many talented young professionals were being held back not by ability, but by access.',
    'Her vision: to build a global platform where anyone with potential can access the practical skills and opportunities needed to thrive regardless of where they start. Under her leadership, IQuire has grown into a community of learners, mentors, and employers across multiple countries.',
  ],
  photo_url: '',
  linkedin_url: 'https://www.linkedin.com/in/ioparajohnson/',
};

// ============================================================================
// Helpers
// ============================================================================

const isValidHttpUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const getIconSvg = (iconName: string) => {
  if (iconName === 'target') {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    );
  }
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.45.56 2.75 1.5 3.5.76.76 1.23 1.52 1.41 2.5" />
    </svg>
  );
};

// ============================================================================
// Component
// ============================================================================

export const About: React.FC = () => {
  const [hero, setHero] = useState<AboutHeroContent>(FALLBACK_HERO);
  const [story, setStory] = useState<AboutStoryContent>(FALLBACK_STORY);
  const [missionVision, setMissionVision] = useState<AboutMissionVisionContent>(
    FALLBACK_MISSION_VISION
  );
  const [commitment, setCommitment] =
    useState<AboutCommitmentContent>(FALLBACK_COMMITMENT);
  const [founder, setFounder] = useState<AboutFounderContent>(FALLBACK_FOUNDER);
  const [impactMetrics, setImpactMetrics] = useState<ImpactMetric[]>([]);
  const [, setIsLoading] = useState(true);

  const [founderImgBroken, setFounderImgBroken] = useState(false);
  const [storyImgBroken, setStoryImgBroken] = useState(false);

  // Animation Hooks
  const heroAnim = useSlideUp();
  const storyAnim = useSlideUp();
  const storyImgAnim = useSlideUp();
  const missionHeaderAnim = useSlideUp();
  const missionCard1Anim = useSlideUp();
  const missionCard2Anim = useSlideUp();
  const commitHeaderAnim = useSlideUp();
  const commitCard1Anim = useSlideUp();
  const commitCard2Anim = useSlideUp();
  const commitCard3Anim = useSlideUp();
  const impactHeaderAnim = useSlideUp();
  const impactGridAnim = useSlideUp();
  const founderImgAnim = useSlideUp();
  const founderTextAnim = useSlideUp();
  const ctaAnim = useSlideUp();

  // --------------------------------------------------------------------------
  // Load
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const [aboutRes, impactRes] = await Promise.all([
        fetchAboutContent(),
        fetchPublishedImpactMetrics(),
      ]);

      if (!isMounted) return;

      if (aboutRes.success && aboutRes.data) {
        const b = aboutRes.data;
        if (b.hero) setHero(b.hero);
        if (b.story) setStory(b.story);
        if (b.mission_vision) setMissionVision(b.mission_vision);
        if (b.commitment) setCommitment(b.commitment);
        if (b.founder) {
          setFounderImgBroken(false);
          setFounder(b.founder);
        }
      }

      if (impactRes.success && impactRes.data && impactRes.data.length > 0) {
        setImpactMetrics(impactRes.data.slice(0, 4));
      }

      setIsLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // --------------------------------------------------------------------------
  // Derived
  // --------------------------------------------------------------------------
  const impactItems =
    impactMetrics.length > 0
      ? impactMetrics.map((m, i) => ({ 
          value: m.value, 
          label: m.label,
          accent: ['teal', 'gradient', 'blue', 'cyan'][i % 4] 
        }))
      : [
          { value: '1,000+', label: 'Learners trained', accent: 'teal' },
          { value: '4', label: 'African countries', accent: 'gradient' },
          { value: '5', label: 'Nigerian states', accent: 'blue' },
          { value: '350+', label: 'Training sessions', accent: 'cyan' },
        ];

  const showFounderImg = isValidHttpUrl(founder.photo_url) && !founderImgBroken;
  const showStoryImg = isValidHttpUrl(story.image_url) && !storyImgBroken;

  const founderInitials = founder.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.about}>
      {/* ================================================================
          HERO (Netted Light Blue)
          ================================================================ */}
      <section className={styles.hero}>
        <svg className={styles.netGrid} aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900">
          <defs>
            <pattern id="heroNetPattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#000000" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#heroNetPattern)" />
        </svg>
        
        <div className={styles.heroBgBlobOne} aria-hidden="true" />
        <div className={styles.heroBgBlobTwo} aria-hidden="true" />

        <div className="container">
          <div ref={heroAnim.ref} className={styles.heroContent}>
            <div className={`${styles.slideUpText} ${heroAnim.isVisible ? styles.isVisible : ''}`}>
              <span className={styles.badge}>{hero.badge}</span>
              <h1 className={styles.heroTitle}>
                {hero.title_prefix}
                <span className={styles.highlight}>{hero.title_highlight}</span>
              </h1>
              <p className={styles.heroSubtitle}>{hero.subtitle}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          OUR STORY
          ================================================================ */}
      <section className={styles.story}>
        <div className="container">
          <div className={styles.storyGrid}>
            <div ref={storyAnim.ref} className={styles.storyContent}>
              <div className={`${styles.slideUpText} ${storyAnim.isVisible ? styles.isVisible : ''}`}>
                <span className={styles.sectionBadge}>{story.badge}</span>
                <h2 className={styles.sectionTitle}>{story.title}</h2>

                {story.paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className={
                      i === story.paragraphs.length - 1
                        ? styles.storyConclusion
                        : undefined
                    }
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>

            <div ref={storyImgAnim.ref} className={styles.storyVisual}>
              <div className={`${styles.storyImageCard} ${styles.slideUpText} ${storyImgAnim.isVisible ? styles.isVisible : ''}`} style={{ transitionDelay: '0.15s' }}>
                {showStoryImg ? (
                  <img
                    key={story.image_url}
                    src={story.image_url}
                    alt="Young professionals collaborating"
                    loading="lazy"
                    onError={() => setStoryImgBroken(true)}
                  />
                ) : (
                  <div className={styles.storyImagePlaceholder}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>Image unavailable</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          MISSION & VISION (Netted Grey)
          ================================================================ */}
      <section className={styles.missionVision}>
        <svg className={styles.netGrid} aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900">
          <defs>
            <pattern id="mvNetPattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#000000" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mvNetPattern)" />
        </svg>

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div ref={missionHeaderAnim.ref} className={styles.sectionHeader}>
            <div className={`${styles.slideUpText} ${missionHeaderAnim.isVisible ? styles.isVisible : ''}`}>
              <span className={styles.sectionBadge}>{missionVision.badge}</span>
              <h2 className={styles.sectionTitle}>
                {missionVision.title_prefix}
                <span className={styles.highlight}>
                  {missionVision.title_highlight}
                </span>
              </h2>
            </div>
          </div>

          <div className={styles.missionGrid}>
            {/* Card 1 */}
            <div ref={missionCard1Anim.ref}>
              <div className={`${styles.missionCard} ${styles.slideUpText} ${missionCard1Anim.isVisible ? styles.isVisible : ''}`} style={{ transitionDelay: '0.1s' }}>
                <div className={styles.missionIcon}>
                  {getIconSvg(missionVision.cards[0].icon)}
                </div>
                <h3 className={styles.missionTitle}>{missionVision.cards[0].title}</h3>
                {missionVision.cards[0].paragraphs.map((p, j) => (
                  <p key={j} className={styles.missionText}>{p}</p>
                ))}
              </div>
            </div>

            {/* Card 2 */}
            <div ref={missionCard2Anim.ref}>
              <div className={`${styles.missionCard} ${styles.slideUpText} ${missionCard2Anim.isVisible ? styles.isVisible : ''}`} style={{ transitionDelay: '0.2s' }}>
                <div className={styles.missionIcon}>
                  {getIconSvg(missionVision.cards[1].icon)}
                </div>
                <h3 className={styles.missionTitle}>{missionVision.cards[1].title}</h3>
                {missionVision.cards[1].paragraphs.map((p, j) => (
                  <p key={j} className={styles.missionText}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          OUR COMMITMENT
          ================================================================ */}
      <section className={styles.commitment}>
        <div className="container">
          <div ref={commitHeaderAnim.ref} className={styles.sectionHeader}>
            <div className={`${styles.slideUpText} ${commitHeaderAnim.isVisible ? styles.isVisible : ''}`}>
              <span className={styles.sectionBadge}>{commitment.badge}</span>
              <h2 className={styles.sectionTitle}>{commitment.title}</h2>
            </div>
          </div>

          <div className={styles.commitmentGrid}>
            {/* Card 1 */}
            <div ref={commitCard1Anim.ref}>
              <div className={`${styles.commitmentCard} ${styles.slideUpText} ${commitCard1Anim.isVisible ? styles.isVisible : ''}`} style={{ transitionDelay: '0.1s' }}>
                <div className={styles.commitmentNumber}>{commitment.cards[0].number}</div>
                <h3 className={styles.commitmentTitle}>{commitment.cards[0].title}</h3>
                <p className={styles.commitmentText}>{commitment.cards[0].text}</p>
              </div>
            </div>

            {/* Card 2 */}
            <div ref={commitCard2Anim.ref}>
              <div className={`${styles.commitmentCard} ${styles.slideUpText} ${commitCard2Anim.isVisible ? styles.isVisible : ''}`} style={{ transitionDelay: '0.2s' }}>
                <div className={styles.commitmentNumber}>{commitment.cards[1].number}</div>
                <h3 className={styles.commitmentTitle}>{commitment.cards[1].title}</h3>
                <p className={styles.commitmentText}>{commitment.cards[1].text}</p>
              </div>
            </div>

            {/* Card 3 */}
            <div ref={commitCard3Anim.ref}>
              <div className={`${styles.commitmentCard} ${styles.slideUpText} ${commitCard3Anim.isVisible ? styles.isVisible : ''}`} style={{ transitionDelay: '0.3s' }}>
                <div className={styles.commitmentNumber}>{commitment.cards[2].number}</div>
                <h3 className={styles.commitmentTitle}>{commitment.cards[2].title}</h3>
                <p className={styles.commitmentText}>{commitment.cards[2].text}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          IMPACT SNAPSHOT (Netted Light Blue + Flexes)
          ================================================================ */}
      <section className={styles.impactSnapshot}>
        <svg className={styles.netGrid} aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900">
          <defs>
            <pattern id="impactNetPattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#000000" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#impactNetPattern)" />
        </svg>
        
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div ref={impactHeaderAnim.ref} className={styles.sectionHeader}>
            <div className={`${styles.slideUpText} ${impactHeaderAnim.isVisible ? styles.isVisible : ''}`}>
              <span className={styles.sectionBadgeLight}>Our Impact</span>
              <h2 className={styles.sectionTitleLight}>Numbers that mean something.</h2>
            </div>
          </div>

          <div ref={impactGridAnim.ref}>
            <div className={`${styles.impactGrid} ${styles.slideUpText} ${impactGridAnim.isVisible ? styles.isVisible : ''}`} style={{ transitionDelay: '0.15s' }}>
              {impactItems.map((item, i) => (
                <div key={i} className={styles.impactItem}>
                  <span className={`${styles.impactValue} ${styles[`accent-${item.accent}`]}`}>
                    {item.value}
                  </span>
                  <span className={styles.impactLabel}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          FOUNDER
          ================================================================ */}
      <section className={styles.founder}>
        <div className="container">
          <div className={styles.founderGrid}>
            <div ref={founderImgAnim.ref} className={styles.founderVisual}>
              <div className={`${styles.founderImageFrame} ${styles.slideUpText} ${founderImgAnim.isVisible ? styles.isVisible : ''}`}>
                <div className={styles.founderImageOffset} aria-hidden="true" />
                <div className={styles.founderImageCard}>
                  {showFounderImg ? (
                    <img
                      key={founder.photo_url}
                      src={founder.photo_url}
                      alt={`${founder.name} — Founder of IQuire`}
                      loading="lazy"
                      onError={() => setFounderImgBroken(true)}
                    />
                  ) : (
                    <div className={styles.founderImagePlaceholder}>
                      <span className={styles.founderImagePlaceholderIcon}>
                        {founderInitials || (
                          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        )}
                      </span>
                      <span className={styles.founderImagePlaceholderHint}>
                        Add a photo in admin
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div ref={founderTextAnim.ref} className={styles.founderContent}>
              <div className={`${styles.slideUpText} ${founderTextAnim.isVisible ? styles.isVisible : ''}`} style={{ transitionDelay: '0.15s' }}>
                <span className={styles.sectionBadge}>{founder.badge}</span>
                <h2 className={styles.founderName}>{founder.name}</h2>
                <p className={styles.founderCredentials}>{founder.credentials}</p>
                <p className={styles.founderRoles}>{founder.roles}</p>

                <div className={styles.founderBio}>
                  {founder.bio_paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>

                <a
                  href={founder.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.founderLinkedIn}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  Connect on LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          FINAL CTA (Netted Light Blue)
          ================================================================ */}
      <section className={styles.cta}>
        <svg className={styles.netGrid} aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900">
          <defs>
            <pattern id="ctaNetPattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#000000" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ctaNetPattern)" />
        </svg>
        
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div ref={ctaAnim.ref} className={styles.ctaInner}>
            <div className={`${styles.slideUpText} ${ctaAnim.isVisible ? styles.isVisible : ''}`}>
              <h2 className={styles.ctaTitle}>Ready to unlock your potential?</h2>
              <p className={styles.ctaSubtitle}>
                Join thousands of learners building their careers with IQuire.
              </p>
              <div className={styles.ctaButtons}>
                <Button
                  variant="primary"
                  color="gradient"
                  size="lg"
                  href="/courses"
                >
                  Get Started
                </Button>
                <Link to="/contact" className={styles.ctaSecondary}>
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};