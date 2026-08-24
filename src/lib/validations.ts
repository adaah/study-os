import { z } from 'zod';

export const semesterSchema = z.object({
  name: z.string().min(1, 'Nome do semestre é obrigatório (ex: 2026.2)'),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  endDate: z.string().min(1, 'Data de término é obrigatória'),
  targetGrade: z.number().min(0).max(10).default(7.0),
  status: z.enum(['active', 'archived', 'planned']).default('active'),
});

export const subjectSchema = z.object({
  name: z.string().min(2, 'Nome da disciplina deve ter pelo menos 2 caracteres'),
  code: z.string().min(1, 'Código é obrigatório (ex: DCC205)'),
  professor: z.string().min(1, 'Nome do professor é obrigatório'),
  email: z.string().email('E-mail inválido').or(z.literal('')),
  schedule: z.string().min(1, 'Horário é obrigatório (ex: Seg/Qua 10:00-12:00)'),
  room: z.string().default(''),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Cor hexadecimal inválida').default('#1E293B'),
  description: z.string().default(''),
  targetHoursWeekly: z.number().min(1, 'Carga mínima de 1 hora').default(4),
});

export const taskSchema = z.object({
  subjectId: z.string().min(1, 'Selecione uma disciplina'),
  title: z.string().min(2, 'Título deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  type: z.enum(['exercise', 'assignment', 'project', 'reading', 'article', 'lab', 'presentation', 'exam_prep', 'group_work']),
  status: z.enum(['not_started', 'in_progress', 'waiting', 'completed', 'overdue', 'cancelled']).default('not_started'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().min(1, 'Data de entrega é obrigatória'),
  dueTime: z.string().optional(),
  estimatedMinutes: z.number().min(5, 'Estimativa mínima de 5 minutos').default(60),
  weight: z.number().min(0).max(100).optional(),
  link: z.string().url('Link inválido').or(z.literal('')).optional(),
  notes: z.string().optional(),
});

export const assessmentSchema = z.object({
  subjectId: z.string().min(1, 'Selecione uma disciplina'),
  title: z.string().min(2, 'Título da avaliação é obrigatório (ex: P1)'),
  type: z.enum(['exam', 'seminar', 'assignment', 'presentation', 'project', 'lab', 'final_exam']),
  date: z.string().min(1, 'Data da avaliação é obrigatória'),
  time: z.string().optional(),
  weight: z.number().min(0).max(100, 'Peso não pode exceder 100%'),
  grade: z.number().min(0).max(10, 'Nota deve ser entre 0 e 10').nullable().optional(),
  maxGrade: z.number().min(1).default(10.0),
  description: z.string().optional(),
  notes: z.string().optional(),
  relatedTopicIds: z.array(z.string()).default([]),
});

export const topicSchema = z.object({
  subjectId: z.string().min(1, 'Selecione uma disciplina'),
  title: z.string().min(2, 'Título do tópico é obrigatório'),
  description: z.string().optional(),
  status: z.enum(['not_studied', 'in_study', 'studied', 'review']).default('not_studied'),
  mastery: z.enum(['beginner', 'intermediate', 'advanced', 'mastered']).default('beginner'),
  estimatedMinutes: z.number().min(0).default(60),
  notes: z.string().optional(),
});

export const studyGoalSchema = z.object({
  subjectId: z.string().min(1, 'Selecione uma disciplina'),
  topicId: z.string().optional(),
  title: z.string().min(2, 'Título do objetivo de estudo é obrigatório'),
  dueDate: z.string().optional(),
  estimatedMinutes: z.number().min(5).default(45),
});

export const materialSchema = z.object({
  subjectId: z.string().min(1, 'Selecione uma disciplina'),
  title: z.string().min(2, 'Título do material é obrigatório'),
  type: z.enum(['pdf', 'slide', 'book', 'code', 'other']),
  url: z.string().min(1, 'URL ou caminho do arquivo é obrigatório'),
  category: z.string().optional(),
  notes: z.string().optional(),
});

export const linkSchema = z.object({
  subjectId: z.string().min(1, 'Selecione uma disciplina'),
  title: z.string().min(2, 'Título do link é obrigatório'),
  url: z.string().url('URL inválida (inclua http:// ou https://)'),
  category: z.enum(['sigaa', 'classroom', 'moodle', 'drive', 'github', 'book', 'professor', 'other']),
});

export const noteSchema = z.object({
  subjectId: z.string().min(1, 'Selecione uma disciplina'),
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().default(''),
});
