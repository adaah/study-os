import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckSquare, Plus, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useStudyOS } from '@/context/StudyOSContext';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskFilterBar, TaskViewMode } from '@/components/tasks/TaskFilterBar';
import { TaskModal } from '@/components/tasks/TaskModal';
import { Task, TaskStatus } from '@/types';
import { isPast, isToday, parseISO, isValid } from 'date-fns';

export const TasksPage: React.FC = () => {
  const { tasks, subjects, openQuickModal, setTaskStatus } = useStudyOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [viewMode, setViewMode] = useState<TaskViewMode>('list');

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const taskId = params.get('taskId');
    if (taskId) {
      setTimeout(() => {
        const el = document.getElementById(`task-card-${taskId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'transition-all', 'duration-500');
          setTimeout(() => el.classList.remove('ring-2', 'ring-primary', 'ring-offset-2'), 2500);
        }
      }, 300);
    }
  }, [location.search, viewMode]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = t.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // Subject
      if (selectedSubjectId !== 'all' && t.subjectId !== selectedSubjectId) return false;

      // Status
      if (selectedStatus === 'pending') {
        if (t.status === 'completed' || t.status === 'cancelled') return false;
      } else if (selectedStatus === 'overdue') {
        if (t.status === 'completed' || t.status === 'cancelled') return false;
        try {
          const d = parseISO(t.dueDate);
          if (!isValid(d) || !isPast(d) || isToday(d)) return false;
        } catch {
          return false;
        }
      } else if (selectedStatus !== 'all' && t.status !== selectedStatus) {
        return false;
      }

      // Priority
      if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;

      return true;
    });
  }, [tasks, searchQuery, selectedSubjectId, selectedStatus, selectedPriority]);

  // Kanban status columns
  const kanbanColumns: { id: TaskStatus; label: string; bg: string; dot: string }[] = [
    { id: 'not_started', label: 'Não Iniciadas', bg: 'bg-slate-100/70', dot: 'bg-slate-400' },
    { id: 'in_progress', label: 'Em Andamento', bg: 'bg-blue-50/70', dot: 'bg-blue-500' },
    { id: 'waiting', label: 'Aguardando', bg: 'bg-amber-50/70', dot: 'bg-amber-500' },
    { id: 'completed', label: 'Concluídas', bg: 'bg-emerald-50/70', dot: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-primary" /> Atividades e Entregas ({filteredTasks.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie prazos, listas de exercícios, trabalhos práticos, artigos e entregas acadêmicas.
          </p>
        </div>

        <button
          onClick={() => openQuickModal('task')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Atividade</span>
        </button>
      </div>

      {/* Filter Bar */}
      <TaskFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSubjectId={selectedSubjectId}
        onSubjectChange={setSelectedSubjectId}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* View Mode 1: List */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="academic-card max-md:bg-transparent max-md:border-transparent max-md:shadow-none max-md:rounded-none max-md:p-4 p-16 text-center text-slate-400 text-xs">
              <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="font-semibold text-slate-600">Nenhuma atividade encontrada</p>
              <p className="mt-1">Tente ajustar os filtros ou cadastre uma nova tarefa.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={(t) => {
                    setEditingTask(t);
                    setTaskModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* View Mode 2: Kanban Columns */}
      {viewMode === 'kanban' && (
        <div className="flex overflow-x-auto gap-4 items-start pb-4 snap-x">
          {kanbanColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className="academic-card max-md:bg-transparent max-md:border-transparent max-md:shadow-none max-md:p-0 max-md:rounded-none p-3.5 flex flex-col max-h-[80vh] min-w-[280px] sm:min-w-[320px] max-w-[350px] shrink-0 snap-start transition-colors"
                onDragOver={(e) => {
                  e.preventDefault(); // Necessary to allow dropping
                  e.currentTarget.classList.add('ring-2', 'ring-primary', 'ring-opacity-50');
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('ring-2', 'ring-primary', 'ring-opacity-50');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('ring-2', 'ring-primary', 'ring-opacity-50');
                  const taskId = e.dataTransfer.getData('taskId');
                  if (taskId) {
                    setTaskStatus(taskId, col.id as TaskStatus);
                  }
                }}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                    <span className="font-bold text-xs text-slate-800">{col.label}</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.2 rounded-full">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
                  {colTasks.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs italic">Vazio</div>
                  ) : (
                    colTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        isKanbanMode={true}
                        onEdit={(t) => {
                          setEditingTask(t);
                          setTaskModalOpen(true);
                        }}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Mode 3: Matrix (Eisenhower: Urgent x Important) */}
      {viewMode === 'matrix' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quadrant 1: Urgent & High Priority */}
          <div className="academic-card max-md:bg-transparent max-md:shadow-none max-md:rounded-none max-md:px-0 max-md:border-x-transparent max-md:border-b-transparent p-4 border-t-4 border-t-rose-600">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <span className="font-bold text-xs text-rose-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" /> 1. Fazer Imediatamente (Alta Prioridade)
              </span>
            </div>
            <div className="space-y-2">
              {filteredTasks
                .filter((t) => t.priority === 'high' && t.status !== 'completed')
                .map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onEdit={(taskToEdit) => {
                      setEditingTask(taskToEdit);
                      setTaskModalOpen(true);
                    }}
                  />
                ))}
            </div>
          </div>

          {/* Quadrant 2: Important & Medium Priority */}
          <div className="academic-card max-md:bg-transparent max-md:shadow-none max-md:rounded-none max-md:px-0 max-md:border-x-transparent max-md:border-b-transparent p-4 border-t-4 border-t-amber-500">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <span className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" /> 2. Agendar / Planejar (Média Prioridade)
              </span>
            </div>
            <div className="space-y-2">
              {filteredTasks
                .filter((t) => t.priority === 'medium' && t.status !== 'completed')
                .map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onEdit={(taskToEdit) => {
                      setEditingTask(taskToEdit);
                      setTaskModalOpen(true);
                    }}
                  />
                ))}
            </div>
          </div>

          {/* Quadrant 3: Low Priority */}
          <div className="academic-card max-md:bg-transparent max-md:shadow-none max-md:rounded-none max-md:px-0 max-md:border-x-transparent max-md:border-b-transparent p-4 border-t-4 border-t-slate-400">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <span className="font-bold text-xs text-slate-800">3. Baixa Urgência / Leituras</span>
            </div>
            <div className="space-y-2">
              {filteredTasks
                .filter((t) => t.priority === 'low' && t.status !== 'completed')
                .map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onEdit={(taskToEdit) => {
                      setEditingTask(taskToEdit);
                      setTaskModalOpen(true);
                    }}
                  />
                ))}
            </div>
          </div>

          {/* Quadrant 4: Concluídas */}
          <div className="academic-card max-md:bg-transparent max-md:shadow-none max-md:rounded-none max-md:px-0 max-md:border-x-transparent max-md:border-b-transparent p-4 border-t-4 border-t-emerald-600">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <span className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 4. Finalizadas no Semestre
              </span>
            </div>
            <div className="space-y-2">
              {filteredTasks
                .filter((t) => t.status === 'completed')
                .map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onEdit={(taskToEdit) => {
                      setEditingTask(taskToEdit);
                      setTaskModalOpen(true);
                    }}
                  />
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        task={editingTask}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
      />
    </div>
  );
};
