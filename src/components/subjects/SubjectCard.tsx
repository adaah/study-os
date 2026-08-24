import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, CheckSquare, GraduationCap, ArrowRight, User, Calendar } from 'lucide-react';
import { Subject } from '@/types';
import { useStudyOS } from '@/context/StudyOSContext';
import { formatMinutes, calculateSubjectGrade } from '@/lib/utils';

interface SubjectCardProps {
  subject: Subject;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject }) => {
  const { tasks, assessments, topics, studySessions } = useStudyOS();
  const navigate = useNavigate();

  const subjectTasks = tasks.filter((t) => t.subjectId === subject.id);
  const completedTasks = subjectTasks.filter((t) => t.status === 'completed');
  const subjectAssessments = assessments.filter((a) => a.subjectId === subject.id);
  const subjectTopics = topics.filter((t) => t.subjectId === subject.id);
  const studiedTopics = subjectTopics.filter((t) => t.status === 'studied');

  const subjectSessions = studySessions.filter((s) => s.subjectId === subject.id);
  const totalMinutes = subjectSessions.reduce((acc, s) => acc + (s.actualMinutes || 0), 0);
  const totalPomodoros = subjectSessions.reduce((acc, s) => acc + (s.pomodoroCount || 0), 0);

  // Calculate syllabus progress %
  const totalItems = (subjectTasks.length || 1) + (subjectTopics.length || 1);
  const completedItems = completedTasks.length + studiedTopics.length;
  const progressPercent = Math.min(100, Math.round((completedItems / totalItems) * 100));

  // Next upcoming assessment
  const nextAssessment = subjectAssessments
    .filter((a) => a.grade === null || a.grade === undefined)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const gradeInfo = calculateSubjectGrade(subjectAssessments);

  return (
    <div
      onClick={() => navigate(`/disciplinas/${subject.id}`)}
      className="academic-card p-5 cursor-pointer academic-card-hover flex flex-col justify-between group"
    >
      <div>
        {/* Header with Color Tag */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div 
            className="flex flex-col items-start leading-tight"
            style={{ color: subject.color || '#334155' }}
          >
            <span className="font-mono text-[10px] opacity-80 font-bold uppercase tracking-wider mb-0.5">
              {subject.code}
            </span>
            <h3 className="font-bold text-sm">
              {subject.name}
            </h3>
          </div>

          {gradeInfo.gradedWeight > 0 && (
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Média</div>
              <div className="text-sm font-extrabold font-mono text-slate-900">
                {gradeInfo.currentAverage.toFixed(1)}
              </div>
            </div>
          )}
        </div>

        {/* Professor & Schedule */}
        <div className="space-y-1.5 text-xs text-slate-500 mb-4">
          <div className="flex items-start gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="leading-tight">{subject.professor}</span>
          </div>
          <div className="flex items-start gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="leading-tight">{subject.schedule}</span>
          </div>
        </div>


      </div>

      <div>
        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
            <span>Progresso da Disciplina</span>
            <span className="font-mono">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: subject.color || '#1E293B',
              }}
            />
          </div>
        </div>

        {/* Footer Metrics */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono font-medium text-slate-700">{formatMinutes(totalMinutes)}</span>
            </span>

            <span className="flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {completedTasks.length}/{subjectTasks.length} ativ.
              </span>
            </span>
          </div>

          <span className="flex items-center gap-1 text-[11px] font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
            Ver detalhes <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
