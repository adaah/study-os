import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Play,
  Search,
  BookOpen,
  CheckSquare,
  GraduationCap,
  Target,
  FileText,
  Link as LinkIcon,
  Layers,
  History,
  ChevronDown,
  Timer,
  LayoutDashboard,
  CalendarDays,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useStudyOS } from '@/context/StudyOSContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Header: React.FC = () => {
  const { semester, openQuickModal, setGlobalSearchOpen, startPomodoro, subjects, activePomodoro } = useStudyOS();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const todayStr = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  const capitalizedToday = todayStr.charAt(0).toUpperCase() + todayStr.slice(1);

  const handleStartQuickFocus = () => {
    if (!activePomodoro.isActive) {
      if (subjects.length > 0) {
        navigate('/foco', { state: { subjectId: subjects[0].id } });
        return;
      }
    }
    navigate('/foco');
  };

  return (
    <div className="sticky top-0 z-20 flex flex-col w-full bg-white shadow-sm md:shadow-none">
      <header className="h-16 bg-white md:border-b border-[#E2E8F0] px-3 md:px-6 flex items-center justify-between">
      {/* Mobile Brand (Hidden on Desktop) */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm shrink-0">
          <GraduationCap className="w-4 h-4" />
        </div>
        <span className="font-bold text-[15px] text-primary tracking-tight">StudyOS</span>
      </div>

      {/* Left: Context and Date info */}
      <div className="flex items-center gap-4 max-md:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-slate-900 tracking-tight">Semestre {semester.name}</h1>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Semana {semester.currentWeek || 4}</span>
          </div>
          <p className="text-[11px] text-slate-500">{capitalizedToday}</p>
        </div>
      </div>

      {/* Middle: Quick Search Trigger */}
      <div className="flex-1 max-w-md max-md:hidden md:mx-6">
        <button
          onClick={() => setGlobalSearchOpen(true)}
          className="w-full flex items-center justify-center md:justify-between px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100/90 text-slate-500 rounded-md border border-slate-200 text-xs transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
            <span className="text-slate-500 max-md:hidden">Buscar disciplina, atividade, prova, conteúdo...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-white border border-slate-200 rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        {/* Mobile Search Icon (Hidden on Desktop) */}
        <button
          onClick={() => setGlobalSearchOpen(true)}
          className="md:hidden flex items-center justify-center p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Quick Focus Button (Hidden on mobile) */}
        <button
          onClick={handleStartQuickFocus}
          className="max-md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/90 text-slate-800 rounded-md text-xs font-semibold border border-slate-200 transition-colors shadow-sm"
          title="Iniciar sessão de Pomodoro rápido"
        >
          <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
          <span>Começar foco</span>
        </button>


        {/* Global Add Dropdown (Hidden on mobile) */}
        <div className="relative max-md:hidden">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary hover:bg-slate-800 text-white rounded-md text-xs font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-1.5 w-56 bg-white border border-[#E2E8F0] rounded-lg shadow-xl py-1.5 z-40 text-xs animate-in fade-in-50 zoom-in-95">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  O que deseja cadastrar?
                </div>

                <button
                  onClick={() => {
                    openQuickModal('task');
                    setDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2.5"
                >
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-medium">Nova Atividade / Entrega</div>
                    <div className="text-[10px] text-slate-400">Trabalho, lista, projeto, artigo</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    openQuickModal('subject');
                    setDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2.5"
                >
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-medium">Nova Disciplina</div>
                    <div className="text-[10px] text-slate-400">Professor, horário, ementa</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    openQuickModal('assessment');
                    setDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2.5"
                >
                  <GraduationCap className="w-4 h-4 text-rose-600" />
                  <div>
                    <div className="font-medium">Nova Avaliação / Prova</div>
                    <div className="text-[10px] text-slate-400">Prova teórica, seminário, peso</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    openQuickModal('topic');
                    setDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2.5"
                >
                  <Layers className="w-4 h-4 text-violet-600" />
                  <div>
                    <div className="font-medium">Novo Conteúdo / Assunto</div>
                    <div className="text-[10px] text-slate-400">Tópico do mapa de estudos</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    openQuickModal('study_goal');
                    setDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2.5"
                >
                  <Target className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="font-medium">Novo Objetivo de Estudo</div>
                    <div className="text-[10px] text-slate-400">Meta de aprendizado ou revisão</div>
                  </div>
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  onClick={() => {
                    openQuickModal('session');
                    setDropdownOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                >
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <span>Registrar Sessão de Estudo</span>
                </button>

                <button
                  onClick={() => {
                    openQuickModal('link');
                    setDropdownOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Novo Link Acadêmico</span>
                </button>

                <button
                  onClick={() => {
                    openQuickModal('note');
                    setDropdownOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Nova Anotação</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      </header>

      {/* Secondary Mobile Nav */}
      <nav className="md:hidden flex items-center justify-around bg-white border-b border-slate-200">
        <NavLink 
          to="/" 
          end
          className={({ isActive }) => `flex items-center gap-2 py-3 px-4 text-xs font-medium flex-1 justify-center transition-colors ${isActive ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </NavLink>
        <NavLink 
          to="/atividades" 
          className={({ isActive }) => `flex items-center gap-2 py-3 px-4 text-xs font-medium flex-1 justify-center transition-colors ${isActive ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
        >
          <CheckSquare className="w-4 h-4" />
          Atividades
        </NavLink>
        <NavLink 
          to="/foco" 
          className={({ isActive }) => `flex items-center gap-2 py-3 px-4 text-xs font-medium flex-1 justify-center transition-colors ${isActive ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
        >
          <Timer className="w-4 h-4" />
          Foco
        </NavLink>
      </nav>
    </div>
  );
};
