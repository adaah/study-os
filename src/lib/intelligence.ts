import { 
  Subject, 
  Task, 
  Assessment, 
  Topic, 
  StudySession, 
  SemesterHealth, 
  SmartAlert, 
  DailyFocusItem,
  HealthPoint
} from '@/types';
import { differenceInDays, parseISO, isValid, isToday, isTomorrow, isPast } from 'date-fns';
import { calculateSubjectGrade } from '@/lib/utils';

export function calculateSemesterHealth(
  subjects: Subject[],
  tasks: Task[],
  assessments: Assessment[],
  topics: Topic[],
  sessions: StudySession[]
): SemesterHealth {
  let score = 95;
  const healthPoints: HealthPoint[] = [];

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // 1. Check Overdue Tasks
  const overdueTasks = tasks.filter((t) => {
    if (t.status === 'completed' || t.status === 'cancelled') return false;
    try {
      const due = parseISO(t.dueDate);
      return isValid(due) && isPast(due) && !isToday(due);
    } catch {
      return false;
    }
  });

  if (overdueTasks.length > 0) {
    score -= overdueTasks.length * 12;
    healthPoints.push({
      id: 'overdue-tasks',
      category: 'Atividades',
      type: 'critical',
      message: 'Atividades com prazo vencido',
      details: overdueTasks.map(t => t.title),
      impact: 'Risco de perda de nota',
      actionLabel: 'Ver Atividades',
      actionRoute: '/atividades'
    });
  } else {
    healthPoints.push({
      id: 'no-overdue',
      category: 'Geral',
      type: 'positive',
      message: 'Nenhuma atividade atrasada no momento',
    });
  }

  // 2. Check Upcoming Exams in next 7 days & their unstudied topics
  const upcomingExams = assessments.filter((a) => {
    if (a.grade !== null && a.grade !== undefined) return false;
    try {
      const d = parseISO(a.date);
      if (!isValid(d)) return false;
      const diff = differenceInDays(d, now);
      return diff >= 0 && diff <= 7;
    } catch {
      return false;
    }
  });

  upcomingExams.forEach((exam) => {
    const examTopics = topics.filter((t) => exam.relatedTopicIds.includes(t.id));
    const unstudied = examTopics.filter((t) => t.status === 'not_studied');
    if (unstudied.length > 0) {
      score -= unstudied.length * 5;
      const subj = subjects.find((s) => s.id === exam.subjectId);
      healthPoints.push({
        id: `exam-${exam.id}`,
        category: 'Avaliações',
        type: 'warning',
        message: `${exam.title} (${subj?.name || 'Disciplina'}): Assuntos pendentes`,
        details: unstudied.map(t => t.title),
        impact: 'Matéria acumulada para prova',
        actionLabel: 'Focar na Disciplina',
        actionRoute: `/disciplinas/${subj?.id}`
      });
    }
  });

  // 3. Completed Tasks Ratio
  const actionableTasks = tasks.filter((t) => t.status !== 'cancelled');
  const completedTasks = actionableTasks.filter((t) => t.status === 'completed');
  const completionRate = actionableTasks.length > 0 ? (completedTasks.length / actionableTasks.length) * 100 : 100;

  if (completionRate >= 50) {
    healthPoints.push({
      id: 'good-completion',
      category: 'Geral',
      type: 'positive',
      message: `Boa taxa de conclusão de entregas (${Math.round(completionRate)}%)`
    });
  } else if (actionableTasks.length > 5 && completionRate < 30) {
    score -= 10;
    healthPoints.push({
      id: 'low-completion',
      category: 'Geral',
      type: 'warning',
      message: `Sua taxa de conclusão de atividades está muito baixa (${Math.round(completionRate)}%)`,
      impact: 'Acúmulo de pendências',
      actionLabel: 'Ver Atividades',
      actionRoute: '/atividades'
    });
  }

  // 4. Study dedication distribution
  const totalMinutesStudied = sessions.reduce((acc, s) => acc + (s.actualMinutes || 0), 0);
  if (totalMinutesStudied >= 300) {
    healthPoints.push({
      id: 'consistent-study',
      category: 'Geral',
      type: 'positive',
      message: `Registro consistente de dedicação geral (${Math.round(totalMinutesStudied / 60)}h registradas no semestre)`
    });
  }
  
  // 5. Study time insights per subject and exams
  subjects.forEach(subj => {
    const subjSessions = sessions.filter(s => s.subjectId === subj.id);
    const subjMinutes = subjSessions.reduce((acc, s) => acc + (s.actualMinutes || 0), 0);
    
    // Low time for exams
    const hasUpcomingExam = upcomingExams.some(e => e.subjectId === subj.id);
    if (hasUpcomingExam && subjMinutes < 120) {
      score -= 5;
      healthPoints.push({
        id: `low-study-exam-${subj.id}`,
        category: 'Geral',
        type: 'critical',
        message: `Poucas horas de estudo para a prova de ${subj.name}`,
        impact: 'Risco de nota baixa',
        actionLabel: 'Focar na Disciplina',
        actionRoute: `/disciplinas/${subj.id}`
      });
    } else if (subjMinutes < 60 && tasks.some(t => t.subjectId === subj.id && t.status !== 'completed')) {
      // General low dedication when there are tasks
      score -= 3;
      healthPoints.push({
        id: `low-dedication-${subj.id}`,
        category: 'Geral',
        type: 'warning',
        message: `Pouco tempo dedicado à disciplina ${subj.name} (${Math.round(subjMinutes)} min)`,
        impact: 'Risco de acúmulo de matéria',
        actionLabel: 'Focar na Disciplina',
        actionRoute: `/disciplinas/${subj.id}`
      });
    }

    // 6. Grade Intelligence
    const subjAssessments = assessments.filter(a => a.subjectId === subj.id);
    const gradeInfo = calculateSubjectGrade(subjAssessments, 7.0);

    if (gradeInfo.status === 'approved') {
      score += 15;
      healthPoints.push({
        id: `approved-${subj.id}`,
        category: 'Avaliações',
        type: 'positive',
        message: `Aprovado em ${subj.name} com média ${gradeInfo.currentAverage}!`,
        actionLabel: 'Ver Notas',
        actionRoute: `/notas`
      });
    } else if (gradeInfo.gradedWeight > 0) {
      if (gradeInfo.currentAverage < 7.0) {
        score -= 15;
        healthPoints.push({
          id: `low-grade-${subj.id}`,
          category: 'Avaliações',
          type: 'critical',
          message: `Média abaixo da aprovação em ${subj.name} (${gradeInfo.currentAverage} / 7.0)`,
          impact: 'Risco de reprovação',
          actionLabel: 'Ver Detalhes',
          actionRoute: `/disciplinas/${subj.id}`
        });
      } else {
        score += 8;
        healthPoints.push({
          id: `good-grade-${subj.id}`,
          category: 'Avaliações',
          type: 'positive',
          message: `Média de notas satisfatória em ${subj.name} (${gradeInfo.currentAverage})`,
          actionLabel: 'Manter Foco',
          actionRoute: `/disciplinas/${subj.id}`
        });
      }
    }
  });

  // Bound score between 10 and 100
  score = Math.max(15, Math.min(100, score));

  let status: 'excellent' | 'good' | 'warning' | 'critical' = 'good';
  let statusLabel = 'Situação boa';
  let actionAdvice = 'O índice está saudável. Mantenha as entregas em dia.';

  if (score >= 85) {
    status = 'excellent';
    statusLabel = 'Excelente organização';
    actionAdvice = 'Excelente controle. Nenhuma ação corretiva é necessária no momento.';
  } else if (score >= 70) {
    status = 'good';
    statusLabel = 'Situação controlada';
    actionAdvice = 'Fique de olho nos prazos futuros para evitar surpresas.';
  } else if (score >= 50) {
    status = 'warning';
    statusLabel = 'Atenção necessária';
    actionAdvice = 'Recomendado liquidar as pendências atrasadas para recuperar o índice.';
  } else {
    status = 'critical';
    statusLabel = 'Situação crítica';
    actionAdvice = 'Dedique foco total agora para não comprometer a nota final das disciplinas em risco.';
  }

  return {
    score,
    status,
    statusLabel,
    healthPoints,
    actionAdvice,
  };
}

export function generateSmartAlerts(
  subjects: Subject[],
  tasks: Task[],
  assessments: Assessment[],
  topics: Topic[],
  sessions: StudySession[]
): SmartAlert[] {
  const alerts: SmartAlert[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // 1. Exams in <= 3 days
  assessments.forEach((exam) => {
    if (exam.grade !== null && exam.grade !== undefined) return;
    try {
      const examDate = parseISO(exam.date);
      if (!isValid(examDate)) return;
      const diff = differenceInDays(examDate, now);
      const subject = subjects.find((s) => s.id === exam.subjectId);

      if (diff >= 0 && diff <= 3) {
        const examTopics = topics.filter((t) => exam.relatedTopicIds.includes(t.id));
        const unstudied = examTopics.filter((t) => t.status === 'not_studied' || t.status === 'in_study');

        if (unstudied.length > 0) {
          alerts.push({
            id: `alert-exam-urgent-${exam.id}`,
            type: 'upcoming_exam',
            severity: 'high',
            title: `Prova em ${diff === 0 ? 'HOJE' : diff === 1 ? '1 dia' : `${diff} dias`} — ${subject?.name || 'Disciplina'}`,
            message: `A avaliação "${exam.title}" está muito próxima e você possui ${unstudied.length} ${unstudied.length === 1 ? 'assunto pendente de estudo' : 'assuntos pendentes de estudo'}.`,
            subjectId: subject?.id,
            subjectName: subject?.name,
            subjectColor: subject?.color,
            actionLabel: 'Iniciar Estudo',
            actionRoute: '/foco',
            targetId: exam.id,
          });
        } else {
          alerts.push({
            id: `alert-exam-review-${exam.id}`,
            type: 'upcoming_exam',
            severity: 'medium',
            title: `Avaliação em ${diff === 0 ? 'HOJE' : `${diff} dias`} — ${subject?.name}`,
            message: `"${exam.title}" acontecerá em breve. Recomenda-se realizar uma revisão geral dos conteúdos.`,
            subjectId: subject?.id,
            subjectName: subject?.name,
            subjectColor: subject?.color,
            actionLabel: 'Revisar Conteúdos',
            actionRoute: `/disciplinas/${subject?.id}`,
            targetId: exam.id,
          });
        }
      }
    } catch {
      // ignore
    }
  });

  // 2. Overdue or Urgent tasks (Due Today)
  tasks.forEach((task) => {
    if (task.status === 'completed' || task.status === 'cancelled') return;
    try {
      const dueDate = parseISO(task.dueDate);
      if (isValid(dueDate)) {
        const subject = subjects.find((s) => s.id === task.subjectId);

        if (isPast(dueDate) && !isToday(dueDate)) {
          // Atrasada
          const diff = Math.abs(differenceInDays(dueDate, now));
          alerts.push({
            id: `alert-task-overdue-${task.id}`,
            type: 'urgent_deadline',
            severity: 'high',
            title: `Atividade Atrasada: ${task.title}`,
            message: `Prazo venceu há ${diff} ${diff === 1 ? 'dia' : 'dias'} (${subject?.name}). Finalize para evitar perda de nota.`,
            subjectId: subject?.id,
            subjectName: subject?.name,
            subjectColor: subject?.color,
            actionLabel: 'Ver Atividade',
            actionRoute: '/atividades',
            targetId: task.id,
          });
        } else if (isToday(dueDate)) {
          // Vence hoje (poucas horas)
          alerts.push({
            id: `alert-task-today-${task.id}`,
            type: 'urgent_deadline',
            severity: 'high',
            title: `Vence Hoje: ${task.title}`,
            message: `O prazo desta atividade de ${subject?.name || 'sua disciplina'} se encerra em poucas horas.`,
            subjectId: subject?.id,
            subjectName: subject?.name,
            subjectColor: subject?.color,
            actionLabel: 'Ver Atividade',
            actionRoute: '/atividades',
            targetId: task.id,
          });
        }
      }
    } catch {
      // ignore
    }
  });

  // 3. Subject with low dedication and active upcoming deliverables
  subjects.forEach((subj) => {
    const subjSessions = sessions.filter((s) => s.subjectId === subj.id);
    const totalMin = subjSessions.reduce((sum, s) => sum + (s.actualMinutes || 0), 0);
    const hasPendingTasks = tasks.some((t) => t.subjectId === subj.id && t.status !== 'completed' && t.priority === 'high');

    if (totalMin < 60 && hasPendingTasks) {
      alerts.push({
        id: `alert-low-dedication-${subj.id}`,
        type: 'low_study_time',
        severity: 'medium',
        title: `Pouco tempo dedicado em ${subj.name}`,
        message: `Você dedicou apenas ${totalMin} min a esta disciplina, mas possui tarefas de alta prioridade cadastradas.`,
        subjectId: subj.id,
        subjectName: subj.name,
        subjectColor: subj.color,
        actionLabel: 'Focar na Disciplina',
        actionRoute: '/foco',
        targetId: subj.id,
      });
    }
  });

  return alerts.slice(0, 5); // Return top 5 most relevant alerts
}

export function generateDailyFocus(
  subjects: Subject[],
  tasks: Task[],
  assessments: Assessment[],
  topics: Topic[]
): DailyFocusItem[] {
  const items: DailyFocusItem[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // 1. High priority or imminent exams
  assessments.forEach((exam) => {
    if (exam.grade !== null && exam.grade !== undefined) return;
    try {
      const d = parseISO(exam.date);
      if (!isValid(d)) return;
      const diff = differenceInDays(d, now);
      const subject = subjects.find((s) => s.id === exam.subjectId);
      if (!subject) return;

      if (diff >= 0 && diff <= 4) {
        items.push({
          id: `focus-exam-${exam.id}`,
          title: `Estudar para ${exam.title}`,
          subtitle: subject.name,
          subjectId: subject.id,
          subjectName: subject.name,
          subjectColor: subject.color,
          priority: 'high',
          estimatedMinutes: 90,
          reason: diff === 0 ? 'Prova HOJE!' : diff === 1 ? 'Prova AMANHÃ! (Peso ' + exam.weight + '%)' : `Prova em ${diff} dias (Peso ${exam.weight}%)`,
          type: 'exam_prep',
          assessmentId: exam.id,
          dueDate: exam.date,
        });
      }
    } catch {
      // ignore
    }
  });

  // 2. Urgent and In-progress Tasks
  const pendingTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled');

  // Sort by urgency
  pendingTasks.sort((a, b) => {
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (b.priority === 'high' && a.priority !== 'high') return 1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  pendingTasks.forEach((task) => {
    const subject = subjects.find((s) => s.id === task.subjectId);
    if (!subject) return;

    let reason = 'Entrega do semestre';
    let priority: 'high' | 'medium' | 'low' = task.priority;

    try {
      const due = parseISO(task.dueDate);
      if (isValid(due)) {
        if (isPast(due) && !isToday(due)) {
          reason = 'Atividade Atrasada!';
          priority = 'high';
        } else if (isToday(due)) {
          reason = 'Vence HOJE!';
          priority = 'high';
        } else if (isTomorrow(due)) {
          reason = 'Prazo amanhã';
        } else {
          const diff = differenceInDays(due, now);
          reason = `Prazo em ${diff} dias`;
        }
      }
    } catch {
      // ignore
    }

    items.push({
      id: `focus-task-${task.id}`,
      title: task.title,
      subtitle: `${subject.name} • ${task.checklist.length > 0 ? `${task.checklist.filter(c => c.completed).length}/${task.checklist.length} itens` : 'Tarefa individual'}`,
      subjectId: subject.id,
      subjectName: subject.name,
      subjectColor: subject.color,
      priority,
      estimatedMinutes: task.estimatedMinutes || 45,
      reason,
      type: 'task',
      taskId: task.id,
      dueDate: task.dueDate,
    });
  });

  // 3. Topics that are in_study or need review
  const activeTopics = topics.filter((t) => t.status === 'in_study' || t.status === 'review');
  activeTopics.forEach((topic) => {
    const subject = subjects.find((s) => s.id === topic.subjectId);
    if (!subject) return;

    items.push({
      id: `focus-topic-${topic.id}`,
      title: `Avançar no assunto: ${topic.title}`,
      subtitle: `${subject.name} • Status: ${topic.status === 'in_study' ? 'Em estudo' : 'Revisão'}`,
      subjectId: subject.id,
      subjectName: subject.name,
      subjectColor: subject.color,
      priority: 'medium',
      estimatedMinutes: 45,
      reason: 'Progresso da ementa',
      type: 'topic_study',
      topicId: topic.id,
    });
  });

  return items.slice(0, 6); // Top 6 recommended items
}
