/* eslint-disable react-hooks/set-state-in-effect */
// ============================================================================
// iQuire — Admin: Cohort Content Manager (Phase 17.11 - Fixed)
// ============================================================================

import React, { useEffect, useState, useCallback } from 'react';
import {
  fetchCoursesForSelect,
  fetchCohortsForCourse,
} from '../../services/students.service';
import {
  fetchSessionsForCohort, deleteSession, upsertSession,
  fetchLessonsForCohort, deleteLesson, upsertLesson,
  fetchMaterialsForCourse, deleteMaterial, upsertMaterial,
  fetchAssignmentsForCohort, deleteAssignment, upsertAssignment,
  type CohortSession, type Lesson, type Material, type Assignment,
} from '../../services/admin/content.service';
import { ContentModal, type ContentType } from '../../components/admin/ContentModal';
import styles from './AdminContentManager.module.css';

// Union type for any row
type ContentRow = CohortSession | Lesson | Material | Assignment;

// ============================================================================
// Component
// ============================================================================

export const AdminContentManager: React.FC = () => {
  // Selectors
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [cohorts, setCohorts] = useState<{ id: string; name: string }[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedCohortId, setSelectedCohortId] = useState('');

  // Tabs
  const [activeTab, setActiveTab] = useState<ContentType>('sessions');

  // Data
  const [sessions, setSessions] = useState<CohortSession[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentRow | null>(null);

  // --------------------------------------------------------------------------
  // Load Content (moved to useCallback so it can be called safely)
  // --------------------------------------------------------------------------
  const loadContent = useCallback(async () => {
    if (!selectedCohortId || !selectedCourseId) return;
    setIsLoading(true);
    
    const [sessRes, lessRes, matRes, assignRes] = await Promise.all([
      fetchSessionsForCohort(selectedCohortId),
      fetchLessonsForCohort(selectedCohortId),
      fetchMaterialsForCourse(selectedCourseId),
      fetchAssignmentsForCohort(selectedCohortId),
    ]);

    if (sessRes.success) setSessions(sessRes.data || []);
    if (lessRes.success) setLessons(lessRes.data || []);
    if (matRes.success) setMaterials(matRes.data || []);
    if (assignRes.success) setAssignments(assignRes.data || []);
    setIsLoading(false);
  }, [selectedCohortId, selectedCourseId]);

  // Load courses on mount
  useEffect(() => {
    fetchCoursesForSelect().then((res) => {
      if (res.success && res.data) setCourses(res.data);
    });
  }, []);

  // Load cohorts when course changes
  useEffect(() => {
    if (!selectedCourseId) return;
    fetchCohortsForCourse(selectedCourseId, { includeAll: true }).then((res) => {
      if (res.success && res.data) {
        setCohorts(res.data);
        setSelectedCohortId(res.data[0]?.id || '');
      }
    });
  }, [selectedCourseId]);

  // Load content when cohort changes
  useEffect(() => {
    loadContent();
  }, [loadContent]);

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------
  const handleOpenModal = (item: ContentRow | null = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSaveItem = async (data: unknown) => {
    let res;
    if (activeTab === 'sessions') res = await upsertSession(data as CohortSession);
    if (activeTab === 'lessons') res = await upsertLesson(data as Lesson);
    if (activeTab === 'materials') res = await upsertMaterial(data as Material);
    if (activeTab === 'assignments') res = await upsertAssignment(data as Assignment);

    if (!res?.success) {
      throw new Error(res?.error || 'Failed to save');
    }
    await loadContent();
  };

  const handleDelete = async (type: ContentType, id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    let res;
    if (type === 'sessions') res = await deleteSession(id);
    if (type === 'lessons') res = await deleteLesson(id);
    if (type === 'materials') res = await deleteMaterial(id);
    if (type === 'assignments') res = await deleteAssignment(id);

    if (res && res.success) loadContent();
    else alert(res?.error || 'Delete failed');
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Cohort Content Manager</h1>
        <p className={styles.pageSubtitle}>
          Manage live classes, lessons, materials, and assignments for each cohort.
        </p>
      </div>

      {/* Selectors */}
      <div className={styles.selectorsRow}>
        <div className={styles.selectGroup}>
          <label>Course</label>
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              setCohorts([]);
              setSelectedCohortId('');
            }}
            className={styles.select}
          >
            <option value="">Select a course...</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div className={styles.selectGroup}>
          <label>Cohort</label>
          <select
            value={selectedCohortId}
            onChange={(e) => setSelectedCohortId(e.target.value)}
            className={styles.select}
            disabled={!selectedCourseId}
          >
            <option value="">Select a cohort...</option>
            {cohorts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedCohortId ? (
        <div className={styles.contentPanel}>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${activeTab === 'sessions' ? styles.tabActive : ''}`} onClick={() => setActiveTab('sessions')}>Live Sessions</button>
            <button className={`${styles.tab} ${activeTab === 'lessons' ? styles.tabActive : ''}`} onClick={() => setActiveTab('lessons')}>Lessons</button>
            <button className={`${styles.tab} ${activeTab === 'materials' ? styles.tabActive : ''}`} onClick={() => setActiveTab('materials')}>Materials</button>
            <button className={`${styles.tab} ${activeTab === 'assignments' ? styles.tabActive : ''}`} onClick={() => setActiveTab('assignments')}>Assignments</button>
          </div>

          <div className={styles.toolbar}>
            <button className={styles.addBtn} onClick={() => handleOpenModal()}>
              + Add New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)}
            </button>
          </div>

          {isLoading ? (
            <div className={styles.loading}>Loading content...</div>
          ) : (
            <div className={styles.list}>
              {activeTab === 'sessions' && sessions.length === 0 && <p className={styles.emptyText}>No live sessions scheduled yet.</p>}
              {activeTab === 'sessions' && sessions.map((s) => (
                <div key={s.id} className={styles.itemRow}>
                  <div>
                    <h3 className={styles.itemTitle}>{s.title}</h3>
                    <p className={styles.itemMeta}>{new Date(s.session_date).toLocaleString()} · {s.meeting_url ? 'Link attached' : 'No link'}</p>
                  </div>
                  <div className={styles.itemActions}>
                    <button className={styles.editBtn} onClick={() => handleOpenModal(s)}>Edit</button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete('sessions', s.id!)}>Delete</button>
                  </div>
                </div>
              ))}

              {activeTab === 'lessons' && lessons.length === 0 && <p className={styles.emptyText}>No lessons uploaded yet.</p>}
              {activeTab === 'lessons' && lessons.map((l) => (
                <div key={l.id} className={styles.itemRow}>
                  <div>
                    <h3 className={styles.itemTitle}>{l.title}</h3>
                    <p className={styles.itemMeta}>Type: {l.content_type} · Order: {l.display_order}</p>
                  </div>
                  <div className={styles.itemActions}>
                    <button className={styles.editBtn} onClick={() => handleOpenModal(l)}>Edit</button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete('lessons', l.id!)}>Delete</button>
                  </div>
                </div>
              ))}

              {activeTab === 'materials' && materials.length === 0 && <p className={styles.emptyText}>No additional materials yet.</p>}
              {activeTab === 'materials' && materials.map((m) => (
                <div key={m.id} className={styles.itemRow}>
                  <div>
                    <h3 className={styles.itemTitle}>{m.title}</h3>
                    <p className={styles.itemMeta}>Type: {m.material_type} · {m.file_url || m.external_url}</p>
                  </div>
                  <div className={styles.itemActions}>
                    <button className={styles.editBtn} onClick={() => handleOpenModal(m)}>Edit</button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete('materials', m.id!)}>Delete</button>
                  </div>
                </div>
              ))}

              {activeTab === 'assignments' && assignments.length === 0 && <p className={styles.emptyText}>No assignments created yet.</p>}
              {activeTab === 'assignments' && assignments.map((a) => (
                <div key={a.id} className={styles.itemRow}>
                  <div>
                    <h3 className={styles.itemTitle}>{a.title}</h3>
                    <p className={styles.itemMeta}>Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'No deadline'}</p>
                  </div>
                  <div className={styles.itemActions}>
                    <button className={styles.editBtn} onClick={() => handleOpenModal(a)}>Edit</button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete('assignments', a.id!)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📁</div>
          <h3>Select a Course and Cohort</h3>
          <p>Choose a course and cohort above to manage its content.</p>
        </div>
      )}

      {isModalOpen && (
        <ContentModal
          type={activeTab}
          cohortId={selectedCohortId}
          courseId={selectedCourseId}
          editingItem={editingItem}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveItem}
        />
      )}
    </div>
  );
};