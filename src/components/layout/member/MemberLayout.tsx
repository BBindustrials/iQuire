import React, { useState } from 'react';
import { MemberSidebar } from './MemberSidebar';
import { MemberHeader } from './MemberHeader';
import styles from './MemberLayout.module.css';

interface MemberLayoutProps {
  children: React.ReactNode;
}

export const MemberLayout: React.FC<MemberLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <MemberSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={styles.main}>
        <MemberHeader onMenuToggle={() => setSidebarOpen((v) => !v)} />

        <main className={styles.content}>
          <div className={styles.contentInner}>{children}</div>
        </main>
      </div>
    </div>
  );
};