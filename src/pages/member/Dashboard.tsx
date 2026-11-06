// ============================================================================
// iQuire — Member Dashboard (Phase 17.2 + Password Change)
// ============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchMyStats,
  fetchMyCourses,
  fetchMyAnnouncements,
  formatSessionDate,
  formatSessionTime,
  formatRelativeDate,
  type StudentStats,
  type MyCourse,
  type MyAnnouncement,
} from '../../services/student.service';
import { PasswordChangeModal } from '../../components/common/PasswordChangeModal';
import styles from './Dashboard.module.css';

export const MemberDashboard: React.FC = () => {
  const { profile, roles, refreshProfile } = useAuth();

  const firstName = profile?.first_name ?? 'there';
  const isAlumni = roles.includes('alumni');
  const isStudent = roles.includes('student');

  // Data
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [courses, setCourses] = useState<MyCourse[]>([]);
  const [announcements, setAnnouncements] = useState<MyAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Password change banner + modal
  const [showPasswordBanner, setShowPasswordBanner] = useState(
    () => !!profile?.must_change_password
  );
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Sync banner visibility when profile updates
  useEffect(() => {
    if (profile?.must_change_password) {
      setShowPasswordBanner(true);
    } else {
      setShowPasswordBanner(false);
    }
  }, [profile?.must_change_password]);

  // Load dashboard data
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);

      const [statsRes, coursesRes, annRes] = await Promise.all([
        fetchMyStats(),
        fetchMyCourses(),
        fetchMyAnnouncements(5),
      ]);

      if (!isMounted) return;

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (coursesRes.success && coursesRes.data) {
        const active = coursesRes.data
          .filter((c) => c.status === 'active')
          .slice(0, 3);
        setCourses(active.length > 0 ? active : coursesRes.data.slice(0, 3));
      }
      if (annRes.success && annRes.data) {
        setAnnouncements(annRes.data.slice(0, 3));
      }

      setIsLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Dynamic greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Role-aware checklist
  const checklist = useMemo(() => {
    const profileComplete =
      !!profile?.profile_completion && profile.profile_completion >= 70;

    if (isAlumni && !isStudent) {
      return [
        { done: profileComplete, label: 'Keep your profile up to date', hint: 'Reflect your latest career milestones', to: '/dashboard/profile' },
        { done: false, label: 'Build or refresh your CV', hint: 'Make it role-ready for new opportunities', to: '/dashboard/cv' },
        { done: false, label: 'Browse opportunities', hint: 'See jobs and internships matched to you', to: '/dashboard/opportunities' },
        { done: false, label: 'Update your LinkedIn', hint: 'Optimize your professional presence', to: '/dashboard/linkedin' },
        { done: false, label: 'Request a CV review', hint: 'Get personalized feedback from the iQuire team', to: '/dashboard/resources' },
      ];
    }

    return [
      { done: profileComplete, label: 'Complete your profile', hint: 'Add education, skills, and career goals', to: '/dashboard/profile' },
      { done: false, label: 'Try the AI Career Counselor', hint: 'Get personalized career guidance', to: '/dashboard/ai-counselor' },
      { done: false, label: 'Complete your career assessment', hint: 'Understand your strengths and skill gaps', to: '/dashboard/readiness' },
      { done: false, label: 'Build or upload your CV', hint: 'Create a professional, role-ready CV', to: '/dashboard/cv' },
      { done: false, label: 'Explore opportunities', hint: 'Browse jobs and internships matched to you', to: '/dashboard/opportunities' },
    ];
  }, [isAlumni, isStudent, profile]);

  // Password change success
  const handlePasswordChanged = async () => {
    setShowPasswordModal(false);
    setShowPasswordBanner(false);
    // Refresh profile so must_change_password flag syncs
    try {
      await refreshProfile();
    } catch {
      // non-blocking
    }
  };

  return (
    <div className={styles.dashboard}>
      {/* ================================================================
          PASSWORD CHANGE BANNER
          ================================================================ */}
      {showPasswordBanner && (
        <div className={styles.securityBanner} role="alert">
          <div className={styles.securityBannerIcon} aria-hidden="true">🔒</div>
          <div className={styles.securityBannerContent}>
            <strong className={styles.securityBannerTitle}>
              Secure your account
            </strong>
            <p className={styles.securityBannerText}>
              You're still using the temporary password we emailed you. Change
              it now to keep your account safe.
            </p>
          </div>
          <div className={styles.securityBannerActions}>
            <button
              type="button"
              className={styles.securityBannerPrimary}
              onClick={() => setShowPasswordModal(true)}
            >
              Change Password
            </button>
            <button
              type="button"
              className={styles.securityBannerSecondary}
              onClick={() => setShowPasswordBanner(false)}
            >
              Remind me later
            </button>
          </div>
        </div>
      )}

      {/* ================================================================
          WELCOME BANNER
          ================================================================ */}
      <div className={styles.welcomeBanner}>
        <div className={styles.welcomeContent}>
          <h1 className={styles.welcomeTitle}>
            {`${greeting}, ${firstName}`}
          </h1>
        </div>
      </div>

      {/* ================================================================
          STATS
          ================================================================ */}
      <div className={styles.statsGrid}>
        <StatCard icon="📚" label="Active Courses" value={isLoading ? '—' : String(stats?.active_courses ?? 0)} accent="navy" />
        <StatCard icon="📅" label="Upcoming Sessions" value={isLoading ? '—' : String(stats?.upcoming_sessions ?? 0)} accent="gold" />
        <StatCard icon="📝" label="Pending Assignments" value={isLoading ? '—' : String(stats?.pending_assignments ?? 0)} accent="green" />
        <StatCard icon="🏆" label="Certificates" value={isLoading ? '—' : String(stats?.certificates_earned ?? 0)} accent="purple" />
      </div>

      {/* ================================================================
          NEXT SESSION + NEXT ASSIGNMENT
          ================================================================ */}
      <div className={styles.twoCol}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Next Live Session</h2>
            <Link to="/dashboard/calendar" className={styles.panelLink}>
              View calendar →
            </Link>
          </div>
          {isLoading ? (
            <div className={styles.panelSkeleton} />
          ) : stats?.next_session ? (
            <div className={styles.nextCard}>
              <div className={styles.nextCardMeta}>
                <span className={styles.nextCardBadge}>
                  {formatRelativeDate(stats.next_session.session_date)}
                </span>
                {stats.next_session.course_title && (
                  <span className={styles.nextCardCourse}>
                    {stats.next_session.course_title}
                  </span>
                )}
              </div>
              <h3 className={styles.nextCardTitle}>
                {stats.next_session.title}
              </h3>
              <p className={styles.nextCardDetail}>
                {`${formatSessionDate(stats.next_session.session_date)} · ${formatSessionTime(stats.next_session.session_date)} · ${stats.next_session.duration_minutes} min`}
              </p>
              {stats.next_session.meeting_url ? (
                <a
                  href={stats.next_session.meeting_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.nextCardBtn}
                >
                  Join Live Class →
                </a>
              ) : (
                <span className={styles.nextCardHint}>
                  Meeting link will appear here when the session is live
                </span>
              )}
            </div>
          ) : (
            <div className={styles.panelEmpty}>
              <div className={styles.panelEmptyIcon}>📅</div>
              <p className={styles.panelEmptyText}>
                No upcoming live sessions.
              </p>
            </div>
          )}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Next Assignment</h2>
            <Link to="/dashboard/courses" className={styles.panelLink}>
              View all →
            </Link>
          </div>
          {isLoading ? (
            <div className={styles.panelSkeleton} />
          ) : stats?.next_assignment ? (
            <div className={styles.nextCard}>
              <div className={styles.nextCardMeta}>
                <span
                  className={`${styles.nextCardBadge} ${stats.next_assignment.is_overdue ? styles.nextCardBadgeDanger : ''}`}
                >
                  {stats.next_assignment.is_overdue
                    ? 'Overdue'
                    : stats.next_assignment.days_until_due !== null
                    ? stats.next_assignment.days_until_due === 0
                      ? 'Due today'
                      : stats.next_assignment.days_until_due === 1
                      ? 'Due tomorrow'
                      : `Due in ${stats.next_assignment.days_until_due} days`
                    : 'No deadline'}
                </span>
                {stats.next_assignment.course_title && (
                  <span className={styles.nextCardCourse}>
                    {stats.next_assignment.course_title}
                  </span>
                )}
              </div>
              <h3 className={styles.nextCardTitle}>
                {stats.next_assignment.title}
              </h3>
              {stats.next_assignment.description && (
                <p className={styles.nextCardDetail}>
                  {stats.next_assignment.description.length > 120
                    ? `${stats.next_assignment.description.slice(0, 120)}…`
                    : stats.next_assignment.description}
                </p>
              )}
              <Link
                to={`/dashboard/courses/${stats.next_assignment.course_id}`}
                className={styles.nextCardBtn}
              >
                View Assignment →
              </Link>
            </div>
          ) : (
            <div className={styles.panelEmpty}>
              <div className={styles.panelEmptyIcon}>✅</div>
              <p className={styles.panelEmptyText}>
                You're all caught up on assignments.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* ================================================================
          ACTIVE COURSES
          ================================================================ */}
      {!isLoading && courses.length > 0 && (
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>My Courses</h2>
            <Link to="/dashboard/courses" className={styles.panelLink}>
              View all →
            </Link>
          </div>
          <div className={styles.coursesGrid}>
            {courses.map((course) => (
              <Link
                key={course.enrollment_id}
                to={`/dashboard/courses/${course.course_id}`}
                className={styles.courseCard}
              >
                <div className={styles.courseImage}>
                  {course.hero_image_url || course.thumbnail_url ? (
                    <img
                      src={course.hero_image_url ?? course.thumbnail_url ?? ''}
                      alt={course.title}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className={styles.courseImagePlaceholder}>
                      {course.emoji ?? '🎓'}
                    </div>
                  )}
                </div>
                <div className={styles.courseBody}>
                  <h3 className={styles.courseTitle}>{course.title}</h3>
                  {course.cohort_name && (
                    <p className={styles.courseMeta}>{course.cohort_name}</p>
                  )}
                  <div className={styles.courseProgressBar}>
                    <div
                      className={styles.courseProgressFill}
                      style={{ width: `${course.progress_percent}%` }}
                    />
                  </div>
                  <div className={styles.courseFooter}>
                    <span className={styles.courseProgressText}>
                      {`${course.progress_percent}% complete`}
                    </span>
                    <span className={styles.courseArrow}>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ================================================================
          GETTING STARTED + AI COUNSELOR
          ================================================================ */}
      <div className={styles.twoCol}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Getting Started</h2>
          </div>
          <div className={styles.checklist}>
            {checklist.map((item) => (
              <ChecklistItem
                key={item.to}
                done={item.done}
                label={item.label}
                hint={item.hint}
                to={item.to}
              />
            ))}
          </div>
        </section>

        <section className={`${styles.panel} ${styles.aiPanel}`}>
          <div className={styles.aiHeader}>
            <div className={styles.aiIcon}>🤖</div>
            <h2 className={styles.panelTitle}>AI Career Counselor</h2>
          </div>
          <p className={styles.aiDescription}>
            Get personalized career guidance, identify skill gaps, and discover
            opportunities that match your profile.
          </p>
          <ul className={styles.aiFeatures}>
            <li>Career direction &amp; assessments</li>
            <li>Skill-gap identification</li>
            <li>CV &amp; LinkedIn optimization</li>
            <li>Opportunity matching</li>
            <li>Interview preparation</li>
          </ul>
          <Link to="/dashboard/ai-counselor" className={styles.aiButton}>
            Chat with your counselor →
          </Link>
        </section>
      </div>

      {/* ================================================================
          ANNOUNCEMENTS
          ================================================================ */}
      {!isLoading && announcements.length > 0 && (
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Announcements</h2>
            <Link to="/dashboard/announcements" className={styles.panelLink}>
              View all →
            </Link>
          </div>
          <div className={styles.announcementList}>
            {announcements.map((a) => (
              <div key={a.id} className={styles.announcementItem}>
                <div className={styles.announcementHeader}>
                  <span
                    className={`${styles.announcementPriority} ${styles[`priority-${a.priority}`]}`}
                  >
                    {a.priority}
                  </span>
                  <span className={styles.announcementDate}>
                    {formatRelativeDate(a.published_at)}
                  </span>
                </div>
                <h3 className={styles.announcementTitle}>{a.title}</h3>
                <p className={styles.announcementBody}>
                  {a.body.length > 180 ? `${a.body.slice(0, 180)}…` : a.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================================================================
          QUICK LINKS
          ================================================================ */}
      <div className={styles.quickLinks}>
        <QuickLink to="/dashboard/courses" icon="📚" label="My Courses" />
        <QuickLink to="/dashboard/calendar" icon="📅" label="Calendar" />
        <QuickLink to="/dashboard/opportunities" icon="💼" label="Opportunities" />
        <QuickLink to="/dashboard/profile" icon="👤" label="My Profile" />
        <QuickLink to="/dashboard/cv" icon="📄" label="CV Builder" />
        <QuickLink to="/dashboard/certificates" icon="🏆" label="Certificates" />
      </div>

      {/* ================================================================
          PASSWORD CHANGE MODAL
          ================================================================ */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={handlePasswordChanged}
      />
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
  accent: 'navy' | 'gold' | 'green' | 'purple';
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

const ChecklistItem: React.FC<ChecklistItemProps> = ({
  done,
  label,
  hint,
  to,
}) => (
  <Link
    to={to}
    className={`${styles.checklistItem} ${done ? styles.checklistDone : ''}`}
  >
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