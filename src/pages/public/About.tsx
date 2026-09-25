// ============================================================================
// iQuire — About Us Page (Phase 7C.12)
// ============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { ScrollReveal } from '../../components/common/ScrollReveal';
import styles from './About.module.css';

// Founder image placeholder — replace with local file
const founderPhoto =
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=600&fit=crop&crop=face';

// ============================================================================
// Component
// ============================================================================

export const About: React.FC = () => {
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
            <span className={styles.badge}>About IQuire</span>
            <h1 className={styles.heroTitle}>
              Bridging the gap between{' '}
              <span className={styles.highlight}>potential and achievement.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              IQuire is a global platform built to help individuals everywhere
              access quality training and meaningful career opportunities — no
              matter where they start.
            </p>
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
              <span className={styles.sectionBadge}>Our Story</span>
              <h2 className={styles.sectionTitle}>
                We exist to unlock what's already there.
              </h2>

              <p>
                Driven by the aspirations of individuals worldwide striving to
                access quality training and meaningful career opportunities, we
                founded IQuire. Inspired by their resilience and determination
                to succeed, we made it our mission to empower people with
                practical, in-demand skills.
              </p>

              <p>
                IQuire is more than a learning platform — it is a movement to
                help individuals excel and stand out in today's competitive
                global job market.
              </p>

              <p>
                We provide affordable, interactive, and impactful live classes
                designed to equip fresh graduates, entry-level professionals,
                and career changers with relevant digital and life skills for
                job creation, career growth, and long-term success.
              </p>

              <p className={styles.storyConclusion}>
                Whether you are starting your career, upskilling, or
                transitioning into a new path, IQuire is your trusted partner
                in growth, success, and unlocking your true potential.
              </p>
            </ScrollReveal>

            <ScrollReveal animation="right" delay={1} className={styles.storyVisual}>
              <div className={styles.storyImageCard}>
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=800&fit=crop"
                  alt="Young professionals collaborating"
                  loading="lazy"
                />
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
            <span className={styles.sectionBadge}>What Drives Us</span>
            <h2 className={styles.sectionTitle}>
              Our Mission & <span className={styles.highlight}>Vision</span>
            </h2>
          </ScrollReveal>

          <div className={styles.missionGrid}>
            <ScrollReveal animation="left" className={styles.missionCard}>
              <div className={styles.missionIcon}>🎯</div>
              <h3 className={styles.missionTitle}>Our Mission</h3>
              <p className={styles.missionText}>
                To equip you with the entrepreneurial, soft, and technical
                skills you need to thrive in today's competitive global job
                market and become a leader in your field.
              </p>
              <p className={styles.missionText}>
                We are dedicated to providing you with an accessible, inclusive,
                and highly practical learning environment designed to prepare
                you for real-world opportunities and empower your career growth,
                no matter where you are in the world.
              </p>
            </ScrollReveal>

            <ScrollReveal animation="right" delay={1} className={styles.missionCard}>
              <div className={styles.missionIcon}>💡</div>
              <h3 className={styles.missionTitle}>Why We Care</h3>
              <p className={styles.missionText}>
                Because your potential is limitless, and we see it.
              </p>
              <p className={styles.missionText}>
                We understand the challenges on your path to success, and we are
                committed to clearing the way for you. Our vision is a world
                where every individual has the skills, confidence, and
                opportunity not only to thrive, but to become a source of
                inspiration in their community.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ================================================================
          OUR COMMITMENT
          ================================================================ */}
      <section className={styles.commitment}>
        <div className="container">
          <ScrollReveal animation="up" className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Our Commitment</span>
            <h2 className={styles.sectionTitle}>
              Three promises we keep.
            </h2>
          </ScrollReveal>

          <div className={styles.commitmentGrid}>
            <ScrollReveal animation="up" delay={1} className={styles.commitmentCard}>
              <div className={styles.commitmentNumber}>01</div>
              <h3 className={styles.commitmentTitle}>
                Real Skills for Real Careers
              </h3>
              <p className={styles.commitmentText}>
                We focus on what truly matters to your career. We equip you with
                practical, in-demand skills in entrepreneurship, technology, and
                personal development that help you stand out and succeed in the
                global job market.
              </p>
            </ScrollReveal>

            <ScrollReveal animation="up" delay={2} className={styles.commitmentCard}>
              <div className={styles.commitmentNumber}>02</div>
              <h3 className={styles.commitmentTitle}>Access for All</h3>
              <p className={styles.commitmentText}>
                We believe education should never be a barrier to your success.
                That is why we keep our courses affordable and provide free
                resources to ensure financial limitations never stand in the way
                of your growth.
              </p>
            </ScrollReveal>

            <ScrollReveal animation="up" delay={3} className={styles.commitmentCard}>
              <div className={styles.commitmentNumber}>03</div>
              <h3 className={styles.commitmentTitle}>
                A Thriving Global Community
              </h3>
              <p className={styles.commitmentText}>
                Success is stronger when built together. At IQuire, you are part
                of a dynamic global community of learners, mentors, and
                professionals dedicated to supporting you, guiding your journey,
                and connecting you to real career opportunities.
              </p>
            </ScrollReveal>
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
            <div className={styles.impactItem}>
              <div className={styles.impactValue}>1,000+</div>
              <div className={styles.impactLabel}>Learners trained</div>
            </div>
            <div className={styles.impactItem}>
              <div className={styles.impactValue}>4</div>
              <div className={styles.impactLabel}>African countries</div>
            </div>
            <div className={styles.impactItem}>
              <div className={styles.impactValue}>5</div>
              <div className={styles.impactLabel}>Nigerian states</div>
            </div>
            <div className={styles.impactItem}>
              <div className={styles.impactValue}>350+</div>
              <div className={styles.impactLabel}>Training sessions</div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ================================================================
          FOUNDER
          ================================================================ */}
      <section className={styles.founder}>
        <div className="container">
          <div className={styles.founderGrid}>
            <ScrollReveal animation="left" className={styles.founderVisual}>
              <div className={styles.founderImageFrame}>
                <div className={styles.founderImageOffset} aria-hidden="true" />
                <div className={styles.founderImageCard}>
                  <img
                    src={founderPhoto}
                    alt="Angel Oparajohnson — Founder of IQuire"
                    loading="lazy"
                  />
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="right" delay={1} className={styles.founderContent}>
              <span className={styles.sectionBadge}>Meet the Founder</span>
              <h2 className={styles.founderName}>Angel Oparajohnson</h2>
              <p className={styles.founderCredentials}>
                PMP · PRINCE2 · AgilePM · PSPO II · ITIL
              </p>
              <p className={styles.founderRoles}>
                Products · Projects · Collaborative Leader · Result-Oriented Analyst
              </p>

              <div className={styles.founderBio}>
                <p>
                  Angel is a career-driven product and project leader with over
                  a decade of experience delivering complex, high-value
                  initiatives across tech, banking, and construction. She
                  founded IQuire after seeing how many talented young
                  professionals were being held back — not by ability, but by
                  access.
                </p>
                <p>
                  Her vision: to build a global platform where anyone with
                  potential can access the practical skills and opportunities
                  needed to thrive — regardless of where they start. Under her
                  leadership, IQuire has grown into a community of learners,
                  mentors, and employers across multiple countries.
                </p>
              </div>

              <a
                href="https://www.linkedin.com/in/ioparajohnson/"
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
            <h2 className={styles.ctaTitle}>
              Ready to unlock your potential?
            </h2>
            <p className={styles.ctaSubtitle}>
              Join thousands of learners building their careers with IQuire.
            </p>
            <div className={styles.ctaButtons}>
              <Button variant="primary" color="green" size="lg" href="/register">
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