// ============================================================================
// iQuire — Member Layout (Phase 17.2 - Verified)
// ============================================================================

import React, { useEffect, useState } from 'react';
import { MemberSidebar } from './MemberSidebar';
import { MemberHeader } from './MemberHeader';
import styles from './MemberLayout.module.css';

interface MemberLayoutProps {
  children: React.ReactNode;
}

export const MemberLayout: React.FC<MemberLayoutProps> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('member_sidebar_collapsed') === 'true';
  });

  // Persist collapse state
  useEffect(() => {
    localStorage.setItem('member_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const handleCollapseToggle = () => {
    console.log('Collapse toggle clicked. Current:', isCollapsed);
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div className={`${styles.layout} ${isCollapsed ? styles.layoutCollapsed : ''}`}>
      <MemberSidebar
        isOpen={isMobileOpen}
        isCollapsed={isCollapsed}
        onClose={() => setIsMobileOpen(false)}
        onCollapseToggle={handleCollapseToggle}
      />
      <div className={styles.main}>
        <MemberHeader onMenuToggle={() => setIsMobileOpen((v) => !v)} />
        <main className={styles.content}>
          <div className={styles.contentInner}>{children}</div>
        </main>
      </div>
    </div>
  );
};