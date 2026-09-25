// ============================================================================
// iQuire — Public Member Registration (Phase 7A.5)
// ============================================================================
// Self-service account creation for members (students, AI users, etc.)
// Creates a guest-tier account. Admin promotes to verified later.
// ============================================================================

import React, { useState, useEffect, useMemo, type FormEvent } from 'react';
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

import registerImg from '../../../assets/images/auth/signup-student.jpg';

import type {
  RegisterMemberData,
  FormErrors,
  Course,
} from '../../../types/auth.types';

import {
  getStateOptions,
  getLgaOptions,
  COUNTRY_OPTIONS,
} from '../../../utils/nigerianStates';

import {
  isValidEmail,
  isValidNigerianPhone,
  isValidPassword,
  getPasswordStrength,
  normalizeString,
} from '../../../utils/validation';

import {
  registerMember,
  fetchPublishedCourses,
} from '../../../services/auth.service';

// ============================================================================
// Initial Form State
// ============================================================================

const initialFormData: RegisterMemberData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  country: 'NG',
  state: '',
  lga: '',
  agreeToTerms: false,
  marketingOptIn: false,
  desiredCourseId: undefined,
  wantsAiCounselor: false,
};

// ============================================================================
// Component
// ============================================================================

export const Register: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterMemberData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Courses
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  // Derived
  const lgaOptions = useMemo(() => getLgaOptions(formData.state), [formData.state]);
  const passwordStrength = useMemo(
    () => (formData.password ? getPasswordStrength(formData.password) : null),
    [formData.password]
  );

  const courseOptions = useMemo(
    () =>
      courses.map((c) => ({
        label: c.title,
        value: c.id,
      })),
    [courses]
  );

  // --------------------------------------------------------------------------
  // Load courses on mount
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setCoursesLoading(true);
      const data = await fetchPublishedCourses();
      if (!isMounted) return;
      setCourses(data as Course[]);
      setCoursesLoading(false);
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

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
      ...(name === 'state' ? { lga: '' } : {}),
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

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!isValidNigerianPhone(formData.phone)) {
      newErrors.phone = 'Enter a valid 11-digit Nigerian phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Enter a valid email address';
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

    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.state) newErrors.state = 'Please select your state';
    if (!formData.lga) newErrors.lga = 'Please select your LGA';

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

    const result = await registerMember(formData);

    setIsSubmitting(false);

    if (!result.success) {
      setErrors({ submit: result.message });
      return;
    }

    setSubmitSuccess(true);
  };

  // --------------------------------------------------------------------------
  // Success State
  // --------------------------------------------------------------------------
  if (submitSuccess) {
    return (
      <AuthLayout image={registerImg} imageAlt="Registration successful">
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
          <h2 className={styles.successTitle}>Welcome to IQuire!</h2>
          <p className={styles.successText}>
            Hey <strong>{formData.firstName}</strong>, we've sent a verification link to{' '}
            <strong>{formData.email}</strong>.
            <br />
            Click the link in your inbox to activate your account and access your dashboard.
          </p>

          <div className={styles.nextSteps}>
            <h3 className={styles.nextStepsTitle}>What happens next?</h3>
            <ol className={styles.nextStepsList}>
              <li>Verify your email</li>
              <li>Complete your profile</li>
              <li>
                {formData.desiredCourseId
                  ? 'Wait for admin approval to start your course'
                  : 'Explore courses and start learning'}
              </li>
              <li>Unlock your AI Career Counselor</li>
            </ol>
          </div>

          <button
            type="button"
            className={styles.successButton}
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>

          <p className={styles.successFooter}>
            Didn't receive the email?{' '}
            <button
              type="button"
              className={styles.successResend}
              onClick={() => console.log('TODO: resend verification')}
            >
              Resend
            </button>
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
      image={registerImg}
      imageAlt="Join IQuire — start your career journey"
    >
      <AuthPageTitle
        title="Create your IQuire account"
        subtitle="Join thousands of young professionals building their careers with IQuire."
      />

      <form onSubmit={handleSubmit} noValidate>
        {/* ================================================================ */}
        {/* PERSONAL DETAILS                                                  */}
        {/* ================================================================ */}
        <FormSection title="Personal details">
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
              label="Phone number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="08012345678"
              helperText="11-digit Nigerian number, e.g. 08012345678"
              autoComplete="tel"
              error={errors.phone}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email}
            />
          </div>
        </FormSection>

        {/* ================================================================ */}
        {/* LOCATION                                                          */}
        {/* ================================================================ */}
        <FormSection title="Location">
          <div className={styles.twoCol}>
            <SelectInput
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              options={COUNTRY_OPTIONS}
              placeholder="Select country"
              error={errors.country}
            />
            <SelectInput
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              options={getStateOptions()}
              placeholder="Select state"
              error={errors.state}
            />
          </div>
          <div className={styles.twoCol}>
            <SelectInput
              label="LGA"
              name="lga"
              value={formData.lga}
              onChange={handleChange}
              required
              options={lgaOptions}
              placeholder={formData.state ? 'Select LGA' : 'Select state first'}
              disabled={!formData.state}
              error={errors.lga}
            />
          </div>
        </FormSection>

        {/* ================================================================ */}
        {/* ACCOUNT                                                           */}
        {/* ================================================================ */}
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

        {/* ================================================================ */}
        {/* WHAT BRINGS YOU HERE?                                             */}
        {/* ================================================================ */}
        <FormSection title="What brings you here?">
          <div className={styles.optionBlock}>
            <SelectInput
              label="Interested in a course? (optional)"
              name="desiredCourseId"
              value={formData.desiredCourseId || ''}
              onChange={handleChange}
              options={
                coursesLoading
                  ? [{ label: 'Loading courses...', value: '' }]
                  : [{ label: 'Just create my account', value: '' }, ...courseOptions]
              }
              placeholder="Just create my account"
              helperText="You can always pick a course later from your dashboard."
              disabled={coursesLoading}
            />
          </div>

          <div className={styles.optionBlock}>
            <Checkbox
              name="wantsAiCounselor"
              checked={formData.wantsAiCounselor || false}
              onChange={handleChange}
              label="I'd like to try the AI Career Counselor — my personal career guide."
            />
          </div>
        </FormSection>

        {/* ================================================================ */}
        {/* TERMS                                                             */}
        {/* ================================================================ */}
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
            label="Send me career tips, course updates, and opportunities from IQuire."
          />
        </div>

        {/* ================================================================ */}
        {/* SUBMIT                                                            */}
        {/* ================================================================ */}
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
          {isSubmitting ? 'Creating your account...' : 'Create Account'}
        </button>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" className={styles.footerLink}>
            Login
          </Link>
        </p>

        <p className={styles.recruiterFooter}>
          Hiring?{' '}
          <Link to="/register/recruiter" className={styles.footerLink}>
            Register as a Recruiter →
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};