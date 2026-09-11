import React from 'react';
import { Button } from '../common/Button';
import styles from './RecruiterSection.module.css';

const talentCategories = [
  { name: 'Project Management', icon: '📋' },
  { name: 'Product Management', icon: '🚀' },
  { name: 'Digital Skills', icon: '💻' },
  { name: 'AI', icon: '🤖' },
  { name: 'Administration', icon: '📊' },
  { name: 'Data Analysis', icon: '📈' },
  { name: 'Communication', icon: '💬' },
  { name: 'Leadership', icon: '👥' },
];

const verificationPoints = [
  { text: 'Completed IQuire training programs', icon: '🎓' },
  { text: 'Demonstrated practical workplace skills', icon: '⚡' },
  { text: 'Professional CV and LinkedIn presence', icon: '📄' },
  { text: 'Career-ready and motivated to contribute', icon: '🎯' },
];

export const RecruiterSection: React.FC = () => {
  return (
    <section className={styles.recruiter}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Left Content */}
          <div className={styles.content}>
            <span className={styles.badge}>For Recruiters</span>
            <h2 className={styles.title}>
              Looking for <span className={styles.highlightGold}>Work-Ready</span> African Talent?
            </h2>
            <h3 className={styles.subtitle}>Hire Talent That Is Ready to Work</h3>
            <p className={styles.description}>
              Access a growing pool of trained young African talent with practical skills,
              professional development and workplace readiness.
            </p>

            {/* Verification Section */}
            <div className={styles.verification}>
              <h4 className={styles.verificationTitle}>
                <span className={styles.verificationIcon}>✓</span>
                What "Trained & Verified" Means
              </h4>
              <ul className={styles.verificationList}>
                {verificationPoints.map((point, index) => (
                  <li key={index} className={styles.verificationItem}>
                    <span className={styles.checkIcon}>{point.icon}</span>
                    <span>{point.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button 
              variant="primary" 
              color="gold" 
              size="lg" 
              href="/hire-talent"
              className={styles.ctaButton}
            >
              Hire Our Talent
            </Button>
          </div>

          {/* Right Categories */}
          <div className={styles.categoriesWrapper}>
            <div className={styles.categoriesHeader}>
              <h4 className={styles.categoriesTitle}>Talent Categories</h4>
              <span className={styles.categoriesCount}>8 Categories</span>
            </div>
            <div className={styles.categoriesGrid}>
              {talentCategories.map((category) => (
                <div key={category.name} className={styles.categoryCard}>
                  <span className={styles.categoryIcon}>{category.icon}</span>
                  <span className={styles.categoryName}>{category.name}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className={styles.statsWrapper}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>1,000+</span>
                <span className={styles.statLabel}>Trained Talent</span>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>5</span>
                <span className={styles.statLabel}>Countries</span>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>350+</span>
                <span className={styles.statLabel}>Sessions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};