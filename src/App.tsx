import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StudyOSProvider } from '@/context/StudyOSContext';
import { AppLayout } from '@/components/layout/AppLayout';

import { DashboardPage } from '@/pages/DashboardPage';
import { MySemesterPage } from '@/pages/MySemesterPage';
import { SubjectsPage } from '@/pages/SubjectsPage';
import { SubjectDetailPage } from '@/pages/SubjectDetailPage';
import { TasksPage } from '@/pages/TasksPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { FocusPage } from '@/pages/FocusPage';
import { GradesPage } from '@/pages/GradesPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function App() {
  return (
    <StudyOSProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="meu-semestre" element={<MySemesterPage />} />
            <Route path="disciplinas" element={<SubjectsPage />} />
            <Route path="disciplinas/:id" element={<SubjectDetailPage />} />
            <Route path="atividades" element={<TasksPage />} />
            <Route path="calendario" element={<CalendarPage />} />
            <Route path="foco" element={<FocusPage />} />
            <Route path="notas" element={<GradesPage />} />
            <Route path="analises" element={<AnalyticsPage />} />
            <Route path="configuracoes" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StudyOSProvider>
  );
}

export default App;
