import { Semester, Subject, Task, Assessment, Topic, StudyGoal, StudySession, Material, LinkItem, Note, UserSettings } from '@/types';
import { format } from 'date-fns';

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth(); // 0-11
const currentSemesterName = `${currentYear}.${currentMonth >= 6 ? '2' : '1'}`;

export const initialSemester: Semester = {
  id: `sem-${currentYear}-${currentMonth >= 6 ? '2' : '1'}`,
  name: currentSemesterName,
  startDate: format(new Date(currentYear, currentMonth >= 6 ? 7 : 1, 1), 'yyyy-MM-dd'),
  endDate: format(new Date(currentYear, currentMonth >= 6 ? 11 : 5, 15), 'yyyy-MM-dd'),
  targetGrade: 7.0,
  currentWeek: 1,
  status: 'active',
};

// Initial state starts 100% clean with NO mocks
export const initialSubjects: Subject[] = [];
export const initialTopics: Topic[] = [];
export const initialTasks: Task[] = [];
export const initialAssessments: Assessment[] = [];
export const initialStudyGoals: StudyGoal[] = [];
export const initialStudySessions: StudySession[] = [];
export const initialMaterials: Material[] = [];
export const initialLinks: LinkItem[] = [];
export const initialNotes: Note[] = [];

export const initialSettings: UserSettings = {
  targetApprovalGrade: 7.0,
  activeSemesterId: initialSemester.id,
  pomodoro: {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartFocus: false,
    soundEnabled: true,
    soundVolume: 0.7,
  },
};

// Optional demo dataset for testing if the user explicitly requests in Settings
export const demoData = {
  semester: initialSemester,
  subjects: [
    {
      id: 'sub-ed',
      semesterId: initialSemester.id,
      name: 'Estrutura de Dados',
      code: 'DCC205',
      professor: 'Prof. Dr. Carlos Silveira',
      email: 'carlos.silveira@universidade.edu.br',
      schedule: 'Seg/Qua 10:00 - 12:00',
      room: 'Lab 03 • Prédio ICEx',
      color: '#1E293B',
      description: 'Estudo aprofundado de estruturas de dados lineares e não-lineares, complexidade assintótica e algoritmos fundamentais.',
      syllabus: 'Complexidade de algoritmos (Big-O), Vetores e Listas encadeadas, Pilhas, Filas, Árvores Binárias de Busca, Árvores AVL, Tabelas Hash e Grafos.',
      targetHoursWeekly: 6,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sub-calc',
      semesterId: initialSemester.id,
      name: 'Cálculo Diferencial e Integral II',
      code: 'MAT152',
      professor: 'Profa. Dra. Mariana Fontes',
      email: 'mariana.fontes@universidade.edu.br',
      schedule: 'Ter/Qui 08:00 - 10:00',
      room: 'Sala 204 • Prédio Principal',
      color: '#BE123C',
      description: 'Cálculo para funções de múltiplas variáveis, derivadas parciais, otimização e integrais múltiplas.',
      syllabus: 'Funções de várias variáveis, Limites e Continuidade, Derivadas Parciais, Vetor Gradiente, Máximos e Mínimos, Multiplicadores de Lagrange, Integrais Duplas e Triplas.',
      targetHoursWeekly: 8,
      createdAt: new Date().toISOString(),
    },
  ],
  tasks: [],
  assessments: [],
  topics: [],
  studyGoals: [],
  studySessions: [],
  materials: [],
  links: [],
  notes: [],
};
