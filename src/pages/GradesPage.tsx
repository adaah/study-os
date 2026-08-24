import React from 'react';
import { GradeCalculator } from '@/components/grades/GradeCalculator';

export const GradesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <GradeCalculator />
    </div>
  );
};
