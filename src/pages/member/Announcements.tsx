// ============================================================================
// iQuire — Member: Announcements (Phase 17.6)
// ============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import {
  fetchMyAnnouncements,
  formatRelativeDate,
  type MyAnnouncement,
} from '../../services/student.service';
import styles from './Announcements.module.css';

// ============================================================================
// Types
// ============================================================================

type FilterTab = 'all' | 'urgent' | 'high';

// ============================================================================
// Component
// ============================================================================

export const MemberAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<MyAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  // Load
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      const res = await fetchMyAnnouncements(100);
      if (!isMounted) return;

      if (!res.success) {
        setError(res.error ?? 'Failed to load announcements');
        setIsLoading(false);
        return;
      }

      setAnnouncements(res.data ?? []);
      setIsLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Stats
  const stats = useMemo(
    () => ({
      total: announcements.length,
      urgent: announcements.filter((a) => a.priority === 'urgent').length,
      high: announcements.filter((a) => a.priority === 'high').length,
    }),
    [announcements]
  );

  // Filtered
  const filtered = useMemo(() => {
    if (activeTab === 'urgent') {
      return announcements.filter((a) => a.priority === 'urgent');
    }
    if (activeTab === 'high') {
      return announcements.filter((a) => a.priority === 'high');
    }
    return announcements;
  }, [announcements, activeTab]);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Announcements</h1>
          <p className={styles.pageSubtitle}>
            Stay up to date with news from your courses and the iQuire team.
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

      {/* Filters */}
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${
            activeTab === 'all' ? styles.tabActive : ''
          }`}
          onClick={() => setActiveTab('all')}
        >
          All
          <span className={styles.tabCount}>{stats.total}</span>
        </button>
        <button
          type="button"
          className={`${styles.tab} ${
            activeTab === 'high' ? styles.tabActive : ''
          }`}
          onClick={() => setActiveTab('high')}
        >
          High Priority
          <span className={styles.tabCount}>{stats.high}</span>
        </button>
        <button
          type="button"
          className={`${styles.tab} ${
            activeTab === 'urgent' ? styles.tabActive : ''
          }`}
          onClick={() => setActiveTab('urgent')}
        >
          Urgent
          <span className={styles.tabCount}>{stats.urgent}</span>
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className={styles.list}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📢</div>
          <h3 className={styles.emptyTitle}>
            {announcements.length === 0
              ? 'No announcements yet'
              : `No ${activeTab} announcements`}
          </h3>
          <p className={styles.emptyText}>
            {announcements.length === 0
              ? 'Check back here for updates from your courses and the iQuire team.'
              : 'Try a different filter to see all announcements.'}
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Sub-components
// ============================================================================

interface AnnouncementCardProps {
  announcement: MyAnnouncement;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
}) => {
  const priorityClass =
    styles[`priority${announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}`];

  return (
    <article className={`${styles.card} ${priorityClass}`}>
      <div className={styles.cardHeader}>
        <div className={styles.cardMeta}>
          <span
            className={`${styles.priorityBadge} ${
              styles[`badge${announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}`]
            }`}
          >
            {announcement.priority}
          </span>
          {announcement.auto_generated && (
            <span className={styles.autoBadge}>System</span>
          )}
          <span className={styles.dateLabel}>
            {formatRelativeDate(announcement.published_at)}
          </span>
        </div>
      </div>

      <h3 className={styles.cardTitle}>{announcement.title}</h3>
      <p className={styles.cardBody}>{announcement.body}</p>
    </article>
  );
};