import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isToday, isTomorrow, isYesterday, differenceInDays, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Priority, TaskStatus, TaskType, TopicStatus, MasteryLevel, Assessment } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string, formatStr: string = "dd 'de' MMM"): string {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return dateString;
    return format(date, formatStr, { locale: ptBR });
  } catch {
    return dateString;
  }
}

export function formatRelativeDate(dateString?: string): string {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return dateString;

    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    if (isYesterday(date)) return 'Ontem';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    const diff = differenceInDays(target, today);

    if (diff > 0 && diff <= 7) return `Em ${diff} dias (${format(date, 'EEE', { locale: ptBR })})`;
    if (diff < 0) return `Atrasado há ${Math.abs(diff)} dias`;

    return format(date, "dd 'de' MMM", { locale: ptBR });
  } catch {
    return dateString;
  }
}

export function formatMinutes(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return '0 min';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}

export function formatMinutesShort(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return '0h';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return minutes > 0 ? `${hours}h${minutes}m` : `${hours}h`;
}

export const taskTypeLabels: Record<TaskType, { label: string; icon: string }> = {
  exercise: { label: 'Lista de Exercícios', icon: 'FileText' },
  assignment: { label: 'Trabalho', icon: 'ClipboardList' },
  project: { label: 'Projeto', icon: 'FolderGit2' },
  reading: { label: 'Leitura', icon: 'BookOpen' },
  article: { label: 'Artigo', icon: 'Newspaper' },
  lab: { label: 'Atividade Prática', icon: 'FlaskConical' },
  presentation: { label: 'Apresentação / Seminário', icon: 'Presentation' },
  exam_prep: { label: 'Estudo para Prova', icon: 'GraduationCap' },
  group_work: { label: 'Trabalho em Grupo', icon: 'Users' },
};

export const taskStatusConfig: Record<TaskStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
  not_started: {
    label: 'Não iniciada',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    dot: 'bg-slate-400',
  },
  in_progress: {
    label: 'Em andamento',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  waiting: {
    label: 'Aguardando',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  completed: {
    label: 'Concluída',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-600',
  },
  overdue: {
    label: 'Atrasada',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-600',
  },
  cancelled: {
    label: 'Cancelada',
    bg: 'bg-zinc-100',
    text: 'text-zinc-500',
    border: 'border-zinc-200',
    dot: 'bg-zinc-400',
  },
};

export const priorityConfig: Record<Priority, { label: string; color: string; bg: string; text: string }> = {
  low: {
    label: 'Baixa',
    color: '#64748B',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
  },
  medium: {
    label: 'Média',
    color: '#D97706',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
  },
  high: {
    label: 'Alta',
    color: '#BE123C',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
  },
};

export const topicStatusConfig: Record<TopicStatus, { label: string; badge: string; icon: string }> = {
  not_studied: { label: 'Não estudado', badge: 'bg-slate-100 text-slate-600', icon: 'Circle' },
  in_study: { label: 'Em estudo', badge: 'bg-blue-100 text-blue-800', icon: 'CircleDot' },
  studied: { label: 'Estudado', badge: 'bg-emerald-100 text-emerald-800', icon: 'CheckCircle2' },
  review: { label: 'Revisar', badge: 'bg-amber-100 text-amber-800', icon: 'RotateCw' },
};

export const masteryConfig: Record<MasteryLevel, { label: string; percent: number; color: string }> = {
  beginner: { label: 'Iniciante', percent: 25, color: '#94A3B8' },
  intermediate: { label: 'Intermediário', percent: 50, color: '#38BDF8' },
  advanced: { label: 'Avançado', percent: 75, color: '#818CF8' },
  mastered: { label: 'Dominado', percent: 100, color: '#10B981' },
};

export function calculateSubjectGrade(assessments: Assessment[], targetApproval: number = 7.0) {
  let totalWeight = 0;
  let gradedWeight = 0;
  let weightedSum = 0;
  let remainingWeight = 0;

  assessments.forEach((ass) => {
    totalWeight += ass.weight;
    if (ass.grade !== null && ass.grade !== undefined) {
      gradedWeight += ass.weight;
      weightedSum += (ass.grade / ass.maxGrade) * 10 * ass.weight;
    } else {
      remainingWeight += ass.weight;
    }
  });

  const currentAverage = gradedWeight > 0 ? Number((weightedSum / gradedWeight).toFixed(2)) : 0;
  const currentAccumulated = Number((weightedSum / 100).toFixed(2));

  // Minimum grade needed on remaining assessments to achieve targetApproval
  let neededGradeOnRemaining: number | null = null;
  if (remainingWeight > 0) {
    const neededSum = (targetApproval * 100) - weightedSum;
    neededGradeOnRemaining = Number((neededSum / remainingWeight).toFixed(2));
    if (neededGradeOnRemaining < 0) neededGradeOnRemaining = 0;
  }

  let status: 'approved' | 'failed' | 'on_track' | 'attention' | 'risk' | 'not_started' = 'not_started';
  if (gradedWeight === 0) {
    status = 'not_started';
  } else if (remainingWeight === 0 && totalWeight > 0) {
    status = currentAverage >= targetApproval ? 'approved' : 'failed';
  } else if (neededGradeOnRemaining !== null && neededGradeOnRemaining <= 7.0) {
    status = 'on_track';
  } else if (neededGradeOnRemaining !== null && neededGradeOnRemaining <= 10.0) {
    status = 'attention';
  } else if (neededGradeOnRemaining !== null && neededGradeOnRemaining > 10.0) {
    status = 'risk';
  }

  return {
    currentAverage,
    currentAccumulated,
    gradedWeight,
    remainingWeight,
    totalWeight,
    neededGradeOnRemaining,
    status,
  };
}

export const SUBJECT_PRESET_COLORS = [
  '#1E293B', // Academic Slate
  '#2563EB', // Blue
  '#0D9488', // Teal
  '#7C3AED', // Violet
  '#D97706', // Amber
  '#BE123C', // Crimson
  '#059669', // Emerald
  '#4F46E5', // Indigo
];
