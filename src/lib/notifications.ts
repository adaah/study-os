import { Capacitor } from '@capacitor/core';
import { LocalNotifications, Channel } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Task, Assessment, Subject, NotificationSettings } from '@/types';
import { parseISO, subDays, setHours, setMinutes, isAfter, isBefore, format } from 'date-fns';

// Channels IDs
export const NOTIFICATION_CHANNELS = {
  POMODORO: 'studyos_pomodoro_channel',
  DEADLINES: 'studyos_deadlines_channel',
  DAILY: 'studyos_daily_channel',
};

// Reserved ID ranges to avoid collision
const ID_OFFSET = {
  POMODORO: 1000,
  TASK_BASE: 20000,
  EXAM_BASE: 40000,
  DAILY: 9999,
  TEST: 8888,
};

/**
 * Generate numeric ID from string ID
 */
function hashStringToInt(str: string, max = 10000): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash % max);
}

/**
 * Check if running natively on Android or iOS
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Initialize native device capabilities (Channels, Status Bar)
 */
export async function initializeNativeFeatures(): Promise<void> {
  if (!isNativePlatform()) return;

  try {
    // 1. Configure Status Bar
    await StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    await StatusBar.setBackgroundColor({ color: '#0F172A' }).catch(() => {});

    // 2. Create Notification Channels (Android 8.0+)
    const pomodoroChannel: Channel = {
      id: NOTIFICATION_CHANNELS.POMODORO,
      name: 'Pomodoro & Foco',
      description: 'Alarmes e alertas de conclusão de ciclos de foco e pausas',
      importance: 5, // High / Heads-up
      visibility: 1, // Public
      sound: 'beep.wav',
      vibration: true,
    };

    const deadlinesChannel: Channel = {
      id: NOTIFICATION_CHANNELS.DEADLINES,
      name: 'Prazos & Provas',
      description: 'Lembretes de entregas de trabalhos, tarefas e datas de avaliações',
      importance: 4, // High
      visibility: 1,
      vibration: true,
    };

    const dailyChannel: Channel = {
      id: NOTIFICATION_CHANNELS.DAILY,
      name: 'Lembrete Diário de Estudos',
      description: 'Notificação matinal para organizar o dia acadêmico',
      importance: 3, // Default
      visibility: 1,
    };

    await LocalNotifications.createChannel(pomodoroChannel).catch(() => {});
    await LocalNotifications.createChannel(deadlinesChannel).catch(() => {});
    await LocalNotifications.createChannel(dailyChannel).catch(() => {});
  } catch (err) {
    console.warn('[Notifications] Erro ao inicializar recursos nativos:', err);
  }
}

/**
 * Check notification permissions status
 */
export async function checkNotificationPermission(): Promise<'granted' | 'denied' | 'prompt' | 'prompt-with-rationale'> {
  if (!isNativePlatform()) {
    if (!('Notification' in window)) return 'denied';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    return 'prompt';
  }

  try {
    const status = await LocalNotifications.checkPermissions();
    return status.display;
  } catch {
    return 'prompt';
  }
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNativePlatform()) {
    if (!('Notification' in window)) return false;
    const res = await Notification.requestPermission();
    return res === 'granted';
  }

  try {
    const status = await LocalNotifications.requestPermissions();
    return status.display === 'granted';
  } catch (err) {
    console.error('[Notifications] Erro ao solicitar permissão:', err);
    return false;
  }
}

/**
 * Trigger vibration haptic feedback
 */
export async function triggerHapticFeedback(type: 'success' | 'warning' | 'error' | 'click' = 'click'): Promise<void> {
  try {
    if (isNativePlatform()) {
      if (type === 'click') {
        await Haptics.impact({ style: ImpactStyle.Light });
      } else if (type === 'success') {
        await Haptics.notification({ type: NotificationType.Success });
      } else if (type === 'warning') {
        await Haptics.notification({ type: NotificationType.Warning });
      } else if (type === 'error') {
        await Haptics.notification({ type: NotificationType.Error });
      }
    } else if (navigator.vibrate) {
      if (type === 'click') navigator.vibrate(20);
      else if (type === 'success') navigator.vibrate([40, 60, 80]);
      else if (type === 'warning' || type === 'error') navigator.vibrate([80, 50, 80]);
    }
  } catch {
    // Ignore haptic errors on unsupported devices
  }
}

/**
 * Send an immediate test notification
 */
export async function sendTestNotification(): Promise<boolean> {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return false;

  await triggerHapticFeedback('success');

  if (isNativePlatform()) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: ID_OFFSET.TEST,
            title: 'StudyOS — Notificações Ativas! 🎓',
            body: 'As notificações nativas do StudyOS estão funcionando perfeitamente no seu dispositivo.',
            channelId: NOTIFICATION_CHANNELS.DEADLINES,
            schedule: { at: new Date(Date.now() + 1000) }, // 1 second in future
            sound: 'beep.wav',
            extra: { type: 'test' },
          },
        ],
      });
      return true;
    } catch (err) {
      console.error('[Notifications] Falha no teste nativo:', err);
      return false;
    }
  } else if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('StudyOS — Notificações Ativas! 🎓', {
      body: 'As notificações do StudyOS estão funcionando perfeitamente no seu navegador.',
      icon: '/favicon.svg',
    });
    return true;
  }

  return false;
}

/**
 * Schedule a Pomodoro timer alarm
 */
export async function schedulePomodoroNotification(
  durationSeconds: number,
  mode: 'focus' | 'short_break' | 'long_break',
  subjectName?: string
): Promise<void> {
  if (!isNativePlatform()) return;

  try {
    // Cancel any previous pomodoro notification first
    await cancelPomodoroNotification();

    const targetDate = new Date(Date.now() + durationSeconds * 1000);
    const title = mode === 'focus' 
      ? '⏰ Ciclo de Foco Concluído!' 
      : '☕ Pausa Finalizada!';
    
    const body = mode === 'focus'
      ? subjectName ? `Excelente trabalho em "${subjectName}"! Hora de fazer uma pausa.` : 'Excelente trabalho! Hora de fazer uma pausa para descanso.'
      : 'Hora de retomar os estudos com foco total!';

    await LocalNotifications.schedule({
      notifications: [
        {
          id: ID_OFFSET.POMODORO,
          title,
          body,
          channelId: NOTIFICATION_CHANNELS.POMODORO,
          schedule: { at: targetDate, allowWhileIdle: true },
          sound: 'beep.wav',
          extra: { type: 'pomodoro', mode },
        },
      ],
    });
  } catch (err) {
    console.warn('[Notifications] Falha ao agendar Pomodoro:', err);
  }
}

/**
 * Cancel the active Pomodoro alarm
 */
export async function cancelPomodoroNotification(): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    await LocalNotifications.cancel({
      notifications: [{ id: ID_OFFSET.POMODORO }],
    });
  } catch {
    // ignore
  }
}

/**
 * Sync all deadline and exam notifications according to current user tasks, assessments, and preferences
 */
export async function syncAllNotifications(
  tasks: Task[],
  assessments: Assessment[],
  subjects: Subject[],
  settings?: NotificationSettings
): Promise<void> {
  if (!isNativePlatform()) return;
  if (settings && !settings.enabled) {
    // Clear all pending notifications
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }
    } catch {}
    return;
  }

  const subjectMap = new Map<string, string>();
  subjects.forEach((s) => subjectMap.set(s.id, s.name));

  const now = new Date();
  const notificationsToSchedule = [];

  // 1. Task Reminders (1 day before at 09:00, or on due date at 08:00)
  if (settings?.taskReminders !== false) {
    for (const task of tasks) {
      if (task.status === 'completed' || task.status === 'cancelled') continue;
      if (!task.dueDate) continue;

      try {
        const dueDate = parseISO(task.dueDate);
        const subName = subjectMap.get(task.subjectId) || 'Disciplina';

        // Reminder 1 day before at 09:00 AM
        const dayBefore = setMinutes(setHours(subDays(dueDate, 1), 9), 0);
        if (isAfter(dayBefore, now)) {
          const id = ID_OFFSET.TASK_BASE + hashStringToInt(`${task.id}_day_before`);
          notificationsToSchedule.push({
            id,
            title: `📌 Entrega Amanhã: ${task.title}`,
            body: `${subName} • Prazo de entrega previsto para amanhã (${format(dueDate, 'dd/MM')}).`,
            channelId: NOTIFICATION_CHANNELS.DEADLINES,
            schedule: { at: dayBefore, allowWhileIdle: true },
            sound: 'beep.wav',
            extra: { taskId: task.id, type: 'task_reminder' },
          });
        }

        // Reminder on Due Day at 08:00 AM
        const dueDayMorning = setMinutes(setHours(dueDate, 8), 0);
        if (isAfter(dueDayMorning, now)) {
          const id = ID_OFFSET.TASK_BASE + hashStringToInt(`${task.id}_due_day`);
          notificationsToSchedule.push({
            id,
            title: `🚨 Prazo Hoje: ${task.title}`,
            body: `${subName} • Esta tarefa vence hoje! Não se esqueça de concluir e enviar.`,
            channelId: NOTIFICATION_CHANNELS.DEADLINES,
            schedule: { at: dueDayMorning, allowWhileIdle: true },
            sound: 'beep.wav',
            extra: { taskId: task.id, type: 'task_due_day' },
          });
        }
      } catch (e) {
        // Skip invalid date
      }
    }
  }

  // 2. Exam / Assessment Reminders (2 days before at 10:00 and 1 day before at 10:00)
  if (settings?.examReminders !== false) {
    for (const exam of assessments) {
      if (exam.grade !== undefined && exam.grade !== null) continue; // Already graded
      if (!exam.date) continue;

      try {
        const examDate = parseISO(exam.date);
        const subName = subjectMap.get(exam.subjectId) || 'Disciplina';

        // 2 days before
        const twoDaysBefore = setMinutes(setHours(subDays(examDate, 2), 10), 0);
        if (isAfter(twoDaysBefore, now)) {
          const id = ID_OFFSET.EXAM_BASE + hashStringToInt(`${exam.id}_2days`);
          notificationsToSchedule.push({
            id,
            title: `🎯 Prova em 2 dias: ${exam.title}`,
            body: `${subName} • Hora de revisar os tópicos principais e resolver exercícios!`,
            channelId: NOTIFICATION_CHANNELS.DEADLINES,
            schedule: { at: twoDaysBefore, allowWhileIdle: true },
            sound: 'beep.wav',
            extra: { examId: exam.id, type: 'exam_2days' },
          });
        }

        // 1 day before
        const oneDayBefore = setMinutes(setHours(subDays(examDate, 1), 10), 0);
        if (isAfter(oneDayBefore, now)) {
          const id = ID_OFFSET.EXAM_BASE + hashStringToInt(`${exam.id}_1day`);
          notificationsToSchedule.push({
            id,
            title: `⚡ Prova Amanhã: ${exam.title}`,
            body: `${subName} • Revise seus resumos, confira o local e tenha uma boa noite de sono.`,
            channelId: NOTIFICATION_CHANNELS.DEADLINES,
            schedule: { at: oneDayBefore, allowWhileIdle: true },
            sound: 'beep.wav',
            extra: { examId: exam.id, type: 'exam_1day' },
          });
        }
      } catch (e) {
        // Skip invalid date
      }
    }
  }

  try {
    // Clear old task/exam notifications (keep pomodoro if any)
    const pending = await LocalNotifications.getPending();
    const toCancel = pending.notifications.filter(
      (n) => n.id >= ID_OFFSET.TASK_BASE && n.id < ID_OFFSET.TEST
    );
    if (toCancel.length > 0) {
      await LocalNotifications.cancel({ notifications: toCancel });
    }

    // Schedule new upcoming notifications (limit batch to avoid OS limits)
    if (notificationsToSchedule.length > 0) {
      // Schedule in chunks of 20
      const batch = notificationsToSchedule.slice(0, 40);
      await LocalNotifications.schedule({ notifications: batch });
    }
  } catch (err) {
    console.warn('[Notifications] Erro ao sincronizar notificações:', err);
  }
}
