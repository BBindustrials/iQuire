// ============================================================================
// iQuire — Member: Classes & Live (Phase 17.4)
// ============================================================================

import React, { useEffect, useState } from 'react';
import {
  fetchUpcomingSessions,
  fetchPastSessions,
  formatSessionDate,
  formatSessionTime,
  formatRelativeDate,
  type MySession,
} from '../../services/student.service';
import styles from './Classes.module.css';

export const MemberClasses: React.FC = () => {
  const [upcoming, setUpcoming] = useState<MySession[]>([]);
  const [past, setPast] = useState<MySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      const [upcomingRes, pastRes] = await Promise.all([
        fetchUpcomingSessions(20),
        fetchPastSessions(20),
      ]);

      if (!isMounted) return;

      if (!upcomingRes.success || !pastRes.success) {
        setError(
          upcomingRes.error ??
            pastRes.error ??
            'Failed to load sessions. Please try again.'
        );
        setIsLoading(false);
        return;
      }

      setUpcoming(upcomingRes.data ?? []);
      setPast(pastRes.data ?? []);
      setIsLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Classes & Live</h1>
          <p className={styles.pageSubtitle}>
            Join your upcoming live sessions and catch up on recordings.
          </p>
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner} role="alert">
          <span>{error}</span>
          <button
            type="button"
            className={styles.errorClose}
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${
            activeTab === 'upcoming' ? styles.tabActive : ''
          }`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming Sessions
          <span className={styles.tabCount}>{upcoming.length}</span>
        </button>
        <button
          type="button"
          className={`${styles.tab} ${
            activeTab === 'past' ? styles.tabActive : ''
          }`}
          onClick={() => setActiveTab('past')}
        >
          Past Recordings
          <span className={styles.tabCount}>{past.length}</span>
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className={styles.list}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : activeTab === 'upcoming' ? (
        <SessionList sessions={upcoming} type="upcoming" />
      ) : (
        <SessionList sessions={past} type="past" />
      )}
    </div>
  );
};

// ============================================================================
// Sub-components
// ============================================================================

interface SessionListProps {
  sessions: MySession[];
  type: 'upcoming' | 'past';
}

const SessionList: React.FC<SessionListProps> = ({ sessions, type }) => {
  if (sessions.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          {type === 'upcoming' ? '📅' : '🎬'}
        </div>
        <h3 className={styles.emptyTitle}>
          {type === 'upcoming'
            ? 'No upcoming sessions'
            : 'No past recordings yet'}
        </h3>
        <p className={styles.emptyText}>
          {type === 'upcoming'
            ? "You're all caught up! New sessions will appear here when scheduled."
            : 'Recordings will be available here after your live classes.'}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {sessions.map((session) => (
        <SessionCard key={session.id} session={session} type={type} />
      ))}
    </div>
  );
};

interface SessionCardProps {
  session: MySession;
  type: 'upcoming' | 'past';
}

const SessionCard: React.FC<SessionCardProps> = ({ session, type }) => {
  const isUpcoming = type === 'upcoming';
  const hasMeetingLink = !!session.meeting_url;
  const hasRecording = !!session.recording_url;

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardMeta}>
          <span
            className={`${styles.cardBadge} ${
              isUpcoming ? styles.badgeUpcoming : styles.badgePast
            }`}
          >
            {isUpcoming
              ? formatRelativeDate(session.session_date)
              : 'Completed'}
          </span>
          {session.course_title && (
            <span className={styles.cardCourse}>{session.course_title}</span>
          )}
          {session.cohort_name && (
            <span className={styles.cardCohort}>{session.cohort_name}</span>
          )}
        </div>
      </div>

      <h3 className={styles.cardTitle}>{session.title}</h3>

      {session.description && (
        <p className={styles.cardDescription}>{session.description}</p>
      )}

      <div className={styles.cardDetails}>
        <div className={styles.detailItem}>
          <span className={styles.detailIcon}>📅</span>
          <span>
            {formatSessionDate(session.session_date)} at{' '}
            {formatSessionTime(session.session_date)}
          </span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailIcon}>⏱️</span>
          <span>{session.duration_minutes} minutes</span>
        </div>
      </div>

      <div className={styles.cardActions}>
        {isUpcoming && hasMeetingLink && (
          <a
            href={session.meeting_url!}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.primaryBtn}
          >
            Join Live Class →
          </a>
        )}
        {isUpcoming && !hasMeetingLink && (
          <span className={styles.hint}>
            Meeting link will be available closer to the session time.
          </span>
        )}
        {!isUpcoming && hasRecording && (
          <a
            href={session.recording_url!}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondaryBtn}
          >
            Watch Recording →
          </a>
        )}
        {!isUpcoming && !hasRecording && (
          <span className={styles.hint}>
            No recording available for this session.
          </span>
        )}
      </div>
    </article>
  );
};