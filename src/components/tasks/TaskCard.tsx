import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Clock,
  Play,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Task, TaskStatus } from '@/types';
import { useStudyOS } from '@/context/StudyOSContext';
import {
  taskStatusConfig,
  priorityConfig,
  taskTypeLabels,
  formatRelativeDate,
  formatMinutes,
} from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  isKanbanMode?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, isKanbanMode }) => {
  const { subjects, setTaskStatus, toggleChecklistItem, deleteTask, startPomodoro } = useStudyOS();
  const [expanded, setExpanded] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const navigate = useNavigate();

  const subject = subjects.find((s) => s.id === task.subjectId);
  const statusCfg = taskStatusConfig[task.status] || taskStatusConfig.not_started;
  const priorityCfg = priorityConfig[task.priority] || priorityConfig.medium;
  const typeInfo = taskTypeLabels[task.type] || { label: 'Atividade', icon: 'FileText' };

  const isCompleted = task.status === 'completed';
  const completedChecklistCount = task.checklist.filter((c) => c.completed).length;

  const handleToggleComplete = () => {
    setTaskStatus(task.id, isCompleted ? 'in_progress' : 'completed');
  };

  const handleStartFocus = () => {
    navigate('/foco', { state: { subjectId: task.subjectId, taskId: task.id } });
  };

  return (
    <div
      id={`task-card-${task.id}`}
      draggable={isKanbanMode}
      onDragStart={(e) => {
        if (isKanbanMode) {
          e.dataTransfer.setData('taskId', task.id);
          e.currentTarget.style.opacity = '0.5';
        }
      }}
      onDragEnd={(e) => {
        if (isKanbanMode) {
          e.currentTarget.style.opacity = '1';
        }
      }}
      className={`academic-card p-4 transition-all group ${
        isKanbanMode ? 'cursor-grab active:cursor-grabbing' : ''
      } ${isCompleted ? 'bg-slate-50/70 border-slate-200 opacity-80' : 'hover:border-slate-300'}`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggleComplete}
          className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
            isCompleted
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'border-slate-300 hover:border-emerald-500 bg-white'
          }`}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              {subject && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-bold shrink-0 mb-1"
                  style={{ color: subject.color || '#64748b' }}
                >
                  <span className="font-mono text-[9px] uppercase opacity-80">{subject.code}</span>
                  <span className="truncate">{subject.name}</span>
                </span>
              )}
            </div>

            {/* Quick Status Pill / Menu */}
            {!isKanbanMode && (
              <div className="relative shrink-0">
                <button
                  onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold border border-slate-200 rounded bg-white ${statusCfg.text} hover:bg-slate-50 transition-colors`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                  <span>{statusCfg.label}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {statusMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setStatusMenuOpen(false)} />
                    <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-30 text-xs">
                      {(['not_started', 'in_progress', 'waiting', 'completed', 'cancelled'] as TaskStatus[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => {
                            setTaskStatus(task.id, st);
                            setStatusMenuOpen(false);
                          }}
                          className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <span className={`w-2 h-2 rounded-full ${taskStatusConfig[st].dot}`} />
                          <span>{taskStatusConfig[st].label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <h3
            className={`font-semibold text-xs text-slate-900 ${
              isCompleted ? 'line-through text-slate-500' : ''
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center gap-2 flex-wrap mt-2.5">
            <span className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold border border-slate-200 rounded bg-white text-slate-500 shrink-0">
              {typeInfo.label}
            </span>
            <span
              className={`flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold border border-slate-200 rounded bg-white shrink-0 ${priorityCfg.text}`}
            >
              <span className="text-lg leading-none mt-[-2px]">•</span> {priorityCfg.label}
            </span>
          </div>

          {/* Metadata Bar */}
          <div className="flex items-end justify-between mt-3 pt-3 border-t border-slate-100 flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <span className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded text-[10px] text-slate-500 shrink-0">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span className={task.status !== 'completed' ? 'font-medium text-slate-700' : ''}>
                  {formatRelativeDate(task.dueDate)} {task.dueTime ? `às ${task.dueTime}` : ''}
                </span>
              </span>

              <span className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded text-[10px] text-slate-500 font-mono shrink-0">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>
                  {task.actualMinutes > 0 ? `${formatMinutes(task.actualMinutes)} / ` : ''}
                  {formatMinutes(task.estimatedMinutes)}
                </span>
              </span>

              {task.checklist.length > 0 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 hover:bg-slate-50 rounded text-[10px] text-slate-600 font-medium shrink-0 transition-colors"
                >
                  <Check className="w-3 h-3 text-slate-400" />
                  <span>
                    {completedChecklistCount}/{task.checklist.length} itens
                  </span>
                  {expanded ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
                </button>
              )}
            </div>

            {/* Quick Actions (Bottom Right) */}
            <div className="flex items-center gap-2 shrink-0 justify-end ml-auto">
              {!isCompleted && (
                <button
                  onClick={handleStartFocus}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-800 rounded font-semibold text-[10px] transition-colors"
                  title="Iniciar Pomodoro para esta tarefa"
                >
                  <Play className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                  <span>Focar</span>
                </button>
              )}

              {/* More Options Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded border border-transparent transition-colors"
                  title="Mais opções"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {moreMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setMoreMenuOpen(false)} />
                    <div className="absolute right-0 bottom-full mb-1 w-32 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-30 text-xs">
                      {onEdit && (
                        <button
                          onClick={() => { onEdit(task); setMoreMenuOpen(false); }}
                          className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>
                      )}
                      <button
                        onClick={() => { deleteTask(task.id); setMoreMenuOpen(false); }}
                        className="w-full px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Expanded Checklist */}
          {expanded && task.checklist.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 bg-slate-50 p-2.5 rounded-md">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Subtarefas / Checklist
              </div>
              {task.checklist.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleChecklistItem(task.id, item.id)}
                    className="w-3.5 h-3.5 text-primary rounded border-slate-300 focus:ring-primary"
                  />
                  <span className={item.completed ? 'line-through text-slate-400' : ''}>{item.title}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
