import React, { useState } from 'react';
import { CheckCircle2, Clock, Sparkles, Smile, Meh, Frown } from 'lucide-react';
import { useStudyOS } from '@/context/StudyOSContext';
import { SessionDifficulty } from '@/types';

export const PomodoroFinishModal: React.FC = () => {
  const { lastFinishedSession, submitPomodoroFinish, closeFinishModal, subjects, tasks, studyGoals } = useStudyOS();
  const [difficulty, setDifficulty] = useState<SessionDifficulty>('normal');
  const [notes, setNotes] = useState('');
  const [markCompleted, setMarkCompleted] = useState(false);

  if (!lastFinishedSession) return null;

  const subject = subjects.find((s) => s.id === lastFinishedSession.subjectId);
  const task = tasks.find((t) => t.id === lastFinishedSession.taskId);
  const goal = studyGoals.find((g) => g.id === lastFinishedSession.studyGoalId);

  const handleSave = () => {
    submitPomodoroFinish(difficulty, notes, markCompleted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-50">
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with celebration banner */}
        <div className="bg-emerald-600 text-white p-6 text-center relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-lg pointer-events-none" />
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2.5">
            <Sparkles className="w-6 h-6 text-amber-200 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">🍅 Pomodoro Concluído!</h2>
          <p className="text-emerald-100 text-xs mt-0.5">Excelente foco. Sua dedicação foi registrada com sucesso.</p>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Summary Box */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-slate-500 font-medium">
              <span>Disciplina:</span>
              <span className="font-semibold text-slate-800">{subject?.name || 'Geral'}</span>
            </div>

            {(task || goal) && (
              <div className="flex items-center justify-between text-slate-500 font-medium">
                <span>Atividade / Meta:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                  {task?.title || goal?.title}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-500 font-medium">
              <span>Tempo de Foco:</span>
              <div className="flex items-center gap-1 font-mono font-bold text-emerald-700">
                <Clock className="w-3.5 h-3.5" />
                <span>{lastFinishedSession.actualMinutes} minutos</span>
              </div>
            </div>
          </div>

          {/* Difficulty Perception */}
          <div>
            <label className="block font-semibold text-slate-800 mb-2">Como foi o nível de dificuldade?</label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setDifficulty('easy')}
                className={`py-2 px-3 rounded-lg border flex flex-col items-center gap-1 text-center transition-all ${
                  difficulty === 'easy'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Smile className="w-4 h-4 text-emerald-600" />
                <span>Fácil</span>
              </button>

              <button
                type="button"
                onClick={() => setDifficulty('normal')}
                className={`py-2 px-3 rounded-lg border flex flex-col items-center gap-1 text-center transition-all ${
                  difficulty === 'normal'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Meh className="w-4 h-4 text-blue-600" />
                <span>Normal</span>
              </button>

              <button
                type="button"
                onClick={() => setDifficulty('hard')}
                className={`py-2 px-3 rounded-lg border flex flex-col items-center gap-1 text-center transition-all ${
                  difficulty === 'hard'
                    ? 'border-rose-600 bg-rose-50 text-rose-900 font-bold ring-1 ring-rose-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Frown className="w-4 h-4 text-rose-600" />
                <span>Difícil</span>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">Anotações da Sessão (Opcional)</label>
            <textarea
              rows={2}
              placeholder="Ex: Consegui resolver até o exercício 6; tive dúvida na fórmula de Lagrange..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-xs"
            />
          </div>

          {/* Complete Task Checkbox */}
          {(task || goal) && (
            <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-md border border-slate-200 cursor-pointer hover:bg-slate-100/70">
              <input
                type="checkbox"
                checked={markCompleted}
                onChange={(e) => setMarkCompleted(e.target.checked)}
                className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
              />
              <span className="font-semibold text-slate-800">
                Marcar {task ? 'esta atividade' : 'este objetivo'} como concluído(a)
              </span>
            </label>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeFinishModal}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md font-medium text-xs transition-colors"
            >
              Ignorar registro
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-slate-800 text-white font-semibold text-xs rounded-md shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar e Atualizar Métricas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
