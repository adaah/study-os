import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  CheckSquare,
  Calendar,
  Timer,
  GraduationCap,
  BarChart3,
  Settings,
  Flame,
  ChevronLeft,
  ChevronRight,
  Plus,
  Layers,
  Target,
  History,
  Link as LinkIcon,
  FileText,
} from 'lucide-react';
import { useStudyOS } from '@/context/StudyOSContext';

const navigationItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Meu Semestre', path: '/meu-semestre', icon: CalendarDays },
  { name: 'Disciplinas', path: '/disciplinas', icon: BookOpen, badgeKey: 'subjects' },
  { name: 'Atividades', path: '/atividades', icon: CheckSquare, badgeKey: 'tasks' },
  { name: 'Calendário', path: '/calendario', icon: Calendar },
  { name: 'Foco (Pomodoro)', path: '/foco', icon: Timer, highlight: true },
  { name: 'Notas', path: '/notas', icon: GraduationCap },
  { name: 'Análises', path: '/analises', icon: BarChart3 },
  { name: 'Configurações', path: '/configuracoes', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { semester, stats, activePomodoro, openQuickModal } = useStudyOS();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  return (
    <aside
      className={`bg-white border-[#E2E8F0] flex select-none transition-all duration-300 z-40 shrink-0
        max-md:w-full max-md:h-16 max-md:flex-row max-md:border-t max-md:px-2 max-md:overflow-visible max-md:items-center max-md:hide-scrollbar
        md:relative md:flex-col md:min-h-[100dvh] md:border-r ${isCollapsed ? 'md:w-[72px]' : 'md:w-64'}
      `}
    >
      {/* Brand Header */}
      <div className={`max-md:hidden h-16 border-b border-[#E2E8F0] flex items-center transition-all ${isCollapsed ? 'justify-center px-0' : 'justify-between px-5'}`}>
        <NavLink to="/" className={`flex items-center gap-3 group ${isCollapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200 shrink-0">
            <GraduationCap className="w-5 h-5 text-secondary-container" />
          </div>
          {!isCollapsed && (
            <div className="animate-in fade-in duration-200 whitespace-nowrap overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-primary tracking-tight">StudyOS</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Ecossistema Universitário</p>
            </div>
          )}
        </NavLink>
      </div>

      {/* Active Semester Pill */}
      <div className={`max-md:hidden mx-3 my-2 bg-slate-50 rounded-md border border-slate-200/80 flex items-center transition-all ${isCollapsed ? 'p-2 justify-center' : 'p-3 justify-between'}`}>
        {isCollapsed ? (
          <div className="relative group flex justify-center items-center cursor-help">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            {/* Tooltip */}
            <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
              Semestre {semester.name} (Semana {semester.currentWeek || 4})
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 whitespace-nowrap overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0"></span>
              <span className="font-semibold text-slate-800 text-xs truncate">Semestre {semester.name}</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
              Semana {semester.currentWeek || 4}
            </span>
          </>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex max-md:flex-row max-md:items-center max-md:justify-around max-md:w-full max-md:px-1 max-md:py-0 md:flex-col md:px-3 md:py-2 md:space-y-1 md:overflow-y-auto md:overflow-x-hidden md:flex-1">
        {!isCollapsed && (
          <div className="max-md:hidden text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5 mt-2 animate-in fade-in duration-200 whitespace-nowrap">
            Menu Acadêmico
          </div>
        )}
        
        {isCollapsed && <div className="mt-4"></div>}

        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const isPomodoroRunning = item.path === '/foco' && activePomodoro.isActive && !activePomodoro.isPaused;

          return (
            <React.Fragment key={item.path}>
              <NavLink
                to={item.path}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center rounded-md font-medium transition-all duration-150 group relative
                  max-md:flex-col max-md:justify-center max-md:px-1 max-md:py-1 max-md:h-[52px] max-md:flex-1
                  md:py-2 ${isCollapsed ? 'md:justify-center md:px-0' : 'md:justify-between md:px-3 text-xs'} 
                  ${isActive ? 'max-md:text-primary md:bg-primary md:text-white md:shadow-sm' : 'text-slate-500 hover:text-slate-900 md:text-slate-700 md:hover:bg-slate-100/80'}
                  ${(item.path === '/foco' || item.path === '/' || item.path === '/atividades') ? 'max-md:hidden' : ''}
                `}
              >
                <div className={`flex items-center max-md:flex-col max-md:justify-center ${isCollapsed ? 'md:justify-center md:w-full' : 'md:gap-3'}`}>
                  <Icon
                    className={`w-6 h-6 md:w-4 md:h-4 transition-colors shrink-0 ${
                      isActive ? 'text-primary md:text-white' : item.highlight ? 'text-rose-600' : 'text-slate-400 md:text-slate-500 group-hover:text-slate-700 md:group-hover:text-slate-800'
                    }`}
                  />
                  <span className={`max-md:hidden md:whitespace-nowrap ${isCollapsed ? 'md:hidden' : ''}`}>{item.name}</span>
                </div>

                {/* Badges / Indicators */}
                {!isCollapsed && (
                  <div className="flex items-center gap-1.5 shrink-0 max-md:absolute max-md:top-1 max-md:right-2">
                    {item.path === '/atividades' && stats.pendingTasksCount > 0 && (
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isActive ? 'max-md:bg-primary/10 max-md:text-primary md:bg-white/20 md:text-white' : 'bg-slate-200 text-slate-700'}`}>
                        {stats.pendingTasksCount}
                      </span>
                    )}
                    {item.path === '/disciplinas' && stats.activeSubjectsCount > 0 && (
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isActive ? 'max-md:bg-primary/10 max-md:text-primary md:bg-white/20 md:text-white' : 'bg-slate-200 text-slate-700'}`}>
                        {stats.activeSubjectsCount}
                      </span>
                    )}
                    {isPomodoroRunning && (
                      <span className="flex h-2 w-2 relative max-md:-mt-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                    )}
                  </div>
                )}

                {/* Collapsed absolute indicators */}
                {isCollapsed && (
                  <div className="absolute right-1 top-1 flex flex-col gap-0.5">
                    {(item.path === '/atividades' && stats.pendingTasksCount > 0) || (item.path === '/disciplinas' && stats.activeSubjectsCount > 0) ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary border border-white" />
                    ) : null}
                    {isPomodoroRunning && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse border border-white" />
                    )}
                  </div>
                )}

                {/* Tooltip on collapse */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                    {item.name}
                    {item.path === '/atividades' && stats.pendingTasksCount > 0 ? ` (${stats.pendingTasksCount})` : ''}
                  </div>
                )}
              </NavLink>

              {/* Mobile Central Add Button */}
              {item.path === '/calendario' && (
                <button
                  onClick={() => setAddMenuOpen(!addMenuOpen)}
                  className="md:hidden flex flex-col items-center justify-center flex-1 z-50 group px-2 relative"
                  title="Adicionar"
                >
                  <div className={`w-12 h-12 text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all ${addMenuOpen ? 'bg-slate-800 rotate-45' : 'bg-primary'}`}>
                    <Plus className="w-6 h-6" />
                  </div>
                </button>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Mini Focus Running Status Box */}
      {activePomodoro.isActive && (
        <div className={`m-3 bg-slate-900 text-white rounded-lg border border-slate-700 shadow-md transition-all ${isCollapsed ? 'p-2 flex justify-center cursor-pointer' : 'p-3 text-xs'}`}>
          {isCollapsed ? (
            <div className="relative group" onClick={() => window.location.href = '/foco'}>
              <Flame className="w-5 h-5 text-amber-400 animate-bounce" />
              <div className="absolute bottom-full left-full mb-2 ml-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-slate-700">
                <div className="font-bold text-emerald-400">
                  {Math.floor(activePomodoro.timeLeft / 60).toString().padStart(2, '0')}:{(activePomodoro.timeLeft % 60).toString().padStart(2, '0')}
                </div>
                <div>{activePomodoro.mode === 'focus' ? 'Foco em Andamento' : 'Pausa'}</div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                  <span className="font-semibold text-[11px] text-slate-200 truncate">
                    {activePomodoro.mode === 'focus' ? 'Foco' : 'Pausa'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {activePomodoro.currentCycle}/{activePomodoro.totalCycles}
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-center tracking-wider text-emerald-400 my-1">
                {Math.floor(activePomodoro.timeLeft / 60).toString().padStart(2, '0')}
                :{(activePomodoro.timeLeft % 60).toString().padStart(2, '0')}
              </div>
              <NavLink to="/foco" className="block text-center text-[10px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 py-1 rounded mt-1 font-medium transition-colors">
                Abrir Painel →
              </NavLink>
            </div>
          )}
        </div>
      )}

      {/* Quick Footer & Toggle */}
      <div className={`max-md:hidden p-3 border-t border-[#E2E8F0] flex items-center transition-all ${isCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'}`}>
        {!isCollapsed && (
          <div className="flex flex-col gap-0.5 overflow-hidden animate-in fade-in duration-200">
            <span className="text-slate-500 text-[11px] truncate font-medium italic">"Foco e Constância"</span>
            <span className="font-mono text-[10px] text-slate-400">{stats.totalHours}h Estudadas</span>
          </div>
        )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-7 h-7 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors shrink-0"
          title={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Add Menu */}
      {addMenuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-[1px] md:hidden" onClick={() => setAddMenuOpen(false)} />
          <div className="fixed bottom-20 inset-x-4 bg-white border border-[#E2E8F0] rounded-xl shadow-2xl py-2 z-50 animate-in slide-in-from-bottom-2 md:hidden max-h-[70vh] overflow-y-auto">
            <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              O que deseja cadastrar?
            </div>

            <button
              onClick={() => {
                openQuickModal('task');
                setAddMenuOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 active:bg-slate-100 flex items-center gap-3 transition-colors"
            >
              <CheckSquare className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-semibold text-sm">Nova Atividade / Entrega</div>
                <div className="text-xs text-slate-400">Trabalho, lista, projeto, artigo</div>
              </div>
            </button>

            <button
              onClick={() => {
                openQuickModal('subject');
                setAddMenuOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 active:bg-slate-100 flex items-center gap-3 transition-colors"
            >
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="font-semibold text-sm">Nova Disciplina</div>
                <div className="text-xs text-slate-400">Professor, horário, ementa</div>
              </div>
            </button>

            <button
              onClick={() => {
                openQuickModal('assessment');
                setAddMenuOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 active:bg-slate-100 flex items-center gap-3 transition-colors"
            >
              <GraduationCap className="w-5 h-5 text-rose-600" />
              <div>
                <div className="font-semibold text-sm">Nova Avaliação / Prova</div>
                <div className="text-xs text-slate-400">Prova teórica, seminário, peso</div>
              </div>
            </button>

            <button
              onClick={() => {
                openQuickModal('topic');
                setAddMenuOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 active:bg-slate-100 flex items-center gap-3 transition-colors"
            >
              <Layers className="w-5 h-5 text-violet-600" />
              <div>
                <div className="font-semibold text-sm">Novo Conteúdo / Assunto</div>
                <div className="text-xs text-slate-400">Tópico do mapa de estudos</div>
              </div>
            </button>

            <button
              onClick={() => {
                openQuickModal('study_goal');
                setAddMenuOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 active:bg-slate-100 flex items-center gap-3 transition-colors"
            >
              <Target className="w-5 h-5 text-amber-600" />
              <div>
                <div className="font-semibold text-sm">Novo Objetivo de Estudo</div>
                <div className="text-xs text-slate-400">Meta de aprendizado ou revisão</div>
              </div>
            </button>

            <div className="my-2 border-t border-slate-100" />

            <button
              onClick={() => {
                openQuickModal('session');
                setAddMenuOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 active:bg-slate-100 flex items-center gap-3 transition-colors"
            >
              <History className="w-4 h-4 text-slate-500" />
              <span className="font-medium text-sm">Registrar Sessão de Estudo</span>
            </button>

            <button
              onClick={() => {
                openQuickModal('link');
                setAddMenuOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 active:bg-slate-100 flex items-center gap-3 transition-colors"
            >
              <LinkIcon className="w-4 h-4 text-slate-500" />
              <span className="font-medium text-sm">Novo Link Acadêmico</span>
            </button>

            <button
              onClick={() => {
                openQuickModal('note');
                setAddMenuOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 active:bg-slate-100 flex items-center gap-3 transition-colors"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span className="font-medium text-sm">Nova Anotação</span>
            </button>
          </div>
        </>
      )}
    </aside>
  );
};
