import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  BookOpen,
  Calendar,
  Layers,
  GraduationCap,
  Target,
  Edit2,
  CheckCircle,
  CheckSquare,
  CheckCircle2,
  AlertOctagon,
  Timer,
} from 'lucide-react';
import { useStudyOS } from '@/context/StudyOSContext';
import { StatCard } from '@/components/common/StatCard';
import { formatDate, formatMinutes } from '@/lib/utils';
import { parseISO, differenceInDays, isValid } from 'date-fns';

export const MySemesterPage: React.FC = () => {
  const { semester, subjects, tasks, assessments, updateSemester, stats } = useStudyOS();
  const navigate = useNavigate();

  const [editOpen, setEditOpen] = useState(false);
  const [semName, setSemName] = useState(semester.name);
  const [semStart, setSemStart] = useState(semester.startDate);
  const [semEnd, setSemEnd] = useState(semester.endDate);
  const [semTargetGrade, setSemTargetGrade] = useState(semester.targetGrade);
  const [activeDayTab, setActiveDayTab] = useState('Seg');

  // Total weeks in semester
  let totalWeeks = 18;
  let elapsedWeeks = semester.currentWeek || 4;
  try {
    const s = parseISO(semester.startDate);
    const e = parseISO(semester.endDate);
    const totalDays = differenceInDays(e, s);
    if (totalDays > 0) {
      totalWeeks = Math.ceil(totalDays / 7);
      const passedDays = differenceInDays(new Date(), s);
      elapsedWeeks = Math.max(1, Math.min(totalWeeks, Math.ceil(passedDays / 7)));
    }
  } catch {
    // ignore
  }

  const semesterProgressPct = Math.round((elapsedWeeks / totalWeeks) * 100);

  // Upcoming deadlines in 7 days
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const pendingTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled');
  const upcomingDeadlines = pendingTasks.filter((t) => {
    try {
      const d = parseISO(t.dueDate);
      if (!isValid(d)) return false;
      const diff = differenceInDays(d, now);
      return diff >= 0 && diff <= 7;
    } catch {
      return false;
    }
  });

  const handleSaveSemester = (e: React.FormEvent) => {
    e.preventDefault();
    updateSemester({
      name: semName,
      startDate: semStart,
      endDate: semEnd,
      targetGrade: Number(semTargetGrade),
      currentWeek: elapsedWeeks,
    });
    setEditOpen(false);
  };

  // Schedule days
  const daysOfWeek = [
    { key: 'Seg', name: 'Segunda-feira' },
    { key: 'Ter', name: 'Terça-feira' },
    { key: 'Qua', name: 'Quarta-feira' },
    { key: 'Qui', name: 'Quinta-feira' },
    { key: 'Sex', name: 'Sexta-feira' },
    { key: 'Sáb', name: 'Sábado' },
  ];

  return (
    <div className="space-y-6">
      {/* Semester Header Card */}
      <div className="academic-card max-md:bg-transparent max-md:border-transparent max-md:shadow-none max-md:p-0 max-md:rounded-none p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                Gestão do Período
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Semestre Ativo
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Semestre {semester.name}</h1>
            <p className="text-xs text-slate-600 mt-1">
              Período letivo de <strong>{formatDate(semester.startDate)}</strong> até{' '}
              <strong>{formatDate(semester.endDate)}</strong> • Meta de aprovação:{' '}
              <strong className="text-primary">{semester.targetGrade || 7.0}</strong>
            </p>
          </div>

          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-semibold transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Configurar Semestre</span>
          </button>
        </div>

        {/* Progress Bar of the Semester */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span>
              Semana letiva {elapsedWeeks} de {totalWeeks}
            </span>
            <span className="font-mono">{semesterProgressPct}% concluído</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${semesterProgressPct}%` }}
            />
          </div>
        </div>
      </div>



      {/* Grade Horária Semanal (Class Schedule Matrix) */}
      <div className="academic-card max-md:bg-transparent max-md:border-transparent max-md:shadow-none max-md:p-0 max-md:rounded-none p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Grade Horária Semanal das Aulas
            </h2>
            <p className="text-[11px] text-slate-500">Mapeamento de aulas presenciais e horários das disciplinas.</p>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden flex items-center justify-between border-b border-slate-200 mb-5 px-1">
          {daysOfWeek.map((day) => (
            <button
              key={day.key}
              onClick={() => setActiveDayTab(day.key)}
              className={`pb-2.5 text-[11px] sm:text-xs font-bold px-2 transition-colors relative ${
                activeDayTab === day.key ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {day.key}
              {activeDayTab === day.key && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-800 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        <div className="md:grid md:grid-cols-6 md:gap-3 flex flex-col">
          {daysOfWeek.map((day) => {
            const daySubjects = subjects.filter((s) => s.schedule.includes(day.key));
            const isMobileActive = activeDayTab === day.key;

            return (
              <div 
                key={day.key} 
                className={`md:p-3.5 md:bg-slate-50/70 md:rounded-lg md:border md:border-slate-200/80 text-xs flex-col justify-between ${
                  isMobileActive ? 'flex' : 'hidden md:flex'
                }`}
              >
                <div>
                  <div className="hidden md:flex font-bold text-slate-800 pb-2 border-b border-slate-200 mb-3 items-center justify-between">
                    <span>{day.key}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{day.name.split('-')[0]}</span>
                  </div>

                  {daySubjects.length === 0 ? (
                    <p className="text-[11px] text-slate-400 py-6 text-center italic border border-dashed border-slate-200 rounded-lg md:border-none md:bg-transparent bg-slate-50">Sem aulas</p>
                  ) : (
                    <div className="space-y-3 md:space-y-2.5">
                      {daySubjects.map((s) => {
                        const timeMatches = s.schedule.match(/\d{2}:\d{2}/g);
                        const startTime = timeMatches?.[0] || '';
                        const endTime = timeMatches?.[1] || '';

                        return (
                          <div
                            key={s.id}
                            onClick={() => navigate(`/disciplinas/${s.id}`)}
                            className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm hover:border-primary cursor-pointer transition-colors relative"
                          >
                            {/* Schedule time matching the design */}
                            <div className="flex items-center gap-1.5 mb-2.5 font-bold">
                              {startTime ? (
                                <>
                                  <span className="text-sm text-slate-900">{startTime}</span>
                                  {endTime && <span className="text-[11px] text-slate-400 font-medium">{endTime}</span>}
                                </>
                              ) : (
                                <span className="text-sm text-slate-900">{s.schedule.split('-')[1]?.trim() || s.schedule}</span>
                              )}
                            </div>

                          <div 
                            className="flex flex-col items-start leading-tight mb-2"
                            style={{ color: s.color || '#334155' }}
                          >
                            <span className="font-mono text-[9px] opacity-80 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-current" /> {s.code}
                            </span>
                            <span className="font-bold text-xs text-slate-800">{s.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            <span className="truncate">{s.room}</span>
                          </div>
                        </div>
                      );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Weekly Study Hours Balance */}
      <div className="academic-card max-md:bg-transparent max-md:border-transparent max-md:shadow-none max-md:p-0 max-md:rounded-none p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Metas de Dedicação Semanal por Disciplina
            </h2>
            <p className="text-[11px] text-slate-500">Carga horária planejada de estudo extraclasse.</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          {subjects.map((s) => (
            <div key={s.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div style={{ color: s.color || '#334155' }}>
                  <div className="font-mono text-[9px] opacity-80 font-bold uppercase tracking-wider mb-0.5">{s.code}</div>
                  <div className="font-bold text-sm leading-none">{s.name}</div>
                  {s.professor && <div className="text-[10px] text-slate-400 mt-1 font-medium">{s.professor}</div>}
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-slate-800 text-sm">{s.targetHoursWeekly}h</span>
                <span className="text-[10px] text-slate-400 block font-medium">/ semana planejadas</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Semester Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 border border-slate-200 text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Configurar Semestre Acadêmico</h3>

            <form onSubmit={handleSaveSemester} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome do Semestre *</label>
                <input
                  type="text"
                  required
                  value={semName}
                  onChange={(e) => setSemName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data Início *</label>
                  <input
                    type="date"
                    required
                    value={semStart}
                    onChange={(e) => setSemStart(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data Término *</label>
                  <input
                    type="date"
                    required
                    value={semEnd}
                    onChange={(e) => setSemEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Meta Geral de Média (0 a 10)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={semTargetGrade}
                  onChange={(e) => setSemTargetGrade(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white font-semibold rounded-md shadow-sm"
                >
                  Salvar Semestre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
