// ============================================================================
// iQuire — Public Alumni Directory (Phase 9B.2)
// ============================================================================
// Full listing page with search, filter, and pagination-ready grid.
// ============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '../../components/common/ScrollReveal';
import {
  fetchPublishedAlumni,
  type Alumni as AlumniType,
} from '../../services/alumni.service';
import styles from './Alumni.module.css';

// ============================================================================
// Component
// ============================================================================

export const Alumni: React.FC = () => {
  const [alumni, setAlumni] = useState<AlumniType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [programmeFilter, setProgrammeFilter] = useState<string>('all');
  const [expertiseFilter, setExpertiseFilter] = useState<string>('all');

  // --------------------------------------------------------------------------
  // Load alumni
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      const result = await fetchPublishedAlumni();
      if (!isMounted) return;

      if (!result.success) {
        setError(result.error ?? 'Failed to load alumni');
        setAlumni([]);
        setIsLoading(false);
        return;
      }

      setAlumni(result.data ?? []);
      setIsLoading(false);
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  // --------------------------------------------------------------------------
  // Extract unique programmes and areas of expertise for filter dropdowns
  // --------------------------------------------------------------------------
  const programmeOptions = useMemo(() => {
    const set = new Set<string>();
    alumni.forEach((a) => {
      if (a.programme) set.add(a.programme);
    });
    return Array.from(set).sort();
  }, [alumni]);

  const expertiseOptions = useMemo(() => {
    const set = new Set<string>();
    alumni.forEach((a) => {
      (a.areas_of_expertise ?? []).forEach((e) => set.add(e));
    });
    return Array.from(set).sort();
  }, [alumni]);

  // --------------------------------------------------------------------------
  // Filter
  // --------------------------------------------------------------------------
  const filtered = useMemo(() => {
    let list = [...alumni];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.full_name.toLowerCase().includes(q) ||
          a.professional_title.toLowerCase().includes(q) ||
          a.short_summary.toLowerCase().includes(q) ||
          a.programme?.toLowerCase().includes(q) ||
          (a.key_skills ?? []).some((s) => s.toLowerCase().includes(q))
      );
    }

    if (programmeFilter !== 'all') {
      list = list.filter((a) => a.programme === programmeFilter);
    }

    if (expertiseFilter !== 'all') {
      list = list.filter((a) =>
        (a.areas_of_expertise ?? []).includes(expertiseFilter)
      );
    }

    return list;
  }, [alumni, search, programmeFilter, expertiseFilter]);

  const hasActiveFilters =
    search.trim() !== '' ||
    programmeFilter !== 'all' ||
    expertiseFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setProgrammeFilter('all');
    setExpertiseFilter('all');
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.alumniPage}>
      {/* ================================================================
          HERO
          ================================================================ */}
      <section className={styles.hero}>
        <div className={styles.heroBgBlobOne} aria-hidden="true" />
        <div className={styles.heroBgBlobTwo} aria-hidden="true" />

        <div className="container">
          <ScrollReveal animation="up" className={styles.heroContent}>
            <span className={styles.badge}>Alumni Directory</span>
            <h1 className={styles.heroTitle}>
              Meet our{' '}
              <span className={styles.highlight}>alumni.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Explore the professionals who've grown through IQuire programmes.
              Filter by programme or area of expertise to find the right
              candidate for your team — or the right mentor for your journey.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ================================================================
          SEARCH + FILTERS
          ================================================================ */}
      <section className={styles.filterSection}>
        <div className="container">
          <ScrollReveal animation="up" className={styles.filterBar}>
            {/* Search */}
            <div className={styles.searchBox}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
                placeholder="Search alumni by name, title, skill…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Programme filter */}
            <select
              className={styles.filterSelect}
              value={programmeFilter}
              onChange={(e) => setProgrammeFilter(e.target.value)}
              aria-label="Filter by programme"
            >
              <option value="all">All programmes</option>
              {programmeOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            {/* Expertise filter */}
            <select
              className={styles.filterSelect}
              value={expertiseFilter}
              onChange={(e) => setExpertiseFilter(e.target.value)}
              aria-label="Filter by expertise"
            >
              <option value="all">All expertise</option>
              {expertiseOptions.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>

            {/* Clear */}
            {hasActiveFilters && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}
          </ScrollReveal>

          {/* Result count */}
          {!isLoading && !error && (
            <p className={styles.resultCount}>
              {filtered.length}{' '}
              {filtered.length === 1 ? 'alumnus' : 'alumni'}
              {hasActiveFilters && ' matched'}
            </p>
          )}
        </div>
      </section>

      {/* ================================================================
          GRID
          ================================================================ */}
      <section className={styles.gridSection}>
        <div className="container">
          {isLoading ? (
            <div className={styles.grid}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.skeletonCard} />
              ))}
            </div>
          ) : error ? (
            <div className={styles.errorBox}>
              <div className={styles.errorIcon}>⚠️</div>
              <h3 className={styles.errorTitle}>Something went wrong</h3>
              <p className={styles.errorText}>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              hasAlumni={alumni.length > 0}
              onClear={clearFilters}
            />
          ) : (
            <ScrollReveal
              animation="up"
              stagger
              className={styles.grid}
            >
              {filtered.map((a) => (
                <AlumniCard key={a.id} alumni={a} />
              ))}
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* ================================================================
          CTA — Hire / Recruit
          ================================================================ */}
      <section className={styles.ctaSection}>
        <div className="container">
          <ScrollReveal animation="up" className={styles.ctaCard}>
            <div className={styles.ctaIcon}>💼</div>
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>
                Looking to hire IQuire-trained talent?
              </h2>
              <p className={styles.ctaText}>
                Register as a recruiter to access the full IQuire talent
                directory — filter by skills, location, and availability.
              </p>
            </div>
            <Link to="/hire-from-us" className={styles.ctaButton}>
              Hire From Us →
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// Sub-components
// ============================================================================

interface AlumniCardProps {
  alumni: AlumniType;
}

const AlumniCard: React.FC<AlumniCardProps> = ({ alumni }) => {
  const initials = alumni.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Show up to 3 expertise tags
  const topExpertise = (alumni.areas_of_expertise ?? []).slice(0, 3);

  return (
    <article className={styles.card}>
      {/* Photo */}
      <div className={styles.cardPhoto}>
        {alumni.photo_url ? (
          <img src={alumni.photo_url} alt={alumni.full_name} loading="lazy" />
        ) : (
          <div className={styles.cardPhotoPlaceholder}>{initials}</div>
        )}

        {alumni.programme && (
          <span className={styles.programmeBadge}>{alumni.programme}</span>
        )}
      </div>

      {/* Body */}
      <div className={styles.cardBody}>
        <h3 className={styles.cardName}>{alumni.full_name}</h3>
        <p className={styles.cardTitle}>{alumni.professional_title}</p>

        {(alumni.programme || alumni.cohort) && (
          <p className={styles.cardCohort}>
            {[alumni.programme, alumni.cohort].filter(Boolean).join(' · ')}
          </p>
        )}

        <p className={styles.cardSummary}>{alumni.short_summary}</p>

        {topExpertise.length > 0 && (
          <div className={styles.cardExpertise}>
            {topExpertise.map((e) => (
              <span key={e} className={styles.expertiseTag}>
                {e}
              </span>
            ))}
            {(alumni.areas_of_expertise ?? []).length > 3 && (
              <span className={styles.expertiseMore}>
                +{(alumni.areas_of_expertise ?? []).length - 3}
              </span>
            )}
          </div>
        )}

        <Link to={`/alumni/${alumni.id}`} className={styles.cardLink}>
          View Profile
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12H19M19 12L12 5M19 12L12 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </article>
  );
};

interface EmptyStateProps {
  hasAlumni: boolean;
  onClear: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ hasAlumni, onClear }) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>{hasAlumni ? '🔍' : '👥'}</div>
    <h3 className={styles.emptyTitle}>
      {hasAlumni ? 'No alumni match your filters' : 'No alumni yet'}
    </h3>
    <p className={styles.emptyText}>
      {hasAlumni
        ? 'Try adjusting your search or clearing the filters.'
        : 'Alumni profiles will appear here as our community grows.'}
    </p>
    {hasAlumni && (
      <button
        type="button"
        className={styles.emptyCta}
        onClick={onClear}
      >
        Clear filters
      </button>
    )}
  </div>
);