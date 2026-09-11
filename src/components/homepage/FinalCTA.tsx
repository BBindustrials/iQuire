import React from 'react';
import { Button } from '../common/Button';
import styles from './FinalCTA.module.css';

// Import your image
import finalCTAImage from '../../assets/images/final-cta-image.png';

export const FinalCTA: React.FC = () => {
  return (
    <section className={styles.finalCTA}>
      <div className="container">
        <div className={styles.content}>
          {/* Image */}
          <div className={styles.imageWrapper}>
            <img 
              src={finalCTAImage} 
              alt="African graduates ready for career opportunities" 
              className={styles.ctaImage}
              loading="lazy"
            />
          </div>

          {/* Text Content */}
          <div className={styles.textContent}>
            <h2 className={styles.title}>
              Your Career Starts With <span className="highlight-gold">Being Ready.</span>
            </h2>
            <p className={styles.subtitle}>
              Learn the skills. Build your professional identity. Connect with opportunities. Launch your career.
            </p>
            <div className={styles.ctaGroup}>
              <Button variant="primary" color="green" size="lg" href="/get-started">
                Get Trained
              </Button>
              <Button variant="secondary" color="gold" size="lg" href="/hire-talent">
                Hire Talent
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};