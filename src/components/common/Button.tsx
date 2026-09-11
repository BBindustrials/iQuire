import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Button.module.css';
import type { ButtonProps } from '../../types/design.types';

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  color = 'green',
  children,
  onClick,
  href,
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  fullWidth = false,
  icon,
  ...props
}) => {
  const buttonClass = `
    ${styles.button}
    ${styles[variant]}
    ${styles[size]}
    ${styles[color]}
    ${fullWidth ? styles.fullWidth : ''}
    ${loading ? styles.loading : ''}
    ${className}
  `.trim();

  const content = (
    <>
      {icon && <span className={styles.icon}>{icon}</span>}
      {loading ? <span className={styles.spinner}></span> : children}
    </>
  );

  if (href) {
    return (
      <Link to={href} className={buttonClass} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={buttonClass}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
};