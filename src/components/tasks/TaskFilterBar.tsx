import React from 'react';
import { Search, LayoutList, Columns3, Grid2X2 } from 'lucide-react';
import { useStudyOS } from '@/context/StudyOSContext';
import { Priority, TaskStatus } from '@/types';

export type TaskViewMode = 'list' | 'kanban' | 'matrix';

interface TaskFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedSubjectId: string;
  onSubjectChange: (id: string) => void;
  selectedStatus: string;
  onStatusChange: (st: string) => void;
  selectedPriority: string;
  onPriorityChange: (p: string) => void;
  viewMode: TaskViewMode;
  onViewModeChange: (mode: TaskViewMode) => void;
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedSubjectId,
  onSubjectChange,
  selectedStatus,
  onStatusChange,
  selectedPriority,
  onPriorityChange,
  viewMode,
  onViewModeChange,
}) => {
  const { subjects } = useStudyOS();

  return (
    <div className="academic-card max-md:bg-transparent max-md:border-transparent max-md:shadow-none max-md:p-0 max-md:rounded-none p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Search & Subject Filters */}
      <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrar atividades por título..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none text-xs"
          />
        </div>

        {/* Subject Filter */}
        <select
          value={selectedSubjectId}
          onChange={(e) => onSubjectChange(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none text-slate-700 font-medium"
        >
          <option value="all">Todas as disciplinas</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status & Priority & View Switcher */}
      <div className="flex items-center gap-2">
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none text-slate-700"
        >
          <option value="all">Todos os status</option>
          <option value="pending">Pendentes</option>
          <option value="not_started">Não iniciadas</option>
          <option value="in_progress">Em andamento</option>
          <option value="completed">Concluídas</option>
          <option value="overdue">Atrasadas</option>
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none text-slate-700"
        >
          <option value="all">Todas as prioridades</option>
          <option value="high">Alta Prioridade</option>
          <option value="medium">Média Prioridade</option>
          <option value="low">Baixa Prioridade</option>
        </select>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200">
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'list' ? 'bg-white shadow-sm text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Visualização em Lista"
          >
            <LayoutList className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange('kanban')}
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'kanban' ? 'bg-white shadow-sm text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Visualização em Quadro Kanban"
          >
            <Columns3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange('matrix')}
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'matrix' ? 'bg-white shadow-sm text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Matriz de Prioridade (Eisenhower)"
          >
            <Grid2X2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
