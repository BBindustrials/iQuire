import React, { useEffect, useState } from 'react';
import { fetchOpportunities, upsertOpportunity, deleteOpportunity } from '../../services/admin/opportunities.service';
import { ContentModal } from '../../components/admin/ContentModal';
import styles from './AdminContentManager.module.css';

export const AdminOpportunities: React.FC = () => {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const load = async () => {
    setIsLoading(true);
    const res = await fetchOpportunities();
    if (res.success) setOpportunities(res.data || []);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this opportunity?')) return;
    const res = await deleteOpportunity(id);
    if (res.success) load();
    else alert(res.error);
  };

  const handleSave = async (data: any) => {
    const res = await upsertOpportunity(data);
    if (!res.success) throw new Error(res.error);
    await load();
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Opportunities</h1>
        <p className={styles.pageSubtitle}>Manage jobs, internships, and gigs for students.</p>
      </div>

      <div className={styles.contentPanel}>
        <div className={styles.toolbar}>
          <button className={styles.addBtn} onClick={() => { setEditingItem(null); setIsModalOpen(true); }}>
            + Post Opportunity
          </button>
        </div>

        {isLoading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <div className={styles.list}>
            {opportunities.length === 0 && <p className={styles.emptyText}>No opportunities posted yet.</p>}
            {opportunities.map((o) => (
              <div key={o.id} className={styles.itemRow}>
                <div>
                  <h3 className={styles.itemTitle}>{o.title} at {o.company}</h3>
                  <p className={styles.itemMeta}>{o.type} · {o.location} · {o.published ? 'Published' : 'Draft'}</p>
                </div>
                <div className={styles.itemActions}>
                  <button className={styles.editBtn} onClick={() => { setEditingItem(o); setIsModalOpen(true); }}>Edit</button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(o.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <ContentModal
          type="opportunities"
          cohortId=""
          courseId=""
          editingItem={editingItem}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};