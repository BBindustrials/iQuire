import React from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout, AuthPageTitle } from '../../../components/layout/AuthLayout';
import styles from './GetStarted.module.css';

// Import image
import getStartedImg from '../../../assets/images/auth/signup-student.jpg';

interface RoleOption {
  id: 'student' | 'nysc' | 'recruiter';
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  accentColor: 'blue' | 'green' | 'gold';
}

const StudentIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22 10L12 5L2 10L12 15L22 10Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 12V17C6 17 8.5 19 12 19C15.5 19 18 17 18 17V12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const NyscIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2L3 7L12 12L21 7L12 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 17L12 22L21 17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 12L12 17L21 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RecruiterIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect
      x="2"
      y="7"
      width="20"
      height="14"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const roleOptions: RoleOption[] = [
  {
    id: 'student',
    title: 'Student',
    description:
      'Build employability skills, complete programs, and access career opportunities.',
    icon: <StudentIcon />,
    route: '/get-started/student',
    accentColor: 'blue',
  },
  {
    id: 'nysc',
    title: 'NYSC Corps Member',
    description:
      'Gain work-readiness training, internships and career opportunities during your service year.',
    icon: <NyscIcon />,
    route: '/get-started/nysc',
    accentColor: 'green',
  },
  {
    id: 'recruiter',
    title: 'Recruiter',
    description:
      'Discover and hire verified, work-ready African talent for your organization.',
    icon: <RecruiterIcon />,
    route: '/get-started/recruiter',
    accentColor: 'gold',
  },
];

export const GetStarted: React.FC = () => {
  return (
    <AuthLayout
      image={getStartedImg}
      imageAlt="African professional ready to start their journey with IQuire"
    >
      <AuthPageTitle
        title="Get Started"
        subtitle="Choose how you want to use IQuire. We'll tailor your experience to match your goals."
      />

      <div className={styles.roleGrid}>
        {roleOptions.map((role) => (
          <Link
            key={role.id}
            to={role.route}
            className={`${styles.roleCard} ${styles[role.accentColor]}`}
          >
            <div className={styles.roleIcon}>{role.icon}</div>
            <div className={styles.roleContent}>
              <h3 className={styles.roleTitle}>{role.title}</h3>
              <p className={styles.roleDescription}>{role.description}</p>
            </div>
            <div className={styles.roleArrow} aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 12H19M19 12L12 5M19 12L12 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      <p className={styles.loginPrompt}>
        Already have an account?{' '}
        <Link to="/login/student" className={styles.loginLink}>
          Login
        </Link>
      </p>

      <div className={styles.helperBox}>
        <p className={styles.helperText}>
          <strong>Not sure?</strong> Students and NYSC corps members build skills and career
          readiness. Recruiters hire trained, verified talent. Choose what fits you best — you
          can always switch later.
        </p>
      </div>
    </AuthLayout>
  );
};