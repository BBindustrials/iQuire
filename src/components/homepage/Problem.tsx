// ============================================================================
// iQuire — Problem Section (Animated)
// ============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { ScrollReveal } from '../common/ScrollReveal';
import styles from './Problem.module.css';

// Placeholder images — swap to local when ready
import problemImage from '../../assets/images/problem-section-image.png';

const avatar1 =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face';
const avatar2 =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face';
const avatar3 =
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face';
const avatar4 =
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face';
const avatar5 =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face';
const avatar6 =
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face';

interface Question {
  id: string;
  quote: string;
  persona: string;
  avatar: string;
}

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    quote:
      "I graduated six months ago. Everyone keeps asking what I'm doing next — and I have no idea.",
    persona: 'Recent graduate',
    avatar: avatar1,
  },
  {
    id: 'q2',
    quote:
      'Every entry-level job wants 2 years of experience. How am I supposed to get experience if no one will give me a chance?',
    persona: 'Job seeker',
    avatar: avatar2,
  },
  {
    id: 'q3',
    quote:
      "I want to prepare for an apprenticeship, but I don't even know what skills I'm missing.",
    persona: 'Apprentice-hopeful',
    avatar: avatar3,
  },
  {
    id: 'q4',
    quote:
      "I have the right degree. I just don't know how to talk about myself, or what employers actually want.",
    persona: 'Entry-level professional',
    avatar: avatar4,
  },
  {
    id: 'q5',
    quote:
      "I'm not sure which career path is right for me — or how to find out.",
    persona: 'Career explorer',
    avatar: avatar5,
  },
  {
    id: 'q6',
    quote: "My CV isn't getting any replies. Is it actually strong enough?",
    persona: 'Active applicant',
    avatar: avatar6,
  },
];

interface Pillar {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const ICONS = {
  train: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 3L2 8L12 13L22 8L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M6 10V15C6 15 8.5 17 12 17C15.5 17 18 15 18 15V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  prepare: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.35" />
      <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  hire: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 7V5C8 3.9 8.9 3 10 3H14C15.1 3 16 3.9 16 5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M2 13H22" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
};

const PILLARS: Pillar[] = [
  {
    id: 'train',
    title: 'Train',
    description: 'Build the real, work-ready skills employers actually want.',
    icon: ICONS.train,
  },
  {
    id: 'prepare',
    title: 'Prepare',
    description: 'CVs, interviews, career clarity, and professional confidence.',
    icon: ICONS.prepare,
  },
  {
    id: 'hire',
    title: 'Get Hired',
    description: 'Connect with opportunities, recruiters, and the path forward.',
    icon: ICONS.hire,
  },
];

export const Problem: React.FC = () => {
  return (
    <section className={styles.problem}>
      <div className="container">
        {/* TOP */}
        <div className={styles.topGrid}>
          <ScrollReveal animation="left" className={styles.topContent}>
            <span className={styles.badge}>The Real Problem</span>

            <h2 className={styles.title}>
              You've got the degree.{' '}
              <span className={styles.highlight}>But where's the job?</span>
            </h2>

            <p className={styles.intro}>
              Millions of young people finish school every year — and hit the same
              wall. No one taught them how to transition from education into a real
              career. That's the gap <strong>IQuire</strong> closes.
            </p>

            <div className={styles.turningPoint}>
              <p className={styles.turningPointText}>
                You're not the problem. <em>The path was never built for you.</em>
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="right" delay={2} className={styles.topVisual}>
            <img
              src={problemImage}
              alt="A young graduate at a crossroads"
              className={styles.problemImage}
              loading="lazy"
            />
          </ScrollReveal>
        </div>

        {/* MIDDLE — header */}
        <ScrollReveal animation="up" className={styles.questionsHeader}>
          <h3 className={styles.questionsTitle}>
            Does any of this sound familiar?
          </h3>
          <p className={styles.questionsSubtitle}>
            These are the questions we hear every single day.
          </p>
        </ScrollReveal>

        {/* MIDDLE — bubbles (staggered) */}
        <ScrollReveal animation="up" stagger className={styles.questionsGrid}>
          {QUESTIONS.map((q) => (
            <div key={q.id} className={styles.bubbleCard}>
              <div className={styles.bubbleAvatar}>
                <img src={q.avatar} alt={q.persona} loading="lazy" />
              </div>

              <div className={styles.bubbleBody}>
                <div className={styles.bubbleQuote}>
                  <span className={styles.bubbleQuoteMark}>"</span>
                  <p className={styles.bubbleText}>{q.quote}</p>
                  <span className={styles.bubbleTail} aria-hidden="true" />
                </div>
                <span className={styles.bubblePersona}>{q.persona}</span>
              </div>
            </div>
          ))}
        </ScrollReveal>

        {/* BOTTOM — solution */}
        <ScrollReveal animation="zoom" delay={1}>
          <div className={styles.solution}>
            <h3 className={styles.solutionTitle}>
              Here's how IQuire changes that.
            </h3>

            <div className={styles.pillars}>
              {PILLARS.map((p, index) => (
                <div key={p.id} className={styles.pillar}>
                  <div className={styles.pillarIcon}>{p.icon}</div>
                  <h4 className={styles.pillarTitle}>{p.title}</h4>
                  <p className={styles.pillarDesc}>{p.description}</p>
                  {index < PILLARS.length - 1 && (
                    <span className={styles.pillarArrow} aria-hidden="true">
                      →
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.ctaGroup}>
              <Button variant="primary" color="green" size="lg" href="/about">
                Discover How IQuire Works
              </Button>
              <Link to="/courses" className={styles.secondaryLink}>
                See our Courses →
              </Link>
            </div>
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
            fill="#ffffff"
          />
        </svg>
      </div>
    </section>
  );
};