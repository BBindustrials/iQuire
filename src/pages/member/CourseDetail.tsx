// ============================================================================
// iQuire — Member: Course Detail (Phase 17.4 - Final Updated)
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  fetchMyCourseDetail,
  formatSessionDate,
  formatSessionTime,
  formatRelativeDate,
  submitAssignment, // Import the submission function
  type MyCourseDetail,
  type MyLesson,
  type MySession,
  type MyMaterial,
  type MyAssignment,
} from '../../services/student.service';
import styles from './CourseDetail.module.css';

type Tab = 'lessons' | 'sessions' | 'materials' | 'assignments';

export const MemberCourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [searchParams] = useSearchParams();
  
  // Set initial tab based on URL query (?tab=assignments)
  const initialTab = (searchParams.get('tab') as Tab) || 'lessons';
  
  const [data, setData] = useState<MyCourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  // Submission Modal State
  const [submittingAssignment, setSubmittingAssignment] = useState<MyAssignment | null>(null);

  useEffect(() => {
    if (!courseId) {
      setError('Course ID is missing.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetchMyCourseDetail(courseId);
        if (!isMounted) return;

        if (!res.success || !res.data) {
          setError(res.error ?? 'Failed to load course details');
        } else {
          setData(res.data);
        }
      } catch (err) {
        if (isMounted) setError(String(err));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  // Handle successful submission
  const handleSubmissionSuccess = async () => {
    setSubmittingAssignment(null);
    // Reload data to show the new submission status
    if (courseId) {
      const res = await fetchMyCourseDetail(courseId);
      if (res.success && res.data) setData(res.data);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeletonHero} />
        <div className={styles.skeletonBody} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2 className={styles.errorTitle}>Course not found</h2>
          <p className={styles.errorText}>{error}</p>
          <Link to="/dashboard/courses" className={styles.backBtn}>
            ← Back to My Courses
          </Link>
        </div>
      </div>
    );
  }

  const { enrollment, lessons, sessions, materials, assignments } = data;
  const course = enrollment.course;
  const cohort = enrollment.cohort;

  const submittedCount = assignments.filter((a) => a.submission).length;
  const totalAssignments = assignments.length;
  const progress =
    totalAssignments > 0
      ? Math.round((submittedCount / totalAssignments) * 100)
      : enrollment.status === 'completed'
      ? 100
      : 0;

  const imageUrl = course?.hero_image_url ?? course?.thumbnail_url;

  return (
    <div className={styles.page}>
      <Link to="/dashboard/courses" className={styles.backLink}>
        ← Back to My Courses
      </Link>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroImage}>
          {imageUrl ? (
            <img src={imageUrl} alt={course?.title} />
          ) : (
            <div className={styles.heroImagePlaceholder}>
              {course?.emoji ?? '🎓'}
            </div>
          )}
        </div>
        <div className={styles.heroBody}>
          <div className={styles.heroMeta}>
            <span className={styles.heroBadge}>
              {enrollment.status === 'completed' ? 'Completed' : 'Active'}
            </span>
            {cohort?.name && (
              <span className={styles.heroCohort}>{cohort.name}</span>
            )}
          </div>
          <h1 className={styles.heroTitle}>{course?.title}</h1>
          <p className={styles.heroDescription}>{course?.description}</p>

          <div className={styles.heroProgress}>
            <div className={styles.heroProgressLabel}>
              <span>Course Progress</span>
              <span className={styles.heroProgressValue}>{progress}%</span>
            </div>
            <div className={styles.heroProgressBar}>
              <div
                className={styles.heroProgressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <TabButton label="Lessons" count={lessons.length} active={activeTab === 'lessons'} onClick={() => setActiveTab('lessons')} />
        <TabButton label="Sessions" count={sessions.length} active={activeTab === 'sessions'} onClick={() => setActiveTab('sessions')} />
        <TabButton label="Materials" count={materials.length} active={activeTab === 'materials'} onClick={() => setActiveTab('materials')} />
        <TabButton label="Assignments" count={assignments.length} active={activeTab === 'assignments'} onClick={() => setActiveTab('assignments')} />
      </div>

      {/* Content */}
      <div className={styles.content}>
        {activeTab === 'lessons' && <LessonsTab lessons={lessons} />}
        {activeTab === 'sessions' && <SessionsTab sessions={sessions} />}
        {activeTab === 'materials' && <MaterialsTab materials={materials} />}
        {activeTab === 'assignments' && (
          <AssignmentsTab 
            assignments={assignments} 
            onOpenSubmit={(assignment) => setSubmittingAssignment(assignment)} 
          />
        )}
      </div>

      {/* Submission Modal */}
      {submittingAssignment && (
        <SubmissionModal
          assignment={submittingAssignment}
          onClose={() => setSubmittingAssignment(null)}
          onSuccess={handleSubmissionSuccess}
        />
      )}
    </div>
  );
};

// ============================================================================
// Submission Modal
// ============================================================================

const SubmissionModal: React.FC<{
  assignment: MyAssignment;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ assignment, onClose, onSuccess }) => {
  const [url, setUrl] = useState(assignment.submission?.submission_url || '');
  const [text, setText] = useState(assignment.submission?.submission_text || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const res = await submitAssignment({
      assignment_id: assignment.id,
      submission_url: url || undefined,
      submission_text: text || undefined,
    });

    if (res.success) {
      onSuccess();
    } else {
      setError(res.error || 'Failed to submit');
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Submit Assignment</h2>
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.modalBody}>
          <p className={styles.modalAssignmentTitle}>{assignment.title}</p>
          
          {error && <div className={styles.modalError}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.modalForm}>
            <div className={styles.formGroup}>
              <label>Submission Link (Google Drive, Dropbox, etc.)</label>
              <input 
                type="url" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                placeholder="https://..."
              />
            </div>

            <div className={styles.formGroup}>
              <label>Or Write a Text Submission</label>
              <textarea 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                rows={4}
                placeholder="Type your response here..."
              />
            </div>
            
            <p className={styles.modalHint}>Provide either a link or text. Both are optional.</p>

            <div className={styles.modalActions}>
              <button type="button" onClick={onClose} className={styles.modalCancel} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className={styles.modalSubmit} disabled={isSubmitting || (!url && !text)}>
                {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Sub-components
// ============================================================================

interface TabButtonProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, count, active, onClick }) => (
  <button
    type="button"
    className={`${styles.tab} ${active ? styles.tabActive : ''}`}
    onClick={onClick}
  >
    {label}
    <span className={styles.tabCount}>{count}</span>
  </button>
);

const EmptyTab: React.FC<{ icon: string; title: string; text: string }> = ({ icon, title, text }) => (
  <div className={styles.emptyTab}>
    <div className={styles.emptyIcon}>{icon}</div>
    <h3 className={styles.emptyTitle}>{title}</h3>
    <p className={styles.emptyText}>{text}</p>
  </div>
);

// ... (Keep LessonsTab, SessionsTab, MaterialsTab exactly the same as before) ...

const LessonsTab: React.FC<{ lessons: MyLesson[] }> = ({ lessons }) => {
  // ... (Keep as is)
  if (lessons.length === 0) {
    return <EmptyTab icon="📖" title="No lessons yet" text="Lessons and learning links will appear here once your instructor publishes them." />;
  }
  return (
    <div className={styles.list}>
      {lessons.map((lesson, index) => (
        <div key={lesson.id} className={styles.lessonCard}>
          <div className={styles.lessonNumber}>{index + 1}</div>
          <div className={styles.lessonBody}>
            <div className={styles.lessonMeta}>
              <span className={styles.lessonType}>{lesson.content_type}</span>
              {lesson.module_number && <span className={styles.lessonModule}>Module {lesson.module_number}</span>}
            </div>
            <h3 className={styles.lessonTitle}>{lesson.title}</h3>
            {lesson.description && <p className={styles.lessonDescription}>{lesson.description}</p>}
            <div className={styles.lessonActions}>
              {lesson.video_url && <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" className={styles.primaryBtn}>Watch Video →</a>}
              {lesson.pdf_url && <a href={lesson.pdf_url} target="_blank" rel="noopener noreferrer" className={styles.secondaryBtn}>Open PDF →</a>}
              {lesson.external_links?.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className={styles.secondaryBtn}>{link.title} →</a>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const SessionsTab: React.FC<{ sessions: MySession[] }> = ({ sessions }) => {
  // ... (Keep as is)
  if (sessions.length === 0) {
    return <EmptyTab icon="📅" title="No sessions scheduled yet" text="Your live classes will be conducted on Google Meet. Session links will appear here once scheduled." />;
  }
  const now = new Date();
  const upcoming = sessions.filter((s) => new Date(s.session_date) >= now);
  const past = sessions.filter((s) => new Date(s.session_date) < now);

  return (
    <div className={styles.list}>
      {upcoming.length > 0 && (
        <>
          <h3 className={styles.sectionLabel}>Upcoming</h3>
          {upcoming.map((s) => <SessionCard key={s.id} session={s} isUpcoming />)}
        </>
      )}
      {past.length > 0 && (
        <>
          <h3 className={styles.sectionLabel}>Past</h3>
          {past.map((s) => <SessionCard key={s.id} session={s} isUpcoming={false} />)}
        </>
      )}
    </div>
  );
};

const SessionCard: React.FC<{ session: MySession; isUpcoming: boolean }> = ({ session, isUpcoming }) => (
  // ... (Keep as is)
  <div className={styles.sessionCard}>
    <div className={styles.sessionMeta}>
      <span className={`${styles.sessionBadge} ${isUpcoming ? styles.sessionBadgeUpcoming : ''}`}>
        {isUpcoming ? formatRelativeDate(session.session_date) : 'Completed'}
      </span>
      <span className={styles.sessionDate}>{formatSessionDate(session.session_date)} · {formatSessionTime(session.session_date)}</span>
    </div>
    <h3 className={styles.sessionTitle}>{session.title}</h3>
    {session.description && <p className={styles.sessionDescription}>{session.description}</p>}
    <div className={styles.sessionActions}>
      {isUpcoming && session.meeting_url && <a href={session.meeting_url} target="_blank" rel="noopener noreferrer" className={styles.primaryBtn}>Join Google Meet →</a>}
      {!isUpcoming && session.recording_url && <a href={session.recording_url} target="_blank" rel="noopener noreferrer" className={styles.secondaryBtn}>Watch Recording →</a>}
    </div>
  </div>
);

const MaterialsTab: React.FC<{ materials: MyMaterial[] }> = ({ materials }) => {
  // ... (Keep as is)
  if (materials.length === 0) {
    return <EmptyTab icon="📁" title="No materials yet" text="Links, PDFs and resources will appear here once shared by your instructor." />;
  }
  return (
    <div className={styles.materialsGrid}>
      {materials.map((m) => (
        <a key={m.id} href={m.external_url ?? m.file_url ?? '#'} target="_blank" rel="noopener noreferrer" className={styles.materialCard}>
          <div className={styles.materialIcon}>{m.material_type === 'pdf' ? '📄' : m.material_type === 'video' ? '🎬' : '📎'}</div>
          <div className={styles.materialBody}>
            <h3 className={styles.materialTitle}>{m.title}</h3>
            {m.description && <p className={styles.materialDescription}>{m.description}</p>}
          </div>
        </a>
      ))}
    </div>
  );
};

const AssignmentsTab: React.FC<{ 
  assignments: MyAssignment[]; 
  onOpenSubmit: (a: MyAssignment) => void;
}> = ({ assignments, onOpenSubmit }) => {
  if (assignments.length === 0) {
    return <EmptyTab icon="📝" title="No assignments yet" text="Assignments and submission links will appear here when your instructor creates them." />;
  }

  return (
    <div className={styles.list}>
      {assignments.map((a) => (
        <div key={a.id} className={styles.assignmentCard}>
          <div className={styles.assignmentHeader}>
            <span className={`${styles.assignmentBadge} ${a.submission ? styles.badgeSubmitted : a.is_overdue ? styles.badgeOverdue : styles.badgePending}`}>
              {a.submission ? 'Submitted' : a.is_overdue ? 'Overdue' : 'Pending'}
            </span>
            {a.due_date && <span className={styles.assignmentDue}>Due {formatSessionDate(a.due_date)}</span>}
          </div>
          <h3 className={styles.assignmentTitle}>{a.title}</h3>
          {a.description && <p className={styles.assignmentDescription}>{a.description}</p>}
          
          {/* NEW: Display Instructions */}
          {a.instructions && (
            <div className={styles.assignmentInstructions}>
              <strong>Instructions:</strong> {a.instructions}
            </div>
          )}

          <div className={styles.assignmentActions}>
            {a.submission ? (
              <div className={styles.submittedWrapper}>
                <span className={styles.submittedText}>
                  ✅ Submitted on {formatSessionDate(a.submission.submitted_at)}
                </span>
                {a.submission.submission_url && (
                  <a href={a.submission.submission_url} target="_blank" rel="noopener noreferrer" className={styles.viewSubmissionBtn}>
                    View Submission →
                  </a>
                )}
                {a.submission.score !== null && (
                  <span className={styles.submittedScore}>Score: {a.submission.score}</span>
                )}
              </div>
            ) : (
              <button 
                onClick={() => onOpenSubmit(a)}
                className={styles.primaryBtn}
              >
                Submit Assignment →
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};