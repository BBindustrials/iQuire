import React, { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout, AuthFooter, AuthPageTitle } from '../../../components/layout/AuthLayout';
import { Input } from '../../../components/common/Input';
import { PasswordInput } from '../../../components/common/PasswordInput';
import { Checkbox } from '../../../components/common/Checkbox';
import styles from './SignupForm.module.css';

import loginRecruiterImg from '../../../assets/images/auth/login-recruiter.png';

import type { LoginData, FormErrors } from '../../../types/auth.types';
import { isValidEmail, normalizeString } from '../../../utils/validation';
import { login } from '../../../services/auth.service';

// ============================================================================
// Initial Form State
// ============================================================================

const initialFormData: LoginData = {
  email: '',
  password: '',
  rememberMe: false,
};

// ============================================================================
// Component
// ============================================================================

export const RecruiterLogin: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // ----------------------------------------------------------------------------
  // Handlers
  // ----------------------------------------------------------------------------

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // ----------------------------------------------------------------------------
  // Validation
  // ----------------------------------------------------------------------------

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!normalizeString(formData.email)) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  // ----------------------------------------------------------------------------
  // Submit — wired to Supabase via auth.service
  // ----------------------------------------------------------------------------

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const result = await login(formData);

    setIsSubmitting(false);

    if (!result.success) {
      setErrors({ submit: result.message });
      return;
    }

    setSubmitSuccess(true);

    // Phase 7 will redirect to /recruiter/dashboard
  };

  // ----------------------------------------------------------------------------
  // Success State (temporary)
  // ----------------------------------------------------------------------------

  if (submitSuccess) {
    return (
      <AuthLayout image={loginRecruiterImg} imageAlt="Recruiter login success">
        <div className={styles.successBox}>
          <div className={styles.successIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className={styles.successTitle}>Login Successful</h2>
          <p className={styles.successText}>
            Welcome back, <strong>{formData.email}</strong>.
            <br />
            You are now signed in.
          </p>
          <button
            type="button"
            className={styles.successButton}
            onClick={() => navigate('/')}
          >
            Go to Homepage
          </button>
          <p className={styles.successFooter}>
            Recruiter dashboard coming soon.
          </p>
        </div>
      </AuthLayout>
    );
  }

  // ----------------------------------------------------------------------------
  // Main Form Render
  // ----------------------------------------------------------------------------

  return (
    <AuthLayout
      image={loginRecruiterImg}
      imageAlt="Recruiter logging in to discover IQuire talent"
    >
      <AuthPageTitle
        title="Recruiter Login"
        subtitle="Welcome back. Continue discovering work-ready African talent."
      />

      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="Work email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="you@company.com"
          autoComplete="email"
          error={errors.email}
        />

        <PasswordInput
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password}
        />

        <div className={styles.loginOptions}>
          <Checkbox
            name="rememberMe"
            checked={formData.rememberMe || false}
            onChange={handleChange}
            label="Remember me"
          />
          <Link to="/forgot-password" className={styles.forgotLink}>
            Forgot password?
          </Link>
        </div>

        {errors.submit && (
          <div className={styles.submitError} role="alert">
            {errors.submit}
          </div>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing in...' : 'Login'}
        </button>

        <AuthFooter
          text="Don't have an account?"
          linkText="Signup as Recruiter"
          linkTo="/get-started/recruiter"
        />
      </form>
    </AuthLayout>
  );
};