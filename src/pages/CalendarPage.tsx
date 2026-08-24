import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  GraduationCap,
  CheckSquare,
  History,
  Play,
  Layers,
  Clock,
  Trash2,
} from 'lucide-react';
import { useStudyOS } from '@/context/StudyOSContext';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  isValid,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatDate } from '@/lib/utils';

export const CalendarPage: React.FC = () => {
  const { tasks, assessments, subjects, studySessions, startPomodoro, updateTask, updateAssessment, deleteTask, deleteAssessment, deleteStudySession } = useStudyOS();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'agenda' | 'timeline'>('month');
  const navigate = useNavigate();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', date: '', time: '' });
  
  const [agendaSubjectFilter, setAgendaSubjectFilter] = useState('all');
  const [agendaTypeFilter, setAgendaTypeFilter] = useState('all');

  const handleEventClick = (evt: any) => {
    setSelectedEvent(evt);
    setIsEditing(false);
    setEditForm({ title: evt.title, date: evt.date, time: evt.time || '' });
  };

  const handleSaveEdit = () => {
    if (!selectedEvent || !editForm.title.trim() || !editForm.date) return;
    if (selectedEvent.type === 'task') {
      updateTask(selectedEvent.entity.id, {
        title: editForm.title,
        dueDate: editForm.date,
        dueTime: editForm.time || undefined,
      });
    } else if (selectedEvent.type === 'assessment') {
      updateAssessment(selectedEvent.entity.id, {
        title: editForm.title,
        date: editForm.date,
        time: editForm.time || undefined,
      });
    }
    setSelectedEvent({ ...selectedEvent, title: editForm.title, date: editForm.date, time: editForm.time });
    setIsEditing(false);
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    
    if (window.confirm('Tem certeza que deseja apagar este evento? Esta ação não pode ser desfeita.')) {
      if (selectedEvent.type === 'task') {
        deleteTask(selectedEvent.entity.id);
      } else if (selectedEvent.type === 'assessment') {
        deleteAssessment(selectedEvent.entity.id);
      } else if (selectedEvent.type === 'session') {
        deleteStudySession(selectedEvent.entity.id);
      }
      setSelectedEvent(null);
    }
  };

  // Consolidate all academic events
  const allEvents = [
    ...tasks.map((t) => ({
      id: `task-${t.id}`,
      title: t.title,
      date: t.dueDate,
      time: t.dueTime,
      type: 'task' as const,
      subjectId: t.subjectId,
      status: t.status,
      priority: t.priority,
      entity: t,
    })),
    ...assessments.map((a) => ({
      id: `ass-${a.id}`,
      title: a.title,
      date: a.date,
      time: a.time,
      type: 'assessment' as const,
      subjectId: a.subjectId,
      weight: a.weight,
      grade: a.grade,
      entity: a,
    })),
    ...studySessions.map((s) => ({
      id: `sess-${s.id}`,
      title: `Sessão de Foco (${s.actualMinutes}m)`,
      date: s.startTime.split('T')[0],
      time: s.startTime.split('T')[1]?.substring(0, 5),
      type: 'session' as const,
      subjectId: s.subjectId,
      entity: s,
    })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" /> Calendário Acadêmico
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualize prazos, entregas, provas e sessões de estudo registradas.
          </p>
        </div>

        {/* View Switcher and Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setCalendarView('month')}
              className={`px-3 py-1.5 rounded transition-all ${
                calendarView === 'month' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setCalendarView('agenda')}
              className={`hidden md:block px-3 py-1.5 rounded transition-all ${
                calendarView === 'agenda' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Agenda
            </button>
            <button
              onClick={() => setCalendarView('timeline')}
              className={`px-3 py-1.5 rounded transition-all ${
                calendarView === 'timeline' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Linha do Tempo
            </button>
          </div>

          {calendarView === 'month' && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-1.5 bg-white border border-slate-200 rounded-md hover:bg-slate-50 text-slate-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-xs text-slate-800 min-w-[120px] text-center font-mono capitalize">
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </span>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-1.5 bg-white border border-slate-200 rounded-md hover:bg-slate-50 text-slate-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* View 1: Month Grid */}
      {calendarView === 'month' && (
        <div className="academic-card overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 py-2.5">
            <div>Domingo</div>
            <div>Segunda</div>
            <div>Terça</div>
            <div>Quarta</div>
            <div>Quinta</div>
            <div>Sexta</div>
            <div>Sábado</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 text-xs">
            {calendarDays.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const isCurrMonth = isSameMonth(day, currentDate);
              const isTodayDay = isToday(day);

              const dayEvents = allEvents.filter((e) => e.date === dayStr);

              return (
                <div
                  key={dayStr}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      setSelectedDate(selectedDate === dayStr ? null : dayStr);
                    }
                  }}
                  className={`min-h-[50px] md:min-h-[80px] p-1 md:p-2 flex flex-col justify-start transition-colors md:cursor-default cursor-pointer ${
                    !isCurrMonth ? 'bg-slate-50/50 text-slate-300' : 'bg-white hover:bg-slate-50/40'
                  } ${selectedDate === dayStr ? 'max-md:ring-2 max-md:ring-inset max-md:ring-primary max-md:bg-primary/5' : ''}`}
                >
                  <div className="flex items-center justify-center md:justify-between mb-1">
                    <span
                      className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                        isTodayDay
                          ? 'bg-primary text-white'
                          : isCurrMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="hidden md:inline text-[10px] text-slate-400 font-mono font-medium">
                        {dayEvents.length} itens
                      </span>
                    )}
                  </div>

                  <div className="hidden md:block space-y-1 flex-1 mt-1">
                    {dayEvents.map((evt) => {
                      const subj = subjects.find((s) => s.id === evt.subjectId);
                      const isExam = evt.type === 'assessment';

                      return (
                        <div
                          key={evt.id}
                          onClick={() => handleEventClick(evt)}
                          className={`p-1.5 mb-1 rounded text-[10px] leading-tight flex items-start gap-1.5 cursor-pointer transition-transform hover:scale-[1.02] border border-transparent hover:border-slate-200 ${
                            isExam ? 'font-bold' : 'font-medium'
                          }`}
                          style={{
                            backgroundColor: subj?.color ? `${subj.color}20` : '#f1f5f9',
                            color: subj?.color || '#334155',
                          }}
                          title={`${evt.title} (${subj?.name || 'Geral'})`}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0 mt-0.5"
                            style={{ backgroundColor: subj?.color || '#94a3b8' }}
                          />
                          <span className="break-words">{evt.title}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="md:hidden flex flex-wrap gap-1 mt-1 justify-center px-1">
                    {dayEvents.slice(0, 4).map((evt) => {
                      const subj = subjects.find((s) => s.id === evt.subjectId);
                      return (
                        <div
                          key={evt.id}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: subj?.color || (evt.type === 'assessment' ? '#ef4444' : '#94a3b8') }}
                        />
                      );
                    })}
                    {dayEvents.length > 4 && <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Mobile Selected Date / Upcoming Agenda */}
          <div className="md:hidden p-4 space-y-4 border-t border-slate-100 bg-white">
            {(() => {
              const renderEventCard = (evt: any, showDate: boolean) => {
                const subj = subjects.find((s) => s.id === evt.subjectId);
                const isExam = evt.type === 'assessment';
                const baseColor = isExam ? '#ef4444' : (subj?.color || '#64748b');
                
                return (
                  <div
                    key={evt.id}
                    onClick={() => handleEventClick(evt)}
                    className="p-3.5 rounded-xl flex transition-transform hover:scale-[1.01]"
                    style={{ backgroundColor: `${baseColor}20` }}
                  >
                    <div className="flex items-start gap-2.5 w-full">
                      <div className="mt-0.5 shrink-0">
                        {isExam ? (
                          <GraduationCap className="w-4 h-4" style={{ color: baseColor }} />
                        ) : evt.type === 'task' ? (
                          <CheckSquare className="w-4 h-4" style={{ color: baseColor }} />
                        ) : (
                          <History className="w-4 h-4" style={{ color: baseColor }} />
                        )}
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5">
                        <h4 className="font-bold text-[13px] leading-tight text-slate-900">
                          {evt.title}
                        </h4>
                        
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-medium text-slate-600">
                            {subj?.name || 'Visão Geral'}
                          </span>
                          {evt.time && (
                            <span className="font-bold text-slate-500">
                              {evt.time}
                            </span>
                          )}
                        </div>
                        
                        {showDate && (
                          <div className="text-[10px] font-medium text-slate-500 capitalize">
                            {formatDate(evt.date, "EEEE, dd 'de' MMM")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              };

              if (selectedDate) {
                const events = allEvents.filter(e => e.date === selectedDate);
                if (events.length === 0) return <div className="text-center text-slate-400 text-xs py-4">Nenhum evento nesta data</div>;
                return (
                  <>
                    <div className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 capitalize">
                      {format(parseISO(selectedDate), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </div>
                    <div className="space-y-3">
                      {events.map(e => renderEventCard(e, false))}
                    </div>
                  </>
                );
              }

              // No date selected
              const todayStr = format(new Date(), 'yyyy-MM-dd');
              const todayEvents = allEvents.filter(e => e.date === todayStr);
              const upcomingEvents = allEvents.filter(e => e.date > todayStr).slice(0, 5);

              if (todayEvents.length === 0 && upcomingEvents.length === 0) {
                return <div className="text-center text-slate-400 text-xs py-4">Nenhum evento próximo</div>;
              }

              return (
                <div className="space-y-6">
                  {todayEvents.length > 0 && (
                    <div>
                      <div className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 mb-3 capitalize">
                        Hoje, {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
                      </div>
                      <div className="space-y-3">
                        {todayEvents.map(e => renderEventCard(e, false))}
                      </div>
                    </div>
                  )}

                  {upcomingEvents.length > 0 && (
                    <div>
                      <div className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 mb-3">
                        Próximos Dias
                      </div>
                      <div className="space-y-3">
                        {upcomingEvents.map(e => renderEventCard(e, true))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* View 2: Agenda Feed */}
      {calendarView === 'agenda' && (
        <div className="academic-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">
              Feed Cronológico da Agenda
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2">
                <ListFilter className="w-3.5 h-3.5 text-slate-400" />
                <select 
                  value={agendaSubjectFilter}
                  onChange={(e) => setAgendaSubjectFilter(e.target.value)}
                  className="text-[11px] font-semibold bg-transparent border-none focus:ring-0 text-slate-600 py-1.5 outline-none cursor-pointer"
                >
                  <option value="all">Todas Disciplinas</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.code}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <select 
                  value={agendaTypeFilter}
                  onChange={(e) => setAgendaTypeFilter(e.target.value)}
                  className="text-[11px] font-semibold bg-transparent border-none focus:ring-0 text-slate-600 py-1.5 outline-none cursor-pointer"
                >
                  <option value="all">Todos os Tipos</option>
                  <option value="assessment">Provas</option>
                  <option value="task">Atividades</option>
                  <option value="session">Sessões</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {allEvents
              .filter(evt => agendaSubjectFilter === 'all' || evt.subjectId === agendaSubjectFilter)
              .filter(evt => agendaTypeFilter === 'all' || evt.type === agendaTypeFilter)
              .map((evt) => {
              const subj = subjects.find((s) => s.id === evt.subjectId);
              const isExam = evt.type === 'assessment';

              return (
                <div
                  key={evt.id}
                  onClick={() => handleEventClick(evt)}
                  className="p-3.5 cursor-pointer rounded-lg border flex items-center justify-between gap-3 text-xs transition-transform hover:scale-[1.01]"
                  style={{
                    backgroundColor: subj?.color ? `${subj.color}15` : '#f8fafc',
                    borderColor: subj?.color ? `${subj.color}40` : '#e2e8f0',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2.5 rounded-md shrink-0 border"
                      style={{
                        backgroundColor: subj?.color ? `${subj.color}20` : '#f1f5f9',
                        borderColor: subj?.color ? `${subj.color}30` : '#e2e8f0',
                        color: subj?.color || '#64748b'
                      }}
                    >
                      {isExam ? (
                        <GraduationCap className="w-4 h-4" />
                      ) : evt.type === 'task' ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <History className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[11px] font-bold font-mono"
                          style={{ color: subj?.color || '#64748b' }}
                        >
                          {subj?.code || 'Geral'}
                        </span>
                        <h4 className="font-semibold text-slate-900">{evt.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {subj?.name || 'Visão Geral'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-700 capitalize">
                      {formatDate(evt.date, "EEEE, dd 'de' MMM")}
                    </div>
                    {evt.time && (
                      <div className="text-[10px] font-semibold text-slate-500 mt-0.5 flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" /> {evt.time}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View 3: Linha do Tempo (Timeline) */}
      {calendarView === 'timeline' && (
        <div className="academic-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3 mb-6">
            <h2 className="text-sm font-bold text-slate-900">
              Linha do Tempo do Semestre
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2">
                <ListFilter className="w-3.5 h-3.5 text-slate-400" />
                <select 
                  value={agendaSubjectFilter}
                  onChange={(e) => setAgendaSubjectFilter(e.target.value)}
                  className="text-[11px] font-semibold bg-transparent border-none focus:ring-0 text-slate-600 py-1.5 outline-none cursor-pointer"
                >
                  <option value="all">Todas Disciplinas</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.code}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <select 
                  value={agendaTypeFilter}
                  onChange={(e) => setAgendaTypeFilter(e.target.value)}
                  className="text-[11px] font-semibold bg-transparent border-none focus:ring-0 text-slate-600 py-1.5 outline-none cursor-pointer"
                >
                  <option value="all">Todos os Tipos</option>
                  <option value="assessment">Provas</option>
                  <option value="task">Atividades</option>
                  <option value="session">Sessões</option>
                </select>
              </div>
            </div>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {allEvents
              .filter(evt => agendaSubjectFilter === 'all' || evt.subjectId === agendaSubjectFilter)
              .filter(evt => agendaTypeFilter === 'all' || evt.type === agendaTypeFilter)
              .map((evt, idx) => {
              const subj = subjects.find((s) => s.id === evt.subjectId);
              const isExam = evt.type === 'assessment';

              return (
                <div key={evt.id} onClick={() => handleEventClick(evt)} className="cursor-pointer relative group">
                  {/* Timeline bullet */}
                  <span
                    className="absolute -left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ring-2"
                    style={{
                      backgroundColor: subj?.color || '#94a3b8',
                      '--tw-ring-color': subj?.color ? `${subj.color}40` : '#e2e8f0'
                    } as React.CSSProperties}
                  />

                  <div 
                    className="p-4 rounded-xl border transition-transform hover:-translate-y-0.5"
                    style={{
                      backgroundColor: subj?.color ? `${subj.color}10` : '#f8fafc',
                      borderColor: subj?.color ? `${subj.color}30` : '#e2e8f0',
                    }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          {isExam ? <GraduationCap className="w-3.5 h-3.5" style={{color: subj?.color || '#64748b'}} /> : 
                           evt.type === 'task' ? <CheckSquare className="w-3.5 h-3.5" style={{color: subj?.color || '#64748b'}} /> : 
                           <History className="w-3.5 h-3.5" style={{color: subj?.color || '#64748b'}} />}
                          <span 
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: subj?.color || '#64748b' }}
                          >
                            {evt.type === 'assessment' ? 'Avaliação' : evt.type === 'task' ? 'Atividade' : 'Sessão de Foco'}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">{evt.title}</h4>
                        <div className="text-[11px] font-semibold text-slate-500 mt-1">
                          {subj?.name || 'Visão Geral'} <span className="font-mono text-[10px] opacity-75">({subj?.code || 'Geral'})</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center shrink-0 min-w-[60px] border-l border-slate-100 pl-4 py-1">
                        <div className="text-[13px] font-black text-slate-700 capitalize leading-none">
                          {formatDate(evt.date, "dd MMM")}
                        </div>
                        {evt.time && (
                          <div className="text-[9px] font-bold text-slate-400 mt-1.5 flex items-center justify-center gap-1 uppercase tracking-wider">
                            <Clock className="w-2.5 h-2.5" /> {evt.time}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Detalhes do Evento</h3>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                &times;
              </button>
            </div>
            
            {/* Body */}
            <div className="p-5">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Título</label>
                    <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Data</label>
                      <input type="date" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})} className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Horário (Opcional)</label>
                      <input type="time" value={editForm.time} onChange={e => setEditForm({...editForm, time: e.target.value})} className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button onClick={() => setIsEditing(false)} className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded transition-colors">Cancelar</button>
                    <button onClick={handleSaveEdit} className="px-4 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded transition-colors">Salvar Alterações</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold border border-slate-200 rounded bg-slate-50 text-slate-600 mb-2">
                      {selectedEvent.type === 'assessment' ? 'Avaliação / Prova' : selectedEvent.type === 'task' ? 'Atividade' : 'Sessão de Foco'}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">{selectedEvent.title}</h2>
                    {selectedEvent.subjectId && subjects.find(s => s.id === selectedEvent.subjectId) && (
                      <div className="text-xs font-semibold text-slate-500 mt-1">
                        Disciplina: <span style={{color: subjects.find(s => s.id === selectedEvent.subjectId)?.color}}>{subjects.find(s => s.id === selectedEvent.subjectId)?.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="w-4 h-4 text-slate-400" />
                      {formatDate(selectedEvent.date, "dd 'de' MMMM, yyyy")}
                    </div>
                    {selectedEvent.time && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {selectedEvent.time}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {!isEditing && (
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                {(selectedEvent.type === 'task' || selectedEvent.type === 'assessment') ? (
                  <button onClick={() => setIsEditing(true)} className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded bg-slate-100 transition-colors">
                    Editar Info
                  </button>
                ) : <div/>}

                <div className="flex items-center gap-2">
                  {selectedEvent.type === 'task' && (
                    <button onClick={() => navigate(`/atividades?taskId=${selectedEvent.entity.id}`)} className="px-4 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded transition-colors">
                      Ver Atividade
                    </button>
                  )}
                  {selectedEvent.type === 'assessment' && (
                    <button onClick={() => navigate(`/disciplinas/${selectedEvent.subjectId}`)} className="px-4 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded transition-colors">
                      Ver Disciplina
                    </button>
                  )}
                  
                  <button 
                    onClick={handleDeleteEvent}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors ml-1"
                    title="Excluir evento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
