import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SemesterHealth } from '@/types';

interface HealthIndicatorProps {
  health: SemesterHealth;
}

export const HealthIndicator: React.FC<HealthIndicatorProps> = ({ health }) => {
  const navigate = useNavigate();
  
  const categories = ['Avaliações', 'Atividades', 'Geral'] as const;
  type HealthCategory = typeof categories[number];
  
  const [activeTab, setActiveTab] = useState<HealthCategory>(() => {
    return categories.find(c => health.healthPoints.some(p => p.category === c)) || 'Atividades';
  });
  
  const radius = 15.9155;
  const circumference = 100;
  const strokeDashoffset = circumference - health.score;

  let strokeColor = 'text-emerald-500';
  let badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-200';

  if (health.score < 50) {
    strokeColor = 'text-rose-500';
    badgeBg = 'bg-rose-100 text-rose-800 border-rose-200';
  } else if (health.score < 75) {
    strokeColor = 'text-amber-500';
    badgeBg = 'bg-amber-100 text-amber-800 border-amber-200';
  }

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-slate-500" />
          <h2 className="text-xs font-bold text-slate-900 tracking-wide uppercase">Saúde do Semestre</h2>
        </div>
        <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-full border ${badgeBg}`}>
          {health.statusLabel}
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-5 pt-4">
        {/* Academic Index */}
        <section className="flex items-center gap-6">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className={strokeColor}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray={`${health.score}, 100`}
                strokeLinecap="round"
                strokeWidth="4"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900 leading-none">{health.score}</span>
              <span className="text-[10px] text-slate-400 font-medium">/100</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 pr-2">
            <h3 className="text-sm font-bold text-primary">Índice Acadêmico</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[160px] text-balance">
              Calculado a partir de prazos, provas e dedicação.
            </p>
          </div>
        </section>

        {/* Tabs */}
        <nav className="flex border-b border-slate-100">
          {categories.map(category => {
            const count = health.healthPoints.filter(p => p.category === category).length;
            const isActive = activeTab === category;
            return (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`flex-1 pb-3 text-[11px] sm:text-xs flex items-center justify-center gap-1 sm:gap-1.5 transition-colors ${
                  isActive 
                    ? 'font-bold text-primary border-b-2 border-primary' 
                    : 'font-semibold text-slate-500 hover:text-slate-700 border-b-2 border-transparent'
                }`}
              >
                {category}
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold ${
                  isActive ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Cards List */}
        <section className="flex flex-col gap-3 relative max-h-[300px] overflow-y-auto pr-1">
          {health.healthPoints.filter(p => p.category === activeTab).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-6">
              <CheckCircle className="w-6 h-6 text-emerald-500/50 mb-2" />
              <span className="text-[11px]">Nenhum ponto nesta categoria.</span>
            </div>
          ) : (
            health.healthPoints.filter(p => p.category === activeTab).map((point) => {
              const isPositive = point.type === 'positive';
              const isCritical = point.type === 'critical';
              
              const Icon = isPositive ? CheckCircle : AlertCircle;
              
              const bgClass = isPositive ? 'bg-emerald-50 border-emerald-100' : (isCritical ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100');
              const iconClass = isPositive ? 'text-emerald-600' : (isCritical ? 'text-rose-600' : 'text-amber-600');
              const titleClass = isPositive ? 'text-emerald-800' : (isCritical ? 'text-rose-800' : 'text-amber-800');
              
              return (
                <article key={point.id} className={`border rounded-xl p-3 flex ${isPositive ? 'items-center gap-3' : 'flex-col gap-3 relative overflow-hidden'} ${bgClass}`}>
                  {isPositive ? (
                    <>
                      <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${iconClass}`} />
                      <p className={`text-[11px] font-bold leading-snug ${titleClass} text-balance`}>
                        {point.message}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-start gap-2">
                            <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconClass}`} />
                            <h3 className={`text-xs font-bold leading-snug ${titleClass} text-balance`}>{point.message}</h3>
                          </div>
                          {point.actionRoute && (
                            <button 
                              onClick={() => navigate(point.actionRoute!)}
                              className={`flex-shrink-0 bg-white text-[9px] sm:text-[10px] font-bold px-2 py-1.5 rounded-md shadow-sm border flex items-center gap-1 ${iconClass} ${isCritical ? 'border-rose-100' : 'border-amber-100'}`}
                            >
                              {point.actionLabel || 'Resolver'}
                              <ArrowRight className="w-3 h-3 hidden sm:block" />
                            </button>
                          )}
                        </div>
                        {(point.details?.length || point.impact) && (
                          <div className="pl-6 flex flex-col gap-2">
                            {point.details && point.details.length > 0 && (
                              <ul className={`text-[11px] opacity-80 list-disc list-inside ${titleClass}`}>
                                {point.details.map((detail, idx) => (
                                  <li key={idx} className="leading-snug mb-0.5 text-balance">{detail}</li>
                                ))}
                              </ul>
                            )}
                            {point.impact && (
                              <p className={`text-[10px] font-bold uppercase tracking-wide mt-1 ${iconClass}`}>
                                {point.impact}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </article>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
};
