// ============================================================================
// iQuire — Author Linker (Phase 14.13.4)
// ============================================================================
// Search-and-select a user profile to link as a blog post author.
// Falls back to manual entry (name, role, avatar URL) when no user is linked.
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import {
  searchUsers,
  fetchUserById,
  type UserSearchResult,
} from '../../services/users.service';
import { Input } from './Input';
import styles from './AuthorLinker.module.css';

// ============================================================================
// Types
// ============================================================================

export interface AuthorLinkerValue {
  author_profile_id: string | null;
  author_name: string;
  author_role: string;
  author_avatar_url: string;
}

interface AuthorLinkerProps {
  value: AuthorLinkerValue;
  onChange: (next: AuthorLinkerValue) => void;
}

// ============================================================================
// Component
// ============================================================================

export const AuthorLinker: React.FC<AuthorLinkerProps> = ({
  value,
  onChange,
}) => {
  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [linkedUser, setLinkedUser] = useState<UserSearchResult | null>(null);
  const [isResolvingUser, setIsResolvingUser] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);

  // --------------------------------------------------------------------------
  // If value.author_profile_id is set, fetch the user (once)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const profileId = value.author_profile_id;
  
    // No profile linked — nothing to fetch. We intentionally do NOT call
    // setState here; `linkedUser` is reset when the user clicks "Change".
    if (!profileId) {
      return;
    }
  
    let isMounted = true;
  
    (async () => {
      setIsResolvingUser(true);
      const res = await fetchUserById(profileId);
      if (!isMounted) return;
  
      if (res.success && res.data) {
        setLinkedUser(res.data);
      }
      setIsResolvingUser(false);
    })();
  
    return () => {
      isMounted = false;
    };
  }, [value.author_profile_id]);

  // --------------------------------------------------------------------------
  // Debounced search
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    // Only search when dropdown is open and not linked
    if (!isDropdownOpen || value.author_profile_id) return;

    debounceRef.current = window.setTimeout(async () => {
      setIsSearching(true);
      const res = await searchUsers(searchQuery, 8);
      setIsSearching(false);

      if (res.success && res.data) {
        setResults(res.data);
      } else {
        setResults([]);
      }
    }, 250);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [searchQuery, isDropdownOpen, value.author_profile_id]);

  // --------------------------------------------------------------------------
  // Close dropdown on outside click
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isDropdownOpen]);

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------
  const handleOpenDropdown = () => {
    if (value.author_profile_id) return; // already linked — no picker
    setIsDropdownOpen(true);
  };

  const handleSelectUser = (user: UserSearchResult) => {
    const fullName = `${user.first_name} ${user.last_name}`.trim();

    onChange({
      author_profile_id: user.id,
      // Keep fallbacks synced in case we ever want the "freeze at time of writing" behavior
      author_name: fullName,
      author_role: user.bio_title ?? '',
      author_avatar_url: user.avatar_url ?? '',
    });

    setLinkedUser(user);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const handleUnlink = () => {
    onChange({
      author_profile_id: null,
      // Keep the previously-resolved name/role as a starting point for manual entry
      author_name: linkedUser
        ? `${linkedUser.first_name} ${linkedUser.last_name}`.trim()
        : value.author_name,
      author_role: linkedUser?.bio_title ?? value.author_role,
      author_avatar_url: linkedUser?.avatar_url ?? value.author_avatar_url,
    });
    setLinkedUser(null);
  };

  const handleManualChange = (
    field: 'author_name' | 'author_role' | 'author_avatar_url'
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      [field]: e.target.value,
    });
  };

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------
  const getInitials = (user: UserSearchResult): string => {
    return `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase();
  };

  const accountTypeLabel = (user: UserSearchResult): string => {
    if (user.account_type === 'admin') return 'Admin';
    if (user.account_type === 'recruiter') return 'Recruiter';
    // Member: profiles.role doesn't distinguish student vs alumni —
    // alumni status lives in user_roles. For the picker we just say "Member".
    return 'Member';
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.wrapper}>
      {/* ================================================================
          LINKED STATE
          ================================================================ */}
      {value.author_profile_id && linkedUser && (
        <div className={styles.linkedCard}>
          <div className={styles.linkedAvatar}>
            {linkedUser.avatar_url ? (
              <img src={linkedUser.avatar_url} alt={linkedUser.first_name} />
            ) : (
              <span>{getInitials(linkedUser)}</span>
            )}
          </div>

          <div className={styles.linkedInfo}>
            <div className={styles.linkedNameRow}>
              <span className={styles.linkedName}>
                {linkedUser.first_name} {linkedUser.last_name}
              </span>
              <span className={styles.linkedBadge}>
                {accountTypeLabel(linkedUser)}
              </span>
            </div>
            <span className={styles.linkedEmail}>{linkedUser.email}</span>
            {linkedUser.bio_title && (
              <span className={styles.linkedTitle}>{linkedUser.bio_title}</span>
            )}
          </div>

          <button
            type="button"
            className={styles.unlinkBtn}
            onClick={handleUnlink}
            title="Unlink this author"
          >
            Change
          </button>
        </div>
      )}

      {value.author_profile_id && isResolvingUser && !linkedUser && (
        <div className={styles.resolving}>
          <div className={styles.spinner} />
          <span>Loading linked author…</span>
        </div>
      )}

      {/* ================================================================
          SEARCH / PICKER STATE
          ================================================================ */}
      {!value.author_profile_id && (
        <>
          <div className={styles.searchWrapper} ref={dropdownRef}>
            <button
              type="button"
              className={styles.searchTrigger}
              onClick={handleOpenDropdown}
              aria-haspopup="listbox"
              aria-expanded={isDropdownOpen}
            >
              <span className={styles.searchIcon}>🔍</span>
              <span className={styles.searchText}>
                Link to an IQuire profile…
              </span>
              <span className={styles.searchChevron}>
                {isDropdownOpen ? '▲' : '▼'}
              </span>
            </button>

            {isDropdownOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email…"
                    className={styles.searchInput}
                    autoFocus
                  />
                </div>

                <div className={styles.dropdownList} role="listbox">
                  {isSearching ? (
                    <div className={styles.dropdownState}>
                      <div className={styles.spinnerSmall} />
                      <span>Searching…</span>
                    </div>
                  ) : results.length === 0 ? (
                    <div className={styles.dropdownState}>
                      <span>No users found</span>
                    </div>
                  ) : (
                    results.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        className={styles.resultItem}
                        onClick={() => handleSelectUser(user)}
                        role="option"
                        aria-selected="false"
                      >
                        <div className={styles.resultAvatar}>
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.first_name}
                            />
                          ) : (
                            <span>{getInitials(user)}</span>
                          )}
                        </div>
                        <div className={styles.resultInfo}>
                          <div className={styles.resultNameRow}>
                            <span className={styles.resultName}>
                              {user.first_name} {user.last_name}
                            </span>
                            <span className={styles.resultBadge}>
                              {accountTypeLabel(user)}
                            </span>
                          </div>
                          <span className={styles.resultEmail}>
                            {user.email}
                          </span>
                          {user.bio_title && (
                            <span className={styles.resultTitle}>
                              {user.bio_title}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ==============================================================
              MANUAL FALLBACK
              ============================================================== */}
          <div className={styles.manualSection}>
            <div className={styles.manualDivider}>
              <span>OR enter manually</span>
            </div>

            <Input
              label="Author name"
              name="author_name"
              value={value.author_name}
              onChange={handleManualChange('author_name')}
              placeholder="e.g., Angel Oparajohnson"
            />

            <Input
              label="Role / Title"
              name="author_role"
              value={value.author_role}
              onChange={handleManualChange('author_role')}
              placeholder="e.g., Founder, IQuire"
            />

            <Input
              label="Avatar URL"
              name="author_avatar_url"
              value={value.author_avatar_url}
              onChange={handleManualChange('author_avatar_url')}
              placeholder="https://…"
              helperText="Optional. Leave blank to fall back to initials."
            />
          </div>
        </>
      )}
    </div>
  );
};