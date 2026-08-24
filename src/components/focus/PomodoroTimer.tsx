import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Settings,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  CheckSquare,
  CheckCheck,
  Target,
} from 'lucide-react';
import { useStudyOS } from '@/context/StudyOSContext';
import { useLocation } from 'react-router-dom';

export const PomodoroTimer: React.FC = () => {
  const {
    subjects,
    tasks,
    studyGoals,
    activePomodoro,
    startPomodoro,
    setPomodoroCycles,
    pausePomodoro,
    resumePomodoro,
    stopPomodoro,
    skipPomodoro,
    settings,
    updateSettings,
    openQuickModal,
  } = useStudyOS();

  const location = useLocation();
  const state = location.state as { subjectId?: string; studyGoalId?: string; taskId?: string } | null;

  const [selectedSubjectId, setSelectedSubjectId] = useState(
    state?.subjectId || activePomodoro.subjectId || subjects[0]?.id || ''
  );
  const [selectedTaskId, setSelectedTaskId] = useState(state?.taskId || activePomodoro.taskId || '');
  const [selectedGoalId, setSelectedGoalId] = useState(state?.studyGoalId || activePomodoro.studyGoalId || '');

  // Custom preset form state
  const [customFocus, setCustomFocus] = useState(settings.pomodoro.focusDuration || 25);
  const [customShortBreak, setCustomShortBreak] = useState(settings.pomodoro.shortBreakDuration || 5);
  const [customLongBreak, setCustomLongBreak] = useState(settings.pomodoro.longBreakDuration || 15);
  const [customCycles, setCustomCycles] = useState(activePomodoro.totalCycles || settings.pomodoro.longBreakInterval || 4);
  const [customPresetOpen, setCustomPresetOpen] = useState(false);

  // Sync custom preset form with current settings
  React.useEffect(() => {
    setCustomFocus(settings.pomodoro.focusDuration || 25);
    setCustomShortBreak(settings.pomodoro.shortBreakDuration || 5);
    setCustomLongBreak(settings.pomodoro.longBreakDuration || 15);
    setCustomCycles(activePomodoro.totalCycles || settings.pomodoro.longBreakInterval || 4);
  }, [settings.pomodoro, activePomodoro.totalCycles]);

  const currentSubject = subjects.find((s) => s.id === (activePomodoro.subjectId || selectedSubjectId));
  const currentTask = tasks.find((t) => t.id === (activePomodoro.taskId || selectedTaskId));
  const currentGoal = studyGoals.find((g) => g.id === (activePomodoro.studyGoalId || selectedGoalId));

  // Circular progress ring calculation
  const total = activePomodoro.totalDuration || 25 * 60;
  const current = activePomodoro.timeLeft;
  const progressRatio = total > 0 ? current / total : 0;
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const minutes = Math.floor(current / 60);
  const seconds = current % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Apenas salva as configurações do preset — NÃO inicia o timer
  const handleSelectPreset = (focusMins: number, breakMins: number, cyclesCount?: number) => {
    const cycles = cyclesCount || activePomodoro.totalCycles || settings.pomodoro.longBreakInterval || 4;
    updateSettings({
      pomodoro: {
        ...settings.pomodoro,
        focusDuration: focusMins,
        shortBreakDuration: breakMins,
        longBreakInterval: cycles,
      },
    });
    setPomodoroCycles(cycles);
  };

  // Salva configurações personalizadas — nunca inicia automaticamente
  const handleApplyCustomPreset = () => {
    const focusMins = Math.max(1, customFocus);
    const shortBreakMins = Math.max(1, customShortBreak);
    const longBreakMins = Math.max(1, customLongBreak);
    const cycles = Math.max(1, Math.min(12, customCycles));

    updateSettings({
      pomodoro: {
        ...settings.pomodoro,
        focusDuration: focusMins,
        shortBreakDuration: shortBreakMins,
        longBreakDuration: longBreakMins,
        longBreakInterval: cycles,
      },
    });
    setPomodoroCycles(cycles);
    setCustomPresetOpen(false);
  };

  const handleToggleTimer = () => {
    if (!activePomodoro.isActive) {
      startPomodoro({
        subjectId: selectedSubjectId || subjects[0]?.id,
        taskId: selectedTaskId || undefined,
        studyGoalId: selectedGoalId || undefined,
        durationMinutes: settings.pomodoro.focusDuration || 25,
        totalCycles: activePomodoro.totalCycles || settings.pomodoro.longBreakInterval || 4,
      });
    } else if (activePomodoro.isPaused) {
      resumePomodoro();
    } else {
      pausePomodoro();
    }
  };

  const activeSubjectTasks = tasks.filter(
    (t) => t.subjectId === (selectedSubjectId || subjects[0]?.id) && t.status !== 'completed'
  );
  const activeSubjectGoals = studyGoals.filter(
    (g) => g.subjectId === (selectedSubjectId || subjects[0]?.id) && g.status !== 'completed'
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Target Linking Box (Subject / Task / Study Goal) - TOP */}
      <div className="academic-card p-5">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" /> Vincular Foco a uma Disciplina ou Atividade
        </h3>
        {subjects.length === 0 ? (
          <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-600">Nenhuma disciplina cadastrada ainda para vincular o foco.</span>
            <button
              type="button"
              onClick={() => openQuickModal('subject')}
              className="px-3 py-1.5 bg-primary text-white font-semibold rounded-md shadow-sm"
            >
              + Cadastrar Disciplina
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Select Subject */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Disciplina *</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  setSelectedTaskId('');
                  setSelectedGoalId('');
                }}
                disabled={activePomodoro.isActive}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md font-medium text-slate-800 disabled:opacity-60"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Select Task */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Atividade Existente (Opcional)</label>
              <select
                value={selectedTaskId}
                onChange={(e) => {
                  setSelectedTaskId(e.target.value);
                  setSelectedGoalId('');
                }}
                disabled={activePomodoro.isActive}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-slate-700 disabled:opacity-60"
              >
                <option value="">Nenhuma (Foco livre ou geral)</option>
                {activeSubjectTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Study Goal */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Objetivo de Estudo (Opcional)</label>
              <select
                value={selectedGoalId}
                onChange={(e) => {
                  setSelectedGoalId(e.target.value);
                  setSelectedTaskId('');
                }}
                disabled={activePomodoro.isActive}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-slate-700 disabled:opacity-60"
              >
                <option value="">Nenhum específico</option>
                {activeSubjectGoals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Timer Card */}
      <div className="academic-card p-8 md:p-12 flex flex-col items-center justify-center relative overflow-hidden bg-white shadow-sm border border-[#E2E8F0]">
        {/* Preset Selector Header */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 bg-slate-100 p-1.5 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => {
              setCustomPresetOpen(false);
              handleSelectPreset(25, 5);
            }}
            className={`px-3 py-1.5 rounded-md transition-all ${
              settings.pomodoro.focusDuration === 25 && !customPresetOpen
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Clássico (25/5)
          </button>
          <button
            onClick={() => {
              setCustomPresetOpen(false);
              handleSelectPreset(50, 10);
            }}
            className={`px-3 py-1.5 rounded-md transition-all ${
              settings.pomodoro.focusDuration === 50 && !customPresetOpen
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Foco Profundo (50/10)
          </button>
          <button
            onClick={() => {
              setCustomPresetOpen(false);
              handleSelectPreset(90, 20);
            }}
            className={`px-3 py-1.5 rounded-md transition-all ${
              settings.pomodoro.focusDuration === 90 && !customPresetOpen
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Intenso (90/20)
          </button>
          <button
            onClick={() => setCustomPresetOpen(!customPresetOpen)}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              customPresetOpen
                ? 'bg-primary text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Personalizado</span>
          </button>
        </div>

        {/* Custom Preset Configuration Panel */}
        {customPresetOpen && (
          <div className="w-full max-w-xl mb-8 p-4 md:p-5 bg-slate-50/90 border border-slate-200 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-primary" /> Configurar Foco Personalizado
              </span>
              <span className="text-[11px] text-slate-500">Defina tempos e ciclos desejados</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Focus Duration */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Tempo de Foco</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={customFocus}
                    onChange={(e) => setCustomFocus(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900"
                  />
                  <span className="text-slate-500 text-[11px]">min</span>
                </div>
              </div>

              {/* Short Break */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Pausa Curta</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={customShortBreak}
                    onChange={(e) => setCustomShortBreak(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900"
                  />
                  <span className="text-slate-500 text-[11px]">min</span>
                </div>
              </div>

              {/* Long Break */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Pausa Longa</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={customLongBreak}
                    onChange={(e) => setCustomLongBreak(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900"
                  />
                  <span className="text-slate-500 text-[11px]">min</span>
                </div>
              </div>

              {/* Quantity of Cycles */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Qtd. de Ciclos</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={customCycles}
                    onChange={(e) => setCustomCycles(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900"
                  />
                  <span className="text-slate-500 text-[11px]">ciclos</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCustomPresetOpen(false)}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleApplyCustomPreset()}
                className="px-4 py-1.5 bg-primary hover:bg-slate-800 text-white rounded font-semibold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Aplicar Configurações</span>
              </button>
            </div>
          </div>
        )}

        {/* Current Active Context Info */}
        <div className="text-center mb-6 max-w-md">
          <div 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-bold mb-2 uppercase tracking-wider shadow-sm"
            style={{ color: currentSubject?.color || '#334155' }}
          >
            {currentSubject ? (
              <>
                <span className="font-mono text-[10px] opacity-80">{currentSubject.code}</span>
                <span className="truncate max-w-[200px]">{currentSubject.name}</span>
              </>
            ) : (
              <span className="text-slate-500">Selecione uma disciplina</span>
            )}
          </div>

          <h3 className="text-sm font-semibold text-slate-900 truncate">
            {currentTask?.title || currentGoal?.title || 'Foco livre na disciplina'}
          </h3>

          <div className="text-xs text-slate-500 mt-0.5">
            {activePomodoro.mode === 'focus'
              ? `Ciclo ${activePomodoro.currentCycle} de ${activePomodoro.totalCycles}`
              : activePomodoro.mode === 'short_break'
              ? '☕ Pausa Curta'
              : '🌴 Pausa Longa'}
          </div>
        </div>

        {/* Circular Countdown Gauge */}
        <div className="relative w-80 h-80 flex items-center justify-center my-2">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 300 300">
            {/* Background Track */}
            <circle
              cx="150"
              cy="150"
              r={radius}
              className="text-slate-100"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Progress Stroke */}
            <circle
              cx="150"
              cy="150"
              r={radius}
              stroke={
                activePomodoro.mode === 'focus'
                  ? currentSubject?.color || '#091426'
                  : '#10B981'
              }
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Time Countdown Typography */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-6xl font-extrabold font-mono tracking-tight text-slate-900 font-sans">
              {formattedTime}
            </span>
            <span className="text-xs uppercase font-bold tracking-widest text-slate-400 mt-2 font-mono">
              {activePomodoro.isActive && !activePomodoro.isPaused
                ? 'EM ANDAMENTO'
                : activePomodoro.isActive
                ? 'PAUSADO'
                : 'PRONTO PARA INICIAR'}
            </span>
          </div>
        </div>

        {/* Interactive Cycle Editor & Dots Indicator */}
        <div className="flex flex-col items-center gap-2 my-5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Ciclos de Foco:
            </span>
            {/* Quick cycles adjuster if not in active session */}
            {!activePomodoro.isActive ? (
              <div className="flex items-center bg-slate-100 border border-slate-200 rounded-md p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setPomodoroCycles(Math.max(1, (activePomodoro.totalCycles || 4) - 1))}
                  className="px-2 py-0.5 text-slate-600 hover:text-slate-900 font-bold hover:bg-slate-200 rounded"
                  title="Diminuir ciclos"
                >
                  -
                </button>
                <span className="px-2 font-mono font-bold text-slate-800">
                  {activePomodoro.totalCycles || 4} {activePomodoro.totalCycles === 1 ? 'ciclo' : 'ciclos'}
                </span>
                <button
                  type="button"
                  onClick={() => setPomodoroCycles(Math.min(12, (activePomodoro.totalCycles || 4) + 1))}
                  className="px-2 py-0.5 text-slate-600 hover:text-slate-900 font-bold hover:bg-slate-200 rounded"
                  title="Aumentar ciclos"
                >
                  +
                </button>
              </div>
            ) : (
              <span className="font-mono font-bold text-slate-700 text-xs">
                {activePomodoro.currentCycle} de {activePomodoro.totalCycles}
              </span>
            )}
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2 mt-1">
            {Array.from({ length: activePomodoro.totalCycles || 4 }).map((_, idx) => {
              const cycleNum = idx + 1;
              const isDone = cycleNum < activePomodoro.currentCycle;
              const isCurrent = cycleNum === activePomodoro.currentCycle;

              return (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all ${
                    isDone
                      ? 'bg-emerald-600'
                      : isCurrent
                      ? 'bg-primary ring-2 ring-primary/30 ring-offset-2 scale-110'
                      : 'bg-slate-200'
                  }`}
                  title={`Ciclo ${cycleNum} de ${activePomodoro.totalCycles}`}
                />
              );
            })}
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleTimer}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-lg text-sm font-bold text-white shadow-md transition-transform active:scale-95 ${
              activePomodoro.isActive && !activePomodoro.isPaused
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-primary hover:bg-slate-800'
            }`}
          >
            {activePomodoro.isActive && !activePomodoro.isPaused ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Pausar Foco</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>{activePomodoro.isPaused ? 'Continuar' : 'Iniciar Foco'}</span>
              </>
            )}
          </button>

          {activePomodoro.isActive && (
            <>
              <button
                onClick={skipPomodoro}
                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                title="Pular ciclo"
              >
                <SkipForward className="w-4 h-4" />
              </button>
              <button
                onClick={stopPomodoro}
                className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold"
                title="Cancelar / Reiniciar"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  );
};
