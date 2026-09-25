// ============================================================================
// iQuire — Recruiter Login (Phase 7A.8)
// ============================================================================
// Login page for recruiters / hiring organisations.
// Uses work email + password.
// ============================================================================

import React, { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  AuthLayout,
  AuthPageTitle,
} from '../../../components/layout/AuthLayout';
import { Input } from '../../../components/common/Input';
import { PasswordInput } from '../../../components/common/PasswordInput';
import { Checkbox } from '../../../components/common/Checkbox';
import styles from './LoginRecruiter.module.css';

import loginRecruiterImg from '../../../assets/images/auth/login-recruiter.png';

import type { FormErrors } from '../../../types/auth.types';
import { isValidEmail, normalizeString } from '../../../utils/validation';
import { loginRecruiter } from '../../../services/auth.service';

// ============================================================================
// Component
// ============================================================================

export const LoginRecruiter: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    '/recruiter/dashboard';

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.email;
        return next;
      });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.password;
        return next;
      });
    }
  };

  const handleRememberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  };

  // --------------------------------------------------------------------------
  // Validation
  // --------------------------------------------------------------------------
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!normalizeString(email)) {
      newErrors.email = 'Work email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Enter a valid work email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  // --------------------------------------------------------------------------
  // Submit
  // --------------------------------------------------------------------------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const result = await loginRecruiter({
      email: email.trim(),
      password,
      rememberMe,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setErrors({ submit: result.message });
      return;
    }

    // Success
    navigate(from, { replace: true });
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <AuthLayout
      image={loginRecruiterImg}
      imageAlt="Recruiter login"
    >
      <div className={styles.recruiterBadge}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="2"
            y="7"
            width="20"
            height="14"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M8 7V5C8 3.9 8.9 3 10 3H14C15.1 3 16 3.9 16 5V7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span>For Recruiters & Hiring Teams</span>
      </div>

      <AuthPageTitle
        title="Recruiter Login"
        subtitle="Discover verified, work-ready African talent."
      />

      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="Work email"
          name="email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          required
          placeholder="you@company.com"
          autoComplete="email"
          autoFocus
          error={errors.email}
        />

        <PasswordInput
          label="Password"
          name="password"
          value={password}
          onChange={handlePasswordChange}
          required
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password}
        />

        <div className={styles.loginOptions}>
          <Checkbox
            name="rememberMe"
            checked={rememberMe}
            onChange={handleRememberChange}
            label="Remember me"
          />
          <Link to="/forgot-password" className={styles.forgotLink}>
            Forgot password?
          </Link>
        </div>

        {errors.submit && (
          <div className={styles.submitError} role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path
                d="M12 8V12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="12" cy="16" r="1" fill="currentColor" />
            </svg>
            <span>{errors.submit}</span>
          </div>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing in...' : 'Sign In as Recruiter'}
        </button>

        <p className={styles.footer}>
          New to IQuire?{' '}
          <Link to="/register/recruiter" className={styles.footerLink}>
            Register as a Recruiter
          </Link>
        </p>

        <p className={styles.memberFooter}>
          Not a recruiter?{' '}
          <Link to="/login" className={styles.footerLink}>
            Member Login →
          </Link>
        </p>

        <p className={styles.backHome}>
          <Link to="/hire-from-us" className={styles.backHomeLink}>
            Learn more about hiring IQuire talent
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};