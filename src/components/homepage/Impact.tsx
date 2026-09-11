import React from 'react';
import { Button } from '../common/Button';
import styles from './Impact.module.css';

interface Metric {
  label: string;
  value: string;
  icon: string;
}

const metrics: Metric[] = [
  { label: 'Youths Trained', value: '1,000+', icon: '👨‍🎓' },
  { label: 'Nigerian States', value: '5', icon: '🇳🇬' },
  { label: 'African Countries', value: '4', icon: '🌍' },
  { label: 'Programs Delivered', value: '10+', icon: '📚' },
  { label: 'Training Sessions', value: '350+', icon: '📝' },
];

export const Impact: React.FC = () => {
  return (
    <section className={styles.impact}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span className="highlight-gold">1,000+</span> Young Africans Trained.
          </h2>
          <p className={styles.description}>
            Since 2023, IQuire has trained over 1,000 young people across Nigeria and Africa
            through work-readiness, CV and LinkedIn optimization, portfolio development, AI and
            technology skills training delivered through remote and physical programs.
          </p>
          <div className={styles.reach}>
            <span className={styles.reachBadge}>📍 5 Nigerian states</span>
            <span className={styles.reachBadge}>🌍 4 African countries</span>
          </div>
        </div>
        <div className={styles.metricsGrid}>
          {metrics.map((metric) => (
            <div key={metric.label} className={styles.metricCard}>
              <div className={styles.metricIcon}>{metric.icon}</div>
              <div className={styles.metricValue}>{metric.value}</div>
              <div className={styles.metricLabel}>{metric.label}</div>
            </div>
          ))}
        </div>
        <div className={styles.ctaWrapper}>
          <Button variant="secondary" color="gold" size="lg" href="/about#impact">
            See Our Impact
          </Button>
        </div>
      </div>
    </section>
  );
};