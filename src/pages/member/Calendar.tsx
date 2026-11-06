/* eslint-disable react-hooks/preserve-manual-memoization */
// ============================================================================
// iQuire — Member: Calendar (Phase 17.5)
// ============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchUpcomingSessions,
  fetchMyAssignments,
  formatSessionDate,
  formatSessionTime,
  type MySession,
  type MyAssignment,
} from '../../services/student.service';
import styles from './Calendar.module.css';

// ============================================================================
// Types & Helpers
// ============================================================================

interface CalendarEvent {
  id: string;
  type: 'session' | 'assignment';
  title: string;
  date: string; // ISO string
  course_title: string | null;
  meta?: string; // e.g. time or due status
  link?: string; // for session join or assignment view
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

// ============================================================================
// Component
// ============================================================================

export const MemberCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState<MySession[]>([]);
  const [assignments, setAssignments] = useState<MyAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Load data
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      const [sessRes, assignRes] = await Promise.all([
        fetchUpcomingSessions(100), // Get a good chunk for the calendar
        fetchMyAssignments(),
      ]);

      if (!isMounted) return;

      if (!sessRes.success || !assignRes.success) {
        setError('Failed to load calendar events.');
      } else {
        setSessions(sessRes.data ?? []);
        setAssignments(assignRes.data ?? []);
      }
      setIsLoading(false);
    };
    load();
    return () => { isMounted = false; };
  }, []);

  // Combine into calendar events
  const events = useMemo(() => {
    const evts: CalendarEvent[] = [];

    sessions.forEach((s) => {
      evts.push({
        id: s.id,
        type: 'session',
        title: s.title,
        date: s.session_date,
        course_title: s.course_title,
        meta: `${formatSessionTime(s.session_date)} · ${s.duration_minutes} min`,
        link: s.meeting_url || undefined,
      });
    });

    assignments.forEach((a) => {
      if (a.due_date) {
        evts.push({
          id: a.id,
          type: 'assignment',
          title: a.title,
          date: a.due_date,
          course_title: a.course_title,
          meta: a.submission ? 'Submitted' : a.is_overdue ? 'Overdue' : 'Due',
          link: `/dashboard/courses/${a.course_id}`,
        });
      }
    });

    return evts;
  }, [sessions, assignments]);

  // Calendar math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();

  // Group events by day for the current month
  const eventsByDay = useMemo(() => {
    const map: Record<number, CalendarEvent[]> = {};
    events.forEach((e) => {
      const d = new Date(e.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(e);
      }
    });
    // Sort events within each day by time
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    );
    return map;
  }, [events, year, month]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => { setCurrentDate(new Date()); setSelectedDay(today.getDate()); };

  // Upcoming list (next 5 events from today)
  const upcomingList = useMemo(() => {
    const now = new Date().getTime();
    return events
      .filter((e) => new Date(e.date).getTime() >= now - 86400000) // include today
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [events]);

  const selectedEvents = selectedDay ? eventsByDay[selectedDay] || [] : [];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Calendar</h1>
          <p className={styles.pageSubtitle}>
            View your live sessions and assignment deadlines.
          </p>
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.layout}>
        {/* Left: Calendar Grid */}
        <div className={styles.calendarPanel}>
          <div className={styles.calendarHeader}>
            <h2 className={styles.monthLabel}>
              {MONTHS[month]} {year}
            </h2>
            <div className={styles.calendarControls}>
              <button onClick={goToToday} className={styles.todayBtn}>Today</button>
              <button onClick={prevMonth} className={styles.navBtn} aria-label="Previous month">
                ‹
              </button>
              <button onClick={nextMonth} className={styles.navBtn} aria-label="Next month">
                ›
              </button>
            </div>
          </div>

          <div className={styles.weekDays}>
            {DAYS.map((d) => (
              <div key={d} className={styles.weekDay}>{d}</div>
            ))}
          </div>

          <div className={styles.daysGrid}>
            {/* Empty slots for days before the 1st */}
            {[...Array(firstDay)].map((_, i) => (
              <div key={`empty-${i}`} className={styles.emptyDay} />
            ))}

            {/* Actual days */}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const dayEvents = eventsByDay[day] || [];
              const isToday =
                today.getDate() === day &&
                today.getMonth() === month &&
                today.getFullYear() === year;
              const isSelected = selectedDay === day;

              return (
                <button
                  key={day}
                  className={`${styles.dayCell} ${isToday ? styles.isToday : ''} ${
                    isSelected ? styles.isSelected : ''
                  }`}
                  onClick={() => setSelectedDay(day)}
                >
                  <span className={styles.dayNumber}>{day}</span>
                  <div className={styles.eventDots}>
                    {dayEvents.slice(0, 3).map((e, idx) => (
                      <span
                        key={idx}
                        className={`${styles.dot} ${
                          e.type === 'session' ? styles.dotSession : styles.dotAssignment
                        }`}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Sidebar (Details & Upcoming) */}
        <div className={styles.sidebar}>
          {/* Selected Day Details */}
          <div className={styles.sidePanel}>
            <h3 className={styles.sideTitle}>
              {selectedDay
                ? `${MONTHS[month]} ${selectedDay}, ${year}`
                : 'Select a day'}
            </h3>
            {selectedDay && selectedEvents.length === 0 && (
              <p className={styles.sideEmpty}>No events scheduled for this day.</p>
            )}
            {selectedDay && selectedEvents.length > 0 && (
              <div className={styles.eventList}>
                {selectedEvents.map((e) => (
                  <EventItem key={e.id} event={e} />
                ))}
              </div>
            )}
          </div>

          {/* Upcoming List */}
          <div className={styles.sidePanel}>
            <h3 className={styles.sideTitle}>Upcoming</h3>
            {isLoading ? (
              <p className={styles.sideEmpty}>Loading…</p>
            ) : upcomingList.length === 0 ? (
              <p className={styles.sideEmpty}>Nothing coming up.</p>
            ) : (
              <div className={styles.eventList}>
                {upcomingList.map((e) => (
                  <EventItem key={e.id} event={e} compact />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Event Item Sub-component
// ============================================================================

const EventItem: React.FC<{ event: CalendarEvent; compact?: boolean }> = ({
  event,
  compact,
}) => {
  const isSession = event.type === 'session';
  return (
    <div className={`${styles.eventItem} ${isSession ? styles.eventSession : styles.eventAssignment}`}>
      <div className={styles.eventTop}>
        <span className={styles.eventType}>
          {isSession ? '🎥 Live Session' : '📝 Assignment'}
        </span>
        {!compact && <span className={styles.eventTime}>{formatSessionDate(event.date)}</span>}
      </div>
      <h4 className={styles.eventTitle}>{event.title}</h4>
      {event.course_title && <p className={styles.eventCourse}>{event.course_title}</p>}
      {event.meta && <p className={styles.eventMeta}>{event.meta}</p>}
      
      {event.link && (
        <a
          href={event.link}
          target={isSession ? '_blank' : '_self'}
          rel="noopener noreferrer"
          className={styles.eventLink}
        >
          {isSession ? 'Join →' : 'View →'}
        </a>
      )}
      {!isSession && event.link?.startsWith('/') && (
        <Link to={event.link} className={styles.eventLink}>View →</Link>
      )}
    </div>
  );
};