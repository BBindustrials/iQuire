import React, { useEffect, useState } from 'react';
import { fetchResources, upsertResource, deleteResource } from '../../services/admin/resources.service';
import { ContentModal } from '../../components/admin/ContentModal';
import styles from './AdminContentManager.module.css';

export const AdminResources: React.FC = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const load = async () => {
    setIsLoading(true);
    const res = await fetchResources();
    if (res.success) setResources(res.data || []);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this resource?')) return;
    const res = await deleteResource(id);
    if (res.success) load();
    else alert(res.error);
  };

  const handleSave = async (data: any) => {
    const res = await upsertResource(data);
    if (!res.success) throw new Error(res.error);
    await load();
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Career Resources</h1>
        <p className={styles.pageSubtitle}>Manage resources shown to students.</p>
      </div>

      <div className={styles.contentPanel}>
        <div className={styles.toolbar}>
          <button className={styles.addBtn} onClick={() => { setEditingItem(null); setIsModalOpen(true); }}>
            + Add New Resource
          </button>
        </div>

        {isLoading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <div className={styles.list}>
            {resources.length === 0 && <p className={styles.emptyText}>No resources created yet.</p>}
            {resources.map((r) => (
              <div key={r.id} className={styles.itemRow}>
                <div>
                  <h3 className={styles.itemTitle}>{r.icon} {r.title}</h3>
                  <p className={styles.itemMeta}>{r.type} · {r.category} · {r.published ? 'Published' : 'Draft'}</p>
                </div>
                <div className={styles.itemActions}>
                  <button className={styles.editBtn} onClick={() => { setEditingItem(r); setIsModalOpen(true); }}>Edit</button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(r.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <ContentModal
          type="resources"
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