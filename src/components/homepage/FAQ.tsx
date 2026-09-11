import React, { useState } from 'react';
import { Card } from '../common/Card';
import styles from './FAQ.module.css';

interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: 1,
    category: 'General',
    question: 'What is IQuire?',
    answer: 'IQuire is an employability and career development platform helping African graduates, young professionals, NYSC corps members and students build practical skills, professional identity and career confidence to compete for meaningful opportunities.',
  },
  {
    id: 2,
    category: 'Job Seekers',
    question: 'How can I find opportunities?',
    answer: 'You can explore opportunities through our Jobs section. We list full-time jobs, internships, freelance work, volunteer positions, and more. You can filter by type, location, and experience level.',
  },
  {
    id: 3,
    category: 'Recruiters',
    question: 'How can I hire IQuire talent?',
    answer: 'Recruiters can access our trained talent pool by clicking "Hire Our Talent." You\'ll be able to browse verified candidates who have completed our programs and are ready to work.',
  },
  {
    id: 4,
    category: 'Training',
    question: 'What programs does IQuire offer?',
    answer: 'We offer IEESP (Employability Skills Program), Tech360 (no-code technology training), AI Workshops, CV Optimization, LinkedIn Optimization, and Mentorship programs.',
  },
  {
    id: 5,
    category: 'Eligibility',
    question: 'Who can join IQuire?',
    answer: 'Anyone can join IQuire! We serve students, graduates, job seekers, NYSC corps members, young professionals, and career switchers across Africa.',
  },
  {
    id: 6,
    category: 'Payment',
    question: 'Are IQuire programs free or paid?',
    answer: 'IQuire offers a mix of free and paid programs. Some foundational programs are free, while advanced training and specialized workshops may have a fee. Visit our Programs page for specific details.',
  },
  {
    id: 7,
    category: 'NYSC',
    question: 'Can NYSC corps members join?',
    answer: 'Yes! NYSC corps members are a key audience for IQuire. We help corps members build work-readiness skills and connect with opportunities during and after their service year.',
  },
  {
    id: 8,
    category: 'Students',
    question: 'Can current students participate?',
    answer: 'Absolutely. Students can join IQuire to build employability skills before graduation, making them competitive in the job market from day one.',
  },
  {
    id: 9,
    category: 'Verification',
    question: 'How are candidates verified?',
    answer: 'Candidates are verified through program completion, skill assessments, and portfolio reviews. Verified candidates have demonstrated practical skills and workplace readiness.',
  },
];

export const FAQ: React.FC = () => {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className={styles.faq}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.badge}>FAQ</span>
          <h2 className={styles.title}>Frequently Asked <span className="highlight-gold">Questions</span></h2>
          <p className={styles.description}>
            Everything you need to know about IQuire.
          </p>
        </div>
        <div className={styles.faqGrid}>
          {faqs.map((faq) => (
            <Card key={faq.id} className={styles.faqCard}>
              <button
                className={styles.faqButton}
                onClick={() => toggleFAQ(faq.id)}
                aria-expanded={openId === faq.id}
              >
                <span className={styles.faqQuestion}>{faq.question}</span>
                <span className={`${styles.faqIcon} ${openId === faq.id ? styles.open : ''}`}>
                  {openId === faq.id ? '−' : '+'}
                </span>
              </button>
              <div
                className={`${styles.faqAnswer} ${openId === faq.id ? styles.open : ''}`}
              >
                <p>{faq.answer}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};