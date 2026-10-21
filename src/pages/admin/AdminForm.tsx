// ============================================================================
// iQuire — Admin: Create Admin (Phase 16.4)
// ============================================================================

import React, { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/common/Input';
import { FormSection } from '../../components/common/FormSection';
import {
  createAdmin,
  type CreateAdminResponse,
} from '../../services/users.service';
import { AdminCredentialCard } from '../../components/admin/AdminCredentialCard';
import styles from './AdminForm.module.css';

// ============================================================================
// Types
// ============================================================================

interface FormData {
  first_name: string;
  last_name: string;
  middle_name: string;
  email: string;
  phone: string;
  bio_title: string;
  send_welcome_email: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const initialFormData: FormData = {
  first_name: '',
  last_name: '',
  middle_name: '',
  email: '',
  phone: '',
  bio_title: '',
  send_welcome_email: true,
};

// ============================================================================
// Component
// ============================================================================

export const AdminAdminForm: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [credentialResult, setCredentialResult] =
    useState<CreateAdminResponse | null>(null);

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // Validation
  // --------------------------------------------------------------------------
  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!formData.first_name.trim()) e.first_name = 'First name is required';
    if (!formData.last_name.trim()) e.last_name = 'Last name is required';
    if (!formData.email.trim()) {
      e.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      e.email = 'Enter a valid email address';
    }
    return e;
  };

  // --------------------------------------------------------------------------
  // Submit
  // --------------------------------------------------------------------------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);
    setErrors({});

    const res = await createAdmin({
      first_name: formData.first_name,
      last_name: formData.last_name,
      middle_name: formData.middle_name || undefined,
      email: formData.email,
      phone: formData.phone || undefined,
      bio_title: formData.bio_title || undefined,
      send_welcome_email: formData.send_welcome_email,
    });

    setIsSaving(false);

    if (!res.success || !res.data) {
      setErrors({ submit: res.error ?? 'Failed to create admin' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCredentialResult(res.data);
  };

  // --------------------------------------------------------------------------
  // Render — credential result
  // --------------------------------------------------------------------------
  if (credentialResult) {
    return (
      <div className={styles.page}>
        <AdminCredentialCard
          credentials={credentialResult}
          onClose={() => navigate('/admin/users/admins')}
          onCreateAnother={() => {
            setCredentialResult(null);
            setFormData(initialFormData);
          }}
        />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Render — form
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <Link to="/admin/users/admins" className={styles.breadcrumb}>
            ← Back to Admins
          </Link>
          <h1 className={styles.pageTitle}>Create Admin</h1>
          <p className={styles.pageSubtitle}>
            Add a new administrator to the IQuire team. A temporary password
            will be generated — the new admin can reset it on first login.
          </p>
        </div>
      </div>

      {errors.submit && (
        <div className={styles.errorBanner} role="alert">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <FormSection title="Personal Details">
          <div className={styles.twoCol}>
            <Input
              label="First name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              placeholder="e.g., Angel"
              error={errors.first_name}
            />
            <Input
              label="Last name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              placeholder="e.g., Oparajohnson"
              error={errors.last_name}
            />
          </div>

          <Input
            label="Middle name"
            name="middle_name"
            value={formData.middle_name}
            onChange={handleChange}
            placeholder="Optional"
            helperText="Shown only on their profile."
          />
        </FormSection>

        <FormSection title="Contact">
          <div className={styles.twoCol}>
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="admin@iquire.co"
              helperText="This will be their login email."
              error={errors.email}
            />
            <Input
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+44 7918 250543"
              helperText="Optional."
            />
          </div>
        </FormSection>

        <FormSection title="Role">
          <Input
            label="Admin title / role"
            name="bio_title"
            value={formData.bio_title}
            onChange={handleChange}
            placeholder="e.g., Content Manager, Operations Lead"
            helperText="Shown on the Admins list and on blog posts they author."
          />
        </FormSection>

        <FormSection title="Welcome Email">
          <div className={styles.checkboxRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="send_welcome_email"
                checked={formData.send_welcome_email}
                onChange={handleChange}
                className={styles.checkbox}
              />
              <span>
                <strong>Send welcome email with credentials</strong>
                <span>
                  If unchecked, you'll still see the temporary password on the
                  next screen — you can share it manually.
                </span>
              </span>
            </label>
          </div>
        </FormSection>

        {/* Warning box */}
        <div className={styles.warningBox}>
          <span className={styles.warningIcon}>🛡️</span>
          <div>
            <strong>Administrator privileges</strong>
            <p>
              This account will have full access to the admin dashboard —
              students, courses, alumni, blog posts, enrollments, and every
              other module. Only create admins for trusted team members.
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <Link to="/admin/users/admins" className={styles.cancelBtn}>
            Cancel
          </Link>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSaving}
          >
            {isSaving ? 'Creating Admin…' : 'Create Admin'}
          </button>
        </div>
      </form>
    </div>
  );
};