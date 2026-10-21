// ============================================================================
// iQuire — Recruiter Registration (Phase 12C.3b)
// ============================================================================
// Public recruiter signup. After account creation, sends:
//   1. Admin notification email (FormSubmit)
//   2. Recruiter confirmation email (FormSubmit → admin inbox)
// Both emails are non-blocking — signup succeeds even if emails fail.
// ============================================================================

import React, { useState, useMemo, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AuthLayout,
  AuthPageTitle,
} from '../../../components/layout/AuthLayout';
import { FormSection } from '../../../components/common/FormSection';
import { Input } from '../../../components/common/Input';
import { SelectInput } from '../../../components/common/SelectInput';
import { PasswordInput } from '../../../components/common/PasswordInput';
import { Checkbox } from '../../../components/common/Checkbox';
import styles from './Register.module.css';

import registerRecruiterImg from '../../../assets/images/auth/signup-recruiter.png';

import type { FormErrors } from '../../../types/auth.types';

import {
  INDUSTRY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
} from '../../../types/auth.types';

import {
  isValidEmail,
  isValidNigerianPhone,
  isValidPassword,
  getPasswordStrength,
  normalizeString,
} from '../../../utils/validation';

import { supabase } from '../../../integrations/supabase/client';

import {
  notifyAdminNewRecruiter,
  sendRecruiterSignupConfirmation,
} from '../../../services/email.service';

// ============================================================================
// Form state
// ============================================================================

interface RecruiterFormData {
  firstName: string;
  lastName: string;
  position: string;
  companyName: string;
  industry: string;
  companyWebsite: string;
  companySize: string;
  workEmail: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  marketingOptIn: boolean;
}

const initialFormData: RecruiterFormData = {
  firstName: '',
  lastName: '',
  position: '',
  companyName: '',
  industry: '',
  companyWebsite: '',
  companySize: '',
  workEmail: '',
  phone: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false,
  marketingOptIn: false,
};

// ============================================================================
// Component
// ============================================================================

export const RegisterRecruiter: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RecruiterFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const passwordStrength = useMemo(
    () => (formData.password ? getPasswordStrength(formData.password) : null),
    [formData.password]
  );

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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

  // --------------------------------------------------------------------------
  // Validation
  // --------------------------------------------------------------------------
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!normalizeString(formData.firstName)) {
      newErrors.firstName = 'First name is required';
    }
    if (!normalizeString(formData.lastName)) {
      newErrors.lastName = 'Last name is required';
    }
    if (!normalizeString(formData.position)) {
      newErrors.position = 'Position is required';
    }

    if (!normalizeString(formData.companyName)) {
      newErrors.companyName = 'Company name is required';
    }
    if (!formData.industry) {
      newErrors.industry = 'Please select your industry';
    }
    if (
      formData.companyWebsite &&
      !/^https?:\/\/.+\..+/.test(formData.companyWebsite.trim())
    ) {
      newErrors.companyWebsite = 'Enter a valid URL (e.g., https://company.com)';
    }

    if (!formData.workEmail.trim()) {
      newErrors.workEmail = 'Work email is required';
    } else if (!isValidEmail(formData.workEmail)) {
      newErrors.workEmail = 'Enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!isValidNigerianPhone(formData.phone)) {
      newErrors.phone = 'Enter a valid 11-digit Nigerian phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isValidPassword(formData.password)) {
      newErrors.password =
        'Password must be at least 8 characters with letters and numbers';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please retype your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the Terms and Conditions';
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
      const firstErrorKey = Object.keys(validationErrors)[0];
      const el = document.querySelector(`[name="${firstErrorKey}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // ------------------------------------------------------------------
      // 1. Create account
      // ------------------------------------------------------------------
      const { error } = await supabase.auth.signUp({
        email: formData.workEmail.trim().toLowerCase(),
        password: formData.password,
        options: {
          data: {
            account_type: 'recruiter',
            tier: 'guest',
            role: 'recruiter',
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            position: formData.position.trim(),
            company_name: formData.companyName.trim(),
            industry: formData.industry,
            company_website: formData.companyWebsite?.trim() || '',
            company_size: formData.companySize || '',
            phone: formData.phone.trim(),
            marketing_opt_in: formData.marketingOptIn,
          },
        },
      });

      setIsSubmitting(false);

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('already registered') || msg.includes('already exists')) {
          setErrors({
            submit:
              'An account with this email already exists. Please login instead.',
          });
        } else {
          setErrors({ submit: error.message });
        }
        return;
      }

      // ------------------------------------------------------------------
      // 2. Send emails (non-blocking)
      // ------------------------------------------------------------------
      // These run in parallel. Failures are logged but don't affect the
      // signup success — the user still sees the success screen.
      Promise.all([
        notifyAdminNewRecruiter({
          fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
          email: formData.workEmail.trim().toLowerCase(),
          position: formData.position.trim(),
          companyName: formData.companyName.trim(),
          industry: formData.industry,
          companyWebsite: formData.companyWebsite?.trim() || undefined,
          companySize: formData.companySize || undefined,
        }),
        sendRecruiterSignupConfirmation({
          email: formData.workEmail.trim().toLowerCase(),
          firstName: formData.firstName.trim(),
          companyName: formData.companyName.trim(),
        }),
      ]).catch((err) => {
        // Non-blocking — log but don't fail
        console.error('[RegisterRecruiter] Email send failed:', err);
      });

      // ------------------------------------------------------------------
      // 3. Show success screen
      // ------------------------------------------------------------------
      setSubmitSuccess(true);
    } catch (err) {
      setIsSubmitting(false);
      setErrors({ submit: String(err) });
    }
  };

  // --------------------------------------------------------------------------
  // Success State
  // --------------------------------------------------------------------------
  if (submitSuccess) {
    return (
      <AuthLayout
        image={registerRecruiterImg}
        imageAlt="Recruiter registration successful"
      >
        <div className={styles.successBox}>
          <div className={styles.successIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path
                d="M8 12L11 15L16 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className={styles.successTitle}>
            Welcome to IQuire, {formData.firstName}!
          </h2>
          <p className={styles.successText}>
            We&apos;ve received your registration for{' '}
            <strong>{formData.companyName}</strong>.
            <br />
            Our team will review your organisation details and verify your
            account within 24–48 hours.
            <br />
            You&apos;ll be able to check your verification status anytime from
            your recruiter dashboard.
          </p>

          <div className={styles.nextSteps}>
            <h3 className={styles.nextStepsTitle}>What happens next?</h3>
            <ol className={styles.nextStepsList}>
              <li>Our team reviews your organisation details</li>
              <li>
                Log in anytime to check your verification status
              </li>
              <li>
                Once verified, you&apos;ll get full access to the talent
                directory
              </li>
              <li>Start discovering IQuire-trained talent</li>
            </ol>
          </div>

          <button
            type="button"
            className={styles.successButton}
            onClick={() => navigate('/login/recruiter')}
          >
            Go to Recruiter Login
          </button>

          <p className={styles.successFooter}>
            Questions?{' '}
            <Link to="/contact" className={styles.footerLink}>
              Contact our team
            </Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  // --------------------------------------------------------------------------
  // Main Form
  // --------------------------------------------------------------------------
  return (
    <AuthLayout
      image={registerRecruiterImg}
      imageAlt="Join IQuire as a recruiter"
    >
      <AuthPageTitle
        title="Register as a Recruiter"
        subtitle="Get access to work-ready, verified IQuire talent."
      />

      <form onSubmit={handleSubmit} noValidate>
        {/* PERSONAL DETAILS */}
        <FormSection title="Your details">
          <div className={styles.twoCol}>
            <Input
              label="First name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="Enter first name"
              autoComplete="given-name"
              error={errors.firstName}
            />
            <Input
              label="Last name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Enter last name"
              autoComplete="family-name"
              error={errors.lastName}
            />
          </div>
          <div className={styles.twoCol}>
            <Input
              label="Position / Role"
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
              placeholder="e.g., HR Manager, Talent Lead"
              autoComplete="organization-title"
              error={errors.position}
            />
          </div>
        </FormSection>

        {/* COMPANY DETAILS */}
        <FormSection title="Company details">
          <div className={styles.twoCol}>
            <Input
              label="Company name"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              placeholder="Enter company name"
              autoComplete="organization"
              error={errors.companyName}
            />
            <SelectInput
              label="Industry"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              required
              options={INDUSTRY_OPTIONS}
              placeholder="Select industry"
              error={errors.industry}
            />
          </div>
          <div className={styles.twoCol}>
            <Input
              label="Company website"
              name="companyWebsite"
              type="url"
              value={formData.companyWebsite}
              onChange={handleChange}
              placeholder="https://company.com"
              helperText="Optional, but helps us verify your organisation faster."
              autoComplete="url"
              error={errors.companyWebsite}
            />
            <SelectInput
              label="Company size"
              name="companySize"
              value={formData.companySize}
              onChange={handleChange}
              options={COMPANY_SIZE_OPTIONS}
              placeholder="Select company size"
              error={errors.companySize}
            />
          </div>
        </FormSection>

        {/* CONTACT */}
        <FormSection title="Contact">
          <div className={styles.twoCol}>
            <Input
              label="Work email"
              name="workEmail"
              type="email"
              value={formData.workEmail}
              onChange={handleChange}
              required
              placeholder="you@company.com"
              helperText="Use your official company email for faster verification."
              autoComplete="email"
              error={errors.workEmail}
            />
            <Input
              label="Phone number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="08012345678"
              helperText="11-digit Nigerian number."
              autoComplete="tel"
              error={errors.phone}
            />
          </div>
        </FormSection>

        {/* ACCOUNT */}
        <FormSection title="Account">
          <div className={styles.twoCol}>
            <PasswordInput
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Create a password"
              autoComplete="new-password"
              error={errors.password}
              helperText="Min 8 characters, letters and numbers."
            />
            <PasswordInput
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Retype your password"
              autoComplete="new-password"
              error={errors.confirmPassword}
            />
          </div>

          {passwordStrength && (
            <div className={styles.strengthWrapper}>
              <div className={styles.strengthBars}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <span
                    key={i}
                    className={`${styles.strengthBar} ${
                      i <= passwordStrength.score
                        ? styles[`strength-${passwordStrength.level}`]
                        : ''
                    }`}
                  />
                ))}
              </div>
              <span
                className={`${styles.strengthLabel} ${
                  styles[`strength-label-${passwordStrength.level}`]
                }`}
              >
                {passwordStrength.level === 'weak' && 'Weak password'}
                {passwordStrength.level === 'medium' && 'Medium strength'}
                {passwordStrength.level === 'strong' && 'Strong password'}
              </span>
            </div>
          )}
        </FormSection>

        {/* TERMS */}
        <div className={styles.termsWrapper}>
          <Checkbox
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleChange}
            error={errors.agreeToTerms}
            label={
              <>
                I agree to the{' '}
                <Link to="/terms" target="_blank">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy" target="_blank">
                  Privacy Policy
                </Link>
                .
              </>
            }
          />
          <Checkbox
            name="marketingOptIn"
            checked={formData.marketingOptIn}
            onChange={handleChange}
            label="Send me hiring insights, talent updates, and IQuire events."
          />
        </div>

        {/* SUBMIT */}
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
          {isSubmitting
            ? 'Creating recruiter account...'
            : 'Create Recruiter Account'}
        </button>

        <p className={styles.footer}>
          Already have a recruiter account?{' '}
          <Link to="/login/recruiter" className={styles.footerLink}>
            Login
          </Link>
        </p>

        <p className={styles.recruiterFooter}>
          Not hiring?{' '}
          <Link to="/courses" className={styles.footerLink}>
            Explore our courses →
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};