// ============================================================================
// iQuire — Recruiter Layout (Phase 12C.4)
// ============================================================================

import React, { useState } from 'react';
import { RecruiterSidebar } from './RecruiterSidebar';
import { RecruiterHeader } from './RecruiterHeader';
import styles from './RecruiterLayout.module.css';

interface RecruiterLayoutProps {
  children: React.ReactNode;
}

export const RecruiterLayout: React.FC<RecruiterLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <RecruiterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className={styles.main}>
        <RecruiterHeader onMenuToggle={() => setSidebarOpen((v) => !v)} />
        <main className={styles.content}>
          <div className={styles.contentInner}>{children}</div>
        </main>
      </div>
    </div>
  );
};