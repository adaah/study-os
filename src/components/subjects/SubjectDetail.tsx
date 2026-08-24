import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  User,
  Mail,
  Calendar,
  MapPin,
  Clock,
  CheckSquare,
  GraduationCap,
  Layers,
  FileText,
  Link as LinkIcon,
  History,
  Plus,
  Play,
  CheckCircle2,
  CircleDot,
  Circle,
  RotateCw,
  ExternalLink,
  Trash2,
  Edit2,
  AlertCircle,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useStudyOS } from '@/context/StudyOSContext';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskModal } from '@/components/tasks/TaskModal';
import { Task, TopicStatus, MasteryLevel } from '@/types';
import {
  formatMinutes,
  formatDate,
  formatRelativeDate,
  calculateSubjectGrade,
  topicStatusConfig,
  masteryConfig,
} from '@/lib/utils';

export const SubjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    subjects,
    tasks,
    assessments,
    topics,
    studyGoals,
    studySessions,
    materials,
    links,
    notes,
    openQuickModal,
    setTopicStatus,
    updateTopic,
    deleteTopic,
    deleteAssessment,
    updateAssessment,
    deleteMaterial,
    deleteLink,
    deleteNote,
    startPomodoro,
    updateSubject,
  } = useStudyOS();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'tasks' | 'topics' | 'assessments' | 'resources' | 'history'
  >('overview');

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  // Edit Subject State
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [editedSubject, setEditedSubject] = useState({
    code: '',
    name: '',
    description: '',
    targetHoursWeekly: 0,
    professor: '',
    email: '',
    schedule: '',
    room: '',
    color: ''
  });
  const [editingGradeAssId, setEditingGradeAssId] = useState<string | null>(null);
  const [tempGradeInput, setTempGradeInput] = useState<string>('');

  const subject = subjects.find((s) => s.id === id);

  if (!subject) {
    return (
      <div className="py-20 text-center text-slate-500">
        <p className="text-base font-semibold">Disciplina não encontrada.</p>
        <button
          onClick={() => navigate('/disciplinas')}
          className="mt-3 px-4 py-2 bg-primary text-white rounded-md text-xs font-semibold"
        >
          Voltar para Disciplinas
        </button>
      </div>
    );
  }

  // Filter entities for this subject
  const subjectTasks = tasks.filter((t) => t.subjectId === subject.id);
  const subjectAssessments = assessments.filter((a) => a.subjectId === subject.id);
  const subjectTopics = topics.filter((t) => t.subjectId === subject.id).sort((a, b) => a.order - b.order);
  const subjectGoals = studyGoals.filter((g) => g.subjectId === subject.id);
  const subjectSessions = studySessions.filter((s) => s.subjectId === subject.id);
  const subjectMaterials = materials.filter((m) => m.subjectId === subject.id);
  const subjectLinks = links.filter((l) => l.subjectId === subject.id);
  const subjectNotes = notes.filter((n) => n.subjectId === subject.id);

  // Metrics
  const completedTasks = subjectTasks.filter((t) => t.status === 'completed');
  const pendingTasks = subjectTasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled');
  const studiedTopics = subjectTopics.filter((t) => t.status === 'studied');
  const totalMinutes = subjectSessions.reduce((acc, s) => acc + (s.actualMinutes || 0), 0);
  const totalPomodoros = subjectSessions.reduce((acc, s) => acc + (s.pomodoroCount || 0), 0);
  const gradeInfo = calculateSubjectGrade(subjectAssessments);

  const totalItems = (subjectTasks.length || 1) + (subjectTopics.length || 1);
  const completedItems = completedTasks.length + studiedTopics.length;
  const progressPercent = Math.min(100, Math.round((completedItems / totalItems) * 100));

  const handleStartSubjectFocus = () => {
    navigate('/foco', { state: { subjectId: subject.id } });
  };

  const handleSaveGrade = (assId: string) => {
    const val = parseFloat(tempGradeInput);
    if (!isNaN(val)) {
      updateAssessment(assId, { grade: Math.max(0, Math.min(10, val)) });
    } else {
      updateAssessment(assId, { grade: null });
    }
    setEditingGradeAssId(null);
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-6 max-md:bg-slate-50/50 min-h-screen max-md:px-4 max-md:pt-4">
      {/* Header and Post-it Row */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* Left Column - Subject Header Banner */}
        <div className="flex-1 min-w-0">
          <div className="academic-card max-md:bg-transparent max-md:border-transparent max-md:shadow-none max-md:px-0 max-md:rounded-none max-md:py-2 p-6 h-full">
          <div className="flex flex-col gap-5">
            {isEditingSubject ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Código</label>
                    <input type="text" value={editedSubject.code} onChange={e => setEditedSubject({...editedSubject, code: e.target.value})} className="w-full text-xs p-2 border border-slate-200 rounded" />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Nome da Disciplina</label>
                    <input type="text" value={editedSubject.name} onChange={e => setEditedSubject({...editedSubject, name: e.target.value})} className="w-full text-xs p-2 border border-slate-200 rounded" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Meta Semanal (Horas)</label>
                    <input type="number" min="1" value={editedSubject.targetHoursWeekly} onChange={e => setEditedSubject({...editedSubject, targetHoursWeekly: Number(e.target.value)})} className="w-full text-xs p-2 border border-slate-200 rounded" />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Cor</label>
                    <input type="color" value={editedSubject.color} onChange={e => setEditedSubject({...editedSubject, color: e.target.value})} className="h-8 p-0 border border-slate-200 rounded block" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Descrição / Ementa (Opcional)</label>
                  <textarea value={editedSubject.description} onChange={e => setEditedSubject({...editedSubject, description: e.target.value})} className="w-full text-xs p-2 border border-slate-200 rounded h-16 resize-none" />
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between gap-4 mb-1.5">
                  <div className="flex items-center gap-2" style={{ color: subject.color }}>
                    <span className="text-xs font-bold uppercase tracking-wider font-sans">
                      {subject.code}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      Meta: {subject.targetHoursWeekly}h semanais
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setEditedSubject({
                        code: subject.code,
                        name: subject.name,
                        description: subject.description || '',
                        targetHoursWeekly: subject.targetHoursWeekly,
                        professor: subject.professor || '',
                        email: subject.email || '',
                        schedule: subject.schedule || '',
                        room: subject.room || '',
                        color: subject.color
                      });
                      setIsEditingSubject(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-primary bg-slate-50 hover:bg-slate-100 rounded transition-colors flex items-center justify-center shrink-0"
                    title="Editar informações da disciplina"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: subject.color }}>{subject.name}</h1>
                {subject.description && (
                  <p className="text-xs text-slate-600 mt-2 max-w-2xl">{subject.description}</p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div>
              {isEditingSubject ? (
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      updateSubject(subject.id, editedSubject);
                      setIsEditingSubject(false);
                    }}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md shadow-sm transition-colors flex-1 sm:flex-none"
                  >
                    Salvar Alterações
                  </button>
                  <button
                    onClick={() => setIsEditingSubject(false)}
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-md transition-colors flex-1 sm:flex-none"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleStartSubjectFocus}
                  className="group flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold text-xs transition-all border border-slate-200 hover:border-slate-300 w-full sm:w-auto shadow-sm bg-white"
                  style={{ color: subject.color }}
                >
                  <div className="p-1 rounded-full bg-slate-50 group-hover:bg-slate-100 transition-colors">
                    <Play className="w-3.5 h-3.5" style={{ fill: subject.color }} />
                  </div>
                  <span>Estudar Esta Disciplina</span>
                </button>
              )}
            </div>

            {/* Meta Grid */}
            <div className="pt-5 mt-2 border-t border-slate-100 text-xs space-y-5">
              {isEditingSubject ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Professor(a)</label>
                    <input type="text" value={editedSubject.professor} onChange={e => setEditedSubject({...editedSubject, professor: e.target.value})} className="w-full text-xs p-2 border border-slate-200 rounded" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Contato</label>
                    <input type="text" value={editedSubject.email} onChange={e => setEditedSubject({...editedSubject, email: e.target.value})} className="w-full text-xs p-2 border border-slate-200 rounded" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Horário</label>
                    <input type="text" value={editedSubject.schedule} onChange={e => setEditedSubject({...editedSubject, schedule: e.target.value})} className="w-full text-xs p-2 border border-slate-200 rounded" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Local / Sala</label>
                    <input type="text" value={editedSubject.room} onChange={e => setEditedSubject({...editedSubject, room: e.target.value})} className="w-full text-xs p-2 border border-slate-200 rounded" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Info cols - 2x2 Layout */}
                  <div className="flex items-start gap-2.5 min-w-0">
                    <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Professor(a)</span>
                      <span className="font-semibold text-slate-800 break-words leading-tight text-xs">{subject.professor || '-'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 min-w-0">
                    <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Contato</span>
                      <span className="font-semibold text-slate-800 break-words leading-tight text-xs">{subject.email || 'Não informado'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 min-w-0">
                    <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Horário</span>
                      <span className="font-semibold text-slate-800 break-words leading-tight text-xs">{subject.schedule || '-'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 min-w-0">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Local / Sala</span>
                      <span className="font-semibold text-slate-800 break-words leading-tight text-xs">{subject.room || 'A definir'}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-slate-100">
                {/* Stats cols */}
                <div className="flex flex-col items-center justify-center text-center gap-1 p-3 bg-transparent border border-dashed border-slate-200/60 rounded-lg min-w-0">
                  <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-0.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500/80" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Progresso Geral</span>
                  </div>
                  <span className="font-bold text-slate-800 font-sans text-[15px]">{progressPercent}%</span>
                </div>
                
                <div className="flex flex-col items-center justify-center text-center gap-1 p-3 bg-transparent border border-dashed border-slate-200/60 rounded-lg min-w-0">
                  <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-0.5">
                    <Clock className="w-3.5 h-3.5 text-blue-500/80" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Tempo Dedicado</span>
                  </div>
                  <span className="font-bold text-slate-800 font-sans text-[15px]">{formatMinutes(totalMinutes)}</span>
                </div>

                <div className="flex flex-col items-center justify-center text-center gap-1 p-3 bg-transparent border border-dashed border-slate-200/60 rounded-lg min-w-0">
                  <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-0.5">
                    <RotateCw className="w-3.5 h-3.5 text-purple-500/80" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Pomodoros</span>
                  </div>
                  <span className="font-bold text-slate-800 font-sans text-[15px]">{totalPomodoros} ciclos</span>
                </div>

                <div className="flex flex-col items-center justify-center text-center gap-1 p-3 bg-transparent border border-dashed border-slate-200/60 rounded-lg min-w-0">
                  <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-0.5">
                    <CheckSquare className="w-3.5 h-3.5 text-amber-500/80" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Pendências</span>
                  </div>
                  <span className="font-bold text-slate-800 font-sans text-[15px]">{pendingTasks.length} de {subjectTasks.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
        
        {/* Right Column - Side Panel (Notes Post-it) */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-[#FEF9C3]/80 border border-[#FEF08A] rounded-xl shadow-sm flex flex-col relative h-full min-h-[250px] overflow-hidden">
            {/* Post-it Header */}
            <div className="p-4 border-b border-[#FEF08A]/50 flex items-center justify-between bg-[#FEF08A]/30">
              <h2 className="text-xs font-bold text-yellow-900 uppercase tracking-wider flex items-center gap-2">
                <Edit2 className="w-3.5 h-3.5" /> Anotações Rápidas
              </h2>
              <button
                onClick={() => openQuickModal('note', subject.id)}
                className="flex items-center gap-1 text-[10px] font-bold text-yellow-800 hover:text-yellow-950 uppercase tracking-wider"
              >
                <Plus className="w-3 h-3" /> Nova
              </button>
            </div>

            {/* Post-it Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {subjectNotes.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-yellow-800/60 text-xs italic">
                  <p>Nenhuma anotação.</p>
                  <p className="mt-1">Use este espaço para rascunhos e resumos.</p>
                </div>
              ) : (
                subjectNotes.map((note) => (
                  <div key={note.id} className="relative group">
                    <div className="flex flex-col gap-1.5 pb-3 border-b border-yellow-200/50 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-yellow-950 text-xs leading-tight">{note.title}</h3>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-yellow-700 hover:text-rose-600 transition-opacity"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="prose prose-sm max-w-none text-yellow-900/90 whitespace-pre-wrap font-sans text-[11px] leading-snug">
                        {note.content}
                      </div>
                      <span className="text-[9px] font-sans text-yellow-700/70 mt-1">{formatDate(note.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center border-b border-slate-200 overflow-x-auto space-x-1 text-xs select-none">
        {[
          { key: 'overview', label: 'Visão Geral', icon: BookOpen },
          { key: 'tasks', label: `Atividades (${subjectTasks.length})`, icon: CheckSquare },
          { key: 'topics', label: `Conteúdos / Ementa (${studiedTopics.length}/${subjectTopics.length})`, icon: Layers },
          { key: 'assessments', label: `Avaliações & Notas (${subjectAssessments.length})`, icon: GraduationCap },
          { key: 'resources', label: `Recursos (${subjectMaterials.length + subjectLinks.length})`, icon: FileText },
          { key: 'history', label: `Histórico de Foco (${subjectSessions.length})`, icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-primary text-primary bg-white rounded-t'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Next Deadlines & Tasks */}
            <div className="academic-card max-md:bg-transparent max-md:border-transparent max-md:shadow-none max-md:px-0 max-md:rounded-none max-md:py-2 p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-blue-600" /> Próximas Entregas
                </h3>
                <button
                  onClick={() => openQuickModal('task', subject.id)}
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Nova
                </button>
              </div>

              {pendingTasks.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  Nenhuma atividade pendente cadastrada.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pendingTasks.slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-2 text-xs max-md:bg-transparent max-md:border-b max-md:border-dashed max-md:border-slate-200/60 max-md:border-x-0 max-md:border-t-0 max-md:shadow-none max-md:rounded-none max-md:px-0 max-md:py-3 max-md:last:border-b-0"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{t.title}</div>
                        <div className="text-[11px] text-slate-500">
                          Prazo: {formatRelativeDate(t.dueDate)} • {formatMinutes(t.estimatedMinutes)}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          navigate('/foco', { state: { subjectId: subject.id, taskId: t.id } });
                        }}
                        className="p-1.5 bg-white hover:bg-primary hover:text-white rounded border border-slate-200 text-slate-700"
                        title="Iniciar Pomodoro"
                      >
                        <Play className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Next Assessments */}
            <div className="academic-card max-md:bg-transparent max-md:border-transparent max-md:shadow-none max-md:px-0 max-md:rounded-none max-md:py-2 p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-rose-600" /> Avaliações Cadastradas
                </h3>
                <button
                  onClick={() => openQuickModal('assessment', subject.id)}
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Nova
                </button>
              </div>

              {subjectAssessments.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  Nenhuma avaliação cadastrada.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {subjectAssessments.map((a) => (
                    <div
                      key={a.id}
                      className="p-2.5 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-2 text-xs max-md:bg-transparent max-md:border-b max-md:border-dashed max-md:border-slate-200/60 max-md:border-x-0 max-md:border-t-0 max-md:shadow-none max-md:rounded-none max-md:px-0 max-md:py-3 max-md:last:border-b-0"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{a.title}</div>
                        <div className="text-[11px] text-slate-500">
                          Data: {formatDate(a.date)} • Peso: {a.weight}%
                        </div>
                      </div>
                      {a.grade !== null && a.grade !== undefined ? (
                        <span className="text-xs font-bold text-emerald-700 font-sans bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {a.grade.toFixed(1)} / 10
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          Pendente
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Syllabus topics summary */}
          <div className="academic-card max-md:bg-transparent max-md:border-transparent max-md:shadow-none max-md:px-0 max-md:rounded-none max-md:py-2 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-violet-600" /> Mapa de Conteúdos da Disciplina
              </h3>
              <button
                onClick={() => setActiveTab('topics')}
                className="text-xs text-primary font-semibold hover:underline"
              >
                Ver todos ({subjectTopics.length}) →
              </button>
            </div>

            <div className="space-y-2">
              {subjectTopics.slice(0, 5).map((topic) => {
                const cfg = topicStatusConfig[topic.status];
                return (
                  <div
                    key={topic.id}
                    className="p-2.5 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-2 text-xs max-md:bg-transparent max-md:border-b max-md:border-dashed max-md:border-slate-200/60 max-md:border-x-0 max-md:border-t-0 max-md:shadow-none max-md:rounded-none max-md:px-0 max-md:py-3 max-md:last:border-b-0"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-sans text-[10px] text-slate-400 font-bold">#{topic.order}</span>
                      <span className="font-semibold text-slate-900">{topic.title}</span>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Atividades e Entregas da Disciplina</h2>
            <button
              onClick={() => openQuickModal('task', subject.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-md text-xs font-semibold shadow-sm hover:bg-slate-800"
            >
              <Plus className="w-3.5 h-3.5" /> Nova Atividade
            </button>
          </div>

          {subjectTasks.length === 0 ? (
            <div className="academic-card max-md:bg-transparent max-md:border-transparent max-md:shadow-none max-md:px-0 max-md:rounded-none max-md:py-2 p-12 text-center text-slate-400 text-xs">
              <p>Nenhuma atividade cadastrada para esta disciplina.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {subjectTasks.map((t) => (
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
          )}
        </div>
      )}

      {/* Tab 3: Topics / Syllabus Map */}
      {activeTab === 'topics' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Mapa de Conteúdos & Ementa</h2>
              <p className="text-[11px] text-slate-500">
                Acompanhe o domínio de cada assunto e marque o progresso de estudo.
              </p>
            </div>
            <button
              onClick={() => openQuickModal('topic', subject.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-md text-xs font-semibold shadow-sm hover:bg-slate-800"
            >
              <Plus className="w-3.5 h-3.5" /> Novo Conteúdo
            </button>
          </div>

          {subjectTopics.length === 0 ? (
            <div className="academic-card max-md:bg-transparent max-md:border-transparent max-md:shadow-none max-md:px-0 max-md:rounded-none max-md:py-2 p-12 text-center text-slate-400 text-xs">
              <p>Nenhum conteúdo cadastrado na ementa.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {subjectTopics.map((topic) => {
                const statusCfg = topicStatusConfig[topic.status];
                const mastery = masteryConfig[topic.mastery];

                return (
                  <div
                    key={topic.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs max-md:bg-transparent max-md:border-b max-md:border-dashed max-md:border-slate-200/60 max-md:px-0 max-md:py-4 max-md:last:border-b-0"
                  >
                    <div className="flex items-start gap-3 w-full sm:w-auto min-w-0">
                      {/* Topic Status Toggle Icon */}
                      <button
                        onClick={() => {
                          const nextStatus: Record<TopicStatus, TopicStatus> = {
                            not_studied: 'in_study',
                            in_study: 'studied',
                            studied: 'review',
                            review: 'not_studied',
                          };
                          setTopicStatus(topic.id, nextStatus[topic.status]);
                        }}
                        className="mt-0.5 p-1 rounded hover:bg-slate-100 text-slate-700 shrink-0"
                        title="Clique para avançar o estado de estudo"
                      >
                        {topic.status === 'studied' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                        {topic.status === 'in_study' && <CircleDot className="w-5 h-5 text-blue-600" />}
                        {topic.status === 'review' && <RotateCw className="w-5 h-5 text-amber-600" />}
                        {topic.status === 'not_studied' && <Circle className="w-5 h-5 text-slate-300" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2 flex-wrap">
                          <span className="font-sans text-[10px] font-bold text-slate-400 mt-0.5 shrink-0">#{topic.order}</span>
                          <h4 className="font-semibold text-slate-900 break-words leading-snug">{topic.title}</h4>
                        </div>
                        {topic.description && (
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed break-words">{topic.description}</p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap mt-2 text-[11px] text-slate-500">
                          <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${statusCfg.badge}`}>
                            {statusCfg.label}
                          </span>
                          <span className="hidden sm:inline text-slate-300">•</span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">
                            {formatMinutes(topic.estimatedMinutes)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mastery Level and Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center max-md:w-full max-md:justify-between max-md:mt-3 max-md:pl-9">
                      <select
                        value={topic.mastery}
                        onChange={(e) => updateTopic(topic.id, { mastery: e.target.value as MasteryLevel })}
                        className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="beginner">Iniciante</option>
                        <option value="intermediate">Intermediário</option>
                        <option value="advanced">Avançado</option>
                        <option value="mastered">Dominado</option>
                      </select>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            navigate('/foco', { state: { subjectId: subject.id, studyGoalId: topic.id } });
                          }}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded border border-emerald-200/50 transition-colors"
                          title="Preparar Pomodoro para este tópico"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>

                        <button
                          onClick={() => deleteTopic(topic.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Assessments & Grades */}
      {activeTab === 'assessments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Avaliações & Composição de Nota</h2>
              <p className="text-[11px] text-slate-500">
                Cadastre notas e simule o desempenho necessário para aprovação.
              </p>
            </div>
            <button
              onClick={() => openQuickModal('assessment', subject.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-md text-xs font-semibold shadow-sm hover:bg-slate-800"
            >
              <Plus className="w-3.5 h-3.5" /> Nova Avaliação
            </button>
          </div>

          {/* Grade Summary Box */}
          <div className="academic-card max-md:bg-transparent max-md:border-transparent max-md:shadow-none max-md:px-0 max-md:rounded-none max-md:py-2 p-5 bg-gradient-to-br from-slate-50 to-white">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Média Atual</div>
                <div className="text-2xl font-extrabold font-sans text-slate-900">
                  {gradeInfo.currentAverage.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 10</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Pontos Acumulados</div>
                <div className="text-2xl font-extrabold font-sans text-emerald-700">
                  {gradeInfo.currentAccumulated.toFixed(1)}{' '}
                  <span className="text-xs font-normal text-slate-400">/ {gradeInfo.gradedWeight}% avaliados</span>
                </div>
              </div>

              <div className="sm:col-span-2 p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                  <TrendingUp className="w-4 h-4 text-primary" /> Projeção de Aprovação
                </div>
                {gradeInfo.neededGradeOnRemaining !== null ? (
                  <p className="text-xs text-slate-600">
                    Para atingir a média <strong>7.0</strong>, você precisa de uma média de{' '}
                    <strong className="text-primary font-sans font-bold">
                      {gradeInfo.neededGradeOnRemaining.toFixed(1)}
                    </strong>{' '}
                    nas avaliações restantes ({gradeInfo.remainingWeight}% da nota).
                  </p>
                ) : (
                  <p className="text-xs text-slate-600">Todas as avaliações já foram concluídas e lançadas!</p>
                )}
              </div>
            </div>
          </div>

          {/* Assessments List */}
          <div className="academic-card max-md:bg-transparent max-md:border-transparent max-md:shadow-none max-md:px-0 max-md:rounded-none max-md:py-2">
            
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr_auto] gap-4 p-3 bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider rounded-t-xl">
              <div>Avaliação</div>
              <div>Tipo</div>
              <div>Data</div>
              <div>Peso</div>
              <div>Nota Obtida</div>
              <div className="text-right">Ações</div>
            </div>

            <div className="divide-y divide-slate-100 max-md:divide-y max-md:divide-dashed max-md:divide-slate-200/60">
              {subjectAssessments.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs italic">
                  Nenhuma avaliação cadastrada para esta disciplina.
                </div>
              ) : (
                subjectAssessments.map((a) => (
                  <div key={a.id} className="p-3 max-md:px-0 max-md:py-4 flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1.5fr_auto] md:items-center gap-3 hover:bg-slate-50/80 transition-colors">
                    
                    {/* Title & Desc */}
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="font-semibold text-slate-900 break-words leading-snug">{a.title}</div>
                      {a.description && <div className="text-[11px] text-slate-500 break-words leading-relaxed">{a.description}</div>}
                    </div>

                    {/* Meta row for mobile */}
                    <div className="flex items-center gap-2 flex-wrap text-[11px] md:contents">
                      <div className="md:hidden font-bold text-slate-400 uppercase text-[9px] shrink-0">Tipo:</div>
                      <div className="capitalize text-slate-600 bg-slate-100 md:bg-transparent px-2 md:px-0 py-0.5 rounded font-medium">{a.type}</div>
                      
                      <span className="md:hidden text-slate-300 shrink-0">•</span>
                      <div className="md:hidden font-bold text-slate-400 uppercase text-[9px] shrink-0">Data:</div>
                      <div className="font-sans text-slate-600">{formatDate(a.date)}</div>
                      
                      <span className="md:hidden text-slate-300 shrink-0">•</span>
                      <div className="md:hidden font-bold text-slate-400 uppercase text-[9px] shrink-0">Peso:</div>
                      <div className="font-sans font-semibold text-slate-700 bg-slate-100 md:bg-transparent px-2 md:px-0 py-0.5 rounded">{a.weight}%</div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between gap-3 mt-1 md:mt-0 md:contents">
                      
                      {/* Grade Input/Button */}
                      <div className="flex items-center gap-2">
                        <span className="md:hidden text-[10px] uppercase font-bold text-slate-400 shrink-0">Nota:</span>
                        {editingGradeAssId === a.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              placeholder="0-10"
                              value={tempGradeInput}
                              onChange={(e) => setTempGradeInput(e.target.value)}
                              className="w-16 px-2 py-1 border border-primary rounded text-xs font-sans font-bold"
                            />
                            <button
                              onClick={() => handleSaveGrade(a.id)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] transition-colors"
                            >
                              Salvar
                            </button>
                          </div>
                        ) : a.grade !== null && a.grade !== undefined ? (
                          <button
                            onClick={() => {
                              setEditingGradeAssId(a.id);
                              setTempGradeInput(a.grade?.toString() || '');
                            }}
                            className="font-sans font-bold text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded border border-emerald-200 transition-colors"
                            title="Clique para editar nota"
                          >
                            {a.grade.toFixed(1)}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingGradeAssId(a.id);
                              setTempGradeInput('');
                            }}
                            className="text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded transition-colors"
                          >
                            + Lançar Nota
                          </button>
                        )}
                      </div>

                      {/* Delete */}
                      <div className="md:text-right">
                        <button
                          onClick={() => deleteAssessment(a.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Excluir avaliação"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Resources (Materials & Links) */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          {/* Materiais */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Materiais Didáticos & Apostilas</h2>
              <button
                onClick={() => openQuickModal('material', subject.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-md text-xs font-semibold shadow-sm hover:bg-slate-800"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Material
              </button>
            </div>

            {subjectMaterials.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs italic">
                <p>Nenhum material cadastrado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-md:gap-0">
                {subjectMaterials.map((mat) => (
                  <div key={mat.id} className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs max-md:bg-transparent max-md:border-b max-md:border-dashed max-md:border-slate-200/60 max-md:px-0 max-md:py-5 max-md:last:border-b-0 hover:bg-slate-50/50 transition-colors rounded-lg border border-slate-200">
                    
                    <div className="flex items-start gap-3 min-w-0 w-full sm:w-auto">
                      <div className="p-2 bg-slate-100 rounded shrink-0 text-slate-500 mt-0.5">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-slate-900 break-words leading-snug">{mat.title}</h4>
                        <div className="mt-1.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">{mat.category || 'Geral'}</span>
                        </div>
                        {mat.notes && <p className="text-[11px] text-slate-600 mt-2 leading-relaxed break-words">{mat.notes}</p>}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between gap-3 max-md:w-full max-md:mt-1 max-md:pl-11">
                      <a
                        href={mat.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Acessar
                      </a>
                      <button
                        onClick={() => deleteMaterial(mat.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors shrink-0"
                        title="Excluir Material"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Links Rápidos da Disciplina</h2>
              <button
                onClick={() => openQuickModal('link', subject.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-md text-xs font-semibold shadow-sm hover:bg-slate-800"
              >
                <Plus className="w-3.5 h-3.5" /> Novo Link
              </button>
            </div>

            {subjectLinks.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs italic">
                <p>Nenhum link cadastrado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-md:gap-0">
                {subjectLinks.map((link) => (
                  <div key={link.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs max-md:bg-transparent max-md:border-b max-md:border-dashed max-md:border-slate-200/60 max-md:px-0 max-md:py-4 max-md:last:border-b-0 hover:bg-slate-50/50 transition-colors rounded-lg border border-slate-200">
                    
                    <div className="flex items-start sm:items-center gap-3 min-w-0 w-full sm:w-auto">
                      <div className="p-2 bg-slate-100 rounded shrink-0">
                        <LinkIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-slate-900 truncate">{link.title}</h4>
                        <div className="mt-1">
                          <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded inline-block">{link.category || 'Geral'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 max-md:w-full max-md:pl-11 max-md:mt-1">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-slate-100 hover:bg-primary hover:text-white rounded transition-colors text-slate-700"
                        title="Abrir link externo"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => deleteLink(link.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 8: History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Histórico de Sessões de Estudo</h2>
            <span className="text-xs text-slate-500 font-sans">
              Total: {formatMinutes(totalMinutes)} ({totalPomodoros} Pomodoros)
            </span>
          </div>

          {subjectSessions.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs italic">
              <p>Nenhuma sessão de estudo registrada ainda.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-md:space-y-0">
              {subjectSessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs max-md:bg-transparent max-md:border-b max-md:border-dashed max-md:border-slate-200/60 max-md:px-0 max-md:py-5 max-md:last:border-b-0 hover:bg-slate-50/50 transition-colors rounded-lg border border-slate-200"
                >
                  <div className="flex items-start gap-3 min-w-0 w-full sm:w-auto">
                    <div className="p-2 rounded bg-slate-100 text-slate-700 shrink-0 mt-0.5">
                      <History className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center flex-wrap gap-1.5 md:gap-2 text-slate-900 leading-snug">
                        <span className="font-semibold">{formatDate(sess.startTime, "dd 'de' MMM 'às' HH:mm")}</span>
                        <span className="hidden md:inline text-slate-300">•</span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/50">{sess.actualMinutes} min de foco</span>
                      </div>
                      
                      {sess.difficulty && (
                        <div className="mt-1.5">
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 inline-block">
                            Dificuldade: {sess.difficulty}
                          </span>
                        </div>
                      )}
                      
                      {sess.notes && (
                        <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-md border border-slate-100 leading-relaxed break-words">
                          {sess.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}



      {/* Task Modal Edit */}
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
