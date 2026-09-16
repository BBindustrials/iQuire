import React, { useState, useMemo, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout, AuthFooter, AuthPageTitle, WelcomeBanner } from '../../../components/layout/AuthLayout';
import { FormSection } from '../../../components/common/FormSection';
import { Input } from '../../../components/common/Input';
import { SelectInput } from '../../../components/common/SelectInput';
import { PasswordInput } from '../../../components/common/PasswordInput';
import { Checkbox } from '../../../components/common/Checkbox';
import styles from './SignupForm.module.css';



import signupNyscImg from '../../../assets/images/auth/signup-nysc.jpg';

import {
  type NyscSignupData,
  type FormErrors,
  GENDER_OPTIONS,
  YEAR_OF_DEPLOYMENT_OPTIONS,
  COHORT_BATCH_OPTIONS,
  COHORT_STREAM_OPTIONS,
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
import { signupNysc } from '../../../services/auth.service';

// ============================================================================
// Initial Form State
// ============================================================================

const initialFormData: NyscSignupData = {
  userType: 'nysc',
  firstName: '',
  middleName: '',
  lastName: '',
  gender: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  country: 'NG',
  state: '',
  lga: '',
  agreeToTerms: false,
  marketingOptIn: false,
  // NYSC-specific
  yearOfDeployment: '',
  stateOfDeployment: '',
  cohortBatch: '',
  cohortStream: '',
};

// ============================================================================
// Component
// ============================================================================

export const NyscSignup: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<NyscSignupData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Derive LGA options based on selected state
  const lgaOptions = useMemo(() => getLgaOptions(formData.state), [formData.state]);

  // Derive password strength
  const passwordStrength = useMemo(
    () => (formData.password ? getPasswordStrength(formData.password) : null),
    [formData.password]
  );

  // ----------------------------------------------------------------------------
  // Handlers
  // ----------------------------------------------------------------------------

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      // Reset LGA when state changes
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

  // ----------------------------------------------------------------------------
  // Validation
  // ----------------------------------------------------------------------------

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    // Personal details
    if (!normalizeString(formData.firstName)) {
      newErrors.firstName = 'First name is required';
    }
    if (!normalizeString(formData.lastName)) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }

    // Contact
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

    // Account
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with letters and numbers';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please retype your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Deployment (NYSC-specific)
    if (!formData.yearOfDeployment) {
      newErrors.yearOfDeployment = 'Year of deployment is required';
    }
    if (!formData.stateOfDeployment) {
      newErrors.stateOfDeployment = 'State of deployment is required';
    }
    if (!formData.cohortBatch) {
      newErrors.cohortBatch = 'Cohort batch is required';
    }
    if (!formData.cohortStream) {
      newErrors.cohortStream = 'Cohort stream is required';
    }

    // Location
    if (!formData.country) {
      newErrors.country = 'Country is required';
    }
    if (!formData.state) {
      newErrors.state = 'Please select your state';
    }
    if (!formData.lga) {
      newErrors.lga = 'Please select your LGA';
    }

    // Terms
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the Terms and Conditions';
    }

    return newErrors;
  };

  // ----------------------------------------------------------------------------
  // Submit
  // ----------------------------------------------------------------------------

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
  
    const result = await signupNysc(formData);
  
    setIsSubmitting(false);
  
    if (!result.success) {
      setErrors({ submit: result.message });
      return;
    }
  
    setSubmitSuccess(true);
  };

  // ----------------------------------------------------------------------------
  // Success State
  // ----------------------------------------------------------------------------

  if (submitSuccess) {
    return (
      <AuthLayout image={signupNyscImg} imageAlt="NYSC signup success">
        <div className={styles.successBox}>
          <div className={styles.successIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className={styles.successTitle}>Welcome, Corps Member!</h2>
          <p className={styles.successText}>
            Your NYSC IQuire account has been created, <strong>{formData.firstName}</strong>. Check your
            email <strong>{formData.email}</strong> to verify your account and start building
            work-ready skills for your service year and beyond.
          </p>
          <button
            type="button"
            className={styles.successButton}
            onClick={() => navigate('/login/student')}
          >
            Go to Login
          </button>
          <p className={styles.successFooter}>
            Didn't receive the email?{' '}
            <button
              type="button"
              className={styles.successResend}
              onClick={() => console.log('TODO: resend verification email')}
            >
              Resend
            </button>
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
      image={signupNyscImg}
      imageAlt="NYSC corps member signing up for IQuire"
    >
      <WelcomeBanner
        title="Welcome to the IQuire - NYSC Partner Program"
        description="This platform has been created specifically for members of the National Youth Service Corps (NYSC) to register and gain access to opportunities, programs, training, and initiatives available through IQuire."
      />

      <AuthPageTitle title="Signup" />

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
              label="Middle name"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              placeholder="Enter middle name"
              autoComplete="additional-name"
              error={errors.middleName}
            />
          </div>
          <div className={styles.twoCol}>
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
            <SelectInput
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              options={GENDER_OPTIONS}
              placeholder="Select"
              error={errors.gender}
            />
          </div>
        </FormSection>

        {/* ================================================================ */}
        {/* CONTACT                                                           */}
        {/* ================================================================ */}
        <FormSection title="Contact">
          <div className={styles.twoCol}>
            <Input
              label="Phone number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="08012345678"
              helperText="Enter an 11-digit Nigerian mobile number starting with 0, for example 08012345678."
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
              helperText="Minimum 8 characters with letters and numbers."
            />
            <PasswordInput
              label="Retype Password"
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
                      i <= passwordStrength.score ? styles[`strength-${passwordStrength.level}`] : ''
                    }`}
                  />
                ))}
              </div>
              <span className={`${styles.strengthLabel} ${styles[`strength-label-${passwordStrength.level}`]}`}>
                {passwordStrength.level === 'weak' && 'Weak password'}
                {passwordStrength.level === 'medium' && 'Medium strength'}
                {passwordStrength.level === 'strong' && 'Strong password'}
              </span>
            </div>
          )}
        </FormSection>

        {/* ================================================================ */}
        {/* DEPLOYMENT (NYSC-specific)                                        */}
        {/* ================================================================ */}
        <FormSection title="Deployment">
          <div className={styles.twoCol}>
            <SelectInput
              label="Year of Deployment"
              name="yearOfDeployment"
              value={formData.yearOfDeployment}
              onChange={handleChange}
              required
              options={YEAR_OF_DEPLOYMENT_OPTIONS}
              placeholder="Select year"
              error={errors.yearOfDeployment}
            />
            <SelectInput
              label="State of Deployment"
              name="stateOfDeployment"
              value={formData.stateOfDeployment}
              onChange={handleChange}
              required
              options={getStateOptions()}
              placeholder="Select state"
              error={errors.stateOfDeployment}
            />
          </div>
          <div className={styles.twoCol}>
            <SelectInput
              label="Cohort Batch"
              name="cohortBatch"
              value={formData.cohortBatch}
              onChange={handleChange}
              required
              options={COHORT_BATCH_OPTIONS}
              placeholder="Select batch"
              error={errors.cohortBatch}
            />
            <SelectInput
              label="Cohort Stream"
              name="cohortStream"
              value={formData.cohortStream}
              onChange={handleChange}
              required
              options={COHORT_STREAM_OPTIONS}
              placeholder="Select stream"
              error={errors.cohortStream}
            />
          </div>
        </FormSection>

        {/* ================================================================ */}
        {/* LOCATION                                                          */}
        {/* ================================================================ */}
        <FormSection title="Location">
          <div className={styles.twoCol}>
            <SelectInput
              label="Country of residence"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              options={COUNTRY_OPTIONS}
              placeholder="Select country"
              error={errors.country}
            />
            <SelectInput
              label="State of residence"
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
                <a href="/terms" target="_blank" rel="noopener noreferrer">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>
                .
              </>
            }
          />
          <Checkbox
            name="marketingOptIn"
            checked={formData.marketingOptIn}
            onChange={handleChange}
            label="Yes, send me updates about new courses, learning opportunities, scholarships, and important announcements from the platform."
          />
        </div>

        {/* ================================================================ */}
        {/* SUBMIT                                                            */}
        {/* ================================================================ */}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating account...' : 'Signup'}
        </button>

        <AuthFooter
          text="Already have an account?"
          linkText="Login"
          linkTo="/login/student"
        />
      </form>
    </AuthLayout>
  );
};