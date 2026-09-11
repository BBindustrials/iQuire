import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      <main style={{ paddingTop: '0', minHeight: 'calc(100vh - 70px)' }}>
        {children}
      </main>
      <Footer />
    </>
  );
};