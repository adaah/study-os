import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Calendar,
  Play,
  ArrowRight,
  Plus,
  HeartPulse,
  Timer,
  LayoutGrid,
} from 'lucide-react';
import { useStudyOS } from '@/context/StudyOSContext';
import { HealthIndicator } from '@/components/common/HealthIndicator';
import { TodayFocusCard } from '@/components/common/TodayFocusCard';
import { SmartAlertsBanner } from '@/components/common/SmartAlertsBanner';
import { formatRelativeDate, formatMinutes } from '@/lib/utils';
import { isToday, isTomorrow, parseISO, isValid, differenceInDays } from 'date-fns';

type DashTab = 'health' | 'focus' | 'subjects';

const TABS: { id: DashTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'health',   label: 'Saude do Semestre',       icon: HeartPulse },
  { id: 'focus',    label: 'Foco de Hoje',             icon: Timer },
  { id: 'subjects', label: 'Panorama das Disciplinas', icon: LayoutGrid },
];

export const DashboardPage: React.FC = () => {
  const {
    semester,
    subjects,
    tasks,
    assessments,
    studySessions: sessions,
    stats,
    health,
    startPomodoro,
    setTaskStatus,
    openQuickModal,
  } = useStudyOS();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DashTab>('health');

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const pendingTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled');

  const todayItems = pendingTasks.filter((t) => {
    try { const d = parseISO(t.dueDate); return isValid(d) && isToday(d); } catch { return false; }
  });
  const tomorrowItems = pendingTasks.filter((t) => {
    try { const d = parseISO(t.dueDate); return isValid(d) && isTomorrow(d); } catch { return false; }
  });
  const nextDaysItems = pendingTasks.filter((t) => {
    try {
      const d = parseISO(t.dueDate);
      if (!isValid(d)) return false;
      const diff = differenceInDays(d, now);
      return diff > 1 && diff <= 7;
    } catch { return false; }
  });

  return (
    <div className="space-y-6">
      <div className="academic-card p-6 max-md:bg-none max-md:bg-transparent max-md:border-none max-md:shadow-none max-md:p-0 max-md:rounded-none bg-gradient-to-r from-white via-slate-50/50 to-white">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs font-bold text-slate-500 uppercase">Semestre {semester.name}</span>
          <span className="text-slate-300">|</span>
          <span className="text-xs font-semibold text-primary bg-slate-100 px-2 py-0.5 rounded">Semana {semester.currentWeek || 4} de 18</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Painel Geral do Semestre</h1>
        <p className="text-xs text-slate-600 mt-1">
          Voce possui{' '}
          <button
            onClick={() => navigate('/atividades')}
            className="font-bold text-primary hover:underline underline-offset-2 transition-colors"
            title="Ver todas as atividades pendentes"
          >
            {stats.pendingTasksCount} {stats.pendingTasksCount === 1 ? 'atividade pendente' : 'atividades pendentes'}
          </button>
          {' '}e{' '}
          <button
            onClick={() => navigate('/notas')}
            className="font-bold text-primary hover:underline underline-offset-2 transition-colors"
            title="Ver avaliações e notas"
          >
            {stats.upcomingExamsCount} {stats.upcomingExamsCount === 1 ? 'avaliacao cadastrada' : 'avaliacoes cadastradas'}
          </button>
          {' '}no semestre.
        </p>
      </div>

      {subjects.length === 0 && (
        <div className="academic-card p-6 max-md:bg-transparent max-md:border-none max-md:shadow-none max-md:p-0 max-md:rounded-none border-dashed border-2 border-slate-300 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Comece cadastrando suas disciplinas</h3>
              <p className="text-slate-500 mt-0.5">Adicione as materias do semestre para acompanhar prazos, ementa, notas e sessoes de estudo Pomodoro.</p>
            </div>
          </div>
          <button onClick={() => openQuickModal('subject')} className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-slate-800 text-white rounded-md font-semibold shadow-sm transition-colors">
            <Plus className="w-4 h-4" /> Cadastrar Disciplina
          </button>
        </div>
      )}

      <SmartAlertsBanner />

      <div className="academic-card overflow-hidden max-md:bg-transparent max-md:border-none max-md:shadow-none max-md:rounded-none">
        <div className="flex border-b border-slate-200 bg-slate-50/60 max-md:bg-transparent max-md:overflow-x-auto max-md:hide-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 flex items-center justify-center gap-2 py-3.5 px-4 text-xs font-semibold transition-all duration-200 ${isActive ? 'text-primary bg-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
              </button>
            );
          })}
        </div>
        <div className="p-6 max-md:p-0 max-md:pt-6">
          {activeTab === 'health' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
              <HealthIndicator health={health} />
            </div>
          )}
          {activeTab === 'focus' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
              <TodayFocusCard />
            </div>
          )}
          {activeTab === 'subjects' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-start sm:items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-x-4 gap-y-2">
                <div className="min-w-0">
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2 truncate">
                    <BookOpen className="w-4 h-4 text-primary shrink-0" /> Panorama das Disciplinas
                  </h2>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 text-balance mt-0.5 leading-tight">Progresso e horas dedicadas por matéria no semestre.</p>
                </div>
                <button onClick={() => navigate('/disciplinas')} className="text-[11px] sm:text-xs font-semibold text-primary hover:underline flex items-center gap-1 shrink-0 mt-0.5 sm:mt-0">
                  Ver Todas <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {subjects.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">Nenhuma disciplina cadastrada ainda.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjects.map((subj) => {
                    const subjTasks = tasks.filter((t) => t.subjectId === subj.id);
                    const doneTasks = subjTasks.filter((t) => t.status === 'completed');
                    const percent = subjTasks.length > 0 ? Math.round((doneTasks.length / subjTasks.length) * 100) : 0;
                    
                    const subjAssessments = assessments.filter((a) => a.subjectId === subj.id);
                    const upcomingAssessments = subjAssessments.filter(a => a.grade === null || a.grade === undefined).sort((a,b) => a.date.localeCompare(b.date));
                    
                    const subjSessions = sessions.filter(s => s.subjectId === subj.id);
                    const totalMinutes = subjSessions.reduce((acc, s) => acc + (s.actualMinutes || 0), 0);
                    
                    return (
                      <div key={subj.id} onClick={() => navigate(`/disciplinas/${subj.id}`)} className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:border-slate-300 transition-all group h-full">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                          <div 
                            className="flex flex-col items-start leading-tight"
                            style={{ color: subj.color || '#334155' }}
                          >
                            <span className="font-mono text-[10px] opacity-80 font-bold uppercase tracking-wider mb-0.5">{subj.code}</span>
                            <h3 className="font-bold text-xs line-clamp-2" title={subj.name}>{subj.name}</h3>
                          </div>
                        </div>
                        
                        <div className="p-3 flex-1 flex flex-col gap-3">
                          {/* Progress */}
                          <div>
                            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                              <span className="font-medium">Atividades</span>
                              <span className="font-bold text-slate-700">{percent}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, backgroundColor: subj.color }} />
                            </div>
                            <div className="text-[9px] text-slate-400 mt-1">{doneTasks.length} de {subjTasks.length} concluídas</div>
                          </div>

                          {/* Hours */}
                          <div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium mb-0.5">
                              <Timer className="w-3 h-3 text-slate-400" />
                              <span>Tempo Dedicado</span>
                            </div>
                            <div className="text-xs font-bold text-slate-700">{formatMinutes(totalMinutes)}</div>
                          </div>

                          {/* Next Exam */}
                          <div className="mt-auto pt-3 border-t border-slate-100">
                            {upcomingAssessments.length > 0 ? (
                              <div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Próxima Avaliação</div>
                                <div className="text-[11px] font-semibold text-slate-800 truncate" title={upcomingAssessments[0].title}>{upcomingAssessments[0].title}</div>
                                <div className="text-[10px] text-slate-500 mt-0.5">{new Date(upcomingAssessments[0].date).toLocaleDateString('pt-BR')}</div>
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-400 italic">Nenhuma avaliação próxima</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="academic-card p-6 max-md:bg-transparent max-md:border-none max-md:shadow-none max-md:p-0 max-md:rounded-none">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5 gap-3">
          <h2 className="text-[13px] sm:text-sm font-bold text-slate-900 flex items-center gap-2 min-w-0">
            <Calendar className="w-4 h-4 text-primary shrink-0" /> <span className="truncate">Próximos Prazos</span>
          </h2>
          <button onClick={() => navigate('/calendario')} className="text-[10px] sm:text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 shrink-0 bg-primary/5 px-2 py-1.5 sm:px-0 sm:py-0 sm:bg-transparent rounded-md sm:rounded-none">
            Ver Calendário <ArrowRight className="w-3 h-3 hidden sm:block" />
          </button>
        </div>
        <div className="relative md:grid md:grid-cols-3 md:gap-6 space-y-6 md:space-y-0 pl-6 md:pl-0">
          {/* Mobile Timeline Line */}
          <div className="absolute left-[9px] top-3 bottom-0 w-px bg-slate-200 md:hidden z-0"></div>

          {/* Hoje */}
          <div className="space-y-2 md:space-y-3 relative">
            <div className="absolute -left-6 top-0.5 w-[11px] h-[11px] rounded-full border-[2.5px] border-slate-800 bg-white md:hidden z-10" />
            <div className="flex items-center pb-1 md:pb-2 md:border-b border-slate-200">
              <span className="font-bold text-[10px] md:text-xs text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse hidden md:block" /> Hoje
              </span>
            </div>
            {todayItems.length === 0 ? (
              <div className="p-3.5 bg-slate-50 border border-slate-200 border-dashed rounded-lg text-xs text-slate-500 italic font-medium">Nenhum prazo para hoje.</div>
            ) : (
              <div className="space-y-2">
                {todayItems.map((task) => {
                  const subj = subjects.find((s) => s.id === task.subjectId);
                  return (
                    <div key={task.id} className="p-3.5 bg-white md:bg-slate-50/60 rounded-xl border border-slate-200 text-xs flex flex-col gap-2.5 shadow-sm md:shadow-none">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-slate-900 leading-tight">{task.title}</span>
                        <span className="text-xs font-medium mt-0.5 opacity-90" style={{ color: subj?.color || '#64748b' }}>{subj?.name}</span>
                        <span className="text-[11px] font-bold text-rose-600 mt-1">Prazo: {task.dueTime ? `até ${task.dueTime}` : 'hoje'}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button onClick={() => setTaskStatus(task.id, 'completed')} className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-lg transition-colors text-center shadow-sm">
                          Concluir
                        </button>
                        <button onClick={() => navigate('/foco', { state: { subjectId: task.subjectId, taskId: task.id } })} className="flex-1 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-[11px] rounded-lg transition-colors text-center shadow-sm">
                          Focar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Amanhã */}
          <div className="space-y-2 md:space-y-3 relative">
            <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-slate-200 md:hidden z-10" />
            <div className="flex items-center pb-1 md:pb-2 md:border-b border-slate-200">
              <span className="font-bold text-[10px] md:text-xs text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-500 hidden md:block" /> Amanhã
              </span>
            </div>
            {tomorrowItems.length === 0 ? (
              <div className="p-3.5 bg-slate-50 border border-slate-200 border-dashed rounded-lg text-xs text-slate-500 italic font-medium">Nenhum prazo para amanhã.</div>
            ) : (
              <div className="space-y-2">
                {tomorrowItems.map((task) => {
                  const subj = subjects.find((s) => s.id === task.subjectId);
                  return (
                    <div key={task.id} className="p-3.5 bg-white md:bg-slate-50/60 rounded-xl border border-slate-200 text-xs flex flex-col gap-2.5 shadow-sm md:shadow-none">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-slate-900 leading-tight">{task.title}</span>
                        <span className="text-xs font-medium mt-0.5 opacity-90" style={{ color: subj?.color || '#64748b' }}>{subj?.name}</span>
                        <span className="text-[11px] font-bold text-slate-600 mt-1">Prazo: amanhã {task.dueTime ? `até ${task.dueTime}` : ''}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button onClick={() => setTaskStatus(task.id, 'completed')} className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-lg transition-colors text-center shadow-sm">
                          Concluir
                        </button>
                        <button onClick={() => navigate('/foco', { state: { subjectId: task.subjectId, taskId: task.id } })} className="flex-1 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-[11px] rounded-lg transition-colors text-center shadow-sm">
                          Focar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Próximos 7 Dias */}
          <div className="space-y-2 md:space-y-3 relative">
            <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-slate-200 md:hidden z-10" />
            <div className="flex items-center pb-1 md:pb-2 md:border-b border-slate-200">
              <span className="font-bold text-[10px] md:text-xs text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-slate-400 hidden md:block" /> Próximos 7 Dias
              </span>
            </div>
            {nextDaysItems.length === 0 ? (
              <div className="p-3.5 bg-slate-50 border border-slate-200 border-dashed rounded-lg text-xs text-slate-500 italic font-medium">Nenhum compromisso nos próximos 7 dias.</div>
            ) : (
              <div className="space-y-2">
                {nextDaysItems.slice(0, 4).map((task) => {
                  const subj = subjects.find((s) => s.id === task.subjectId);
                  return (
                    <div key={task.id} className="p-3.5 bg-white md:bg-slate-50/60 rounded-xl border border-slate-200 text-xs flex flex-col gap-2.5 shadow-sm md:shadow-none">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-slate-900 leading-tight">{task.title}</span>
                        <span className="text-xs font-medium mt-0.5 opacity-90" style={{ color: subj?.color || '#64748b' }}>{subj?.name}</span>
                        <span className="text-[11px] font-bold text-slate-600 mt-1">Prazo: {task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR', { weekday: 'long' }) : ''}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button onClick={() => setTaskStatus(task.id, 'completed')} className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-lg transition-colors text-center shadow-sm">
                          Concluir
                        </button>
                        <button onClick={() => navigate('/foco', { state: { subjectId: task.subjectId, taskId: task.id } })} className="flex-1 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-[11px] rounded-lg transition-colors text-center shadow-sm">
                          Focar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
