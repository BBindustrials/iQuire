import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  getDashboardStats,
  getRecentUsers,
  getSignupTrend,
  type DashboardStats,
  type RecentUser,
  type SignupTrendPoint,
} from '../../services/admin.service';
import styles from './Dashboard.module.css';

// ============================================================================
// Component
// ============================================================================

export const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [trend, setTrend] = useState<SignupTrendPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // Fetch all dashboard data
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      const [statsRes, usersRes, trendRes] = await Promise.all([
        getDashboardStats(),
        getRecentUsers(5),
        getSignupTrend(7),
      ]);

      if (!isMounted) return;

      if (statsRes.error) {
        setError(statsRes.error);
      } else {
        setStats(statsRes.data);
        setRecentUsers(usersRes.data ?? []);
        setTrend(trendRes.data ?? []);
      }

      setIsLoading(false);
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const firstName = profile?.first_name ?? 'Admin';

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.dashboard}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Welcome back, {firstName}</h1>
          <p className={styles.pageSubtitle}>
            Here's a snapshot of what's happening on the IQuire platform today.
          </p>
        </div>
      </div>

      {/* Error banner */}
{error && (
    <div className={styles.errorBanner} role="alert">
      <div>
        <strong>Failed to load dashboard:</strong> {error}
      </div>
      <button
        type="button"
        className={styles.retryButton}
        onClick={() => window.location.reload()}
      >
        Retry
      </button>
    </div>
  )}

      {/* Stats grid */}
      <div className={styles.statsGrid}>
        <StatCard
          label="Total Users"
          value={stats?.totalUsers}
          loading={isLoading}
          icon="👥"
          accent="blue"
        />
        <StatCard
          label="Students"
          value={stats?.students}
          loading={isLoading}
          icon="🎓"
          accent="blue"
        />
        <StatCard
          label="NYSC Corps"
          value={stats?.nysc}
          loading={isLoading}
          icon="🇳🇬"
          accent="green"
        />
        <StatCard
          label="Recruiters"
          value={stats?.recruiters}
          loading={isLoading}
          icon="🏢"
          accent="gold"
        />
        <StatCard
          label="Verified"
          value={stats?.verified}
          loading={isLoading}
          icon="✅"
          accent="green"
        />
        <StatCard
          label="Pending Review"
          value={stats?.pending}
          loading={isLoading}
          icon="⏳"
          accent="gold"
        />
        <StatCard
          label="New (7 days)"
          value={stats?.recentSignups}
          loading={isLoading}
          icon="📈"
          accent="blue"
        />
        <StatCard
          label="Admins"
          value={stats?.admins}
          loading={isLoading}
          icon="🛡️"
          accent="dark"
        />
      </div>

      {/* Two-column section */}
      <div className={styles.twoCol}>
        {/* Signup trend */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Signups — Last 7 Days</h2>
            <span className={styles.panelMeta}>
              {trend.reduce((sum, p) => sum + p.count, 0)} total
            </span>
          </div>
          <div className={styles.trendChart}>
            {isLoading ? (
              <div className={styles.chartSkeleton} />
            ) : trend.length === 0 ? (
              <p className={styles.emptyText}>No signups in the last 7 days.</p>
            ) : (
              <div className={styles.bars}>
                {trend.map((point) => {
                  const max = Math.max(...trend.map((p) => p.count), 1);
                  const pct = (point.count / max) * 100;
                  const day = new Date(point.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                  });
                  return (
                    <div key={point.date} className={styles.barWrapper}>
                      <div className={styles.barTrack}>
                        <div
                          className={styles.barFill}
                          style={{ height: `${Math.max(pct, 4)}%` }}
                        >
                          <span className={styles.barValue}>{point.count}</span>
                        </div>
                      </div>
                      <span className={styles.barLabel}>{day}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Recent users */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Recent Signups</h2>
            <Link to="/admin/users/students" className={styles.panelLink}>
              View all →
            </Link>
          </div>
          <div className={styles.recentList}>
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className={styles.listSkeleton} />
              ))
            ) : recentUsers.length === 0 ? (
              <p className={styles.emptyText}>No users yet.</p>
            ) : (
              recentUsers.map((user) => (
                <div key={user.id} className={styles.userRow}>
                  <div className={styles.userAvatar}>
                    {(user.first_name?.[0] ?? '?')}
                    {(user.last_name?.[0] ?? '')}
                  </div>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>
                      {user.first_name} {user.last_name}
                    </span>
                    <span className={styles.userEmail}>{user.email}</span>
                  </div>
                  <div className={styles.userMeta}>
                    <RoleBadge role={user.role} />
                    <span className={styles.userDate}>
                      {formatRelativeDate(user.created_at)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Quick actions */}
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>Quick Actions</h2>
        </div>
        <div className={styles.quickActions}>
          <QuickAction to="/admin/programs" icon="📚" label="Add Program" />
          <QuickAction to="/admin/blog" icon="✍️" label="New Blog Post" />
          <QuickAction to="/admin/events" icon="📅" label="Create Event" />
          <QuickAction to="/admin/jobs" icon="💼" label="Post Job" />
          <QuickAction to="/admin/testimonials" icon="⭐" label="Add Testimonial" />
          <QuickAction to="/admin/settings" icon="⚙️" label="Site Settings" />
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// Sub-components
// ============================================================================

interface StatCardProps {
  label: string;
  value: number | undefined;
  loading: boolean;
  icon: string;
  accent: 'blue' | 'green' | 'gold' | 'dark';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, loading, icon, accent }) => (
  <div className={`${styles.statCard} ${styles[`accent-${accent}`]}`}>
    <div className={styles.statIcon}>{icon}</div>
    <div className={styles.statBody}>
      <div className={styles.statValue}>
        {loading ? <span className={styles.valueSkeleton} /> : value ?? 0}
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  </div>
);

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const label =
    role === 'nysc' ? 'NYSC' : role.charAt(0).toUpperCase() + role.slice(1);
  return <span className={`${styles.roleBadge} ${styles[`role-${role}`]}`}>{label}</span>;
};

interface QuickActionProps {
  to: string;
  icon: string;
  label: string;
}

const QuickAction: React.FC<QuickActionProps> = ({ to, icon, label }) => (
  <Link to={to} className={styles.quickAction}>
    <span className={styles.qaIcon}>{icon}</span>
    <span className={styles.qaLabel}>{label}</span>
  </Link>
);

// ============================================================================
// Helpers
// ============================================================================

const formatRelativeDate = (iso: string): string => {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.floor((now - then) / 60000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const hours = Math.floor(diffMin / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};