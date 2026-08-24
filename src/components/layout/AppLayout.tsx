import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { GlobalSearchModal } from '@/components/common/GlobalSearchModal';
import { QuickAddModal } from '@/components/common/QuickAddModal';
import { PomodoroFinishModal } from '@/components/focus/PomodoroFinishModal';
import { useStudyOS } from '@/context/StudyOSContext';

export const AppLayout: React.FC = () => {
  const { setGlobalSearchOpen, showFinishModal } = useStudyOS();

  // Keyboard shortcut: Cmd/Ctrl + K for Global Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setGlobalSearchOpen]);

  return (
    <div className="flex flex-col-reverse md:flex-row h-[100dvh] w-screen overflow-hidden bg-background">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="max-w-[1280px] mx-auto p-6 md:p-8 space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal />
      <QuickAddModal />
      {showFinishModal && <PomodoroFinishModal />}
    </div>
  );
};
