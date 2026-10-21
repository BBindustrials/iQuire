// ============================================================================
// iQuire — About Us Page (Phase 14.11 — DB-driven, robust image handling)
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { ScrollReveal } from '../../components/common/ScrollReveal';
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
// Fallback content
// ============================================================================

const FALLBACK_HERO: AboutHeroContent = {
  badge: 'About IQuire',
  title_prefix: 'Bridging the gap between ',
  title_highlight: 'potential and achievement.',
  subtitle:
    'IQuire is a global platform built to help individuals everywhere access quality training and meaningful career opportunities — no matter where they start.',
};

const FALLBACK_STORY: AboutStoryContent = {
  badge: 'Our Story',
  title: "We exist to unlock what's already there.",
  paragraphs: [
    'Driven by the aspirations of individuals worldwide striving to access quality training and meaningful career opportunities, we founded IQuire. Inspired by their resilience and determination to succeed, we made it our mission to empower people with practical, in-demand skills.',
    "IQuire is more than a learning platform — it is a movement to help individuals excel and stand out in today's competitive global job market.",
    'We provide affordable, interactive, and impactful live classes designed to equip fresh graduates, entry-level professionals, and career changers with relevant digital and life skills for job creation, career growth, and long-term success.',
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
      icon: '🎯',
      title: 'Our Mission',
      paragraphs: [
        "To equip you with the entrepreneurial, soft, and technical skills you need to thrive in today's competitive global job market and become a leader in your field.",
        'We are dedicated to providing you with an accessible, inclusive, and highly practical learning environment designed to prepare you for real-world opportunities and empower your career growth, no matter where you are in the world.',
      ],
    },
    {
      icon: '💡',
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
      text: 'We focus on what truly matters to your career. We equip you with practical, in-demand skills in entrepreneurship, technology, and personal development that help you stand out and succeed in the global job market.',
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
    'Products · Projects · Collaborative Leader · Result-Oriented Analyst',
  bio_paragraphs: [
    'Angel is a career-driven product and project leader with over a decade of experience delivering complex, high-value initiatives across tech, banking, and construction. She founded IQuire after seeing how many talented young professionals were being held back — not by ability, but by access.',
    'Her vision: to build a global platform where anyone with potential can access the practical skills and opportunities needed to thrive — regardless of where they start. Under her leadership, IQuire has grown into a community of learners, mentors, and employers across multiple countries.',
  ],
  photo_url:
    ' ',
  linkedin_url: 'https://www.linkedin.com/in/ioparajohnson/',
};

// ============================================================================
// Helpers — safe image URL
// ============================================================================

/** Returns a valid http(s) URL, or null */
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

  // Track broken image state — if the img fails to load, we hide it
  const [founderImgBroken, setFounderImgBroken] = useState(false);
  const [storyImgBroken, setStoryImgBroken] = useState(false);

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
          // Reset broken flag in case URL changed
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
      ? impactMetrics.map((m) => ({ value: m.value, label: m.label }))
      : [
          { value: '1,000+', label: 'Learners trained' },
          { value: '4', label: 'African countries' },
          { value: '5', label: 'Nigerian states' },
          { value: '350+', label: 'Training sessions' },
        ];

  const showFounderImg = isValidHttpUrl(founder.photo_url) && !founderImgBroken;
  const showStoryImg = isValidHttpUrl(story.image_url) && !storyImgBroken;

  // Founder initials as fallback avatar
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
          HERO
          ================================================================ */}
      <section className={styles.hero}>
        <div className={styles.heroBgBlobOne} aria-hidden="true" />
        <div className={styles.heroBgBlobTwo} aria-hidden="true" />

        <div className="container">
          <ScrollReveal animation="up" className={styles.heroContent}>
            <span className={styles.badge}>{hero.badge}</span>
            <h1 className={styles.heroTitle}>
              {hero.title_prefix}
              <span className={styles.highlight}>{hero.title_highlight}</span>
            </h1>
            <p className={styles.heroSubtitle}>{hero.subtitle}</p>
          </ScrollReveal>
        </div>
      </section>

      {/* ================================================================
          OUR STORY
          ================================================================ */}
      <section className={styles.story}>
        <div className="container">
          <div className={styles.storyGrid}>
            <ScrollReveal animation="left" className={styles.storyContent}>
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
            </ScrollReveal>

            <ScrollReveal
              animation="right"
              delay={1}
              className={styles.storyVisual}
            >
              <div className={styles.storyImageCard}>
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
                    <span className={styles.storyImagePlaceholderIcon}>📷</span>
                    <span>Image unavailable</span>
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ================================================================
          MISSION & VISION
          ================================================================ */}
      <section className={styles.missionVision}>
        <div className="container">
          <ScrollReveal animation="up" className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>{missionVision.badge}</span>
            <h2 className={styles.sectionTitle}>
              {missionVision.title_prefix}
              <span className={styles.highlight}>
                {missionVision.title_highlight}
              </span>
            </h2>
          </ScrollReveal>

          <div className={styles.missionGrid}>
            {missionVision.cards.map((card, i) => (
              <ScrollReveal
                key={i}
                animation={i === 0 ? 'left' : 'right'}
                delay={(i === 0 ? 0 : 1) as 0 | 1}
                className={styles.missionCard}
              >
                <div className={styles.missionIcon}>{card.icon}</div>
                <h3 className={styles.missionTitle}>{card.title}</h3>
                {card.paragraphs.map((p, j) => (
                  <p key={j} className={styles.missionText}>
                    {p}
                  </p>
                ))}
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          OUR COMMITMENT
          ================================================================ */}
      <section className={styles.commitment}>
        <div className="container">
          <ScrollReveal animation="up" className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>{commitment.badge}</span>
            <h2 className={styles.sectionTitle}>{commitment.title}</h2>
          </ScrollReveal>

          <div className={styles.commitmentGrid}>
            {commitment.cards.map((card, i) => (
              <ScrollReveal
                key={i}
                animation="up"
                delay={(i < 3 ? i : 0) as 0 | 1 | 2 | 3}
                className={styles.commitmentCard}
              >
                <div className={styles.commitmentNumber}>{card.number}</div>
                <h3 className={styles.commitmentTitle}>{card.title}</h3>
                <p className={styles.commitmentText}>{card.text}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          IMPACT SNAPSHOT
          ================================================================ */}
      <section className={styles.impactSnapshot}>
        <div className={styles.impactBgBlob} aria-hidden="true" />
        <div className="container">
          <ScrollReveal animation="up" className={styles.sectionHeader}>
            <span className={styles.sectionBadgeLight}>Our Impact</span>
            <h2 className={styles.sectionTitleLight}>
              Numbers that mean something.
            </h2>
          </ScrollReveal>

          <ScrollReveal animation="up" stagger className={styles.impactGrid}>
            {impactItems.map((item, i) => (
              <div key={i} className={styles.impactItem}>
                <div className={styles.impactValue}>{item.value}</div>
                <div className={styles.impactLabel}>{item.label}</div>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* ================================================================
          FOUNDER — with safe image handling
          ================================================================ */}
      <section className={styles.founder}>
        <div className="container">
          <div className={styles.founderGrid}>
            <ScrollReveal animation="left" className={styles.founderVisual}>
              <div className={styles.founderImageFrame}>
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
                        {founderInitials || '👤'}
                      </span>
                      <span className={styles.founderImagePlaceholderHint}>
                        Add a photo in admin
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal
              animation="right"
              delay={1}
              className={styles.founderContent}
            >
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
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                Connect on LinkedIn
              </a>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ================================================================
          FINAL CTA
          ================================================================ */}
      <section className={styles.cta}>
        <div className="container">
          <ScrollReveal animation="zoom" className={styles.ctaInner}>
            <h2 className={styles.ctaTitle}>Ready to unlock your potential?</h2>
            <p className={styles.ctaSubtitle}>
              Join thousands of learners building their careers with IQuire.
            </p>
            <div className={styles.ctaButtons}>
              <Button
                variant="primary"
                color="green"
                size="lg"
                href="/courses"
              >
                Get Started
              </Button>
              <Link to="/contact" className={styles.ctaSecondary}>
                Contact Us →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};