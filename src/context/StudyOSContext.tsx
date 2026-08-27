import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Semester,
  Subject,
  Task,
  Assessment,
  Topic,
  StudyGoal,
  StudySession,
  Material,
  LinkItem,
  Note,
  UserSettings,
  SemesterHealth,
  SmartAlert,
  DailyFocusItem,
  TaskStatus,
  TopicStatus,
  SessionDifficulty,
} from '@/types';
import {
  initialSemester,
  initialSubjects,
  initialTasks,
  initialAssessments,
  initialTopics,
  initialStudyGoals,
  initialStudySessions,
  initialMaterials,
  initialLinks,
  initialNotes,
  initialSettings,
  demoData,
} from '@/lib/initialData';
import { calculateSemesterHealth, generateSmartAlerts, generateDailyFocus } from '@/lib/intelligence';
import confetti from 'canvas-confetti';
import {
  initializeNativeFeatures,
  syncAllNotifications,
  schedulePomodoroNotification,
  cancelPomodoroNotification,
  triggerHapticFeedback,
} from '@/lib/notifications';

interface ActivePomodoroState {
  isActive: boolean;
  isPaused: boolean;
  mode: 'focus' | 'short_break' | 'long_break';
  timeLeft: number; // in seconds
  totalDuration: number; // in seconds
  subjectId: string;
  taskId?: string;
  studyGoalId?: string;
  currentCycle: number;
  totalCycles: number;
  startedAt: string | null;
}

interface StudyOSContextType {
  // Data
  semester: Semester;
  subjects: Subject[];
  tasks: Task[];
  assessments: Assessment[];
  topics: Topic[];
  studyGoals: StudyGoal[];
  studySessions: StudySession[];
  materials: Material[];
  links: LinkItem[];
  notes: Note[];
  settings: UserSettings;

  // Intelligence & Metrics
  health: SemesterHealth;
  alerts: SmartAlert[];
  dailyFocus: DailyFocusItem[];
  stats: {
    totalHours: number;
    totalPomodoros: number;
    dailyAverageHours: number;
    completedTasksCount: number;
    pendingTasksCount: number;
    overdueTasksCount: number;
    upcomingExamsCount: number;
    activeSubjectsCount: number;
    topSubject: { id: string; name: string; hours: number; color: string } | null;
  };

  // Active Pomodoro State
  activePomodoro: ActivePomodoroState;
  showFinishModal: boolean;
  lastFinishedSession: {
    subjectId: string;
    taskId?: string;
    studyGoalId?: string;
    plannedMinutes: number;
    actualMinutes: number;
    sessionType: 'pomodoro' | 'free_focus' | 'review';
  } | null;

  // Quick Action Modal & Global Search
  quickModalOpen: boolean;
  quickModalType: 'task' | 'subject' | 'assessment' | 'topic' | 'study_goal' | 'session' | 'material' | 'link' | 'note' | null;
  defaultSubjectIdForModal?: string;
  globalSearchOpen: boolean;
  openQuickModal: (type: 'task' | 'subject' | 'assessment' | 'topic' | 'study_goal' | 'session' | 'material' | 'link' | 'note', subjectId?: string) => void;
  closeQuickModal: () => void;
  setGlobalSearchOpen: (open: boolean) => void;

  // CRUD Operations
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt'>) => void;
  updateSubject: (id: string, subject: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'actualMinutes' | 'checklist'> & { checklist?: { title: string; completed: boolean }[] }) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleChecklistItem: (taskId: string, checklistId: string) => void;
  setTaskStatus: (taskId: string, status: TaskStatus) => void;

  addAssessment: (assessment: Omit<Assessment, 'id'>) => void;
  updateAssessment: (id: string, assessment: Partial<Assessment>) => void;
  deleteAssessment: (id: string) => void;

  addTopic: (topic: Omit<Topic, 'id' | 'actualMinutes' | 'order'>) => void;
  updateTopic: (id: string, topic: Partial<Topic>) => void;
  deleteTopic: (id: string) => void;
  setTopicStatus: (topicId: string, status: TopicStatus) => void;

  addStudyGoal: (goal: Omit<StudyGoal, 'id' | 'createdAt' | 'actualMinutes'>) => void;
  updateStudyGoal: (id: string, goal: Partial<StudyGoal>) => void;
  deleteStudyGoal: (id: string) => void;

  addStudySession: (session: Omit<StudySession, 'id'>) => void;
  deleteStudySession: (id: string) => void;

  addMaterial: (material: Omit<Material, 'id' | 'createdAt'>) => void;
  deleteMaterial: (id: string) => void;

  addLink: (link: Omit<LinkItem, 'id'>) => void;
  deleteLink: (id: string) => void;

  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  updateSettings: (settings: Partial<UserSettings>) => void;
  updateSemester: (semester: Partial<Semester>) => void;

  // Pomodoro Controls
  startPomodoro: (options: {
    subjectId: string;
    taskId?: string;
    studyGoalId?: string;
    durationMinutes?: number;
    mode?: 'focus' | 'short_break' | 'long_break';
    totalCycles?: number;
  }) => void;
  setPomodoroCycles: (cycles: number) => void;
  pausePomodoro: () => void;
  resumePomodoro: () => void;
  stopPomodoro: () => void;
  skipPomodoro: () => void;
  submitPomodoroFinish: (difficulty: SessionDifficulty, notes: string, markTaskCompleted: boolean) => void;
  closeFinishModal: () => void;

  // System actions
  clearAllData: () => void;
  loadDemoData: () => void;
  resetToDemoData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => boolean;
}

const STORAGE_KEYS = {
  SEMESTER: 'studyos_semester_v2',
  SUBJECTS: 'studyos_subjects_v2',
  TASKS: 'studyos_tasks_v2',
  ASSESSMENTS: 'studyos_assessments_v2',
  TOPICS: 'studyos_topics_v2',
  STUDY_GOALS: 'studyos_study_goals_v2',
  STUDY_SESSIONS: 'studyos_study_sessions_v2',
  MATERIALS: 'studyos_materials_v2',
  LINKS: 'studyos_links_v2',
  NOTES: 'studyos_notes_v2',
  SETTINGS: 'studyos_settings_v2',
};

const StudyOSContext = createContext<StudyOSContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
    return defaultValue;
  }
}

export const StudyOSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [semester, setSemester] = useState<Semester>(() => loadFromStorage(STORAGE_KEYS.SEMESTER, initialSemester));
  const [subjects, setSubjects] = useState<Subject[]>(() => loadFromStorage(STORAGE_KEYS.SUBJECTS, initialSubjects));
  const [tasks, setTasks] = useState<Task[]>(() => loadFromStorage(STORAGE_KEYS.TASKS, initialTasks));
  const [assessments, setAssessments] = useState<Assessment[]>(() => loadFromStorage(STORAGE_KEYS.ASSESSMENTS, initialAssessments));
  const [topics, setTopics] = useState<Topic[]>(() => loadFromStorage(STORAGE_KEYS.TOPICS, initialTopics));
  const [studyGoals, setStudyGoals] = useState<StudyGoal[]>(() => loadFromStorage(STORAGE_KEYS.STUDY_GOALS, initialStudyGoals));
  const [studySessions, setStudySessions] = useState<StudySession[]>(() => loadFromStorage(STORAGE_KEYS.STUDY_SESSIONS, initialStudySessions));
  const [materials, setMaterials] = useState<Material[]>(() => loadFromStorage(STORAGE_KEYS.MATERIALS, initialMaterials));
  const [links, setLinks] = useState<LinkItem[]>(() => loadFromStorage(STORAGE_KEYS.LINKS, initialLinks));
  const [notes, setNotes] = useState<Note[]>(() => loadFromStorage(STORAGE_KEYS.NOTES, initialNotes));
  const [settings, setSettings] = useState<UserSettings>(() => loadFromStorage(STORAGE_KEYS.SETTINGS, initialSettings));

  // Quick Modal and Search State
  const [quickModalOpen, setQuickModalOpen] = useState(false);
  const [quickModalType, setQuickModalType] = useState<'task' | 'subject' | 'assessment' | 'topic' | 'study_goal' | 'session' | 'material' | 'link' | 'note' | null>(null);
  const [defaultSubjectIdForModal, setDefaultSubjectIdForModal] = useState<string | undefined>(undefined);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);

  // Active Pomodoro State
  const [activePomodoro, setActivePomodoro] = useState<ActivePomodoroState>({
    isActive: false,
    isPaused: false,
    mode: 'focus',
    timeLeft: 25 * 60,
    totalDuration: 25 * 60,
    subjectId: initialSubjects[0]?.id || '',
    currentCycle: 1,
    totalCycles: 4,
    startedAt: null,
  });

  const [showFinishModal, setShowFinishModal] = useState(false);
  const [lastFinishedSession, setLastFinishedSession] = useState<{
    subjectId: string;
    taskId?: string;
    studyGoalId?: string;
    plannedMinutes: number;
    actualMinutes: number;
    sessionType: 'pomodoro' | 'free_focus' | 'review';
  } | null>(null);

  // Save to localStorage on changes
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SEMESTER, JSON.stringify(semester)); }, [semester]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects)); }, [subjects]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(assessments)); }, [assessments]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics)); }, [topics]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.STUDY_GOALS, JSON.stringify(studyGoals)); }, [studyGoals]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(studySessions)); }, [studySessions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials)); }, [materials]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links)); }, [links]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); }, [settings]);

  // Initialize native status bar & notification channels on mount
  useEffect(() => {
    initializeNativeFeatures();
  }, []);

  // Sync scheduled native notifications for upcoming tasks and exams
  useEffect(() => {
    syncAllNotifications(tasks, assessments, subjects, settings.notifications);
  }, [tasks, assessments, subjects, settings.notifications]);

  // Sync inactive pomodoro with settings when settings change
  useEffect(() => {
    if (!activePomodoro.isActive) {
      setActivePomodoro((prev) => ({
        ...prev,
        timeLeft: (settings.pomodoro.focusDuration || 25) * 60,
        totalDuration: (settings.pomodoro.focusDuration || 25) * 60,
        totalCycles: settings.pomodoro.longBreakInterval || 4,
      }));
    }
  }, [settings.pomodoro.focusDuration, settings.pomodoro.longBreakInterval, activePomodoro.isActive]);

  // Pomodoro Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activePomodoro.isActive && !activePomodoro.isPaused && activePomodoro.timeLeft > 0) {
      interval = setInterval(() => {
        setActivePomodoro((prev) => ({
          ...prev,
          timeLeft: Math.max(0, prev.timeLeft - 1),
        }));
      }, 1000);
    } else if (activePomodoro.isActive && activePomodoro.timeLeft === 0) {
      // Completed timer!
      triggerHapticFeedback('success');

      if (activePomodoro.mode === 'focus') {
        const plannedMins = Math.round(activePomodoro.totalDuration / 60);
        setLastFinishedSession({
          subjectId: activePomodoro.subjectId,
          taskId: activePomodoro.taskId,
          studyGoalId: activePomodoro.studyGoalId,
          plannedMinutes: plannedMins,
          actualMinutes: plannedMins,
          sessionType: 'pomodoro',
        });
        setShowFinishModal(true);

        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      }

      // Transition to next mode/cycle
      if (activePomodoro.mode === 'focus') {
        const nextCycle = activePomodoro.currentCycle;
        const isLongBreak = nextCycle >= activePomodoro.totalCycles;
        const nextMode = isLongBreak ? 'long_break' : 'short_break';
        const nextDuration = isLongBreak
          ? (settings.pomodoro.longBreakDuration || 15) * 60
          : (settings.pomodoro.shortBreakDuration || 5) * 60;

        setActivePomodoro((prev) => ({
          ...prev,
          mode: nextMode,
          timeLeft: nextDuration,
          totalDuration: nextDuration,
          isPaused: !settings.pomodoro.autoStartBreaks,
        }));
      } else {
        // After break, back to focus
        const nextCycle = activePomodoro.mode === 'long_break' ? 1 : activePomodoro.currentCycle + 1;
        const focusDuration = (settings.pomodoro.focusDuration || 25) * 60;
        setActivePomodoro((prev) => ({
          ...prev,
          mode: 'focus',
          currentCycle: nextCycle,
          timeLeft: focusDuration,
          totalDuration: focusDuration,
          isPaused: !settings.pomodoro.autoStartFocus,
        }));
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activePomodoro.isActive, activePomodoro.isPaused, activePomodoro.timeLeft, activePomodoro.mode, settings.pomodoro]);

  // Derived Intelligence
  const health = useMemo(
    () => calculateSemesterHealth(subjects, tasks, assessments, topics, studySessions),
    [subjects, tasks, assessments, topics, studySessions]
  );

  const alerts = useMemo(
    () => generateSmartAlerts(subjects, tasks, assessments, topics, studySessions),
    [subjects, tasks, assessments, topics, studySessions]
  );

  const dailyFocus = useMemo(
    () => generateDailyFocus(subjects, tasks, assessments, topics),
    [subjects, tasks, assessments, topics]
  );

  // General statistics
  const stats = useMemo(() => {
    const totalMinutes = studySessions.reduce((acc, s) => acc + (s.actualMinutes || 0), 0);
    const totalPomodoros = studySessions.reduce((acc, s) => acc + (s.pomodoroCount || 0), 0);
    const totalHours = Number((totalMinutes / 60).toFixed(1));

    // Daily average based on semester days active (approx 20 days elapsed)
    const dailyAverageHours = Number((totalHours / 20).toFixed(1));

    const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
    const pendingTasksCount = tasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled').length;
    const overdueTasksCount = tasks.filter((t) => {
      if (t.status === 'completed' || t.status === 'cancelled') return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    const upcomingExamsCount = assessments.filter((a) => a.grade === null || a.grade === undefined).length;

    // Top subject by dedicated minutes
    const minutesBySubject: Record<string, number> = {};
    studySessions.forEach((s) => {
      minutesBySubject[s.subjectId] = (minutesBySubject[s.subjectId] || 0) + (s.actualMinutes || 0);
    });

    let topSubjObj: { id: string; name: string; hours: number; color: string } | null = null;
    let maxMins = 0;
    Object.entries(minutesBySubject).forEach(([sId, mins]) => {
      if (mins > maxMins) {
        maxMins = mins;
        const subj = subjects.find((s) => s.id === sId);
        if (subj) {
          topSubjObj = {
            id: subj.id,
            name: subj.name,
            hours: Number((mins / 60).toFixed(1)),
            color: subj.color,
          };
        }
      }
    });

    return {
      totalHours,
      totalPomodoros,
      dailyAverageHours,
      completedTasksCount,
      pendingTasksCount,
      overdueTasksCount,
      upcomingExamsCount,
      activeSubjectsCount: subjects.length,
      topSubject: topSubjObj,
    };
  }, [studySessions, tasks, assessments, subjects]);

  // Pomodoro Actions
  const startPomodoro = useCallback(
    (options: {
      subjectId: string;
      taskId?: string;
      studyGoalId?: string;
      durationMinutes?: number;
      mode?: 'focus' | 'short_break' | 'long_break';
      totalCycles?: number;
    }) => {
      const dur = (options.durationMinutes || settings.pomodoro.focusDuration || 25) * 60;
      const cycles = options.totalCycles || settings.pomodoro.longBreakInterval || 4;
      const mode = options.mode || 'focus';

      triggerHapticFeedback('click');

      if (settings.notifications?.pomodoroAlarms !== false) {
        const subj = subjects.find((s) => s.id === options.subjectId);
        schedulePomodoroNotification(dur, mode, subj?.name);
      }

      setActivePomodoro({
        isActive: true,
        isPaused: false,
        mode,
        timeLeft: dur,
        totalDuration: dur,
        subjectId: options.subjectId,
        taskId: options.taskId,
        studyGoalId: options.studyGoalId,
        currentCycle: 1,
        totalCycles: cycles,
        startedAt: new Date().toISOString(),
      });
    },
    [settings.pomodoro, settings.notifications, subjects]
  );

  const setPomodoroCycles = useCallback((cycles: number) => {
    const validCycles = Math.max(1, Math.min(12, cycles));
    setActivePomodoro((prev) => ({
      ...prev,
      totalCycles: validCycles,
      currentCycle: Math.min(prev.currentCycle, validCycles),
    }));
    setSettings((prev) => ({
      ...prev,
      pomodoro: {
        ...prev.pomodoro,
        longBreakInterval: validCycles,
      },
    }));
  }, []);

  const pausePomodoro = useCallback(() => {
    triggerHapticFeedback('click');
    cancelPomodoroNotification();
    setActivePomodoro((prev) => ({ ...prev, isPaused: true }));
  }, []);

  const resumePomodoro = useCallback(() => {
    triggerHapticFeedback('click');
    if (settings.notifications?.pomodoroAlarms !== false) {
      const subj = subjects.find((s) => s.id === activePomodoro.subjectId);
      schedulePomodoroNotification(activePomodoro.timeLeft, activePomodoro.mode, subj?.name);
    }
    setActivePomodoro((prev) => ({ ...prev, isPaused: false }));
  }, [activePomodoro.timeLeft, activePomodoro.mode, activePomodoro.subjectId, settings.notifications, subjects]);

  const stopPomodoro = useCallback(() => {
    triggerHapticFeedback('click');
    cancelPomodoroNotification();
    setActivePomodoro((prev) => ({
      ...prev,
      isActive: false,
      isPaused: false,
      timeLeft: (settings.pomodoro.focusDuration || 25) * 60,
      totalDuration: (settings.pomodoro.focusDuration || 25) * 60,
      startedAt: null,
    }));
  }, [settings.pomodoro]);

  const skipPomodoro = useCallback(() => {
    triggerHapticFeedback('click');
    cancelPomodoroNotification();
    setActivePomodoro((prev) => ({
      ...prev,
      timeLeft: 0,
    }));
  }, []);

  const submitPomodoroFinish = useCallback(
    (difficulty: SessionDifficulty, notes: string, markTaskCompleted: boolean) => {
      if (!lastFinishedSession) {
        setShowFinishModal(false);
        return;
      }

      const newSession: StudySession = {
        id: `sess-${Date.now()}`,
        subjectId: lastFinishedSession.subjectId,
        taskId: lastFinishedSession.taskId,
        studyGoalId: lastFinishedSession.studyGoalId,
        startTime: new Date(Date.now() - lastFinishedSession.actualMinutes * 60000).toISOString(),
        endTime: new Date().toISOString(),
        plannedMinutes: lastFinishedSession.plannedMinutes,
        actualMinutes: lastFinishedSession.actualMinutes,
        sessionType: lastFinishedSession.sessionType,
        pomodoroCount: 1,
        difficulty,
        notes,
      };

      setStudySessions((prev) => [newSession, ...prev]);

      // If marked task completed
      if (markTaskCompleted && lastFinishedSession.taskId) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === lastFinishedSession.taskId
              ? { ...t, status: 'completed', actualMinutes: (t.actualMinutes || 0) + lastFinishedSession.actualMinutes }
              : t
          )
        );
      } else if (lastFinishedSession.taskId) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === lastFinishedSession.taskId
              ? { ...t, status: 'in_progress', actualMinutes: (t.actualMinutes || 0) + lastFinishedSession.actualMinutes }
              : t
          )
        );
      }

      // If linked to study goal
      if (lastFinishedSession.studyGoalId) {
        setStudyGoals((prev) =>
          prev.map((g) =>
            g.id === lastFinishedSession.studyGoalId
              ? {
                  ...g,
                  actualMinutes: (g.actualMinutes || 0) + lastFinishedSession.actualMinutes,
                  status: markTaskCompleted ? 'completed' : 'in_progress',
                }
              : g
          )
        );
      }

      setShowFinishModal(false);
      setLastFinishedSession(null);
    },
    [lastFinishedSession]
  );

  const closeFinishModal = useCallback(() => {
    setShowFinishModal(false);
    setLastFinishedSession(null);
  }, []);

  // Quick Action Modal triggers
  const openQuickModal = useCallback(
    (type: 'task' | 'subject' | 'assessment' | 'topic' | 'study_goal' | 'session' | 'material' | 'link' | 'note', subjectId?: string) => {
      setQuickModalType(type);
      setDefaultSubjectIdForModal(subjectId || subjects[0]?.id);
      setQuickModalOpen(true);
    },
    [subjects]
  );

  const closeQuickModal = useCallback(() => {
    setQuickModalOpen(false);
    setQuickModalType(null);
  }, []);

  // Subject CRUD
  const addSubject = useCallback((subjectData: Omit<Subject, 'id' | 'createdAt'>) => {
    const newSubj: Subject = {
      ...subjectData,
      id: `sub-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSubjects((prev) => [...prev, newSubj]);
  }, []);

  const updateSubject = useCallback((id: string, subjectData: Partial<Subject>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...subjectData } : s)));
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setTasks((prev) => prev.filter((t) => t.subjectId !== id));
    setAssessments((prev) => prev.filter((a) => a.subjectId !== id));
    setTopics((prev) => prev.filter((t) => t.subjectId !== id));
    setStudyGoals((prev) => prev.filter((g) => g.subjectId !== id));
    setStudySessions((prev) => prev.filter((s) => s.subjectId !== id));
    setMaterials((prev) => prev.filter((m) => m.subjectId !== id));
    setLinks((prev) => prev.filter((l) => l.subjectId !== id));
    setNotes((prev) => prev.filter((n) => n.subjectId !== id));
  }, []);

  // Task CRUD
  const addTask = useCallback(
    (taskData: Omit<Task, 'id' | 'createdAt' | 'actualMinutes' | 'checklist'> & { checklist?: { title: string; completed: boolean }[] }) => {
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
        actualMinutes: 0,
        checklist: (taskData.checklist || []).map((c, i) => ({
          id: `chk-${Date.now()}-${i}`,
          title: c.title,
          completed: c.completed,
        })),
      };
      setTasks((prev) => [newTask, ...prev]);
    },
    []
  );

  const updateTask = useCallback((id: string, taskData: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...taskData } : t)));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleChecklistItem = useCallback((taskId: string, checklistId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedChecklist = t.checklist.map((item) =>
          item.id === checklistId ? { ...item, completed: !item.completed } : item
        );
        const allCompleted = updatedChecklist.length > 0 && updatedChecklist.every((item) => item.completed);
        return {
          ...t,
          checklist: updatedChecklist,
          status: allCompleted ? 'completed' : t.status === 'not_started' ? 'in_progress' : t.status,
        };
      })
    );
  }, []);

  const setTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        if (status === 'completed') {
          try {
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
          } catch {
            // ignore
          }
        }
        return { ...t, status };
      })
    );
  }, []);

  // Assessment CRUD
  const addAssessment = useCallback((assessmentData: Omit<Assessment, 'id'>) => {
    const newAss: Assessment = {
      ...assessmentData,
      id: `ass-${Date.now()}`,
    };
    setAssessments((prev) => [...prev, newAss]);
  }, []);

  const updateAssessment = useCallback((id: string, assessmentData: Partial<Assessment>) => {
    setAssessments((prev) => prev.map((a) => (a.id === id ? { ...a, ...assessmentData } : a)));
  }, []);

  const deleteAssessment = useCallback((id: string) => {
    setAssessments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // Topic CRUD
  const addTopic = useCallback((topicData: Omit<Topic, 'id' | 'actualMinutes' | 'order'>) => {
    setTopics((prev) => {
      const subjectTopics = prev.filter((t) => t.subjectId === topicData.subjectId);
      const newTopic: Topic = {
        ...topicData,
        id: `top-${Date.now()}`,
        actualMinutes: 0,
        order: subjectTopics.length + 1,
      };
      return [...prev, newTopic];
    });
  }, []);

  const updateTopic = useCallback((id: string, topicData: Partial<Topic>) => {
    setTopics((prev) => prev.map((t) => (t.id === id ? { ...t, ...topicData } : t)));
  }, []);

  const deleteTopic = useCallback((id: string) => {
    setTopics((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setTopicStatus = useCallback((topicId: string, status: TopicStatus) => {
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id !== topicId) return t;
        const newMastery = status === 'studied' ? (t.mastery === 'beginner' ? 'advanced' : t.mastery) : t.mastery;
        return { ...t, status, mastery: newMastery };
      })
    );
  }, []);

  // StudyGoal CRUD
  const addStudyGoal = useCallback((goalData: Omit<StudyGoal, 'id' | 'createdAt' | 'actualMinutes'>) => {
    const newGoal: StudyGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      actualMinutes: 0,
      createdAt: new Date().toISOString(),
    };
    setStudyGoals((prev) => [newGoal, ...prev]);
  }, []);

  const updateStudyGoal = useCallback((id: string, goalData: Partial<StudyGoal>) => {
    setStudyGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...goalData } : g)));
  }, []);

  const deleteStudyGoal = useCallback((id: string) => {
    setStudyGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  // StudySession CRUD
  const addStudySession = useCallback((sessionData: Omit<StudySession, 'id'>) => {
    const newSession: StudySession = {
      ...sessionData,
      id: `sess-${Date.now()}`,
    };
    setStudySessions((prev) => [newSession, ...prev]);
  }, []);

  const deleteStudySession = useCallback((id: string) => {
    setStudySessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Material CRUD
  const addMaterial = useCallback((materialData: Omit<Material, 'id' | 'createdAt'>) => {
    const newMat: Material = {
      ...materialData,
      id: `mat-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setMaterials((prev) => [newMat, ...prev]);
  }, []);

  const deleteMaterial = useCallback((id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // Link CRUD
  const addLink = useCallback((linkData: Omit<LinkItem, 'id'>) => {
    const newLink: LinkItem = {
      ...linkData,
      id: `lnk-${Date.now()}`,
    };
    setLinks((prev) => [newLink, ...prev]);
  }, []);

  const deleteLink = useCallback((id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }, []);

  // Note CRUD
  const addNote = useCallback((noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newNote: Note = {
      ...noteData,
      id: `not-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [newNote, ...prev]);
  }, []);

  const updateNote = useCallback((id: string, noteData: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              ...noteData,
              updatedAt: new Date().toISOString(),
            }
          : n
      )
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Settings & Semester
  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const updateSemester = useCallback((semesterData: Partial<Semester>) => {
    setSemester((prev) => ({ ...prev, ...semesterData }));
  }, []);

  // Reset and Export/Import
  const clearAllData = useCallback(() => {
    setSubjects([]);
    setTasks([]);
    setAssessments([]);
    setTopics([]);
    setStudyGoals([]);
    setStudySessions([]);
    setMaterials([]);
    setLinks([]);
    setNotes([]);
  }, []);

  const loadDemoData = useCallback(() => {
    setSemester(demoData.semester);
    setSubjects(demoData.subjects);
    setTasks(demoData.tasks);
    setAssessments(demoData.assessments);
    setTopics(demoData.topics);
    setStudyGoals(demoData.studyGoals);
    setStudySessions(demoData.studySessions);
    setMaterials(demoData.materials);
    setLinks(demoData.links);
    setNotes(demoData.notes);
  }, []);

  const resetToDemoData = useCallback(() => {
    clearAllData();
  }, [clearAllData]);

  const exportDataJSON = useCallback(() => {
    const backup = {
      semester,
      subjects,
      tasks,
      assessments,
      topics,
      studyGoals,
      studySessions,
      materials,
      links,
      notes,
      settings,
      exportedAt: new Date().toISOString(),
      version: '2.0.0',
    };
    return JSON.stringify(backup, null, 2);
  }, [semester, subjects, tasks, assessments, topics, studyGoals, studySessions, materials, links, notes, settings]);

  const importDataJSON = useCallback((jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.semester) setSemester(data.semester);
      if (Array.isArray(data.subjects)) setSubjects(data.subjects);
      if (Array.isArray(data.tasks)) setTasks(data.tasks);
      if (Array.isArray(data.assessments)) setAssessments(data.assessments);
      if (Array.isArray(data.topics)) setTopics(data.topics);
      if (Array.isArray(data.studyGoals)) setStudyGoals(data.studyGoals);
      if (Array.isArray(data.studySessions)) setStudySessions(data.studySessions);
      if (Array.isArray(data.materials)) setMaterials(data.materials);
      if (Array.isArray(data.links)) setLinks(data.links);
      if (Array.isArray(data.notes)) setNotes(data.notes);
      if (data.settings) setSettings(data.settings);
      return true;
    } catch (e) {
      console.error('Failed to import JSON backup:', e);
      return false;
    }
  }, []);

  return (
    <StudyOSContext.Provider
      value={{
        semester,
        subjects,
        tasks,
        assessments,
        topics,
        studyGoals,
        studySessions,
        materials,
        links,
        notes,
        settings,
        health,
        alerts,
        dailyFocus,
        stats,
        activePomodoro,
        showFinishModal,
        lastFinishedSession,
        quickModalOpen,
        quickModalType,
        defaultSubjectIdForModal,
        globalSearchOpen,
        openQuickModal,
        closeQuickModal,
        setGlobalSearchOpen,
        addSubject,
        updateSubject,
        deleteSubject,
        addTask,
        updateTask,
        deleteTask,
        toggleChecklistItem,
        setTaskStatus,
        addAssessment,
        updateAssessment,
        deleteAssessment,
        addTopic,
        updateTopic,
        deleteTopic,
        setTopicStatus,
        addStudyGoal,
        updateStudyGoal,
        deleteStudyGoal,
        addStudySession,
        deleteStudySession,
        addMaterial,
        deleteMaterial,
        addLink,
        deleteLink,
        addNote,
        updateNote,
        deleteNote,
        updateSettings,
        updateSemester,
        startPomodoro,
        setPomodoroCycles,
        pausePomodoro,
        resumePomodoro,
        stopPomodoro,
        skipPomodoro,
        submitPomodoroFinish,
        closeFinishModal,
        clearAllData,
        loadDemoData,
        resetToDemoData,
        exportDataJSON,
        importDataJSON,
      }}
    >
      {children}
    </StudyOSContext.Provider>
  );
};

export const useStudyOS = () => {
  const context = useContext(StudyOSContext);
  if (!context) {
    throw new Error('useStudyOS must be used within a StudyOSProvider');
  }
  return context;
};
