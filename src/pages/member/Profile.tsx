/* eslint-disable react-hooks/set-state-in-effect */
// ============================================================================
// iQuire — Member: My Profile (Phase 17.8 - Final Fix)
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../integrations/supabase/client';
import type { EducationEntry } from '../../types/auth.types';
import styles from './Profile.module.css';

export const MemberProfile: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // We use local state for the form
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    phone: '',
    bio_title: '',
    country: '',
    state: '',
    gender: '',
    career_goals: '',
    skillsString: '',
  });

  const [educationList, setEducationList] = useState<EducationEntry[]>([]);

  // Sync form data when profile loads or refreshes
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name ?? '',
        middle_name: profile.middle_name ?? '',
        last_name: profile.last_name ?? '',
        phone: profile.phone ?? '',
        bio_title: profile.bio_title ?? '',
        country: profile.country ?? '',
        state: profile.state ?? '',
        gender: profile.gender ?? '',
        career_goals: profile.career_goals ?? '',
        skillsString: (profile.skills ?? []).join(', '),
      });
      setEducationList(profile.education ?? []);
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Education Handlers ---
  const addEducation = () => {
    setEducationList([...educationList, { institution: '', degree: '', year: '' }]);
  };

  const updateEducation = (index: number, field: keyof EducationEntry, value: string) => {
    const updated = [...educationList];
    updated[index] = { ...updated[index], [field]: value };
    setEducationList(updated);
  };

  const removeEducation = (index: number) => {
    setEducationList(educationList.filter((_, i) => i !== index));
  };

  // --- Helper: Calculate Completion ---
  const calculateCompletion = (data: typeof formData, eduList: EducationEntry[], hasAvatar: boolean) => {
    let points = 0;
    const total = 11; // Total possible points

    if (data.first_name) points++;
    if (data.last_name) points++;
    if (data.phone) points++;
    if (data.middle_name) points++;
    if (data.country) points++;
    if (data.state) points++;
    if (data.gender) points++;
    if (data.bio_title) points++;
    if (data.career_goals) points++;
    if (eduList.length > 0) points++;
    if (hasAvatar) points++;

    return Math.round((points / total) * 100);
  };

  // --- Avatar Upload ---
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setIsUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const newScore = calculateCompletion(formData, educationList, true);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          profile_completion: newScore // Update score immediately
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      await refreshProfile();
      setSuccess('Profile picture updated.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload image.';
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  // --- Save Changes ---
  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    const skillsArray = formData.skillsString
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Calculate score based on current form state
    const hasAvatar = !!profile.avatar_url;
    const completionScore = calculateCompletion(formData, educationList, hasAvatar);

    const updatePayload = {
      first_name: formData.first_name,
      middle_name: formData.middle_name,
      last_name: formData.last_name,
      phone: formData.phone,
      bio_title: formData.bio_title,
      country: formData.country,
      state: formData.state,
      gender: (formData.gender || null) as 'male' | 'female' | 'other' | 'prefer-not-to-say' | null,
      career_goals: formData.career_goals,
      skills: skillsArray,
      education: educationList,
      profile_completion: completionScore,
    };

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', profile.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      await refreshProfile(); // Refresh the auth context so the Dashboard updates
      setIsEditing(false);
      setSuccess('Profile updated successfully.');
      setTimeout(() => setSuccess(null), 3000);
    }
    setIsSaving(false);
  };

  if (!profile) return null;

  const initials = `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase();
  const iqId = profile.iq_id ?? profile.participant_id;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>My Profile</h1>
          <p className={styles.pageSubtitle}>
            Manage your personal information and professional profile.
          </p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className={styles.editBtn}>
            Edit Profile
          </button>
        )}
      </div>

      {error && <div className={styles.errorBanner} role="alert">{error}</div>}
      {success && <div className={styles.successBanner} role="alert">{success}</div>}

      {/* Profile Header Card */}
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarWrapper}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className={styles.avatarImg} />
            ) : (
              <div className={styles.avatarInitials}>{initials}</div>
            )}
            <button 
              className={styles.uploadBtn} 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              title="Change Profile Picture"
            >
              {isUploading ? '...' : '📷'}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarUpload} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
          </div>
          
          <div className={styles.profileInfo}>
            <h2 className={styles.profileName}>{profile.first_name} {profile.last_name}</h2>
            <p className={styles.profileEmail}>{profile.email}</p>
            {iqId && <span className={styles.profileId}>ID: {iqId}</span>}
          </div>
        </div>

        <div className={styles.profileProgress}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>Profile Completion</span>
            <span className={styles.progressValue}>{profile.profile_completion ?? 0}%</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${profile.profile_completion ?? 0}%` }} />
          </div>
        </div>
      </div>

      {/* Basic Info Form */}
      <div className={styles.formPanel}>
        <h3 className={styles.formTitle}>Personal Information</h3>
        <div className={styles.formGrid}>
          <FormField label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} disabled={!isEditing} />
          <FormField label="Middle Name" name="middle_name" value={formData.middle_name} onChange={handleChange} disabled={!isEditing} />
          <FormField label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} disabled={!isEditing} />
          <FormField label="Email" name="email" value={profile.email ?? ''} onChange={() => {}} disabled />
          <FormField label="Phone" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} placeholder="+234..." />
          <FormField label="Bio Title" name="bio_title" value={formData.bio_title} onChange={handleChange} disabled={!isEditing} placeholder="e.g. Aspiring Product Manager" />
          <FormField label="Country" name="country" value={formData.country} onChange={handleChange} disabled={!isEditing} placeholder="e.g. Nigeria" />
          <FormField label="State" name="state" value={formData.state} onChange={handleChange} disabled={!isEditing} placeholder="e.g. Lagos" />
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} disabled={!isEditing} className={styles.formSelect}>
              <option value="">Select…</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
        </div>
      </div>

      {/* Education */}
      <div className={styles.formPanel}>
        <div className={styles.panelHeaderRow}>
          <h3 className={styles.formTitle}>Education</h3>
          {isEditing && (
            <button className={styles.addBtn} onClick={addEducation}>+ Add Education</button>
          )}
        </div>
        
        {educationList.length === 0 && <p className={styles.emptyText}>No education added yet.</p>}
        
        <div className={styles.educationList}>
          {educationList.map((edu, index) => (
            <div key={index} className={styles.educationItem}>
              <div className={styles.formGrid}>
                <FormField label="Institution" name="institution" value={edu.institution} onChange={(e) => updateEducation(index, 'institution', e.target.value)} disabled={!isEditing} placeholder="University Name" />
                <FormField label="Degree / Certificate" name="degree" value={edu.degree} onChange={(e) => updateEducation(index, 'degree', e.target.value)} disabled={!isEditing} placeholder="B.Sc Computer Science" />
                <FormField label="Year" name="year" value={edu.year} onChange={(e) => updateEducation(index, 'year', e.target.value)} disabled={!isEditing} placeholder="2023" />
              </div>
              {isEditing && (
                <button className={styles.removeBtn} onClick={() => removeEducation(index)}>Remove</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Skills & Goals */}
      <div className={styles.formPanel}>
        <h3 className={styles.formTitle}>Professional Profile</h3>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Skills (comma separated)</label>
          <input
            name="skillsString"
            value={formData.skillsString}
            onChange={handleChange}
            disabled={!isEditing}
            placeholder="e.g. Project Management, Python, UX Design"
            className={styles.formInput}
          />
        </div>
        <div className={styles.formGroup} style={{ marginTop: '1.25rem' }}>
          <label className={styles.formLabel}>Career Goals</label>
          <textarea
            name="career_goals"
            value={formData.career_goals}
            onChange={handleChange}
            disabled={!isEditing}
            placeholder="Describe your short-term and long-term career goals..."
            className={styles.formTextarea}
            rows={3}
          />
        </div>
      </div>

      {isEditing && (
        <div className={styles.formActions}>
          <button onClick={() => { setIsEditing(false); setError(null); }} className={styles.cancelBtn} disabled={isSaving}>
            Cancel
          </button>
          <button onClick={handleSave} className={styles.saveBtn} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
};

// Sub-components
interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  type?: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, name, value, onChange, disabled, placeholder, type = 'text' }) => (
  <div className={styles.formGroup}>
    <label className={styles.formLabel} htmlFor={name}>{label}</label>
    <input id={name} name={name} type={type} value={value} onChange={onChange} disabled={disabled} placeholder={placeholder} className={styles.formInput} />
  </div>
);