import React from 'react';
import { Button } from '../common/Button';
import styles from './HowItWorks.module.css';

// Import your image
import howItWorksImage from '../../assets/images/how-it-works-image.png';

interface Step {
  number: string;
  title: string;
  description: string;
  icon: string;
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Join',
    description: 'Create your IQuire profile based on your career goals.',
    icon: '👤',
  },
  {
    number: '02',
    title: 'Learn',
    description: 'Develop practical, digital and workplace skills through IQuire programs.',
    icon: '📚',
  },
  {
    number: '03',
    title: 'Build',
    description: 'Improve your CV, LinkedIn profile, portfolio and professional identity.',
    icon: '🏗️',
  },
  {
    number: '04',
    title: 'Connect',
    description: 'Discover jobs, internships, workshops, mentors and career opportunities.',
    icon: '🔗',
  },
  {
    number: '05',
    title: 'Get Hired',
    description: 'Connect with employers looking for trained and work-ready talent.',
    icon: '🎯',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className={styles.howItWorks}>
      <div className={styles.container}>
        {/* Header with Image */}
        <div className={styles.headerLayout}>
          <div className={styles.headerContent}>
            <span className={styles.badge}>How It Works</span>
            <h2 className={styles.title}>
              From <span className="highlight-gold">Skills</span> to <span className="highlight-gold">Opportunity</span>
            </h2>
            <p className={styles.description}>
              Your journey from learning to landing meaningful opportunities.
            </p>
          </div>
          <div className={styles.headerImageWrapper}>
            <img 
              src={howItWorksImage} 
              alt="African professional on their career journey" 
              className={styles.headerImage}
              loading="lazy"
            />
          </div>
        </div>

        {/* Steps */}
        <div className={styles.stepsContainer}>
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className={styles.stepWrapper}>
                <div className={styles.stepCard}>
                  <div className={styles.stepNumber}>{step.number}</div>
                  <div className={styles.stepIcon}>{step.icon}</div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDescription}>{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={styles.stepConnector}>
                    <div className={styles.connectorLine}></div>
                    <div className={styles.connectorArrow}>↓</div>
                  </div>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>

        <div className={styles.ctaWrapper}>
          <Button variant="primary" color="green" size="lg" href="/get-started">
            Start Your Journey
          </Button>
        </div>
      </div>
    </section>
  );
};