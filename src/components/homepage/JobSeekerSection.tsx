import React from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import styles from './JobSeekerSection.module.css';

interface Opportunity {
  id: number;
  title: string;
  type: string;
  location: string;
  level: string;
  remote: boolean;
}

const opportunities: Opportunity[] = [
  {
    id: 1,
    title: 'Junior Data Analyst',
    type: 'Full-Time',
    location: 'Lagos',
    level: 'Entry Level',
    remote: false,
  },
  {
    id: 2,
    title: 'Product Intern',
    type: 'Internship',
    location: 'Remote',
    level: 'Entry Level',
    remote: true,
  },
  {
    id: 3,
    title: 'Project Assistant',
    type: 'Contract',
    location: 'Abuja',
    level: 'Entry Level',
    remote: false,
  },
  {
    id: 4,
    title: 'AI Research Intern',
    type: 'Paid Internship',
    location: 'Remote',
    level: 'Entry Level',
    remote: true,
  },
  {
    id: 5,
    title: 'Communications Associate',
    type: 'Full-Time',
    location: 'Lagos',
    level: 'Junior',
    remote: false,
  },
  {
    id: 6,
    title: 'Tech Support Volunteer',
    type: 'Volunteer',
    location: 'Remote',
    level: 'Entry Level',
    remote: true,
  },
];

const opportunityTypes = [
  'Full-time jobs',
  'Part-time opportunities',
  'Paid internships',
  'Unpaid internships',
  'Workshops',
  'Career programs',
  'Freelance opportunities',
  'Contract opportunities',
  'Volunteer opportunities',
  'Graduate trainee programs',
];

export const JobSeekerSection: React.FC = () => {
  return (
    <section className={styles.jobSeeker}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.badge}>For Job Seekers</span>
          <h2 className={styles.title}>
            Your Next <span className="highlight-gold">Opportunity</span> Starts Here.
          </h2>
          <p className={styles.description}>
            Discover relevant jobs, internships, workshops and career development
            opportunities all in one place.
          </p>
        </div>

        {/* Opportunity Categories - KEPT */}
        <div className={styles.opportunityTypes}>
          {opportunityTypes.map((type) => (
            <span key={type} className={styles.typeTag}>
              {type}
            </span>
          ))}
        </div>

        {/* Opportunity Cards - SHAPE/SIZE UNCHANGED */}
        <div className={styles.opportunitiesGrid}>
          {opportunities.map((opp) => (
            <Card key={opp.id} hover className={styles.opportunityCard}>
              <h3 className={styles.opportunityTitle}>{opp.title}</h3>
              <div className={styles.opportunityMeta}>
                <span className={styles.metaTag}>{opp.type}</span>
                <span className={styles.metaTag}>
                  {opp.remote ? '🌍 Remote' : `📍 ${opp.location}`}
                </span>
                <span className={styles.metaTag}>{opp.level}</span>
              </div>
              <Button variant="outline" color="green" size="sm" className={styles.applyButton}>
                View Opportunity
              </Button>
            </Card>
          ))}
        </div>

        <div className={styles.ctaGroup}>
          <Button variant="primary" color="green" size="lg" href="/jobs">
            Explore Opportunities
          </Button>
          <Button variant="secondary" color="gold" size="lg" href="/get-started">
            Build Your Profile
          </Button>
        </div>
      </div>
    </section>
  );
};