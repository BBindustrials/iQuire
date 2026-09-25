// ============================================================================
// iQuire — Unified Member Login (Phase 7A.7)
// ============================================================================
// Single login page for members (students, alumni, AI-only users).
// Accepts Email OR IQuire ID (e.g., swift-panda-8834).
// ============================================================================

import React, { useState, useMemo, type FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  AuthLayout,
  AuthPageTitle,
} from '../../../components/layout/AuthLayout';
import { Input } from '../../../components/common/Input';
import { PasswordInput } from '../../../components/common/PasswordInput';
import { Checkbox } from '../../../components/common/Checkbox';
import styles from './Login.module.css';

import loginImg from '../../../assets/images/auth/login-student.jpg';

import type { FormErrors } from '../../../types/auth.types';
import { isValidEmail, normalizeString } from '../../../utils/validation';
import { loginMember } from '../../../services/auth.service';

// ============================================================================
// Identifier detection
// ============================================================================

type IdentifierType = 'email' | 'participant_id' | 'unknown' | 'empty';

const detectIdentifierType = (value: string): IdentifierType => {
  const trimmed = value.trim();
  if (!trimmed) return 'empty';
  if (isValidEmail(trimmed)) return 'email';
  if (/^[a-z]+-[a-z]+-\d{4}$/i.test(trimmed)) return 'participant_id';
  return 'unknown';
};

// ============================================================================
// Component
// ============================================================================

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Where to redirect after login
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    '/dashboard';

  const identifierType = useMemo(() => detectIdentifierType(identifier), [identifier]);

  // Show helpful hint as the user types
  const identifierHint = useMemo(() => {
    if (identifierType === 'email') return 'Logging in with email';
    if (identifierType === 'participant_id') return 'Logging in with IQuire ID';
    if (identifierType === 'unknown' && identifier.trim().length > 3) {
      return 'Enter a valid email or IQuire ID (e.g., swift-panda-1234)';
    }
    return undefined;
  }, [identifierType, identifier]);

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------
  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdentifier(e.target.value);
    if (errors.identifier) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.identifier;
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

    if (!normalizeString(identifier)) {
      newErrors.identifier = 'Email or IQuire ID is required';
    } else if (identifierType === 'unknown') {
      newErrors.identifier =
        'Enter a valid email or IQuire ID (e.g., swift-panda-1234)';
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

    const result = await loginMember({
      identifier: identifier.trim(),
      password,
      rememberMe,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setErrors({ submit: result.message });
      return;
    }

    // Success — redirect
    navigate(from, { replace: true });
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <AuthLayout
      image={loginImg}
      imageAlt="IQuire member login"
    >
      <AuthPageTitle
        title="Welcome back"
        subtitle="Sign in with your email or IQuire ID to continue your journey."
      />

      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.identifierField}>
          <Input
            label="Email or IQuire ID"
            name="identifier"
            type="text"
            value={identifier}
            onChange={handleIdentifierChange}
            required
            placeholder="you@example.com or swift-panda-1234"
            autoComplete="username"
            autoFocus
            error={errors.identifier}
            helperText={!errors.identifier ? identifierHint : undefined}
          />
          {identifierType === 'participant_id' && (
            <span className={styles.identifierBadge}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 12L11 14L15 10"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              </svg>
              IQuire ID detected
            </span>
          )}
        </div>

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
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>

        <p className={styles.footer}>
          New to IQuire?{' '}
          <Link to="/register" className={styles.footerLink}>
            Create an account
          </Link>
        </p>

        <p className={styles.recruiterFooter}>
          Are you hiring?{' '}
          <Link to="/login/recruiter" className={styles.footerLink}>
            Recruiter Login →
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};