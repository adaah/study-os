import React from 'react';
import {
  BarChart3,
  Clock,
  Timer,
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { useStudyOS } from '@/context/StudyOSContext';
import { formatMinutes } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Cell,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { subjects, studySessions, tasks, assessments, stats } = useStudyOS();

  // Prepare chart data: Hours by Subject
  const hoursBySubjectData = subjects.map((s) => {
    const subjSessions = studySessions.filter((sess) => sess.subjectId === s.id);
    const totalMin = subjSessions.reduce((acc, sess) => acc + (sess.actualMinutes || 0), 0);
    const hours = Number((totalMin / 60).toFixed(1));
    const targetHours = s.targetHoursWeekly * 4; // Monthly planned target

    return {
      name: s.code,
      fullName: s.name,
      hours,
      targetHours,
      color: s.color,
    };
  });

  // Calculate real daily distribution across days of the week from studySessions
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const dayMinutes: Record<string, number> = { Dom: 0, Seg: 0, Ter: 0, Qua: 0, Qui: 0, Sex: 0, Sáb: 0 };
  const dayPomodoros: Record<string, number> = { Dom: 0, Seg: 0, Ter: 0, Qua: 0, Qui: 0, Sex: 0, Sáb: 0 };

  studySessions.forEach((sess) => {
    try {
      const d = new Date(sess.startTime);
      const dayKey = dayNames[d.getDay()];
      if (dayKey) {
        dayMinutes[dayKey] = (dayMinutes[dayKey] || 0) + (sess.actualMinutes || 0);
        dayPomodoros[dayKey] = (dayPomodoros[dayKey] || 0) + (sess.pomodoroCount || 1);
      }
    } catch {
      // ignore
    }
  });

  const dailyDistributionData = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => ({
    day,
    hours: Number(((dayMinutes[day] || 0) / 60).toFixed(1)),
    pomodoros: dayPomodoros[day] || 0,
  }));

  return (
    <div className="space-y-4 md:space-y-6 pb-6 max-md:bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="max-md:px-4 max-md:pt-4">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Análises e Estatísticas
        </h1>
        <p className="text-[11px] md:text-xs text-slate-500 mt-0.5">
          Visão geral do seu desempenho acadêmico nesta semana.
        </p>
      </div>

      {/* 4 Big KPI Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 max-md:px-4">
        <div className="bg-white rounded-xl border border-slate-100 p-5 max-md:p-0 shadow-sm max-md:bg-transparent max-md:border-transparent max-md:shadow-none max-md:rounded-none flex flex-col justify-between">
          <div className="flex max-md:flex-col-reverse items-start justify-between mb-2 md:mb-3 max-md:gap-1.5">
            <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider text-slate-500 leading-tight">Tempo Total</span>
            <div className="p-1 md:p-1.5 bg-blue-50 text-blue-600 rounded-full w-fit">
              <Clock className="w-3 h-3 md:w-4 md:h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-0.5 md:gap-1">
            <span className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{Math.floor(stats.totalHours)}</span>
            <span className="text-[9px] md:text-sm font-bold text-slate-900">h</span>
            <span className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight ml-0.5 md:ml-1">{Math.round((stats.totalHours % 1) * 60)}</span>
            <span className="text-[9px] md:text-sm font-bold text-slate-900">m</span>
          </div>
          <div className="flex items-center gap-1 mt-1 md:mt-2">
            <TrendingUp className="w-2.5 h-2.5 text-emerald-500 max-md:hidden" />
            <span className="text-[8px] md:text-[10px] font-medium text-emerald-600 leading-tight">+5% vs. ant.</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-5 max-md:p-0 shadow-sm max-md:bg-transparent max-md:border-transparent max-md:shadow-none max-md:rounded-none flex flex-col justify-between border-l max-md:border-slate-200/50 max-md:pl-3">
          <div className="flex max-md:flex-col-reverse items-start justify-between mb-2 md:mb-3 max-md:gap-1.5">
            <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider text-slate-500 leading-tight">Pomodoros</span>
            <div className="p-1 md:p-1.5 bg-blue-50 text-blue-600 rounded-full w-fit">
              <Timer className="w-3 h-3 md:w-4 md:h-4" />
            </div>
          </div>
          <div className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats.totalPomodoros}
          </div>
          <div className="text-[8px] md:text-[10px] font-medium text-blue-600 mt-1 md:mt-2 leading-tight">na semana</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-5 max-md:p-0 shadow-sm max-md:bg-transparent max-md:border-transparent max-md:shadow-none max-md:rounded-none flex flex-col justify-between border-l max-md:border-slate-200/50 max-md:pl-3">
          <div className="flex max-md:flex-col-reverse items-start justify-between mb-2 md:mb-3 max-md:gap-1.5">
            <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider text-slate-500 leading-tight">Média Diária</span>
            <div className="p-1 md:p-1.5 bg-blue-50 text-blue-600 rounded-full w-fit">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-0.5 md:gap-1">
            <span className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{Math.floor(stats.dailyAverageHours)}</span>
            <span className="text-[9px] md:text-sm font-bold text-slate-900">h</span>
            <span className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight ml-0.5 md:ml-1">{Math.round((stats.dailyAverageHours % 1) * 60)}</span>
            <span className="text-[9px] md:text-sm font-bold text-slate-900">m</span>
          </div>
          <div className="text-[8px] md:text-[10px] font-medium text-slate-500 mt-1 md:mt-2 leading-tight">por dia</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm max-md:hidden">
          <div className="flex items-start justify-between mb-3">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Maior Dedicação</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-full">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 truncate tracking-tight">
            {stats.topSubject ? stats.topSubject.name : '—'}
          </div>
          <div className="text-[10px] font-medium text-blue-600 mt-1">
            {stats.topSubject ? `${stats.topSubject.hours} horas dedicadas` : 'Sem registros'}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-md:px-4">
        {/* Chart 1: Horas por Disciplina */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm max-md:bg-transparent max-md:border-transparent max-md:shadow-none max-md:p-0 max-md:rounded-none">
          <div className="flex items-center justify-between pb-3 mb-2">
            <h3 className="text-[13px] font-bold text-slate-900">
              Horas por Disciplina
            </h3>
            <div className="flex items-center gap-1 text-slate-400">
              <span className="w-1 h-1 rounded-full bg-current"></span>
              <span className="w-1 h-1 rounded-full bg-current"></span>
              <span className="w-1 h-1 rounded-full bg-current"></span>
            </div>
          </div>

          <div className="h-48 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hoursBySubjectData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{fill: '#F1F5F9'}}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: any) => [`${value}h`, 'Tempo']}
                />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]} barSize={20}>
                  {hoursBySubjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#94A3B8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Evolução Diária da Semana */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm max-md:bg-transparent max-md:border-transparent max-md:shadow-none max-md:p-0 max-md:rounded-none">
          <div className="flex items-center justify-between pb-3 mb-2">
            <h3 className="text-[13px] font-bold text-slate-900">
              Evolução Semanal
            </h3>
            <div className="flex items-center gap-1 text-slate-400">
              <span className="w-1 h-1 rounded-full bg-current"></span>
              <span className="w-1 h-1 rounded-full bg-current"></span>
              <span className="w-1 h-1 rounded-full bg-current"></span>
            </div>
          </div>

          <div className="h-48 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyDistributionData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E293B" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1E293B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#1E293B"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#hoursGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Matriz Comparativa entre Disciplinas */}
      <div className="max-md:px-4">
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm max-md:bg-transparent max-md:border-transparent max-md:shadow-none max-md:p-0 max-md:rounded-none">
          <div className="p-4 border-b border-slate-100 max-md:px-0">
            <h2 className="text-[13px] font-bold text-slate-900">
              Progresso por Disciplina
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-white border-b border-slate-100 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                  <th className="px-4 py-3 min-w-[120px]">Disciplina</th>
                  <th className="px-4 py-3">Tempo Dedicado</th>
                  <th className="px-4 py-3">Progresso (%)</th>
                  <th className="px-4 py-3 max-md:hidden">Meta Semanal</th>
                  <th className="px-4 py-3 max-md:hidden">Atividades</th>
                </tr>
              </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.map((subj) => {
                const subjSessions = studySessions.filter((s) => s.subjectId === subj.id);
                const totalMins = subjSessions.reduce((acc, s) => acc + (s.actualMinutes || 0), 0);
                const subjTasks = tasks.filter((t) => t.subjectId === subj.id);
                const doneTasks = subjTasks.filter((t) => t.status === 'completed');
                const prog = subjTasks.length > 0 ? Math.round((doneTasks.length / subjTasks.length) * 100) : 0;

                return (
                  <tr key={subj.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-3 font-semibold text-slate-900 border-b border-slate-50">
                      <div 
                        className="flex flex-col items-start gap-0.5 leading-tight whitespace-normal"
                      >
                        <span className="text-[11px] font-bold tracking-tight">{subj.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-600 border-b border-slate-50 text-[11px]">
                      {Math.floor(totalMins/60)}h {totalMins%60}m
                    </td>
                    <td className="px-4 py-3 border-b border-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-700 w-7">{prog}%</span>
                        <div className="w-10 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${prog}%`, backgroundColor: subj.color || '#1E293B' }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500 max-md:hidden border-b border-slate-50 text-[11px]">{subj.targetHoursWeekly}h / sem</td>
                    <td className="px-4 py-3 text-slate-500 font-medium max-md:hidden border-b border-slate-50 text-[11px]">
                      {doneTasks.length} <span className="text-slate-400 font-normal">de</span> {subjTasks.length}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </div>
  );
};
