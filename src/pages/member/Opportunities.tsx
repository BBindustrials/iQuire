import React, { useEffect, useState, useMemo } from 'react';
import { fetchOpportunities } from '../../services/admin/opportunities.service';
import styles from './Opportunities.module.css';

export const MemberOpportunities: React.FC = () => {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOpportunities().then((res) => {
      if (res.success) setOpportunities(res.data || []);
      setIsLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let list = [...opportunities];
    if (activeType !== 'all') {
      list = list.filter((o) => o.type === activeType);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.company.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [opportunities, activeType, search]);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Opportunities</h1>
          <p className={styles.pageSubtitle}>Discover jobs, internships, and gigs matched to you.</p>
        </div>
      </div>

      <div className={styles.filtersRow}>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${activeType === 'all' ? styles.tabActive : ''}`} onClick={() => setActiveType('all')}>All</button>
          <button className={`${styles.tab} ${activeType === 'job' ? styles.tabActive : ''}`} onClick={() => setActiveType('job')}>Jobs</button>
          <button className={`${styles.tab} ${activeType === 'internship' ? styles.tabActive : ''}`} onClick={() => setActiveType('internship')}>Internships</button>
          <button className={`${styles.tab} ${activeType === 'freelance' ? styles.tabActive : ''}`} onClick={() => setActiveType('freelance')}>Freelance</button>
        </div>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search opportunities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loadingState}>Loading opportunities...</div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔍</div>
          <h3 className={styles.emptyTitle}>No opportunities found</h3>
          <p className={styles.emptyText}>Try a different search or category.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((o) => (
            <OpportunityCard key={o.id} opportunity={o} />
          ))}
        </div>
      )}
    </div>
  );
};

const OpportunityCard: React.FC<{ opportunity: any }> = ({ opportunity }) => {
  const typeColors: any = {
    job: styles.badgeJob,
    internship: styles.badgeInternship,
    freelance: styles.badgeFreelance,
    apprenticeship: styles.badgeApprenticeship,
    volunteer: styles.badgeVolunteer,
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={`${styles.typeBadge} ${typeColors[opportunity.type] || ''}`}>
          {opportunity.type}
        </span>
        {opportunity.experience_level && (
          <span className={styles.expBadge}>{opportunity.experience_level}</span>
        )}
      </div>
      <h3 className={styles.cardTitle}>{opportunity.title}</h3>
      <p className={styles.cardCompany}>{opportunity.company}</p>
      <p className={styles.cardDesc}>{opportunity.description.slice(0, 120)}...</p>
      
      <div className={styles.cardMeta}>
        <span>📍 {opportunity.location}</span>
        {opportunity.salary_range && <span>💰 {opportunity.salary_range}</span>}
      </div>
      
      {opportunity.skills_required && opportunity.skills_required.length > 0 && (
        <div className={styles.skillsList}>
          {opportunity.skills_required.slice(0, 3).map((skill: string, i: number) => (
            <span key={i} className={styles.skillTag}>{skill}</span>
          ))}
          {opportunity.skills_required.length > 3 && <span className={styles.skillTag}>+{opportunity.skills_required.length - 3}</span>}
        </div>
      )}

      <a href={opportunity.apply_url} target="_blank" rel="noopener noreferrer" className={styles.applyBtn}>
        Apply Now →
      </a>
    </div>
  );
};