
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Dashboard.module.css';

export const MemberDashboard: React.FC = () => {
  const { profile, tier, roles } = useAuth();

  const firstName = profile?.first_name ?? 'there';
  const isGuest = tier === 'guest';
  const isAlumni = roles.includes('alumni');
  const isStudent = roles.includes('student');

  return (
    <div className={styles.dashboard}>
      {/* Welcome banner */}
      <div className={styles.welcomeBanner}>
        <div className={styles.welcomeContent}>
          <h1 className={styles.welcomeTitle}>
            Hi {firstName}, welcome to your IQuire dashboard
          </h1>
          <p className={styles.welcomeSubtitle}>
            {isAlumni && isStudent
              ? 'You are an IQuire alumnus and a current student. Continue learning and exploring opportunities.'
              : isAlumni
              ? 'Welcome back, alumnus. Explore new opportunities and keep growing.'
              : 'Your career journey starts here. Explore courses and opportunities.'}
          </p>
          {profile?.participant_id && (
            <div className={styles.participantId}>
              <span className={styles.participantIdLabel}>Your IQuire ID</span>
              <span className={styles.participantIdValue}>{profile.participant_id}</span>
            </div>
          )}
        </div>
      </div>

      {/* Guest notice */}
      {isGuest && (
        <div className={styles.guestNotice}>
          <div className={styles.guestIcon}>⏳</div>
          <div className={styles.guestText}>
            <strong>Your account is pending verification</strong>
            <p>
              Your account has been created and is awaiting admin review. In the
              meantime, you can explore courses, try the AI Career Counselor, and
              complete your profile.
            </p>
          </div>
        </div>
      )}

      {/* Quick stats grid */}
      <div className={styles.statsGrid}>
        <StatCard icon="📚" label="Enrolled Courses" value="0" accent="blue" />
        <StatCard icon="🎯" label="Opportunities" value="0" accent="gold" />
        <StatCard icon="📈" label="Career Progress" value="0%" accent="green" />
        <StatCard icon="🤖" label="AI Sessions" value="0" accent="purple" />
      </div>

      {/* Two-column section */}
      <div className={styles.twoCol}>
        {/* Getting started */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Getting started</h2>
          </div>
          <div className={styles.checklist}>
            <ChecklistItem
              done={!!profile?.profile_completion && profile.profile_completion > 0}
              label="Complete your profile"
              hint="Add education, skills, and career goals"
              to="/dashboard/profile"
            />
            <ChecklistItem
              done={false}
              label="Register for a course"
              hint="Pick from 4 career-focused programs"
              to="/courses"
            />
            <ChecklistItem
              done={false}
              label="Try the AI Career Counselor"
              hint="Get personalized career guidance"
              to="/dashboard/ai-counselor"
            />
            <ChecklistItem
              done={false}
              label="Complete your career assessment"
              hint="Understand your strengths and skill gaps"
              to="/dashboard/readiness"
            />
            <ChecklistItem
              done={false}
              label="Build or upload your CV"
              hint="Create a professional, role-ready CV"
              to="/dashboard/cv"
            />
          </div>
        </section>

        {/* AI Card */}
        <section className={`${styles.panel} ${styles.aiPanel}`}>
          <div className={styles.aiHeader}>
            <div className={styles.aiIcon}>🤖</div>
            <h2 className={styles.panelTitle}>Your AI Career Counselor</h2>
          </div>
          <p className={styles.aiDescription}>
            Get personalized career guidance, identify skill gaps, and discover
            opportunities that match your profile.
          </p>
          <ul className={styles.aiFeatures}>
            <li>Career direction & assessments</li>
            <li>Skill-gap identification</li>
            <li>CV & LinkedIn optimization</li>
            <li>Opportunity matching</li>
            <li>Interview preparation</li>
          </ul>
          <Link to="/dashboard/ai-counselor" className={styles.aiButton}>
            Meet Your AI Counselor →
          </Link>
        </section>
      </div>

      {/* Quick links */}
      <div className={styles.quickLinks}>
        <QuickLink to="/courses" icon="📚" label="Browse Courses" />
        <QuickLink to="/dashboard/opportunities" icon="💼" label="Find Opportunities" />
        <QuickLink to="/dashboard/profile" icon="👤" label="My Profile" />
        <QuickLink to="/dashboard/cv" icon="📄" label="CV Builder" />
        <QuickLink to="/dashboard/certificates" icon="🏆" label="Certificates" />
        <QuickLink to="/dashboard/settings" icon="⚙️" label="Settings" />
      </div>
    </div>
  );
};

// ============================================================================
// Sub-components
// ============================================================================

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  accent: 'blue' | 'green' | 'gold' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, accent }) => (
  <div className={`${styles.statCard} ${styles[`accent-${accent}`]}`}>
    <div className={styles.statIcon}>{icon}</div>
    <div className={styles.statBody}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  </div>
);

interface ChecklistItemProps {
  done: boolean;
  label: string;
  hint: string;
  to: string;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ done, label, hint, to }) => (
  <Link to={to} className={`${styles.checklistItem} ${done ? styles.checklistDone : ''}`}>
    <div className={styles.checklistCheckbox}>{done ? '✓' : ''}</div>
    <div className={styles.checklistBody}>
      <span className={styles.checklistLabel}>{label}</span>
      <span className={styles.checklistHint}>{hint}</span>
    </div>
    <span className={styles.checklistArrow}>→</span>
  </Link>
);

interface QuickLinkProps {
  to: string;
  icon: string;
  label: string;
}

const QuickLink: React.FC<QuickLinkProps> = ({ to, icon, label }) => (
  <Link to={to} className={styles.quickLink}>
    <span className={styles.quickIcon}>{icon}</span>
    <span className={styles.quickLabel}>{label}</span>
  </Link>
);