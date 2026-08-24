import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckSquare } from 'lucide-react';
import { Task, TaskType, Priority, TaskStatus } from '@/types';
import { useStudyOS } from '@/context/StudyOSContext';

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose }) => {
  const { subjects, updateTask, addTask } = useStudyOS();

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TaskType>('assignment');
  const [status, setStatus] = useState<TaskStatus>('not_started');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('23:59');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [weight, setWeight] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setSubjectId(task.subjectId);
      setDescription(task.description || '');
      setType(task.type);
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate);
      setDueTime(task.dueTime || '23:59');
      setEstimatedMinutes(task.estimatedMinutes);
      setWeight(task.weight);
      setNotes(task.notes || '');
      setChecklist(task.checklist || []);
    } else {
      setTitle('');
      setSubjectId(subjects[0]?.id || '');
      setDescription('');
      setType('assignment');
      setStatus('not_started');
      setPriority('medium');
      setDueDate(new Date().toISOString().split('T')[0]);
      setDueTime('23:59');
      setEstimatedMinutes(60);
      setWeight(undefined);
      setNotes('');
      setChecklist([]);
    }
  }, [task, subjects, isOpen]);

  if (!isOpen) return null;

  const handleAddChecklistItem = () => {
    if (newChecklistText.trim()) {
      setChecklist([
        ...checklist,
        { id: `chk-${Date.now()}`, title: newChecklistText.trim(), completed: false },
      ]);
      setNewChecklistText('');
    }
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(checklist.filter((item) => item.id !== id));
  };

  const handleToggleChecklist = (id: string) => {
    setChecklist(
      checklist.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (task) {
      updateTask(task.id, {
        title,
        subjectId,
        description,
        type,
        status,
        priority,
        dueDate,
        dueTime,
        estimatedMinutes: Number(estimatedMinutes) || 60,
        weight,
        notes,
        checklist,
      });
    } else {
      addTask({
        title,
        subjectId: subjectId || subjects[0]?.id,
        description,
        type,
        status,
        priority,
        dueDate,
        dueTime,
        estimatedMinutes: Number(estimatedMinutes) || 60,
        weight,
        notes,
        checklist,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-50">
      <div
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              {task ? 'Editar Atividade' : 'Nova Atividade'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Título da Atividade *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Disciplina *</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white"
              >
                <option value="exercise">Lista de Exercícios</option>
                <option value="assignment">Trabalho</option>
                <option value="project">Projeto</option>
                <option value="reading">Leitura</option>
                <option value="article">Artigo</option>
                <option value="lab">Atividade Prática</option>
                <option value="presentation">Apresentação</option>
                <option value="exam_prep">Estudo para Prova</option>
                <option value="group_work">Trabalho em Grupo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white"
              >
                <option value="not_started">Não iniciada</option>
                <option value="in_progress">Em andamento</option>
                <option value="waiting">Aguardando</option>
                <option value="completed">Concluída</option>
                <option value="overdue">Atrasada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Prioridade</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estimativa (min)</label>
              <input
                type="number"
                min="5"
                step="15"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Data de Vencimento *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Horário</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md"
              />
            </div>
          </div>

          {/* Checklist */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subtarefas / Checklist</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Novo item da lista..."
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-md text-xs"
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-md text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </button>
            </div>

            {checklist.length > 0 && (
              <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-md border border-slate-200">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-0.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleChecklist(item.id)}
                        className="w-3.5 h-3.5 text-primary rounded border-slate-300"
                      />
                      <span className={item.completed ? 'line-through text-slate-400' : 'text-slate-700'}>
                        {item.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Descrição</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md font-medium text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-slate-800 text-white rounded-md font-semibold text-xs shadow-sm"
            >
              {task ? 'Salvar Alterações' : 'Criar Atividade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
