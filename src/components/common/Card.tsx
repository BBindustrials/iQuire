import React from 'react';
import styles from './Card.module.css';
import type { CardProps } from '../../types/design.types';

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  elevation = 'md',
  padding = 'md',
  ...props
}) => {
  const cardClass = `
    ${styles.card}
    ${styles[`elevation-${elevation}`]}
    ${styles[`padding-${padding}`]}
    ${hover ? styles.hover : ''}
    ${className}
  `.trim();

  return (
    <div className={cardClass} {...props}>
      {children}
    </div>
  );
};