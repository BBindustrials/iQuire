// ============================================================================
// iQuire — Public Contact Page (Phase 12D.3 — Resend Updated)
// ============================================================================

import React, { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { notifyAdminContactSubmission } from '../../services/notifications.service';
import { isValidEmail, normalizeString } from '../../utils/validation';
import styles from './Contact.module.css';

// ============================================================================
// Local contact submit helper
// ============================================================================

const submitContactMessage = async (payload: {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}): Promise<{ success: boolean; error?: string; data?: unknown }> => {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        error: data?.message ?? 'Unable to send your message right now. Please try again.',
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[Contact] submitContactMessage failed:', error);
    return {
      success: false,
      error: 'Unable to send your message right now. Please try again.',
    };
  }
};

// ============================================================================
// Config
// ============================================================================

const EMAIL_HELLO = 'hello@iquire.io';

const PHONE_DISPLAY = '+44 7918 250543';
const PHONE_TEL = '+447918250543';

const LOCATION = 'London, UK · Lagos, Nigeria';

// ============================================================================
// Types
// ============================================================================

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  [key: string]: string;
}

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

// ============================================================================
// Social icons (SVG)
// ============================================================================

const SocialIcons = {
  linkedin: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  instagram: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  facebook: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  whatsapp: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  ),
};

const SOCIAL_LINKS = [
  { label: 'LinkedIn', url: 'https://www.linkedin.com/company/iQuireco/', icon: SocialIcons.linkedin },
  { label: 'Instagram', url: 'https://www.instagram.com/iQuire.co', icon: SocialIcons.instagram },
  { label: 'Facebook', url: 'https://web.facebook.com/iQuire.co', icon: SocialIcons.facebook },
  { label: 'WhatsApp', url: 'https://wa.me/447918250543', icon: SocialIcons.whatsapp },
];

// ============================================================================
// Icons for Contact Cards
// ============================================================================

const Icons = {
  mail: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  phone: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  mapPin: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
};

// ============================================================================
// Component
// ============================================================================

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    const e: FormErrors = {};
    if (!normalizeString(formData.name)) e.name = 'Your name is required';
    if (!formData.email.trim()) e.email = 'Email is required';
    else if (!isValidEmail(formData.email)) e.email = 'Enter a valid email address';
    if (!normalizeString(formData.subject)) e.subject = 'Subject is required';
    if (!normalizeString(formData.message)) e.message = 'Message is required';
    else if (formData.message.trim().length < 10) e.message = 'Message must be at least 10 characters';
    return e;
  };

  // --------------------------------------------------------------------------
  // Submit
  // --------------------------------------------------------------------------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstKey = Object.keys(validationErrors)[0];
      const el = document.querySelector(`[name="${firstKey}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const dbResult = await submitContactMessage({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim() || null,
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    });

    setIsSubmitting(false);

    if (!dbResult.success) {
      setErrors({ submit: dbResult.error ?? 'Failed to submit. Please try again.' });
      return;
    }

    notifyAdminContactSubmission({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim() || undefined,
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    }).catch((err) => console.error('[Contact] Email notification failed:', err));

    setSubmitSuccess(true);
  };

  // --------------------------------------------------------------------------
  // Success state
  // --------------------------------------------------------------------------
  if (submitSuccess) {
    return (
      <div className={styles.page}>
        <div className={styles.successSection}>
          <div className="container">
            <div className={`${styles.successCard} ${styles.slideUpText}`}>
              <div className={styles.successIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h1 className={styles.successTitle}>Thank you, {formData.name.split(' ')[0]}!</h1>
              <p className={styles.successText}>
                Your message has been received. Our team will get back to you at{' '}
                <strong>{formData.email}</strong> within 24–48 hours.
              </p>
              <div className={styles.successActions}>
                <Button variant="primary" color="gradient" size="lg" href="/">
                  Back to Home
                </Button>
                <Link to="/courses" className={styles.successLink}>
                  Explore Courses →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Main render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      {/* HERO (Netted Blue) */}
      <section className={styles.hero}>
        <svg className={styles.netGrid} aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900">
          <defs>
            <pattern id="contactHeroNet" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#000000" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#contactHeroNet)" />
        </svg>

        <div className={styles.heroBlobOne} aria-hidden="true" />
        <div className={styles.heroBlobTwo} aria-hidden="true" />

        <div className="container">
          <div className={`${styles.heroContent} ${styles.slideUpText}`}>
            <span className={styles.heroBadge}>Contact Us</span>
            <h1 className={styles.heroTitle}>
              Let&apos;s start a <span className={styles.heroHighlight}>conversation.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Questions about courses, hiring iQuire talent, partnerships, or
              anything else? We&apos;d love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT CARDS (5 in 3+2 grid) */}
      <section className={styles.cardsSection}>
        <div className="container">
          <div className={`${styles.cardsGrid} ${styles.slideUpText} ${styles['delay-1']}`}>
            <ContactCard icon={Icons.mail} label="Say hello" value={EMAIL_HELLO} href={`mailto:${EMAIL_HELLO}`} />
            <ContactCard icon={Icons.phone} label="Call or WhatsApp" value={PHONE_DISPLAY} href={`tel:${PHONE_TEL}`} />
            <ContactCard icon={Icons.mapPin} label="Visit us" value={LOCATION} />
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className={styles.formSection}>
        <div className="container">
          <div className={styles.formGrid}>
            {/* Left — context */}
            <div className={`${styles.formContext} ${styles.slideUpText} ${styles['delay-2']}`}>
              <span className={styles.formBadge}>Send a message</span>
              <h2 className={styles.formTitle}>Tell us how we can help</h2>
              <p className={styles.formText}>
                Whether you&apos;re a student looking for guidance, a recruiter
                interested in iQuire talent, or an organization exploring a
                partnership fill in the form and we&apos;ll route your
                message to the right person on our team.
              </p>

              <ul className={styles.responseList}>
                <li>
                  <span className={styles.checkIcon}>✓</span>
                  Response within 24–48 hours
                </li>
                <li>
                  <span className={styles.checkIcon}>✓</span>
                  Routed to the right team member
                </li>
                <li>
                  <span className={styles.checkIcon}>✓</span>
                  Your information stays private
                </li>
              </ul>

              <div className={styles.socialBlock}>
                <span className={styles.socialLabel}>Follow us</span>
                <div className={styles.socialLinks}>
                  {SOCIAL_LINKS.map((social) => (
                    <a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      aria-label={social.label}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — form */}
            <div className={`${styles.formWrapper} ${styles.slideUpText} ${styles['delay-3']}`}>
              <form onSubmit={handleSubmit} className={styles.form} noValidate>
                <div className={styles.twoCol}>
                  <Input label="Your name" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter your full name" error={errors.name} />
                  <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" error={errors.email} />
                </div>

                <div className={styles.twoCol}>
                  <Input label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+44 7918 250543 (optional)" error={errors.phone} />
                  <Input label="Subject" name="subject" value={formData.subject} onChange={handleChange} required placeholder="What is this about?" error={errors.subject} />
                </div>

                <div className={styles.textareaWrapper}>
                  <label htmlFor="message" className={styles.textareaLabel}>
                    Message <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className={`${styles.textarea} ${errors.message ? styles.textareaError : ''}`}
                    placeholder="Tell us more..."
                  />
                  {errors.message ? (
                    <span className={styles.errorText} role="alert">{errors.message}</span>
                  ) : (
                    <span className={styles.helperText}>{formData.message.length} characters</span>
                  )}
                </div>

                {errors.submit && (
                  <div className={styles.submitError} role="alert">{errors.submit}</div>
                )}

                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>

                <p className={styles.formHint}>
                  By submitting, you agree to our{' '}
                  <Link to="/terms" className={styles.formHintLink}>Terms</Link>{' '}
                  and <Link to="/privacy" className={styles.formHintLink}>Privacy Policy</Link>.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA (Netted Blue) */}
      <section className={styles.finalCta}>
        <svg className={styles.netGrid} aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900">
          <defs>
            <pattern id="contactCtaNet" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#000000" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#contactCtaNet)" />
        </svg>

        <div className={styles.finalCtaBlob} aria-hidden="true" />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className={`${styles.finalCtaInner} ${styles.slideUpText} ${styles['delay-4']}`}>
            <h2 className={styles.finalCtaTitle}>Ready to build your career?</h2>
            <p className={styles.finalCtaSubtitle}>
              Explore our courses or speak with our team about iQuire training.
            </p>
            <div className={styles.finalCtaButtons}>
              <Button variant="primary" color="gradient" size="lg" href="/courses">
                Explore Courses
              </Button>
              <Link to="/login" className={styles.finalCtaSecondary}>
                Sign In →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// Sub-components
// ============================================================================

interface ContactCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}

const ContactCard: React.FC<ContactCardProps> = ({ icon, label, value, href }) => {
  const content = (
    <>
      <div className={styles.cardIcon}>{icon}</div>
      <div className={styles.cardBody}>
        <span className={styles.cardLabel}>{label}</span>
        <span className={styles.cardValue}>{value}</span>
      </div>
    </>
  );

  if (href) {
    return (
      <a href={href} className={styles.card}>
        {content}
      </a>
    );
  }

  return <div className={styles.card}>{content}</div>;
};