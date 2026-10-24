'use client';

import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated && <Navbar />}
      <main className={isAuthenticated ? 'app-main' : ''}>
        {children}
      </main>
    </>
  );
}
