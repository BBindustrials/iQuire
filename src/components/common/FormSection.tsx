import React from 'react';
import styles from './FormSection.module.css';

export interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`${styles.section} ${className}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.divider}></div>
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
};