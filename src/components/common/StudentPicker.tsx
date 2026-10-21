// ============================================================================
// iQuire — Student Picker (Phase 15.4)
// ============================================================================
// Search-as-you-type picker for selecting an existing student profile.
// Reusable across admin forms.
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import {
  searchUsers,
  type UserSearchResult,
} from '../../services/users.service';
import { getInitials } from '../../services/enrollments.service';
import styles from './StudentPicker.module.css';

// ============================================================================
// Types
// ============================================================================

interface StudentPickerProps {
  selectedUserId: string | null;
  onChange: (user: UserSearchResult | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

// ============================================================================
// Component
// ============================================================================

export const StudentPicker: React.FC<StudentPickerProps> = ({
  selectedUserId,
  onChange,
  disabled = false,
  placeholder = 'Search students by name, email, or IQuire ID…',
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(
    null
  );

  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);

  // --------------------------------------------------------------------------
  // Resolve selected user when userId changes externally
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!selectedUserId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedUser(null);
      return;
    }

    let isMounted = true;

    (async () => {
      const res = await searchUsers('', 50);
      if (!isMounted) return;
      if (res.success && res.data) {
        const match = res.data.find((u) => u.id === selectedUserId);
        if (match) setSelectedUser(match);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [selectedUserId]);

  // --------------------------------------------------------------------------
  // Debounced search
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    if (!isDropdownOpen || selectedUserId) return;

    debounceRef.current = window.setTimeout(async () => {
      setIsSearching(true);
      const res = await searchUsers(searchQuery, 10);
      setIsSearching(false);

      if (res.success && res.data) {
        // Filter out recruiters/admins — enrollment is for students only
        const studentsOnly = res.data.filter(
          (u) => u.account_type === 'member'
        );
        setResults(studentsOnly);
      } else {
        setResults([]);
      }
    }, 250);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [searchQuery, isDropdownOpen, selectedUserId]);

  // --------------------------------------------------------------------------
  // Close on outside click
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
  const openDropdown = () => {
    if (disabled || selectedUserId) return;
    setIsDropdownOpen(true);
  };

  const handleSelect = (user: UserSearchResult) => {
    setSelectedUser(user);
    onChange(user);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const handleClear = () => {
    setSelectedUser(null);
    onChange(null);
    setSearchQuery('');
  };

  // --------------------------------------------------------------------------
  // Render — selected chip
  // --------------------------------------------------------------------------
  if (selectedUser) {
    const fullName = `${selectedUser.first_name} ${selectedUser.last_name}`.trim();
    const initials = getInitials(fullName);

    return (
      <div className={styles.selectedCard}>
        <div className={styles.selectedAvatar}>
          {selectedUser.avatar_url ? (
            <img src={selectedUser.avatar_url} alt={fullName} />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        <div className={styles.selectedInfo}>
          <div className={styles.selectedNameRow}>
            <span className={styles.selectedName}>{fullName}</span>
            {selectedUser.iq_id && (
              <span className={styles.iqIdChip}>{selectedUser.iq_id}</span>
            )}
          </div>
          <span className={styles.selectedEmail}>{selectedUser.email}</span>
        </div>

        <button
          type="button"
          className={styles.clearBtn}
          onClick={handleClear}
          disabled={disabled}
        >
          Change
        </button>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Render — search trigger + dropdown
  // --------------------------------------------------------------------------
  return (
    <div className={styles.wrapper} ref={dropdownRef}>
      <button
        type="button"
        className={styles.searchTrigger}
        onClick={openDropdown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isDropdownOpen}
      >
        <span className={styles.searchIcon}>🔍</span>
        <span className={styles.searchText}>{placeholder}</span>
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
              placeholder="Type a name, email, or IQ ID…"
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
                <span>
                  {searchQuery.trim()
                    ? 'No matching students found'
                    : 'Start typing to search students'}
                </span>
              </div>
            ) : (
              results.map((user) => {
                const name = `${user.first_name} ${user.last_name}`.trim();
                const initials = getInitials(name);

                return (
                  <button
                    key={user.id}
                    type="button"
                    className={styles.resultItem}
                    onClick={() => handleSelect(user)}
                    role="option"
                    aria-selected="false"
                  >
                    <div className={styles.resultAvatar}>
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={name} />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <div className={styles.resultInfo}>
                      <div className={styles.resultNameRow}>
                        <span className={styles.resultName}>{name}</span>
                        {user.iq_id && (
                          <span className={styles.resultIqId}>
                            {user.iq_id}
                          </span>
                        )}
                      </div>
                      <span className={styles.resultEmail}>{user.email}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};