// ============================================================================
// iQuire — Admin Login
// ============================================================================
// Secure entry point for IQuire administrators.
// Only users with role = 'admin' in the profiles table can access this.
// ============================================================================

import React, { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthLayout, AuthPageTitle } from '../../components/layout/AuthLayout';
import { Input } from '../../components/common/Input';
import { PasswordInput } from '../../components/common/PasswordInput';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AdminLogin.module.css';

import adminLoginImg from '../../assets/images/auth/login-admin.jpg';
import { login } from '../../services/auth.service';
import { isValidEmail, normalizeString } from '../../utils/validation';
import type { FormErrors } from '../../types/auth.types';

// ============================================================================
// Component
// ============================================================================

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, role, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Where to redirect after successful admin login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin/dashboard';

  // --------------------------------------------------------------------------
  // If already logged in as admin, skip the login page
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!authLoading && isAuthenticated && role === 'admin') {
      navigate(from, { replace: true });
    }
  }, [authLoading, isAuthenticated, role, navigate, from]);

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // --------------------------------------------------------------------------
  // Validation
  // --------------------------------------------------------------------------
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

    // 1. Authenticate with Supabase
    const result = await login({
      email: formData.email,
      password: formData.password,
      rememberMe: false,
    });

    if (!result.success) {
      setIsSubmitting(false);
      setErrors({ submit: result.message });
      return;
    }

    // 2. Wait a moment for AuthContext to fetch the profile
    await new Promise((resolve) => setTimeout(resolve, 400));

    // 3. Verify the authenticated user has role = 'admin'
    //    We read the fresh profile from the DB to avoid stale state
    const { supabase } = await import('../../integrations/supabase/client');
    const { data: profile } = (await supabase
      .from('profiles')
      .select('role')
      .eq('id', result.userId!)
      .single()) as { data: { role: string } | null };

    setIsSubmitting(false);

    if (!profile || profile.role !== 'admin') {
      // Sign out non-admins immediately
      await supabase.auth.signOut();
      setErrors({
        submit:
          'Access denied. This account does not have administrator privileges.',
      });
      return;
    }

    // 4. Success — redirect to admin dashboard
    navigate(from, { replace: true });
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <AuthLayout
      image={adminLoginImg}
      imageAlt="iQuire administrator workspace"
    >
      <div className={styles.adminBadge}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L4 6V12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12V6L12 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M9 12L11 14L15 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Restricted Access</span>
      </div>

      <AuthPageTitle
        title="Admin Login"
        subtitle="Authorized personnel only. Sign in to manage the IQuire platform."
      />

      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="Admin Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="admin@iquire.co"
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

        {errors.submit && (
          <div className={styles.submitError} role="alert">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
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
          className={styles.adminSubmitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Verifying credentials...' : 'Sign In as Administrator'}
        </button>

        <div className={styles.adminFooter}>
          <Link to="/" className={styles.backLink}>
            ← Back to public site
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};