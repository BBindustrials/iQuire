import React from 'react';
import { Button } from '../common/Button';
import styles from './Problem.module.css';

// Import your image
import problemImage from '../../assets/images/problem-section-image.png';

export const Problem: React.FC = () => {
  return (
    <section className={styles.problem}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.content}>
            <span className={styles.badge}>The Challenge</span>
            <h2 className={styles.title}>
              Your Certificates Aren't Enough. <span className="highlight-gold">Employers Need More.</span>
            </h2>
            <div className={styles.problemStatement}>
              <p>
                Many young Africans are learning, graduating, earning certificates and applying for jobs,
                yet still struggle to demonstrate their capabilities, present themselves professionally,
                discover relevant opportunities and connect with employers.
              </p>
              <div className={styles.employerProblem}>
                <h4>Employers Face the Same Challenge</h4>
                <p>
                  Recruiters often struggle to identify entry-level candidates with the practical skills,
                  professional behaviour and workplace readiness required to contribute effectively with
                  less supervision.
                </p>
              </div>
            </div>
            <div className={styles.solution}>
              <h4>IQuire Bridges the Gap</h4>
              <p>
                IQuire bridges the gap between <strong>learning and employability</strong> by helping
                individuals develop practical skills, build professional identities and connect with
                meaningful opportunities.
              </p>
              <Button variant="primary" color="green" href="/about" className={styles.cta}>
                Discover How IQuire Works
              </Button>
            </div>
          </div>
          <div className={styles.visual}>
            <img 
              src={problemImage} 
              alt="African graduates and young professionals collaborating" 
              className={styles.problemImage}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};