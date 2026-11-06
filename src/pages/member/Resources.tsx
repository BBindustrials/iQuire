// ============================================================================
// iQuire — Member: Career Resources (Phase 17.10)
// ============================================================================

import React, { useState } from 'react';
import styles from './Resources.module.css';

// ============================================================================
// Data
// ============================================================================

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'template' | 'guide' | 'video' | 'external';
  icon: string;
  url?: string;
  category: string;
}

const RESOURCES: Resource[] = [
  // --- CV & Applications ---
  {
    id: 'cv-template',
    title: 'Professional CV Template',
    description: 'A clean, ATS-friendly CV template used by successful iQuire graduates.',
    type: 'template',
    icon: '📄',
    category: 'CV & Applications',
    url: 'https://docs.google.com/document/d/1example',
  },
  {
    id: 'cover-letter-guide',
    title: 'Cover Letter Guide',
    description: 'Step-by-step guide to writing a compelling cover letter for entry-level roles.',
    type: 'guide',
    icon: '✍️',
    category: 'CV & Applications',
  },
  {
    id: 'linkedin-checklist',
    title: 'LinkedIn Optimization Checklist',
    description: 'A 15-point checklist to make your LinkedIn profile recruiter-ready.',
    type: 'template',
    icon: '💼',
    category: 'CV & Applications',
  },
  {
    id: 'application-tracker',
    title: 'Job Application Tracker',
    description: 'A spreadsheet template to track applications, deadlines, and follow-ups.',
    type: 'template',
    icon: '📊',
    category: 'CV & Applications',
    url: 'https://docs.google.com/spreadsheets/d/1example',
  },

  // --- Interview Preparation ---
  {
    id: 'interview-guide',
    title: 'The iQuire Interview Guide',
    description: '50 common interview questions and how to answer them with confidence.',
    type: 'guide',
    icon: '🎤',
    category: 'Interview Preparation',
  },
  {
    id: 'star-method',
    title: 'STAR Method Worksheet',
    description: 'Learn and practice the STAR technique for behavioral interview questions.',
    type: 'template',
    icon: '⭐',
    category: 'Interview Preparation',
  },
  {
    id: 'mock-interview',
    title: 'Mock Interview Simulator',
    description: 'Practice with the AI Career Counselor using real interview scenarios.',
    type: 'video',
    icon: '🤖',
    category: 'Interview Preparation',
  },

  // --- Career Exploration ---
  {
    id: 'career-paths',
    title: 'Tech Career Paths Explained',
    description: 'A breakdown of Product, Design, Data, Engineering, Marketing, and more.',
    type: 'guide',
    icon: '🗺️',
    category: 'Career Exploration',
  },
  {
    id: 'salary-guide',
    title: 'Entry-Level Salary Guide',
    description: 'What to expect in your first role across different tech disciplines.',
    type: 'guide',
    icon: '💰',
    category: 'Career Exploration',
  },
  {
    id: 'networking-guide',
    title: 'How to Network Without Feeling Awkward',
    description: 'Practical strategies for building professional relationships online and offline.',
    type: 'guide',
    icon: '🤝',
    category: 'Career Exploration',
  },

  // --- Digital Skills ---
  {
    id: 'google-workspace',
    title: 'Google Workspace Essentials',
    description: 'A crash course in Docs, Sheets, Slides, and Drive for workplace productivity.',
    type: 'video',
    icon: '📁',
    category: 'Digital Skills',
  },
  {
    id: 'ai-tools-guide',
    title: 'AI Tools for Productivity',
    description: 'How to use ChatGPT, Claude, and Canva AI to work smarter.',
    type: 'guide',
    icon: '🤖',
    category: 'Digital Skills',
  },
  {
    id: 'excel-tips',
    title: 'Excel Tips for Beginners',
    description: 'Formulas, pivot tables, and shortcuts every entry-level candidate should know.',
    type: 'video',
    icon: '📊',
    category: 'Digital Skills',
  },

  // --- External Opportunities ---
  {
    id: 'job-boards',
    title: 'Best Job Boards for Entry-Level Roles',
    description: 'Curated list of where to find internships, apprenticeships, and graduate roles.',
    type: 'external',
    icon: '🔗',
    category: 'External Opportunities',
    url: 'https://example.com/job-boards',
  },
  {
    id: 'remote-platforms',
    title: 'Remote Work Platforms',
    description: 'Where to find remote entry-level roles and freelance opportunities.',
    type: 'external',
    icon: '🌍',
    category: 'External Opportunities',
    url: 'https://example.com/remote',
  },
  {
    id: 'scholarships',
    title: 'Scholarships & Financial Support',
    description: 'Funding opportunities for certifications, bootcamps, and further education.',
    type: 'external',
    icon: '🎓',
    category: 'External Opportunities',
  },
];

const CATEGORIES = [
  'All Resources',
  'CV & Applications',
  'Interview Preparation',
  'Career Exploration',
  'Digital Skills',
  'External Opportunities',
];

// ============================================================================
// Component
// ============================================================================

export const MemberResources: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All Resources');
  const [search, setSearch] = useState('');

  const filtered = RESOURCES.filter((r) => {
    const matchesCategory =
      activeCategory === 'All Resources' || r.category === activeCategory;
    const matchesSearch =
      search.trim().length === 0 ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Career Resources</h1>
          <p className={styles.pageSubtitle}>
            Templates, guides, and tools to help you land your next opportunity.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersRow}>
        <div className={styles.tabs}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`${styles.tab} ${
                activeCategory === cat ? styles.tabActive : ''
              }`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className={styles.searchBox}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path
              d="M21 21L16.65 16.65"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            placeholder="Search resources…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔍</div>
          <h3 className={styles.emptyTitle}>No resources match your search</h3>
          <p className={styles.emptyText}>
            Try a different search term or explore another category.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Sub-components
// ============================================================================

const ResourceCard: React.FC<{ resource: Resource }> = ({ resource }) => {
  const typeLabel = {
    template: 'Template',
    guide: 'Guide',
    video: 'Video',
    external: 'External Link',
  }[resource.type];

  const typeClass = {
    template: styles.typeTemplate,
    guide: styles.typeGuide,
    video: styles.typeVideo,
    external: styles.typeExternal,
  }[resource.type];

  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.cardIcon}>{resource.icon}</div>
        <span className={`${styles.typeBadge} ${typeClass}`}>
          {typeLabel}
        </span>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{resource.title}</h3>
        <p className={styles.cardDesc}>{resource.description}</p>
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.cardCategory}>{resource.category}</span>
        {resource.url ? (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.accessBtn}
          >
            Access →
          </a>
        ) : (
          <span className={styles.comingSoon}>Coming soon</span>
        )}
      </div>
    </article>
  );
};