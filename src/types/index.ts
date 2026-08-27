export type TaskType = 
  | 'exercise' 
  | 'assignment' 
  | 'project' 
  | 'reading' 
  | 'article' 
  | 'lab' 
  | 'presentation' 
  | 'exam_prep' 
  | 'group_work';

export type TaskStatus = 
  | 'not_started' 
  | 'in_progress' 
  | 'waiting' 
  | 'completed' 
  | 'overdue' 
  | 'cancelled';

export type Priority = 'low' | 'medium' | 'high';

export type TopicStatus = 'not_studied' | 'in_study' | 'studied' | 'review';

export type MasteryLevel = 'beginner' | 'intermediate' | 'advanced' | 'mastered';

export type AssessmentType = 
  | 'exam' 
  | 'seminar' 
  | 'assignment' 
  | 'presentation' 
  | 'project' 
  | 'lab' 
  | 'final_exam';

export type SessionDifficulty = 'easy' | 'normal' | 'hard';

export type SessionType = 'pomodoro' | 'free_focus' | 'review';

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface Semester {
  id: string;
  name: string; // e.g. "2026.2"
  startDate: string; // ISO date string YYYY-MM-DD
  endDate: string; // ISO date string YYYY-MM-DD
  targetGrade: number; // e.g. 7.0
  currentWeek?: number;
  status: 'active' | 'archived' | 'planned';
}

export interface Subject {
  id: string;
  semesterId: string;
  name: string; // e.g. "Estrutura de Dados"
  code: string; // e.g. "DCC205"
  professor: string;
  email: string;
  schedule: string; // e.g. "Seg/Qua 10:00 - 12:00"
  room: string; // e.g. "Lab 03 / Prédio ICEx"
  color: string; // Hex color for subject branding
  description: string;
  syllabus?: string;
  targetHoursWeekly: number; // e.g. 6 hours
  createdAt: string;
}

export interface Task {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: Priority;
  createdAt: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  estimatedMinutes: number;
  actualMinutes: number;
  weight?: number; // Weight in subject if applicable
  link?: string;
  checklist: ChecklistItem[];
  notes?: string;
}

export interface Assessment {
  id: string;
  subjectId: string;
  title: string; // e.g. "P1 - Prova Teórica"
  type: AssessmentType;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  weight: number; // Percentage or points weight (e.g. 30 for 30%)
  grade?: number | null; // e.g. 8.5
  maxGrade: number; // Usually 10.0 or 100
  description?: string;
  relatedTopicIds: string[];
  notes?: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  status: TopicStatus;
  mastery: MasteryLevel;
  estimatedMinutes: number;
  actualMinutes: number;
  order: number;
  notes?: string;
}

export interface StudyGoal {
  id: string;
  subjectId: string;
  topicId?: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string;
  estimatedMinutes: number;
  actualMinutes: number;
  createdAt: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  taskId?: string;
  studyGoalId?: string;
  startTime: string; // ISO datetime
  endTime: string; // ISO datetime
  plannedMinutes: number;
  actualMinutes: number;
  sessionType: SessionType;
  pomodoroCount: number;
  difficulty?: SessionDifficulty;
  notes?: string;
  completedTopicIds?: string[];
}

export interface Material {
  id: string;
  subjectId: string;
  title: string;
  type: 'pdf' | 'slide' | 'book' | 'code' | 'other';
  url: string;
  category?: string;
  notes?: string;
  createdAt: string;
}

export interface LinkItem {
  id: string;
  subjectId: string;
  title: string;
  url: string;
  category: 'sigaa' | 'classroom' | 'moodle' | 'drive' | 'github' | 'book' | 'professor' | 'other';
}

export interface Note {
  id: string;
  subjectId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface PomodoroSettings {
  focusDuration: number; // in minutes (default 25)
  shortBreakDuration: number; // in minutes (default 5)
  longBreakDuration: number; // in minutes (default 15)
  longBreakInterval: number; // e.g. every 4 pomodoros
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  soundEnabled: boolean;
  soundVolume: number;
}

export interface NotificationSettings {
  enabled: boolean;
  taskReminders: boolean;
  examReminders: boolean;
  pomodoroAlarms: boolean;
  hapticFeedback: boolean;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string; // "08:00"
}

export interface UserSettings {
  targetApprovalGrade: number; // default 7.0
  pomodoro: PomodoroSettings;
  notifications?: NotificationSettings;
  activeSemesterId: string;
}

// Calculated / Intelligence types
export interface HealthPoint {
  id: string;
  category: 'Avaliações' | 'Atividades' | 'Geral';
  type: 'positive' | 'warning' | 'critical';
  message: string;
  details?: string[]; // Lista explícita (ex: nomes das atividades ou assuntos)
  impact?: string;
  actionLabel?: string;
  actionRoute?: string;
}

export interface SemesterHealth {
  score: number; // 0 to 100
  status: 'excellent' | 'good' | 'warning' | 'critical';
  statusLabel: string;
  healthPoints: HealthPoint[];
  actionAdvice: string;
}

export interface SmartAlert {
  id: string;
  type: 'urgent_deadline' | 'upcoming_exam' | 'unstudied_topics' | 'low_study_time' | 'overloaded_week';
  severity: 'high' | 'medium' | 'info';
  title: string;
  message: string;
  subjectId?: string;
  subjectName?: string;
  subjectColor?: string;
  actionLabel?: string;
  actionRoute?: string;
  targetId?: string;
}

export interface DailyFocusItem {
  id: string;
  title: string;
  subtitle: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  priority: 'high' | 'medium' | 'low';
  estimatedMinutes: number;
  reason: string;
  type: 'task' | 'exam_prep' | 'topic_study';
  taskId?: string;
  topicId?: string;
  assessmentId?: string;
  dueDate?: string;
}
