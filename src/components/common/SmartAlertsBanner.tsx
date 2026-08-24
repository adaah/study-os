import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckSquare, GraduationCap, Timer } from 'lucide-react';
import { useStudyOS } from '@/context/StudyOSContext';

type AlertCategory = 'urgent_deadline' | 'upcoming_exam' | 'low_study_time';

const CATEGORY_INFO: Record<AlertCategory, { label: string; icon: React.ElementType }> = {
  urgent_deadline: { label: 'Atividades', icon: CheckSquare },
  upcoming_exam: { label: 'Avaliações', icon: GraduationCap },
  low_study_time: { label: 'Estudo', icon: Timer },
};

export const SmartAlertsBanner: React.FC = () => {
  const { alerts, startPomodoro } = useStudyOS();
  const navigate = useNavigate();

  // Initial active tab based on which category has alerts
  const [activeTab, setActiveTab] = useState<AlertCategory>(() => {
    if (alerts.some(a => a.type === 'urgent_deadline')) return 'urgent_deadline';
    if (alerts.some(a => a.type === 'upcoming_exam')) return 'upcoming_exam';
    return 'low_study_time';
  });

  if (alerts.length === 0) return null;

  // Group alerts
  const groupedAlerts = {
    urgent_deadline: alerts.filter(a => a.type === 'urgent_deadline'),
    upcoming_exam: alerts.filter(a => a.type === 'upcoming_exam'),
    low_study_time: alerts.filter(a => a.type === 'low_study_time'),
  };

  const currentAlerts = groupedAlerts[activeTab];

  return (
    <div className="academic-card overflow-hidden max-md:bg-transparent max-md:border-none max-md:shadow-none max-md:rounded-none">
      {/* Alert Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50/60 overflow-x-auto max-md:bg-transparent max-md:hide-scrollbar">
        {(Object.keys(CATEGORY_INFO) as AlertCategory[]).map((category) => {
          const { label, icon: Icon } = CATEGORY_INFO[category];
          const count = groupedAlerts[category].length;
          const isActive = activeTab === category;

          return (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`relative flex-1 flex items-center justify-center gap-2 max-md:gap-1 py-3 px-4 max-md:px-1 text-xs max-md:text-[10px] font-semibold transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'text-primary bg-white max-md:bg-transparent'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 max-md:hover:bg-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 max-md:w-3 max-md:h-3 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
              <span className="max-md:truncate">{label}</span>
              {count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-4 bg-white max-md:bg-transparent max-md:p-0 max-md:pt-4">
        {currentAlerts.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            Nenhum alerta nesta categoria no momento.
          </div>
        ) : (
          <div className="space-y-3 animate-in fade-in duration-200">
            {currentAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border flex flex-col gap-3 transition-all ${
                  alert.severity === 'high'
                    ? 'bg-rose-50 border-rose-100'
                    : 'bg-amber-50 border-amber-100'
                }`}
              >
                <div className="flex gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      alert.severity === 'high' ? 'bg-rose-100/60 text-rose-600 border border-rose-200' : 'bg-amber-100/60 text-amber-600 border border-amber-200'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3
                      className={`font-bold text-sm leading-tight ${
                        alert.severity === 'high' ? 'text-rose-950' : 'text-amber-950'
                      }`}
                    >
                      {alert.title}
                    </h3>
                    <p
                      className={`text-xs leading-relaxed mt-1 mb-2.5 ${
                        alert.severity === 'high' ? 'text-rose-900/80' : 'text-amber-900/80'
                      }`}
                    >
                      {alert.message}
                    </p>


                  </div>
                </div>

                {alert.actionLabel && alert.actionRoute && (
                  <button
                    onClick={() => {
                      if (alert.actionRoute === '/foco' && alert.subjectId) {
                        navigate('/foco', { state: { subjectId: alert.subjectId } });
                      } else if (alert.actionRoute) {
                        navigate(alert.actionRoute);
                      }
                    }}
                    className={`w-full py-2.5 mt-1 rounded-lg font-bold text-xs transition-colors shadow-sm ${
                      alert.severity === 'high'
                        ? 'bg-[#B91C1C] hover:bg-[#991B1B] text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    {alert.actionLabel}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
