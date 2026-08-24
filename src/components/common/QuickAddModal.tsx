import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckSquare, BookOpen, GraduationCap, Layers, Target, History, FileText, Link as LinkIcon } from 'lucide-react';
import { useStudyOS } from '@/context/StudyOSContext';
import { TaskType, Priority, AssessmentType, TopicStatus, MasteryLevel, SessionDifficulty } from '@/types';
import { SUBJECT_PRESET_COLORS } from '@/lib/utils';

export const QuickAddModal: React.FC = () => {
  const {
    quickModalOpen,
    quickModalType,
    defaultSubjectIdForModal,
    closeQuickModal,
    subjects,
    topics,
    addTask,
    addSubject,
    addAssessment,
    addTopic,
    addStudyGoal,
    addStudySession,
    addMaterial,
    addLink,
    addNote,
  } = useStudyOS();

  // Form states
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    defaultSubjectIdForModal || subjects[0]?.id || ''
  );

  // Task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('assignment');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskDueTime, setTaskDueTime] = useState('23:59');
  const [taskEstMinutes, setTaskEstMinutes] = useState(60);
  const [taskWeight, setTaskWeight] = useState<number | undefined>(undefined);
  const [taskChecklist, setTaskChecklist] = useState<string[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  // Subject form
  const [subjName, setSubjName] = useState('');
  const [subjCode, setSubjCode] = useState('');
  const [subjProfessor, setSubjProfessor] = useState('');
  const [subjEmail, setSubjEmail] = useState('');
  const [scheduleItems, setScheduleItems] = useState<{day: string, start: string, end: string}[]>([{day: 'Segunda', start: '10:00', end: '12:00'}]);
  const [subjRoom, setSubjRoom] = useState('');
  const [subjColor, setSubjColor] = useState(SUBJECT_PRESET_COLORS[0]);
  const [subjTargetHours, setSubjTargetHours] = useState(6);
  const [subjDesc, setSubjDesc] = useState('');

  // Assessment form
  const [assTitle, setAssTitle] = useState('');
  const [assType, setAssType] = useState<AssessmentType>('exam');
  const [assDate, setAssDate] = useState(new Date().toISOString().split('T')[0]);
  const [assTime, setAssTime] = useState('10:00');
  const [assWeight, setAssWeight] = useState(30);
  const [assDesc, setAssDesc] = useState('');

  // Topic form
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDesc, setTopicDesc] = useState('');
  const [topicStatus, setTopicStatus] = useState<TopicStatus>('not_studied');
  const [topicMastery, setTopicMastery] = useState<MasteryLevel>('beginner');
  const [topicEstMin, setTopicEstMin] = useState(120);

  // Study Goal form
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTopicId, setGoalTopicId] = useState('');
  const [goalDueDate, setGoalDueDate] = useState('');
  const [goalEstMin, setGoalEstMin] = useState(45);

  // Session form
  const [sessionMinutes, setSessionMinutes] = useState(45);
  const [sessionDifficulty, setSessionDifficulty] = useState<SessionDifficulty>('normal');
  const [sessionNotes, setSessionNotes] = useState('');

  // Material form
  const [matTitle, setMatTitle] = useState('');
  const [matType, setMatType] = useState<'pdf' | 'slide' | 'book' | 'code' | 'other'>('pdf');
  const [matUrl, setMatUrl] = useState('');
  const [matCategory, setMatCategory] = useState('Apostila');
  const [matNotes, setMatNotes] = useState('');

  // Link form
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkCategory, setLinkCategory] = useState<'sigaa' | 'classroom' | 'moodle' | 'drive' | 'github' | 'book' | 'professor' | 'other'>('moodle');

  // Note form
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    if (quickModalOpen) {
      setSelectedSubjectId(defaultSubjectIdForModal || subjects[0]?.id || '');
      
      // Reset forms
      setTaskTitle('');
      setTaskDesc('');
      setTaskType('assignment');
      setTaskPriority('medium');
      setTaskDueDate(new Date().toISOString().split('T')[0]);
      setTaskDueTime('23:59');
      setTaskEstMinutes(60);
      setTaskWeight(undefined);
      setTaskChecklist([]);
      setNewChecklistText('');
      
      setSubjName('');
      setSubjCode('');
      setSubjProfessor('');
      setSubjEmail('');
      setScheduleItems([{day: 'Segunda', start: '10:00', end: '12:00'}]);
      setSubjRoom('');
      setSubjColor(SUBJECT_PRESET_COLORS[0]);
      setSubjTargetHours(6);
      setSubjDesc('');
      
      setAssTitle('');
      setAssType('exam');
      setAssDate(new Date().toISOString().split('T')[0]);
      setAssTime('10:00');
      setAssWeight(30);
      setAssDesc('');
      
      setTopicTitle('');
      setTopicDesc('');
      setTopicStatus('not_studied');
      setTopicMastery('beginner');
      setTopicEstMin(120);
      
      setGoalTitle('');
      setGoalTopicId('');
      setGoalDueDate('');
      setGoalEstMin(45);
      
      setSessionMinutes(45);
      setSessionDifficulty('normal');
      setSessionNotes('');
      
      setMatTitle('');
      setMatType('pdf');
      setMatUrl('');
      setMatCategory('Apostila');
      setMatNotes('');
      
      setLinkTitle('');
      setLinkUrl('');
      setLinkCategory('moodle');
      
      setNoteTitle('');
      setNoteContent('');
    }
  }, [quickModalOpen, defaultSubjectIdForModal, subjects]);

  if (!quickModalOpen || !quickModalType) return null;

  const handleAddChecklistItem = () => {
    if (newChecklistText.trim()) {
      setTaskChecklist([...taskChecklist, newChecklistText.trim()]);
      setNewChecklistText('');
    }
  };

  const handleRemoveChecklistItem = (index: number) => {
    setTaskChecklist(taskChecklist.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (quickModalType === 'task') {
      if (!taskTitle.trim()) return;
      addTask({
        subjectId: selectedSubjectId || subjects[0]?.id,
        title: taskTitle,
        description: taskDesc,
        type: taskType,
        status: 'not_started',
        priority: taskPriority,
        dueDate: taskDueDate,
        dueTime: taskDueTime,
        estimatedMinutes: Number(taskEstMinutes) || 60,
        weight: taskWeight,
        checklist: taskChecklist.map((title) => ({ title, completed: false })),
      });
    } else if (quickModalType === 'subject') {
      if (!subjName.trim()) return;
      addSubject({
        semesterId: 'sem-2026-2',
        name: subjName,
        code: subjCode || 'DCC000',
        professor: subjProfessor || 'A definir',
        email: subjEmail,
        schedule: scheduleItems.map(item => `${item.day.substring(0, 3)} ${item.start}-${item.end}`).join(' / ') || 'A definir',
        room: subjRoom || 'Sala a definir',
        color: subjColor,
        description: subjDesc,
        targetHoursWeekly: Number(subjTargetHours) || 6,
      });
    } else if (quickModalType === 'assessment') {
      if (!assTitle.trim()) return;
      addAssessment({
        subjectId: selectedSubjectId || subjects[0]?.id,
        title: assTitle,
        type: assType,
        date: assDate,
        time: assTime,
        weight: Number(assWeight) || 20,
        maxGrade: 10.0,
        grade: null,
        description: assDesc,
        relatedTopicIds: [],
      });
    } else if (quickModalType === 'topic') {
      if (!topicTitle.trim()) return;
      addTopic({
        subjectId: selectedSubjectId || subjects[0]?.id,
        title: topicTitle,
        description: topicDesc,
        status: topicStatus,
        mastery: topicMastery,
        estimatedMinutes: Number(topicEstMin) || 120,
      });
    } else if (quickModalType === 'study_goal') {
      if (!goalTitle.trim()) return;
      addStudyGoal({
        subjectId: selectedSubjectId || subjects[0]?.id,
        topicId: goalTopicId || undefined,
        title: goalTitle,
        status: 'pending',
        dueDate: goalDueDate || undefined,
        estimatedMinutes: Number(goalEstMin) || 45,
      });
    } else if (quickModalType === 'session') {
      const now = new Date();
      addStudySession({
        subjectId: selectedSubjectId || subjects[0]?.id,
        startTime: new Date(now.getTime() - sessionMinutes * 60000).toISOString(),
        endTime: now.toISOString(),
        plannedMinutes: Number(sessionMinutes) || 45,
        actualMinutes: Number(sessionMinutes) || 45,
        sessionType: 'free_focus',
        pomodoroCount: Math.ceil((sessionMinutes || 45) / 25),
        difficulty: sessionDifficulty,
        notes: sessionNotes,
      });
    } else if (quickModalType === 'material') {
      if (!matTitle.trim() || !matUrl.trim()) return;
      addMaterial({
        subjectId: selectedSubjectId || subjects[0]?.id,
        title: matTitle,
        type: matType,
        url: matUrl,
        category: matCategory || 'Apostila',
        notes: matNotes,
      });
    } else if (quickModalType === 'link') {
      if (!linkTitle.trim() || !linkUrl.trim()) return;
      addLink({
        subjectId: selectedSubjectId || subjects[0]?.id,
        title: linkTitle,
        url: linkUrl,
        category: linkCategory,
      });
    } else if (quickModalType === 'note') {
      if (!noteTitle.trim()) return;
      addNote({
        subjectId: selectedSubjectId || subjects[0]?.id,
        title: noteTitle,
        content: noteContent,
      });
    }

    closeQuickModal();
  };

  const getTitle = () => {
    switch (quickModalType) {
      case 'task': return 'Nova Atividade / Entrega';
      case 'subject': return 'Nova Disciplina';
      case 'assessment': return 'Nova Avaliação / Prova';
      case 'topic': return 'Novo Conteúdo da Ementa';
      case 'study_goal': return 'Novo Objetivo de Estudo';
      case 'session': return 'Registrar Sessão de Estudo';
      case 'material': return 'Novo Material Didático';
      case 'link': return 'Novo Link Acadêmico';
      case 'note': return 'Nova Anotação da Disciplina';
      default: return 'Adicionar Item';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 max-md:p-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-50">
      <div
        className="w-full max-w-xl bg-white md:rounded-xl shadow-2xl md:border md:border-slate-200 overflow-hidden flex flex-col max-md:h-[100dvh] max-md:max-h-[100dvh] md:max-h-[90vh] animate-in zoom-in-95 max-md:rounded-none max-md:border-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            {quickModalType === 'task' && <CheckSquare className="w-5 h-5 text-blue-600" />}
            {quickModalType === 'subject' && <BookOpen className="w-5 h-5 text-emerald-600" />}
            {quickModalType === 'assessment' && <GraduationCap className="w-5 h-5 text-rose-600" />}
            {quickModalType === 'topic' && <Layers className="w-5 h-5 text-violet-600" />}
            {quickModalType === 'study_goal' && <Target className="w-5 h-5 text-amber-600" />}
            {quickModalType === 'session' && <History className="w-5 h-5 text-slate-700" />}
            {quickModalType === 'material' && <FileText className="w-5 h-5 text-indigo-600" />}
            {quickModalType === 'link' && <LinkIcon className="w-5 h-5 text-blue-500" />}
            {quickModalType === 'note' && <FileText className="w-5 h-5 text-amber-500" />}
            <h2 className="text-base font-bold text-slate-900">{getTitle()}</h2>
          </div>
          <button onClick={closeQuickModal} className="text-slate-400 hover:text-slate-700 p-1 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Select Subject (except when creating a subject itself) */}
          {quickModalType !== 'subject' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Disciplina *</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-slate-800 font-medium"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Form: Task */}
          {quickModalType === 'task' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título da Atividade *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Lista 04 - Árvores AVL"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo</label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as TaskType)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary focus:outline-none bg-white"
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
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prioridade</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary focus:outline-none bg-white"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data de Entrega *</label>
                  <input
                    type="date"
                    required
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Horário</label>
                  <input
                    type="time"
                    value={taskDueTime}
                    onChange={(e) => setTaskDueTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimativa (min)</label>
                  <input
                    type="number"
                    min="5"
                    step="15"
                    value={taskEstMinutes}
                    onChange={(e) => setTaskEstMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Checklist */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Checklist de Subtarefas</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Adicionar item (ex: Questões 1 a 5)..."
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddChecklistItem();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddChecklistItem}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-md text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>

                {taskChecklist.length > 0 && (
                  <div className="space-y-1 bg-slate-50 p-2.5 rounded-md border border-slate-200">
                    {taskChecklist.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                        <span className="text-slate-700">• {item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveChecklistItem(idx)}
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
                <label className="block font-semibold text-slate-700 mb-1">Descrição / Instruções</label>
                <textarea
                  rows={2}
                  placeholder="Detalhes adicionais, orientações do professor..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </>
          )}

          {/* Form: Subject */}
          {quickModalType === 'subject' && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nome da Disciplina *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Compiladores"
                    value={subjName}
                    onChange={(e) => setSubjName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: DCC208"
                    value={subjCode}
                    onChange={(e) => setSubjCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Professor(a)</label>
                  <input
                    type="text"
                    placeholder="Ex: Prof. Roberto"
                    value={subjProfessor}
                    onChange={(e) => setSubjProfessor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="professor@univ.edu.br"
                    value={subjEmail}
                    onChange={(e) => setSubjEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-3 border border-slate-200 rounded-md p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-slate-700">Horários de Aula</label>
                    <button
                      type="button"
                      onClick={() => setScheduleItems([...scheduleItems, { day: 'Segunda', start: '10:00', end: '12:00' }])}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-md text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar Horário
                    </button>
                  </div>
                  
                  {scheduleItems.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <select
                        value={item.day}
                        onChange={(e) => {
                          const newItems = [...scheduleItems];
                          newItems[index].day = e.target.value;
                          setScheduleItems(newItems);
                        }}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary focus:outline-none bg-white"
                      >
                        <option value="Segunda">Segunda</option>
                        <option value="Terça">Terça</option>
                        <option value="Quarta">Quarta</option>
                        <option value="Quinta">Quinta</option>
                        <option value="Sexta">Sexta</option>
                        <option value="Sábado">Sábado</option>
                        <option value="Domingo">Domingo</option>
                      </select>
                      <input
                        type="time"
                        value={item.start}
                        onChange={(e) => {
                          const newItems = [...scheduleItems];
                          newItems[index].start = e.target.value;
                          setScheduleItems(newItems);
                        }}
                        className="px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                      <span className="text-slate-500">até</span>
                      <input
                        type="time"
                        value={item.end}
                        onChange={(e) => {
                          const newItems = [...scheduleItems];
                          newItems[index].end = e.target.value;
                          setScheduleItems(newItems);
                        }}
                        className="px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                      {scheduleItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = [...scheduleItems];
                            newItems.splice(index, 1);
                            setScheduleItems(newItems);
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Sala</label>
                  <input
                    type="text"
                    placeholder="Ex: Sala 204"
                    value={subjRoom}
                    onChange={(e) => setSubjRoom(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Meta semanal (h)</label>
                  <input
                    type="number"
                    min="1"
                    value={subjTargetHours}
                    onChange={(e) => setSubjTargetHours(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Color Preset Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cor Temática</label>
                <div className="flex items-center gap-2">
                  {SUBJECT_PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSubjColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${subjColor === c ? 'scale-110 ring-2 ring-offset-2 ring-primary' : 'hover:scale-105'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ementa / Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Objetivos e tópicos principais da disciplina..."
                  value={subjDesc}
                  onChange={(e) => setSubjDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </>
          )}

          {/* Form: Assessment */}
          {quickModalType === 'assessment' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título da Avaliação *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: P1 — Prova Teórica"
                  value={assTitle}
                  onChange={(e) => setAssTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo</label>
                  <select
                    value={assType}
                    onChange={(e) => setAssType(e.target.value as AssessmentType)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white"
                  >
                    <option value="exam">Prova Teórica</option>
                    <option value="seminar">Seminário</option>
                    <option value="assignment">Trabalho</option>
                    <option value="project">Projeto</option>
                    <option value="presentation">Apresentação</option>
                    <option value="lab">Avaliação Prática</option>
                    <option value="final_exam">Exame Especial / Final</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={assDate}
                    onChange={(e) => setAssDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Peso (%) *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={assWeight}
                    onChange={(e) => setAssWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Conteúdos Abordados / Observações</label>
                <textarea
                  rows={2}
                  placeholder="Capítulos, tópicos que cairão na prova..."
                  value={assDesc}
                  onChange={(e) => setAssDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md"
                />
              </div>
            </>
          )}

          {/* Form: Topic */}
          {quickModalType === 'topic' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título do Assunto / Tópico *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Árvores AVL e Rotações"
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={topicStatus}
                    onChange={(e) => setTopicStatus(e.target.value as TopicStatus)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white"
                  >
                    <option value="not_studied">Não estudado</option>
                    <option value="in_study">Em estudo</option>
                    <option value="studied">Estudado</option>
                    <option value="review">Revisar</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Domínio</label>
                  <select
                    value={topicMastery}
                    onChange={(e) => setTopicMastery(e.target.value as MasteryLevel)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white"
                  >
                    <option value="beginner">Iniciante</option>
                    <option value="intermediate">Intermediário</option>
                    <option value="advanced">Avançado</option>
                    <option value="mastered">Dominado</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimativa (min)</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={topicEstMin}
                    onChange={(e) => setTopicEstMin(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detalhes do Assunto</label>
                <textarea
                  rows={2}
                  placeholder="Conceitos principais, fórmulas..."
                  value={topicDesc}
                  onChange={(e) => setTopicDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md"
                />
              </div>
            </>
          )}

          {/* Form: Study Goal */}
          {quickModalType === 'study_goal' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Objetivo de Estudo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Resolver 10 exercícios de integrais duplas"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assunto Relacionado (Opcional)</label>
                  <select
                    value={goalTopicId}
                    onChange={(e) => setGoalTopicId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white"
                  >
                    <option value="">Nenhum específico</option>
                    {topics
                      .filter((t) => t.subjectId === selectedSubjectId)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tempo Estimado (min)</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={goalEstMin}
                    onChange={(e) => setGoalEstMin(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md"
                  />
                </div>
              </div>
            </>
          )}

          {/* Form: Session */}
          {quickModalType === 'session' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tempo Estudado (minutos) *</label>
                  <input
                    type="number"
                    min="10"
                    step="5"
                    required
                    value={sessionMinutes}
                    onChange={(e) => setSessionMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dificuldade Percebida</label>
                  <select
                    value={sessionDifficulty}
                    onChange={(e) => setSessionDifficulty(e.target.value as SessionDifficulty)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white"
                  >
                    <option value="easy">Fácil</option>
                    <option value="normal">Normal</option>
                    <option value="hard">Difícil</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observações da Sessão</label>
                <textarea
                  rows={3}
                  placeholder="O que foi estudado, dificuldades encontradas..."
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md"
                />
              </div>
            </>
          )}

          {/* Form: Material */}
          {quickModalType === 'material' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título do Material *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Apostila de Cálculo I"
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Arquivo</label>
                  <select
                    value={matType}
                    onChange={(e) => setMatType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white"
                  >
                    <option value="pdf">PDF / Documento</option>
                    <option value="slide">Slides / Apresentação</option>
                    <option value="book">Livro / E-book</option>
                    <option value="code">Código / Repositório</option>
                    <option value="other">Outro formato</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={matCategory}
                    onChange={(e) => setMatCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white"
                  >
                    <option value="Apostila">Apostila</option>
                    <option value="Lista de Exercícios">Lista de Exercícios</option>
                    <option value="Provas Antigas">Provas Antigas</option>
                    <option value="Livro Texto">Livro Texto</option>
                    <option value="Artigo Científico">Artigo Científico</option>
                    <option value="Anotações de Aula">Anotações de Aula</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">URL / Link *</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={matUrl}
                  onChange={(e) => setMatUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição / Observações</label>
                <textarea
                  rows={2}
                  placeholder="Detalhes sobre o material, páginas importantes..."
                  value={matNotes}
                  onChange={(e) => setMatNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md"
                />
              </div>
            </>
          )}

          {/* Form: Link */}
          {quickModalType === 'link' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título do Link *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: SIGAA Turma 2026"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">URL (com https://) *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={linkCategory}
                    onChange={(e) => setLinkCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white"
                  >
                    <option value="sigaa">SIGAA</option>
                    <option value="classroom">Classroom</option>
                    <option value="moodle">Moodle</option>
                    <option value="drive">Drive</option>
                    <option value="github">GitHub</option>
                    <option value="professor">Site do Prof.</option>
                    <option value="book">Livro / Docs</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Form: Note */}
          {quickModalType === 'note' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título da Anotação *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dicas para prova de grafos"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Conteúdo (Markdown suportado)</label>
                <textarea
                  rows={5}
                  placeholder="Escreva suas anotações, fórmulas ou resumo..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md font-mono text-xs"
                />
              </div>
            </>
          )}

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeQuickModal}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-md font-medium text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-slate-800 text-white rounded-md font-semibold text-xs shadow-sm transition-colors"
            >
              Salvar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
