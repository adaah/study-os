import React from 'react';
import { PomodoroTimer } from '@/components/focus/PomodoroTimer';

export const FocusPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PomodoroTimer />
    </div>
  );
};
