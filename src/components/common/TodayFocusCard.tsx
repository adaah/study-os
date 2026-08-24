import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Play, Clock, Flame, ArrowUpRight } from 'lucide-react';
import { useStudyOS } from '@/context/StudyOSContext';
import { formatMinutes } from '@/lib/utils';

export const TodayFocusCard: React.FC = () => {
  const { dailyFocus, startPomodoro } = useStudyOS();
  const navigate = useNavigate();

  const handleStartTaskFocus = (item: (typeof dailyFocus)[0]) => {
    navigate('/foco', {
      state: {
        subjectId: item.subjectId,
        taskId: item.taskId,
        studyGoalId: item.topicId,
      }
    });
  };

  return (
    <div className="py-2">
      <div className="flex items-start sm:items-center justify-between pb-3 border-b border-slate-100 mb-4 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Target className="w-4 h-4 text-rose-600 shrink-0" />
          <h2 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-800 truncate">
            Foco de Hoje
          </h2>
        </div>
        <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium text-right text-balance leading-tight">
          Priorização inteligente
        </span>
      </div>

      {dailyFocus.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          <p>Tudo em dia! Nenhuma atividade pendente urgente no momento.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {dailyFocus.map((item, index) => {
            let rowBg = 'bg-slate-50/80 hover:bg-slate-100/90 border-slate-200 text-slate-800';
            let indexBg = 'bg-white text-slate-800 border-slate-200';
            let reasonBadge = 'bg-slate-100 text-slate-600 border-slate-200';
            let buttonHover = 'hover:bg-primary hover:text-white hover:border-primary text-slate-800 border-slate-300';
            
            if (item.priority === 'high') {
              rowBg = 'bg-rose-50/50 hover:bg-rose-50 border-rose-100 text-rose-900';
              indexBg = 'bg-rose-100/50 text-rose-800 border-rose-200/50';
              reasonBadge = 'bg-rose-100 text-rose-700 border-rose-200/50';
              buttonHover = 'hover:bg-rose-600 hover:text-white hover:border-rose-600 text-rose-800 border-rose-300';
            } else if (item.priority === 'medium') {
              rowBg = 'bg-amber-50/50 hover:bg-amber-50 border-amber-100 text-amber-900';
              indexBg = 'bg-amber-100/50 text-amber-800 border-amber-200/50';
              reasonBadge = 'bg-amber-100 text-amber-700 border-amber-200/50';
              buttonHover = 'hover:bg-amber-600 hover:text-white hover:border-amber-600 text-amber-800 border-amber-300';
            }

            return (
              <div
                key={item.id}
                className={`p-3 rounded-lg border flex items-center justify-between gap-3 transition-colors ${rowBg}`}
              >
                {/* Number Index and Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-6 h-6 rounded-full border font-bold text-xs flex items-center justify-center shrink-0 ${indexBg}`}>
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-xs truncate">{item.title}</h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[10px] sm:text-[11px] mt-1 opacity-80">
                      <span className="font-bold truncate max-w-[80px] sm:max-w-none" style={{ color: item.subjectColor || '#64748b' }}>{item.subjectName}</span>
                      <span className="text-slate-400">•</span>
                      <span className="flex items-center gap-1 font-mono shrink-0">
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        {formatMinutes(item.estimatedMinutes)}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold text-[8px] sm:text-[9px] uppercase tracking-wider border shrink-0 ${reasonBadge}`}
                      >
                        {item.reason}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Instant Focus Button */}
                <button
                  onClick={() => handleStartTaskFocus(item)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white font-semibold text-xs rounded-md border shadow-sm transition-all group/btn ${buttonHover}`}
                  title="Iniciar sessão de foco para esta tarefa"
                >
                  <Play className={`w-3.5 h-3.5 transition-colors ${
                    item.priority === 'high' ? 'text-rose-600 fill-rose-600 group-hover/btn:text-white group-hover/btn:fill-white'
                    : item.priority === 'medium' ? 'text-amber-600 fill-amber-600 group-hover/btn:text-white group-hover/btn:fill-white'
                    : 'text-emerald-600 fill-emerald-600 group-hover/btn:text-white group-hover/btn:fill-white'
                  }`} />
                  <span className="hidden sm:inline">Iniciar Foco</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
